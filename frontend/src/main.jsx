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
  const [attendeeEvent, setAttendeeEvent] = useState(null);

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
        {view === 'discover' && <Discover events={events} user={user} enroll={enroll} deleteEvent={deleteEvent} openAttendees={setAttendeeEvent} />}
        {view === 'my-events' && <MyEvents user={user} />}
        {view === 'profile' && <Profile user={user} />}
        {view === 'admin' && <Admin refresh={refresh} events={events} openAttendees={setAttendeeEvent} deleteEvent={deleteEvent} />}
      </main>

      {attendeeEvent && (
        <AttendeeModal eventId={attendeeEvent} onClose={() => setAttendeeEvent(null)} />
      )}
    </>
  );
}

function Discover({ events, user, enroll, deleteEvent, openAttendees }) {
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
            <EventCard key={e.id} e={e} enroll={enroll} user={user} deleteEvent={deleteEvent} openAttendees={openAttendees} />
          ))}
        </div>
      </section>
    </>
  );
}

function EventCard({ e, enroll, user, deleteEvent, openAttendees }) {
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
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => openAttendees(e.id)}
                className="text-xs bg-lime text-ink font-bold px-2 py-1 rounded-xs hover:bg-white transition-colors flex items-center gap-1 shadow-xs"
                title="View registered student roster"
              >
                👥 {e.registered || 0}
              </button>
              <button
                type="button"
                onClick={() => deleteEvent(e.id)}
                className="text-xs text-[#ff9b8e] hover:text-white transition-colors border border-[#ff9b8e]/30 px-2 py-1 rounded-xs"
              >Delete</button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}


