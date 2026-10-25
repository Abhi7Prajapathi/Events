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

const categoryTheme = {
  Workshop: {
    bg: 'from-[#143d2c] via-[#1b4e39] to-[#0f2c1f]',
    badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    accent: '#cfe870',
    tag: 'Workshop',
  },
  Technical: {
    bg: 'from-[#173347] via-[#1d425c] to-[#0f2331]',
    badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    accent: '#7dd3fc',
    tag: 'Technical',
  },
  Cultural: {
    bg: 'from-[#4d251d] via-[#612f25] to-[#361913]',
    badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    accent: '#fca5a5',
    tag: 'Cultural',
  },
  Placement: {
    bg: 'from-[#423617] via-[#57471d] to-[#2e250f]',
    badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    accent: '#fde047',
    tag: 'Placement',
  },
  Seminar: {
    bg: 'from-[#2c3d3a] via-[#374e4a] to-[#1f2b29]',
    badgeBg: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    accent: '#a7f3d0',
    tag: 'Seminar',
  },
};

// ── Floating Animated Toast Notification ────────────────────────────────────
function Toast({ toast, onClose }) {
  if (!toast) return null;
  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-[150] max-w-sm w-full bg-[#121c17] text-white p-4 rounded-xl shadow-elevated border border-white/10 flex items-start justify-between gap-3 animate-scale-in">
      <div className="flex items-start gap-3">
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
          isError ? 'bg-rose-500/20 text-rose-300' : isSuccess ? 'bg-lime text-forest' : 'bg-white/10 text-white'
        }`}>
          {isError ? '✕' : isSuccess ? '✓' : 'ℹ'}
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-lime font-mono">
            {isError ? 'Action Failed' : isSuccess ? 'Success' : 'Notification'}
          </p>
          <p className="text-xs text-[#dbe5df] mt-0.5 leading-relaxed font-medium">{toast.message}</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="text-muted-light hover:text-white text-base leading-none font-bold p-1 transition-colors cursor-pointer"
      >
        ×
      </button>
    </div>
  );
}

// ── In-App Confirmation Modal ───────────────────────────────────────────────
function ConfirmModal({ isOpen, title, message, confirmText = 'Confirm', danger = false, requireWord, onConfirm, onCancel }) {
  const [typed, setTyped] = useState('');
  if (!isOpen) return null;

  const canConfirm = requireWord ? typed.trim().toUpperCase() === requireWord.toUpperCase() : true;

  return (
    <div className="fixed inset-0 bg-[#0c1813]/70 backdrop-blur-md z-[160] grid place-items-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md p-6 sm:p-7 rounded-2xl shadow-elevated border border-line animate-scale-in">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl grid place-items-center text-lg ${danger ? 'bg-rose-50 text-rose-600' : 'bg-lime/20 text-forest'}`}>
            {danger ? '⚠️' : 'ℹ️'}
          </div>
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight text-ink">{title}</h3>
            <span className="text-[11px] font-mono text-muted uppercase">Confirmation Required</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted leading-relaxed mb-5">{message}</p>

        {requireWord && (
          <div className="mb-5 bg-rose-50/70 p-3.5 border border-rose-200 rounded-xl">
            <p className="text-xs text-rose-800 font-semibold mb-1.5">
              Type <span className="font-mono bg-white px-2 py-0.5 border border-rose-300 rounded font-bold">{requireWord}</span> to authorize:
            </p>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={`Type "${requireWord}"`}
              className="w-full text-xs p-2.5 border border-rose-300 rounded-lg font-mono uppercase focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white text-ink"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 border border-line text-xs font-semibold rounded-lg hover:bg-black/[0.04] text-muted hover:text-ink transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => { onConfirm(); setTyped(''); }}
            className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer ${
              danger
                ? 'bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-sm'
                : 'bg-forest hover:bg-[#163a2b] text-white shadow-sm'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Gold Medallion Badge (Exact Approved SVG) ────────────────────────────────
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
    <div className="fixed inset-0 z-[100] bg-[#0c1813]/85 backdrop-blur-md p-3 sm:p-6 md:p-8 flex flex-col items-center justify-start sm:justify-center overflow-y-auto print:p-0 print:bg-white print:static animate-fade-in">
      <div className="w-full max-w-[960px] flex items-center justify-between gap-3 mb-3 print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-lime bg-lime/10 border border-lime/30 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
            Verified Credential · Official Certificate
          </span>
        </div>
        <div className="flex items-center gap-2.5 ml-auto">
          <button
            onClick={onClose}
            className="bg-white/95 hover:bg-white text-ink text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            ← Back
          </button>
          <button
            onClick={() => window.print()}
            className="bg-lime hover:bg-lime-hover text-forest text-xs sm:text-sm font-bold px-4 py-2 rounded-lg shadow-glow-lime transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / Save PDF
          </button>
        </div>
      </div>

      <div className="w-full max-w-[960px] bg-white border border-[#cfd6d1] shadow-2xl relative flex flex-row overflow-hidden rounded-sm print:shadow-none print:border-0 print:w-full print:max-w-none print:rounded-none">
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

// ── Event Detail Drawer / Showcase Modal ────────────────────────────────────
function EventDetailModal({ event, user, onEnroll, onCancelEnroll, onClose, openCertificate }) {
  if (!event) return null;

  const totalSeats = event.seats || 50;
  const registeredCount = event.registered || 0;
  const seatsLeft = Math.max(0, totalSeats - registeredCount);
  const percentFilled = Math.min(100, Math.round((registeredCount / totalSeats) * 100));
  const t = categoryTheme[event.category] || categoryTheme.Workshop;

  return (
    <div className="fixed inset-0 bg-[#0c1813]/70 backdrop-blur-md z-50 grid place-items-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-elevated border border-line max-h-[92vh] overflow-y-auto relative animate-scale-in flex flex-col">
        {/* Banner with Category Gradient */}
        <div className={`p-6 sm:p-8 bg-gradient-to-br ${t.bg} text-white relative overflow-hidden rounded-t-2xl`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white grid place-items-center text-xl font-bold transition-all cursor-pointer"
          >
            ×
          </button>

          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${t.badgeBg}`}>
              {icons[event.category]} {event.category}
            </span>
            <span className="text-xs text-white/70 font-mono">ID #{event.id}</span>
            {event.is_registered && (
              <span className="bg-lime text-forest text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm">
                ✓ Registered
              </span>
            )}
          </div>

          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
            {event.title}
          </h2>
          <p className="text-xs sm:text-sm text-white/80 flex items-center gap-2">
            <span>📍 {event.venue}</span>
            <span>·</span>
            <span>⏰ {event.time}</span>
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Schedule Chips Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ['Event Date', event.date, '📅'],
              ['Time', event.time, '⏰'],
              ['Location', event.venue, '📍'],
              ['Deadline', event.deadline || 'Same day', '⏳'],
            ].map(([lbl, val, ic]) => (
              <div key={lbl} className="bg-[#f7f9f6] border border-line/80 p-3.5 rounded-xl">
                <span className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-1">
                  {ic} {lbl}
                </span>
                <span className="font-bold text-xs sm:text-sm text-ink block truncate">{val}</span>
              </div>
            ))}
          </div>

          {/* Seat Capacity Meter */}
          <div className="bg-[#fcfdfa] border border-line p-4 rounded-xl">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-ink flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Capacity Utilization: <strong>{registeredCount} / {totalSeats} seats</strong>
              </span>
              <span className={seatsLeft <= 5 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                {seatsLeft === 0 ? 'Fully Booked' : `${seatsLeft} seats remaining`}
              </span>
            </div>
            <div className="w-full bg-[#e8eee4] h-2.5 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  percentFilled >= 95 ? 'bg-rose-500' : percentFilled >= 70 ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${percentFilled}%` }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
              <span>✦</span> Event Details & Overview
            </h4>
            <div className="text-sm text-[#313f38] leading-relaxed whitespace-pre-line bg-[#fbfcf9] p-4 rounded-xl border border-line/60">
              {event.description || 'No detailed syllabus or prerequisites provided for this event.'}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 bg-[#f7f9f6] border-t border-line rounded-b-2xl flex flex-wrap items-center justify-between gap-3 mt-auto">
          <button
            onClick={onClose}
            className="text-xs px-4 py-2.5 border border-line rounded-xl font-semibold text-muted hover:text-ink hover:bg-white transition-all cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2.5">
            {event.is_registered ? (
              <>
                <button
                  onClick={() => openCertificate(event)}
                  className="bg-lime hover:bg-lime-hover text-forest text-xs font-bold px-4 py-2.5 rounded-xl shadow-glow-lime transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                >
                  🎖️ View Certificate
                </button>
                <button
                  onClick={() => onCancelEnroll(event.id)}
                  className="text-xs text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-300 px-3.5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer active:scale-95"
                >
                  Cancel Registration
                </button>
              </>
            ) : (
              <button
                disabled={seatsLeft === 0}
                onClick={() => onEnroll(event.id)}
                className="bg-forest hover:bg-[#163a2b] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                {seatsLeft === 0 ? 'Full' : 'Reserve Your Spot →'}
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
    <div className="fixed inset-0 bg-[#0c1813]/70 backdrop-blur-md z-50 grid place-items-center p-3 sm:p-5 animate-fade-in">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-xl p-6 sm:p-8 rounded-2xl shadow-elevated border border-line max-h-[92vh] overflow-y-auto animate-scale-in"
      >
        <div className="flex items-center justify-between border-b border-line pb-4 mb-5">
          <div>
            <span className="font-mono text-xs uppercase bg-forest text-lime px-2.5 py-0.5 rounded-full font-bold">
              Event #{event.id}
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-ink mt-1.5">
              Edit Event Listing
            </h3>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-muted hover:text-ink font-bold grid place-items-center cursor-pointer">
            ×
          </button>
        </div>

        {err && <p className="text-xs text-rose-600 mb-4 bg-rose-50 p-3 border border-rose-200 rounded-xl">{err}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <label className="sm:col-span-2 text-xs font-bold text-muted flex flex-col gap-1.5">
            Event Title
            <input
              required
              value={form.title || ''}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="border border-line p-3 bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest focus:outline-none transition-all"
            />
          </label>
          <label className="text-xs font-bold text-muted flex flex-col gap-1.5">
            Category
            <select
              value={form.category || 'Workshop'}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border border-line p-3 bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest focus:outline-none transition-all"
            >
              {['Workshop', 'Technical', 'Cultural', 'Placement', 'Seminar'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-bold text-muted flex flex-col gap-1.5">
            Total Capacity (Seats)
            <input
              required
              type="number"
              min="1"
              value={form.seats || 50}
              onChange={(e) => setForm({ ...form, seats: parseInt(e.target.value, 10) || 50 })}
              className="border border-line p-3 bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest focus:outline-none transition-all"
            />
          </label>
          <label className="text-xs font-bold text-muted flex flex-col gap-1.5">
            Date
            <input
              required
              type="date"
              value={form.date || ''}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="border border-line p-3 bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest focus:outline-none transition-all"
            />
          </label>
          <label className="text-xs font-bold text-muted flex flex-col gap-1.5">
            Time
            <input
              required
              value={form.time || ''}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="border border-line p-3 bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest focus:outline-none transition-all"
            />
          </label>
          <label className="text-xs font-bold text-muted flex flex-col gap-1.5">
            Venue
            <input
              required
              value={form.venue || ''}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              className="border border-line p-3 bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest focus:outline-none transition-all"
            />
          </label>
          <label className="text-xs font-bold text-muted flex flex-col gap-1.5">
            Registration Deadline
            <input
              required
              type="date"
              value={form.deadline || ''}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="border border-line p-3 bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest focus:outline-none transition-all"
            />
          </label>
          <label className="sm:col-span-2 text-xs font-bold text-muted flex flex-col gap-1.5">
            Description
            <textarea
              rows="3"
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="border border-line p-3 bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest focus:outline-none transition-all"
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-line">
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-4 py-2.5 border border-line rounded-xl hover:bg-black/[0.04] font-semibold text-muted transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-forest hover:bg-[#163a2b] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
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
    <div className="fixed inset-0 bg-[#0c1813]/70 backdrop-blur-md z-50 grid place-items-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-white w-full max-w-4xl p-6 sm:p-8 relative shadow-elevated border border-line rounded-2xl max-h-[92vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-forest text-lime text-xs font-mono px-2.5 py-0.5 rounded-full font-bold uppercase">
                {data?.event?.category || 'Event'}
              </span>
              <span className="text-xs text-muted font-mono">Event #{eventId}</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
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
            className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 text-muted hover:text-ink text-xl font-bold grid place-items-center transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-xs">🔍</span>
            <input
              type="text"
              placeholder="Search by student name, reg no, dept..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 border border-line rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-cream text-forest px-3 py-2 rounded-lg font-bold border border-line">
              Enrolled: {filtered.length} {filtered.length === 1 ? 'student' : 'students'}
            </span>
            <button
              onClick={exportCSV}
              disabled={!data?.students?.length}
              className="bg-forest hover:bg-[#163a2b] text-white disabled:opacity-40 text-xs px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-y-auto border border-line rounded-xl">
          {loading ? (
            <div className="py-16 text-center text-muted text-sm flex flex-col items-center gap-3">
              <span className="inline-block w-6 h-6 border-2 border-forest/30 border-t-forest rounded-full animate-spin" />
              Loading student roster…
            </div>
          ) : error ? (
            <div className="py-12 text-center text-rose-600 text-sm px-4">Error: {error}</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-muted text-sm px-4">
              {search ? 'No registered students match your search.' : 'No students have registered for this event yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[680px]">
                <thead className="bg-[#f2f5ef] text-forest font-bold sticky top-0 border-b border-line font-mono text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 w-12 text-center">#</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Reg No</th>
                    <th className="p-3.5">Dept & Class</th>
                    <th className="p-3.5">Contact Info</th>
                    <th className="p-3.5">Registered At</th>
                    <th className="p-3.5 text-center">Attendance</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {filtered.map((s, idx) => (
                    <tr key={s.user_id + '-' + idx} className="hover:bg-black/[0.02] transition-colors">
                      <td className="p-3.5 text-center text-muted font-mono">{idx + 1}</td>
                      <td className="p-3.5 font-bold text-ink flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-forest text-lime text-xs font-bold grid place-items-center shrink-0 shadow-xs">
                          {(s.name || 'S').charAt(0).toUpperCase()}
                        </span>
                        <span>{s.name}</span>
                      </td>
                      <td className="p-3.5 font-mono font-medium text-forest">{s.reg_no}</td>
                      <td className="p-3.5 text-muted">{s.department} · {s.class}</td>
                      <td className="p-3.5 font-mono text-ink">
                        <div>{s.email}</div>
                        {s.phone && <div className="text-[10px] text-muted">{s.phone}</div>}
                      </td>
                      <td className="p-3.5 text-muted whitespace-nowrap">{s.registered_at}</td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => toggleAttendance(s.user_id, s.status)}
                          className={`inline-flex items-center gap-1 font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                            s.status === 'Attended'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-cream text-forest hover:bg-lime border border-line'
                          }`}
                          title="Click to toggle Present/Attended status"
                        >
                          {s.status === 'Attended' ? '✓ Attended' : s.status || 'Confirmed'}
                        </button>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => removeStudent(s.user_id, s.name)}
                          className="text-rose-600 hover:text-white hover:bg-rose-600 text-xs font-semibold border border-rose-300 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
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

        {/* Modal Footer */}
        <div className="pt-4 mt-3 flex items-center justify-between text-xs text-muted border-t border-line">
          <span>Campus Circle · Official Event Attendance Registry</span>
          <button
            onClick={onClose}
            className="bg-forest text-white px-5 py-2 rounded-xl hover:bg-[#163a2b] font-bold cursor-pointer transition-all hover:scale-105 active:scale-95"
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
      {/* ── Modern Hero Section ── */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12 sm:pb-20 border-b border-line bg-gradient-to-b from-white via-cream to-cream">
        {/* Soft Ambient Background Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-lime/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 relative flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-14">
          <div className="flex-1 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-forest text-lime text-xs font-mono font-bold px-3.5 py-1.5 rounded-full mb-4 shadow-sm border border-forest/30">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
              <span>ER. PERUMAL MANIMEKALAI COLLEGE OF ENGINEERING</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-ink mb-4">
              Events worth leaving <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest via-[#16553b] to-emerald-600">
                your room for.
              </span>
            </h1>

            <p className="text-muted text-sm sm:text-base leading-relaxed max-w-lg mx-auto md:mx-0 mb-6">
              Discover official college hackathons, technical workshops, placement talks, and cultural festivals — with single-click registrations and instant verified credentials.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                className="bg-forest hover:bg-[#163a2b] text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95 group"
                onClick={() => document.querySelector('#events')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Campus Events
                <span className="w-6 h-6 rounded-full bg-lime text-forest grid place-items-center font-bold text-xs group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>

              <div className="flex items-center gap-4 text-xs font-mono text-muted py-2 px-3 bg-white/60 backdrop-blur-xs rounded-xl border border-line">
                <span className="flex items-center gap-1 font-bold text-forest">⚡ Live Roster</span>
                <span>·</span>
                <span className="flex items-center gap-1 font-bold text-forest">🎖️ Official PDF</span>
              </div>
            </div>
          </div>

          {/* Up Next Card Preview */}
          <div className="w-full md:w-[320px] lg:w-[350px] shrink-0 bg-gradient-to-br from-[#102a1f] via-[#16382a] to-[#0c1f17] text-white p-6 sm:p-7 rounded-2xl shadow-elevated border border-white/10 hover:scale-[1.02] transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-lime/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between font-mono text-[10px] text-lime tracking-widest uppercase mb-3">
              <span className="font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-lime animate-ping" />
                UPCOMING HIGHLIGHT
              </span>
              <span className="bg-white/10 px-2 py-0.5 rounded-full text-white/80">TECHNICAL</span>
            </div>

            <div className="my-3">
              <strong className="text-5xl font-display font-extrabold leading-none block text-white tracking-tight">
                11
                <small className="text-xs tracking-widest uppercase font-mono text-lime ml-2 font-bold">OCTOBER</small>
              </strong>
              <h3 className="font-display font-bold text-lg text-white mt-3 leading-snug">
                CodeCraft Hackathon 2026
              </h3>
              <p className="text-xs text-white/70 mt-1 flex items-center gap-1">
                <span>📍 C Block Auditorium</span>
                <span>·</span>
                <span>⏰ 09:00 AM</span>
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-white/70 font-mono">120 Total Capacity</span>
              <span className="text-lime font-bold group-hover:translate-x-1 transition-transform">View Details →</span>
            </div>
          </div>
        </div>

        {/* Live Features Strip */}
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 mt-10 pt-6 border-t border-line/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
          {[
            ['500+ Students', 'Active college participants', '🎓'],
            ['Single-Click', 'Instant confirmation & Brevo email', '⚡'],
            ['Official Credential', 'Signed PMC digital certificates', '🎖️'],
            ['Admin Rosters', 'Live attendance & CSV export', '📋'],
          ].map(([title, desc, ic]) => (
            <div key={title} className="flex items-start gap-2.5 p-2 rounded-xl">
              <span className="text-xl">{ic}</span>
              <div>
                <strong className="font-display text-xs sm:text-sm font-bold text-ink block">{title}</strong>
                <span className="text-[11px] text-muted leading-tight block">{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommendations Banner */}
      {user?.role === 'student' && rec.length > 0 && (
        <section className="bg-gradient-to-r from-[#e7eee1] via-[#ebf2e6] to-[#e4ede0] border-b border-line px-4 sm:px-[6.5vw] py-5">
          <div className="max-w-[1180px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-forest text-lime grid place-items-center text-xs font-bold shrink-0">✨</span>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted block">CURATED FOR YOU</span>
                <h3 className="font-display text-sm sm:text-base font-bold text-forest">Based on your interests:</h3>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {rec.map((e) => (
                <button
                  key={e.id}
                  onClick={() => openDetail(e)}
                  className="bg-white hover:bg-forest hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 border border-line"
                >
                  <span className="text-forest group-hover:text-lime font-mono">{icons[e.category]}</span>
                  <span>{e.title}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events Listing Section */}
      <section id="events" className="max-w-[1180px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Section Header with Search & Sort */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div>
            <p className="font-mono tracking-widest text-muted text-xs uppercase mb-1 font-semibold">ALL UPCOMING SESSIONS</p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">What's on campus</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-xs">🔍</span>
              <input
                type="text"
                placeholder="Search events, venues, keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 border border-line rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest transition-all w-full sm:w-60 shadow-xs"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2.5 px-3.5 border border-line rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest text-ink font-semibold shadow-xs cursor-pointer"
            >
              <option value="date">Sort: Upcoming Date</option>
              <option value="popular">Sort: Most Enrolled</option>
              <option value="seats">Sort: Seats Remaining</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['All', 'Workshop', 'Technical', 'Cultural', 'Placement', 'Seminar'].map((x) => {
            const count = x === 'All' ? events.length : events.filter((e) => e.category === x).length;
            const active = filter === x;
            return (
              <button
                key={x}
                onClick={() => setFilter(x)}
                className={`text-xs px-4 py-2 rounded-xl transition-all font-bold flex items-center gap-2 cursor-pointer shadow-xs active:scale-95 ${
                  active
                    ? 'bg-forest text-lime shadow-md'
                    : 'bg-white hover:bg-[#f0f3eb] text-[#4d5c53] border border-line'
                }`}
              >
                <span>{x !== 'All' ? icons[x] : '✦'} {x}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-black/5 text-muted'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Event Cards Grid */}
        {list.length === 0 ? (
          <div className="bg-white p-12 text-center text-muted rounded-2xl border border-line shadow-xs">
            <span className="text-3xl block mb-2">🔍</span>
            <p className="font-bold text-ink text-base">No events match your criteria</p>
            <p className="text-xs text-muted mt-1">Try clearing your search query or choosing another category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
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

// ── Redesigned Event Card ───────────────────────────────────────────────────
function EventCard({ e, enroll, cancelEnroll, user, deleteEvent, editEvent, openAttendees, openDetail }) {
  const t = categoryTheme[e.category] || categoryTheme.Workshop;
  const totalSeats = e.seats || 50;
  const registeredCount = e.registered || 0;
  const seatsLeft = Math.max(0, totalSeats - registeredCount);
  const pct = Math.min(100, Math.round((registeredCount / totalSeats) * 100));

  return (
    <article
      className="bg-white rounded-2xl overflow-hidden border border-line shadow-soft hover:shadow-elevated hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
    >
      {/* Top Banner with Rich Category Theme */}
      <div className={`p-5 bg-gradient-to-br ${t.bg} text-white relative overflow-hidden`}>
        <div className="flex justify-between items-start relative z-10">
          <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${t.badgeBg} shadow-xs`}>
            {icons[e.category]} {e.category}
          </span>
          <div className="bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-lg text-right font-mono text-[11px] font-bold text-white border border-white/10">
            {new Date(e.date + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Category Glyph Accent */}
        <div
          onClick={() => openDetail(e)}
          className="my-3 font-serif text-5xl text-lime/90 opacity-90 transition-transform group-hover:scale-110 cursor-pointer select-none"
        >
          {icons[e.category]}
        </div>

        <h3
          onClick={() => openDetail(e)}
          className="font-display text-lg sm:text-xl font-bold tracking-tight text-white leading-snug cursor-pointer hover:underline line-clamp-2"
        >
          {e.title}
        </h3>
      </div>

      {/* Card Body & Details */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2.5 text-xs text-muted">
          <div className="flex items-center gap-2">
            <span>⏰</span>
            <span className="font-medium text-ink">{e.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span className="font-medium text-ink truncate">{e.venue}</span>
          </div>

          {/* Seat Capacity Progress */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
              <span className="text-muted">Seats: {registeredCount}/{totalSeats}</span>
              <span className={seatsLeft <= 5 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                {seatsLeft === 0 ? 'Full' : `${seatsLeft} left`}
              </span>
            </div>
            <div className="w-full bg-[#edf1ea] h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${pct >= 95 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-600'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="pt-3 border-t border-line/70 flex items-center justify-between gap-2">
          {e.is_registered ? (
            <button
              onClick={() => openDetail(e)}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              ✓ Enrolled · View →
            </button>
          ) : (
            <button
              disabled={seatsLeft === 0}
              onClick={() => enroll(e.id)}
              className="bg-forest hover:bg-[#163a2b] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:scale-105 active:scale-95"
            >
              {seatsLeft === 0 ? 'Full' : 'Enroll Now →'}
            </button>
          )}

          {user?.role === 'admin' && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => openAttendees(e.id)}
                className="text-xs bg-lime hover:bg-lime-hover text-forest font-bold px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-xs cursor-pointer hover:scale-105"
                title="View registered student roster"
              >
                👥 {registeredCount}
              </button>
              <button
                type="button"
                onClick={() => editEvent(e)}
                className="text-xs text-muted hover:text-ink hover:bg-black/5 border border-line p-1.5 rounded-lg transition-all cursor-pointer"
                title="Edit event"
              >
                ✏️
              </button>
              <button
                type="button"
                onClick={() => deleteEvent(e.id)}
                className="text-xs text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 p-1.5 rounded-lg transition-all cursor-pointer"
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

      <section className="max-w-[1180px] mx-auto px-4 sm:px-6 py-10 sm:py-16 min-h-[75vh]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="font-mono tracking-widest text-muted text-xs uppercase mb-1 font-semibold">PERSONAL SCHEDULE</p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink">
              My Events & Passes
            </h1>
          </div>

          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-line shadow-xs">
            {[
              ['all', 'All Plans'],
              ['upcoming', 'Upcoming'],
              ['completed', 'Completed & Attended'],
            ].map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`text-xs px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  tab === k ? 'bg-forest text-white shadow-sm' : 'text-muted hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filteredRows.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            {filteredRows.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-line p-5 rounded-2xl shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-forest text-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                    <b className="font-display text-lg font-bold leading-none">{new Date(r.date + 'T00:00').getDate()}</b>
                    <span className="font-mono text-[9px] uppercase text-lime font-bold mt-0.5">
                      {new Date(r.date + 'T00:00').toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                  </div>

                  <div className="flex-1">
                    <span className="font-mono text-[10px] uppercase font-bold text-muted bg-[#f0f3eb] px-2 py-0.5 rounded-full inline-block mb-1">
                      {r.category}
                    </span>
                    <h3 className="font-display text-base font-bold text-ink leading-snug">{r.title}</h3>
                    <p className="text-xs text-muted mt-1">{r.time} · {r.venue}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-line/70">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                    r.status === 'Attended' ? 'bg-emerald-100 text-emerald-800' : 'bg-cream text-forest border border-line'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {r.status}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCert(r)}
                      className="text-xs bg-lime hover:bg-lime-hover text-forest font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95"
                    >
                      🎖️ Certificate
                    </button>
                    <button
                      onClick={() => handleCancel(r.id, r.title)}
                      className="text-xs text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-300 px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white max-w-xl p-8 rounded-2xl border border-line shadow-xs text-center">
            <span className="text-3xl block mb-2">🎟️</span>
            <p className="font-bold text-ink text-base">No registered events yet</p>
            <p className="text-xs text-muted mt-1">Browse upcoming campus events to reserve your seat and unlock official certificates.</p>
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
    ['Full Name', data.name],
    ['Email Address', data.email],
    ['Registration Number', data.reg_no],
    ['Department', data.department],
    ['Class / Year', data.class],
    ['Phone Number', data.phone || '—'],
    ['Interests', data.interests || 'General'],
    ['Account Role', data.role?.toUpperCase()],
  ];

  return (
    <section className="max-w-[1180px] mx-auto px-4 sm:px-6 py-10 sm:py-16 min-h-[75vh]">
      <div className="flex items-center justify-between max-w-xl mb-8">
        <div>
          <p className="font-mono tracking-widest text-muted text-xs uppercase mb-1 font-semibold">ACCOUNT CREDENTIALS</p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink">
            Profile & ID
          </h1>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs bg-forest hover:bg-[#163a2b] text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {err && <p className="text-rose-600 text-xs mb-4 max-w-xl bg-rose-50 p-3 rounded-xl border border-rose-200">{err}</p>}

      {editing ? (
        <form onSubmit={saveProfile} className="bg-white border border-line rounded-2xl p-6 sm:p-8 max-w-xl shadow-soft space-y-4">
          <h3 className="font-display text-xl font-bold text-ink pb-3 border-b border-line">Edit Profile Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="sm:col-span-2 text-xs font-bold text-muted flex flex-col gap-1.5">
              Full Name
              <input
                required
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-line p-3 bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest focus:outline-none"
              />
            </label>
            <label className="text-xs font-bold text-muted flex flex-col gap-1.5">
              Registration Number
              <input
                value={form.reg_no || ''}
                onChange={(e) => setForm({ ...form, reg_no: e.target.value })}
                className="w-full border border-line p-3 bg-white rounded-xl text-sm font-mono focus:ring-2 focus:ring-forest focus:outline-none"
              />
            </label>
            <label className="text-xs font-bold text-muted flex flex-col gap-1.5">
              Department
              <input
                value={form.department || ''}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full border border-line p-3 bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest focus:outline-none"
              />
            </label>
            <label className="text-xs font-bold text-muted flex flex-col gap-1.5">
              Class / Section
              <input
                value={form.class || ''}
                onChange={(e) => setForm({ ...form, class: e.target.value })}
                className="w-full border border-line p-3 bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest focus:outline-none"
              />
            </label>
            <label className="text-xs font-bold text-muted flex flex-col gap-1.5">
              Phone Number
              <input
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full border border-line p-3 bg-white rounded-xl text-sm font-mono focus:ring-2 focus:ring-forest focus:outline-none"
              />
            </label>
            <label className="sm:col-span-2 text-xs font-bold text-muted flex flex-col gap-1.5">
              Interests & Keywords
              <input
                value={form.interests || ''}
                onChange={(e) => setForm({ ...form, interests: e.target.value })}
                placeholder="Technical, Hackathon, Cultural"
                className="w-full border border-line p-3 bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest focus:outline-none"
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-line">
            <button
              type="button"
              onClick={() => { setEditing(false); setForm(data); }}
              className="text-xs px-4 py-2.5 border border-line rounded-xl hover:bg-black/5 font-bold text-muted cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-forest hover:bg-[#163a2b] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm cursor-pointer hover:scale-105 active:scale-95"
            >
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* Details Table */}
          <div className="bg-white border border-line rounded-2xl shadow-soft divide-y divide-line overflow-hidden">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between px-5 py-4 gap-4">
                <span className="text-xs font-bold text-muted uppercase tracking-wider shrink-0">{label}</span>
                <span className="text-sm font-semibold text-ink text-right break-all">{value || '—'}</span>
              </div>
            ))}
          </div>

          {/* Student ID Card Badge Preview */}
          <div className="bg-gradient-to-br from-[#0c2219] via-[#133728] to-[#0a1c14] text-white p-7 rounded-2xl shadow-elevated flex flex-col justify-between border-2 border-lime/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-lime/15 rounded-full blur-3xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between border-b border-white/20 pb-4 mb-5">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-lime uppercase font-bold block">COLLEGE IDENTIFIER</span>
                  <span className="text-xs font-extrabold text-white">ER. PERUMAL MANIMEKALAI COLLEGE</span>
                </div>
                <i className="font-serif text-[22px] not-italic bg-lime text-forest inline-grid place-items-center w-8 h-8 rounded-full font-bold shadow-md">c</i>
              </div>

              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-lime text-forest font-display text-3xl font-extrabold grid place-items-center shrink-0 shadow-md">
                  {(data.name || 'S').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-xl text-white leading-tight">{data.name}</h3>
                  <p className="text-xs text-lime font-mono mt-1 font-bold">{data.reg_no || 'PMC-STUDENT'}</p>
                  <p className="text-xs text-white/80">{data.department} · {data.class}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/15 flex items-center justify-between text-xs font-mono text-white/80">
              <span className="font-bold">ROLE: {data.role?.toUpperCase()}</span>
              <span className="bg-lime/20 text-lime px-2.5 py-0.5 rounded-full font-bold border border-lime/30">VERIFIED ✓</span>
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

      <section className="max-w-[1180px] mx-auto px-4 sm:px-6 py-10 sm:py-16 min-h-[75vh]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <p className="font-mono tracking-widest text-muted text-xs uppercase mb-1 font-semibold">EVENT OFFICE PORTAL</p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink">
              Admin Command Center
            </h1>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-xl border border-line shadow-xs">
            {[
              ['rosters', '📅 Events & Rosters'],
              ['users', '👥 User Directory'],
              ['publish', '✨ Publish & AI'],
              ['analytics', '📊 Analytics'],
            ].map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`text-xs px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  tab === k ? 'bg-forest text-white shadow-sm' : 'text-muted hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            ['Active Events', stats.events || 0, 'bg-white', '📅'],
            ['Total Registrations', stats.registrations || 0, 'bg-white', '⚡'],
            ['Registered Students', stats.students || 0, 'bg-emerald-50/70 border-emerald-200', '🎓'],
            ['Verified Attendees', stats.attended || 0, 'bg-lime/20 border-lime/40', '🎖️'],
          ].map(([label, val, bg, ic]) => (
            <div key={label} className={`${bg} p-5 rounded-2xl shadow-soft border border-line flex flex-col justify-between`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{ic}</span>
                <span className="text-[10px] font-mono text-muted uppercase font-bold">Metrics</span>
              </div>
              <b className="font-display text-3xl sm:text-4xl font-extrabold text-ink">{val}</b>
              <span className="text-xs text-muted font-bold mt-1">{label}</span>
            </div>
          ))}
        </div>

        {/* ── TAB 1: EVENTS & ROSTERS ── */}
        {tab === 'rosters' && (
          <div className="bg-white p-6 sm:p-8 border border-line rounded-2xl shadow-soft animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-line">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-ink">Active Events & Rosters</h2>
                <p className="text-xs text-muted mt-0.5">Manage existing events, view registered attendees, toggle attendance credentials.</p>
              </div>
              <button
                onClick={() => setTab('publish')}
                className="bg-forest hover:bg-[#163a2b] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all self-start sm:self-auto cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              >
                + Publish New Event
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
                    <div key={ev.id} className="p-5 border border-line bg-[#fcfdfa] rounded-xl flex flex-col justify-between gap-4 hover:border-forest/40 transition-all shadow-xs">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-mono uppercase bg-forest text-lime px-2.5 py-0.5 rounded-full font-bold">
                            {ev.category}
                          </span>
                          <span className="text-xs text-muted font-mono">{ev.date}</span>
                        </div>
                        <h4 className="font-display font-bold text-base text-ink leading-snug">{ev.title}</h4>
                        <p className="text-xs text-muted mt-1">{ev.time} · {ev.venue}</p>

                        <div className="mt-3 bg-white p-2.5 border border-line rounded-lg">
                          <div className="flex justify-between text-[11px] font-bold text-muted mb-1">
                            <span>Enrolled: <strong className="text-ink">{regCount}</strong> / {totalSeats}</span>
                            <span>{pct}% filled</span>
                          </div>
                          <div className="w-full bg-[#e8eee4] h-1.5 rounded-full overflow-hidden">
                            <div className="bg-forest h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-line">
                        <button
                          type="button"
                          onClick={() => openAttendees(ev.id)}
                          className="bg-lime hover:bg-lime-hover text-forest text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer hover:scale-105 active:scale-95"
                        >
                          👥 View Students ({regCount})
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => editEvent(ev)}
                            className="text-xs text-ink hover:bg-black/5 border border-line px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteEvent(ev.id)}
                            className="text-xs text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-300 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
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
          <div className="bg-white p-6 sm:p-8 border border-line rounded-2xl shadow-soft animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-line">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-ink">
                  Registered Student Directory
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Manage all enrolled student accounts, view registrations, export directory, or delete users.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={exportUsersCSV}
                  disabled={!users.length}
                  className="bg-forest hover:bg-[#163a2b] text-white disabled:opacity-40 text-xs px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                >
                  📥 Export Students CSV
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAllUsers}
                  disabled={!users.length}
                  className="bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                  title="Remove all registered students"
                >
                  ⚠️ Delete All Registered Students
                </button>
              </div>
            </div>

            {/* Search filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
              <div className="relative flex-1 max-w-md">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-xs">🔍</span>
                <input
                  type="text"
                  placeholder="Search by student name, reg no, department, class..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-line rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-forest transition-all"
                />
              </div>
              <span className="text-xs font-mono bg-[#f0f3eb] text-forest px-3 py-2 rounded-lg font-bold whitespace-nowrap self-start sm:self-auto border border-line">
                Total Students: {filteredUsers.length}
              </span>
            </div>

            {/* Table */}
            <div className="border border-line rounded-xl overflow-hidden">
              {loadingUsers ? (
                <div className="py-16 text-center text-muted text-sm flex flex-col items-center gap-3">
                  <span className="inline-block w-6 h-6 border-2 border-forest/30 border-t-forest rounded-full animate-spin" />
                  Loading student directory…
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-16 text-center text-muted text-sm px-4">
                  {userSearch ? 'No students match your search query.' : 'No registered students yet.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                    <thead className="bg-[#f2f5ef] text-forest font-bold sticky top-0 border-b border-line font-mono text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="p-3.5 w-12 text-center">#</th>
                        <th className="p-3.5">Student Name</th>
                        <th className="p-3.5">Reg No</th>
                        <th className="p-3.5">Department & Class</th>
                        <th className="p-3.5">Contact (Email & Phone)</th>
                        <th className="p-3.5 text-center">Registrations</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/60">
                      {filteredUsers.map((u, idx) => (
                        <tr key={u.id} className="hover:bg-black/[0.02] transition-colors">
                          <td className="p-3.5 text-center text-muted font-mono">{idx + 1}</td>
                          <td className="p-3.5 font-bold text-ink flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-full bg-forest text-lime text-xs font-bold grid place-items-center shrink-0 shadow-xs">
                              {(u.name || 'S').charAt(0).toUpperCase()}
                            </span>
                            <span>{u.name}</span>
                          </td>
                          <td className="p-3.5 font-mono font-medium text-forest">{u.reg_no}</td>
                          <td className="p-3.5 text-muted">{u.department} · {u.class}</td>
                          <td className="p-3.5 font-mono text-ink">
                            <div>{u.email}</div>
                            {u.phone && <div className="text-[10px] text-muted">{u.phone}</div>}
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="inline-block bg-[#f0f3eb] text-forest font-bold text-[11px] px-3 py-1 rounded-full border border-line">
                              {u.registrations_count || 0} enrolled
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="text-rose-600 hover:text-white hover:bg-rose-600 text-xs font-bold border border-rose-300 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
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
            <div className="bg-gradient-to-br from-[#0c2219] via-[#133728] to-[#0a1c14] p-6 sm:p-8 rounded-2xl shadow-elevated border border-lime/20 max-w-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-lime/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-xl">✨</span>
                <h3 className="text-white font-display font-bold text-base tracking-wide">GEMINI AI EVENT WRITER</h3>
                <span className="text-[#cfe870]/80 text-xs font-mono ml-auto hidden sm:inline">Automatic Content Generation</span>
              </div>
              <p className="text-xs text-white/70 mb-3">Enter notes or topic ideas, and Gemini will format an engaging, formatted event listing.</p>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  placeholder="e.g. 24hr AI hackathon in C block auditorium with mentoring and prizes"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && aiAutoFill()}
                  className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/40 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime"
                />
                <button
                  type="button"
                  onClick={aiAutoFill}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="bg-lime hover:bg-lime-hover text-forest px-6 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-glow-lime whitespace-nowrap cursor-pointer hover:scale-105 active:scale-95"
                >
                  {aiLoading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-forest/30 border-t-forest rounded-full animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>✨ Auto-Fill</>
                  )}
                </button>
              </div>
              {aiError && <p className="text-rose-300 text-xs mt-2.5">{aiError}</p>}
            </div>

            {/* Event Form */}
            <form
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 bg-white p-6 sm:p-8 border border-line rounded-2xl shadow-soft max-w-2xl"
              onSubmit={submitEvent}
            >
              <h2 className="sm:col-span-2 font-display text-xl sm:text-2xl font-bold tracking-tight text-ink mb-1">
                Publish a New Event
              </h2>
              {[
                ['title', 'Event Title'],
                ['date', 'Date'],
                ['time', 'Time'],
                ['venue', 'Venue'],
                ['deadline', 'Registration Deadline'],
              ].map(([k, l]) => (
                <label key={k} className="text-xs font-bold text-muted flex flex-col gap-1.5">
                  {l}
                  <input
                    required
                    type={k === 'date' || k === 'deadline' ? 'date' : 'text'}
                    value={form[k] || ''}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    className="w-full border border-line p-3 bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest focus:outline-none transition-all"
                  />
                </label>
              ))}

              <label className="text-xs font-bold text-muted flex flex-col gap-1.5">
                Category
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-line p-3 bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest focus:outline-none transition-all"
                >
                  {['Workshop', 'Technical', 'Cultural', 'Placement', 'Seminar'].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-bold text-muted flex flex-col gap-1.5">
                Max Capacity (Seats)
                <input
                  required
                  type="number"
                  min="1"
                  value={form.seats || 50}
                  onChange={(e) => setForm({ ...form, seats: parseInt(e.target.value, 10) || 50 })}
                  className="w-full border border-line p-3 bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest focus:outline-none transition-all"
                />
              </label>

              <label className="sm:col-span-2 text-xs font-bold text-muted flex flex-col gap-1.5">
                Description & Agenda
                <textarea
                  rows="3"
                  required
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Outline syllabus, prerequisite skills, mentors, and perks..."
                  className="w-full border border-line p-3 bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest focus:outline-none transition-all"
                />
              </label>

              <div className="sm:col-span-2 pt-3">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-forest hover:bg-[#163a2b] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  Publish Event →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB 4: ANALYTICS & INSIGHTS ── */}
        {tab === 'analytics' && (
          <div className="bg-white p-6 sm:p-8 border border-line rounded-2xl shadow-soft space-y-6 animate-fade-in max-w-3xl">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-ink">System Analytics & Turnout</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#fcfdfa] border border-line p-5 rounded-xl">
                <h4 className="font-mono text-xs uppercase font-bold text-muted mb-4">Event Categories Breakdown</h4>
                <div className="space-y-2.5">
                  {Object.entries(stats.categories || {}).map(([cat, cnt]) => (
                    <div key={cat} className="flex items-center justify-between text-xs">
                      <span className="font-bold text-ink">{icons[cat] || '✦'} {cat}</span>
                      <span className="font-mono bg-[#f0f3eb] px-2.5 py-1 rounded-full font-bold text-forest">{cnt} events</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#fcfdfa] border border-line p-5 rounded-xl">
                <h4 className="font-mono text-xs uppercase font-bold text-muted mb-4">Attendance Verification</h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">Total Registrations</span>
                    <strong className="text-ink">{stats.registrations || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Verified Attended</span>
                    <strong className="text-emerald-700 font-bold">{stats.attended || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Overall Turnout Rate</span>
                    <strong className="text-forest font-mono text-sm font-bold">
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

// ── Auth Component (Login / Register) ───────────────────────────────────────
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
    <div className="fixed inset-0 bg-[#0c1813]/70 backdrop-blur-md z-50 grid place-items-center p-4 animate-fade-in">
      <form
        onSubmit={go}
        className="bg-white w-full max-w-[430px] p-6 sm:p-9 relative shadow-elevated border border-line rounded-2xl max-h-[92vh] overflow-y-auto animate-scale-in"
      >
        <button
          type="button"
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 text-muted hover:text-ink text-xl font-bold grid place-items-center cursor-pointer transition-colors"
          onClick={close}
        >
          ×
        </button>

        <div className="flex items-center gap-2 mb-4">
          <i className="font-serif text-[22px] not-italic bg-forest text-lime inline-grid place-items-center w-8 h-8 rounded-full font-bold shadow-sm">c</i>
          <span className="font-display font-extrabold text-lg tracking-tight text-ink">campus<span className="text-muted font-normal">circle</span></span>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink mb-1">
          {newUser ? 'Join Campus Circle' : 'Welcome Back'}
        </h1>
        <p className="text-muted text-xs sm:text-sm mb-6 leading-relaxed">
          {newUser ? 'Register with your college details to join events & receive certificates.' : 'Sign in to access your registered events and certificates.'}
        </p>

        <div className="space-y-3.5">
          {newUser && (
            <>
              <label className="block text-xs font-bold text-muted">
                Full Name
                <input
                  required
                  value={d.name || ''}
                  onChange={(e) => setD({ ...d, name: e.target.value })}
                  placeholder="e.g. Abhilash R"
                  className="w-full border border-line p-3 mt-1.5 bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest focus:outline-none"
                />
              </label>
              <label className="block text-xs font-bold text-muted">
                Registration Number
                <input
                  required
                  placeholder="610825BIT001"
                  value={d.reg_no || ''}
                  onChange={(e) => setD({ ...d, reg_no: e.target.value })}
                  className="w-full border border-line p-3 mt-1.5 bg-white rounded-xl text-sm font-mono focus:ring-2 focus:ring-forest focus:outline-none"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-xs font-bold text-muted">
                  Department
                  <input
                    required
                    placeholder="IT"
                    value={d.department || ''}
                    onChange={(e) => setD({ ...d, department: e.target.value })}
                    className="w-full border border-line p-3 mt-1.5 bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest focus:outline-none"
                  />
                </label>
                <label className="block text-xs font-bold text-muted">
                  Class / Year
                  <input
                    required
                    placeholder="IV IT A"
                    value={d.class || ''}
                    onChange={(e) => setD({ ...d, class: e.target.value })}
                    className="w-full border border-line p-3 mt-1.5 bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest focus:outline-none"
                  />
                </label>
              </div>
              <label className="block text-xs font-bold text-muted">
                Phone Number (Optional)
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={d.phone || ''}
                  onChange={(e) => setD({ ...d, phone: e.target.value })}
                  className="w-full border border-line p-3 mt-1.5 bg-white rounded-xl text-sm font-mono focus:ring-2 focus:ring-forest focus:outline-none"
                />
              </label>
            </>
          )}

          <label className="block text-xs font-bold text-muted">
            Email Address
            <input
              required
              type="email"
              value={d.email || ''}
              onChange={(e) => setD({ ...d, email: e.target.value })}
              placeholder="student@campus.edu"
              className="w-full border border-line p-3 mt-1.5 bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest focus:outline-none"
            />
          </label>
          <label className="block text-xs font-bold text-muted">
            Password
            <input
              required
              type="password"
              minLength={newUser ? 6 : undefined}
              value={d.password || ''}
              onChange={(e) => setD({ ...d, password: e.target.value })}
              className="w-full border border-line p-3 mt-1.5 bg-white rounded-xl text-sm font-medium focus:ring-2 focus:ring-forest focus:outline-none"
            />
          </label>
        </div>

        {err && <p className="text-rose-600 text-xs font-bold mt-3 bg-rose-50 p-2.5 rounded-lg border border-rose-200">{err}</p>}

        <button
          disabled={loading}
          className="bg-forest hover:bg-[#163a2b] text-white w-full py-3.5 rounded-xl text-sm font-bold mt-5 transition-all shadow-md disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-98"
        >
          {loading ? 'Please wait…' : newUser ? 'Create Account →' : 'Sign In →'}
        </button>

        <button
          type="button"
          className="w-full text-center text-forest hover:underline text-xs mt-3.5 block font-bold cursor-pointer"
          onClick={() => { setNewUser(!newUser); setErr(''); }}
        >
          {newUser ? 'Already registered? Sign in instead' : 'New here? Create student account'}
        </button>

        <div className="mt-4 pt-3 border-t border-line text-center text-[11px] font-mono text-muted bg-[#f7f9f5] p-2 rounded-lg">
          Admin: <strong>admin@campus.edu</strong> / <strong>admin123</strong>
        </div>
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
    { key: 'discover', label: 'Discover', icon: '✦', always: true },
    { key: 'my-events', label: 'My Events', icon: '🎟️', auth: true },
    { key: 'profile', label: 'Profile', icon: '👤', auth: true },
    { key: 'admin', label: 'Admin', icon: '🛡️', adminOnly: true },
  ].filter((n) => {
    if (n.adminOnly) return user?.role === 'admin';
    if (n.auth) return !!user;
    return true;
  });

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ── Glassmorphism Header ── */}
      <header className="glass-nav h-[70px] px-4 md:px-[6.5vw] flex items-center justify-between border-b border-line sticky top-0 z-40 transition-all">
        <a
          className="font-display font-extrabold text-xl tracking-tight cursor-pointer flex items-center select-none group"
          onClick={() => navigate('discover')}
        >
          <i className="font-serif text-[24px] not-italic bg-forest text-lime inline-grid place-items-center w-8 h-8 rounded-full mr-2.5 shadow-md group-hover:scale-110 transition-transform">c</i>
          <span className="text-ink">campus<span className="text-muted font-normal">circle</span></span>
          <span className="ml-2.5 hidden lg:inline-block text-[10px] font-mono uppercase bg-[#e9eee5] text-forest px-2.5 py-0.5 rounded-full font-bold border border-line">
            PMC
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#f0f3eb]/70 p-1 rounded-full border border-line/80">
          {navItems.map((n) => {
            const active = view === n.key;
            return (
              <button
                key={n.key}
                className={`text-xs px-4 py-2 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  active
                    ? 'bg-forest text-white shadow-sm'
                    : 'text-muted hover:text-ink hover:bg-black/5'
                }`}
                onClick={() => navigate(n.key)}
              >
                <span>{n.icon}</span>
                <span>{n.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right User Bar */}
        <div className="flex items-center gap-2.5 text-sm">
          {user ? (
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-2 bg-white hover:bg-[#f2f5ee] border border-line py-1.5 px-3 rounded-full shadow-xs transition-all cursor-pointer hover:scale-105"
                onClick={() => navigate('profile')}
                title="View student profile"
              >
                <span className="w-6 h-6 rounded-full bg-forest text-lime text-xs font-bold grid place-items-center">
                  {user.name[0]}
                </span>
                <span className="text-xs font-bold text-ink max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                <span className="text-[10px] font-mono text-muted uppercase bg-cream px-1.5 py-0.5 rounded font-bold">
                  {user.role}
                </span>
              </button>
              <button
                className="hidden sm:inline-block text-xs px-3 py-1.5 text-muted hover:text-ink hover:bg-black/5 rounded-lg font-semibold transition-colors cursor-pointer"
                onClick={() => { localStorage.removeItem('campus-user'); setUser(null); navigate('discover'); notify('Signed out.', 'info'); }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              className="bg-forest hover:bg-[#163a2b] text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-xs cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-1.5"
              onClick={() => setModal(true)}
            >
              <span>Sign in</span>
              <span>→</span>
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 rounded-lg bg-black/5 hover:bg-black/10 text-ink grid place-items-center text-lg cursor-pointer transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden glass-nav border-b border-line px-4 py-3 flex flex-col gap-2 z-40 shadow-md animate-fade-in">
          {navItems.map((n) => (
            <button
              key={n.key}
              className={`text-left py-2.5 px-3 text-xs rounded-xl font-bold transition-all cursor-pointer flex items-center gap-2 ${
                view === n.key ? 'bg-forest text-white' : 'text-muted hover:bg-black/5'
              }`}
              onClick={() => navigate(n.key)}
            >
              <span>{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
          {user && (
            <button
              className="text-left py-2 px-3 text-xs text-rose-600 border-t border-line mt-1 cursor-pointer font-bold"
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
      <footer className="border-t border-line mt-24 py-12 px-4 md:px-[6.5vw] bg-white text-xs text-muted">
        <div className="max-w-[1180px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <i className="font-serif text-[18px] not-italic bg-forest text-lime inline-grid place-items-center w-6 h-6 rounded-full font-bold">c</i>
            <span className="font-display font-bold text-ink">Campus Circle</span>
            <span>·</span>
            <span>Er. Perumal Manimekalai College of Engineering</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Dept of Information Technology</span>
            <span>·</span>
            <span className="text-forest font-bold">Verified Event Registry</span>
          </div>
        </div>
      </footer>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
