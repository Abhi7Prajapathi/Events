import base64
import io
import json
import os
import re
import time

from dotenv import load_dotenv
load_dotenv()

import psycopg2
import psycopg2.extras
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

try:
    from google import genai
    GEMINI_KEY = os.environ.get('GEMINI_API_KEY', '')
    if GEMINI_KEY:
        gemini_client = genai.Client(api_key=GEMINI_KEY)
    HAS_GEMINI = bool(GEMINI_KEY)
except ImportError:
    HAS_GEMINI = False

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.environ["DATABASE_URL"]


USER_FIELDS = 'id,name,email,reg_no,department,class,interests,role'


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
        reg_no TEXT,
        department TEXT,
        class TEXT,
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
    
    cur.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS reg_no TEXT')
    cur.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS department TEXT')
    cur.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS class TEXT')
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
        con.commit()

    cur.execute(
        "INSERT INTO users (name,email,password,interests,role) VALUES "
        "('Event Office','admin@campus.edu','admin123','', 'admin') "
        "ON CONFLICT (email) DO NOTHING"
    )
    con.commit()
    cur.close()
    con.close()



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
    email = (data.get('email') or '').strip().lower()
    con = conn()
    cur = con.cursor()
    cur.execute(
        f'SELECT {USER_FIELDS} FROM users WHERE email=%s AND password=%s',
        (email, data.get('password', '')),
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
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    reg_no = (data.get('reg_no') or '').strip()
    department = (data.get('department') or '').strip()
    class_name = (data.get('class') or '').strip()

    if not name or not email or not password:
        return jsonify({'error': 'Name, email and password are required.'}), 400
    if not reg_no or not department or not class_name:
        return jsonify({'error': 'Registration number, department and class are required.'}), 400

    con = conn()
    cur = con.cursor()
    try:
        cur.execute(
            'INSERT INTO users (name,email,password,reg_no,department,class,interests) '
            'VALUES (%s,%s,%s,%s,%s,%s,%s) RETURNING id',
            (name, email, password, reg_no, department, class_name, data.get('interests', '')),
        )
        new_id = cur.fetchone()['id']
        con.commit()
        cur.execute(f'SELECT {USER_FIELDS} FROM users WHERE id=%s', (new_id,))
        user = cur.fetchone()
        return jsonify(dict(user)), 201
    except psycopg2.errors.UniqueViolation:
        con.rollback()
        return jsonify({'error': 'This email is already registered.'}), 409
    finally:
        cur.close()
        con.close()


@app.get('/api/me/<int:user_id>')
def me(user_id):
    con = conn()
    cur = con.cursor()
    cur.execute(f'SELECT {USER_FIELDS} FROM users WHERE id=%s', (user_id,))
    user = cur.fetchone()
    cur.close()
    con.close()
    if not user:
        return jsonify({'error': 'User not found.'}), 404
    return jsonify(dict(user))


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


# --------------- AI FEATURES ---------------

@app.post('/api/ai/generate-event')
def ai_generate_event():
    """Takes a short prompt and returns a fully fleshed-out event JSON."""
    if not HAS_GEMINI:
        return jsonify({'error': 'AI is not configured. Set the GEMINI_API_KEY environment variable.'}), 503

    prompt_text = (request.json or {}).get('prompt', '').strip()
    if not prompt_text:
        return jsonify({'error': 'Please provide a short description of your event.'}), 400

    system_prompt = (
        "You are an expert campus event copywriter. "
        "Given a rough idea from a college event organizer, produce a polished event listing. "
        "Return ONLY a valid JSON object (no markdown fences) with these exact keys: "
        "\"title\" (catchy, max 50 chars), "
        "\"category\" (exactly one of: Workshop, Technical, Cultural, Placement, Seminar), "
        "\"description\" (engaging, 2-3 paragraphs, plain text), "
        "\"time\" (e.g. \"10:00 AM\"), "
        "\"venue\" (a realistic campus venue name). "
        "Do NOT include any explanation outside the JSON."
    )

    TEXT_MODELS = ['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.8-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest']
    last_error = None

    for model_name in TEXT_MODELS:
        try:
            response = gemini_client.models.generate_content(
                model=model_name,
                contents=f"{system_prompt}\n\nOrganizer's rough idea: {prompt_text}",
            )
            text = response.text.strip()
            # Strip markdown code fences if present
            text = re.sub(r'^```(?:json)?\s*', '', text)
            text = re.sub(r'\s*```$', '', text)
            data = json.loads(text)
            return jsonify(data)
        except json.JSONDecodeError:
            return jsonify({'error': 'AI returned an invalid response. Please try again.'}), 502
        except Exception as e:
            last_error = str(e)
            if "429" in last_error or "RESOURCE_EXHAUSTED" in last_error:
                return jsonify({'error': 'Free API quota exceeded. Please wait 1 minute before trying again.'}), 429
            time.sleep(1) # Wait 1 second before retrying to avoid burst limits
            continue  # Try next model

    return jsonify({'error': f'All AI models are busy. Please try again in a minute. Last error: {last_error}'}), 503


@app.delete('/api/events/<int:event_id>')
def delete_event(event_id):
    con = conn()
    cur = con.cursor()
    try:
        cur.execute('DELETE FROM registrations WHERE event_id=%s', (event_id,))
        cur.execute('DELETE FROM events WHERE id=%s RETURNING id', (event_id,))
        deleted = cur.fetchone()
        con.commit()
        if deleted:
            return jsonify({'message': 'Event deleted successfully.'})
        else:
            return jsonify({'error': 'Event not found.'}), 404
    except Exception as e:
        con.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        con.close()


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)