function GoldMedallionBadge({ className = "w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="goldShine" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fff6b8" />
          <stop offset="35%" stopColor="#dfb746" />
          <stop offset="70%" stopColor="#b88b20" />
          <stop offset="100%" stopColor="#876008" />
        </radialGradient>
        <linearGradient id="goldEdge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd875" />
          <stop offset="50%" stopColor="#b3871d" />
          <stop offset="100%" stopColor="#ffe699" />
        </linearGradient>
      </defs>
      {/* Laurel wreath dashed ring */}
      <circle cx="60" cy="60" r="56" stroke="url(#goldEdge)" strokeWidth="3" strokeDasharray="4,2.5" />
      <circle cx="60" cy="60" r="49" fill="url(#goldShine)" stroke="#6b4c05" strokeWidth="1" />
      <circle cx="60" cy="60" r="42" fill="none" stroke="#fae498" strokeWidth="1" strokeDasharray="3,1.5" />
      <text x="60" y="42" textAnchor="middle" fill="#3a2503" fontSize="12" fontWeight="800" fontFamily="sans-serif">[2026]</text>
      <text x="60" y="55" textAnchor="middle" fill="#3a2503" fontSize="6.5" fontWeight="700" letterSpacing="0.8" fontFamily="sans-serif">AUTHORIZED</text>
      <text x="60" y="65" textAnchor="middle" fill="#3a2503" fontSize="6.5" fontWeight="700" letterSpacing="0.8" fontFamily="sans-serif">DISTRIBUTOR</text>
      <text x="60" y="78" textAnchor="middle" fill="#4d3204" fontSize="10">★★★</text>
      <path d="M 34 82 Q 60 98 86 82" stroke="#4d3204" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function GreenQRCode({ className = "w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="#183d28" xmlns="http://www.w3.org/2000/svg">
      {/* Corner Square Top-Left */}
      <rect x="5" y="5" width="28" height="28" rx="2" fill="#183d28" />
      <rect x="10" y="10" width="18" height="18" rx="1.5" fill="#ffffff" />
      <rect x="14" y="14" width="10" height="10" rx="1" fill="#183d28" />

      {/* Corner Square Top-Right */}
      <rect x="67" y="5" width="28" height="28" rx="2" fill="#183d28" />
      <rect x="72" y="10" width="18" height="18" rx="1.5" fill="#ffffff" />
      <rect x="76" y="14" width="10" height="10" rx="1" fill="#183d28" />

      {/* Corner Square Bottom-Left */}
      <rect x="5" y="67" width="28" height="28" rx="2" fill="#183d28" />
      <rect x="10" y="72" width="18" height="18" rx="1.5" fill="#ffffff" />
      <rect x="14" y="76" width="10" height="10" rx="1" fill="#183d28" />

      {/* Data pattern blocks */}
      <rect x="38" y="8" width="6" height="6" />
      <rect x="48" y="8" width="6" height="6" />
      <rect x="56" y="8" width="6" height="6" />
      <rect x="38" y="18" width="6" height="6" />
      <rect x="48" y="22" width="6" height="6" />
      <rect x="8" y="38" width="6" height="6" />
      <rect x="18" y="44" width="6" height="6" />
      <rect x="26" y="38" width="6" height="6" />
      <rect x="38" y="38" width="8" height="8" />
      <rect x="50" y="42" width="6" height="6" />
      <rect x="60" y="38" width="6" height="6" />
      <rect x="72" y="40" width="6" height="6" />
      <rect x="84" y="38" width="8" height="8" />
      <rect x="40" y="52" width="6" height="6" />
      <rect x="50" y="54" width="8" height="8" />
      <rect x="62" y="50" width="6" height="6" />
      <rect x="76" y="54" width="6" height="6" />
      <rect x="86" y="50" width="6" height="6" />
      <rect x="38" y="68" width="6" height="6" />
      <rect x="48" y="68" width="8" height="8" />
      <rect x="60" y="72" width="6" height="6" />
      <rect x="70" y="68" width="6" height="6" />
      <rect x="82" y="74" width="8" height="8" />
      <rect x="40" y="84" width="8" height="8" />
      <rect x="56" y="84" width="6" height="6" />
      <rect x="68" y="82" width="6" height="6" />
      <rect x="80" y="86" width="6" height="6" />
    </svg>
  );
}


function MyEvents({ user }) {
  const [rows, setRows] = useState([]);
  const [cert, setCert] = useState(null);

  useEffect(() => { api('/registrations/' + user.id).then(setRows); }, [user]);

  if (cert) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#14231b]/85 backdrop-blur-xs p-2 sm:p-5 md:p-8 flex flex-col items-center justify-start sm:justify-center overflow-y-auto print:p-0 print:bg-white print:static">
        {/* Floating Toolbar */}
        <div className="w-full max-w-[960px] flex items-center justify-between gap-3 mb-2 sm:mb-3 print:hidden">
          <span className="text-xs font-mono text-white/80 bg-white/10 px-3 py-1.5 rounded-xs hidden sm:inline-block">
            Verified Event Credential · Official Certificate
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setCert(null)}
              className="bg-white/90 hover:bg-white text-ink text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xs shadow-sm transition-colors cursor-pointer"
            >
              ← Back
            </button>
            <button
              onClick={() => window.print()}
              className="bg-lime hover:bg-[#d9f07a] text-ink text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Certificate Container: matches user reference template with exact proportions */}
        <div className="w-full max-w-[960px] bg-white border border-[#cfd6d1] shadow-2xl relative flex flex-row overflow-hidden rounded-xs print:shadow-none print:border-0 print:w-full print:max-w-none print:rounded-none">
          
          {/* Left Vertical Dark Green Pillar */}
          <div className="w-3.5 sm:w-7 md:w-9 bg-[#183d28] shrink-0" />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col justify-between pl-3.5 pr-3.5 sm:pl-7 sm:pr-7 md:pl-9 md:pr-9 pt-4 sm:pt-6 md:pt-8 pb-0 relative bg-white">

            {/* Header: Title left, Gold Badge + QR right */}
            <div className="flex items-start justify-between gap-2 sm:gap-4">
              <div className="flex items-start gap-2 sm:gap-3">
                {/* Sage Indicator Bar */}
                <div className="w-1.5 sm:w-2 h-9 sm:h-12 md:h-14 bg-[#9fb88d] rounded-full shrink-0 mt-0.5" />
                <div>
                  <span className="font-sans text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.18em] text-[#33463b] block uppercase leading-tight">
                    AUTHORIZED
                  </span>
                  <h1 className="font-sans text-base sm:text-2xl md:text-3xl font-extrabold tracking-tight text-[#172b20] leading-tight uppercase mt-0.5 sm:mt-1">
                    DISTRIBUTOR CERTIFICATE
                  </h1>
                </div>
              </div>

              {/* Top-Right Badges: Gold Badge + Green QR Code */}
              <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                <GoldMedallionBadge className="w-11 h-11 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0" />
                <GreenQRCode className="w-9 h-9 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0" />
              </div>
            </div>

            {/* Recipient Section */}
            <div className="mt-3 sm:mt-5 md:mt-7">
              <p className="text-[11px] sm:text-xs md:text-sm text-[#5b6e62] font-medium mb-0.5 sm:mb-1">
                This certifies that
              </p>
              <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-sans text-[#183d28] tracking-tight leading-tight">
                [{user.name}]
              </h2>
            </div>

            {/* Blue-Bordered Content Box matching reference template */}
            <div className="mt-2.5 sm:mt-4 md:mt-5 p-2.5 sm:p-4 md:p-5 border border-[#3b82f6] bg-[#fcfdff] rounded-xs text-[10.5px] sm:text-xs md:text-sm text-[#1e2d25] leading-relaxed space-y-1.5 sm:space-y-2">
              <p>
                is an Authorized Participant for <strong>[{cert.title}]</strong> under the <strong>[Campus Circle]</strong> event catalog.
              </p>
              <p>
                This authorization applies exclusively to the attendance, technical workshops, and collaboration sessions of <strong>[{cert.title}]</strong> in <strong>[{cert.venue || 'Campus Auditorium'}]</strong> held on <strong>{cert.date}</strong> and does not extend to any other events from <strong>[Er. Perumal Manimekalai College of Engineering]</strong>.
              </p>
              <p className="text-[#59695f] text-[9.5px] sm:text-xs">
                All participation rights and responsibilities are outlined in the official event registry. Any unauthorized duplication of credentials under [Campus Circle] is strictly prohibited.
              </p>
            </div>

            {/* Signature Section on bottom right */}
            <div className="flex justify-end mt-3 sm:mt-4 md:mt-6 mb-3 sm:mb-4">
              <div className="text-center w-32 sm:w-44 md:w-48">
                <div className="h-8 sm:h-12 flex items-center justify-center relative">
                  <img
                    src="/signature.jpg"
                    alt="Signature"
                    className="h-8 sm:h-12 w-auto mix-blend-multiply contrast-125 brightness-105"
                  />
                </div>
                <div className="border-t border-[#183d28]/30 pt-1 mt-1">
                  <p className="text-[11px] sm:text-xs md:text-sm font-bold font-sans text-[#183d28] tracking-wider uppercase">
                    [Abhilash R]
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-[#5b6e62] uppercase tracking-wider font-medium">
                    [AUTHORIZED SIGNATORY]
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Sage Green Bar with Dark Green Accent Block */}
            <div className="-mx-3.5 sm:-mx-7 md:-mx-9 bg-[#9fb88d] py-2 sm:py-2.5 px-3.5 sm:px-7 md:px-9 flex items-center justify-between relative mt-auto">
              <span className="text-[9px] sm:text-[11px] font-mono text-[#183d28] font-bold tracking-wider">
                ID #{cert.id || '2026'} · DEPT OF IT
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] sm:text-xs md:text-sm font-mono font-bold text-[#183d28] mr-8 sm:mr-16">
                  [certificate.issued_on: {cert.date}]
                </span>
                {/* Dark green block accent at far bottom right corner */}
                <div className="w-7 sm:w-14 h-full bg-[#183d28] absolute right-0 top-0 bottom-0" />
              </div>
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

function Admin({ refresh, events, openAttendees, deleteEvent }) {
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

      {/* Event Rosters & Registrations */}
      <div className="mb-8 bg-paper p-5 sm:p-7 border border-line rounded-sm shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-line">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">Active Events & Attendee Rosters</h2>
            <p className="text-xs text-muted mt-0.5">Click any event's roster button to see registered students, student details, and export attendance.</p>
          </div>
          <span className="text-xs font-mono bg-[#e8ede1] text-ink px-2.5 py-1 rounded-xs font-semibold self-start sm:self-auto">
            {events?.length || 0} events
          </span>
        </div>
        {(!events || events.length === 0) ? (
          <p className="text-xs text-muted py-4">No events created yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {events.map((ev) => (
              <div key={ev.id} className="p-4 border border-[#e2e7dc] bg-[#fcfbf7] rounded-xs flex flex-col justify-between gap-3 hover:border-ink/30 transition-colors">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase bg-[#243b31] text-[#cfe870] px-2 py-0.5 rounded-xs font-semibold">
                      {ev.category}
                    </span>
                    <span className="text-xs text-muted font-mono">{ev.date}</span>
                  </div>
                  <h4 className="font-bold text-sm text-ink leading-snug">{ev.title}</h4>
                  <p className="text-xs text-muted mt-1">{ev.time} · {ev.venue}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-line/50">
                  <span className="text-xs font-medium text-[#4e5a54]">
                    Enrolled: <strong className="text-ink">{ev.registered || 0}</strong> / {ev.seats || 50}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openAttendees(ev.id)}
                      className="bg-lime text-ink hover:bg-[#d9f07a] text-xs font-bold px-3 py-1.5 rounded-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      👥 View Students ({ev.registered || 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteEvent(ev.id)}
                      className="text-xs text-[#ad3f33] hover:text-[#d32f2f] transition-colors border border-[#ad3f33]/30 px-2 py-1.5 rounded-xs cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

function AttendeeModal({ eventId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api('/events/' + eventId + '/registrations')
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [eventId]);

  const exportCSV = () => {
    if (!data?.students?.length) return;
    const headers = ['#', 'Name', 'Registration No', 'Department', 'Class', 'Email', 'Status', 'Registered At'];
    const rows = data.students.map((s, idx) => [
      idx + 1,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${s.reg_no || ''}"`,
      `"${s.department || ''}"`,
      `"${s.class || ''}"`,
      `"${s.email || ''}"`,
      `"${s.status || ''}"`,
      `"${s.registered_at || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendees_${(data.event?.title || 'event').replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = (data?.students || []).filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.reg_no || '').toLowerCase().includes(q) ||
      (s.department || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 bg-[#19201d]/60 backdrop-blur-xs z-50 grid place-items-center p-3 sm:p-5">
      <div className="bg-[#fffefa] w-full max-w-4xl p-5 sm:p-7 relative shadow-[10px_10px_0_#cfe870] border border-line rounded-sm max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-ink text-lime text-[11px] font-mono px-2 py-0.5 rounded-xs font-semibold uppercase">
                {data?.event?.category || 'Event'}
              </span>
              <span className="text-xs text-muted font-mono">Event #{eventId}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              {data?.event?.title || 'Registered Students'}
            </h2>
            {data?.event && (
              <p className="text-xs text-muted mt-1">
                📅 {data.event.date} · ⏰ {data.event.time} · 📍 {data.event.venue} · 💺 {data.total} / {data.event.seats || 50} enrolled
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink text-3xl leading-none font-bold p-1 cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Toolbar: Search + Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search by name, reg no, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-[#d5d8d0] rounded-xs text-xs bg-white focus:outline-none focus:ring-1 focus:ring-ink"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-[#e8ede1] text-ink px-3 py-2 rounded-xs font-semibold whitespace-nowrap">
              Enrolled: {filtered.length} {filtered.length === 1 ? 'student' : 'students'}
            </span>
            <button
              onClick={exportCSV}
              disabled={!data?.students?.length}
              className="bg-ink text-white hover:bg-opacity-90 disabled:opacity-40 text-xs px-3 py-2 rounded-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shadow-xs"
              title="Download CSV for attendance"
            >
              📥 Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="border border-line hover:bg-black/5 text-ink text-xs px-3 py-2 rounded-xs font-medium transition-colors cursor-pointer hidden sm:inline-flex"
            >
              🖨️ Print
            </button>
          </div>
        </div>

        {/* Content list / table */}
        <div className="flex-1 overflow-y-auto border border-line rounded-xs">
          {loading ? (
            <div className="py-16 text-center text-muted text-sm flex flex-col items-center gap-3">
              <span className="inline-block w-6 h-6 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
              Loading student roster…
            </div>
          ) : error ? (
            <div className="py-12 text-center text-[#c62828] text-sm px-4">
              Error: {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted text-sm px-4">
              {search ? 'No registered students match your search.' : 'No students have registered for this event yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[620px]">
                <thead className="bg-[#f0f3eb] text-ink font-semibold sticky top-0 border-b border-line font-mono text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Reg No</th>
                    <th className="p-3">Dept & Class</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Registered At</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {filtered.map((s, idx) => (
                    <tr key={s.user_id + '-' + idx} className="hover:bg-black/[0.02] transition-colors">
                      <td className="p-3 text-center text-muted font-mono">{idx + 1}</td>
                      <td className="p-3 font-semibold text-ink flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-ink text-lime text-xs font-bold inline-grid place-items-center flex-shrink-0">
                          {(s.name || 'S').charAt(0).toUpperCase()}
                        </span>
                        <span>{s.name}</span>
                      </td>
                      <td className="p-3 font-mono font-medium text-[#3b4640]">{s.reg_no}</td>
                      <td className="p-3 text-muted">{s.department} · {s.class}</td>
                      <td className="p-3 font-mono text-[#4a5568]">{s.email}</td>
                      <td className="p-3 text-muted whitespace-nowrap">{s.registered_at}</td>
                      <td className="p-3 text-center">
                        <span className="inline-block bg-[#e8ede1] text-[#243b31] font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-4 mt-2 flex items-center justify-between text-xs text-muted border-t border-line">
          <span>Campus Circle · Event Office Attendance Roster</span>
          <button
            onClick={onClose}
            className="bg-[#243b31] text-white px-4 py-1.5 rounded-xs hover:bg-opacity-90 font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
