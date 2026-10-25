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

// ── Clean SVG Icon Components (No cartoon emojis) ──────────────────────────
const CalendarIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClockIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MapPinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UsersIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const SearchIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const DownloadIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const CertificateIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const categoryBadgeStyles = {
  Workshop: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  Technical: 'bg-sky-50 text-sky-800 border-sky-200/80',
  Cultural: 'bg-amber-50 text-amber-800 border-amber-200/80',
  Placement: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
  Seminar: 'bg-stone-100 text-stone-800 border-stone-200/80',
};

// ── Notification Toast ──────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
  if (!toast) return null;
  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed bottom-5 right-5 z-[150] max-w-sm w-full bg-white text-ink p-4 rounded-lg shadow-modal border border-border flex items-start justify-between gap-3 animate-fade-in">
      <div className="flex items-start gap-3">
        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
          isError ? 'bg-red-100 text-red-700' : isSuccess ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
        }`}>
          {isError ? '!' : isSuccess ? '✓' : 'i'}
        </span>
        <div>
          <p className="text-xs font-semibold text-ink leading-tight">
            {isError ? 'Action Failed' : isSuccess ? 'Success' : 'Notice'}
          </p>
          <p className="text-xs text-subtle mt-0.5 leading-relaxed">{toast.message}</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="text-muted hover:text-ink text-base leading-none font-bold p-1 cursor-pointer"
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[160] grid place-items-center p-4">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-modal border border-border">
        <h3 className="font-semibold text-base text-ink mb-1">{title}</h3>
        <p className="text-xs text-subtle leading-relaxed mb-4">{message}</p>

        {requireWord && (
          <div className="mb-4 bg-red-50 p-3 border border-red-200 rounded-md">
            <p className="text-xs text-red-800 font-medium mb-1.5">
              Type <strong className="font-mono">{requireWord}</strong> to confirm:
            </p>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={`Type "${requireWord}"`}
              className="w-full text-xs p-2 border border-red-300 rounded font-mono uppercase bg-white focus:outline-none focus:ring-1 focus:ring-red-600"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 border border-border text-xs font-medium rounded-md hover:bg-gray-50 text-subtle transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => { onConfirm(); setTyped(''); }}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              danger
                ? 'bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed'
                : 'bg-college hover:bg-college-light text-white'
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
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs p-3 sm:p-6 md:p-8 flex flex-col items-center justify-start sm:justify-center overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="w-full max-w-[960px] flex items-center justify-between gap-3 mb-3 print:hidden">
        <span className="text-xs font-mono text-zinc-300 bg-white/10 px-3 py-1.5 rounded">
          Verified Event Credential · Official Certificate
        </span>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={onClose}
            className="bg-white/90 hover:bg-white text-ink text-xs font-medium px-3.5 py-1.5 rounded shadow-sm transition-colors cursor-pointer"
          >
            ← Back
          </button>
          <button
            onClick={() => window.print()}
            className="bg-[#cfe870] hover:bg-[#d9f07a] text-[#183d28] text-xs font-bold px-4 py-1.5 rounded shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <DownloadIcon className="w-3.5 h-3.5" />
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

// ── Event Detail Modal (Academic Bulletin Style) ────────────────────────────
function EventDetailModal({ event, user, onEnroll, onCancelEnroll, onClose, openCertificate }) {
  if (!event) return null;

  const totalSeats = event.seats || 50;
  const registeredCount = event.registered || 0;
  const seatsLeft = Math.max(0, totalSeats - registeredCount);
  const badgeStyle = categoryBadgeStyles[event.category] || categoryBadgeStyles.Workshop;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 grid place-items-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-modal border border-border max-h-[92vh] overflow-y-auto relative flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded border ${badgeStyle}`}>
                {event.category}
              </span>
              <span className="text-xs font-mono text-muted">ID #{event.id}</span>
            </div>
            <button
              onClick={onClose}
              className="text-muted hover:text-ink w-7 h-7 rounded flex items-center justify-center font-bold text-lg cursor-pointer"
            >
              ×
            </button>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink leading-tight">
            {event.title}
          </h2>
        </div>

        {/* Info Grid */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-college-surface/60 p-3.5 rounded-lg border border-border">
            <div>
              <span className="text-[11px] text-muted uppercase font-mono block">Date</span>
              <strong className="text-xs font-semibold text-ink mt-0.5 block">{event.date}</strong>
            </div>
            <div>
              <span className="text-[11px] text-muted uppercase font-mono block">Timing</span>
              <strong className="text-xs font-semibold text-ink mt-0.5 block">{event.time}</strong>
            </div>
            <div>
              <span className="text-[11px] text-muted uppercase font-mono block">Location</span>
              <strong className="text-xs font-semibold text-ink mt-0.5 block truncate">{event.venue}</strong>
            </div>
            <div>
              <span className="text-[11px] text-muted uppercase font-mono block">Deadline</span>
              <strong className="text-xs font-semibold text-ink mt-0.5 block">{event.deadline || 'Same day'}</strong>
            </div>
          </div>

          {/* Seat Capacity Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-subtle">
                Enrolled: <strong>{registeredCount}</strong> / {totalSeats} participants
              </span>
              <span className={seatsLeft <= 5 ? 'text-red-700 font-semibold' : 'text-college font-semibold'}>
                {seatsLeft === 0 ? 'Full' : `${seatsLeft} seats remaining`}
              </span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-college h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, Math.round((registeredCount / totalSeats) * 100))}%` }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 font-mono">
              Program Description & Agenda
            </h4>
            <p className="text-sm text-subtle leading-relaxed whitespace-pre-line bg-gray-50/70 p-4 rounded-lg border border-border">
              {event.description || 'No detailed program outline provided.'}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-border rounded-b-xl flex items-center justify-between gap-3 mt-auto">
          <button
            onClick={onClose}
            className="text-xs px-3.5 py-2 border border-border rounded-md font-medium text-subtle hover:text-ink hover:bg-white transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {event.is_registered ? (
              <>
                <button
                  onClick={() => openCertificate(event)}
                  className="bg-[#cfe870] hover:bg-[#d9f07a] text-[#183d28] text-xs font-semibold px-4 py-2 rounded-md shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CertificateIcon className="w-3.5 h-3.5" />
                  View Certificate
                </button>
                <button
                  onClick={() => onCancelEnroll(event.id)}
                  className="text-xs text-red-700 hover:bg-red-50 border border-red-200 px-3 py-2 rounded-md font-medium transition-colors cursor-pointer"
                >
                  Cancel Registration
                </button>
              </>
            ) : (
              <button
                disabled={seatsLeft === 0}
                onClick={() => onEnroll(event.id)}
                className="bg-college hover:bg-college-light text-white text-xs font-medium px-4 py-2 rounded-md shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                {seatsLeft === 0 ? 'Capacity Full' : 'Register for Event →'}
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 grid place-items-center p-3 sm:p-5">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-xl p-6 rounded-xl shadow-modal border border-border max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <div>
            <span className="text-xs font-mono text-muted">Editing Event #{event.id}</span>
            <h3 className="font-semibold text-lg text-ink">Update Event Details</h3>
          </div>
          <button type="button" onClick={onClose} className="text-muted hover:text-ink text-xl font-bold cursor-pointer">
            ×
          </button>
        </div>

        {err && <p className="text-xs text-red-600 mb-3 bg-red-50 p-2 rounded border border-red-200">{err}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <label className="sm:col-span-2 text-xs font-medium text-subtle flex flex-col gap-1">
            Event Title
            <input
              required
              value={form.title || ''}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="border border-border p-2 bg-white rounded-md text-sm focus:ring-1 focus:ring-college focus:outline-none"
            />
          </label>
          <label className="text-xs font-medium text-subtle flex flex-col gap-1">
            Category
            <select
              value={form.category || 'Workshop'}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border border-border p-2 bg-white rounded-md text-sm focus:ring-1 focus:ring-college focus:outline-none"
            >
              {['Workshop', 'Technical', 'Cultural', 'Placement', 'Seminar'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-subtle flex flex-col gap-1">
            Max Seats
            <input
              required
              type="number"
              min="1"
              value={form.seats || 50}
              onChange={(e) => setForm({ ...form, seats: parseInt(e.target.value, 10) || 50 })}
              className="border border-border p-2 bg-white rounded-md text-sm focus:ring-1 focus:ring-college focus:outline-none"
            />
          </label>
          <label className="text-xs font-medium text-subtle flex flex-col gap-1">
            Date
            <input
              required
              type="date"
              value={form.date || ''}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="border border-border p-2 bg-white rounded-md text-sm focus:ring-1 focus:ring-college focus:outline-none"
            />
          </label>
          <label className="text-xs font-medium text-subtle flex flex-col gap-1">
            Time
            <input
              required
              value={form.time || ''}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="border border-border p-2 bg-white rounded-md text-sm focus:ring-1 focus:ring-college focus:outline-none"
            />
          </label>
          <label className="text-xs font-medium text-subtle flex flex-col gap-1">
            Venue
            <input
              required
              value={form.venue || ''}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              className="border border-border p-2 bg-white rounded-md text-sm focus:ring-1 focus:ring-college focus:outline-none"
            />
          </label>
          <label className="text-xs font-medium text-subtle flex flex-col gap-1">
            Deadline
            <input
              required
              type="date"
              value={form.deadline || ''}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="border border-border p-2 bg-white rounded-md text-sm focus:ring-1 focus:ring-college focus:outline-none"
            />
          </label>
          <label className="sm:col-span-2 text-xs font-medium text-subtle flex flex-col gap-1">
            Description
            <textarea
              rows="3"
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="border border-border p-2 bg-white rounded-md text-sm focus:ring-1 focus:ring-college focus:outline-none"
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-3.5 py-1.5 border border-border rounded-md font-medium text-subtle hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-college hover:bg-college-light text-white text-xs font-medium px-4 py-1.5 rounded-md shadow-xs cursor-pointer"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Attendee Modal (Roster & Attendance Registry) ───────────────────────────
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 grid place-items-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-modal border border-border max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-medium bg-gray-100 text-subtle px-2 py-0.5 rounded">
                Event #{eventId}
              </span>
              <span className="text-xs text-muted">Official Roster</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-ink">
              {data?.event?.title || 'Registered Students'}
            </h2>
            {data?.event && (
              <p className="text-xs text-muted mt-0.5">
                {data.event.date} · {data.event.venue} · {data.total} of {data.event.seats || 50} seats enrolled
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink text-2xl leading-none font-bold p-1 cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <SearchIcon className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Filter by name, reg no, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-border rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-college"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-gray-100 text-subtle px-2.5 py-1.5 rounded">
              Enrolled: {filtered.length}
            </span>
            <button
              onClick={exportCSV}
              disabled={!data?.students?.length}
              className="bg-college hover:bg-college-light text-white disabled:opacity-40 text-xs px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <DownloadIcon className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-y-auto border border-border rounded-lg">
          {loading ? (
            <div className="py-12 text-center text-muted text-xs">Loading roster…</div>
          ) : error ? (
            <div className="py-12 text-center text-red-600 text-xs">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted text-xs">
              {search ? 'No registered students match filter.' : 'No students registered yet.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                <thead className="bg-gray-50 text-subtle font-medium sticky top-0 border-b border-border text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Reg No</th>
                    <th className="p-3">Dept & Class</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3 text-center">Attendance</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((s, idx) => (
                    <tr key={s.user_id + '-' + idx} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-3 text-center text-muted font-mono">{idx + 1}</td>
                      <td className="p-3 font-medium text-ink">{s.name}</td>
                      <td className="p-3 font-mono text-subtle">{s.reg_no}</td>
                      <td className="p-3 text-muted">{s.department} · {s.class}</td>
                      <td className="p-3 font-mono text-subtle text-[11px]">
                        <div>{s.email}</div>
                        {s.phone && <div className="text-muted">{s.phone}</div>}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleAttendance(s.user_id, s.status)}
                          className={`inline-flex items-center gap-1 font-medium text-[11px] px-2.5 py-0.5 rounded cursor-pointer transition-colors ${
                            s.status === 'Attended'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                          }`}
                          title="Click to toggle status"
                        >
                          {s.status === 'Attended' ? '✓ Attended' : s.status || 'Confirmed'}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => removeStudent(s.user_id, s.name)}
                          className="text-red-600 hover:underline text-xs font-medium cursor-pointer"
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
        <div className="pt-3 mt-3 flex items-center justify-between text-xs text-muted border-t border-border">
          <span>Click status button to toggle official attendance record.</span>
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-ink px-4 py-1.5 rounded-md font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Discover Component (Collegiate Editorial View) ──────────────────────────
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
      {/* ── College Header Banner ── */}
      <section className="border-b border-border bg-white py-10 sm:py-14">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <p className="text-[11px] font-mono uppercase tracking-widest text-college font-semibold mb-2 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-college"></span>
              <span>ACADEMIC YEAR 2026 · ER. PERUMAL MANIMEKALAI COLLEGE OF ENGINEERING</span>
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-ink mb-3 leading-tight">
              Campus Events & Symposia Directory
            </h1>
            <p className="text-subtle text-sm sm:text-base leading-relaxed">
              Official registration portal for department workshops, hackathons, placement training, and student conferences. Register with your college credentials to participate and receive verified institutional certificates.
            </p>
          </div>
        </div>
      </section>

      {/* Recommendations Banner */}
      {user?.role === 'student' && rec.length > 0 && (
        <section className="bg-college-surface border-b border-border py-3.5 px-4 sm:px-6">
          <div className="max-w-[1140px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <span className="text-xs font-medium text-college flex items-center gap-1.5">
              <span className="font-bold">Recommended for you:</span> Based on your department and interests
            </span>
            <div className="flex flex-wrap gap-2">
              {rec.map((e) => (
                <button
                  key={e.id}
                  onClick={() => openDetail(e)}
                  className="bg-white hover:bg-gray-50 text-ink text-xs px-3 py-1 rounded border border-border font-medium shadow-xs transition-colors cursor-pointer"
                >
                  {e.title} →
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Events Listing Section */}
      <section id="events" className="max-w-[1140px] mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6 pb-5 border-b border-border">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'Workshop', 'Technical', 'Cultural', 'Placement', 'Seminar'].map((x) => {
              const count = x === 'All' ? events.length : events.filter((e) => e.category === x).length;
              const active = filter === x;
              return (
                <button
                  key={x}
                  onClick={() => setFilter(x)}
                  className={`text-xs px-3.5 py-1.5 rounded-full transition-colors cursor-pointer font-medium flex items-center gap-1.5 ${
                    active
                      ? 'bg-college text-white shadow-xs'
                      : 'border border-border text-subtle hover:text-ink hover:bg-white bg-transparent'
                  }`}
                >
                  <span>{x}</span>
                  <span className={`text-[10px] font-mono opacity-80`}>({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search + Sort */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                <SearchIcon className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-border rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-college w-48 sm:w-56"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-1.5 px-2.5 border border-border rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-college text-subtle font-medium cursor-pointer"
            >
              <option value="date">Date</option>
              <option value="popular">Most Enrolled</option>
              <option value="seats">Remaining Seats</option>
            </select>
          </div>
        </div>

        {/* Event Cards Grid */}
        {list.length === 0 ? (
          <div className="bg-white p-12 text-center text-muted rounded-lg border border-border">
            <p className="font-medium text-ink text-sm">No events match the selected criteria.</p>
            <p className="text-xs text-muted mt-1">Try clearing your search query or selecting another category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

// ── Event Card (Clean Collegiate Academic Format) ───────────────────────────
function EventCard({ e, enroll, cancelEnroll, user, deleteEvent, editEvent, openAttendees, openDetail }) {
  const badgeStyle = categoryBadgeStyles[e.category] || categoryBadgeStyles.Workshop;
  const totalSeats = e.seats || 50;
  const registeredCount = e.registered || 0;
  const seatsLeft = Math.max(0, totalSeats - registeredCount);
  const pct = Math.min(100, Math.round((registeredCount / totalSeats) * 100));

  return (
    <article className="bg-white rounded-lg border border-border shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between p-5">
      <div>
        {/* Top Category & Date */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${badgeStyle}`}>
            {e.category}
          </span>
          <span className="text-xs font-mono font-medium text-muted">
            {new Date(e.date + 'T00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Title */}
        <h3
          onClick={() => openDetail(e)}
          className="font-semibold text-base text-ink leading-snug hover:text-college transition-colors cursor-pointer mb-2"
        >
          {e.title}
        </h3>

        {/* Venue & Time */}
        <div className="space-y-1 text-xs text-subtle mb-4">
          <div className="flex items-center gap-1.5">
            <ClockIcon className="w-3.5 h-3.5 text-muted shrink-0" />
            <span>{e.time}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPinIcon className="w-3.5 h-3.5 text-muted shrink-0" />
            <span className="truncate">{e.venue}</span>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-[11px] text-muted mb-1 font-medium">
            <span>{registeredCount} / {totalSeats} seats</span>
            <span className={seatsLeft <= 5 ? 'text-red-700 font-semibold' : ''}>
              {seatsLeft === 0 ? 'Full' : `${seatsLeft} left`}
            </span>
          </div>
          <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${pct >= 90 ? 'bg-red-600' : 'bg-college'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Action Row */}
      <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
        {e.is_registered ? (
          <button
            onClick={() => openDetail(e)}
            className="text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
          >
            <CheckIcon className="w-3 h-3 text-emerald-700" />
            <span>Registered</span>
          </button>
        ) : (
          <button
            disabled={seatsLeft === 0}
            onClick={() => enroll(e.id)}
            className="bg-college hover:bg-college-light text-white text-xs font-medium px-3.5 py-1.5 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {seatsLeft === 0 ? 'Full' : 'Register'}
          </button>
        )}

        <button
          onClick={() => openDetail(e)}
          className="text-xs text-subtle hover:text-ink font-medium px-2 py-1.5 cursor-pointer"
        >
          Details →
        </button>

        {user?.role === 'admin' && (
          <div className="flex items-center gap-1 ml-auto">
            <button
              type="button"
              onClick={() => openAttendees(e.id)}
              className="text-xs text-subtle hover:text-ink border border-border px-2 py-1 rounded hover:bg-gray-50 transition-colors flex items-center gap-1 cursor-pointer"
              title="View attendees"
            >
              <UsersIcon className="w-3.5 h-3.5 text-muted" />
              <span>{registeredCount}</span>
            </button>
            <button
              type="button"
              onClick={() => editEvent(e)}
              className="text-xs text-subtle hover:text-ink border border-border px-2 py-1 rounded hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => deleteEvent(e.id)}
              className="text-xs text-red-600 hover:text-red-800 border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

// ── My Events (Student Personal Schedule) ───────────────────────────────────
function MyEvents({ user, cancelEnroll, notify }) {
  const [rows, setRows] = useState([]);
  const [cert, setCert] = useState(null);
  const [tab, setTab] = useState('all');

  const loadPlans = () => {
    api('/registrations/' + user.id).then(setRows).catch((e) => notify(e.message, 'error'));
  };

  useEffect(() => { loadPlans(); }, [user]);

  const handleCancel = async (eventId, eventTitle) => {
    if (!window.confirm(`Cancel your registration for "${eventTitle}"?`)) return;
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

      <section className="max-w-[1140px] mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted mb-1">REGISTERED SESSIONS</p>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-ink">My Event Schedule</h1>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-md">
            {[
              ['all', 'All Events'],
              ['upcoming', 'Upcoming'],
              ['completed', 'Completed & Attended'],
            ].map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`text-xs px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${
                  tab === k ? 'bg-white text-ink shadow-xs' : 'text-subtle hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filteredRows.length ? (
          <div className="space-y-3 max-w-3xl">
            {filteredRows.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-border p-4 rounded-lg shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="text-center w-12 shrink-0 py-1 bg-gray-50 border border-border rounded">
                    <b className="font-semibold text-base block text-ink">{new Date(r.date + 'T00:00').getDate()}</b>
                    <span className="font-mono text-[10px] uppercase text-muted block">
                      {new Date(r.date + 'T00:00').toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-medium uppercase font-mono text-muted bg-gray-100 px-1.5 py-0.5 rounded inline-block mb-1">
                      {r.category}
                    </span>
                    <h3 className="font-medium text-sm text-ink">{r.title}</h3>
                    <p className="text-xs text-muted">{r.time} · {r.venue}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 ml-16 sm:ml-0">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                    r.status === 'Attended' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {r.status}
                  </span>

                  <button
                    onClick={() => setCert(r)}
                    className="text-xs bg-[#cfe870] hover:bg-[#d9f07a] text-[#183d28] font-semibold px-3 py-1.5 rounded transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <CertificateIcon className="w-3.5 h-3.5" />
                    Certificate
                  </button>

                  <button
                    onClick={() => handleCancel(r.id, r.title)}
                    className="text-xs text-red-600 hover:text-red-800 border border-border hover:border-red-300 px-2.5 py-1.5 rounded font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg border border-border text-center text-muted text-xs max-w-lg">
            No events in this schedule. Browse upcoming campus events to register.
          </div>
        )}
      </section>
    </>
  );
}

// ── Profile (Academic Record & Digital Student ID) ──────────────────────────
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
    <section className="max-w-[1140px] mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1">
      <div className="flex items-center justify-between max-w-xl mb-6 pb-4 border-b border-border">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted mb-1">INSTITUTIONAL RECORD</p>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-ink">Student Profile & Credentials</h1>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs bg-college hover:bg-college-light text-white px-3.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer"
          >
            Edit Profile
          </button>
        )}
      </div>

      {err && <p className="text-red-600 text-xs mb-4 max-w-xl bg-red-50 p-2.5 rounded border border-red-200">{err}</p>}

      {editing ? (
        <form onSubmit={saveProfile} className="bg-white border border-border rounded-lg p-6 max-w-xl shadow-card space-y-4">
          <h3 className="font-semibold text-sm text-ink pb-2 border-b border-border">Update Student Record</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <label className="sm:col-span-2 text-xs font-medium text-subtle flex flex-col gap-1">
              Full Name
              <input
                required
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-border p-2 bg-white rounded-md text-sm focus:ring-1 focus:ring-college focus:outline-none"
              />
            </label>
            <label className="text-xs font-medium text-subtle flex flex-col gap-1">
              Registration Number
              <input
                value={form.reg_no || ''}
                onChange={(e) => setForm({ ...form, reg_no: e.target.value })}
                className="border border-border p-2 bg-white rounded-md text-sm font-mono focus:ring-1 focus:ring-college focus:outline-none"
              />
            </label>
            <label className="text-xs font-medium text-subtle flex flex-col gap-1">
              Department
              <input
                value={form.department || ''}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="border border-border p-2 bg-white rounded-md text-sm focus:ring-1 focus:ring-college focus:outline-none"
              />
            </label>
            <label className="text-xs font-medium text-subtle flex flex-col gap-1">
              Class / Section
              <input
                value={form.class || ''}
                onChange={(e) => setForm({ ...form, class: e.target.value })}
                className="border border-border p-2 bg-white rounded-md text-sm focus:ring-1 focus:ring-college focus:outline-none"
              />
            </label>
            <label className="text-xs font-medium text-subtle flex flex-col gap-1">
              Phone Number
              <input
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="border border-border p-2 bg-white rounded-md text-sm font-mono focus:ring-1 focus:ring-college focus:outline-none"
              />
            </label>
            <label className="sm:col-span-2 text-xs font-medium text-subtle flex flex-col gap-1">
              Interests & Keywords
              <input
                value={form.interests || ''}
                onChange={(e) => setForm({ ...form, interests: e.target.value })}
                placeholder="Technical, Hackathons, Cultural"
                className="border border-border p-2 bg-white rounded-md text-sm focus:ring-1 focus:ring-college focus:outline-none"
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => { setEditing(false); setForm(data); }}
              className="text-xs px-3.5 py-1.5 border border-border rounded-md font-medium text-subtle hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-college hover:bg-college-light text-white text-xs font-medium px-4 py-1.5 rounded-md shadow-xs cursor-pointer"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* Details Table */}
          <div className="bg-white border border-border rounded-lg shadow-card divide-y divide-border overflow-hidden">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between px-4 py-3 gap-4">
                <span className="text-xs text-muted font-medium shrink-0">{label}</span>
                <span className="text-xs font-medium text-ink text-right break-all">{value || '—'}</span>
              </div>
            ))}
          </div>

          {/* Institutional Student Card */}
          <div className="bg-white border border-border rounded-lg shadow-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-college text-white text-[10px] font-bold grid place-items-center">
                    PMC
                  </div>
                  <span className="text-xs font-semibold text-ink">Er. Perumal Manimekalai College</span>
                </div>
                <span className="text-[10px] font-mono text-muted uppercase">Student ID</span>
              </div>

              <div className="space-y-1 mb-4">
                <h3 className="font-semibold text-base text-ink">{data.name}</h3>
                <p className="text-xs font-mono text-college font-medium">{data.reg_no || 'NOT ASSIGNED'}</p>
                <p className="text-xs text-subtle">{data.department} · {data.class}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted">
              <span>Status: <strong className="text-emerald-700">Verified Member</strong></span>
              <span className="font-mono">Dept of IT</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ── Admin Command Center (Institutional Portal) ─────────────────────────────
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
      notify('Event published.', 'success');
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
      notify('Draft filled with Gemini AI.', 'success');
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
      message: `Permanently delete student "${userName}" and all associated event registrations?`,
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
      message: `Permanently erase all ${users.length} registered student accounts and delete all their event registrations. The admin account will remain untouched.`,
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
    const headers = ['#', 'Student Name', 'Reg No', 'Department', 'Class', 'Email', 'Phone', 'Registrations'];
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

      <section className="max-w-[1140px] mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted mb-1">EVENT OFFICE PORTAL</p>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-ink">Administrative Dashboard</h1>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-1 bg-gray-100 p-1 rounded-md">
            {[
              ['rosters', 'Events & Rosters'],
              ['users', 'Student Directory'],
              ['publish', 'Publish Event'],
              ['analytics', 'Analytics'],
            ].map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`text-xs px-3.5 py-1.5 rounded font-medium transition-colors cursor-pointer ${
                  tab === k ? 'bg-white text-ink shadow-xs' : 'text-subtle hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
          {[
            ['Active Events', stats.events || 0],
            ['Total Registrations', stats.registrations || 0],
            ['Enrolled Students', stats.students || 0],
            ['Verified Attendance', stats.attended || 0],
          ].map(([label, val]) => (
            <div key={label} className="bg-white p-4 rounded-lg border border-border shadow-card">
              <span className="text-[11px] font-mono text-muted uppercase block mb-1">{label}</span>
              <b className="text-2xl font-semibold text-ink block">{val}</b>
            </div>
          ))}
        </div>

        {/* ── TAB 1: EVENTS & ROSTERS ── */}
        {tab === 'rosters' && (
          <div className="bg-white p-6 border border-border rounded-lg shadow-card">
            <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-semibold text-ink">Active Events & Participant Rosters</h2>
                <p className="text-xs text-muted mt-0.5">View enrolled students and verify attendance credentials.</p>
              </div>
              <button
                onClick={() => setTab('publish')}
                className="bg-college hover:bg-college-light text-white text-xs font-medium px-3.5 py-1.5 rounded-md transition-colors cursor-pointer"
              >
                + New Event
              </button>
            </div>

            {(!events || events.length === 0) ? (
              <p className="text-xs text-muted py-8 text-center">No active events found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((ev) => {
                  const totalSeats = ev.seats || 50;
                  const regCount = ev.registered || 0;
                  const pct = Math.min(100, Math.round((regCount / totalSeats) * 100));

                  return (
                    <div key={ev.id} className="p-4 border border-border rounded-lg bg-gray-50/50 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-mono uppercase bg-gray-200 text-subtle px-2 py-0.5 rounded font-medium">
                            {ev.category}
                          </span>
                          <span className="text-xs text-muted font-mono">{ev.date}</span>
                        </div>
                        <h4 className="font-medium text-sm text-ink">{ev.title}</h4>
                        <p className="text-xs text-muted mt-0.5">{ev.time} · {ev.venue}</p>

                        <div className="mt-2.5 bg-white p-2 border border-border rounded">
                          <div className="flex justify-between text-[11px] text-muted mb-1 font-mono">
                            <span>Enrolled: {regCount} / {totalSeats}</span>
                            <span>{pct}% filled</span>
                          </div>
                          <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                            <div className="bg-college h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <button
                          type="button"
                          onClick={() => openAttendees(ev.id)}
                          className="bg-college-surface text-college hover:bg-college hover:text-white text-xs font-medium px-3 py-1.5 rounded border border-college/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <UsersIcon className="w-3.5 h-3.5" />
                          <span>View Students ({regCount})</span>
                        </button>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => editEvent(ev)}
                            className="text-xs text-subtle hover:text-ink border border-border px-2.5 py-1 rounded bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteEvent(ev.id)}
                            className="text-xs text-red-600 hover:text-red-800 border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
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
          <div className="bg-white p-6 border border-border rounded-lg shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-semibold text-ink">Registered Student Directory</h2>
                <p className="text-xs text-muted mt-0.5">Manage registered accounts and export student attendance lists.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={exportUsersCSV}
                  disabled={!users.length}
                  className="bg-white border border-border hover:bg-gray-50 text-subtle text-xs px-3.5 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <DownloadIcon className="w-3.5 h-3.5" />
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAllUsers}
                  disabled={!users.length}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-medium px-3.5 py-1.5 rounded-md transition-colors cursor-pointer shadow-xs"
                  title="Remove all registered students"
                >
                  Delete All Registered Students
                </button>
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="relative max-w-sm w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                  <SearchIcon className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search by name, reg no, department..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-border rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-college"
                />
              </div>
              <span className="text-xs font-mono text-muted">
                Total: {filteredUsers.length} students
              </span>
            </div>

            {/* Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              {loadingUsers ? (
                <div className="py-12 text-center text-muted text-xs">Loading directory…</div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-muted text-xs">
                  {userSearch ? 'No students match your search.' : 'No registered students.'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                    <thead className="bg-gray-50 text-subtle font-medium sticky top-0 border-b border-border text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="p-3 w-10 text-center">#</th>
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Reg No</th>
                        <th className="p-3">Department & Class</th>
                        <th className="p-3">Contact</th>
                        <th className="p-3 text-center">Registrations</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.map((u, idx) => (
                        <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="p-3 text-center text-muted font-mono">{idx + 1}</td>
                          <td className="p-3 font-medium text-ink">{u.name}</td>
                          <td className="p-3 font-mono text-subtle">{u.reg_no}</td>
                          <td className="p-3 text-muted">{u.department} · {u.class}</td>
                          <td className="p-3 font-mono text-subtle text-[11px]">
                            <div>{u.email}</div>
                            {u.phone && <div className="text-muted">{u.phone}</div>}
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-block bg-gray-100 text-subtle font-mono text-[11px] px-2 py-0.5 rounded">
                              {u.registrations_count || 0}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="text-red-600 hover:underline text-xs font-medium cursor-pointer"
                            >
                              Delete
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

        {/* ── TAB 3: PUBLISH EVENT ── */}
        {tab === 'publish' && (
          <div className="space-y-4 max-w-2xl">
            {/* AI Assistant Help */}
            <div className="bg-college-surface border border-college/20 p-4 rounded-lg">
              <span className="text-xs font-semibold text-college block mb-1">
                Editorial Assistant (Gemini)
              </span>
              <p className="text-xs text-subtle mb-2.5 leading-relaxed">
                Enter rough notes, prerequisites, or topics, and the drafting tool will populate title, category, timings, and description.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 24hr hackathon in C block auditorium with mentoring and prizes"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && aiAutoFill()}
                  className="flex-1 bg-white border border-border text-ink px-3 py-1.5 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-college"
                />
                <button
                  type="button"
                  onClick={aiAutoFill}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="bg-college hover:bg-college-light text-white text-xs font-medium px-4 py-1.5 rounded-md transition-colors disabled:opacity-40 cursor-pointer"
                >
                  {aiLoading ? 'Drafting…' : 'Generate Draft'}
                </button>
              </div>
              {aiError && <p className="text-red-600 text-xs mt-2">{aiError}</p>}
            </div>

            {/* Event Form */}
            <form
              className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-white p-6 border border-border rounded-lg shadow-card"
              onSubmit={submitEvent}
            >
              <h2 className="sm:col-span-2 text-base font-semibold text-ink pb-2 border-b border-border">
                Event Information
              </h2>
              {[
                ['title', 'Event Title'],
                ['date', 'Date'],
                ['time', 'Time'],
                ['venue', 'Venue'],
                ['deadline', 'Registration Deadline'],
              ].map(([k, l]) => (
                <label key={k} className="text-xs font-medium text-subtle flex flex-col gap-1">
                  {l}
                  <input
                    required
                    type={k === 'date' || k === 'deadline' ? 'date' : 'text'}
                    value={form[k] || ''}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    className="border border-border p-2 bg-white rounded-md text-sm focus:ring-1 focus:ring-college focus:outline-none"
                  />
                </label>
              ))}

              <label className="text-xs font-medium text-subtle flex flex-col gap-1">
                Category
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="border border-border p-2 bg-white rounded-md text-sm focus:ring-1 focus:ring-college focus:outline-none"
                >
                  {['Workshop', 'Technical', 'Cultural', 'Placement', 'Seminar'].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>

              <label className="text-xs font-medium text-subtle flex flex-col gap-1">
                Seat Capacity
                <input
                  required
                  type="number"
                  min="1"
                  value={form.seats || 50}
                  onChange={(e) => setForm({ ...form, seats: parseInt(e.target.value, 10) || 50 })}
                  className="border border-border p-2 bg-white rounded-md text-sm focus:ring-1 focus:ring-college focus:outline-none"
                />
              </label>

              <label className="sm:col-span-2 text-xs font-medium text-subtle flex flex-col gap-1">
                Description & Agenda
                <textarea
                  rows="3"
                  required
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Outline syllabus, prerequisite skills, mentors, and perks..."
                  className="border border-border p-2 bg-white rounded-md text-sm focus:ring-1 focus:ring-college focus:outline-none"
                />
              </label>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  className="bg-college hover:bg-college-light text-white px-5 py-2 rounded-md text-xs font-medium shadow-xs transition-colors cursor-pointer"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB 4: ANALYTICS & INSIGHTS ── */}
        {tab === 'analytics' && (
          <div className="bg-white p-6 border border-border rounded-lg shadow-card space-y-5 max-w-2xl">
            <h2 className="text-base font-semibold text-ink">System Participation Overview</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-border p-4 rounded-lg bg-gray-50/50">
                <h4 className="text-xs font-mono uppercase text-muted mb-3 font-semibold">Events by Category</h4>
                <div className="space-y-2 text-xs">
                  {Object.entries(stats.categories || {}).map(([cat, cnt]) => (
                    <div key={cat} className="flex items-center justify-between">
                      <span className="font-medium text-ink">{cat}</span>
                      <span className="font-mono text-muted">{cnt} events</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-border p-4 rounded-lg bg-gray-50/50">
                <h4 className="text-xs font-mono uppercase text-muted mb-3 font-semibold">Attendance Summary</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">Total Registrations</span>
                    <strong className="text-ink">{stats.registrations || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Verified Attended</span>
                    <strong className="text-emerald-700">{stats.attended || 0}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Attendance Rate</span>
                    <strong className="text-college font-mono">
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

// ── Auth Component (Sign In / Register) ─────────────────────────────────────
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 grid place-items-center p-4">
      <form
        onSubmit={go}
        className="bg-white w-full max-w-[400px] p-6 sm:p-8 relative shadow-modal border border-border rounded-xl max-h-[92vh] overflow-y-auto"
      >
        <button
          type="button"
          className="absolute right-4 top-4 text-muted hover:text-ink text-xl font-bold cursor-pointer"
          onClick={close}
        >
          ×
        </button>

        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded bg-college text-white text-xs font-bold grid place-items-center">
            PMC
          </div>
          <span className="font-semibold text-sm text-ink">Campus Circle</span>
        </div>

        <h1 className="text-xl font-semibold text-ink mb-1">
          {newUser ? 'Create Student Account' : 'Student & Staff Sign In'}
        </h1>
        <p className="text-muted text-xs mb-5">
          {newUser ? 'Register with your college details to enroll in sessions.' : 'Sign in with your registered college email.'}
        </p>

        <div className="space-y-3">
          {newUser && (
            <>
              <label className="block text-xs font-medium text-subtle">
                Full Name
                <input
                  required
                  value={d.name || ''}
                  onChange={(e) => setD({ ...d, name: e.target.value })}
                  placeholder="e.g. Abhilash R"
                  className="w-full border border-border p-2 mt-1 bg-white rounded-md text-sm focus:ring-1 focus:ring-college focus:outline-none"
                />
              </label>
              <label className="block text-xs font-medium text-subtle">
                Registration Number
                <input
                  required
                  placeholder="610825BIT001"
                  value={d.reg_no || ''}
                  onChange={(e) => setD({ ...d, reg_no: e.target.value })}
                  className="w-full border border-border p-2 mt-1 bg-white rounded-md text-sm font-mono focus:ring-1 focus:ring-college focus:outline-none"
                />
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <label className="block text-xs font-medium text-subtle">
                  Department
                  <input
                    required
                    placeholder="IT"
                    value={d.department || ''}
                    onChange={(e) => setD({ ...d, department: e.target.value })}
                    className="w-full border border-border p-2 mt-1 bg-white rounded-md text-sm focus:ring-1 focus:ring-college focus:outline-none"
                  />
                </label>
                <label className="block text-xs font-medium text-subtle">
                  Class / Year
                  <input
                    required
                    placeholder="IV IT A"
                    value={d.class || ''}
                    onChange={(e) => setD({ ...d, class: e.target.value })}
                    className="w-full border border-border p-2 mt-1 bg-white rounded-md text-sm focus:ring-1 focus:ring-college focus:outline-none"
                  />
                </label>
              </div>
              <label className="block text-xs font-medium text-subtle">
                Phone Number (Optional)
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={d.phone || ''}
                  onChange={(e) => setD({ ...d, phone: e.target.value })}
                  className="w-full border border-border p-2 mt-1 bg-white rounded-md text-sm font-mono focus:ring-1 focus:ring-college focus:outline-none"
                />
              </label>
            </>
          )}

          <label className="block text-xs font-medium text-subtle">
            Email Address
            <input
              required
              type="email"
              value={d.email || ''}
              onChange={(e) => setD({ ...d, email: e.target.value })}
              placeholder="student@campus.edu"
              className="w-full border border-border p-2 mt-1 bg-white rounded-md text-sm focus:ring-1 focus:ring-college focus:outline-none"
            />
          </label>
          <label className="block text-xs font-medium text-subtle">
            Password
            <input
              required
              type="password"
              minLength={newUser ? 6 : undefined}
              value={d.password || ''}
              onChange={(e) => setD({ ...d, password: e.target.value })}
              className="w-full border border-border p-2 mt-1 bg-white rounded-md text-sm focus:ring-1 focus:ring-college focus:outline-none"
            />
          </label>
        </div>

        {err && <p className="text-red-600 text-xs font-medium mt-3 bg-red-50 p-2 rounded border border-red-200">{err}</p>}

        <button
          disabled={loading}
          className="bg-college hover:bg-college-light text-white w-full py-2.5 rounded-md text-xs font-medium mt-4 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
        >
          {loading ? 'Please wait…' : newUser ? 'Create Account' : 'Sign In'}
        </button>

        <button
          type="button"
          className="w-full text-center text-college hover:underline text-xs mt-3 block font-medium cursor-pointer"
          onClick={() => { setNewUser(!newUser); setErr(''); }}
        >
          {newUser ? 'Already registered? Sign in' : 'New student? Register here'}
        </button>

        <div className="mt-4 pt-3 border-t border-border text-center text-[11px] font-mono text-muted bg-gray-50 p-2 rounded">
          Admin account: <strong>admin@campus.edu</strong> / <strong>admin123</strong>
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
    notify(`Signed in as ${u.name}.`, 'success');
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Delete this event listing and associated registrations?')) return;
    try {
      await api(`/events/${id}`, { method: 'DELETE' });
      notify('Event removed.', 'success');
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
      notify("Seat confirmed. Confirmation email dispatched.", 'success');
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
    { key: 'my-events', label: 'My Schedule', auth: true },
    { key: 'profile', label: 'Profile', auth: true },
    { key: 'admin', label: 'Admin Portal', adminOnly: true },
  ].filter((n) => {
    if (n.adminOnly) return user?.role === 'admin';
    if (n.auth) return !!user;
    return true;
  });

  return (
    <>
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* ── College Header Bar ── */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => navigate('discover')}
          >
            <div className="w-8 h-8 rounded bg-college text-white text-xs font-bold grid place-items-center tracking-wider">
              PMC
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-ink leading-tight">Campus Circle</span>
              <span className="text-[10px] text-muted hidden sm:inline">Er. Perumal Manimekalai College of Engineering</span>
            </div>
          </a>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((n) => {
              const active = view === n.key;
              return (
                <button
                  key={n.key}
                  className={`text-xs px-3.5 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-college text-white shadow-xs'
                      : 'text-subtle hover:text-ink hover:bg-gray-100'
                  }`}
                  onClick={() => navigate(n.key)}
                >
                  {n.label}
                </button>
              );
            })}
          </nav>

          {/* Right User Bar */}
          <div className="flex items-center gap-2 text-xs">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-1.5 border border-border py-1 px-2.5 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate('profile')}
                >
                  <span className="w-5 h-5 rounded-full bg-college text-white font-semibold text-[10px] grid place-items-center">
                    {user.name[0]}
                  </span>
                  <span className="font-medium text-ink max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                </button>
                <button
                  className="hidden sm:inline-block text-muted hover:text-ink px-2 py-1 transition-colors cursor-pointer"
                  onClick={() => { localStorage.removeItem('campus-user'); setUser(null); navigate('discover'); notify('Signed out.', 'info'); }}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                className="bg-college hover:bg-college-light text-white text-xs font-medium px-3.5 py-1.5 rounded-md transition-colors shadow-xs cursor-pointer"
                onClick={() => setModal(true)}
              >
                Sign in
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-1.5 text-muted hover:text-ink cursor-pointer flex items-center justify-center rounded border border-border"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle navigation"
            >
              {menuOpen ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-border px-4 py-3 flex flex-col gap-1 z-40 shadow-card">
          {navItems.map((n) => (
            <button
              key={n.key}
              className={`text-left py-2 px-2.5 text-xs rounded font-medium transition-colors cursor-pointer ${
                view === n.key ? 'bg-college text-white' : 'text-subtle hover:bg-gray-100'
              }`}
              onClick={() => navigate(n.key)}
            >
              {n.label}
            </button>
          ))}
          {user && (
            <button
              className="text-left py-2 px-2.5 text-xs text-red-600 border-t border-border mt-1 font-medium cursor-pointer"
              onClick={() => { localStorage.removeItem('campus-user'); setUser(null); navigate('discover'); setMenuOpen(false); notify('Signed out.', 'info'); }}
            >
              Sign out
            </button>
          )}
        </div>
      )}

      {/* Main Views */}
      <main className="flex-1 flex flex-col">
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
          onSaved={() => { setEditingEvent(null); refresh(); notify('Event updated.', 'success'); }}
        />
      )}

      {certModal && user && (
        <CertificateModal cert={certModal} user={user} onClose={() => setCertModal(null)} />
      )}

      {/* Footer */}
      <footer className="border-t border-border mt-auto py-8 px-4 sm:px-6 bg-white text-xs text-muted">
        <div className="max-w-[1140px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink">Campus Circle</span>
            <span>·</span>
            <span>Er. Perumal Manimekalai College of Engineering</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Department of Information Technology</span>
            <span>·</span>
            <span>Official Event Registry</span>
          </div>
        </div>
      </footer>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
