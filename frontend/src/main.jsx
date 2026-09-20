import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const api = (path, opts = {}) =>
  fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  }).then(async (r) => {
    let d = await r.json();
    if (!r.ok) throw new Error(d.error);
    return d;
  });

const icons = {
  Workshop: '✦',
  Technical: '⌘',
  Cultural: '♫',
  Placement: '↗',
  Seminar: '◎',
};

function App() {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem('campus-user') || 'null')
  );
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('discover');
  const [notice, setNotice] = useState('');
  const [modal, setModal] = useState(false);

  const refresh = () =>
    api('/events?user_id=' + (user?.id || '')).then(setEvents);

  useEffect(() => {
    refresh();
  }, [user]);

  const signed = (u) => {
    setUser(u);
    localStorage.setItem('campus-user', JSON.stringify(u));
    setModal(false);
  };

  const enroll = async (id) => {
    if (!user) return setModal(true);
    try {
      await api(`/events/${id}/register`, {
        method: 'POST',
        body: JSON.stringify({ user_id: user.id }),
      });
      setNotice('You’re registered — see you there.');
      refresh();
    } catch (e) {
      setNotice(e.message);
    }
  };

  if (!user && modal) {
    return <Auth onDone={signed} close={() => setModal(false)} />;
  }

  return (
    <>
      <header className="h-[74px] px-4 md:px-[6.5vw] flex items-center justify-between border-b border-line bg-[#fbfaf6] sticky top-0 z-50 transition-all duration-200 shadow-xs">
        <a
          className="font-bold text-xl tracking-tighter cursor-pointer flex items-center select-none group"
          onClick={() => setView('discover')}
        >
          <i className="font-serif text-[28px] not-italic bg-ink text-lime inline-grid place-items-center w-[30px] h-[30px] rounded-full mr-2 shadow group-hover:scale-105 transition-transform">
            c
          </i>
          <span>
            campus<span className="text-[#7b827e] font-normal">circle</span>
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-8 ml-[70px]">
          <button
            className={`text-sm py-[25px] border-b-2 font-medium transition-colors ${
              view === 'discover'
                ? 'border-ink text-ink font-semibold'
                : 'border-transparent text-muted hover:text-ink'
            }`}
            onClick={() => setView('discover')}
          >
            Discover
          </button>
          {user && (
            <button
              className={`text-sm py-[25px] border-b-2 font-medium transition-colors ${
                view === 'my-events'
                  ? 'border-ink text-ink font-semibold'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
              onClick={() => setView('my-events')}
            >
              My events
            </button>
          )}
          {user?.role === 'admin' && (
            <button
              className={`text-sm py-[25px] border-b-2 font-medium transition-colors ${
                view === 'admin'
                  ? 'border-ink text-ink font-semibold'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
              onClick={() => setView('admin')}
            >
              Admin
            </button>
          )}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="bg-lime text-ink w-8 h-8 rounded-full grid place-items-center font-bold text-xs shadow-inner">
                {user.name[0]}
              </span>
              <button
                className="text-xs px-3 py-1.5 border border-line rounded-sm hover:bg-ink hover:text-white transition-colors"
                onClick={() => {
                  localStorage.removeItem('campus-user');
                  setUser(null);
                  setView('discover');
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              className="border border-ink px-4 py-2 rounded-sm text-xs font-semibold hover:bg-ink hover:text-white transition-colors"
              onClick={() => setModal(true)}
            >
              Sign in
            </button>
          )}
        </div>
      </header>
      {notice && (
        <div className="fixed z-50 bottom-6 right-6 bg-[#243b31] text-white px-5 py-4 rounded-sm shadow-[5px_5px_0_#cfe870] text-sm flex items-center gap-4 animate-bounce">
          <span>{notice}</span>
          <button
            className="text-white hover:text-lime text-xl leading-none font-bold"
            onClick={() => setNotice('')}
          >
            ×
          </button>
        </div>
      )}
      <main>
        {view === 'discover' && (
          <Discover events={events} user={user} enroll={enroll} />
        )}
        {view === 'my-events' && <MyEvents user={user} />}
        {view === 'admin' && <Admin refresh={refresh} />}
      </main>
    </>
  );
}

function Discover({ events, user, enroll }) {
  const [filter, setFilter] = useState('All');
  const [rec, setRec] = useState([]);

  useEffect(() => {
    if (user?.role === 'student') {
      api('/recommendations/' + user.id).then(setRec);
    }
  }, [user]);

  let list = filter === 'All' ? events : events.filter((e) => e.category === filter);

  return (
    <>
      <section className="max-w-[1180px] mx-auto min-h-[470px] px-6 py-16 md:py-20 flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-[100px]">
        <div className="flex-1 max-w-xl">
          <p className="font-mono tracking-widest text-[#76817b] text-xs uppercase mb-4">
            YOUR CAMPUS, IN ONE PLACE
          </p>
          <h1 className="font-serif text-5xl md:text-6xl tracking-tight leading-[1.02] mb-5">
            Good things are
            <br />
            <em className="text-[#6d8279] not-italic">happening</em> here.
          </h1>
          <p className="text-muted text-base leading-relaxed max-w-md">
            Find events worth leaving your room for — and keep every campus plan in
            one calm place.
          </p>
          <button
            className="bg-ink text-white px-5 py-3.5 rounded-sm text-sm font-medium mt-6 inline-flex items-center gap-3 hover:bg-opacity-90 hover:translate-y-[-1px] transition-all shadow-md group"
            onClick={() =>
              document.querySelector('#events')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Explore events{' '}
            <b className="text-lime transition-transform group-hover:translate-x-1">→</b>
          </button>
        </div>
        <div className="bg-[#263a33] text-[#f8f7f2] w-full md:w-[335px] min-h-[265px] p-7 relative shadow-[9px_9px_0_#cfe870] rounded-sm transition-transform hover:scale-[1.02]">
          <span className="font-mono text-[10px] text-[#aab8ae] uppercase tracking-widest block mb-2">
            UP NEXT
          </span>
          <strong className="text-7xl leading-none block font-medium mt-4 font-sans">
            11
            <br />
            <small className="text-sm tracking-widest uppercase font-mono block mt-1">OCT</small>
          </strong>
          <div className="absolute bottom-5 right-6 text-right max-w-[200px]">
            <b className="text-base font-semibold block leading-tight">CodeCraft Hackathon</b>
            <p className="text-xs text-[#c7d2ca] mt-1">9:00 AM · C Block Auditorium</p>
          </div>
        </div>
      </section>

      {user?.role === 'student' && rec.length > 0 && (
        <section className="bg-[#e7eddf] border-y border-[#d5dbcf] px-6 md:px-[6.5vw] py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="font-mono tracking-widest text-[#76817b] text-[11px] uppercase mb-1">
              PICKED FOR YOU
            </p>
            <h2 className="font-serif text-2xl font-semibold">Based on what you’re into.</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {rec.map((e) => (
              <span
                key={e.id}
                className="bg-[#f7f8f2] px-3.5 py-3 rounded-sm text-sm font-medium shadow-xs flex items-center gap-2"
              >
                <span className="text-ink">{icons[e.category]}</span> {e.title}
              </span>
            ))}
          </div>
        </section>
      )}

      <section id="events" className="max-w-[1180px] mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="font-mono tracking-widest text-[#76817b] text-xs uppercase mb-1">
              WHAT’S ON
            </p>
            <h2 className="font-serif text-3xl md:text-4xl tracking-tight">Upcoming on campus</h2>
          </div>
          <div className="flex flex-wrap gap-1">
            {['All', 'Workshop', 'Technical', 'Cultural', 'Placement', 'Seminar'].map(
              (x) => (
                <button
                  key={x}
                  onClick={() => setFilter(x)}
                  className={`text-xs px-3 py-2 rounded-sm transition-colors font-medium ${
                    filter === x
                      ? 'bg-[#dfe5d5] text-ink shadow-xs'
                      : 'text-[#68716c] hover:bg-black/5'
                  }`}
                >
                  {x}
                </button>
              )
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((e) => (
            <EventCard key={e.id} e={e} enroll={enroll} />
          ))}
        </div>
      </section>
    </>
  );
}

function EventCard({ e, enroll }) {
  const bgClasses = {
    Technical: 'bg-[#263f53]',
    Cultural: 'bg-[#894f41]',
    Placement: 'bg-[#705d31]',
    Seminar: 'bg-[#526b68]',
    Workshop: 'bg-[#30483f]',
  };

  const categoryBg = bgClasses[e.category] || 'bg-[#30483f]';

  return (
    <article
      className={`h-[295px] relative p-5 rounded-sm overflow-hidden text-white ${categoryBg} transition-transform hover:-translate-y-1 shadow-md flex flex-col justify-between group`}
    >
      <div className="flex justify-between items-start font-mono text-[10px] uppercase tracking-wider">
        <span className="font-semibold opacity-90">{e.category}</span>
        <span className="bg-white/15 px-2 py-1 -mt-1 rounded-xs backdrop-blur-xs">
          {new Date(e.date + 'T00:00').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
      <div className="font-serif text-7xl text-lime my-auto opacity-90 transition-transform group-hover:scale-110">
        {icons[e.category]}
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-bold tracking-tight leading-snug">{e.title}</h3>
        <p className="text-xs text-[#dbe2dc] pb-2">
          {e.time} · {e.venue}
        </p>
        <button
          disabled={e.is_registered}
          onClick={() => enroll(e.id)}
          className="text-xs border-b border-lime pb-0.5 text-white font-medium hover:text-lime disabled:border-[#aab7b1] disabled:text-[#c6d0ca] transition-colors disabled:cursor-not-allowed"
        >
          {e.is_registered ? 'Registered ✓' : 'View & register →'}
        </button>
      </div>
    </article>
  );
}

function MyEvents({ user }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api('/registrations/' + user.id).then(setRows);
  }, [user]);

  return (
    <section className="max-w-[1180px] mx-auto px-6 py-16 min-h-[75vh]">
      <p className="font-mono tracking-widest text-[#76817b] text-xs uppercase mb-2">
        YOUR PLANS
      </p>
      <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-8">My events</h1>
      {rows.length ? (
        <div className="border-t border-line max-w-4xl divide-y divide-line">
          {rows.map((r) => (
            <article
              key={r.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 px-2 hover:bg-black/5 transition-colors rounded-sm"
            >
              <div className="flex items-center gap-6">
                <div className="text-center w-12 shrink-0">
                  <b className="font-serif text-3xl block leading-none">
                    {new Date(r.date + 'T00:00').getDate()}
                  </b>
                  <span className="font-mono text-[10px] uppercase text-muted block mt-1">
                    {new Date(r.date + 'T00:00')
                      .toLocaleDateString('en-US', { month: 'short' })
                      .toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-[#6c7e67] uppercase font-semibold block mb-1">
                    {r.category}
                  </span>
                  <h3 className="text-lg font-bold text-ink mb-1">{r.title}</h3>
                  <p className="text-xs text-muted">
                    {r.time} · {r.venue}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 ml-auto sm:ml-0">
                <span className="text-xs font-semibold text-[#4d7958] flex items-center gap-1.5">
                  <span className="text-[10px]">●</span> {r.status}
                </span>
                <button
                  onClick={() => window.print()}
                  className="print-keep text-xs border border-line px-3 py-2 rounded-sm hover:bg-ink hover:text-white transition-colors"
                >
                  Certificate
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-[#ebeee7] max-w-xl p-8 text-muted rounded-sm text-sm leading-relaxed border border-line/50">
          Nothing booked yet. Browse upcoming events and save your spot.
        </div>
      )}
    </section>
  );
}

function Admin({ refresh }) {
  const [stats, setStats] = useState({});
  const [form, setForm] = useState({
    category: 'Workshop',
    seats: 50,
    image: 'general',
  });

  useEffect(() => {
    api('/admin/stats').then(setStats);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api('/events', { method: 'POST', body: JSON.stringify(form) });
    refresh();
    setForm({ category: 'Workshop', seats: 50, image: 'general' });
    alert('Event published.');
  };

  return (
    <section className="max-w-[1180px] mx-auto px-6 py-16 min-h-[75vh]">
      <p className="font-mono tracking-widest text-[#76817b] text-xs uppercase mb-2">
        EVENT OFFICE
      </p>
      <h1 className="font-serif text-4xl md:text-5xl tracking-tight mb-8">Dashboard</h1>
      <div className="flex flex-wrap gap-4 mb-10">
        <div className="bg-[#e8ede1] p-5 min-w-[170px] rounded-sm shadow-xs">
          <b className="font-serif text-4xl block font-semibold text-ink">
            {stats.events || 0}
          </b>
          <span className="text-xs text-muted font-medium mt-1 block">Events live</span>
        </div>
        <div className="bg-[#e8ede1] p-5 min-w-[170px] rounded-sm shadow-xs">
          <b className="font-serif text-4xl block font-semibold text-ink">
            {stats.registrations || 0}
          </b>
          <span className="text-xs text-muted font-medium mt-1 block">
            Total registrations
          </span>
        </div>
        <div className="bg-[#e8ede1] p-5 min-w-[170px] rounded-sm shadow-xs">
          <b className="font-serif text-4xl block font-semibold text-ink">
            {stats.students || 0}
          </b>
          <span className="text-xs text-muted font-medium mt-1 block">Students</span>
        </div>
      </div>
      <form
        className="max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-5 bg-paper p-8 border border-line rounded-sm shadow-sm"
        onSubmit={submit}
      >
        <h2 className="md:col-span-2 font-serif text-2xl font-bold tracking-tight mb-2">
          Publish an event
        </h2>
        {[
          ['title', 'Event title'],
          ['date', 'Date'],
          ['time', 'Time'],
          ['venue', 'Venue'],
          ['deadline', 'Registration deadline'],
          ['description', 'Short description'],
        ].map(([k, l]) => (
          <label key={k} className="text-xs font-semibold text-[#4e5a54] flex flex-col gap-1.5">
            {l}
            <input
              required
              type={k === 'date' || k === 'deadline' ? 'date' : 'text'}
              value={form[k] || ''}
              onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              className="w-full border border-[#d5d8d0] p-2.5 bg-white rounded-xs focus:ring-1 focus:ring-ink focus:outline-none text-sm font-normal"
            />
          </label>
        ))}
        <label className="text-xs font-semibold text-[#4e5a54] flex flex-col gap-1.5">
          Category
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border border-[#d5d8d0] p-2.5 bg-white rounded-xs focus:ring-1 focus:ring-ink focus:outline-none text-sm font-normal"
          >
            {['Workshop', 'Technical', 'Cultural', 'Placement', 'Seminar'].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <div className="md:col-span-2 pt-2">
          <button className="bg-ink text-white px-6 py-3 rounded-sm text-sm font-medium hover:bg-opacity-90 transition-colors shadow-sm">
            Publish event →
          </button>
        </div>
      </form>
    </section>
  );
}

function Auth({ onDone, close }) {
  const [newUser, setNewUser] = useState(false);
  const [d, setD] = useState({ email: 'aarav@campus.edu', password: 'demo123' });
  const [err, setErr] = useState('');

  const go = async (e) => {
    e.preventDefault();
    try {
      onDone(
        await api(newUser ? '/register-user' : '/login', {
          method: 'POST',
          body: JSON.stringify(d),
        })
      );
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#19201d]/50 backdrop-blur-xs z-50 grid place-items-center p-4">
      <form
        onSubmit={go}
        className="bg-[#fffefa] w-full max-w-[410px] p-8 md:p-9 relative shadow-[12px_12px_0_#cfe870] border border-line rounded-sm"
      >
        <button
          type="button"
          className="absolute right-4 top-3 text-muted hover:text-ink text-2xl leading-none font-bold"
          onClick={close}
        >
          ×
        </button>
        <a className="font-bold text-lg tracking-tighter cursor-pointer flex items-center select-none mb-6">
          <i className="font-serif text-[26px] not-italic bg-ink text-lime inline-grid place-items-center w-[28px] h-[28px] rounded-full mr-2 shadow">
            c
          </i>
          <span>
            campus<span className="text-[#7b827e] font-normal">circle</span>
          </span>
        </a>
        <h1 className="font-serif text-3xl font-bold tracking-tight mb-1">
          {newUser ? 'Join Campus Circle' : 'Welcome back'}
        </h1>
        <p className="text-muted text-sm mb-6">
          {newUser
            ? 'Create an account to discover your campus.'
            : 'Sign in to manage your event plans.'}
        </p>
        <div className="space-y-4">
          {newUser && (
            <label className="block text-xs font-semibold text-[#4e5a54]">
              Name
              <input
                required
                onChange={(e) => setD({ ...d, name: e.target.value })}
                className="w-full border border-[#d5d8d0] p-2.5 mt-1 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none"
              />
            </label>
          )}
          <label className="block text-xs font-semibold text-[#4e5a54]">
            Email
            <input
              required
              type="email"
              value={d.email || ''}
              onChange={(e) => setD({ ...d, email: e.target.value })}
              className="w-full border border-[#d5d8d0] p-2.5 mt-1 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none"
            />
          </label>
          <label className="block text-xs font-semibold text-[#4e5a54]">
            Password
            <input
              required
              type="password"
              value={d.password || ''}
              onChange={(e) => setD({ ...d, password: e.target.value })}
              className="w-full border border-[#d5d8d0] p-2.5 mt-1 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none"
            />
          </label>
          {newUser && (
            <label className="block text-xs font-semibold text-[#4e5a54]">
              Interests{' '}
              <small className="font-normal text-muted">(e.g. Technical, Design, Data)</small>
              <input
                onChange={(e) => setD({ ...d, interests: e.target.value })}
                className="w-full border border-[#d5d8d0] p-2.5 mt-1 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none"
              />
            </label>
          )}
        </div>
        {err && <p className="text-[#ad3f33] text-xs font-medium mt-3">{err}</p>}
        <button className="bg-ink text-white w-full py-3 rounded-sm text-sm font-medium mt-6 hover:bg-opacity-90 transition-colors shadow-sm">
          {newUser ? 'Create account' : 'Sign in'} →
        </button>
        <button
          type="button"
          className="w-full text-center text-[#527063] hover:underline text-xs mt-4 block"
          onClick={() => setNewUser(!newUser)}
        >
          {newUser ? 'Already registered? Sign in' : 'New here? Create an account'}
        </button>
        <small className="block text-center text-[#888] text-[10px] mt-4 leading-relaxed border-t border-line/40 pt-3">
          Demo: aarav@campus.edu / demo123
          <br />
          Admin: admin@campus.edu / admin123
        </small>
      </form>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
