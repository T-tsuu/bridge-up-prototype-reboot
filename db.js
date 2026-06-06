
// ============================================================
//  BRIDGE UP — Local Fake Database (db.js)
//  Simulates 5000+ students, 250 recruiters, 20 universities
// ============================================================
"use strict";

// ── Helpers ──────────────────────────────────────────────────
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => +(Math.random() * (max - min) + min).toFixed(1);

const firstNames = ["Amine","Yasmine","Rania","Karim","Nadia","Sofiane","Lina","Youssef","Sara","Khaled","Imane","Bilal","Fatima","Mehdi","Amira","Adil","Nour","Hamza","Kenza","Taha","Mariam","Omar","Samia","Ryad","Hana","Djamil","Wassila","Mourad","Meriem","Sami","Asma","Rachid","Dounia","Walid","Sabrina","Nassim","Houda","Tarek","Salma","Younes","Loubna","Hichem","Zahra","Fares","Rawda","Adnane","Celia","Ziad","Dalila","Badr"];
const lastNames = ["Benali","Bouzidi","Hamdi","Kaci","Mammeri","Djebbar","Zerrouk","Laoufi","Gueddim","Saadi","Meslem","Boudjema","Taleb","Amrane","Benkhelif","Oussama","Berber","Cherak","Ferhat","Slimani","Aouadi","Moussaoui","Haddad","Boulahia","Mansouri","Benamara","Zouaoui","Ghozali","Rahmouni","Hadj"];
const wilayas = ["Alger","Oran","Constantine","Annaba","Sétif","Tlemcen","Blida","Béjaïa","Batna","Tizi Ouzou","Skikda","Guelma","Jijel","Médéa","Chlef","Mostaganem","Sidi Bel Abbès","Bouira","Msila","Mascara"];
const fields = ["Marketing","Computer Science","Finance","Law","HR","Engineering","Design","Medicine","Architecture","Journalism","Economics","Accounting","Management","Logistics","Education","Biology","Chemistry","Physics","Mathematics","Electrical Engineering"];
const interests = ["Marketing","Finance","Design","IT & Dev","Engineering","Law","HR","Sales","Logistics","Education","Healthcare","Other"];
const skills = ["Excel","Python","Photoshop","Figma","JavaScript","SQL","PowerPoint","AutoCAD","SPSS","After Effects","Premiere Pro","Canva","Java","React","SEO","SolidWorks","R","Tableau","Node.js","WordPress"];
const degrees = ["Bachelor","Master","PhD","BTS","Engineer"];
const years = ["1st Year","2nd Year","3rd Year","4th Year","5th Year","Graduate 2024","Graduate 2025"];
const jobTypes = ["Internship","Part-time","Remote","Freelance Project","Full-time"];
const sectors = ["Tech","Marketing","Finance","Healthcare","Education","Architecture","Legal","Engineering","Media","Logistics","E-commerce","Consulting","HR","Design","Manufacturing"];
const companyNames = ["Djezzy","Mobilis","Ooredoo Algeria","Sonatrach","Sonelgaz","BNA","CPA","CAAT","Algérie Poste","Air Algérie","Condor Electronics","Cevital","Alliance Assurances","Biopharm","Elsewedy Electric","Transtu","Cosider","ETUSA","SNVI","Naftal","Yassir","Temtem","Bosta","KPMG Algeria","PwC Algeria","Deloitte Algeria","EY Algeria","Cisco Algeria","IBM Algeria","Oracle Algeria","SAP Algeria","Microsoft Algeria","Dell Algeria","Huawei Algeria","Samsung Algeria","TechPark","StartupAlgeria","Caar","MutuelPro","AgriSud","EcoConsult","DataAlg","DevHub","PixelDZ","MediaGroup","LegalPro","BuildPro","HealthCare+","EduTech","FinTech DZ"];
const jobTitles = ["Marketing Intern","Frontend Developer Intern","Finance Analyst Intern","HR Assistant","Graphic Design Intern","Content Creator","Junior Developer","SEO Specialist","Data Analyst Intern","Sales Assistant","Social Media Manager","Accounting Intern","Legal Assistant","Logistics Coordinator","UX Designer Intern","Project Manager Assistant","Business Development Intern","IT Support Intern","Research Assistant","Community Manager"];
const universityNames = [
  "Université Badji Mokhtar – Annaba","Université des Sciences et de la Technologie Houari Boumediene – Alger","Université des Frères Mentouri – Constantine","Université Abderrahmane Mira – Béjaïa","Université A. Mira – Tizi Ouzou","Université Djillali Liabes – Sidi Bel Abbès","Université Ferhat Abbas – Sétif","Université Abou Bekr Belkaid – Tlemcen","Université Chadli Bendjedid – El Tarf","Université Mohamed Boudiaf – M'Sila","Université Kasdi Merbah – Ouargla","Université Tahri Mohammed – Béchar","Université Larbi Ben M'hidi – Oum El Bouaghi","Université Mohamed Khider – Biskra","Université 8 Mai 1945 – Guelma","Université Akli Mohand Oulhadj – Bouira","Université Souk Ahras","Université de Tébessa","Université Mustapha Stambouli – Mascara","Université Ibn Khaldoun – Tiaret"
];

