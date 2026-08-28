/* ==========================================================================
   Mock data layer — simulates the live school information system
   Deterministic (seeded) so demo data is stable between renders.
   ========================================================================== */

/* ---------- seeded RNG ---------- */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SCHOOL = {
  name: "Scholaris International Academy",
  short: "Scholaris",
  session: "2025/2026",
  motto: "Knowledge · Character · Service",
  address: "14 Cedarwood Avenue, GRA Phase II, Ikeja",
  city: "Lagos, Nigeria",
  phone: "+234 803 555 0142",
  email: "portal@scholaris.edu.ng",
  established: 1998,
  accredited: "CIE / WAEC / NECO Approved",
};

/* ---------- academic constants ---------- */
export const SESSION = "2025/2026";
export const TERMS = ["First Term", "Second Term", "Third Term"] as const;
export type Term = (typeof TERMS)[number];

export const SUBJECTS = [
  "Mathematics",
  "English Language",
  "Basic Science",
  "Social Studies",
  "Civic Education",
  "Computer Studies",
  "Agricultural Science",
  "Creative Arts",
] as const;

export type GradeInfo = { grade: string; remark: string; tone: "teal" | "brand" | "amber" | "rose" };

/** WAEC-style 9-point grading band */
export function gradeOf(score: number): GradeInfo {
  if (score >= 75) return { grade: "A1", remark: "Excellent", tone: "teal" };
  if (score >= 70) return { grade: "B2", remark: "Very Good", tone: "teal" };
  if (score >= 65) return { grade: "B3", remark: "Good", tone: "brand" };
  if (score >= 60) return { grade: "C4", remark: "Credit", tone: "brand" };
  if (score >= 55) return { grade: "C5", remark: "Credit", tone: "brand" };
  if (score >= 50) return { grade: "C6", remark: "Credit", tone: "amber" };
  if (score >= 45) return { grade: "D7", remark: "Pass", tone: "amber" };
  if (score >= 40) return { grade: "E8", remark: "Weak Pass", tone: "rose" };
  return { grade: "F9", remark: "Fail", tone: "rose" };
}

export const money = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });

export const AVG_TONE = (avg: number) => (avg >= 70 ? "teal" : avg >= 55 ? "brand" : avg >= 45 ? "amber" : "rose");

/* ---------- personas ---------- */
export type Person = {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  email: string;
};

export const PARENT: Person = {
  id: "PAR-2041",
  name: "Mrs. Adaeze Okonkwo",
  role: "Parent / Guardian",
  initials: "AO",
  color: "linear-gradient(135deg,#2563c9,#14b8a6)",
  email: "adaeze.okonkwo@gmail.com",
};

export const TEACHER: Person = {
  id: "STF-0873",
  name: "Mr. Tunde Bakare",
  role: "Subject Teacher · Mathematics",
  initials: "TB",
  color: "linear-gradient(135deg,#7c3aed,#2563c9)",
  email: "t.bakare@scholaris.edu.ng",
};

export const ADMIN: Person = {
  id: "ADM-0007",
  name: "Dr. (Mrs) Ifeoma Eze",
  role: "Principal / System Administrator",
  initials: "IE",
  color: "linear-gradient(135deg,#0d9488,#f59e0b)",
  email: "principal@scholaris.edu.ng",
};

/* ---------- children (wards) ---------- */
export type Ward = {
  id: string;
  name: string;
  admissionNo: string;
  className: string;
  arm: string;
  initials: string;
  color: string;
  attendance: number;
  position: number;
  classSize: number;
  nextTermBegins: string;
};

export const WARDS: Ward[] = [
  {
    id: "STU-3391",
    name: "Chiamaka Okonkwo",
    admissionNo: "SIA/2019/0331",
    className: "JSS 3",
    arm: "A",
    initials: "CO",
    color: "linear-gradient(135deg,#f59e0b,#e0344b)",
    attendance: 96,
    position: 3,
    classSize: 38,
    nextTermBegins: "8 Jan 2026",
  },
  {
    id: "STU-4107",
    name: "Ifeanyi Okonkwo",
    admissionNo: "SIA/2022/1107",
    className: "Primary 4",
    arm: "B",
    initials: "IO",
    color: "linear-gradient(135deg,#0d9488,#2563c9)",
    attendance: 91,
    position: 11,
    classSize: 34,
    nextTermBegins: "8 Jan 2026",
  },
];

