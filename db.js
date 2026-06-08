// ── Helpers ───────────────────────────────────────────────────────────────────
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max) { return +(Math.random() * (max - min) + min).toFixed(1); }

// ── XP Levels ─────────────────────────────────────────────────────────────────
const XP_LEVELS = [
    { name: "Starter", min: 0, max: 200, perk: "Platform badge" },
    { name: "Rising Talent", min: 201, max: 600, perk: "Premium job listings" },
    { name: "Experienced", min: 601, max: 1200, perk: "Course discounts" },
    { name: "Pro", min: 1201, max: 2500, perk: "Featured profile" },
    { name: "Elite", min: 2501, max: Infinity, perk: "Priority placement + exclusive roles" }
];

function getLevel(xp = 0) {
    return XP_LEVELS.find(level => xp >= level.min && xp <= level.max) || XP_LEVELS[0];
}

// ── Random Source Data ────────────────────────────────────────────────────────
const firstNames = ["Amine", "Yasmine", "Nour", "Rayane", "Fares", "Lina", "Sofiane", "Aya", "Adel", "Meriem", "Walid", "Ines", "Tarek", "Rania", "Ismail", "Celia", "Anis", "Sara", "Mehdi", "Nadia"];
const lastNames = ["Benali", "Bouzid", "Hamdi", "Cherif", "Saadi", "Benkhelifa", "Messaoudi", "Belaid", "Rahmani", "Gherbi", "Touati", "Khelifi", "Mansouri", "Zaidi", "Haddad"];
const wilayas = ["Alger", "Oran", "Constantine", "Annaba", "Sétif", "Blida", "Tlemcen", "Batna", "Béjaïa", "Tizi Ouzou"];
const companyNames = ["Sonatrach", "Djezzy", "Yassir", "Cevital", "Ooredoo", "Condor", "Biopharm", "Alliance Assurances", "Air Algérie", "SPA Numidia Tech", "Innotech DZ", "Maghreb Digital"];
const industries = ["Energy", "Telecommunications", "Tech", "Marketing", "Finance", "Healthcare", "Education", "Manufacturing", "Logistics", "Media"];
const jobFields = ["Marketing", "Computer Science", "Finance", "Law", "HR", "Engineering", "Design", "Sales", "Logistics", "Education"];
const skills = ["Excel", "PowerPoint", "Canva", "Photoshop", "Illustrator", "Figma", "JavaScript", "Python", "SQL", "C++", "Public Speaking", "Content Writing", "SEO", "Recruitment", "CAD", "AutoCAD", "Project Management", "Data Analysis"];
const interests = ["Marketing", "Finance", "Design", "IT & Dev", "Engineering", "Law", "HR", "Sales", "Logistics", "Education", "Healthcare", "Other"];
const degrees = ["Bachelor", "Master", "Engineer", "PhD"];
const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Graduate 2025"];
const reviewTexts = [
    "Very professional and eager to learn.",
    "Outstanding contribution during the internship.",
    "Reliable, proactive, and fast learner.",
    "Delivered quality work under tight deadlines.",
    "Great communication and teamwork."
];

const DBuniversities = [
    { id: "UNI001", name: "Université Badji Mokhtar – Annaba", abbreviation: "UBMA", city: "Annaba", email: "university@demo.dz", password: "demo1234", contactPerson: { name: "Fares Hamdi", title: "Vice-Rector of External Relations", dept: "Academic Affairs" } },
    { id: "UNI002", name: "USTHB", abbreviation: "USTHB", city: "Alger", email: "usthb@demo.dz", password: "demo1234", contactPerson: { name: "Nadia Cherif", title: "Career Center Director", dept: "Student Success" } },
    { id: "UNI003", name: "University of Oran 1 Ahmed Ben Bella", abbreviation: "UO1", city: "Oran", email: "oran1@demo.dz", password: "demo1234", contactPerson: { name: "Adel Mansouri", title: "Dean of External Relations", dept: "Partnerships" } },
    { id: "UNI004", name: "University of Constantine 2 Abdelhamid Mehri", abbreviation: "UC2", city: "Constantine", email: "constantine2@demo.dz", password: "demo1234", contactPerson: { name: "Lina Saadi", title: "Academic Affairs Lead", dept: "Academic Affairs" } },
    { id: "UNI005", name: "University of Béjaïa", abbreviation: "UBejaia", city: "Béjaïa", email: "bejaia@demo.dz", password: "demo1234", contactPerson: { name: "Sofiane Zaidi", title: "Vice-Rector", dept: "External Relations" } }
];

