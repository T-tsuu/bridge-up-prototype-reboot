
// ============================================================
//  BRIDGE UP — app.js  (Shared utilities & auth state)
// ============================================================
"use strict";

// ── Session helpers ───────────────────────────────────────
const Auth = {
  save(data)  { localStorage.setItem("bridgeup_session", JSON.stringify(data)); },
  get()       { try { return JSON.parse(localStorage.getItem("bridgeup_session")); } catch(e){ return null; } },
  clear()     { localStorage.removeItem("bridgeup_session"); },
  isLoggedIn(){ return !!this.get(); },
  getRole()   { const s=this.get(); return s?s.role:null; },
  getId()     { const s=this.get(); return s?s.id:null; },
  logout()    { this.clear(); window.location.href="login.html"; },
  requireAuth(allowedRoles=[]) {
    const s = this.get();
    if(!s) { window.location.href="login.html"; return null; }
    if(allowedRoles.length && !allowedRoles.includes(s.role)) {
      window.location.href = s.role==="student" ? "student-dashboard.html" : s.role==="recruiter" ? "recruiter-dashboard.html" : "university-dashboard.html";
      return null;
    }
    return s;
  },
};

// ── Toast notifications ──────────────────────────────────
function showToast(msg, type="info", duration=3500) {
  let container = document.getElementById("toast-container");
  if(!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  requestAnimationFrame(()=>{ requestAnimationFrame(()=>{ toast.classList.add("show"); }); });
  setTimeout(()=>{
    toast.classList.remove("show");
    setTimeout(()=>toast.remove(), 400);
  }, duration);
}

// ── Modal helpers ─────────────────────────────────────────
function openModal(id)  { document.getElementById(id)?.classList.add("open"); }
function closeModal(id) { document.getElementById(id)?.classList.remove("open"); }

// ── Avatar initials ────────────────────────────────────────
function avatarInitials(name="") {
  const parts = name.trim().split(" ");
  return (parts[0]?.[0]||"") + (parts[1]?.[0]||"");
}

// ── Relative time ──────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff/86400000);
  if(d===0) return "Today";
  if(d===1) return "Yesterday";
  if(d<30)  return `${d} days ago`;
  if(d<365) return `${Math.floor(d/30)} months ago`;
  return `${Math.floor(d/365)} years ago`;
}

// ── XP progress percentage ────────────────────────────────
function xpProgress(xp) {
  const level = BridgeDB.getLevel(xp);
  const range = level.max - level.min;
  const progress = xp - level.min;
  return Math.min(100, Math.round((progress/range)*100));
}

