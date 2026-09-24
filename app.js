"use strict";
// Toggle to enable or disable the AI support widget globally.
// Set to `true` to render the widget, or `false` to prevent it from rendering.
// You can change this value as needed.
window.ENABLE_AI_SUPPORT_WIDGET = false;


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
    toast.innerHTML = `<div class="toast-msg"></div><button class="toast-close" aria-label="Close">&times;</button>`;
    toast.querySelector('.toast-msg').textContent = msg;
    container.appendChild(toast);
    requestAnimationFrame(() => { requestAnimationFrame(() => { toast.classList.add("show"); }); });

    const closeBtn = toast.querySelector('.toast-close');
    let hideTimeout = setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, duration);

    closeBtn.addEventListener('click', () => {
        clearTimeout(hideTimeout);
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 200);
    });
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
    const src = dark ? "assets/logo_horizontal (dark bridge).svg" : "assets/logo_horizontal.svg";
    const height = "38px";
    return `<img src="${src}" alt="Bridge Up" style="height:${height}">`;
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



// ===========================================


const AI_SUPPORT_WIDGET_DEFAULTS = {
    portraitUrl: "./images/support-agent.jpg",
    feedbackUrl: "https://forms.gle/Ga3BMMrb7mSNCXHE9",
    title: "Bridge Up Assistant",
    subtitle: "Ask questions, get quick help, or send product feedback.",
    welcomeMessage: "Hi — I’m your Bridge Up assistant. I can help with platform questions, onboarding guidance, or direct you to the feedback form.",
    placeholder: "Ask anything about Bridge Up…",
    badgeText: "AI",
    systemPrompt: "You are the Bridge Up support assistant. Be concise, helpful, friendly, and product-aware. If you are uncertain, say so clearly. Never invent platform features. Prefer practical next steps. Encourage users to use the feedback form for bugs, UX issues, or ideas.",
    apiEndpoint: "/api/bridge-up-assistant",
    quickActions: [
        "How do I get started?",
        "How does XP work?",
        "Where can I find internships?"
    ],
    mount: null
};

function initAISupportWidget(overrides = {}) {
    if (typeof window !== "undefined" && window.ENABLE_AI_SUPPORT_WIDGET === false) {
        return null;
    }
    return initAiSupportWidget(overrides);
}