const DBrecruiters = Array.from({ length: 50 }, (_, i) => {
    const company = rand(companyNames);
    const name = `${rand(firstNames)} ${rand(lastNames)}`;
    return {
        id: i === 0 ? "REC0001" : `REC${String(i + 1).padStart(4, "0")}`,
        name,
        email: i === 0 ? "recruiter@demo.dz" : `recruiter${i + 1}@mail.dz`,
        password: "demo1234",
        phone: `+213 ${randInt(550, 799)} ${randInt(100000, 999999)}`,
        company,
        industry: rand(industries),
        size: rand(["1-10", "11-50", "51-200", "200+"]),
        city: rand(wilayas),
        description: `${company} is committed to nurturing young talent in Algeria.`,
        joinedViaInvite: false,
        postedJobs: [],
        verified: i % 3 !== 0
    };
});

// Generate 200 students
const DBstudents = Array.from({ length: 200 }, (_, i) => {
    const xp = randInt(0, 2800);
    const level = getLevel(xp);
    const field = rand(jobFields);
    const uni = rand(DBuniversities);
    const studentInterests = [...new Set([field, rand(interests), rand(interests)])].slice(0, 3);
    const studentSkills = [...new Set(Array.from({ length: randInt(2, 6) }, () => rand(skills)))];
    const hasReviews = Math.random() < 0.4;

    return {
        id: i === 0 ? "STU00001" : `STU${String(i + 1).padStart(5, "0")}`,
        name: `${rand(firstNames)} ${rand(lastNames)}`,
        email: i === 0 ? "student@demo.dz" : `student${i + 1}@mail.dz`,
        password: "demo1234",
        phone: Math.random() < 0.4 ? `+213 ${randInt(550, 799)} ${randInt(100000, 999999)}` : null,
        avatar: null,
        university: uni.name,
        universityId: uni.id,
        field,
        degree: rand(degrees),
        year: rand(years),
        interests: studentInterests,
        skills: studentSkills,
        bio: `${rand(degrees)} student in ${field} at ${uni.name}. Passionate about ${rand(interests).toLowerCase()} and eager to gain real-world experience.`,
        xp,
        level: level.name,
        completedJobs: randInt(0, 5),
        certificates: randInt(0, 4),
        applications: randInt(0, 12),
        linkedIn: Math.random() < 0.5 ? `https://linkedin.com/in/${rand(firstNames).toLowerCase()}${randInt(10, 99)}` : null,
        github: Math.random() < 0.6 ? `https://github.com/${rand(firstNames).toLowerCase()}${randInt(10, 99)}` : null,
        freelanceMode: Math.random() < 0.6,
        reviews: hasReviews ? Array.from({ length: randInt(1, 4) }, () => ({
            reviewer: `${rand(firstNames)} ${rand(lastNames)} · ${rand(companyNames)}`,
            rating: randInt(3, 5),
            text: rand(reviewTexts),
            date: `2026-0${randInt(1, 3)}-${String(randInt(1, 28)).padStart(2, "0")}`
        })) : [],
        portfolio: Array.from({ length: randInt(0, 3) }, () => ({
            title: `${rand(["Website Redesign", "Marketing Campaign", "Data Dashboard", "Mobile App", "Brand Identity"])} at ${rand(companyNames)}`,
            duration: `${randInt(1, 6)} months`,
            year: rand([2024, 2025, 2026])
        })),
        createdAt: `2026-0${randInt(1, 3)}-${String(randInt(1, 28)).padStart(2, "0")}`,
        profileComplete: Math.random() > 0.3,
        city: rand(wilayas)
    };
});

