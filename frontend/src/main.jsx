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
  const [menuOpen, setMenuOpen] = useState(false);

  const refresh = () =>
    api('/events?user_id=' + (user?.id || '')).then(setEvents);

  useEffect(() => { refresh(); }, [user]);

  const deleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api(`/events/${id}`, { method: 'DELETE' });
      setNotice('Event deleted successfully.');
      refresh();
    } catch (e) { setNotice(e.message); }
  };

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
      setNotice("You're registered — see you there.");
      refresh();
    } catch (e) { setNotice(e.message); }
  };

  const navigate = (v) => { setView(v); setMenuOpen(false); };

  if (!user && modal) return <Auth onDone={signed} close={() => setModal(false)} />;

  const navItems = [
    { key: 'discover', label: 'Discover', always: true },
    { key: 'my-events', label: 'My events', auth: true },
    { key: 'profile', label: 'Profile', auth: true },
    { key: 'admin', label: 'Admin', adminOnly: true },
  ].filter(n => {
    if (n.adminOnly) return user?.role === 'admin';
    if (n.auth) return !!user;
    return true;
  });

  return (
    <>
      {/* ── Header ── */}
      <header className="h-[64px] px-4 md:px-[6.5vw] flex items-center justify-between border-b border-line bg-[#fbfaf6] sticky top-0 z-50 shadow-xs">
        <a
          className="font-bold text-xl tracking-tighter cursor-pointer flex items-center select-none group"
          onClick={() => navigate('discover')}
        >
          <i className="font-serif text-[26px] not-italic bg-ink text-lime inline-grid place-items-center w-[28px] h-[28px] rounded-full mr-2 shadow group-hover:scale-105 transition-transform">c</i>
          <span>campus<span className="text-[#7b827e] font-normal">circle</span></span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 ml-[60px]">
          {navItems.map(n => (
            <button key={n.key}
              className={`text-sm py-[20px] border-b-2 font-medium transition-colors ${view === n.key ? 'border-ink text-ink font-semibold' : 'border-transparent text-muted hover:text-ink'}`}
              onClick={() => navigate(n.key)}
            >{n.label}</button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 text-sm">
          {user ? (
            <>
              <button
                className="bg-lime text-ink w-8 h-8 rounded-full grid place-items-center font-bold text-xs shadow-inner"
                onClick={() => navigate('profile')}
                title="View profile"
              >{user.name[0]}</button>
              <button
                className="hidden sm:block text-xs px-3 py-1.5 border border-line rounded-sm hover:bg-ink hover:text-white transition-colors"
                onClick={() => { localStorage.removeItem('campus-user'); setUser(null); navigate('discover'); }}
              >Sign out</button>
            </>
          ) : (
            <button
              className="border border-ink px-4 py-2 rounded-sm text-xs font-semibold hover:bg-ink hover:text-white transition-colors"
              onClick={() => setModal(true)}
            >Sign in</button>
          )}

          {/* Hamburger (mobile only) */}
          <button
            className="md:hidden ml-1 flex flex-col justify-center items-center w-9 h-9 gap-[5px]"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-[2px] bg-ink transition-transform duration-200 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block w-5 h-[2px] bg-ink transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-[2px] bg-ink transition-transform duration-200 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile slide-down nav */}
      {menuOpen && (
        <div className="md:hidden bg-[#fbfaf6] border-b border-line shadow-md z-40 relative">
          {navItems.map(n => (
            <button key={n.key}
              className={`w-full text-left px-5 py-4 text-sm font-medium border-b border-line/40 ${view === n.key ? 'text-ink font-semibold bg-[#f0f2ea]' : 'text-muted'}`}
              onClick={() => navigate(n.key)}
            >{n.label}</button>
          ))}
          {user && (
            <button
              className="w-full text-left px-5 py-4 text-sm text-[#ad3f33] font-medium"
              onClick={() => { localStorage.removeItem('campus-user'); setUser(null); navigate('discover'); setMenuOpen(false); }}
            >Sign out</button>
          )}
        </div>
      )}

      {/* Toast */}
      {notice && (
        <div className="fixed z-50 bottom-5 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 bg-[#243b31] text-white px-5 py-4 rounded-sm shadow-[4px_4px_0_#cfe870] text-sm flex items-center gap-4 max-w-[90vw]">
          <span>{notice}</span>
          <button className="text-white hover:text-lime text-xl leading-none font-bold" onClick={() => setNotice('')}>×</button>
        </div>
      )}

      <main>
        {view === 'discover' && <Discover events={events} user={user} enroll={enroll} deleteEvent={deleteEvent} />}
        {view === 'my-events' && <MyEvents user={user} />}
        {view === 'profile' && <Profile user={user} />}
        {view === 'admin' && <Admin refresh={refresh} />}
      </main>
    </>
  );
}

function Discover({ events, user, enroll, deleteEvent }) {
  const [filter, setFilter] = useState('All');
  const [rec, setRec] = useState([]);

  useEffect(() => {
    if (user?.role === 'student') api('/recommendations/' + user.id).then(setRec);
  }, [user]);

  let list = filter === 'All' ? events : events.filter((e) => e.category === filter);

  return (
    <>
      {/* Hero */}
      <section className="max-w-[1180px] mx-auto px-4 sm:px-6 py-10 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-[100px]">
        <div className="flex-1 max-w-xl text-center md:text-left">
          <p className="font-mono tracking-widest text-[#76817b] text-xs uppercase mb-3">YOUR CAMPUS, IN ONE PLACE</p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.05] mb-4">
            Good things are<br />
            <em className="text-[#6d8279] not-italic">happening</em> here.
          </h1>
          <p className="text-muted text-base leading-relaxed max-w-md mx-auto md:mx-0">
            Find events worth leaving your room for — and keep every campus plan in one calm place.
          </p>
          <button
            className="bg-ink text-white px-5 py-3 rounded-sm text-sm font-medium mt-5 inline-flex items-center gap-3 hover:bg-opacity-90 transition-all shadow-md group"
            onClick={() => document.querySelector('#events')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore events <b className="text-lime transition-transform group-hover:translate-x-1">→</b>
          </button>
        </div>

        {/* "Up Next" card — hidden on very small screens */}
        <div className="hidden sm:block bg-[#263a33] text-[#f8f7f2] w-full md:w-[300px] lg:w-[335px] min-h-[240px] p-6 relative shadow-[8px_8px_0_#cfe870] rounded-sm hover:scale-[1.02] transition-transform flex-shrink-0">
          <span className="font-mono text-[10px] text-[#aab8ae] uppercase tracking-widest block mb-2">UP NEXT</span>
          <strong className="text-6xl leading-none block font-medium mt-3 font-sans">
            11<br />
            <small className="text-sm tracking-widest uppercase font-mono block mt-1">OCT</small>
          </strong>
          <div className="absolute bottom-5 right-5 text-right max-w-[180px]">
            <b className="text-base font-semibold block leading-tight">CodeCraft Hackathon</b>
            <p className="text-xs text-[#c7d2ca] mt-1">9:00 AM · C Block Auditorium</p>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      {user?.role === 'student' && rec.length > 0 && (
        <section className="bg-[#e7eddf] border-y border-[#d5dbcf] px-4 sm:px-[6.5vw] py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="font-mono tracking-widest text-[#76817b] text-[11px] uppercase mb-1">PICKED FOR YOU</p>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold">Based on what you're into.</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {rec.map((e) => (
              <span key={e.id} className="bg-[#f7f8f2] px-3 py-2 rounded-sm text-sm font-medium shadow-xs flex items-center gap-2">
                <span className="text-ink">{icons[e.category]}</span> {e.title}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Events grid */}
      <section id="events" className="max-w-[1180px] mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <p className="font-mono tracking-widest text-[#76817b] text-xs uppercase mb-1">WHAT'S ON</p>
            <h2 className="font-serif text-3xl md:text-4xl tracking-tight">Upcoming on campus</h2>
          </div>
          <div className="flex flex-wrap gap-1">
            {['All', 'Workshop', 'Technical', 'Cultural', 'Placement', 'Seminar'].map((x) => (
              <button key={x} onClick={() => setFilter(x)}
                className={`text-xs px-3 py-2 rounded-sm transition-colors font-medium ${filter === x ? 'bg-[#dfe5d5] text-ink shadow-xs' : 'text-[#68716c] hover:bg-black/5'}`}
              >{x}</button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {list.map((e) => (
            <EventCard key={e.id} e={e} enroll={enroll} user={user} deleteEvent={deleteEvent} />
          ))}
        </div>
      </section>
    </>
  );
}

function EventCard({ e, enroll, user, deleteEvent }) {
  const bgClasses = {
    Technical: 'bg-[#263f53]',
    Cultural:  'bg-[#894f41]',
    Placement: 'bg-[#705d31]',
    Seminar:   'bg-[#526b68]',
    Workshop:  'bg-[#30483f]',
  };
  const categoryBg = bgClasses[e.category] || 'bg-[#30483f]';

  return (
    <article className={`h-[280px] sm:h-[295px] relative p-5 rounded-sm overflow-hidden text-white ${categoryBg} transition-transform hover:-translate-y-1 shadow-md flex flex-col justify-between group`}>
      <div className="flex justify-between items-start font-mono text-[10px] uppercase tracking-wider">
        <span className="font-semibold opacity-90">{e.category}</span>
        <span className="bg-white/15 px-2 py-1 -mt-1 rounded-xs backdrop-blur-xs">
          {new Date(e.date + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
      <div className="font-serif text-7xl text-lime my-auto opacity-90 transition-transform group-hover:scale-110">
        {icons[e.category]}
      </div>
      <div className="space-y-1">
        <h3 className="text-lg sm:text-xl font-bold tracking-tight leading-snug">{e.title}</h3>
        <p className="text-xs text-[#dbe2dc] pb-1">{e.time} · {e.venue}</p>
        <div className="flex justify-between items-center mt-1">
          <button
            disabled={e.is_registered}
            onClick={() => enroll(e.id)}
            className="text-xs border-b border-lime pb-0.5 text-white font-medium hover:text-lime disabled:border-[#aab7b1] disabled:text-[#c6d0ca] transition-colors disabled:cursor-not-allowed"
          >
            {e.is_registered ? 'Registered ✓' : 'View & register →'}
          </button>
          {user?.role === 'admin' && (
            <button
              onClick={() => deleteEvent(e.id)}
              className="text-xs text-[#ff9b8e] hover:text-white transition-colors border border-[#ff9b8e]/30 px-2 py-1 rounded-xs"
            >Delete</button>
          )}
        </div>
      </div>
    </article>
  );
}

function MyEvents({ user }) {
  const [rows, setRows] = useState([]);
  const [cert, setCert] = useState(null);

  useEffect(() => { api('/registrations/' + user.id).then(setRows); }, [user]);

  if (cert) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#e7eddf] p-3 sm:p-8 md:p-12 flex flex-col items-center justify-center plain overflow-auto print:p-0 print:bg-white">
        {/* Toolbar */}
        <div className="w-full max-w-[1050px] flex justify-end gap-3 mb-4 print:hidden">
          <button className="bg-white border border-line px-4 py-2 rounded-sm shadow-sm hover:bg-black/5 text-sm font-semibold transition-colors" onClick={() => setCert(null)}>Close</button>
          <button className="bg-ink text-white px-4 py-2 rounded-sm shadow-md hover:opacity-90 text-sm font-semibold transition-opacity flex items-center gap-2" onClick={() => window.print()}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print
          </button>
        </div>

        {/* Certificate */}
        <div className="w-full max-w-[1050px] bg-[#fffefa] border-[10px] sm:border-[16px] border-[#243b31] p-6 sm:p-12 md:p-16 relative shadow-2xl flex flex-col justify-between text-center overflow-hidden print:shadow-none print:border-0 print:w-full print:max-w-none print:p-16">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#243b31 2px, transparent 2px)', backgroundSize: '28px 28px' }} />

          <div className="relative z-10">
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#243b31] mb-3 sm:mb-5 tracking-tight">Certificate of Participation</h1>
            <p className="text-base sm:text-xl text-muted font-medium mb-4 sm:mb-7">This is to certify that</p>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold font-serif text-ink border-b-2 border-lime inline-block pb-2 mb-4 sm:mb-7 px-4 sm:px-8">{user.name}</h2>
            <p className="text-base sm:text-xl text-muted font-medium mb-4 sm:mb-7">has successfully participated in</p>
            <h3 className="text-xl sm:text-3xl md:text-4xl font-bold text-ink mb-8 sm:mb-16">{cert.title}</h3>
          </div>

          <div className="relative z-10 flex justify-between items-end gap-2 mt-4">
            <div className="text-center">
              <span className="font-serif italic text-lg sm:text-2xl text-ink block pb-2">{cert.date}</span>
              <div className="w-24 sm:w-40 md:w-48 border-b-2 border-ink/40 mb-2 mx-auto" />
              <p className="font-bold text-[9px] sm:text-[10px] tracking-widest uppercase text-muted">Date</p>
            </div>
            <div className="w-14 h-14 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-lime rounded-full flex items-center justify-center border-[3px] sm:border-[4px] border-[#243b31] shadow-lg shrink-0 relative top-3 sm:top-5">
              <span className="font-serif text-2xl sm:text-3xl md:text-5xl text-ink font-bold italic">C</span>
            </div>
            <div className="text-center relative">
              <div className="h-10 sm:h-14 flex justify-center items-end relative">
                <img src="/signature.jpg" alt="Signature" className="absolute bottom-[-8px] sm:bottom-[-15px] w-28 sm:w-40 md:w-52 h-auto mix-blend-multiply contrast-125 brightness-105" />
              </div>
              <div className="w-24 sm:w-40 md:w-48 border-b-2 border-ink/40 mb-2 mx-auto relative z-10" />
              <p className="font-bold text-[9px] sm:text-[10px] tracking-widest uppercase text-muted">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-[1180px] mx-auto px-4 sm:px-6 py-10 md:py-16 min-h-[75vh]">
      <p className="font-mono tracking-widest text-[#76817b] text-xs uppercase mb-2">YOUR PLANS</p>
      <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight mb-6 sm:mb-8">My events</h1>
      {rows.length ? (
        <div className="border-t border-line max-w-4xl divide-y divide-line">
          {rows.map((r) => (
            <article key={r.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-5 px-2 hover:bg-black/5 transition-colors rounded-sm">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="text-center w-10 sm:w-12 shrink-0">
                  <b className="font-serif text-2xl sm:text-3xl block leading-none">{new Date(r.date + 'T00:00').getDate()}</b>
                  <span className="font-mono text-[10px] uppercase text-muted block mt-1">
                    {new Date(r.date + 'T00:00').toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-[#6c7e67] uppercase font-semibold block mb-0.5">{r.category}</span>
                  <h3 className="text-base sm:text-lg font-bold text-ink mb-0.5">{r.title}</h3>
                  <p className="text-xs text-muted">{r.time} · {r.venue}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-14 sm:ml-0">
                <span className="text-xs font-semibold text-[#4d7958] flex items-center gap-1.5">
                  <span className="text-[10px]">●</span> {r.status}
                </span>
                <button onClick={() => setCert(r)} className="text-xs border border-line px-3 py-2 rounded-sm hover:bg-ink hover:text-white transition-colors whitespace-nowrap">
                  Certificate
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-[#ebeee7] max-w-xl p-6 sm:p-8 text-muted rounded-sm text-sm leading-relaxed border border-line/50">
          Nothing booked yet. Browse upcoming events and save your spot.
        </div>
      )}
    </section>
  );
}

function Profile({ user }) {
  const [data, setData] = useState(user);
  const [err, setErr] = useState('');

  useEffect(() => {
    api('/me/' + user.id).then(setData).catch((e) => setErr(e.message));
  }, [user.id]);

  const rows = [
    ['Full name', data.name],
    ['Email', data.email],
    ['Registration number', data.reg_no],
    ['Department', data.department],
    ['Class', data.class],
    ['Role', data.role],
  ];

  return (
    <section className="max-w-[1180px] mx-auto px-4 sm:px-6 py-10 md:py-16 min-h-[75vh]">
      <p className="font-mono tracking-widest text-[#76817b] text-xs uppercase mb-2">YOUR ACCOUNT</p>
      <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight mb-6 sm:mb-8">Profile</h1>
      {err && <p className="text-[#ad3f33] text-sm mb-4">{err}</p>}
      <div className="bg-paper border border-line rounded-sm shadow-sm divide-y divide-line w-full max-w-md">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between px-4 sm:px-6 py-4 gap-4">
            <span className="text-xs font-semibold text-[#4e5a54] uppercase tracking-wide shrink-0">{label}</span>
            <span className="text-sm font-medium text-ink text-right break-all">{value || '—'}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Admin({ refresh }) {
  const [stats, setStats] = useState({});
  const [form, setForm] = useState({ category: 'Workshop', seats: 50, image: 'general' });
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => { api('/admin/stats').then(setStats); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api('/events', { method: 'POST', body: JSON.stringify(form) });
    refresh();
    setForm({ category: 'Workshop', seats: 50, image: 'general' });
    setAiPrompt('');
    alert('Event published.');
  };

  const aiAutoFill = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError('');
    try {
      const result = await api('/ai/generate-event', { method: 'POST', body: JSON.stringify({ prompt: aiPrompt }) });
      setForm(prev => ({
        ...prev,
        title: result.title || prev.title,
        category: result.category || prev.category,
        description: result.description || prev.description,
        time: result.time || prev.time,
        venue: result.venue || prev.venue,
      }));
    } catch (e) { setAiError(e.message); }
    finally { setAiLoading(false); }
  };

  return (
    <section className="max-w-[1180px] mx-auto px-4 sm:px-6 py-10 md:py-16 min-h-[75vh]">
      <p className="font-mono tracking-widest text-[#76817b] text-xs uppercase mb-2">EVENT OFFICE</p>
      <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight mb-6 sm:mb-8">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 max-w-lg">
        {[['Events live', stats.events], ['Registrations', stats.registrations], ['Students', stats.students]].map(([label, val]) => (
          <div key={label} className="bg-[#e8ede1] p-4 rounded-sm shadow-xs">
            <b className="font-serif text-3xl block font-semibold text-ink">{val || 0}</b>
            <span className="text-xs text-muted font-medium mt-1 block leading-tight">{label}</span>
          </div>
        ))}
      </div>

      {/* AI Auto-Fill */}
      <div className="mb-8 bg-gradient-to-br from-[#263a33] to-[#1a2e26] p-4 sm:p-6 rounded-sm shadow-md border border-[#3a5548]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">✨</span>
          <h3 className="text-white font-bold text-sm tracking-wide">AI AUTO-FILL</h3>
          <span className="text-[#aab8ae] text-xs ml-1 hidden sm:inline">— Describe your event in a few words</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="e.g. hackathon on friday with free pizza and mentors"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && aiAutoFill()}
            className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-[#7a9485] px-4 py-3 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-lime"
          />
          <button
            type="button"
            onClick={aiAutoFill}
            disabled={aiLoading || !aiPrompt.trim()}
            className="bg-lime text-ink px-5 py-3 rounded-sm text-sm font-bold hover:bg-[#d9f07a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
          >
            {aiLoading ? <><span className="inline-block w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />Generating…</> : <>✨ Generate</>}
          </button>
        </div>
        {aiError && <p className="text-[#ff9b8e] text-xs mt-2">{aiError}</p>}
      </div>

      {/* Event Form */}
      <form
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 bg-paper p-5 sm:p-8 border border-line rounded-sm shadow-sm max-w-2xl"
        onSubmit={submit}
      >
        <h2 className="sm:col-span-2 font-serif text-xl sm:text-2xl font-bold tracking-tight mb-1">Publish an event</h2>
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
            {['Workshop', 'Technical', 'Cultural', 'Placement', 'Seminar'].map((x) => <option key={x}>{x}</option>)}
          </select>
        </label>
        <div className="sm:col-span-2 pt-2">
          <button className="w-full sm:w-auto bg-ink text-white px-6 py-3 rounded-sm text-sm font-medium hover:bg-opacity-90 transition-colors shadow-sm">
            Publish event →
          </button>
        </div>
      </form>
    </section>
  );
}

function Auth({ onDone, close }) {
  const [newUser, setNewUser] = useState(false);
  const [d, setD] = useState({});
  const [err, setErr] = useState('');

  const go = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      onDone(await api(newUser ? '/register-user' : '/login', { method: 'POST', body: JSON.stringify(d) }));
    } catch (e) { setErr(e.message); }
  };

  return (
    <div className="fixed inset-0 bg-[#19201d]/50 backdrop-blur-xs z-50 grid place-items-center p-4">
      <form
        onSubmit={go}
        className="bg-[#fffefa] w-full max-w-[410px] p-6 sm:p-9 relative shadow-[10px_10px_0_#cfe870] border border-line rounded-sm max-h-[92vh] overflow-y-auto"
      >
        <button type="button" className="absolute right-4 top-3 text-muted hover:text-ink text-2xl leading-none font-bold" onClick={close}>×</button>
        <a className="font-bold text-lg tracking-tighter cursor-pointer flex items-center select-none mb-5">
          <i className="font-serif text-[26px] not-italic bg-ink text-lime inline-grid place-items-center w-[28px] h-[28px] rounded-full mr-2 shadow">c</i>
          <span>campus<span className="text-[#7b827e] font-normal">circle</span></span>
        </a>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight mb-1">
          {newUser ? 'Join Campus Circle' : 'Welcome back'}
        </h1>
        <p className="text-muted text-sm mb-5">
          {newUser ? 'Create an account with your official details to discover your campus.' : 'Sign in to manage your event plans.'}
        </p>
        <div className="space-y-3 sm:space-y-4">
          {newUser && (
            <>
              <label className="block text-xs font-semibold text-[#4e5a54]">
                Full name
                <input required value={d.name || ''} onChange={(e) => setD({ ...d, name: e.target.value })}
                  className="w-full border border-[#d5d8d0] p-2.5 mt-1 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none" />
              </label>
              <label className="block text-xs font-semibold text-[#4e5a54]">
                Registration number
                <input required placeholder="610825BIT001" value={d.reg_no || ''} onChange={(e) => setD({ ...d, reg_no: e.target.value })}
                  className="w-full border border-[#d5d8d0] p-2.5 mt-1 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-semibold text-[#4e5a54]">
                  Department
                  <input required placeholder="IT" value={d.department || ''} onChange={(e) => setD({ ...d, department: e.target.value })}
                    className="w-full border border-[#d5d8d0] p-2.5 mt-1 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none" />
                </label>
                <label className="block text-xs font-semibold text-[#4e5a54]">
                  Class
                  <input required placeholder="II IT A" value={d.class || ''} onChange={(e) => setD({ ...d, class: e.target.value })}
                    className="w-full border border-[#d5d8d0] p-2.5 mt-1 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none" />
                </label>
              </div>
            </>
          )}
          <label className="block text-xs font-semibold text-[#4e5a54]">
            Email
            <input required type="email" value={d.email || ''} onChange={(e) => setD({ ...d, email: e.target.value })}
              className="w-full border border-[#d5d8d0] p-2.5 mt-1 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none" />
          </label>
          <label className="block text-xs font-semibold text-[#4e5a54]">
            Password
            <input required type="password" minLength={newUser ? 6 : undefined} value={d.password || ''} onChange={(e) => setD({ ...d, password: e.target.value })}
              className="w-full border border-[#d5d8d0] p-2.5 mt-1 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none" />
          </label>
          {newUser && (
            <label className="block text-xs font-semibold text-[#4e5a54]">
              Interests <small className="font-normal text-muted">(e.g. Technical, Design, Data)</small>
              <input value={d.interests || ''} onChange={(e) => setD({ ...d, interests: e.target.value })}
                className="w-full border border-[#d5d8d0] p-2.5 mt-1 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none" />
            </label>
          )}
        </div>
        {err && <p className="text-[#ad3f33] text-xs font-medium mt-3">{err}</p>}
        <button className="bg-ink text-white w-full py-3 rounded-sm text-sm font-medium mt-5 hover:bg-opacity-90 transition-colors shadow-sm">
          {newUser ? 'Create account' : 'Sign in'} →
        </button>
        <button type="button"
          className="w-full text-center text-[#527063] hover:underline text-xs mt-3 block"
          onClick={() => { setNewUser(!newUser); setErr(''); }}
        >
          {newUser ? 'Already registered? Sign in' : 'New here? Create an account'}
        </button>
        <small className="block text-center text-[#888] text-[10px] mt-4 leading-relaxed border-t border-line/40 pt-3">
          Admin: admin@campus.edu / admin123
        </small>
      </form>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);