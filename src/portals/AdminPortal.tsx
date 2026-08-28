import { useMemo, useState } from "react";
import { usePageEnter } from "../lib/gsap";
import PortalFrame, { type NavItem } from "../components/PortalFrame";
import { Btn, Panel, StatTile, Avatar, Badge, Tabs, Progress, useToast, Modal, Empty } from "../components/ui";
import { AreaChart, BarChart, Donut, HBars, ScoreRing, Sparkline } from "../components/charts";
import {
  IconGrid, IconWallet, IconClipboard, IconUsers, IconTeacher, IconChart, IconBell, IconTrophy,
  IconTrendUp, IconTrendDown, IconAlert, IconCheckCircle, IconEye, IconDownload, IconSearch,
  IconCheck, IconShield, IconFile, IconCalendar, IconReceipt, IconSparkle, CheckBurst, IconArrowRight,
} from "../components/Icons";
import {
  ADMIN, ADMIN_KPI, ENROLMENT_TREND, COLLECTION_BY_TERM, CLASS_PERFORMANCE, FEE_STATUS_SPLIT,
  RECENT_ACTIVITY, ADMIN_STUDENTS, DEPARTMENT_HEADS, NEWS, CIRCULARS, TEACHER_CLASSES, PAYMENTS,
  money, SESSION,
} from "../data/mock";
import type { Role } from "../App";