// Generate 400 job listings
const jobDescriptions = [
    "Join our team for an exciting internship where you'll get hands-on experience in a fast-paced environment. You'll work directly with senior professionals on real projects.",
    "We are looking for a motivated student to assist our department. This is a great opportunity to apply your academic knowledge and grow professionally.",
    "As part of our team, you will contribute to meaningful projects, learn industry best practices, and build a solid professional network.",
    "We offer a structured program with mentoring, regular feedback, and the possibility of a permanent position after graduation.",
    "A unique chance to work with one of Algeria's leading companies. You will be exposed to diverse challenges and a collaborative team culture."
];

const DBjobs = Array.from({ length: 400 }, (_, i) => {
    const recruiter = DBrecruiters[i % DBrecruiters.length];
    const field = rand(jobFields);
    const duration = rand(["1 month", "2 months", "3 months", "6 months", "Ongoing"]);
    const durationXP = { "1 month": 200, "2 months": 350, "3 months": 500, "6 months": 800, "Ongoing": 150 };

    return {
        id: `JOB${String(i + 1).padStart(4, "0")}`,
        title: rand([
            `${field} Intern`,
            `Junior ${field} Assistant`,
            `${field} Trainee`,
            `${field} Support Officer`,
            `${field} Coordinator`
        ]),
        type: rand(["Internship", "Part-time", "Remote", "Freelance Project", "Full-time"]),
        field,
        duration,
        location: rand([...wilayas, "Remote"]),
        requiredSkills: [...new Set(Array.from({ length: randInt(2, 5) }, () => rand(skills)))],
        description: rand(jobDescriptions),
        xpReward: durationXP[duration] || 200,
        deadline: `2026-0${randInt(4, 9)}-${String(randInt(1, 28)).padStart(2, "0")}`,
        recruiterId: recruiter.id,
        company: recruiter.company,
        industry: recruiter.industry,
        city: recruiter.city,
        applications: randInt(0, 45),
        open: Math.random() > 0.15,
        featured: Math.random() < 0.8
    };
});

// Assign posted jobs to recruiters
DBjobs.forEach(job => {
    const rec = DBrecruiters.find(r => r.id === job.recruiterId);
    if (rec) rec.postedJobs.push(job.id);
});

// Generate 80 freelance gigs
const gigCategories = ["Web Development", "Graphic Design", "Video Editing", "Content Writing", "SEO", "Data Entry", "Translation", "Social Media", "Photography", "UI/UX Design"];
const gigTitles = [
    "I will create a modern responsive website",
    "I will design your brand identity",
    "I will edit your video professionally",
    "I will write SEO-optimized content",
    "I will manage your social media pages",
    "I will translate documents EN/FR/AR",
    "I will design your UI/UX mockup",
    "I will create a professional logo",
    "I will do data analysis and visualization",
    "I will build your e-commerce store"
];

const DBgigs = Array.from({ length: 80 }, (_, i) => {
    const student = DBstudents[i % 60];
    return {
        id: `GIG${String(i + 1).padStart(3, "0")}`,
        title: rand(gigTitles),
        category: rand(gigCategories),
        description: "Professional service with fast delivery and unlimited revisions. Your satisfaction is guaranteed.",
        price: randInt(2000, 25000),
        currency: "DZD",
        turnaround: `${randInt(2, 14)} days`,
        freelancerId: student.id,
        freelancerName: student.name,
        rating: randFloat(3.5, 5.0),
        reviews: randInt(0, 47),
        deliverables: ["Source files", "Commercial license", "3 revisions"],
        createdAt: `2026-0${randInt(1, 3)}-${String(randInt(1, 28)).padStart(2, "0")}`
    };
});