// ── XP Levels ──────────────────────────────────────────────
const XP_LEVELS = [
  { name:"Starter",        min:0,    max:200,  perk:"Platform badge" },
  { name:"Rising Talent",  min:201,  max:600,  perk:"Access to premium job listings" },
  { name:"Experienced",    min:601,  max:1200, perk:"Discount on partner online courses" },
  { name:"Pro",            min:1201, max:2500, perk:"Featured profile placement" },
  { name:"Elite",          min:2501, max:9999, perk:"Priority recommendation + exclusive opportunities" },
];

function getLevel(xp) {
  return XP_LEVELS.find(l => xp >= l.min && xp <= l.max) || XP_LEVELS[4];
}

// ── Generate 20 Universities ──────────────────────────────
const DB_universities = universityNames.map((name, i) => ({
  id: `UNI${String(i+1).padStart(3,"0")}`,
  name,
  email: `contact@uni${i+1}.dz`,
  password: "demo1234",
  logo: null,
  city: wilayas[i] || rand(wilayas),
  contactPerson: { name: `${rand(firstNames)} ${rand(lastNames)}`, title: "Vice-Rector of External Relations", dept: "Academic Affairs", phone: `+213 ${randInt(550,799)} ${randInt(100000,999999)}` },
  faculties: ["Faculty of Economics & Management","Faculty of Computer Science","Faculty of Law","Faculty of Sciences","Faculty of Letters & Languages","Faculty of Engineering"],
  registeredStudents: randInt(180,640),
  createdAt: "2026-01-15",
  claimed: i < 5,
}));

// ── Generate 250 Recruiters ───────────────────────────────
const DB_recruiters = Array.from({length:250}, (_,i) => {
  const company = companyNames[i % companyNames.length] + (i >= companyNames.length ? ` ${Math.floor(i/companyNames.length)+1}` : "");
  return {
    id: `REC${String(i+1).padStart(4,"0")}`,
    name: `${rand(firstNames)} ${rand(lastNames)}`,
    email: `recruiter${i+1}@${company.toLowerCase().replace(/\s+/g,"")}.dz`,
    password: "demo1234",
    company,
    industry: rand(sectors),
    size: rand(["1-10","11-50","51-200","200+"]),
    city: rand(wilayas),
    description: `${company} is a leading organization in ${rand(sectors)} based in Algeria. We are committed to nurturing young talent and providing meaningful work experiences.`,
    logo: null,
    hiringPrefs: { types: [rand(jobTypes), rand(jobTypes)].filter((v,i,a)=>a.indexOf(v)===i), fields: [rand(fields), rand(fields)] },
    postedJobs: [],
    createdAt: `2026-0${randInt(1,3)}-${String(randInt(1,28)).padStart(2,"0")}`,
    verified: Math.random() > 0.2,
  };
});

