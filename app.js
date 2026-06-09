"use strict";


// ── UserStore: persistent registry of all registered prototype users ──────────
// Survives logout so a user can re-authenticate after registering.
const UserStore = {
    _key: "bridgeup_users",
    _all() {
        try { return JSON.parse(localStorage.getItem(this._key)) || {}; } catch (e) { return {}; }
    },
    register({ email, password, role, id, name }) {
        const all = this._all();
        all[email.toLowerCase()] = { email: email.toLowerCase(), password, role, id, name };
        localStorage.setItem(this._key, JSON.stringify(all));
    },
    find(email) {
        return this._all()[email.toLowerCase()] || null;
    },
    validate(email, password) {
        const u = this.find(email);
        if (!u) return null;
        if (u.password !== password) return null;
        return u;
    },
};


// ── Pending redirect context for opportunity flows ────────────────────────────
const PendingRedirect = {
    _key: "bridgeup_pending_redirect",
    save(data) {
        if (!data) return;
        localStorage.setItem(this._key, JSON.stringify({
            ...data,
            createdAt: new Date().toISOString()
        }));
    },
    get() {
        try { return JSON.parse(localStorage.getItem(this._key)); } catch (e) { return null; }
    },
    clear() {
        localStorage.removeItem(this._key);
    },
    consume() {
        const data = this.get();
        this.clear();
        return data;
    }
};


function getDefaultRouteForRole(role) {
    return role === "student" ? "student-dashboard.html"
        : role === "recruiter" ? "recruiter-dashboard.html"
            : role === "university" ? "university-dashboard.html"
                : role === "freelancer" ? "marketplace.html"
                    : "student-dashboard.html";
}


function getPostAuthRedirect(role) {
    const pending = PendingRedirect.get();


    if (pending && pending.source === "opportunity-flow") {
        if (role === "student" || role === "freelancer") {
            if (pending.targetUrl) return pending.targetUrl;
            if (pending.jobId) return `job-listing.html?id=${encodeURIComponent(pending.jobId)}`;
            return "job-listing.html";
        }


        PendingRedirect.clear();
        return getDefaultRouteForRole(role);
    }


    return getDefaultRouteForRole(role);
}


function navigateAfterAuth(role) {
    const target = getPostAuthRedirect(role);
    PendingRedirect.clear();
    window.location.href = target;
}


function startOpportunityAuthFlow(jobId = "", extras = {}) {
    const targetUrl = jobId ? `job-listing.html?id=${encodeURIComponent(jobId)}` : "job-listing.html";
    PendingRedirect.save({
        source: "opportunity-flow",
        jobId: jobId || "",
        targetUrl,
        ...extras
    });
    window.location.href = "login.html?intent=opportunity";
}


// ── Session helpers ───────────────────────────────────────────────────────────
const Auth = {
    save(data) { localStorage.setItem("bridgeup_session", JSON.stringify(data)); },
    get() { try { return JSON.parse(localStorage.getItem("bridgeup_session")); } catch (e) { return null; } },
    clear() { localStorage.removeItem("bridgeup_session"); },
    isLoggedIn() { return !!this.get(); },
    getRole() { const s = this.get(); return s ? s.role : null; },
    getId() { const s = this.get(); return s ? s.id : null; },
    logout() {
        this.clear();
        ProfileStore.clear();
        window.location.href = "login.html";
    },
    requireAuth(allowedRoles = [], options = {}) {
        const s = this.get();
        const {
            redirectTo = null,
            pendingRedirect = null
        } = options;


        if (!s) {
            if (pendingRedirect) PendingRedirect.save(pendingRedirect);


            if (redirectTo) {
                window.location.href = redirectTo;
                return null;
            }


            window.location.href = "login.html";
            return null;
        }


        if (allowedRoles.length && !allowedRoles.includes(s.role)) {
            window.location.href = getDefaultRouteForRole(s.role);
            return null;
        }
        return s;
    },
};


// ── ProfileVault: long-term profile storage keyed by user ID ─────────────────
// Survives logout. Allows full profile restore on re-login.
const ProfileVault = {
    _key: "bridgeup_vault",
    _all() {
        try { return JSON.parse(localStorage.getItem(this._key)) || {}; } catch (e) { return {}; }
    },
    save(id, profile) {
        const all = this._all();
        all[id] = profile;
        localStorage.setItem(this._key, JSON.stringify(all));
    },
    get(id) {
        return this._all()[id] || null;
    },
};