// ── Render navbar logo ────────────────────────────────────
function renderLogo(dark=false) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 80" fill="none" style="height:38px">
    <defs>
      <linearGradient id="gLogo" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FACC15"/><stop offset="100%" stop-color="#F97316"/>
      </linearGradient>
    </defs>
    <path d="M10 55 Q22 20 38 55" stroke="url(#gLogo)" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M28 55 Q44 10 62 55" stroke="url(#gLogo)" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M50 55 Q70 5 90 55" stroke="url(#gLogo)" stroke-width="5.5" fill="none" stroke-linecap="round"/>
    <text x="10" y="75" font-family="Montserrat,sans-serif" font-weight="700" font-size="22" fill="${dark?"#0F172A":"#F1F5F9"}">Bridge</text>
    <text x="82" y="75" font-family="Montserrat,sans-serif" font-weight="700" font-size="22" fill="url(#gLogo)">Up</text>
  </svg>`;
}

// ── Render job card ───────────────────────────────────────
function renderJobCard(job, opts={}) {
  const tags = (job.requiredSkills||[]).slice(0,4).map(s=>`<span class="tag">${s}</span>`).join("");
  return `
  <div class="job-card" onclick="window.location.href='job-listing.html?id=${job.id}'">
    <div class="job-card-header">
      <div>
        <div class="job-card-title">${job.title}</div>
        <div class="job-card-company">${job.company}</div>
      </div>
      <span class="badge ${job.type==='Internship'?'badge-blue':job.type==='Freelance Project'?'badge-orange':'badge-gray'}">${job.type}</span>
    </div>
    <div class="job-card-meta">
      <span>📍 ${job.location}</span>
      <span>⏱ ${job.duration}</span>
      <span>📅 Deadline: ${job.deadline}</span>
    </div>
    <div class="job-card-tags">${tags}</div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px">
      <span class="job-xp">+${job.xpReward} XP</span>
      <span style="font-size:13px;color:#64748B">${job.applications} applicants</span>
    </div>
  </div>`;
}

// ── Render avatar div ─────────────────────────────────────
function renderAvatar(name, size="md") {
  return `<div class="avatar avatar-${size}" style="display:inline-flex">${avatarInitials(name)}</div>`;
}

// ── Render XP bar ─────────────────────────────────────────
function renderXPBar(xp) {
  const level = BridgeDB.getLevel(xp);
  const pct   = xpProgress(xp);
  return `
  <div>
    <div style="display:flex;justify-content:space-between;margin-bottom:6px">
      <span class="badge badge-yellow">${level.name}</span>
      <span style="font-size:13px;color:#64748B;font-family:'Montserrat',sans-serif;font-weight:600">${xp} XP</span>
    </div>
    <div class="xp-bar-wrap"><div class="xp-bar-fill" style="width:${pct}%"></div></div>
    <div style="font-size:12px;color:#94A3B8;margin-top:4px">🎁 Perk: ${level.perk}</div>
  </div>`;
}

// ── Render notification badge in navbar ───────────────────
function buildNavbar(activePage="", role="") {
  const session = Auth.get();
  if(!session) return "";
  const dashLink = role==="student" ? "student-dashboard.html" : role==="recruiter" ? "recruiter-dashboard.html" : "university-dashboard.html";
  const profileLink = role==="student" ? "student-profile.html" : "#";
  const navItems = role==="student" ? [
    {href:dashLink, label:"Dashboard"},
    {href:"job-listing.html", label:"Explore Jobs"},
    {href:"marketplace.html", label:"Marketplace"},
    {href:"chat.html", label:"Messages"},
  ] : role==="recruiter" ? [
    {href:dashLink, label:"Dashboard"},
    {href:"recruiter-post-job.html", label:"Post a Job"},
    {href:"marketplace.html", label:"Talent Pool"},
    {href:"chat.html", label:"Messages"},
  ] : [
    {href:dashLink, label:"Dashboard"},
    {href:"chat.html", label:"Messages"},
  ];
  const links = navItems.map(n=>`<a href="${n.href}" class="${activePage===n.label?"active":""}">${n.label}</a>`).join("");
  return `
  <nav class="navbar">
    <a href="${dashLink}" class="nav-brand">${renderLogo()}</a>
    <div class="nav-links">${links}</div>
    <div class="nav-actions">
      <button class="btn btn-ghost btn-sm" style="color:var(--muted);position:relative" onclick="window.location.href='chat.html'">
        🔔 <span class="notif-dot"></span>
      </button>
      ${role==="student" ? `<a href="student-profile.html"><button class="btn btn-outline btn-sm">My Profile</button></a>` : ""}
      <button class="btn btn-primary btn-sm" onclick="Auth.logout()">Logout</button>
    </div>
  </nav>`;
}


// ─── Sticky Widget ───────────────────────────────────────────

function initStickyWidget() {
  // 1. Inject the HTML
  const widget = document.createElement('div');
  widget.id = 'stickyWidget';
  widget.className = 'sticky-widget';
  widget.innerHTML = `
    <div class="sticky-widget__icon">
      <span>📋</span>
    </div>
    <div class="sticky-widget__content">
      <p>Interested in Bridge Up?</p>
      <a
        href="https://forms.gle/Ga3BMMrb7mSNCXHE9"
        target="_blank"
        class="sticky-widget__btn"
      >
        Give Feedback →
      </a>
    </div>
  `;
  document.body.appendChild(widget);

  // 2. Click toggle
  widget.addEventListener('click', (e) => {
    if (e.target.closest('.sticky-widget__btn')) return;
    widget.classList.toggle('is-open');
  });

  // Close when tapping anywhere else on the page
  document.addEventListener('click', (e) => {
    if (!widget.contains(e.target)) {
      widget.classList.remove('is-open');
    }
  });

  // 3. Auto-wiggle
  function triggerWiggle() {
    if (widget.classList.contains('is-open')) return;
    widget.classList.add('wiggle');
    widget.addEventListener('animationend', () => {
      widget.classList.remove('wiggle');
    }, { once: true });
  }

  setTimeout(() => {
    triggerWiggle();
    setInterval(triggerWiggle, 5000);
  }, 3000);
}

// Run after the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStickyWidget);
} else {
  initStickyWidget(); // DOM already ready
}
