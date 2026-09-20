import os
 
import psycopg2
import psycopg2.extras
from flask import Flask, jsonify, request
from flask_cors import CORS
 
app = Flask(__name__)
CORS(app)
 
DATABASE_URL = os.environ["DATABASE_URL"]
 
 
def conn():
    con = psycopg2.connect(DATABASE_URL, cursor_factory=psycopg2.extras.RealDictCursor)
    return con
 
 
def init_db():
    con = conn()
    cur = con.cursor()
    cur.execute('''
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        interests TEXT,
        role TEXT DEFAULT 'student'
      );
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
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
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        event_id INTEGER,
        status TEXT DEFAULT 'Confirmed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, event_id)
      );
    ''')
    con.commit()
 
    cur.execute('SELECT COUNT(*) AS c FROM events')
    if cur.fetchone()['c'] == 0:
        events = [
            ('Design Sprint 2026', 'Workshop', '2026-10-03', '10:00 AM', 'Innovation Lab', '2026-09-28', 'A hands-on one-day sprint for students who enjoy problem solving and visual thinking.', 45, 'design'),
            ('CodeCraft Hackathon', 'Technical', '2026-10-11', '09:00 AM', 'C Block Auditorium', '2026-10-05', 'Build something useful with a team. Mentors, snacks and a lot of curiosity included.', 120, 'code'),
            ('Campus Voices', 'Cultural', '2026-10-16', '05:30 PM', 'Open Air Theatre', '2026-10-12', 'An evening of music, spoken word and student performances from across campus.', 200, 'culture'),
            ('Career Conversations', 'Placement', '2026-10-22', '02:00 PM', 'Seminar Hall 2', '2026-10-18', 'Meet alumni and recruiters for candid conversations about first jobs and internships.', 80, 'career'),
            ('Data Storytelling', 'Seminar', '2026-10-27', '11:00 AM', 'Library Conference Room', '2026-10-22', 'How to make data clear, honest and compelling. Open to every department.', 60, 'data'),
        ]
        cur.executemany(
            'INSERT INTO events (title,category,date,time,venue,deadline,description,seats,image) '
            'VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)',
            events,
        )
        cur.execute(
            "INSERT INTO users (name,email,password,interests,role) VALUES "
            "('Aarav Mehta','aarav@campus.edu','demo123','Technical, Design, Data','student')"
        )
        cur.execute(
            "INSERT INTO users (name,email,password,interests,role) VALUES "
            "('Event Office','admin@campus.edu','admin123','', 'admin')"
        )
        con.commit()
 
    cur.close()
    con.close()
 
 
# Runs once per cold start, at import time - not only when this file is run
# directly. Vercel imports this module as a WSGI app and never hits
# `if __name__ == "__main__"`, so this has to live here to actually run.
init_db()
 
 
def event_dict(row, user_id=None):
    d = dict(row)
    con = conn()
    cur = con.cursor()
    cur.execute('SELECT COUNT(*) AS c FROM registrations WHERE event_id=%s', (d['id'],))
    d['registered'] = cur.fetchone()['c']
    if user_id:
        cur.execute(
            'SELECT 1 FROM registrations WHERE event_id=%s AND user_id=%s',
            (d['id'], user_id),
        )
        d['is_registered'] = cur.fetchone() is not None
    else:
        d['is_registered'] = False
    cur.close()
    con.close()
    return d
 
 
@app.get('/api/events')
def events():
    uid = request.args.get('user_id', type=int)
    con = conn()
    cur = con.cursor()
    cur.execute('SELECT * FROM events ORDER BY date')
    rows = cur.fetchall()
    cur.close()
    con.close()
    return jsonify([event_dict(r, uid) for r in rows])
 
 
@app.post('/api/login')
def login():
    data = request.json
    con = conn()
    cur = con.cursor()
    cur.execute(
        'SELECT id,name,email,interests,role FROM users WHERE email=%s AND password=%s',
        (data.get('email', ''), data.get('password', '')),
    )
    user = cur.fetchone()
    cur.close()
    con.close()
    if not user:
        return jsonify({'error': 'Email or password is incorrect.'}), 401
    return jsonify(dict(user))
 
 