// ── Generate 5100 Students ───────────────────────────────
const reviewTexts = [
  "Excellent team player with great initiative.","Shows strong analytical thinking.","Delivered work ahead of schedule and with high quality.","Very professional and eager to learn.","Needs to work on communication but technically solid.","Outstanding creativity and attention to detail.","Reliable and diligent throughout the engagement.","Great cultural fit, adapts quickly.","Strong foundation, bright future ahead.","Proactive and self-motivated individual.",
];
const DB_students = Array.from({length:5100}, (_,i) => {
  const xp = randInt(0, 2800);
  const level = getLevel(xp);
  const studentFields = [rand(fields)];
  const studentInterests = [...new Set([studentFields[0], rand(interests), rand(interests)])].slice(0,3);
  const studentSkills = [...new Set(Array.from({length:randInt(2,6)}, ()=>rand(skills)))];
  const uni = rand(DB_universities);
  const hasReviews = Math.random() > 0.4;
  return {
    id: `STU${String(i+1).padStart(5,"0")}`,
    name: `${rand(firstNames)} ${rand(lastNames)}`,
    email: `student${i+1}@mail.dz`,
    password: "demo1234",
    phone: Math.random()>0.4 ? `+213 ${randInt(550,799)} ${randInt(100000,999999)}` : null,
    avatar: null,
    university: uni.name,
    universityId: uni.id,
    field: studentFields[0],
    degree: rand(degrees),
    year: rand(years),
    interests: studentInterests,
    skills: studentSkills,
    bio: `${rand(degrees)} student in ${studentFields[0]} at ${uni.name}. Passionate about ${rand(interests).toLowerCase()} and eager to gain real-world experience.`,
    xp,
    level: level.name,
    completedJobs: randInt(0, 5),
    certificates: randInt(0, 4),
    applications: randInt(0, 12),
    linkedIn: Math.random()>0.5 ? `https://linkedin.com/in/${rand(firstNames).toLowerCase()}${randInt(10,99)}` : null,
    github: Math.random()>0.6 ? `https://github.com/${rand(firstNames).toLowerCase()}${randInt(10,99)}` : null,
    freelanceMode: Math.random() > 0.6,
    reviews: hasReviews ? Array.from({length:randInt(1,4)}, ()=>({
      reviewer: `${rand(firstNames)} ${rand(lastNames)} – ${rand(companyNames)}`,
      rating: randInt(3,5),
      text: rand(reviewTexts),
      date: `2026-0${randInt(1,3)}-${String(randInt(1,28)).padStart(2,"0")}`,
    })) : [],
    portfolio: Array.from({length:randInt(0,3)}, ()=>({
      title: `${rand(jobTitles)} at ${rand(companyNames)}`,
      duration: `${randInt(1,6)} months`,
      year: rand(["2024","2025","2026"]),
    })),
    createdAt: `2026-0${randInt(1,3)}-${String(randInt(1,28)).padStart(2,"0")}`,
    profileComplete: Math.random() > 0.3,
    city: rand(wilayas),
  };
});

// ── Generate 400 Job Listings ─────────────────────────────
const jobDescriptions = [
  "Join our team for an exciting internship where you'll get hands-on experience in a fast-paced environment. You'll work directly with senior professionals on real projects.",
  "We are looking for a motivated student to assist our department. This is a great opportunity to apply your academic knowledge and grow professionally.",
  "As part of our team, you will contribute to meaningful projects, learn industry best practices, and build a solid professional network.",
  "We offer a structured program with mentoring, regular feedback, and the possibility of a permanent position after graduation.",
  "A unique chance to work with one of Algeria's leading companies. You will be exposed to diverse challenges and a collaborative team culture.",
];

const DB_jobs = Array.from({length:400}, (_,i) => {
  const recruiter = DB_recruiters[i % DB_recruiters.length];
  const jobField = rand(fields);
  const duration = rand(["1 month","2 months","3 months","6 months","Ongoing"]);
  const durationXP = {"1 month":200,"2 months":350,"3 months":500,"6 months":800,"Ongoing":150};
  return {
    id: `JOB${String(i+1).padStart(4,"0")}`,
    title: rand(jobTitles),
    type: rand(jobTypes),
    field: jobField,
    duration,
    location: rand([...wilayas,"Remote"]),
    requiredSkills: [...new Set(Array.from({length:randInt(2,5)}, ()=>rand(skills)))],
    description: rand(jobDescriptions),
    xpReward: durationXP[duration] || 200,
    deadline: `2026-0${randInt(4,9)}-${String(randInt(1,28)).padStart(2,"0")}`,
    recruiterId: recruiter.id,
    company: recruiter.company,
    industry: recruiter.industry,
    city: recruiter.city,
    applications: randInt(0,45),
    open: Math.random() > 0.15,
    createdAt: `2026-0${randInt(1,3)}-${String(randInt(1,28)).padStart(2,"0")}`,
    featured: Math.random() > 0.8,
  };
});

// Assign posted jobs to recruiters
DB_jobs.forEach(job => {
  const rec = DB_recruiters.find(r => r.id === job.recruiterId);
  if(rec) rec.postedJobs.push(job.id);
});

// ── Generate 80 Freelance Gigs ────────────────────────────
const gigCategories = ["Web Development","Graphic Design","Video Editing","Content Writing","SEO","Data Entry","Translation","Social Media","Photography","UI/UX Design"];
const gigTitles = ["I will create a modern responsive website","I will design your brand identity","I will edit your video professionally","I will write SEO-optimized content","I will manage your social media pages","I will translate documents EN/FR/AR","I will design your UI/UX mockup","I will create a professional logo","I will do data analysis and visualization","I will build your e-commerce store"];