/* ---------- results engine ---------- */
export type ResultRow = {
  subject: string;
  ca: number; // /40
  exam: number; // /60
  total: number;
  grade: string;
  remark: string;
  tone: GradeInfo["tone"];
  classAvg: number;
  teacher: string;
};

export type TermResult = {
  term: Term;
  rows: ResultRow[];
  total: number;
  obtainable: number;
  average: number;
  position: string;
  formMasterRemark: string;
  principalRemark: string;
};

const TEACHERS_BY_SUBJECT: Record<string, string> = {
  Mathematics: "Mr. T. Bakare",
  "English Language": "Mrs. N. Adeyemi",
  "Basic Science": "Dr. K. Umeh",
  "Social Studies": "Mr. P. Ogundipe",
  "Civic Education": "Mrs. F. Bello",
  "Computer Studies": "Mr. S. Chukwu",
  "Agricultural Science": "Mr. E. Danjuma",
  "Creative Arts": "Miss A. Nwachukwu",
};

function seedFrom(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function getResult(ward: Ward, term: Term): TermResult {
  const rand = mulberry32(seedFrom(ward.id + term));
  const bias = ward.id === "STU-3391" ? 12 : -6; // elder sibling is stronger academically
  const rows: ResultRow[] = SUBJECTS.map((subject) => {
    const ca = Math.max(12, Math.min(40, Math.round(20 + rand() * 18 + bias * 0.35)));
    const exam = Math.max(15, Math.min(60, Math.round(28 + rand() * 26 + bias * 0.6)));
    const total = ca + exam;
    const g = gradeOf(total);
    return {
      subject,
      ca,
      exam,
      total,
      grade: g.grade,
      remark: g.remark,
      tone: g.tone,
      classAvg: Math.max(30, Math.min(88, Math.round(total - 8 + rand() * 16))),
      teacher: TEACHERS_BY_SUBJECT[subject],
    };
  });
  const total = rows.reduce((a, r) => a + r.total, 0);
  const obtainable = rows.length * 100;
  const average = Math.round((total / obtainable) * 1000) / 10;
  const pos = term === "First Term" ? ward.position : Math.max(1, ward.position - 1);
  return {
    term,
    rows,
    total,
    obtainable,
    average,
    position: `${pos} of ${ward.classSize}`,
    formMasterRemark:
      average >= 70
        ? "An outstanding term. Chiamaka is consistent, focused and a positive influence in class."
        : "A steady term overall. More attention to Mathematics and Basic Science will lift the average next term.",
    principalRemark:
      average >= 70
        ? "Commendable performance. Keep the standard high — the sky is your starting point."
        : "Satisfactory. Identify weak subjects early and use the holiday coaching pack provided.",
  };
}

/* ---------- fees ---------- */
export type FeeLine = { label: string; amount: number; note?: string };
export type FeeStructure = { className: string; lines: FeeLine[]; total: number };

const FEE_MAP: Record<string, FeeLine[]> = {
  "JSS 3": [
    { label: "Tuition Fee", amount: 185000 },
    { label: "Examination Levy (BECE)", amount: 32000, note: "External exam registration" },
    { label: "Development Levy", amount: 25000 },
    { label: "ICT & Laboratory", amount: 18000 },
    { label: "PTA Dues", amount: 7500 },
  ],
  "Primary 4": [
    { label: "Tuition Fee", amount: 128000 },
    { label: "Development Levy", amount: 18000 },
    { label: "ICT & Library", amount: 12000 },
    { label: "PTA Dues", amount: 7500 },
  ],
};

export function feeStructure(ward: Ward): FeeStructure {
  const lines = FEE_MAP[ward.className] ?? FEE_MAP["Primary 4"];
  return { className: ward.className, lines, total: lines.reduce((a, l) => a + l.amount, 0) };
}

export type Invoice = {
  id: string;
  wardId: string;
  term: Term;
  total: number;
  paid: number;
  due: string;
  status: "paid" | "partial" | "outstanding";
};

export const INVOICES: Invoice[] = [
  { id: "INV-2025-1184", wardId: "STU-3391", term: "First Term", total: 267500, paid: 267500, due: "12 Sep 2025", status: "paid" },
  { id: "INV-2025-1342", wardId: "STU-4107", term: "First Term", total: 165500, paid: 165500, due: "12 Sep 2025", status: "paid" },
  { id: "INV-2025-1601", wardId: "STU-3391", term: "Second Term", total: 267500, paid: 150000, due: "9 Jan 2026", status: "partial" },
  { id: "INV-2025-1602", wardId: "STU-4107", term: "Second Term", total: 165500, paid: 0, due: "9 Jan 2026", status: "outstanding" },
];

export type Payment = {
  id: string;
  date: string;
  ward: string;
  term: Term;
  method: string;
  reference: string;
  amount: number;
  status: "successful" | "pending" | "failed";
};

export const PAYMENTS: Payment[] = [
  { id: "TXN-99120", date: "18 Dec 2025", ward: "Chiamaka Okonkwo", term: "Second Term", method: "Card · Visa 4291", reference: "RCPT/2025/09912", amount: 150000, status: "successful" },
  { id: "TXN-99118", date: "02 Dec 2025", ward: "Chiamaka Okonkwo", term: "Second Term", method: "Bank Transfer", reference: "RCPT/2025/09880", amount: 20000, status: "successful" },
  { id: "TXN-98004", date: "08 Sep 2025", ward: "Chiamaka Okonkwo", term: "First Term", method: "Card · Mastercard 8871", reference: "RCPT/2025/09041", amount: 267500, status: "successful" },
  { id: "TXN-98010", date: "09 Sep 2025", ward: "Ifeanyi Okonkwo", term: "First Term", method: "USSD · 0803***2210", reference: "RCPT/2025/09052", amount: 165500, status: "successful" },
  { id: "TXN-97220", date: "27 Aug 2025", ward: "Ifeanyi Okonkwo", term: "First Term", method: "Card · Visa 4291", reference: "RCPT/2025/08711", amount: 40000, status: "failed" },
];

/* ---------- news & circulars ---------- */
export type NewsItem = {
  id: string;
  title: string;
  category: "Event" | "Academic" | "Sports" | "Circular" | "Holiday";
  date: string;
  excerpt: string;
  image: string;
  pinned?: boolean;
};

export const NEWS: NewsItem[] = [
  {
    id: "N1",
    title: "30th Inter-House Sports Festival holds 14 February",
    category: "Sports",
    date: "06 Jan 2026",
    excerpt:
      "Parents are invited to the annual Inter-House Sports Festival at the main arena. Four houses — Ruby, Emerald, Topaz and Sapphire — will compete in 22 track and field events.",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900&auto=format&fit=crop",
    pinned: true,
  },
  {
    id: "N2",
    title: "Second Term results are now live on the parent portal",
    category: "Academic",
    date: "12 Dec 2025",
    excerpt:
      "Continuous assessment and examination scores have been published. Download the termly report card from the Results tab and review subject teacher remarks.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&auto=format&fit=crop",
  },
  {
    id: "N3",
    title: "BECE registration closes 31 January for JSS 3 candidates",
    category: "Circular",
    date: "10 Dec 2025",
    excerpt:
      "All JSS 3 learners must complete biometric capture and submit six passport photographs to the Exams Officer before the deadline.",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&auto=format&fit=crop",
  },
  {
    id: "N4",
    title: "New STEM & Robotics laboratory commissioned",
    category: "Event",
    date: "28 Nov 2025",
    excerpt:
      "The 40-workstation laboratory features 3D printers, Arduino kits and a dedicated coding studio for learners in Primary 5 to SS 3.",
    image:
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=900&auto=format&fit=crop",
  },
];

export type Circular = { id: string; title: string; date: string; audience: string; tone: "brand" | "amber" | "teal" | "rose" };

export const CIRCULARS: Circular[] = [
  { id: "C1", title: "Resumption date & approved stationery list — Second Term", date: "18 Dec 2025", audience: "All Parents", tone: "brand" },
  { id: "C2", title: "Mid-term break: 12 – 16 February 2026", date: "22 Jan 2026", audience: "Whole School", tone: "teal" },
  { id: "C3", title: "Payment deadline for Second Term fees — 9 January", date: "03 Jan 2026", audience: "Debtors", tone: "amber" },
  { id: "C4", title: "PTA general meeting — Saturday 7 February, 10:00am", date: "26 Jan 2026", audience: "All Parents", tone: "brand" },
];

/* ---------- calendar / events ---------- */
export const EVENTS = [
  { day: "09", month: "JAN", title: "Second Term resumption", meta: "All learners" },
  { day: "14", month: "FEB", title: "Inter-House Sports Festival", meta: "Main arena · 9am" },
  { day: "07", month: "FEB", title: "PTA General Meeting", meta: "School hall · 10am" },
  { day: "21", month: "MAR", title: "Open Day & Result Collection", meta: "Classrooms" },
];

/* ---------- teacher data ---------- */
export type TeacherClass = {
  id: string;
  name: string;
  arm: string;
  subject: string;
  students: number;
  submitted: number;
  status: "submitted" | "draft" | "pending";
  roster: { id: string; name: string; admissionNo: string; ca: number; exam: number }[];
};

const ROSTER_NAMES = [
  "Abdulrahman Yusuf", "Blessing Etim", "Chidera Nwosu", "Daniel Okafor", "Emmanuella Cole",
  "Faruq Adeleke", "Grace Mbah", "Halima Sani", "Ibrahim Lawal", "Jasmine Uche",
  "Kelechi Obi", "Lucy Adamu", "Musa Danjuma", "Ngozi Eze", "Oluwaseun Ajayi",
  "Precious Ihuoma", "Quadri Bello", "Ruth Alabi", "Samuel Effiong", "Tari Ebi",
  "Uche Nnamdi", "Victor Igwe", "Wale Ogundipe", "Zainab Idris",
];

function makeRoster(seed: number, count: number, offset = 0) {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => {
    const n = ROSTER_NAMES[(i + offset) % ROSTER_NAMES.length];
    const has = rand() > 0.18; // some scores already entered
    return {
      id: `STU-${5000 + i + seed}`,
      name: n,
      admissionNo: `SIA/2023/${String(400 + i + offset).padStart(4, "0")}`,
      ca: has ? Math.max(10, Math.min(40, Math.round(16 + rand() * 22))) : 0,
      exam: has ? Math.max(12, Math.min(60, Math.round(24 + rand() * 32))) : 0,
    };
  });
}