function initAiSupportWidget(overrides = {}) {
    const settings = {
        ...AI_SUPPORT_WIDGET_DEFAULTS,
        ...overrides,
        mount: overrides.mount || AI_SUPPORT_WIDGET_DEFAULTS.mount || document.body
    };

    if (!settings.mount) return null;

    const widget = document.createElement("section");
    widget.className = "ai-support-widget";
    widget.setAttribute("aria-label", "Bridge Up AI support widget");

    widget.innerHTML = `
        <div class="ai-support-panel" id="aiSupportPanel" aria-hidden="true">
            <div class="ai-support-header">
                <button class="ai-support-close" type="button" aria-label="Close assistant">
                    <i data-lucide="x"></i>
                </button>

                <div class="ai-support-header-top">
                    <img class="ai-support-avatar" src="${settings.portraitUrl}" alt="Bridge Up assistant portrait" />
                    <div class="ai-support-title">
                        <h3>${settings.title}</h3>
                        <p>${settings.subtitle}</p>
                    </div>
                </div>

                <div class="ai-support-status">AI assistant available</div>
            </div>

            <div class="ai-support-body">
                <div class="ai-support-messages" id="aiSupportMessages"></div>

                <div class="ai-support-actions" id="aiSupportActions">
                    ${settings.quickActions.map(action => `
                        <button class="ai-support-chip" type="button" data-ai-support-chip="${escapeHtml(action)}">${action}</button>
                    `).join("")}
                </div>

                <form class="ai-support-form" id="aiSupportForm">
                    <div class="ai-support-input-wrap">
                        <textarea
                            id="aiSupportInput"
                            class="ai-support-input"
                            rows="1"
                            placeholder="${settings.placeholder}"
                        ></textarea>
                        <button class="ai-support-send" type="submit" aria-label="Send message">
                            <i data-lucide="send-horizontal"></i>
                        </button>
                    </div>
                    <div class="ai-support-note">Powered by AI. For account-specific issues, also use the feedback form so your message reaches the team.</div>
                </form>

                <div class="ai-support-feedback">
                    <a class="ai-support-feedback-link" href="${settings.feedbackUrl}" target="_blank" rel="noopener noreferrer">
                        <div class="ai-support-feedback-copy">
                            <strong>Share feedback</strong>
                            <span>Report friction, suggest ideas, or tell us what should improve.</span>
                        </div>
                        <i data-lucide="arrow-up-right"></i>
                    </a>
                </div>
            </div>
        </div>

        <button class="ai-support-trigger" type="button" aria-label="Open Bridge Up assistant" aria-expanded="false">
            <span class="ai-support-trigger-ring" aria-hidden="true"></span>
            <span class="ai-support-trigger-pulse" aria-hidden="true"></span>
            <img class="ai-support-trigger-image" src="${settings.portraitUrl}" alt="" />
            <span class="ai-support-trigger-badge">${settings.badgeText}</span>
        </button>
    `;

    settings.mount.appendChild(widget);

    const trigger = widget.querySelector(".ai-support-trigger");
    const closeBtn = widget.querySelector(".ai-support-close");
    const panel = widget.querySelector(".ai-support-panel");
    const form = widget.querySelector("#aiSupportForm");
    const input = widget.querySelector("#aiSupportInput");
    const messages = widget.querySelector("#aiSupportMessages");
    const sendButton = widget.querySelector(".ai-support-send");
    const actions = widget.querySelector("#aiSupportActions");

    let isOpen = false;
    let isLoading = false;
    let hasStarted = false;
    let history = [
        { role: "system", content: settings.systemPrompt }
    ];

    function renderLucide() {
        if (window.lucide) window.lucide.createIcons();
    }

    function autoGrowTextarea() {
        input.style.height = "auto";
        input.style.height = `${Math.min(input.scrollHeight, 104)}px`;
    }

    function scrollMessagesToBottom() {
        messages.scrollTop = messages.scrollHeight;
    }

    function setOpen(nextState) {
        isOpen = nextState;
        widget.classList.toggle("is-open", isOpen);
        panel.setAttribute("aria-hidden", String(!isOpen));
        trigger.setAttribute("aria-expanded", String(isOpen));
        trigger.setAttribute("aria-label", isOpen ? "Close Bridge Up assistant" : "Open Bridge Up assistant");
        if (isOpen) {
            setTimeout(() => input.focus(), 120);
            scrollMessagesToBottom();
        }
    }

    function markStarted() {
        if (hasStarted) return;
        hasStarted = true;
        widget.classList.add("has-started");
        actions?.classList.add("ai-support-hidden");
    }

    function addMessage(role, text) {
        const bubble = document.createElement("div");
        bubble.className = `ai-support-msg ${role === "user" ? "is-user" : "is-assistant"}`;

        const time = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

        bubble.innerHTML = `
            <div class="ai-support-bubble">${formatMessage(text)}</div>
            <div class="ai-support-meta">${role === "user" ? "You" : "Assistant"} · ${time}</div>
        `;

        messages.appendChild(bubble);
        scrollMessagesToBottom();
    }

    function setLoading(loading) {
        isLoading = loading;
        sendButton.disabled = loading;
        input.disabled = loading;
    }

    async function askAssistant(userText) {
        const response = await fetch(settings.apiEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: userText,
                history: history.filter(item => item.role !== "system")
            })
        });

        if (!response.ok) {
            throw new Error(`Assistant endpoint error: ${response.status}`);
        }

        const data = await response.json();
        return data?.reply?.trim() || "I’m sorry — I couldn’t generate a response just now.";
    }

    async function submitMessage(text) {
        const userText = text.trim();
        if (!userText || isLoading) return;

        markStarted();
        addMessage("user", userText);
        history.push({ role: "user", content: userText });
        input.value = "";
        autoGrowTextarea();
        setLoading(true);

        const typing = document.createElement("div");
        typing.className = "ai-support-msg is-assistant";
        typing.innerHTML = `
            <div class="ai-support-bubble">Thinking…</div>
            <div class="ai-support-meta">Assistant</div>
        `;
        messages.appendChild(typing);
        scrollMessagesToBottom();

        try {
            const reply = await askAssistant(userText);
            typing.remove();
            addMessage("assistant", reply);
            history.push({ role: "assistant", content: reply });
        } catch (error) {
            typing.remove();
            const fallback = "I’m sorry — the assistant is temporarily unavailable. You can still use the feedback form and I recommend trying again in a moment.";
            addMessage("assistant", fallback);
            history.push({ role: "assistant", content: fallback });
            console.error(error);
        } finally {
            setLoading(false);
            input.focus();
        }
    }

    trigger.addEventListener("click", () => setOpen(!isOpen));
    closeBtn.addEventListener("click", () => setOpen(false));

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && isOpen) setOpen(false);
    });

    document.addEventListener("click", event => {
        if (!isOpen) return;
        if (!widget.contains(event.target)) setOpen(false);
    });

    input.addEventListener("input", autoGrowTextarea);

    input.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            form.requestSubmit();
        }
    });

    form.addEventListener("submit", event => {
        event.preventDefault();
        submitMessage(input.value);
    });

    widget.querySelectorAll("[data-ai-support-chip]").forEach(chip => {
        chip.addEventListener("click", () => {
            const value = chip.getAttribute("data-ai-support-chip") || "";
            submitMessage(value);
        });
    });

    addMessage("assistant", settings.welcomeMessage);
    renderLucide();
    autoGrowTextarea();

    return {
        open: () => setOpen(true),
        close: () => setOpen(false),
        destroy: () => widget.remove()
    };
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function formatMessage(value) {
    return escapeHtml(value).replace(/\n/g, "<br>");
}