@app.post('/api/register-user')
def register_user():
    data = request.json
    con = conn()
    cur = con.cursor()
    try:
        cur.execute(
            'INSERT INTO users (name,email,password,interests) VALUES (%s,%s,%s,%s) RETURNING id',
            (data['name'], data['email'], data['password'], data.get('interests', '')),
        )
        new_id = cur.fetchone()['id']
        con.commit()
        cur.execute(
            'SELECT id,name,email,interests,role FROM users WHERE id=%s', (new_id,)
        )
        user = cur.fetchone()
        return jsonify(dict(user)), 201
    except psycopg2.errors.UniqueViolation:
        con.rollback()
        return jsonify({'error': 'This email is already registered.'}), 409
    finally:
        cur.close()
        con.close()
 
 
@app.post('/api/events/<int:event_id>/register')
def register_event(event_id):
    uid = request.json.get('user_id')
    con = conn()
    cur = con.cursor()
    try:
        cur.execute(
            'INSERT INTO registrations (user_id,event_id) VALUES (%s,%s)', (uid, event_id)
        )
        con.commit()
        return jsonify({'message': 'Your place is confirmed.'}), 201
    except psycopg2.errors.UniqueViolation:
        con.rollback()
        return jsonify({'error': 'You have already registered.'}), 409
    finally:
        cur.close()
        con.close()
 
 
@app.get('/api/recommendations/<int:user_id>')
def recommendations(user_id):
    con = conn()
    cur = con.cursor()
    cur.execute('SELECT interests FROM users WHERE id=%s', (user_id,))
    user = cur.fetchone()
    cur.execute('SELECT * FROM events ORDER BY date')
    rows = cur.fetchall()
    cur.close()
    con.close()
 
    interests = (user['interests'] or '').lower() if user else ''
    scored = sorted(
        rows,
        key=lambda r: (
            r['category'].lower() in interests
            or any(x in r['title'].lower() for x in interests.split(','))
        ),
        reverse=True,
    )
    return jsonify([event_dict(r, user_id) for r in scored[:3]])
 
 
@app.post('/api/events')
def create_event():
    d = request.json
    con = conn()
    cur = con.cursor()
    cur.execute(
        'INSERT INTO events (title,category,date,time,venue,deadline,description,seats,image) '
        'VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id',
        (
            d['title'], d['category'], d['date'], d['time'], d['venue'],
            d['deadline'], d['description'], d['seats'], d.get('image', 'general'),
        ),
    )
    new_id = cur.fetchone()['id']
    con.commit()
    cur.execute('SELECT * FROM events WHERE id=%s', (new_id,))
    row = cur.fetchone()
    cur.close()
    con.close()
    return jsonify(event_dict(row)), 201
 
 
@app.get('/api/admin/stats')
def stats():
    con = conn()
    cur = con.cursor()
    cur.execute('SELECT COUNT(*) AS c FROM events')
    event_count = cur.fetchone()['c']
    cur.execute('SELECT COUNT(*) AS c FROM registrations')
    registration_count = cur.fetchone()['c']
    cur.execute("SELECT COUNT(*) AS c FROM users WHERE role='student'")
    student_count = cur.fetchone()['c']
    cur.close()
    con.close()
    return jsonify({
        'events': event_count,
        'registrations': registration_count,
        'students': student_count,
    })
 
 
@app.get('/api/registrations/<int:user_id>')
def registrations(user_id):
    con = conn()
    cur = con.cursor()
    cur.execute(
        'SELECT e.*, r.status, r.created_at FROM registrations r '
        'JOIN events e ON e.id=r.event_id WHERE r.user_id=%s ORDER BY e.date',
        (user_id,),
    )
    rows = cur.fetchall()
    cur.close()
    con.close()
    return jsonify([dict(r) for r in rows])
 
 
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)