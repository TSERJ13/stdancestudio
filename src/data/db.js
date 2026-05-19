/* =====================================================
   ST Dance Studio — localStorage "Database"
   All data persists in localStorage.
   ClassCore.ge integration: coming soon (API key needed).
   ===================================================== */

const KEYS = {
  STUDENTS:    'std_students',
  NEWS:        'std_news',
  TOURNAMENTS: 'std_tournaments',
  ATTENDANCE:  'std_attendance',
  SUBSCRIPTIONS: 'std_subscriptions',
  TRAINER_RATINGS: 'std_ratings',
  ADMIN_AUTH:  'std_admin_auth',
  PORTAL_SESSION: 'std_portal_session',
};

export default KEYS;

/* ── Helpers ─────────────────────────────────────── */
const load  = (key) => { try { return JSON.parse(localStorage.getItem(key)) ?? null; } catch { return null; } };
const save  = (key, val) => localStorage.setItem(key, JSON.stringify(val));
const uid   = () => Math.random().toString(36).slice(2, 10);

/* ── Seed demo data if DB is empty ──────────────── */
export function seedIfEmpty() {
  if (load(KEYS.STUDENTS)) return; // already seeded

  const students = [
    {
      id: 'stu_001',
      name: 'ანი ბერიძე',
      phone: '555123456',
      photo: '',
      birthYear: 2010,
      gender: 'female',
      classification: 'B კლასი',
      categories: ['ლათინური — ჩა-ჩა', 'ლათინური — სამბა'],
      joinDate: '2023-09-01',
      active: true,
    },
    {
      id: 'stu_002',
      name: 'გიორგი კვარაცხელია',
      phone: '555987654',
      photo: '',
      birthYear: 2008,
      gender: 'male',
      classification: 'A კლასი',
      categories: ['სტანდარტული — ვალსი', 'სტანდარტული — ტანგო'],
      joinDate: '2022-01-15',
      active: true,
    },
    {
      id: 'stu_003',
      name: 'მარიამ გელაშვილი',
      phone: '555111222',
      photo: '',
      birthYear: 2012,
      gender: 'female',
      classification: 'N კლასი',
      categories: ['ლათინური — ჩა-ჩა'],
      joinDate: '2024-02-10',
      active: true,
    },
  ];

  const now = new Date();
  const fmt = (d) => d.toISOString().slice(0, 10);
  const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

  const subscriptions = {
    stu_001: { total: 12, used: 8, starts: fmt(addDays(now, -20)), expires: fmt(addDays(now, 10)), plan: 'ჯგუფური' },
    stu_002: { total: 16, used: 4, starts: fmt(addDays(now, -5)),  expires: fmt(addDays(now, 25)), plan: 'ჯგუფური' },
    stu_003: { total: 8,  used: 8, starts: fmt(addDays(now, -30)), expires: fmt(addDays(now, -2)), plan: 'ჯგუფური' },
  };

  // Generate attendance history (last 30 days)
  const attendance = {};
  students.forEach(s => {
    const records = [];
    for (let i = 29; i >= 0; i--) {
      const d = fmt(addDays(now, -i));
      const isWeekend = new Date(d).getDay() % 6 === 0;
      if (!isWeekend) {
        records.push({ date: d, present: Math.random() > 0.2 });
      }
    }
    attendance[s.id] = records;
  });

  const trainerRatings = {
    stu_001: { readiness: 7, notes: 'კარგი პროგრესი ლათინში, ტექნიკა საჭიროებს გაუმჯობესებას ჩა-ჩა-ში', updatedAt: fmt(now) },
    stu_002: { readiness: 9, notes: 'მზადაა ტურნირისთვის, მაღალი დისციპლინა', updatedAt: fmt(now) },
    stu_003: { readiness: 4, notes: 'დამწყები, სჭირდება კიდევ 2-3 თვე', updatedAt: fmt(now) },
  };

  const news = [
    {
      id: 'news_001',
      title: 'გაზაფხულის ტურნირი 2025 — მნიშვნელოვანი ინფო!',
      body: 'ძვირფასო მშობლებო, გამახსენებთ რომ 15 ივნისს ტურნირი გაიმართება თბილისის სასახლეში. გთხოვთ დროულად გამოცხადდეთ. ფორმა სავალდებულოა.',
      date: fmt(now),
      important: true,
    },
    {
      id: 'news_002',
      title: 'ივნისის გრაფიკი',
      body: 'ივნისის გაკვეთილები ჩვეულ გრაფიკზე გაგრძელდება. ბოლო გაკვეთილი — 28 ივნისი. ზაფხულის შეფერხება: 1-31 ივლისი.',
      date: fmt(addDays(now, -3)),
      important: false,
    },
  ];

  const tournaments = [
    {
      id: 'trn_001',
      name: 'გაზაფხულის გრანდ პრი 2025',
      date: fmt(addDays(now, 28)),
      venue: 'თბილისის სახელმწიფო სასახლე',
      address: 'რუსთაველის გამზ. 3, თბილისი',
      mapUrl: 'https://maps.app.goo.gl/tbilisi',
      categories: ['ლათინური B კლასი', 'სტანდარტული A კლასი', 'ლათინური N კლასი'],
      fee: 50,
      notes: 'გამოჩენა 9:00 საათზე. ტანსაცმელი სავალდებულო.',
      studentCategories: {
        stu_001: ['ლათინური B კლასი — ჩა-ჩა', 'ლათინური B კლასი — სამბა'],
        stu_002: ['სტანდარტული A კლასი — ვალსი'],
        stu_003: [],
      },
      results: {},
    },
    {
      id: 'trn_002',
      name: 'შემოდგომის კავშირი 2024',
      date: '2024-10-20',
      venue: 'ექსპო Georgia',
      address: 'ციციანო 9, თბილისი',
      mapUrl: 'https://maps.app.goo.gl/expo',
      categories: ['ლათინური B კლასი', 'სტანდარტული A კლასი'],
      fee: 45,
      notes: '',
      studentCategories: {
        stu_001: ['ლათინური B კლასი — ჩა-ჩა'],
        stu_002: ['სტანდარტული A კლასი — ვალსი', 'სტანდარტული A კლასი — ტანგო'],
      },
      results: {
        stu_001: [{ category: 'ლათინური B კლასი — ჩა-ჩა', place: 3, total: 12, notes: '🥉 III ადგილი' }],
        stu_002: [
          { category: 'სტანდარტული A კლასი — ვალსი', place: 1, total: 8, notes: '🥇 I ადგილი' },
          { category: 'სტანდარტული A კლასი — ტანგო', place: 2, total: 8, notes: '🥈 II ადგილი' },
        ],
      },
    },
  ];

  save(KEYS.STUDENTS,    students);
  save(KEYS.NEWS,        news);
  save(KEYS.TOURNAMENTS, tournaments);
  save(KEYS.ATTENDANCE,  attendance);
  save(KEYS.SUBSCRIPTIONS, subscriptions);
  save(KEYS.TRAINER_RATINGS, trainerRatings);
}