const DB_gigs = Array.from({length:80}, (_,i) => {
  const student = DB_students[i * 60];
  return {
    id: `GIG${String(i+1).padStart(3,"0")}`,
    title: rand(gigTitles),
    category: rand(gigCategories),
    description: "Professional service with fast delivery and unlimited revisions. Your satisfaction is guaranteed.",
    price: randInt(2000,25000),
    currency: "DZD",
    turnaround: `${randInt(2,14)} days`,
    freelancerId: student.id,
    freelancerName: student.name,
    rating: randFloat(3.5,5.0),
    reviews: randInt(0,47),
    deliverables: ["Source files","Commercial license","3 revisions"],
    createdAt: `2026-0${randInt(1,3)}-${String(randInt(1,28)).padStart(2,"0")}`,
  };
});

// ── Fake Auth ─────────────────────────────────────────────
const BridgeDB = {
  students:      DB_students,
  recruiters:    DB_recruiters,
  universities:  DB_universities,
  jobs:          DB_jobs,
  gigs:          DB_gigs,
  xpLevels:      XP_LEVELS,
  getLevel,

  // Demo accounts for quick login
  demoAccounts: {
    student:    { email:"student@demo.dz",    password:"demo1234", role:"student",    id:"STU00001" },
    recruiter:  { email:"recruiter@demo.dz",  password:"demo1234", role:"recruiter",  id:"REC0001"  },
    university: { email:"university@demo.dz", password:"demo1234", role:"university", id:"UNI001"   },
  },

  login(email, password) {
    const demos = Object.values(this.demoAccounts);
    const demo = demos.find(d => d.email === email && d.password === password);
    if(demo) return { success:true, ...demo };
    const student = this.students.find(s => s.email===email && s.password===password);
    if(student) return { success:true, role:"student", id:student.id };
    const rec = this.recruiters.find(r => r.email===email && r.password===password);
    if(rec) return { success:true, role:"recruiter", id:rec.id };
    const uni = this.universities.find(u => u.email===email && u.password===password);
    if(uni) return { success:true, role:"university", id:uni.id };
    return { success:false, error:"Invalid email or password." };
  },

  getStudentById(id)    { return this.students.find(s=>s.id===id); },
  getRecruiterById(id)  { return this.recruiters.find(r=>r.id===id); },
  getUniversityById(id) { return this.universities.find(u=>u.id===id); },
  getJobById(id)        { return this.jobs.find(j=>j.id===id); },
  getGigById(id)        { return this.gigs.find(g=>g.id===id); },

  getRecommendedJobs(studentId, limit=20) {
    const s = this.getStudentById(studentId);
    if(!s) return this.jobs.filter(j=>j.open).slice(0,limit);
    return this.jobs
      .filter(j=>j.open)
      .map(j => {
        let score = 0;
        if(j.field===s.field) score += 10;
        if(s.interests.includes(j.field)) score += 5;
        s.skills.forEach(sk => { if(j.requiredSkills.includes(sk)) score += 3; });
        if(j.featured) score += 2;
        return {...j, _score:score};
      })
      .sort((a,b)=>b._score - a._score)
      .slice(0,limit);
  },

  searchJobs(query="", filters={}) {
    let results = this.jobs.filter(j=>j.open);
    if(query) {
      const q = query.toLowerCase();
      results = results.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.requiredSkills.some(s=>s.toLowerCase().includes(q))
      );
    }
    if(filters.field)    results = results.filter(j=>j.field===filters.field);
    if(filters.type)     results = results.filter(j=>j.type===filters.type);
    if(filters.location) results = results.filter(j=>j.location===filters.location);
    return results;
  },

  getUniversityStats(universityId) {
    const students = this.students.filter(s=>s.universityId===universityId);
    const avgXP = students.length ? Math.round(students.reduce((a,s)=>a+s.xp,0)/students.length) : 0;
    const fieldCounts = {};
    students.forEach(s => { fieldCounts[s.field]=(fieldCounts[s.field]||0)+1; });
    const topFields = Object.entries(fieldCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const totalCerts = students.reduce((a,s)=>a+s.certificates,0);
    const completionRate = students.length ? +(students.filter(s=>s.completedJobs>0).length/students.length*100).toFixed(1) : 0;
    return { students, totalStudents:students.length, avgXP, topFields, totalCerts, completionRate };
  },

  // Simulate applying to a job
  applyToJob(studentId, jobId, coverLetter="") {
    const job = this.getJobById(jobId);
    if(job) { job.applications++; }
    return { success:true, applicationId:`APP${Date.now()}`, studentId, jobId, coverLetter, status:"pending", date:new Date().toISOString() };
  },
};

// Make globally available
if(typeof window !== "undefined") window.BridgeDB = BridgeDB;
if(typeof module !== "undefined") module.exports = BridgeDB;
