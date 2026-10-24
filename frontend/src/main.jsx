import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const api = (path, opts = {}) =>
  fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  }).then(async (r) => {
    let d = await r.json();
    if (!r.ok) throw new Error(d.error || 'Request failed');
    return d;
  });

const icons = {
  Workshop: '✦',
  Technical: '⌘',
  Cultural: '♫',
  Placement: '↗',
  Seminar: '◎',
};

// ── Floating Toast Notification ─────────────────────────────────────────────
function Toast({ toast, onClose }) {
  if (!toast) return null;
  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed bottom-5 right-5 z-[150] max-w-sm w-full bg-[#1e2e26] text-white p-4 rounded-sm shadow-2xl border-l-4 border-lime flex items-start justify-between gap-3 animate-bounce-short">
      <div className="flex items-start gap-2.5">
        <span className="text-lg leading-none mt-0.5">
          {isError ? '⚠️' : isSuccess ? '✓' : 'ℹ️'}
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#cfe870] font-mono">
            {isError ? 'Notice' : isSuccess ? 'Success' : 'Information'}
          </p>
          <p className="text-xs text-[#e1e9e3] mt-0.5 leading-relaxed">{toast.message}</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="text-[#9bb1a3] hover:text-white text-base leading-none font-bold p-0.5"
      >
        ×
      </button>
    </div>
  );
}