export const TEACHER_CLASSES: TeacherClass[] = [
  { id: "CLS-JSS3A", name: "JSS 3", arm: "A", subject: "Mathematics", students: 24, submitted: 24, status: "submitted", roster: makeRoster(11, 24, 0) },
  { id: "CLS-JSS3B", name: "JSS 3", arm: "B", subject: "Mathematics", students: 22, submitted: 22, status: "submitted", roster: makeRoster(27, 22, 6) },
  { id: "CLS-SS1S", name: "SS 1", arm: "Science", subject: "Mathematics", students: 20, submitted: 13, status: "draft", roster: makeRoster(43, 20, 12) },
  { id: "CLS-JSS2A", name: "JSS 2", arm: "A", subject: "Basic Science", students: 26, submitted: 0, status: "pending", roster: makeRoster(59, 26, 3) },
];

export const TEACHER_TIMETABLE = [
  { period: "08:00 – 08:45", subject: "Mathematics", klass: "JSS 3A", room: "B14" },
  { period: "08:45 – 09:30", subject: "Mathematics", klass: "SS 1 Science", room: "Lab 2" },
  { period: "10:15 – 11:00", subject: "Basic Science", klass: "JSS 2A", room: "B09" },
  { period: "12:30 – 13:15", subject: "Mathematics", klass: "JSS 3B", room: "B15" },
];