// ── Persistent prototype helpers ──────────────────────────────────────────────
const STORAGE_KEYS = {
    jobs: "bridgeup_jobs_state",
    applications: "bridgeup_job_applications"
};

function readStorageJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
        return fallback;
    }
}

function writeStorageJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { }
}

function getStoredJobStateMap() {
    return readStorageJSON(STORAGE_KEYS.jobs, {});
}

function saveStoredJobStateMap(map) {
    writeStorageJSON(STORAGE_KEYS.jobs, map);
}

function getStoredApplications() {
    return readStorageJSON(STORAGE_KEYS.applications, []);
}

function saveStoredApplications(list) {
    writeStorageJSON(STORAGE_KEYS.applications, list);
}

// ── BridgeDB ──────────────────────────────────────────────────────────────────
const BridgeDB = {
    students: DBstudents,
    recruiters: DBrecruiters,
    universities: DBuniversities,
    jobs: DBjobs,
    gigs: DBgigs,
    xpLevels: XP_LEVELS,

    demoAccounts: {
        student: { email: "student@demo.dz", password: "demo1234", role: "student", id: "STU00001" },
        recruiter: { email: "recruiter@demo.dz", password: "demo1234", role: "recruiter", id: "REC0001" },
        university: { email: "university@demo.dz", password: "demo1234", role: "university", id: "UNI001" }
    },

    initPersistentState() {
        const storedJobs = getStoredJobStateMap();
        this.jobs.forEach(job => {
            const saved = storedJobs[job.id];
            if (saved) Object.assign(job, saved);
        });
    },

    persistJob(job) {
        if (!job?.id) return;
        const storedJobs = getStoredJobStateMap();
        storedJobs[job.id] = {
            applications: job.applications,
            open: job.open
        };
        saveStoredJobStateMap(storedJobs);
    },

    getStudentById(id) {
        return this.students.find(s => s.id === id);
    },

    getRecruiterById(id) {
        return this.recruiters.find(r => r.id === id);
    },

    getUniversityById(id) {
        return this.universities.find(u => u.id === id);
    },

    getJobById(id) {
        return this.jobs.find(j => j.id === id);
    },

    getGigById(id) {
        return this.gigs.find(g => g.id === id);
    },

    getLevel,

    login(email, password) {
        const demos = Object.values(this.demoAccounts);
        const demo = demos.find(d => d.email === email && d.password === password);
        if (demo) return { success: true, ...demo };

        const student = this.students.find(s => s.email === email && s.password === password);
        if (student) return { success: true, role: "student", id: student.id };

        const rec = this.recruiters.find(r => r.email === email && r.password === password);
        if (rec) return { success: true, role: "recruiter", id: rec.id };

        const uni = this.universities.find(u => u.email === email && u.password === password);
        if (uni) return { success: true, role: "university", id: uni.id };

        return { success: false, error: "Invalid email or password." };
    },

    getRecommendedJobs(studentId, limit = 20) {
        const s = this.getStudentById(studentId);
        if (!s) return this.jobs.filter(j => j.open).slice(0, limit);

        return this.jobs
            .filter(j => j.open)
            .map(j => {
                let score = 0;
                if (j.field === s.field) score += 10;
                if ((s.interests || []).includes(j.field)) score += 5;
                (s.skills || []).forEach(sk => {
                    if ((j.requiredSkills || []).includes(sk)) score += 3;
                });
                if (j.featured) score += 2;
                return { ...j, score };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    },

    searchJobs(query, filters = {}) {
        let results = this.jobs.filter(j => j.open);

        if (query) {
            const q = query.toLowerCase();
            results = results.filter(j =>
                j.title.toLowerCase().includes(q) ||
                j.description.toLowerCase().includes(q) ||
                j.company.toLowerCase().includes(q) ||
                (j.requiredSkills || []).some(s => s.toLowerCase().includes(q))
            );
        }

        if (filters.field) results = results.filter(j => j.field === filters.field);
        if (filters.type) results = results.filter(j => j.type === filters.type);
        if (filters.location) results = results.filter(j => j.location === filters.location);

        return results;
    },

    getUniversityStats(universityId) {
        const students = this.students.filter(s => s.universityId === universityId);
        const avgXP = students.length
            ? Math.round(students.reduce((a, s) => a + (s.xp || 0), 0) / students.length)
            : 0;

        const fieldCounts = {};
        students.forEach(s => {
            fieldCounts[s.field] = (fieldCounts[s.field] || 0) + 1;
        });

        const topFields = Object.entries(fieldCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const totalCerts = students.reduce((a, s) => a + (s.certificates || 0), 0);
        const completionRate = students.length
            ? ((students.filter(s => (s.completedJobs || 0) > 0).length / students.length) * 100).toFixed(1)
            : 0;

        return {
            students,
            totalStudents: students.length,
            avgXP,
            topFields,
            totalCerts,
            completionRate
        };
    },

    applyToJob(studentId, jobId, coverLetter = "") {
        const job = this.getJobById(jobId);
        if (!job) return { success: false, error: "Job not found." };

        const applicationReward = 10;
        const applicationId = `APP${Date.now()}`;
        const date = new Date().toISOString();

        job.applications = (job.applications || 0) + 1;
        this.persistJob(job);

        const applications = getStoredApplications();
        applications.push({
            id: applicationId,
            studentId,
            jobId,
            coverLetter,
            status: "pending",
            date
        });
        saveStoredApplications(applications);

        let updatedProfile = null;
        try {
            const sessionRaw = localStorage.getItem("bridgeup_session");
            const profileRaw = localStorage.getItem("bridgeup_profile");
            const vaultRaw = localStorage.getItem("bridgeup_vault");

            const session = sessionRaw ? JSON.parse(sessionRaw) : null;
            const profile = profileRaw ? JSON.parse(profileRaw) : null;
            const vault = vaultRaw ? JSON.parse(vaultRaw) : {};

            if (profile && profile.id === studentId) {
                profile.xp = (profile.xp || 0) + applicationReward;
                profile.applications = (profile.applications || 0) + 1;
                profile.level = getLevel(profile.xp).name;
                localStorage.setItem("bridgeup_profile", JSON.stringify(profile));

                if (vault && typeof vault === "object") {
                    vault[studentId] = { ...(vault[studentId] || {}), ...profile };
                    localStorage.setItem("bridgeup_vault", JSON.stringify(vault));
                }

                updatedProfile = profile;
            } else {
                const student = this.getStudentById(studentId);
                if (student) {
                    student.xp = (student.xp || 0) + applicationReward;
                    student.applications = (student.applications || 0) + 1;
                    student.level = getLevel(student.xp).name;
                    updatedProfile = student;
                }

                if (session && session.id === studentId && updatedProfile) {
                    localStorage.setItem("bridgeup_profile", JSON.stringify(updatedProfile));
                    vault[studentId] = { ...(vault[studentId] || {}), ...updatedProfile };
                    localStorage.setItem("bridgeup_vault", JSON.stringify(vault));
                }
            }
        } catch (e) { }

        return {
            success: true,
            applicationId,
            studentId,
            jobId,
            coverLetter,
            status: "pending",
            date,
            xpAwarded: applicationReward,
            applicationsCount: job.applications,
            updatedProfile
        };
    }
};

BridgeDB.initPersistentState();

// Make globally available
if (typeof window !== "undefined") window.BridgeDB = BridgeDB;
if (typeof module !== "undefined") module.exports = BridgeDB;