import os
import sqlite3
# pyrefly: ignore [missing-import]
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
DB = os.environ.get('DATABASE', '/app/data/events.db')


def conn():
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    return con


def init_db():
    con = conn()
    con.executescript('''
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        interests TEXT,
        role TEXT DEFAULT 'student'
      );
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY,
        title TEXT,
        category TEXT,
        date TEXT,
        time TEXT,
        venue TEXT,
        deadline TEXT,
        description TEXT,
        seats INTEGER,
        image TEXT
      );
      CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        event_id INTEGER,
        status TEXT DEFAULT 'Confirmed',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, event_id)
      );
    ''')
    if con.execute('SELECT COUNT(*) FROM events').fetchone()[0] == 0:
        events = [
            ('Design Sprint 2026', 'Workshop', '2026-10-03', '10:00 AM', 'Innovation Lab', '2026-09-28', 'A hands-on one-day sprint for students who enjoy problem solving and visual thinking.', 45, 'design'),
            ('CodeCraft Hackathon', 'Technical', '2026-10-11', '09:00 AM', 'C Block Auditorium', '2026-10-05', 'Build something useful with a team. Mentors, snacks and a lot of curiosity included.', 120, 'code'),
            ('Campus Voices', 'Cultural', '2026-10-16', '05:30 PM', 'Open Air Theatre', '2026-10-12', 'An evening of music, spoken word and student performances from across campus.', 200, 'culture'),
            ('Career Conversations', 'Placement', '2026-10-22', '02:00 PM', 'Seminar Hall 2', '2026-10-18', 'Meet alumni and recruiters for candid conversations about first jobs and internships.', 80, 'career'),
            ('Data Storytelling', 'Seminar', '2026-10-27', '11:00 AM', 'Library Conference Room', '2026-10-22', 'How to make data clear, honest and compelling. Open to every department.', 60, 'data')
        ]
        con.executemany(
            'INSERT INTO events (title,category,date,time,venue,deadline,description,seats,image) VALUES (?,?,?,?,?,?,?,?,?)',
            events
        )
        con.execute(
            "INSERT INTO users (name,email,password,interests,role) VALUES ('Aarav Mehta','aarav@campus.edu','demo123','Technical, Design, Data','student')"
        )
        con.execute(
            "INSERT INTO users (name,email,password,interests,role) VALUES ('Event Office','admin@campus.edu','admin123','', 'admin')"
        )
    con.commit()
    con.close()


def event_dict(row, user_id=None):
    d = dict(row)
    con = conn()
    d['registered'] = con.execute(
        'SELECT COUNT(*) FROM registrations WHERE event_id=?', (d['id'],)
    ).fetchone()[0]
    d['is_registered'] = bool(
        user_id and con.execute(
            'SELECT 1 FROM registrations WHERE event_id=? AND user_id=?',
            (d['id'], user_id)
        ).fetchone()
    )
    con.close()
    return d


@app.get('/api/events')
def events():
    uid = request.args.get('user_id', type=int)
    con = conn()
    rows = con.execute('SELECT * FROM events ORDER BY date').fetchall()
    con.close()
    return jsonify([event_dict(r, uid) for r in rows])


@app.post('/api/login')
def login():
    data = request.json
    con = conn()
    user = con.execute(
        'SELECT id,name,email,interests,role FROM users WHERE email=? AND password=?',
        (data.get('email', ''), data.get('password', ''))
    ).fetchone()
    con.close()
    if not user:
        return jsonify({'error': 'Email or password is incorrect.'}), 401
    return jsonify(dict(user))


@app.post('/api/register-user')
def register_user():
    data = request.json
    try:
        con = conn()
        cur = con.execute(
            'INSERT INTO users (name,email,password,interests) VALUES (?,?,?,?)',
            (data['name'], data['email'], data['password'], data.get('interests', ''))
        )
        con.commit()
        user = con.execute(
            'SELECT id,name,email,interests,role FROM users WHERE id=?',
            (cur.lastrowid,)
        ).fetchone()
        con.close()
        return jsonify(dict(user)), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'This email is already registered.'}), 409


@app.post('/api/events/<int:event_id>/register')
def register_event(event_id):
    uid = request.json.get('user_id')
    try:
        con = conn()
        con.execute(
            'INSERT INTO registrations (user_id,event_id) VALUES (?,?)',
            (uid, event_id)
        )
        con.commit()
        con.close()
        return jsonify({'message': 'Your place is confirmed.'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'You have already registered.'}), 409


@app.get('/api/recommendations/<int:user_id>')
def recommendations(user_id):
    con = conn()
    user = con.execute(
        'SELECT interests FROM users WHERE id=?', (user_id,)
    ).fetchone()
    rows = con.execute('SELECT * FROM events ORDER BY date').fetchall()
    con.close()
    interests = (user['interests'] or '').lower() if user else ''
    scored = sorted(
        rows,
        key=lambda r: (
            r['category'].lower() in interests or any(
                x in r['title'].lower() for x in interests.split(',')
            )
        ),
        reverse=True
    )
    return jsonify([event_dict(r, user_id) for r in scored[:3]])


@app.post('/api/events')
def create_event():
    d = request.json
    con = conn()
    cur = con.execute(
        'INSERT INTO events (title,category,date,time,venue,deadline,description,seats,image) VALUES (?,?,?,?,?,?,?,?,?)',
        (
            d['title'],
            d['category'],
            d['date'],
            d['time'],
            d['venue'],
            d['deadline'],
            d['description'],
            d['seats'],
            d.get('image', 'general')
        )
    )
    con.commit()
    row = con.execute('SELECT * FROM events WHERE id=?', (cur.lastrowid,)).fetchone()
    con.close()
    return jsonify(event_dict(row)), 201


@app.get('/api/admin/stats')
def stats():
    con = conn()
    event_count = con.execute('SELECT COUNT(*) FROM events').fetchone()[0]
    registrations = con.execute('SELECT COUNT(*) FROM registrations').fetchone()[0]
    students = con.execute("SELECT COUNT(*) FROM users WHERE role='student'").fetchone()[0]
    con.close()
    return jsonify({
        'events': event_count,
        'registrations': registrations,
        'students': students
    })


@app.get('/api/registrations/<int:user_id>')
def registrations(user_id):
    con = conn()
    rows = con.execute(
        'SELECT e.*, r.status, r.created_at FROM registrations r JOIN events e ON e.id=r.event_id WHERE r.user_id=? ORDER BY e.date',
        (user_id,)
    ).fetchall()
    con.close()
    return jsonify([dict(r) for r in rows])


if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)