// ── Custom In-App Confirmation Modal ─────────────────────────────────────────
function ConfirmModal({ isOpen, title, message, confirmText = 'Confirm', danger = false, requireWord, onConfirm, onCancel }) {
  const [typed, setTyped] = useState('');
  if (!isOpen) return null;

  const canConfirm = requireWord ? typed.trim().toUpperCase() === requireWord.toUpperCase() : true;

  return (
    <div className="fixed inset-0 bg-[#14231b]/75 backdrop-blur-xs z-[160] grid place-items-center p-4">
      <div className="bg-[#fffefa] w-full max-w-md p-6 rounded-sm shadow-[10px_10px_0_#cfe870] border border-line animate-fade-in">
        <div className="flex items-center gap-2 mb-2 text-[#ad3f33]">
          <span className="text-xl">⚠️</span>
          <h3 className="font-serif text-xl font-bold tracking-tight text-ink">{title}</h3>
        </div>
        <p className="text-xs sm:text-sm text-[#4e5a54] leading-relaxed mb-4">{message}</p>

        {requireWord && (
          <div className="mb-4 bg-[#fbf5f4] p-3 border border-[#f0c2bc] rounded-xs">
            <p className="text-xs text-[#ad3f33] font-semibold mb-1">
              Type <span className="font-mono bg-white px-1.5 py-0.5 border border-[#ad3f33]/40 rounded-xs">{requireWord}</span> to confirm:
            </p>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={`Type "${requireWord}"`}
              className="w-full text-xs p-2 border border-[#d5d8d0] rounded-xs font-mono uppercase focus:ring-1 focus:ring-[#ad3f33] focus:outline-none bg-white"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-line/60">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-line text-xs font-medium rounded-xs hover:bg-black/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => { onConfirm(); setTyped(''); }}
            className={`px-4 py-2 text-xs font-bold rounded-xs transition-colors shadow-xs cursor-pointer ${
              danger
                ? 'bg-[#ad3f33] text-white hover:bg-[#c62828] disabled:opacity-40 disabled:cursor-not-allowed'
                : 'bg-ink text-white hover:bg-opacity-90'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Medallion Badge SVG ───────────────────────────────────────────────────────
function GoldMedallionBadge({ className = "w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" }) {
  return (
    <svg viewBox="0 0 120 120" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldShine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f3d06a" />
          <stop offset="40%" stopColor="#dca738" />
          <stop offset="70%" stopColor="#fae498" />
          <stop offset="100%" stopColor="#b88319" />
        </linearGradient>
        <radialGradient id="goldEdge" cx="50%" cy="50%" r="50%">
          <stop offset="85%" stopColor="#dca738" />
          <stop offset="100%" stopColor="#875806" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="56" stroke="url(#goldEdge)" strokeWidth="3" strokeDasharray="4,2.5" />
      <circle cx="60" cy="60" r="49" fill="url(#goldShine)" stroke="#6b4c05" strokeWidth="1" />
      <circle cx="60" cy="60" r="42" fill="none" stroke="#fae498" strokeWidth="1" strokeDasharray="3,1.5" />
      <text x="60" y="42" textAnchor="middle" fill="#3a2503" fontSize="12" fontWeight="800" fontFamily="sans-serif">2026</text>
      <text x="60" y="55" textAnchor="middle" fill="#3a2503" fontSize="6.5" fontWeight="700" letterSpacing="0.8" fontFamily="sans-serif">AUTHORIZED</text>
      <text x="60" y="65" textAnchor="middle" fill="#3a2503" fontSize="6.5" fontWeight="700" letterSpacing="0.8" fontFamily="sans-serif">DISTRIBUTOR</text>
      <text x="60" y="78" textAnchor="middle" fill="#4d3204" fontSize="10">★★★</text>
      <path d="M 34 82 Q 60 98 86 82" stroke="#4d3204" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ── QR Code SVG ─────────────────────────────────────────────────────────────
function GreenQRCode({ className = "w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="#183d28" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="28" height="28" rx="2" fill="#183d28" />
      <rect x="10" y="10" width="18" height="18" rx="1.5" fill="#ffffff" />
      <rect x="14" y="14" width="10" height="10" rx="1" fill="#183d28" />
      <rect x="67" y="5" width="28" height="28" rx="2" fill="#183d28" />
      <rect x="72" y="10" width="18" height="18" rx="1.5" fill="#ffffff" />
      <rect x="76" y="14" width="10" height="10" rx="1" fill="#183d28" />
      <rect x="5" y="67" width="28" height="28" rx="2" fill="#183d28" />
      <rect x="10" y="72" width="18" height="18" rx="1.5" fill="#ffffff" />
      <rect x="14" y="76" width="10" height="10" rx="1" fill="#183d28" />
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

// ── Official Credential Modal ───────────────────────────────────────────────
function CertificateModal({ cert, user, onClose }) {
  if (!cert) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#14231b]/85 backdrop-blur-xs p-2 sm:p-5 md:p-8 flex flex-col items-center justify-start sm:justify-center overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="w-full max-w-[960px] flex items-center justify-between gap-3 mb-2 sm:mb-3 print:hidden">
        <span className="text-xs font-mono text-white/80 bg-white/10 px-3 py-1.5 rounded-xs hidden sm:inline-block">
          Verified Event Credential · Official Certificate
        </span>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onClose}
            className="bg-white/90 hover:bg-white text-ink text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-xs shadow-sm transition-colors cursor-pointer"
          >
            ← Back
          </button>
          <button
            onClick={() => window.print()}
            className="bg-lime hover:bg-[#d9f07a] text-ink text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / Save PDF
          </button>
        </div>
      </div>

      <div className="w-full max-w-[960px] bg-white border border-[#cfd6d1] shadow-2xl relative flex flex-row overflow-hidden rounded-xs print:shadow-none print:border-0 print:w-full print:max-w-none print:rounded-none">
        <div className="w-3.5 sm:w-7 md:w-9 bg-[#183d28] shrink-0" />

        <div className="flex-1 flex flex-col justify-between pl-3.5 pr-3.5 sm:pl-7 sm:pr-7 md:pl-9 md:pr-9 pt-4 sm:pt-6 md:pt-8 pb-0 relative bg-white">
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            <div className="flex items-start gap-2 sm:gap-3">
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

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <GoldMedallionBadge className="w-11 h-11 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0" />
              <GreenQRCode className="w-9 h-9 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0" />
            </div>
          </div>

          <div className="mt-3 sm:mt-5 md:mt-7">
            <p className="text-[11px] sm:text-xs md:text-sm text-[#5b6e62] font-medium mb-0.5 sm:mb-1">
              This certifies that
            </p>
            <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-sans text-[#183d28] tracking-tight leading-tight">
              {user.name}
            </h2>
          </div>

          <div className="mt-2.5 sm:mt-4 md:mt-5 p-2.5 sm:p-4 md:p-5 border border-[#3b82f6] bg-[#fcfdff] rounded-xs text-[10.5px] sm:text-xs md:text-sm text-[#1e2d25] leading-relaxed space-y-1.5 sm:space-y-2">
            <p>
              is an Authorized Participant for <strong>{cert.title}</strong> under the <strong>Campus Circle</strong> event catalog.
            </p>
            <p>
              This authorization applies exclusively to the attendance, technical workshops, and collaboration sessions of <strong>{cert.title}</strong> in <strong>{cert.venue || 'Campus Auditorium'}</strong> held on <strong>{cert.date}</strong> and does not extend to any other events from <strong>Er. Perumal Manimekalai College of Engineering</strong>.
            </p>
            <p className="text-[#59695f] text-[9.5px] sm:text-xs">
              All participation rights and responsibilities are outlined in the official event registry. Any unauthorized duplication of credentials under Campus Circle is strictly prohibited.
            </p>
          </div>

          <div className="flex justify-end mt-2 sm:mt-4 md:mt-6 mb-3 sm:mb-4">
            <div className="text-center w-36 sm:w-52 md:w-56">
              <div className="h-14 sm:h-20 md:h-24 flex items-end justify-center pb-1 relative">
                <img
                  src="/signature.png"
                  alt="Signature"
                  className="h-12 sm:h-18 md:h-22 w-auto max-w-full object-contain pointer-events-none select-none"
                />
              </div>
              <div className="border-t border-[#183d28]/35 pt-1 mt-0">
                <p className="text-[11px] sm:text-xs md:text-sm font-bold font-sans text-[#183d28] tracking-wider uppercase">
                  Abhilash R
                </p>
                <p className="text-[9px] sm:text-[10px] text-[#5b6e62] uppercase tracking-wider font-medium">
                  Authorized Signatory
                </p>
              </div>
            </div>
          </div>

          <div className="-mx-3.5 sm:-mx-7 md:-mx-9 bg-[#9fb88d] py-2 sm:py-2.5 px-3.5 sm:px-7 md:px-9 flex items-center justify-between relative mt-auto">
            <span className="text-[9px] sm:text-[11px] font-mono text-[#183d28] font-bold tracking-wider">
              ID #{cert.id || '2026'} · DEPT OF IT
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] sm:text-xs md:text-sm font-mono font-bold text-[#183d28] mr-8 sm:mr-16">
                Issued on: {cert.date}
              </span>
              <div className="w-7 sm:w-14 h-full bg-[#183d28] absolute right-0 top-0 bottom-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Event Detail Drawer / Modal ─────────────────────────────────────────────
function EventDetailModal({ event, user, onEnroll, onCancelEnroll, onClose, openCertificate }) {
  if (!event) return null;

  const totalSeats = event.seats || 50;
  const registeredCount = event.registered || 0;
  const seatsLeft = Math.max(0, totalSeats - registeredCount);
  const percentFilled = Math.min(100, Math.round((registeredCount / totalSeats) * 100));

  return (
    <div className="fixed inset-0 bg-[#14231b]/65 backdrop-blur-xs z-50 grid place-items-center p-3 sm:p-5">
      <div className="bg-[#fffefa] w-full max-w-2xl p-6 sm:p-8 rounded-sm shadow-[10px_10px_0_#cfe870] border border-line max-h-[92vh] overflow-y-auto relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute right-4 top-3 text-muted hover:text-ink text-2xl font-bold cursor-pointer"
        >
          ×
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-xs uppercase bg-[#243b31] text-[#cfe870] px-2.5 py-0.5 rounded-xs font-semibold">
            {event.category}
          </span>
          <span className="text-xs text-muted font-mono">Event #{event.id}</span>
          {event.is_registered && (
            <span className="bg-[#d4edda] text-[#155724] text-xs px-2 py-0.5 rounded-full font-bold">
              ✓ Registered
            </span>
          )}
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink mb-2">
          {event.title}
        </h2>

        {/* Schedule grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 p-3.5 bg-[#f5f7f3] border border-line/60 rounded-xs text-xs">
          <div>
            <span className="text-muted block text-[10px] font-mono uppercase">Date</span>
            <strong className="text-ink text-xs">{event.date}</strong>
          </div>
          <div>
            <span className="text-muted block text-[10px] font-mono uppercase">Time</span>
            <strong className="text-ink text-xs">{event.time}</strong>
          </div>
          <div>
            <span className="text-muted block text-[10px] font-mono uppercase">Venue</span>
            <strong className="text-ink text-xs">{event.venue}</strong>
          </div>
          <div>
            <span className="text-muted block text-[10px] font-mono uppercase">Deadline</span>
            <strong className="text-ink text-xs">{event.deadline || 'Same day'}</strong>
          </div>
        </div>

        {/* Capacity Indicator */}
        <div className="mb-5 bg-paper p-3.5 border border-line/70 rounded-xs">
          <div className="flex items-center justify-between text-xs font-medium mb-1.5">
            <span className="text-[#3a4941]">
              Capacity: <strong>{registeredCount}</strong> / {totalSeats} seats filled
            </span>
            <span className={seatsLeft <= 5 ? 'text-[#ad3f33] font-bold' : 'text-[#4d7958] font-bold'}>
              {seatsLeft === 0 ? 'Fully Booked' : `${seatsLeft} spots remaining`}
            </span>
          </div>
          <div className="w-full bg-[#dbe2dc] h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                percentFilled > 90 ? 'bg-[#ad3f33]' : percentFilled > 60 ? 'bg-[#e5a93b]' : 'bg-[#243b31]'
              }`}
              style={{ width: `${percentFilled}%` }}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3 mb-6 text-sm text-[#38433e] leading-relaxed">
          <h4 className="font-bold text-xs font-mono uppercase tracking-wider text-muted">About this event</h4>
          <p className="whitespace-pre-line">{event.description || 'No detailed description provided.'}</p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-line flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-xs px-4 py-2 border border-line rounded-xs hover:bg-black/5 font-medium transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {event.is_registered ? (
              <>
                <button
                  onClick={() => openCertificate(event)}
                  className="bg-lime text-ink text-xs font-bold px-4 py-2.5 rounded-xs hover:bg-[#d9f07a] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  🎖️ Certificate
                </button>
                <button
                  onClick={() => onCancelEnroll(event.id)}
                  className="text-xs text-[#ad3f33] hover:text-white hover:bg-[#ad3f33] border border-[#ad3f33]/40 px-3 py-2 rounded-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel Registration
                </button>
              </>
            ) : (
              <button
                disabled={seatsLeft === 0}
                onClick={() => onEnroll(event.id)}
                className="bg-ink text-white text-xs font-bold px-5 py-2.5 rounded-xs hover:bg-opacity-90 disabled:opacity-40 transition-colors shadow-sm disabled:cursor-not-allowed cursor-pointer"
              >
                {seatsLeft === 0 ? 'Full' : 'Reserve Your Seat →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Edit Event Modal (Admin) ────────────────────────────────────────────────
function EditEventModal({ event, onClose, onSaved }) {
  const [form, setForm] = useState({ ...event });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  if (!event) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr('');
    try {
      const updated = await api(`/events/${event.id}`, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      onSaved(updated);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#14231b]/65 backdrop-blur-xs z-50 grid place-items-center p-3 sm:p-5">
      <form
        onSubmit={handleSubmit}
        className="bg-[#fffefa] w-full max-w-xl p-6 sm:p-8 rounded-sm shadow-[10px_10px_0_#cfe870] border border-line max-h-[92vh] overflow-y-auto animate-fade-in"
      >
        <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
          <div>
            <span className="font-mono text-xs uppercase bg-[#243b31] text-[#cfe870] px-2 py-0.5 rounded-xs font-semibold">
              Event #{event.id}
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-ink mt-1">
              Edit Event Listing
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-2xl text-muted hover:text-ink font-bold cursor-pointer">
            ×
          </button>
        </div>

        {err && <p className="text-xs text-[#ad3f33] mb-3 bg-[#fbf5f4] p-2 border border-[#f0c2bc] rounded-xs">{err}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
          <label className="sm:col-span-2 text-xs font-semibold text-[#4e5a54] flex flex-col gap-1">
            Event title
            <input
              required
              value={form.title || ''}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="border border-[#d5d8d0] p-2 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-[#4e5a54] flex flex-col gap-1">
            Category
            <select
              value={form.category || 'Workshop'}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border border-[#d5d8d0] p-2 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none"
            >
              {['Workshop', 'Technical', 'Cultural', 'Placement', 'Seminar'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-[#4e5a54] flex flex-col gap-1">
            Total capacity (Seats)
            <input
              required
              type="number"
              min="1"
              value={form.seats || 50}
              onChange={(e) => setForm({ ...form, seats: parseInt(e.target.value, 10) || 50 })}
              className="border border-[#d5d8d0] p-2 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-[#4e5a54] flex flex-col gap-1">
            Date
            <input
              required
              type="date"
              value={form.date || ''}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="border border-[#d5d8d0] p-2 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-[#4e5a54] flex flex-col gap-1">
            Time
            <input
              required
              value={form.time || ''}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="border border-[#d5d8d0] p-2 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-[#4e5a54] flex flex-col gap-1">
            Venue
            <input
              required
              value={form.venue || ''}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              className="border border-[#d5d8d0] p-2 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-[#4e5a54] flex flex-col gap-1">
            Registration deadline
            <input
              required
              type="date"
              value={form.deadline || ''}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="border border-[#d5d8d0] p-2 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none"
            />
          </label>
          <label className="sm:col-span-2 text-xs font-semibold text-[#4e5a54] flex flex-col gap-1">
            Description
            <textarea
              rows="3"
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="border border-[#d5d8d0] p-2 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none"
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-4 py-2 border border-line rounded-xs hover:bg-black/5 font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-ink text-white text-xs font-bold px-5 py-2 rounded-xs hover:bg-opacity-90 transition-colors shadow-xs cursor-pointer"
          >
            {saving ? 'Saving changes…' : 'Save Changes →'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Attendee Modal (Admin) with Attendance Toggle & Unenroll ────────────────
function AttendeeModal({ eventId, onClose, notify }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadData = () => {
    setLoading(true);
    api('/events/' + eventId + '/registrations')
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { loadData(); }, [eventId]);

  const toggleAttendance = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'Attended' ? 'Confirmed' : 'Attended';
    try {
      await api(`/events/${eventId}/registrations/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      notify(`Status updated to ${nextStatus}`, 'success');
      loadData();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const removeStudent = async (userId, studentName) => {
    if (!window.confirm(`Remove ${studentName} from this event roster?`)) return;
    try {
      await api(`/events/${eventId}/registrations/${userId}`, { method: 'DELETE' });
      notify(`${studentName} removed from roster.`, 'success');
      loadData();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const exportCSV = () => {
    if (!data?.students?.length) return;
    const headers = ['#', 'Name', 'Registration No', 'Department', 'Class', 'Phone', 'Email', 'Status', 'Registered At'];
    const rows = data.students.map((s, idx) => [
      idx + 1,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${s.reg_no || ''}"`,
      `"${s.department || ''}"`,
      `"${s.class || ''}"`,
      `"${s.phone || ''}"`,
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
      <div className="bg-[#fffefa] w-full max-w-4xl p-5 sm:p-7 relative shadow-[10px_10px_0_#cfe870] border border-line rounded-sm max-h-[92vh] flex flex-col animate-fade-in">
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

        <div className="flex-1 overflow-y-auto border border-line rounded-xs">
          {loading ? (
            <div className="py-16 text-center text-muted text-sm flex flex-col items-center gap-3">
              <span className="inline-block w-6 h-6 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
              Loading student roster…
            </div>
          ) : error ? (
            <div className="py-12 text-center text-[#c62828] text-sm px-4">Error: {error}</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted text-sm px-4">
              {search ? 'No registered students match your search.' : 'No students have registered for this event yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[680px]">
                <thead className="bg-[#f0f3eb] text-ink font-semibold sticky top-0 border-b border-line font-mono text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Reg No</th>
                    <th className="p-3">Dept & Class</th>
                    <th className="p-3">Email & Phone</th>
                    <th className="p-3">Registered At</th>
                    <th className="p-3 text-center">Attendance Status</th>
                    <th className="p-3 text-right">Actions</th>
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
                      <td className="p-3 font-mono text-[#4a5568]">
                        <div>{s.email}</div>
                        {s.phone && <div className="text-[10px] text-muted">{s.phone}</div>}
                      </td>
                      <td className="p-3 text-muted whitespace-nowrap">{s.registered_at}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleAttendance(s.user_id, s.status)}
                          className={`inline-flex items-center gap-1 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider transition-colors cursor-pointer ${
                            s.status === 'Attended'
                              ? 'bg-[#d4edda] text-[#155724] hover:bg-[#c3e6cb]'
                              : 'bg-[#e8ede1] text-[#243b31] hover:bg-lime hover:text-ink'
                          }`}
                          title="Click to toggle Present/Attended status"
                        >
                          {s.status === 'Attended' ? '✓ Attended' : s.status || 'Confirmed'}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => removeStudent(s.user_id, s.name)}
                          className="text-[#ad3f33] hover:text-[#d32f2f] text-xs font-medium border border-[#ad3f33]/30 hover:border-[#ad3f33] px-2 py-1 rounded-xs transition-colors cursor-pointer"
                          title="Unenroll student from this event"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="pt-4 mt-2 flex items-center justify-between text-xs text-muted border-t border-line">
          <span>Click on status pill to toggle student attendance credential.</span>
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

// ── Discover Component ──────────────────────────────────────────────────────
function Discover({ events, user, enroll, cancelEnroll, openDetail, openAttendees, deleteEvent, editEvent }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [rec, setRec] = useState([]);

  useEffect(() => {
    if (user?.role === 'student') api('/recommendations/' + user.id).then(setRec).catch(() => {});
  }, [user]);

  let list = filter === 'All' ? events : events.filter((e) => e.category === filter);

  if (search.trim()) {
    const q = search.toLowerCase();
    list = list.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.venue || '').toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    );
  }

  if (sortBy === 'popular') {
    list = [...list].sort((a, b) => (b.registered || 0) - (a.registered || 0));
  } else if (sortBy === 'seats') {
    list = [...list].sort((a, b) => (b.seats - (b.registered || 0)) - (a.seats - (a.registered || 0)));
  }

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
            Discover college workshops, hackathons, seminars and cultural events — with instant registration and certified credentials.
          </p>
          <button
            className="bg-ink text-white px-5 py-3 rounded-sm text-sm font-medium mt-5 inline-flex items-center gap-3 hover:bg-opacity-90 transition-all shadow-md group cursor-pointer"
            onClick={() => document.querySelector('#events')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Explore events <b className="text-lime transition-transform group-hover:translate-x-1">→</b>
          </button>
        </div>

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
              <button
                key={e.id}
                onClick={() => openDetail(e)}
                className="bg-[#f7f8f2] px-3 py-2 rounded-sm text-sm font-medium shadow-xs flex items-center gap-2 hover:bg-white cursor-pointer transition-colors"
              >
                <span className="text-ink">{icons[e.category]}</span> {e.title}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Events section */}
      <section id="events" className="max-w-[1180px] mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <p className="font-mono tracking-widest text-[#76817b] text-xs uppercase mb-1">WHAT'S ON</p>
            <h2 className="font-serif text-3xl md:text-4xl tracking-tight">Upcoming on campus</h2>
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs">🔍</span>
              <input
                type="text"
                placeholder="Search events, topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 border border-[#d5d8d0] rounded-xs text-xs bg-white focus:outline-none focus:ring-1 focus:ring-ink w-full sm:w-48"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2 px-3 border border-[#d5d8d0] rounded-xs text-xs bg-white focus:outline-none focus:ring-1 focus:ring-ink text-muted font-medium"
            >
              <option value="date">Sort: Upcoming Date</option>
              <option value="popular">Sort: Most Popular</option>
              <option value="seats">Sort: Seats Remaining</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {['All', 'Workshop', 'Technical', 'Cultural', 'Placement', 'Seminar'].map((x) => {
            const count = x === 'All' ? events.length : events.filter((e) => e.category === x).length;
            return (
              <button
                key={x}
                onClick={() => setFilter(x)}
                className={`text-xs px-3 py-1.5 rounded-sm transition-colors font-medium flex items-center gap-1.5 cursor-pointer ${
                  filter === x
                    ? 'bg-[#243b31] text-[#cfe870] font-semibold shadow-xs'
                    : 'text-[#68716c] hover:bg-black/5 bg-[#f0f3eb]'
                }`}
              >
                <span>{x}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {list.length === 0 ? (
          <div className="bg-[#ebeee7] p-10 text-center text-muted rounded-sm text-sm border border-line/50">
            No events match your current search or filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {list.map((e) => (
              <EventCard
                key={e.id}
                e={e}
                enroll={enroll}
                cancelEnroll={cancelEnroll}
                user={user}
                deleteEvent={deleteEvent}
                editEvent={editEvent}
                openAttendees={openAttendees}
                openDetail={openDetail}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

// ── Event Card ──────────────────────────────────────────────────────────────
function EventCard({ e, enroll, cancelEnroll, user, deleteEvent, editEvent, openAttendees, openDetail }) {
  const bgClasses = {
    Technical: 'bg-[#263f53]',
    Cultural:  'bg-[#894f41]',
    Placement: 'bg-[#705d31]',
    Seminar:   'bg-[#526b68]',
    Workshop:  'bg-[#30483f]',
  };
  const categoryBg = bgClasses[e.category] || 'bg-[#30483f]';
  const totalSeats = e.seats || 50;
  const registeredCount = e.registered || 0;
  const seatsLeft = Math.max(0, totalSeats - registeredCount);

  return (
    <article
      className={`h-[300px] relative p-5 rounded-sm overflow-hidden text-white ${categoryBg} transition-all hover:-translate-y-1 shadow-md flex flex-col justify-between group`}
    >
      <div className="flex justify-between items-start font-mono text-[10px] uppercase tracking-wider">
        <span className="font-semibold opacity-90">{e.category}</span>
        <div className="flex items-center gap-1.5">
          <span className="bg-white/15 px-2 py-0.5 rounded-xs backdrop-blur-xs">
            {new Date(e.date + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <span className="bg-black/25 px-1.5 py-0.5 rounded-xs font-mono text-[9px]">
            {seatsLeft === 0 ? 'FULL' : `${seatsLeft} left`}
          </span>
        </div>
      </div>

      <div
        onClick={() => openDetail(e)}
        className="font-serif text-6xl text-lime my-auto opacity-90 transition-transform group-hover:scale-105 cursor-pointer select-none"
      >
        {icons[e.category]}
      </div>

      <div className="space-y-1.5">
        <h3
          onClick={() => openDetail(e)}
          className="text-lg sm:text-xl font-bold tracking-tight leading-snug cursor-pointer hover:underline"
        >
          {e.title}
        </h3>
        <p className="text-xs text-[#dbe2dc] pb-0.5">{e.time} · {e.venue}</p>

        <div className="flex justify-between items-center pt-2 border-t border-white/20">
          <button
            onClick={() => (e.is_registered ? openDetail(e) : enroll(e.id))}
            className="text-xs border-b border-lime pb-0.5 text-white font-medium hover:text-lime transition-colors cursor-pointer"
          >
            {e.is_registered ? '✓ Enrolled · View →' : 'View & register →'}
          </button>

          {user?.role === 'admin' && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => openAttendees(e.id)}
                className="text-xs bg-lime text-ink font-bold px-2 py-1 rounded-xs hover:bg-white transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                title="View registered student roster"
              >
                👥 {registeredCount}
              </button>
              <button
                type="button"
                onClick={() => editEvent(e)}
                className="text-xs text-white/90 hover:text-white border border-white/30 px-2 py-1 rounded-xs transition-colors cursor-pointer"
                title="Edit event"
              >
                ✏️
              </button>
              <button
                type="button"
                onClick={() => deleteEvent(e.id)}
                className="text-xs text-[#ff9b8e] hover:text-white border border-[#ff9b8e]/40 px-2 py-1 rounded-xs transition-colors cursor-pointer"
                title="Delete event"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ── My Events (Student Plans & Credentials) ─────────────────────────────────
function MyEvents({ user, cancelEnroll, notify }) {
  const [rows, setRows] = useState([]);
  const [cert, setCert] = useState(null);
  const [tab, setTab] = useState('all');

  const loadPlans = () => {
    api('/registrations/' + user.id).then(setRows).catch((e) => notify(e.message, 'error'));
  };

  useEffect(() => { loadPlans(); }, [user]);

  const handleCancel = async (eventId, eventTitle) => {
    if (!window.confirm(`Cancel your registration for "${eventTitle}"? This will free up your seat.`)) return;
    try {
      await api(`/events/${eventId}/registrations/${user.id}`, { method: 'DELETE' });
      notify('Registration cancelled.', 'info');
      loadPlans();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const filteredRows = rows.filter((r) => {
    if (tab === 'upcoming') return r.date >= todayStr;
    if (tab === 'completed') return r.date < todayStr || r.status === 'Attended';
    return true;
  });

  return (
    <>
      {cert && <CertificateModal cert={cert} user={user} onClose={() => setCert(null)} />}

      <section className="max-w-[1180px] mx-auto px-4 sm:px-6 py-10 md:py-16 min-h-[75vh]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <p className="font-mono tracking-widest text-[#76817b] text-xs uppercase mb-1">YOUR PLANS</p>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight">My events</h1>
          </div>

          <div className="flex items-center gap-1.5 bg-[#f0f3eb] p-1 rounded-sm border border-line">
            {[
              ['all', 'All Plans'],
              ['upcoming', 'Upcoming'],
              ['completed', 'Completed & Attended'],
            ].map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`text-xs px-3 py-1.5 rounded-xs font-medium transition-colors cursor-pointer ${
                  tab === k ? 'bg-ink text-white font-semibold shadow-xs' : 'text-[#68716c] hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filteredRows.length ? (
          <div className="border-t border-line max-w-4xl divide-y divide-line">
            {filteredRows.map((r) => (
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

                <div className="flex items-center gap-2.5 ml-14 sm:ml-0">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    r.status === 'Attended' ? 'bg-[#d4edda] text-[#155724]' : 'bg-[#e8ede1] text-[#243b31]'
                  }`}>
                    <span className="text-[10px]">●</span> {r.status}
                  </span>

                  <button
                    onClick={() => setCert(r)}
                    className="text-xs bg-lime hover:bg-[#d9f07a] text-ink font-bold px-3 py-1.5 rounded-xs transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
                    title="View and print official verified certificate"
                  >
                    🎖️ Certificate
                  </button>

                  <button
                    onClick={() => handleCancel(r.id, r.title)}
                    className="text-xs text-[#ad3f33] hover:text-[#d32f2f] border border-[#ad3f33]/30 px-2.5 py-1.5 rounded-xs transition-colors cursor-pointer"
                    title="Cancel event registration"
                  >
                    Cancel
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-[#ebeee7] max-w-xl p-6 sm:p-8 text-muted rounded-sm text-sm leading-relaxed border border-line/50">
            {tab === 'upcoming'
              ? 'No upcoming events booked. Explore upcoming campus events to reserve your spot.'
              : 'Nothing found in this view. Browse upcoming events to participate.'}
          </div>
        )}
      </section>
    </>
  );
}

// ── Profile (Student & Admin Profile with In-Place Edit) ─────────────────────
function Profile({ user, onUserUpdated, notify }) {
  const [data, setData] = useState(user);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...user });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    api('/me/' + user.id).then((d) => { setData(d); setForm(d); }).catch((e) => setErr(e.message));
  }, [user.id]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr('');
    try {
      const updated = await api('/me/' + user.id, {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      setData(updated);
      setEditing(false);
      onUserUpdated(updated);
      notify('Profile updated successfully.', 'success');
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const rows = [
    ['Full name', data.name],
    ['Email', data.email],
    ['Registration number', data.reg_no],
    ['Department', data.department],
    ['Class / Year', data.class],
    ['Phone Number', data.phone || '—'],
    ['Interests', data.interests || 'General'],
    ['Account Role', data.role?.toUpperCase()],
  ];

  return (
    <section className="max-w-[1180px] mx-auto px-4 sm:px-6 py-10 md:py-16 min-h-[75vh]">
      <div className="flex items-center justify-between max-w-xl mb-6">
        <div>
          <p className="font-mono tracking-widest text-[#76817b] text-xs uppercase mb-1">YOUR ACCOUNT</p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight">Profile</h1>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs bg-ink text-white px-4 py-2 rounded-xs font-medium hover:bg-opacity-90 transition-colors cursor-pointer"
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {err && <p className="text-[#ad3f33] text-sm mb-4 max-w-xl">{err}</p>}

      {editing ? (
        <form onSubmit={saveProfile} className="bg-paper border border-line rounded-sm p-6 max-w-xl shadow-sm space-y-4">
          <h3 className="font-serif text-xl font-bold text-ink pb-2 border-b border-line">Edit Profile Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="sm:col-span-2 text-xs font-semibold text-[#4e5a54]">
              Full Name
              <input
                required
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-[#d5d8d0] p-2.5 mt-1 bg-white rounded-xs text-sm"
              />
            </label>
            <label className="text-xs font-semibold text-[#4e5a54]">
              Registration Number
              <input
                value={form.reg_no || ''}
                onChange={(e) => setForm({ ...form, reg_no: e.target.value })}
                className="w-full border border-[#d5d8d0] p-2.5 mt-1 bg-white rounded-xs text-sm font-mono"
              />
            </label>
            <label className="text-xs font-semibold text-[#4e5a54]">
              Department
              <input
                value={form.department || ''}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full border border-[#d5d8d0] p-2.5 mt-1 bg-white rounded-xs text-sm"
              />
            </label>
            <label className="text-xs font-semibold text-[#4e5a54]">
              Class / Section
              <input
                value={form.class || ''}
                onChange={(e) => setForm({ ...form, class: e.target.value })}
                className="w-full border border-[#d5d8d0] p-2.5 mt-1 bg-white rounded-xs text-sm"
              />
            </label>
            <label className="text-xs font-semibold text-[#4e5a54]">
              Phone Number
              <input
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full border border-[#d5d8d0] p-2.5 mt-1 bg-white rounded-xs text-sm font-mono"
              />
            </label>
            <label className="sm:col-span-2 text-xs font-semibold text-[#4e5a54]">
              Interests & Keywords
              <input
                value={form.interests || ''}
                onChange={(e) => setForm({ ...form, interests: e.target.value })}
                placeholder="Technical, Hackathon, Cultural"
                className="w-full border border-[#d5d8d0] p-2.5 mt-1 bg-white rounded-xs text-sm"
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
            <button
              type="button"
              onClick={() => { setEditing(false); setForm(data); }}
              className="text-xs px-4 py-2 border border-line rounded-xs hover:bg-black/5 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-ink text-white text-xs font-bold px-5 py-2 rounded-xs hover:bg-opacity-90 shadow-xs cursor-pointer"
            >
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* Details Table */}
          <div className="bg-paper border border-line rounded-sm shadow-sm divide-y divide-line">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between px-4 sm:px-6 py-3.5 gap-4">
                <span className="text-xs font-semibold text-[#4e5a54] uppercase tracking-wide shrink-0">{label}</span>
                <span className="text-sm font-medium text-ink text-right break-all">{value || '—'}</span>
              </div>
            ))}
          </div>

          {/* Student ID Card Badge Preview */}
          <div className="bg-[#243b31] text-white p-6 rounded-sm shadow-lg flex flex-col justify-between border-2 border-[#cfe870]/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#cfe870]/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-[#cfe870] uppercase block">OFFICIAL CREDENTIAL</span>
                  <span className="text-xs font-bold">ER. PERUMAL MANIMEKALAI COLLEGE</span>
                </div>
                <i className="font-serif text-[20px] not-italic bg-lime text-ink inline-grid place-items-center w-[26px] h-[26px] rounded-full font-bold">c</i>
              </div>

              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-14 h-14 rounded-full bg-lime text-ink font-serif text-2xl font-bold grid place-items-center shrink-0">
                  {(data.name || 'S').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white leading-tight">{data.name}</h3>
                  <p className="text-xs text-[#cfe870] font-mono mt-0.5">{data.reg_no || 'PMC-STUDENT'}</p>
                  <p className="text-xs text-white/70">{data.department} · {data.class}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/15 flex items-center justify-between text-[11px] font-mono text-white/70">
              <span>ROLE: {data.role?.toUpperCase()}</span>
              <span>VERIFIED MEMBER ✓</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ── Admin Component (4 Powerhouse Tabs) ─────────────────────────────────────
function Admin({ refresh, events, openAttendees, deleteEvent, editEvent, notify }) {
  const [tab, setTab] = useState('rosters');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false });

  // Event form
  const [form, setForm] = useState({ category: 'Workshop', seats: 50, image: 'general' });
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const loadStats = () => {
    api('/admin/stats').then(setStats).catch(() => {});
  };

  const loadUsers = () => {
    setLoadingUsers(true);
    api('/admin/users')
      .then((d) => { setUsers(d); setLoadingUsers(false); })
      .catch((e) => { notify(e.message, 'error'); setLoadingUsers(false); });
  };

  useEffect(() => {
    loadStats();
    loadUsers();
  }, []);

  // Submit new event
  const submitEvent = async (e) => {
    e.preventDefault();
    try {
      await api('/events', { method: 'POST', body: JSON.stringify(form) });
      refresh();
      loadStats();
      setForm({ category: 'Workshop', seats: 50, image: 'general' });
      setAiPrompt('');
      notify('Event published successfully.', 'success');
      setTab('rosters');
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  // AI autofill
  const aiAutoFill = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError('');
    try {
      const result = await api('/ai/generate-event', { method: 'POST', body: JSON.stringify({ prompt: aiPrompt }) });
      setForm((prev) => ({
        ...prev,
        title: result.title || prev.title,
        category: result.category || prev.category,
        description: result.description || prev.description,
        time: result.time || prev.time,
        venue: result.venue || prev.venue,
      }));
      notify('AI populated event details!', 'success');
    } catch (e) {
      setAiError(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Delete individual user
  const handleDeleteUser = (userId, userName) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Student Account',
      message: `Are you sure you want to delete student "${userName}"? All their registrations and credentials will be permanently erased.`,
      danger: true,
      confirmText: 'Delete Student',
      onConfirm: async () => {
        try {
          const res = await api(`/admin/users/${userId}`, { method: 'DELETE' });
          notify(res.message, 'success');
          loadUsers();
          loadStats();
          refresh();
        } catch (e) {
          notify(e.message, 'error');
        } finally {
          setConfirmModal({ isOpen: false });
        }
      },
      onCancel: () => setConfirmModal({ isOpen: false }),
    });
  };

  // Delete ALL registered users (User request!)
  const handleDeleteAllUsers = () => {
    setConfirmModal({
      isOpen: true,
      title: 'DELETE ALL REGISTERED STUDENTS',
      message: `CAUTION: This will permanently erase ALL ${users.length} registered student accounts and delete all their event registrations. The admin account will remain safe.`,
      danger: true,
      requireWord: 'DELETE',
      confirmText: 'DELETE ALL USERS',
      onConfirm: async () => {
        try {
          const res = await api('/admin/users', { method: 'DELETE' });
          notify(res.message, 'success');
          loadUsers();
          loadStats();
          refresh();
        } catch (e) {
          notify(e.message, 'error');
        } finally {
          setConfirmModal({ isOpen: false });
        }
      },
      onCancel: () => setConfirmModal({ isOpen: false }),
    });
  };

  // Export Users CSV
  const exportUsersCSV = () => {
    if (!users.length) return;
    const headers = ['#', 'Student Name', 'Reg No', 'Department', 'Class', 'Email', 'Phone', 'Events Registered'];
    const rows = users.map((u, idx) => [
      idx + 1,
      `"${(u.name || '').replace(/"/g, '""')}"`,
      `"${u.reg_no || ''}"`,
      `"${u.department || ''}"`,
      `"${u.class || ''}"`,
      `"${u.email || ''}"`,
      `"${u.phone || ''}"`,
      u.registrations_count || 0,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'all_registered_students.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.reg_no || '').toLowerCase().includes(q) ||
      (u.department || '').toLowerCase().includes(q) ||
      (u.class || '').toLowerCase().includes(q)
    );
  });

  return (
    <>
      <ConfirmModal {...confirmModal} />

      <section className="max-w-[1180px] mx-auto px-4 sm:px-6 py-10 md:py-16 min-h-[75vh]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <p className="font-mono tracking-widest text-[#76817b] text-xs uppercase mb-1">EVENT OFFICE PORTAL</p>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight">Admin Dashboard</h1>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#f0f3eb] p-1.5 rounded-sm border border-line">
            {[
              ['rosters', '📅 Events & Rosters'],
              ['users', '👥 User Directory'],
              ['publish', '✨ Publish / AI'],
              ['analytics', '📊 Analytics'],
            ].map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`text-xs px-3.5 py-2 rounded-xs font-semibold transition-colors cursor-pointer ${
                  tab === k ? 'bg-ink text-white shadow-xs' : 'text-[#68716c] hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Top Metric Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {[
            ['Active Events', stats.events || 0, 'bg-[#e8ede1]'],
            ['Total Registrations', stats.registrations || 0, 'bg-[#e8ede1]'],
            ['Registered Students', stats.students || 0, 'bg-[#cfe870]/40'],
            ['Verified Attendees', stats.attended || 0, 'bg-[#d4edda]'],
          ].map(([label, val, bg]) => (
            <div key={label} className={`${bg} p-4 rounded-sm shadow-xs border border-line/40`}>
              <b className="font-serif text-2xl sm:text-3xl block font-semibold text-ink">{val}</b>
              <span className="text-xs text-[#4e5a54] font-medium mt-1 block leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* ── TAB 1: EVENTS & ROSTERS ── */}
        {tab === 'rosters' && (
          <div className="bg-paper p-5 sm:p-7 border border-line rounded-sm shadow-xs animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-line">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">Events & Attendee Rosters</h2>
                <p className="text-xs text-muted mt-0.5">Manage existing events, view student attendance rosters, and toggle certificates.</p>
              </div>
              <button
                onClick={() => setTab('publish')}
                className="bg-ink text-white text-xs font-semibold px-4 py-2 rounded-xs hover:bg-opacity-90 transition-colors self-start sm:self-auto cursor-pointer"
              >
                + Add New Event
              </button>
            </div>

            {(!events || events.length === 0) ? (
              <p className="text-xs text-muted py-8 text-center">No events found. Publish one to get started.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((ev) => {
                  const totalSeats = ev.seats || 50;
                  const regCount = ev.registered || 0;
                  const pct = Math.min(100, Math.round((regCount / totalSeats) * 100));

                  return (
                    <div key={ev.id} className="p-4 border border-[#e2e7dc] bg-[#fcfbf7] rounded-xs flex flex-col justify-between gap-3 hover:border-ink/30 transition-all shadow-xs">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-mono uppercase bg-[#243b31] text-[#cfe870] px-2 py-0.5 rounded-xs font-semibold">
                            {ev.category}
                          </span>
                          <span className="text-xs text-muted font-mono">{ev.date}</span>
                        </div>
                        <h4 className="font-bold text-base text-ink leading-snug">{ev.title}</h4>
                        <p className="text-xs text-muted mt-0.5">{ev.time} · {ev.venue}</p>

                        {/* Capacity meter */}
                        <div className="mt-3 bg-white p-2 border border-line/60 rounded-xs">
                          <div className="flex justify-between text-[11px] font-medium text-[#4e5a54] mb-1">
                            <span>Enrolled: <strong>{regCount}</strong> / {totalSeats}</span>
                            <span>{pct}% filled</span>
                          </div>
                          <div className="w-full bg-[#e8ede1] h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#243b31] h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-line/50">
                        <button
                          type="button"
                          onClick={() => openAttendees(ev.id)}
                          className="bg-lime text-ink hover:bg-[#d9f07a] text-xs font-bold px-3 py-1.5 rounded-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          👥 View Students ({regCount})
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => editEvent(ev)}
                            className="text-xs text-ink hover:bg-black/5 border border-line px-2.5 py-1.5 rounded-xs transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteEvent(ev.id)}
                            className="text-xs text-[#ad3f33] hover:text-[#d32f2f] border border-[#ad3f33]/30 px-2 py-1.5 rounded-xs transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: USER DIRECTORY (User Request: Delete all users / individual users) ── */}
        {tab === 'users' && (
          <div className="bg-paper p-5 sm:p-7 border border-line rounded-sm shadow-xs animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-line">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-ink">
                  Registered Student Directory
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Manage all enrolled student accounts, view registrations, export directory, or reset user lists.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={exportUsersCSV}
                  disabled={!users.length}
                  className="bg-ink text-white hover:bg-opacity-90 disabled:opacity-40 text-xs px-3.5 py-2 rounded-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  📥 Export Students CSV
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAllUsers}
                  disabled={!users.length}
                  className="bg-[#ad3f33] hover:bg-[#c62828] disabled:opacity-40 text-white text-xs font-bold px-3.5 py-2 rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Remove all registered students"
                >
                  ⚠️ Delete All Registered Students
                </button>
              </div>
            </div>

            {/* Search filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
              <div className="relative flex-1 max-w-md">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs">🔍</span>
                <input
                  type="text"
                  placeholder="Search by student name, reg no, department, class, email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-[#d5d8d0] rounded-xs text-xs bg-white focus:outline-none focus:ring-1 focus:ring-ink"
                />
              </div>
              <span className="text-xs font-mono bg-[#e8ede1] text-ink px-3 py-2 rounded-xs font-semibold whitespace-nowrap self-start sm:self-auto">
                Total Students: {filteredUsers.length}
              </span>
            </div>

            {/* Student Directory Table */}
            <div className="border border-line rounded-xs overflow-hidden">
              {loadingUsers ? (
                <div className="py-16 text-center text-muted text-sm flex flex-col items-center gap-3">
                  <span className="inline-block w-6 h-6 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                  Loading student directory…
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-16 text-center text-muted text-sm px-4">
                  {userSearch ? 'No students match your search criteria.' : 'No student accounts registered yet.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                    <thead className="bg-[#f0f3eb] text-ink font-semibold sticky top-0 border-b border-line font-mono text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="p-3 w-10 text-center">#</th>
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Reg No</th>
                        <th className="p-3">Department & Class</th>
                        <th className="p-3">Contact (Email & Phone)</th>
                        <th className="p-3 text-center">Registrations</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/60">
                      {filteredUsers.map((u, idx) => (
                        <tr key={u.id} className="hover:bg-black/[0.02] transition-colors">
                          <td className="p-3 text-center text-muted font-mono">{idx + 1}</td>
                          <td className="p-3 font-semibold text-ink flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-ink text-lime text-xs font-bold inline-grid place-items-center shrink-0">
                              {(u.name || 'S').charAt(0).toUpperCase()}
                            </span>
                            <span>{u.name}</span>
                          </td>
                          <td className="p-3 font-mono font-medium text-[#3b4640]">{u.reg_no}</td>
                          <td className="p-3 text-muted">{u.department} · {u.class}</td>
                          <td className="p-3 font-mono text-[#4a5568]">
                            <div>{u.email}</div>
                            {u.phone && <div className="text-[10px] text-muted">{u.phone}</div>}
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-block bg-[#e8ede1] text-[#243b31] font-bold text-[11px] px-2.5 py-0.5 rounded-full">
                              {u.registrations_count || 0} enrolled
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="text-[#ad3f33] hover:text-[#d32f2f] hover:bg-[#ad3f33]/10 text-xs font-semibold border border-[#ad3f33]/30 px-2.5 py-1 rounded-xs transition-colors cursor-pointer"
                              title="Delete this student"
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 3: PUBLISH & AI AUTO-FILL ── */}
        {tab === 'publish' && (
          <div className="space-y-6 animate-fade-in">
            {/* AI Auto-Fill Card */}
            <div className="bg-gradient-to-br from-[#263a33] to-[#1a2e26] p-5 sm:p-7 rounded-sm shadow-md border border-[#3a5548] max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">✨</span>
                <h3 className="text-white font-bold text-sm tracking-wide">GEMINI AI EVENT WRITER</h3>
                <span className="text-[#aab8ae] text-xs ml-1 hidden sm:inline">— Enter raw details, AI crafts the listing</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="e.g. 24hr AI hackathon in C block auditorium with mentoring and prizes"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && aiAutoFill()}
                  className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-[#7a9485] px-4 py-3 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-lime"
                />
                <button
                  type="button"
                  onClick={aiAutoFill}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="bg-lime text-ink px-5 py-3 rounded-sm text-sm font-bold hover:bg-[#d9f07a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm whitespace-nowrap cursor-pointer"
                >
                  {aiLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>✨ Auto-Fill</>
                  )}
                </button>
              </div>
              {aiError && <p className="text-[#ff9b8e] text-xs mt-2">{aiError}</p>}
            </div>

            {/* Event Form */}
            <form
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 bg-paper p-5 sm:p-8 border border-line rounded-sm shadow-sm max-w-2xl"
              onSubmit={submitEvent}
            >
              <h2 className="sm:col-span-2 font-serif text-xl sm:text-2xl font-bold tracking-tight mb-1">
                Publish a new event
              </h2>
              {[
                ['title', 'Event title'],
                ['date', 'Date'],
                ['time', 'Time'],
                ['venue', 'Venue'],
                ['deadline', 'Registration deadline'],
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

              <label className="text-xs font-semibold text-[#4e5a54] flex flex-col gap-1.5">
                Max Capacity (Seats)
                <input
                  required
                  type="number"
                  min="1"
                  value={form.seats || 50}
                  onChange={(e) => setForm({ ...form, seats: parseInt(e.target.value, 10) || 50 })}
                  className="w-full border border-[#d5d8d0] p-2.5 bg-white rounded-xs focus:ring-1 focus:ring-ink focus:outline-none text-sm font-normal"
                />
              </label>

              <label className="sm:col-span-2 text-xs font-semibold text-[#4e5a54] flex flex-col gap-1.5">
                Description & Agenda
                <textarea
                  rows="3"
                  required
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Provide outline, speaker details, and prerequisites..."
                  className="w-full border border-[#d5d8d0] p-2.5 bg-white rounded-xs focus:ring-1 focus:ring-ink focus:outline-none text-sm font-normal"
                />
              </label>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-ink text-white px-6 py-3 rounded-sm text-sm font-medium hover:bg-opacity-90 transition-colors shadow-sm cursor-pointer"
                >
                  Publish event →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB 4: ANALYTICS & INSIGHTS ── */}
        {tab === 'analytics' && (
          <div className="bg-paper p-5 sm:p-7 border border-line rounded-sm shadow-xs space-y-6 animate-fade-in max-w-3xl">
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">System & Attendance Analytics</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#fcfbf7] border border-line p-4 rounded-xs">
                <h4 className="font-bold text-xs font-mono uppercase text-muted mb-3">Event Categories</h4>
                <div className="space-y-2">
                  {Object.entries(stats.categories || {}).map(([cat, cnt]) => (
                    <div key={cat} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-ink">{cat}</span>
                      <span className="font-mono bg-[#e8ede1] px-2 py-0.5 rounded-xs font-semibold">{cnt} events</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#fcfbf7] border border-line p-4 rounded-xs">
                <h4 className="font-bold text-xs font-mono uppercase text-muted mb-3">Credential Verification</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">Total Registrations</span>
                    <strong className="text-ink">{stats.registrations || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Verified Attended</span>
                    <strong className="text-[#155724]">{stats.attended || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Turnout Rate</span>
                    <strong className="text-ink font-mono">
                      {stats.registrations ? Math.round(((stats.attended || 0) / stats.registrations) * 100) : 0}%
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

// ── Auth Component (Login / Register with Phone) ────────────────────────────
function Auth({ onDone, close }) {
  const [newUser, setNewUser] = useState(false);
  const [d, setD] = useState({});
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const go = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await api(newUser ? '/register-user' : '/login', {
        method: 'POST',
        body: JSON.stringify(d),
      });
      onDone(res);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#19201d]/50 backdrop-blur-xs z-50 grid place-items-center p-4">
      <form
        onSubmit={go}
        className="bg-[#fffefa] w-full max-w-[420px] p-6 sm:p-9 relative shadow-[10px_10px_0_#cfe870] border border-line rounded-sm max-h-[92vh] overflow-y-auto animate-fade-in"
      >
        <button
          type="button"
          className="absolute right-4 top-3 text-muted hover:text-ink text-2xl leading-none font-bold cursor-pointer"
          onClick={close}
        >
          ×
        </button>
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
                <input
                  required
                  value={d.name || ''}
                  onChange={(e) => setD({ ...d, name: e.target.value })}
                  className="w-full border border-[#d5d8d0] p-2.5 mt-1 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none"
                />
              </label>
              <label className="block text-xs font-semibold text-[#4e5a54]">
                Registration number
                <input
                  required
                  placeholder="610825BIT001"
                  value={d.reg_no || ''}
                  onChange={(e) => setD({ ...d, reg_no: e.target.value })}
                  className="w-full border border-[#d5d8d0] p-2.5 mt-1 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none font-mono"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-semibold text-[#4e5a54]">
                  Department
                  <input
                    required
                    placeholder="IT"
                    value={d.department || ''}
                    onChange={(e) => setD({ ...d, department: e.target.value })}
                    className="w-full border border-[#d5d8d0] p-2.5 mt-1 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none"
                  />
                </label>
                <label className="block text-xs font-semibold text-[#4e5a54]">
                  Class / Year
                  <input
                    required
                    placeholder="II IT A"
                    value={d.class || ''}
                    onChange={(e) => setD({ ...d, class: e.target.value })}
                    className="w-full border border-[#d5d8d0] p-2.5 mt-1 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none"
                  />
                </label>
              </div>
              <label className="block text-xs font-semibold text-[#4e5a54]">
                Phone Number (Optional)
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={d.phone || ''}
                  onChange={(e) => setD({ ...d, phone: e.target.value })}
                  className="w-full border border-[#d5d8d0] p-2.5 mt-1 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none font-mono"
                />
              </label>
            </>
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
              minLength={newUser ? 6 : undefined}
              value={d.password || ''}
              onChange={(e) => setD({ ...d, password: e.target.value })}
              className="w-full border border-[#d5d8d0] p-2.5 mt-1 bg-white rounded-xs text-sm font-normal focus:ring-1 focus:ring-ink focus:outline-none"
            />
          </label>
        </div>

        {err && <p className="text-[#ad3f33] text-xs font-medium mt-3">{err}</p>}

        <button
          disabled={loading}
          className="bg-ink text-white w-full py-3 rounded-sm text-sm font-medium mt-5 hover:bg-opacity-90 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Please wait…' : newUser ? 'Create account' : 'Sign in'} →
        </button>

        <button
          type="button"
          className="w-full text-center text-[#527063] hover:underline text-xs mt-3 block cursor-pointer"
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

// ── Root App Component ──────────────────────────────────────────────────────
function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('campus-user') || 'null'));
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('discover');
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [attendeeEventId, setAttendeeEventId] = useState(null);
  const [detailEvent, setDetailEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [certModal, setCertModal] = useState(null);

  const notify = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  const refresh = () => {
    api('/events?user_id=' + (user?.id || '')).then(setEvents).catch(() => {});
  };

  useEffect(() => { refresh(); }, [user]);

  const signed = (u) => {
    setUser(u);
    localStorage.setItem('campus-user', JSON.stringify(u));
    setModal(false);
    notify(`Welcome back, ${u.name}!`, 'success');
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api(`/events/${id}`, { method: 'DELETE' });
      notify('Event deleted successfully.', 'success');
      refresh();
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const enroll = async (id) => {
    if (!user) return setModal(true);
    try {
      await api(`/events/${id}/register`, {
        method: 'POST',
        body: JSON.stringify({ user_id: user.id }),
      });
      notify("You're registered — confirmation email sent!", 'success');
      refresh();
      if (detailEvent?.id === id) {
        setDetailEvent((prev) => ({ ...prev, is_registered: true, registered: (prev.registered || 0) + 1 }));
      }
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const cancelEnroll = async (id) => {
    if (!user) return;
    try {
      await api(`/events/${id}/registrations/${user.id}`, { method: 'DELETE' });
      notify('Registration cancelled.', 'info');
      refresh();
      if (detailEvent?.id === id) {
        setDetailEvent((prev) => ({ ...prev, is_registered: false, registered: Math.max(0, (prev.registered || 1) - 1) }));
      }
    } catch (e) {
      notify(e.message, 'error');
    }
  };

  const navigate = (v) => { setView(v); setMenuOpen(false); };

  const navItems = [
    { key: 'discover', label: 'Discover', always: true },
    { key: 'my-events', label: 'My events', auth: true },
    { key: 'profile', label: 'Profile', auth: true },
    { key: 'admin', label: 'Admin', adminOnly: true },
  ].filter((n) => {
    if (n.adminOnly) return user?.role === 'admin';
    if (n.auth) return !!user;
    return true;
  });

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ── Header ── */}
      <header className="h-[64px] px-4 md:px-[6.5vw] flex items-center justify-between border-b border-line bg-[#fbfaf6] sticky top-0 z-40 shadow-xs">
        <a
          className="font-bold text-xl tracking-tighter cursor-pointer flex items-center select-none group"
          onClick={() => navigate('discover')}
        >
          <i className="font-serif text-[26px] not-italic bg-ink text-lime inline-grid place-items-center w-[28px] h-[28px] rounded-full mr-2 shadow group-hover:scale-105 transition-transform">c</i>
          <span>campus<span className="text-[#7b827e] font-normal">circle</span></span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 ml-[60px]">
          {navItems.map((n) => (
            <button
              key={n.key}
              className={`text-sm py-[20px] border-b-2 font-medium transition-colors cursor-pointer ${
                view === n.key ? 'border-ink text-ink font-semibold' : 'border-transparent text-muted hover:text-ink'
              }`}
              onClick={() => navigate(n.key)}
            >
              {n.label}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 text-sm">
          {user ? (
            <>
              <button
                className="bg-lime text-ink w-8 h-8 rounded-full grid place-items-center font-bold text-xs shadow-inner cursor-pointer"
                onClick={() => navigate('profile')}
                title="View profile"
              >
                {user.name[0]}
              </button>
              <button
                className="hidden sm:block text-xs px-3 py-1.5 border border-line rounded-sm hover:bg-ink hover:text-white transition-colors cursor-pointer"
                onClick={() => { localStorage.removeItem('campus-user'); setUser(null); navigate('discover'); notify('Signed out.', 'info'); }}
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              className="border border-ink px-4 py-2 rounded-sm text-xs font-semibold hover:bg-ink hover:text-white transition-colors cursor-pointer"
              onClick={() => setModal(true)}
            >
              Sign in
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-ink text-lg leading-none cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden bg-[#fbfaf6] border-b border-line px-4 py-3 flex flex-col gap-2 z-40 shadow-md">
          {navItems.map((n) => (
            <button
              key={n.key}
              className={`text-left py-2 px-2 text-sm rounded-xs font-medium cursor-pointer ${
                view === n.key ? 'bg-[#e8ede1] text-ink font-semibold' : 'text-muted'
              }`}
              onClick={() => navigate(n.key)}
            >
              {n.label}
            </button>
          ))}
          {user && (
            <button
              className="text-left py-2 px-2 text-xs text-[#ad3f33] border-t border-line mt-1 cursor-pointer font-medium"
              onClick={() => { localStorage.removeItem('campus-user'); setUser(null); navigate('discover'); setMenuOpen(false); notify('Signed out.', 'info'); }}
            >
              Sign out
            </button>
          )}
        </div>
      )}

      {/* Main Views */}
      <main>
        {view === 'discover' && (
          <Discover
            events={events}
            user={user}
            enroll={enroll}
            cancelEnroll={cancelEnroll}
            openDetail={(e) => setDetailEvent(e)}
            openAttendees={(id) => setAttendeeEventId(id)}
            deleteEvent={deleteEvent}
            editEvent={(e) => setEditingEvent(e)}
          />
        )}

        {view === 'my-events' && user && (
          <MyEvents user={user} cancelEnroll={cancelEnroll} notify={notify} />
        )}

        {view === 'profile' && user && (
          <Profile
            user={user}
            onUserUpdated={(u) => { setUser(u); localStorage.setItem('campus-user', JSON.stringify(u)); }}
            notify={notify}
          />
        )}

        {view === 'admin' && user?.role === 'admin' && (
          <Admin
            refresh={refresh}
            events={events}
            openAttendees={(id) => setAttendeeEventId(id)}
            deleteEvent={deleteEvent}
            editEvent={(e) => setEditingEvent(e)}
            notify={notify}
          />
        )}
      </main>

      {/* Modals & Overlays */}
      {!user && modal && <Auth onDone={signed} close={() => setModal(false)} />}

      {attendeeEventId && (
        <AttendeeModal
          eventId={attendeeEventId}
          onClose={() => setAttendeeEventId(null)}
          notify={notify}
        />
      )}

      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          user={user}
          onEnroll={(id) => enroll(id)}
          onCancelEnroll={(id) => cancelEnroll(id)}
          onClose={() => setDetailEvent(null)}
          openCertificate={(e) => { setCertModal(e); setDetailEvent(null); }}
        />
      )}

      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSaved={() => { setEditingEvent(null); refresh(); notify('Event updated successfully.', 'success'); }}
        />
      )}

      {certModal && user && (
        <CertificateModal cert={certModal} user={user} onClose={() => setCertModal(null)} />
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-line mt-20 py-10 px-4 md:px-[6.5vw] flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4 bg-[#f6f5ef]">
        <div className="flex items-center gap-2">
          <i className="font-serif text-[18px] not-italic bg-ink text-lime inline-grid place-items-center w-[20px] h-[20px] rounded-full">c</i>
          <span>Campus Circle · Er. Perumal Manimekalai College of Engineering</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Department of Information Technology</span>
          <span>·</span>
          <span>Official Event Platform</span>
        </div>
      </footer>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