/* ---------- admin analytics ---------- */
export const ADMIN_KPI = [
  { label: "Total Enrolment", value: 1842, suffix: "", delta: 6.4, tone: "brand", icon: "users" },
  { label: "Fee Collection Rate", value: 87.4, suffix: "%", delta: 3.1, tone: "teal", icon: "wallet" },
  { label: "Staff on Payroll", value: 168, suffix: "", delta: 2.0, tone: "violet", icon: "teacher" },
  { label: "Average Attendance", value: 94, suffix: "%", delta: -1.2, tone: "amber", icon: "calendar" },
] as const;

export const ENROLMENT_TREND = [
  { label: "2019", value: 1290 },
  { label: "2020", value: 1348 },
  { label: "2021", value: 1421 },
  { label: "2022", value: 1567 },
  { label: "2023", value: 1680 },
  { label: "2024", value: 1731 },
  { label: "2025", value: 1842 },
];

export const COLLECTION_BY_TERM = [
  { label: "First Term", expected: 248_000_000, received: 231_400_000 },
  { label: "Second Term", expected: 248_000_000, received: 216_600_000 },
  { label: "Third Term", expected: 248_000_000, received: 118_200_000 },
];

export const CLASS_PERFORMANCE = [
  { label: "Primary 4", avg: 71.2 },
  { label: "Primary 5", avg: 68.4 },
  { label: "Primary 6", avg: 66.9 },
  { label: "JSS 1", avg: 64.1 },
  { label: "JSS 2", avg: 62.7 },
  { label: "JSS 3", avg: 67.8 },
  { label: "SS 1", avg: 70.3 },
  { label: "SS 2", avg: 65.2 },
  { label: "SS 3", avg: 72.6 },
];