/* ── Admin Auth ──────────────────────────────────── */
const ADMIN_PASSWORD = 'stdance2025';
export const adminLogin  = (pw) => { if (pw === ADMIN_PASSWORD) { save(KEYS.ADMIN_AUTH, true); return true; } return false; };
export const adminLogout = () => localStorage.removeItem(KEYS.ADMIN_AUTH);
export const isAdminLoggedIn = () => load(KEYS.ADMIN_AUTH) === true;

/* ── Portal Session ──────────────────────────────── */
export const portalLogin  = (phone) => {
  const students = load(KEYS.STUDENTS) || [];
  const student  = students.find(s => s.phone.replace(/\D/g,'') === phone.replace(/\D/g,''));
  if (student) { save(KEYS.PORTAL_SESSION, student.id); return student; }
  return null;
};
export const portalLogout   = () => localStorage.removeItem(KEYS.PORTAL_SESSION);
export const getPortalStudent = () => {
  const id = load(KEYS.PORTAL_SESSION);
  if (!id) return null;
  const students = load(KEYS.STUDENTS) || [];
  return students.find(s => s.id === id) || null;
};

/* ── Students ────────────────────────────────────── */
export const getStudents  = () => load(KEYS.STUDENTS) || [];
export const getStudent   = (id) => (load(KEYS.STUDENTS) || []).find(s => s.id === id);
export const saveStudent  = (student) => {
  const list = load(KEYS.STUDENTS) || [];
  const idx  = list.findIndex(s => s.id === student.id);
  if (idx >= 0) list[idx] = student; else list.push({ ...student, id: 'stu_' + uid() });
  save(KEYS.STUDENTS, list);
};
export const deleteStudent = (id) => save(KEYS.STUDENTS, (load(KEYS.STUDENTS) || []).filter(s => s.id !== id));

/* ── News ────────────────────────────────────────── */
export const getNews     = () => (load(KEYS.NEWS) || []).sort((a,b) => b.date.localeCompare(a.date));
export const saveNews    = (item) => {
  const list = load(KEYS.NEWS) || [];
  const idx  = list.findIndex(n => n.id === item.id);
  if (idx >= 0) list[idx] = item; else list.push({ ...item, id: 'news_' + uid() });
  save(KEYS.NEWS, list);
};
export const deleteNews  = (id) => save(KEYS.NEWS, (load(KEYS.NEWS) || []).filter(n => n.id !== id));

/* ── Tournaments ─────────────────────────────────── */
export const getTournaments  = () => (load(KEYS.TOURNAMENTS) || []).sort((a,b) => b.date.localeCompare(a.date));
export const getTournament   = (id) => (load(KEYS.TOURNAMENTS) || []).find(t => t.id === id);
export const saveTournament  = (t) => {
  const list = load(KEYS.TOURNAMENTS) || [];
  const idx  = list.findIndex(x => x.id === t.id);
  if (idx >= 0) list[idx] = t; else list.push({ ...t, id: 'trn_' + uid() });
  save(KEYS.TOURNAMENTS, list);
};
export const deleteTournament = (id) => save(KEYS.TOURNAMENTS, (load(KEYS.TOURNAMENTS) || []).filter(t => t.id !== id));

/* ── Subscriptions ───────────────────────────────── */
export const getSubscription  = (studentId) => (load(KEYS.SUBSCRIPTIONS) || {})[studentId] || null;
export const saveSubscription = (studentId, sub) => {
  const all = load(KEYS.SUBSCRIPTIONS) || {};
  all[studentId] = sub;
  save(KEYS.SUBSCRIPTIONS, all);
};

/* ── Attendance ──────────────────────────────────── */
export const getAttendance    = (studentId) => (load(KEYS.ATTENDANCE) || {})[studentId] || [];
export const saveAttendance   = (studentId, records) => {
  const all = load(KEYS.ATTENDANCE) || {};
  all[studentId] = records;
  save(KEYS.ATTENDANCE, all);
};

/* ── Trainer Ratings ─────────────────────────────── */
export const getTrainerRating  = (studentId) => (load(KEYS.TRAINER_RATINGS) || {})[studentId] || { readiness: 0, notes: '' };
export const saveTrainerRating = (studentId, rating) => {
  const all = load(KEYS.TRAINER_RATINGS) || {};
  all[studentId] = { ...rating, updatedAt: new Date().toISOString().slice(0,10) };
  save(KEYS.TRAINER_RATINGS, all);
};