// ── ProfileStore: current active session profile ──────────────────────────────
const ProfileStore = {
    _key: "bridgeup_profile",
    save(data) {
        localStorage.setItem(this._key, JSON.stringify(data));
        if (data && data.id) ProfileVault.save(data.id, data);
    },
    get() { try { return JSON.parse(localStorage.getItem(this._key)); } catch (e) { return null; } },
    clear() { localStorage.removeItem(this._key); },
    patch(patch) {
        const p = this.get() || {};
        const updated = { ...p, ...patch };
        this.save(updated);
    },
    getById(id) { return ProfileVault.get(id); },
};


// ── Resolve current user profile ──────────────────────────────────────────────
// Priority:
//   1. ProfileStore (active session profile)
//   2. ProfileVault (restore after re-login post-logout)
//   3. BridgeDB lookup (demo accounts only)
// Never falls back to a random BridgeDB record.
function resolveProfile(session) {
    if (!session) return null;


    const stored = ProfileStore.get();
    if (stored && stored.id === session.id) return stored;


    const vaulted = ProfileVault.get(session.id);
    if (vaulted) {
        ProfileStore.save(vaulted);
        return vaulted;
    }


    if (session.role === "student") {
        const s = typeof BridgeDB !== "undefined" ? BridgeDB.getStudentById(session.id) : null;
        if (s) { const p = { ...s, role: "student" }; ProfileStore.save(p); return p; }
    } else if (session.role === "recruiter") {
        const r = typeof BridgeDB !== "undefined" ? BridgeDB.getRecruiterById(session.id) : null;
        if (r) { const p = { ...r, role: "recruiter" }; ProfileStore.save(p); return p; }
    } else if (session.role === "university") {
        const u = typeof BridgeDB !== "undefined" ? BridgeDB.getUniversityById(session.id) : null;
        if (u) { const p = { ...u, role: "university" }; ProfileStore.save(p); return p; }
    }


    if (stored) return stored;
    return null;
}


// ── Toast notifications ───────────────────────────────────────────────────────
function showToast(msg, type = "info", duration = 3500) {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    requestAnimationFrame(() => { requestAnimationFrame(() => { toast.classList.add("show"); }); });
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, duration);
}


// ── Modal helpers ─────────────────────────────────────────────────────────────
function openModal(id) { document.getElementById(id)?.classList.add("open"); }
function closeModal(id) { document.getElementById(id)?.classList.remove("open"); }


// ── Avatar initials ───────────────────────────────────────────────────────────
function avatarInitials(name = "") {
    const parts = name.trim().split(" ");
    return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
}


// ── Relative time ─────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const d = Math.floor(diff / 86400000);
    if (d === 0) return "Today";
    if (d === 1) return "Yesterday";
    if (d < 30) return `${d} days ago`;
    if (d < 365) return `${Math.floor(d / 30)} months ago`;
    return `${Math.floor(d / 365)} years ago`;
}


// ── XP progress percentage ────────────────────────────────────────────────────
function xpProgress(xp) {
    const level = BridgeDB.getLevel(xp);
    const range = level.max - level.min;
    const progress = xp - level.min;
    return Math.min(100, Math.round((progress / range) * 100));
}