export const FEE_STATUS_SPLIT = [
  { label: "Fully Paid", value: 1298, tone: "#14b8a6" },
  { label: "Part Paid", value: 316, tone: "#2563c9" },
  { label: "Outstanding", value: 228, tone: "#f59e0b" },
];

export const RECENT_ACTIVITY = [
  { who: "Mr. T. Bakare", action: "uploaded Mathematics results for", target: "JSS 3A", time: "4 min ago", tone: "brand" },
  { who: "Mrs. A. Okonkwo", action: "paid ₦150,000 fees for", target: "Chiamaka Okonkwo", time: "22 min ago", tone: "teal" },
  { who: "System", action: "published Second Term result for", target: "Primary 4B", time: "1 hr ago", tone: "violet" },
  { who: "Dr. K. Umeh", action: "started draft for Basic Science ·", target: "JSS 2A", time: "2 hrs ago", tone: "amber" },
  { who: "Bursary", action: "reconciled bank statement for", target: "14 Dec 2025", time: "3 hrs ago", tone: "slate" },
];

export const ADMIN_STUDENTS = [
  { id: "STU-3391", name: "Chiamaka Okonkwo", klass: "JSS 3A", guardian: "Mrs. A. Okonkwo", balance: 117500, avg: 78.4, status: "part" },
  { id: "STU-4107", name: "Ifeanyi Okonkwo", klass: "Primary 4B", guardian: "Mrs. A. Okonkwo", balance: 165500, avg: 61.2, status: "outstanding" },
  { id: "STU-2201", name: "Kelechi Obi", klass: "SS 2 Science", guardian: "Mr. P. Obi", balance: 0, avg: 84.9, status: "paid" },
  { id: "STU-1188", name: "Halima Sani", klass: "JSS 1C", guardian: "Alhaji M. Sani", balance: 0, avg: 72.6, status: "paid" },
  { id: "STU-3954", name: "Daniel Okafor", klass: "SS 3 Arts", guardian: "Mrs. B. Okafor", balance: 62000, avg: 58.3, status: "part" },
  { id: "STU-2760", name: "Grace Mbah", klass: "Primary 6A", guardian: "Mrs. E. Mbah", balance: 0, avg: 69.1, status: "paid" },
  { id: "STU-4402", name: "Musa Danjuma", klass: "JSS 2B", guardian: "Mr. I. Danjuma", balance: 43500, avg: 47.8, status: "part" },
  { id: "STU-3011", name: "Jasmine Uche", klass: "SS 1 Science", guardian: "Mrs. C. Uche", balance: 0, avg: 81.5, status: "paid" },
];

export const DEPARTMENT_HEADS = [
  { name: "Mrs. N. Adeyemi", unit: "Languages", staff: 22, util: 92 },
  { name: "Mr. T. Bakare", unit: "Mathematics", staff: 18, util: 78 },
  { name: "Dr. K. Umeh", unit: "Sciences", staff: 26, util: 88 },
  { name: "Mr. S. Chukwu", unit: "ICT & Robotics", staff: 11, util: 64 },
  { name: "Miss A. Nwachukwu", unit: "Creative Arts", staff: 9, util: 71 },
];

export const PAYMENT_METHODS = [
  { id: "card", label: "Debit / Credit Card", desc: "Visa, Mastercard, Verve", icon: "card", badge: "Instant" },
  { id: "transfer", label: "Bank Transfer", desc: "Scholaris Zenith · 1014785220", icon: "bank", badge: "1–2 hrs" },
  { id: "ussd", label: "USSD / Mobile Money", desc: "*737*… dial from registered phone", icon: "mobile", badge: "Instant" },
] as const;

export const CALENDAR_TERM_DATES = [
  { label: "Second Term begins", value: "9 January 2026" },
  { label: "Mid-term break", value: "12 – 16 February 2026" },
  { label: "Examinations begin", value: "20 March 2026" },
  { label: "Term ends / Result day", value: "4 April 2026" },
];