export default function AdminPortal({ onExit, onSwitch }: { onExit: () => void; onSwitch: (r: Role) => void }) {
  const [tab, setTab] = useState("overview");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "part" | "outstanding">("all");
  const [publishOpen, setPublishOpen] = useState(false);
  const [published, setPublished] = useState(false);
  const { toast, toastNode } = useToast();
  const pageRef = usePageEnter(tab);

  const nav: NavItem[] = [
    { id: "overview", label: "Overview", icon: <IconGrid size={17} /> },
    { id: "results", label: "Results & Approval", icon: <IconClipboard size={17} />, badge: "2" },
    { id: "finance", label: "Fees & Finance", icon: <IconWallet size={17} /> },
    { id: "students", label: "Students", icon: <IconUsers size={17} /> },
    { id: "staff", label: "Staff & Departments", icon: <IconTeacher size={17} /> },
    { id: "circulars", label: "Circulars", icon: <IconBell size={17} /> },
  ];

  const titles: Record<string, [string, string]> = {
    overview: ["Administrator Console", "Live oversight of enrolment, finance, academics and staff across the whole school."],
    results: ["Results & Approval", "Verify teacher broadsheets, flag outliers and publish results school-wide."],
    finance: ["Fees & Finance", "Collection rate, receivables, reconciliation and payment channel performance."],
    students: ["Student Register", "Every learner with their guardian, fee position and academic standing."],
    staff: ["Staff & Departments", "Departmental workload, staffing and submission compliance."],
    circulars: ["Circulars & Newsroom", "Compose, target and schedule announcements to the school community."],
  };

  const students = useMemo(
    () => ADMIN_STUDENTS.filter(s =>
      (statusFilter === "all" || s.status === statusFilter) &&
      (s.name.toLowerCase().includes(query.toLowerCase()) || s.klass.toLowerCase().includes(query.toLowerCase()) || s.id.toLowerCase().includes(query.toLowerCase()))
    ), [query, statusFilter]);

  const collectionRate = Math.round(
    (COLLECTION_BY_TERM.reduce((a, t) => a + t.received, 0) / COLLECTION_BY_TERM.reduce((a, t) => a + t.expected, 0)) * 1000
  ) / 10;
  const totalReceived = COLLECTION_BY_TERM.reduce((a, t) => a + t.received, 0);
  const totalExpected = COLLECTION_BY_TERM.reduce((a, t) => a + t.expected, 0);
  const receivables = totalExpected - totalReceived;

  const kpiTones: Record<string, string> = { brand: "#2563c9", teal: "#0d9488", violet: "#7c3aed", amber: "#f59e0b" };

  return (
    <PortalFrame
      person={ADMIN} role="admin" nav={nav} active={tab}
      onNav={setTab} onExit={onExit} pageTitle={titles[tab][0]} pageNote={titles[tab][1]}
    >
      <div ref={pageRef}>
        {/* ============================== OVERVIEW ============================== */}
        {tab === "overview" && (
          <>
            {/* KPI row */}
            <div className="row g-3 mb-4">
              {ADMIN_KPI.map(k => (
                <div className="col-6 col-lg-3" key={k.label}>
                  <StatTile
                    label={k.label}
                    value={k.value}
                    decimals={k.label.includes("Rate") || k.label.includes("Attendance") ? 1 : 0}
                    suffix={k.suffix}
                    delta={k.delta}
                    tone={kpiTones[k.tone]}
                    icon={k.icon === "users" ? <IconUsers size={16} /> : k.icon === "wallet" ? <IconWallet size={16} /> : k.icon === "teacher" ? <IconTeacher size={16} /> : <IconCalendar size={16} />}
                    foot="vs last term"
                  />
                </div>
              ))}
            </div>

            <div className="row g-4">
              {/* charts */}
              <div className="col-xl-8 d-flex flex-column gap-4">
                <Panel
                  title="Enrolment trend"
                  subtitle="Head count at the start of each academic session"
                  icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--brand-100)", color: "var(--brand-700)", placeItems: "center" }}><IconTrendUp size={17} /></span>}
                  actions={<Badge tone="teal">+552 in 6 years</Badge>}
                >
                  <AreaChart data={ENROLMENT_TREND} height={210} />
                </Panel>

                <div className="row g-4">
                  <div className="col-lg-6">
                    <Panel title="Fee collection by term" subtitle="Expected vs received (₦ millions)" icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--teal-100)", color: "var(--teal-600)", placeItems: "center" }}><IconWallet size={17} /></span>}>
                      <BarChart
                        data={COLLECTION_BY_TERM.map(t => ({ label: t.label.split(" ")[0], value: Math.round(t.received / 1_000_000) }))}
                        height={200} colorFrom="#14b8a6" colorTo="#2563c9" format={(n) => `${n}M`}
                      />
                      <div className="d-flex justify-content-between fs-8 mt-3 pt-3 border-top">
                        <span className="text-muted-2">Collection rate</span>
                        <span className="fw-800 text-teal">{collectionRate}%</span>
                      </div>
                    </Panel>
                  </div>
                  <div className="col-lg-6">
                    <Panel title="Class performance" subtitle="School average by class level" icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--violet-100)", color: "var(--violet-600)", placeItems: "center" }}><IconTrophy size={17} /></span>}>
                      <HBars data={CLASS_PERFORMANCE.map(c => ({ label: c.label, value: c.avg }))} format={(n) => `${n}%`} tone="#7c3aed" />
                    </Panel>
                  </div>
                </div>

                <Panel
                  title="Recent system activity"
                  subtitle="Every action is audited against a staff or parent account"
                  icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--slate-100)", color: "var(--slate-700)", placeItems: "center" }}><IconShield size={17} /></span>}
                  actions={<Btn size="sm" variant="soft" onClick={() => toast("Full audit log opened", "brand")}>Audit log</Btn>}
                >
                  <div className="d-flex flex-column gap-2">
                    {RECENT_ACTIVITY.map((a, i) => (
                      <div key={i} className="d-flex align-items-start gap-3 p-2 rounded-3" style={{ background: "var(--slate-50)" }}>
                        <span className="mt-1 dot" style={{ background: a.tone === "teal" ? "#14b8a6" : a.tone === "brand" ? "#2563c9" : a.tone === "violet" ? "#7c3aed" : a.tone === "amber" ? "#f59e0b" : "#94a3b8" }} />
                        <div className="lh-sm flex-grow-1">
                          <span className="fs-8"><strong className="text-ink">{a.who}</strong> <span className="text-muted-2">{a.action}</span> <strong className="text-ink">{a.target}</strong></span>
                        </div>
                        <span className="fs-8 text-muted-2 flex-shrink-0" style={{ fontSize: ".68rem" }}>{a.time}</span>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>

              {/* rail */}
              <div className="col-xl-4 d-flex flex-column gap-4">
                <Panel title="Fee status split" subtitle={`${FEE_STATUS_SPLIT.reduce((a, s) => a + s.value, 0)} learners · Second Term`} icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--amber-100)", color: "#a16207", placeItems: "center" }}><IconAlert size={17} /></span>}>
                  <Donut segments={FEE_STATUS_SPLIT} size={168} thickness={20} center={{ top: `${collectionRate}%`, sub: "COLLECTED" }} />
                </Panel>

                <Panel title="Attention required" subtitle="Flags raised by the system" icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--rose-100)", color: "var(--rose-500)", placeItems: "center" }}><IconAlert size={17} /></span>}>
                  <div className="d-flex flex-column gap-2">
                    {[
                      { t: "2 broadsheets awaiting approval", s: "JSS 2A · Basic Science, SS 1 · Maths", tone: "amber" },
                      { t: "228 learners with outstanding fees", s: "₦41.8M receivables · 21 days overdue", tone: "rose" },
                      { t: "Attendance dipped below 92%", s: "JSS 1C and Primary 5A this week", tone: "rose" },
                      { t: "3 results flagged for review", s: "Score deviation beyond 2σ", tone: "violet" },
                    ].map(f => (
                      <div key={f.t} className="p-2 rounded-3 d-flex gap-2 align-items-start" style={{ background: "var(--slate-50)" }}>
                        <Badge tone={f.tone as "amber" | "rose" | "violet"}>!</Badge>
                        <div className="lh-sm">
                          <div className="fw-bold fs-8">{f.t}</div>
                          <div className="fs-8 text-muted-2" style={{ fontSize: ".68rem" }}>{f.s}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel title="Quick actions" subtitle="Administrator shortcuts" icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--brand-100)", color: "var(--brand-700)", placeItems: "center" }}><IconSparkle size={17} /></span>}>
                  <div className="d-flex flex-column gap-2">
                    {[
                      { l: "Publish Second Term results", i: <IconClipboard size={16} />, go: () => setPublishOpen(true) },
                      { l: "Send fee reminder to debtors", i: <IconReceipt size={16} />, go: () => toast("Reminder scheduled for 1,204 guardians") },
                      { l: "Approve pending broadsheets", i: <IconCheck size={16} />, go: () => setTab("results") },
                      { l: "Generate session report", i: <IconFile size={16} />, go: () => toast("Session report generating…", "brand") },
                    ].map(a => (
                      <button key={a.l} data-click onClick={a.go} className="w-100 text-start p-2 rounded-3 d-flex align-items-center gap-2 fs-8 fw-bold border-0" style={{ background: "var(--slate-50)" }}>
                        <span className="text-brand">{a.i}</span> {a.l} <IconArrowRight size={13} className="ms-auto" />
                      </button>
                    ))}
                  </div>
                </Panel>
              </div>
            </div>
          </>
        )}

        {/* ============================== RESULTS APPROVAL ============================== */}
        {tab === "results" && (
          <>
            <div className="row g-3 mb-4">
              <div className="col-6 col-lg-3"><StatTile label="Broadsheets submitted" value={38} tone="#7c3aed" icon={<IconClipboard size={16} />} foot="of 42 class arms" /></div>
              <div className="col-6 col-lg-3"><StatTile label="Awaiting approval" value={2} tone="#f59e0b" icon={<IconAlert size={16} />} foot="Review before publishing" /></div>
              <div className="col-6 col-lg-3"><StatTile label="Results published" value={36} tone="#0d9488" icon={<IconCheckCircle size={16} />} foot="Visible to parents" /></div>
              <div className="col-6 col-lg-3"><StatTile label="School average" value={67.4} decimals={1} suffix="%" tone="#2563c9" icon={<IconTrophy size={16} />} foot="+2.1 vs last term" /></div>
            </div>

            <div className="row g-4">
              <div className="col-xl-8">
                <Panel
                  title="Broadsheet approval queue"
                  subtitle="Verify teacher submissions before releasing results to guardians"
                  icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--violet-100)", color: "var(--violet-600)", placeItems: "center" }}><IconClipboard size={17} /></span>}
                  actions={<Btn size="sm" onClick={() => setPublishOpen(true)}>Publish all verified <IconCheck size={13} /></Btn>}
                >
                  <div className="table-responsive">
                    <table className="table-x">
                      <thead><tr><th>Class arm</th><th>Subject</th><th>Teacher</th><th>Learners</th><th>Average</th><th>Std dev</th><th>State</th><th></th></tr></thead>
                      <tbody>
                        {TEACHER_CLASSES.map(c => {
                          const scored = c.roster.filter(r => r.ca + r.exam > 0);
                          const avg = scored.length ? Math.round(scored.reduce((a, r) => a + r.ca + r.exam, 0) / scored.length) : 0;
                          return (
                            <tr key={c.id}>
                              <td className="fw-bold text-ink">{c.name} {c.arm}</td>
                              <td className="fs-8">{c.subject}</td>
                              <td className="fs-8">{c.id === "CLS-JSS2A" ? "Dr. K. Umeh" : "Mr. T. Bakare"}</td>
                              <td className="mono">{c.students}</td>
                              <td><span className="fw-800 mono">{avg}%</span></td>
                              <td className="mono fs-8">{(avg * 0.14).toFixed(1)}</td>
                              <td><Badge tone={c.status === "submitted" ? "teal" : c.status === "draft" ? "amber" : "rose"}>{c.status === "submitted" ? "Published" : c.status === "draft" ? "Needs approval" : "Not started"}</Badge></td>
                              <td className="d-flex gap-1">
                                <button className="btn btn-soft btn-sm" data-click onClick={() => toast("Broadsheet opened in review mode", "brand")} aria-label="Review"><IconEye size={14} /></button>
                                <button className="btn btn-soft btn-sm" data-click onClick={() => toast(`Result ${c.status === "submitted" ? "already published" : "approved & published"}`)} aria-label="Approve"><IconCheck size={14} /></button>
                              </td>
                            </tr>
                          );
                        })}
                        {[
                          { n: "Primary 6 A", s: "English Language", t: "Mrs. N. Adeyemi", st: 31, av: 69, sd: 9.4, state: "draft" },
                          { n: "SS 2 Science", s: "Basic Science", t: "Dr. K. Umeh", st: 28, av: 71, sd: 8.1, state: "draft" },
                          { n: "JSS 1 C", s: "Social Studies", t: "Mr. P. Ogundipe", st: 33, av: 63, sd: 11.2, state: "submitted" },
                          { n: "SS 3 Arts", s: "Civic Education", t: "Mrs. F. Bello", st: 26, av: 66, sd: 7.8, state: "submitted" },
                        ].map(r => (
                          <tr key={r.n + r.s}>
                            <td className="fw-bold text-ink">{r.n}</td>
                            <td className="fs-8">{r.s}</td>
                            <td className="fs-8">{r.t}</td>
                            <td className="mono">{r.st}</td>
                            <td><span className="fw-800 mono">{r.av}%</span></td>
                            <td className="mono fs-8">{r.sd}</td>
                            <td><Badge tone={r.state === "submitted" ? "teal" : "amber"}>{r.state === "submitted" ? "Published" : "Needs approval"}</Badge></td>
                            <td className="d-flex gap-1">
                              <button className="btn btn-soft btn-sm" data-click onClick={() => toast("Broadsheet opened in review mode", "brand")} aria-label="Review"><IconEye size={14} /></button>
                              <button className="btn btn-soft btn-sm" data-click onClick={() => toast("Approved & published")} aria-label="Approve"><IconCheck size={14} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              </div>

              <div className="col-xl-4 d-flex flex-column gap-4">
                <div className="card-x p-4 text-center" data-stagger>
                  <div className="eyebrow text-muted-2 mb-3">School-wide average</div>
                  <ScoreRing value={67} size={148} tone="#2563c9" label="Average" />
                  <div className="d-flex justify-content-center gap-2 mt-3 flex-wrap">
                    <Badge tone="teal">Best: SS 3 · 72.6%</Badge>
                    <Badge tone="rose">Lowest: JSS 2 · 62.7%</Badge>
                  </div>
                </div>

                <Panel title="Publication checklist" subtitle="Required before release" icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--teal-100)", color: "var(--teal-600)", placeItems: "center" }}><IconCheckCircle size={17} /></span>}>
                  <div className="d-flex flex-column gap-2">
                    {[
                      { t: "All teachers submitted broadsheets", ok: false },
                      { t: "Score outliers reviewed by HOD", ok: true },
                      { t: "Positions & averages recomputed", ok: true },
                      { t: "Principal's signature applied", ok: true },
                      { t: "Parent notification drafted", ok: false },
                    ].map(c => (
                      <div key={c.t} className="d-flex align-items-center gap-2 fs-8">
                        <span className="d-grid rounded-circle" style={{ width: 20, height: 20, placeItems: "center", background: c.ok ? "var(--teal-500)" : "var(--slate-200)", color: "#fff", fontSize: ".6rem" }}>
                          {c.ok ? "✓" : ""}
                        </span>
                        <span style={{ color: c.ok ? "var(--ink-900)" : "var(--slate-500)" }}>{c.t}</span>
                      </div>
                    ))}
                  </div>
                  <Btn full className="mt-3" onClick={() => setPublishOpen(true)}>Publish Second Term results</Btn>
                </Panel>
              </div>
            </div>
          </>
        )}

        {/* ============================== FINANCE ============================== */}
        {tab === "finance" && (
          <>
            <div className="row g-3 mb-4">
              <div className="col-6 col-lg-3"><StatTile label="Billed this session" value={totalExpected / 1_000_000} decimals={1} prefix="₦" suffix="M" tone="#2563c9" icon={<IconWallet size={16} />} foot="3 terms" /></div>
              <div className="col-6 col-lg-3"><StatTile label="Received" value={totalReceived / 1_000_000} decimals={1} prefix="₦" suffix="M" tone="#0d9488" icon={<IconTrendUp size={16} />} foot={`${collectionRate}% collected`} /></div>
              <div className="col-6 col-lg-3"><StatTile label="Receivables" value={receivables / 1_000_000} decimals={1} prefix="₦" suffix="M" tone="#e0344b" icon={<IconTrendDown size={16} />} foot="Outstanding invoices" /></div>
              <div className="col-6 col-lg-3"><StatTile label="Average days to pay" value={12} suffix=" days" tone="#f59e0b" icon={<IconCalendar size={16} />} foot="From invoice date" /></div>
            </div>

            <div className="row g-4">
              <div className="col-xl-8 d-flex flex-column gap-4">
                <Panel title="Collection vs expectation" subtitle="Per term · Second Term still in progress" icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--teal-100)", color: "var(--teal-600)", placeItems: "center" }}><IconChart size={17} /></span>}>
                  <div className="d-flex flex-column gap-4">
                    {COLLECTION_BY_TERM.map(t => {
                      const pct = Math.round((t.received / t.expected) * 100);
                      return (
                        <div key={t.label}>
                          <div className="d-flex justify-content-between fs-8 mb-1">
                            <span className="fw-bold">{t.label}</span>
                            <span className="text-muted-2">{money(t.received)} of {money(t.expected)} · <strong className="text-ink">{pct}%</strong></span>
                          </div>
                          <Progress value={pct} tone={pct >= 85 ? "teal" : pct >= 60 ? "brand" : "amber"} />
                        </div>
                      );
                    })}
                  </div>
                </Panel>

                <Panel
                  title="Recent transactions"
                  subtitle="Live feed from the payment gateway"
                  icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--brand-100)", color: "var(--brand-700)", placeItems: "center" }}><IconReceipt size={17} /></span>}
                  actions={<Btn size="sm" variant="soft" onClick={() => toast("Reconciliation report exported", "brand")}><span className="d-inline-flex align-items-center gap-1"><IconDownload size={13} /> Reconcile</span></Btn>}
                >
                  <div className="table-responsive">
                    <table className="table-x">
                      <thead><tr><th>Reference</th><th>Guardian</th><th>Ward</th><th>Channel</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                        {PAYMENTS.map(p => (
                          <tr key={p.id}>
                            <td className="mono fs-8 fw-bold">{p.reference}</td>
                            <td className="fs-8 fw-bold text-ink">{p.ward.split(" ")[1] ? `Mrs. ${p.ward.split(" ")[1]}` : "—"}</td>
                            <td className="fs-8">{p.ward}</td>
                            <td className="fs-8">{p.method}</td>
                            <td className="fw-800 mono">{money(p.amount)}</td>
                            <td><Badge tone={p.status === "successful" ? "teal" : p.status === "pending" ? "amber" : "rose"}>{p.status}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>
              </div>

              <div className="col-xl-4 d-flex flex-column gap-4">
                <Panel title="Payment channels" subtitle="Share of settled transactions" icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--violet-100)", color: "var(--violet-600)", placeItems: "center" }}><IconChart size={17} /></span>}>
                  <Donut
                    size={160} thickness={19}
                    segments={[
                      { label: "Card", value: 812, tone: "#2563c9" },
                      { label: "Transfer", value: 604, tone: "#14b8a6" },
                      { label: "USSD", value: 318, tone: "#f59e0b" },
                      { label: "Cash / Bursary", value: 108, tone: "#94a3b8" },
                    ]}
                    center={{ top: "1,842", sub: "PAYMENTS" }}
                  />
                </Panel>

                <Panel title="Top debtor classes" subtitle="Outstanding by class arm" icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--rose-100)", color: "var(--rose-500)", placeItems: "center" }}><IconAlert size={17} /></span>}>
                  <HBars
                    data={[
                      { label: "SS 3 Science", value: 8_420_000 },
                      { label: "SS 2 Science", value: 6_150_000 },
                      { label: "JSS 3A", value: 4_980_000 },
                      { label: "Primary 6A", value: 3_240_000 },
                      { label: "JSS 1C", value: 2_110_000 },
                    ]}
                    format={(n) => "₦" + (n / 1_000_000).toFixed(1) + "M"}
                    tone="#e0344b"
                  />
                  <Btn full variant="soft" size="sm" className="mt-3" onClick={() => toast("Reminders queued for 1,204 guardians")}>Send reminders</Btn>
                </Panel>
              </div>
            </div>
          </>
        )}

        {/* ============================== STUDENTS ============================== */}
        {tab === "students" && (
          <>
            <div className="card-x p-3 mb-4 d-flex flex-wrap gap-3 align-items-center justify-content-between" data-stagger>
              <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: 320 }}>
                <span className="text-muted-2"><IconSearch size={16} /></span>
                <input className="form-control form-control-sm border-0 px-0 bg-transparent" placeholder="Search by name, class or admission no…" value={query} onChange={e => setQuery(e.target.value)} style={{ boxShadow: "none" }} />
              </div>
              <Tabs
                items={[{ id: "all", label: `All ${ADMIN_STUDENTS.length}` }, { id: "paid", label: "Paid" }, { id: "part", label: "Part paid" }, { id: "outstanding", label: "Outstanding" }] as { id: typeof statusFilter; label: string }[]}
                active={statusFilter} onChange={setStatusFilter}
              />
              <Btn size="sm" variant="soft" onClick={() => toast("Register exported (CSV)", "brand")}><span className="d-inline-flex align-items-center gap-1"><IconDownload size={13} /> Export</span></Btn>
            </div>

            <Panel title="Student register" subtitle={`${students.length} record(s) · Session ${SESSION}`} icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--brand-100)", color: "var(--brand-700)", placeItems: "center" }}><IconUsers size={17} /></span>}>
              <div className="table-responsive">
                <table className="table-x">
                  <thead><tr><th>Learner</th><th>Admission no.</th><th>Class</th><th>Guardian</th><th>Balance</th><th>Average</th><th>Trend</th><th>Status</th></tr></thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Avatar initials={s.name.split(" ").map(n => n[0]).join("")} color="linear-gradient(135deg,#2563c9,#0d9488)" size={28} />
                            <span className="fw-bold text-ink fs-8">{s.name}</span>
                          </div>
                        </td>
                        <td className="mono fs-8">{s.id}</td>
                        <td className="fs-8">{s.klass}</td>
                        <td className="fs-8">{s.guardian}</td>
                        <td className="mono fw-800" style={{ color: s.balance > 0 ? "var(--rose-500)" : "var(--teal-600)" }}>{s.balance > 0 ? money(s.balance) : "—"}</td>
                        <td className="mono fw-bold">{s.avg}%</td>
                        <td><Sparkline values={[s.avg - 6, s.avg - 2, s.avg - 4, s.avg, s.avg + 2]} stroke={s.avg >= 70 ? "#14b8a6" : "#2563c9"} /></td>
                        <td><Badge tone={s.status === "paid" ? "teal" : s.status === "part" ? "amber" : "rose"}>{s.status === "paid" ? "Fully paid" : s.status === "part" ? "Part paid" : "Outstanding"}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {students.length === 0 && <div className="mt-3"><Empty icon={<IconSearch size={22} />} title="No matching learners" note="Try a different name, class or filter." /></div>}
            </Panel>
          </>
        )}

        {/* ============================== STAFF ============================== */}
        {tab === "staff" && (
          <div className="row g-4">
            <div className="col-lg-8">
              <Panel title="Departments" subtitle="Head of department, staffing and result-submission compliance" icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--violet-100)", color: "var(--violet-600)", placeItems: "center" }}><IconTeacher size={17} /></span>}>
                <div className="table-responsive">
                  <table className="table-x">
                    <thead><tr><th>Department</th><th>Head</th><th>Staff</th><th>Broadsheet compliance</th><th>Performance</th></tr></thead>
                    <tbody>
                      {DEPARTMENT_HEADS.map(d => (
                        <tr key={d.unit}>
                          <td className="fw-bold text-ink">{d.unit}</td>
                          <td className="fs-8">
                            <div className="d-flex align-items-center gap-2">
                              <Avatar initials={d.name.split(" ").slice(-1)[0].slice(0, 2)} color="linear-gradient(135deg,#7c3aed,#2563c9)" size={26} />
                              {d.name}
                            </div>
                          </td>
                          <td className="mono">{d.staff}</td>
                          <td style={{ minWidth: 150 }}>
                            <div className="d-flex align-items-center gap-2">
                              <Progress value={d.util} tone={d.util >= 85 ? "teal" : "brand"} />
                              <span className="mono fs-8 fw-bold">{d.util}%</span>
                            </div>
                          </td>
                          <td><Badge tone={d.util >= 85 ? "teal" : d.util >= 70 ? "brand" : "amber"}>{d.util >= 85 ? "Excellent" : d.util >= 70 ? "Good" : "Needs attention"}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel title="Staff distribution" subtitle="Teaching vs non-teaching · 168 total" className="mt-4" icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--brand-100)", color: "var(--brand-700)", placeItems: "center" }}><IconChart size={17} /></span>}>
                <BarChart data={[
                  { label: "Teaching", value: 112 }, { label: "Non-teach", value: 26 },
                  { label: "Admin", value: 14 }, { label: "Security", value: 9 }, { label: "Bursary", value: 7 },
                ]} height={200} />
              </Panel>
            </div>

            <div className="col-lg-4 d-flex flex-column gap-4">
              <StatTile label="Total staff" value={168} tone="#7c3aed" icon={<IconTeacher size={16} />} foot="112 teaching" />
              <StatTile label="Staff : student ratio" value={11} suffix=" : 1" tone="#2563c9" icon={<IconUsers size={16} />} foot="National target 1 : 20" />
              <Panel title="Staff attendance" subtitle="This week" icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--teal-100)", color: "var(--teal-600)", placeItems: "center" }}><IconCalendar size={17} /></span>}>
                <HBars data={[{ label: "Monday", value: 98 }, { label: "Tuesday", value: 96 }, { label: "Wednesday", value: 94 }, { label: "Thursday", value: 97 }, { label: "Friday", value: 91 }]} format={(n) => `${n}%`} />
              </Panel>
            </div>
          </div>
        )}

        {/* ============================== CIRCULARS ============================== */}
        {tab === "circulars" && (
          <div className="row g-4">
            <div className="col-lg-5">
              <Panel title="Compose circular" subtitle="Target a specific audience and schedule delivery" icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--brand-100)", color: "var(--brand-700)", placeItems: "center" }}><IconBell size={17} /></span>}>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input className="form-control" placeholder="e.g. Mid-term break notice" defaultValue="Second Term Open Day schedule" />
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label">Audience</label>
                    <select className="form-select"><option>All parents</option><option>JSS 3 parents</option><option>Staff only</option><option>Debtors only</option><option>Whole school</option></select>
                  </div>
                  <div className="col-6">
                    <label className="form-label">Delivery date</label>
                    <input type="date" className="form-control" defaultValue="2026-02-03" />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Message</label>
                  <textarea className="form-control" rows={5} defaultValue="Parents are invited to the Second Term Open Day on Saturday 21 March 2026. Report cards will be available in the portal from 6:00am that morning." />
                </div>
                <div className="d-flex gap-2">
                  <Btn full onClick={() => toast("Circular scheduled for 3 Feb 2026", "brand")}>Schedule circular</Btn>
                  <Btn variant="soft" onClick={() => toast("Draft saved")}>Save draft</Btn>
                </div>
              </Panel>
            </div>

            <div className="col-lg-7 d-flex flex-column gap-4">
              <Panel title="Published circulars" subtitle="Most recent first" icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--slate-100)", color: "var(--slate-700)", placeItems: "center" }}><IconFile size={17} /></span>}>
                <div className="table-responsive">
                  <table className="table-x">
                    <thead><tr><th>Title</th><th>Audience</th><th>Date</th><th>Reads</th><th></th></tr></thead>
                    <tbody>
                      {CIRCULARS.map((c, i) => (
                        <tr key={c.id}>
                          <td className="fw-bold text-ink fs-8">{c.title}</td>
                          <td className="fs-8">{c.audience}</td>
                          <td className="fs-8">{c.date}</td>
                          <td className="mono fs-8">{[1240, 980, 412, 1104][i]}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <button className="btn btn-soft btn-sm" data-click onClick={() => toast("Circular preview")} aria-label="Preview"><IconEye size={13} /></button>
                              <button className="btn btn-soft btn-sm" data-click onClick={() => toast("Circular exported", "brand")} aria-label="Export"><IconDownload size={13} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel title="Newsroom" subtitle="Public-facing stories published to the school website" icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--teal-100)", color: "var(--teal-600)", placeItems: "center" }}><IconSparkle size={17} /></span>}>
                <div className="row g-3">
                  {NEWS.map(n => (
                    <div className="col-sm-6" key={n.id}>
                      <div className="d-flex gap-3 p-2 rounded-4 align-items-center h-100" style={{ background: "var(--slate-50)" }}>
                        <img src={n.image} alt="" style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover" }} loading="lazy" />
                        <div className="lh-sm">
                          <div className="fw-bold fs-8" style={{ lineHeight: 1.3 }}>{n.title.slice(0, 46)}…</div>
                          <div className="fs-8 text-muted-2" style={{ fontSize: ".66rem" }}>{n.category} · {n.date}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        )}
      </div>

      {/* publish modal */}
      <Modal open={publishOpen} onClose={() => setPublishOpen(false)} title="Publish Second Term results">
        {published ? (
          <div className="text-center py-2">
            <div className="mb-3"><CheckBurst size={86} /></div>
            <h4 className="display-font fw-800 mb-1" style={{ fontSize: "1.3rem" }}>Results published</h4>
            <p className="fs-8 text-muted-2 mb-4">1,612 report cards are now live. Guardians have been notified by SMS, email and push.</p>
            <Btn full onClick={() => { setPublishOpen(false); setPublished(false); }}>Close</Btn>
          </div>
        ) : (
          <>
            <p className="fs-8 text-muted-2">Releasing results makes them immediately visible on every guardian portal. This action is logged against your administrator ID and cannot be undone silently.</p>
            <div className="row g-2 mb-4">
              {[["Class arms", "36 of 42"], ["Learners affected", "1,612"], ["Broadsheets pending", "2"], ["Guardians notified", "1,204"]].map(([k, v]) => (
                <div className="col-6" key={k}>
                  <div className="p-2 rounded-3 d-flex justify-content-between" style={{ background: "var(--slate-50)" }}>
                    <span className="fs-8 text-muted-2">{k}</span><span className="fs-8 fw-bold">{v}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="d-flex gap-2">
              <Btn variant="soft" full onClick={() => setPublishOpen(false)}>Cancel</Btn>
              <Btn full onClick={() => { setPublished(true); toast("Second Term results published to 1,204 guardians", "brand"); }}>Publish now</Btn>
            </div>
          </>
        )}
      </Modal>

      {toastNode}

      <div className="position-fixed no-print" style={{ bottom: 20, left: 20, zIndex: 900 }}>
        <div className="d-flex align-items-center gap-2 p-2 rounded-4" style={{ background: "rgba(13,20,38,.92)", backdropFilter: "blur(8px)" }}>
          <span className="eyebrow px-2" style={{ color: "#8fa6cd", fontSize: ".5rem" }}>DEMO<br />SWITCH</span>
          {([["parent", "Parent"], ["teacher", "Teacher"], ["admin", "Admin"]] as [Role, string][]).map(([r, l]) => (
            <button key={r} data-click onClick={() => onSwitch(r)} className="btn btn-sm" style={{ background: r === "admin" ? "linear-gradient(135deg,#0d9488,#0f766e)" : "rgba(255,255,255,.1)", color: "#fff", fontSize: ".7rem" }}>{l}</button>
          ))}
        </div>
      </div>
    </PortalFrame>
  );
}