// ── Render navbar logo ────────────────────────────────────────────────────────
function renderLogo(dark = false) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 80" fill="none" style="height:38px">
        <defs>
            <linearGradient id="gLogo" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#FACC15"/>
                <stop offset="100%" stop-color="#F97316"/>
            </linearGradient>
        </defs>
        <path d="M10 55 Q22 20 38 55" stroke="url(#gLogo)" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M28 55 Q44 10 62 55" stroke="url(#gLogo)" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M50 55 Q70 5 90 55" stroke="url(#gLogo)" stroke-width="5.5" fill="none" stroke-linecap="round"/>
        <text x="10" y="75" font-family="Montserrat,sans-serif" font-weight="700" font-size="22"
            fill="${dark ? "#0F172A" : "#F1F5F9"}">Bridge</text>
        <text x="82" y="75" font-family="Montserrat,sans-serif" font-weight="700" font-size="22"
            fill="url(#gLogo)">Up</text>
    </svg>`;
}


// ── Render XP bar ─────────────────────────────────────────────────────────────
function renderXPBar(xp) {
    const level = BridgeDB.getLevel(xp);
    const pct = xpProgress(xp);
    return `
        <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                <span class="badge badge-yellow">${level.name}</span>
                <span style="font-size:13px;color:#64748B;font-family:Montserrat,sans-serif;font-weight:600">${xp} XP</span>
            </div>
            <div class="xp-bar-wrap"><div class="xp-bar-fill" style="width:${pct}%"></div></div>
            <div style="font-size:12px;color:#94A3B8;margin-top:4px">Perk: ${level.perk}</div>
        </div>
    `;
}


// ── Build navbar ──────────────────────────────────────────────────────────────
// Keep original shared UI behavior intact — pages depend on these exact links/actions.
function buildNavbar(activePage, role) {
    const session = Auth.get();
    if (!session) return "";


    const dashLink = role === "student"
        ? "student-dashboard.html"
        : role === "recruiter"
            ? "recruiter-dashboard.html"
            : "university-dashboard.html";


    const navItems = role === "student"
        ? [
            { href: dashLink, label: "Dashboard" },
            { href: "job-listing.html", label: "Explore Jobs" },
            { href: "marketplace.html", label: "Marketplace" },
            { href: "chat.html", label: "Messages" },
        ]
        : role === "recruiter"
            ? [
                { href: dashLink, label: "Dashboard" },
                { href: "recruiter-post-job.html", label: "Post a Job" },
                { href: "marketplace.html", label: "Talent Pool" },
                { href: "chat.html", label: "Messages" },
            ]
            : [
                { href: dashLink, label: "Dashboard" },
                { href: "chat.html", label: "Messages" },
            ];


    const links = navItems
        .map(n => `<a href="${n.href}" class="${activePage === n.label ? "active" : ""}">${n.label}</a>`)
        .join("");


    const profileButton = role === "student"
        ? `<a href="student-profile.html"><button class="btn btn-outline btn-sm">My Profile</button></a>`
        : "";


    return `
        <nav class="navbar">
            <a href="${dashLink}" class="nav-brand">${renderLogo()}</a>
            <div class="nav-links">${links}</div>
            <div class="nav-actions">
                ${profileButton}
                <button class="btn btn-primary btn-sm" onclick="Auth.logout()">Logout</button>
            </div>
        </nav>
    `;
}


// ── Render job card ───────────────────────────────────────────────────────────
function renderJobCard(job, opts = {}) {
    const tags = (job.requiredSkills || []).slice(0, 4).map(s => `<span class="tag">${s}</span>`).join("");
    return `
        <div class="job-card" onclick="window.location.href='job-listing.html?id=${job.id}'">
            <div class="job-card-header">
                <div>
                    <div class="job-card-title">${job.title}</div>
                    <div class="job-card-company">${job.company}</div>
                </div>
                <span class="badge ${job.type === 'Internship' ? 'badge-blue' : job.type === 'Freelance Project' ? 'badge-orange' : 'badge-gray'}">${job.type}</span>
            </div>
            <div class="job-card-meta">
                <span>📍 ${job.location}</span>
                <span>⏱ ${job.duration}</span>
                <span>📅 Deadline ${job.deadline}</span>
            </div>
            <div class="job-card-tags">${tags}</div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px">
                <span class="job-xp">+${job.xpReward} XP</span>
                <span style="font-size:13px;color:#64748B">${job.applications} applicants</span>
            </div>
        </div>
    `;
}


// ── Render avatar div ─────────────────────────────────────────────────────────
function renderAvatar(name, size = "md") {
    return `<div class="avatar avatar-${size}" style="display:inline-flex">${avatarInitials(name)}</div>`;
}


// ── Sticky Widget ─────────────────────────────────────────────────────────────
function initStickyWidget() {
    const widget = document.createElement("div");
    widget.id = "stickyWidget";
    widget.className = "sticky-widget";
    widget.innerHTML = `
        <div class="sticky-widget-icon"><span>💬</span></div>
        <div class="sticky-widget-content">
            <p>Interested in Bridge Up?</p>
            <a href="https://forms.gle/Ga3BMMrb7mSNCXHE9" target="_blank" class="sticky-widget-btn">Give Feedback</a>
        </div>
    `;
    document.body.appendChild(widget);


    widget.addEventListener("click", e => {
        if (e.target.closest(".sticky-widget-btn")) return;
        widget.classList.toggle("is-open");
    });


    document.addEventListener("click", e => {
        if (!widget.contains(e.target)) widget.classList.remove("is-open");
    });


    function triggerWiggle() {
        if (widget.classList.contains("is-open")) return;
        widget.classList.add("wiggle");
        widget.addEventListener("animationend", () => widget.classList.remove("wiggle"), { once: true });
    }


    setTimeout(() => {
        triggerWiggle();
        setInterval(triggerWiggle, 5000);
    }, 3000);
}