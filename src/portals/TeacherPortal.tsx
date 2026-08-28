import { useEffect, useMemo, useState } from "react";
import { gsap, usePageEnter } from "../lib/gsap";
import PortalFrame, { type NavItem } from "../components/PortalFrame";
import { Btn, Panel, StatTile, Avatar, Badge, Empty, Progress, useToast, Modal } from "../components/ui";
import { BarChart, ScoreRing, HBars } from "../components/charts";
import {
  IconGrid, IconUpload, IconUsers, IconCalendar, IconCheck, IconCheckCircle, IconAlert,
  IconClipboard, IconTrophy, IconClock, IconFile, IconEye, IconDownload, IconChevronRight,
  IconSparkle, CheckBurst, IconPlus, IconSearch, IconShield,
} from "../components/Icons";
import {
  TEACHER, TEACHER_CLASSES, TEACHER_TIMETABLE, gradeOf, AVG_TONE, SESSION, type TeacherClass,
} from "../data/mock";
import type { Role } from "../App";

type Row = { id: string; name: string; admissionNo: string; ca: number; exam: number };

export default function TeacherPortal({ onExit, onSwitch }: { onExit: () => void; onSwitch: (r: Role) => void }) {
  const [tab, setTab] = useState("overview");
  const [klass, setKlass] = useState<TeacherClass>(TEACHER_CLASSES[2]);
  const [rows, setRows] = useState<Row[]>(klass.roster.map(r => ({ ...r })));
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [locked, setLocked] = useState(klass.status === "submitted");
  const { toast, toastNode } = useToast();
  const pageRef = usePageEnter(tab);

  useEffect(() => {
    setRows(klass.roster.map(r => ({ ...r })));
    setLocked(klass.status === "submitted");
    setSubmitted(klass.status === "submitted");
  }, [klass]);

  useEffect(() => {
    if (!pageRef.current) return;
    const t = window.setTimeout(() => gsap.fromTo("[data-row]", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .35, stagger: .03, ease: "power2.out" }), 60);
    return () => window.clearTimeout(t);
  }, [klass, tab]);

  const nav: NavItem[] = [
    { id: "overview", label: "Overview", icon: <IconGrid size={17} /> },
    { id: "upload", label: "Upload Results", icon: <IconUpload size={17} />, badge: "3" },
    { id: "classes", label: "My Classes", icon: <IconUsers size={17} /> },
    { id: "timetable", label: "Timetable", icon: <IconCalendar size={17} /> },
  ];

  const titles: Record<string, [string, string]> = {
    overview: ["Teacher Workspace", "Your classes, submission status and today's teaching schedule."],
    upload: ["Upload Class Results", "Enter CA and examination scores for the class arms you handle. Grades compute automatically."],
    classes: ["My Classes", "Rosters, size, performance snapshot and submission state per arm."],
    timetable: ["Timetable", "Your teaching periods for the current week."],
  };

  const stats = useMemo(() => {
    const complete = rows.filter(r => r.ca > 0 && r.exam > 0);
    const totals = complete.map(r => r.ca + r.exam);
    return {
      entered: complete.length,
      total: rows.length,
      avg: totals.length ? Math.round((totals.reduce((a, b) => a + b, 0) / totals.length) * 10) / 10 : 0,
      pass: totals.filter(t => t >= 50).length,
    };
  }, [rows]);

  const filtered = rows.filter(r => r.name.toLowerCase().includes(query.toLowerCase()) || r.admissionNo.toLowerCase().includes(query.toLowerCase()));

  const setScore = (id: string, field: "ca" | "exam", value: number) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: Math.max(0, Math.min(field === "ca" ? 40 : 60, value)) } : r));
  };

  const submit = () => {
    setConfirm(false);
    setLocked(true);
    setSubmitted(true);
    toast("Broadsheet submitted to the Exam Officer");
  };

  const fillDemo = () => {
    setRows(prev => prev.map(r => ({
      ...r,
      ca: r.ca || 16 + Math.round(Math.random() * 22),
      exam: r.exam || 22 + Math.round(Math.random() * 34),
    })));
    toast("Sample scores filled for remaining learners", "brand");
  };

  const gradeDist = useMemo(() => {
    const buckets = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"];
    return buckets.map(b => ({ label: b, value: rows.filter(r => r.ca + r.exam > 0 && gradeOf(r.ca + r.exam).grade === b).length }));
  }, [rows]);

  return (
    <PortalFrame
      person={TEACHER} role="teacher" nav={nav} active={tab}
      onNav={setTab} onExit={onExit} pageTitle={titles[tab][0]} pageNote={titles[tab][1]}
    >
      <div ref={pageRef}>
        {/* ============================== OVERVIEW ============================== */}
        {tab === "overview" && (
          <>
            <div className="row g-3 mb-4">
              <div className="col-6 col-lg-3"><StatTile label="Classes handled" value={TEACHER_CLASSES.length} tone="#7c3aed" icon={<IconUsers size={16} />} foot="Maths & Basic Science" /></div>
              <div className="col-6 col-lg-3"><StatTile label="Learners taught" value={TEACHER_CLASSES.reduce((a, c) => a + c.students, 0)} tone="#2563c9" icon={<IconClipboard size={16} />} foot="Across 4 arms" /></div>
              <div className="col-6 col-lg-3"><StatTile label="Broadsheets pending" value={TEACHER_CLASSES.filter(c => c.status !== "submitted").length} tone="#f59e0b" icon={<IconAlert size={16} />} foot="Due 18 Dec 2025" /></div>
              <div className="col-6 col-lg-3"><StatTile label="Class average" value={stats.avg} decimals={1} suffix="%" tone="#0d9488" icon={<IconTrophy size={16} />} foot={klass.name + klass.arm} /></div>
            </div>

            <div className="row g-4">
              <div className="col-lg-8 d-flex flex-column gap-4">
                <Panel
                  title="Submission status"
                  subtitle={`${SESSION} · Second Term · Mathematics & Basic Science`}
                  icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--violet-100)", color: "var(--violet-600)", placeItems: "center" }}><IconUpload size={17} /></span>}
                  actions={<Btn size="sm" onClick={() => setTab("upload")}>Open uploader <IconChevronRight size={13} /></Btn>}
                >
                  <div className="table-responsive">
                    <table className="table-x">
                      <thead><tr><th>Class arm</th><th>Subject</th><th>Learners</th><th>Entered</th><th>Progress</th><th>Status</th><th></th></tr></thead>
                      <tbody>
                        {TEACHER_CLASSES.map(c => (
                          <tr key={c.id}>
                            <td className="fw-bold text-ink">{c.name} {c.arm}</td>
                            <td className="fs-8">{c.subject}</td>
                            <td className="mono">{c.students}</td>
                            <td className="mono">{c.submitted}/{c.students}</td>
                            <td style={{ minWidth: 120 }}><Progress value={(c.submitted / c.students) * 100} tone={c.status === "submitted" ? "teal" : c.status === "draft" ? "brand" : "rose"} /></td>
                            <td><Badge tone={c.status === "submitted" ? "teal" : c.status === "draft" ? "amber" : "rose"}>{c.status === "submitted" ? "Submitted" : c.status === "draft" ? "Draft" : "Not started"}</Badge></td>
                            <td>
                              <button className="btn btn-soft btn-sm" data-click onClick={() => { setKlass(c); setTab("upload"); }} aria-label="Open">
                                <IconEye size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>

                <Panel title="Grade distribution" subtitle={`${klass.name} ${klass.arm} · ${klass.subject}`} icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--teal-100)", color: "var(--teal-600)", placeItems: "center" }}><IconTrophy size={17} /></span>}>
                  <BarChart data={gradeDist} height={190} colorFrom="#7c3aed" colorTo="#2563c9" format={(n) => String(n)} />
                </Panel>
              </div>

              <div className="col-lg-4 d-flex flex-column gap-4">
                <Panel title="Today's periods" subtitle="Thursday · Second Term" icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--brand-100)", color: "var(--brand-700)", placeItems: "center" }}><IconClock size={17} /></span>}>
                  <div className="d-flex flex-column gap-3">
                    {TEACHER_TIMETABLE.map(p => (
                      <div key={p.period} className="d-flex gap-3 align-items-start">
                        <div className="flex-shrink-0 text-center rounded-3 px-2 py-1" style={{ background: "var(--slate-50)", border: "1px solid var(--slate-200)", minWidth: 76 }}>
                          <div className="mono fw-bold fs-8" style={{ fontSize: ".62rem" }}>{p.period}</div>
                        </div>
                        <div className="lh-sm">
                          <div className="fw-bold fs-8">{p.subject}</div>
                          <div className="fs-8 text-muted-2" style={{ fontSize: ".68rem" }}>{p.klass} · Room {p.room}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel title="Highest scorers" subtitle={`${klass.name} ${klass.arm}`} icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--amber-100)", color: "#a16207", placeItems: "center" }}><IconSparkle size={17} /></span>}>
                  <div className="d-flex flex-column gap-3">
                    {[...rows].sort((a, b) => (b.ca + b.exam) - (a.ca + a.exam)).slice(0, 4).map((r, i) => {
                      const total = r.ca + r.exam;
                      const g = gradeOf(total);
                      return (
                        <div key={r.id} className="d-flex align-items-center gap-3">
                          <span className="display-font fw-800" style={{ width: 18, color: i === 0 ? "#f59e0b" : "var(--slate-300)", fontSize: ".9rem" }}>{i + 1}</span>
                          <Avatar initials={r.name.split(" ").map(n => n[0]).join("")} color="linear-gradient(135deg,#334155,#0f172a)" size={30} />
                          <div className="lh-sm">
                            <div className="fw-bold fs-8">{r.name}</div>
                            <div className="fs-8 text-muted-2" style={{ fontSize: ".66rem" }}>{total}/100 · {g.remark}</div>
                          </div>
                          <span className="ms-auto"><Badge tone={g.tone}>{g.grade}</Badge></span>
                        </div>
                      );
                    })}
                  </div>
                </Panel>

                <Empty icon={<IconShield size={22} />} title="Data policy" note="You can only view and score classes officially assigned to you. Every edit is logged with your staff ID." />
              </div>
            </div>
          </>
        )}

        {/* ============================== UPLOAD ============================== */}
        {tab === "upload" && (
          <>
            {/* class picker */}
            <div className="card-x p-3 mb-4 d-flex flex-wrap gap-2 align-items-center justify-content-between no-print" data-stagger>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <span className="eyebrow text-muted-2 me-1">Class arm</span>
                {TEACHER_CLASSES.map(c => (
                  <button key={c.id} data-click onClick={() => setKlass(c)}
                    className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                    style={{ border: klass.id === c.id ? "1.5px solid var(--violet-600)" : "1px solid var(--slate-200)", background: klass.id === c.id ? "var(--violet-100)" : "#fff" }}>
                    <span className="fw-bold fs-8">{c.name} {c.arm}</span>
                    <Badge tone={c.status === "submitted" ? "teal" : c.status === "draft" ? "amber" : "rose"}>{c.status === "submitted" ? "done" : c.status === "draft" ? "draft" : "new"}</Badge>
                  </button>
                ))}
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="d-inline-flex align-items-center gap-1 text-muted-2"><IconSearch size={14} /></span>
                <input className="form-control form-control-sm" style={{ maxWidth: 190 }} placeholder="Find learner…" value={query} onChange={e => setQuery(e.target.value)} />
              </div>
            </div>

            <div className="row g-4">
              <div className="col-xl-8">
                <Panel
                  title={`Broadsheet · ${klass.name} ${klass.arm}`}
                  subtitle={`${klass.subject} · Second Term · CA is marked over 40, Examination over 60`}
                  icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--violet-100)", color: "var(--violet-600)", placeItems: "center" }}><IconClipboard size={17} /></span>}
                  actions={
                    <>
                      <Btn size="sm" variant="soft" onClick={fillDemo} disabled={locked}><span className="d-inline-flex align-items-center gap-1"><IconPlus size={13} /> Fill sample</span></Btn>
                      <Btn size="sm" variant="soft" onClick={() => toast("Draft saved locally", "brand")} disabled={locked}>Save draft</Btn>
                      <Btn size="sm" variant="teal" onClick={() => setConfirm(true)} disabled={locked || stats.entered !== stats.total}>
                        {locked ? "Submitted" : <>Submit <IconCheck size={13} /></>}
                      </Btn>
                    </>
                  }
                >
                  {locked && (
                    <div className="d-flex align-items-center gap-3 p-3 rounded-4 mb-3" style={{ background: "var(--teal-100)", color: "#0f766e" }}>
                      <IconCheckCircle size={20} />
                      <div className="lh-sm">
                        <div className="fw-800 fs-8">Broadsheet submitted</div>
                        <div className="fs-8" style={{ fontSize: ".7rem" }}>Locked for editing. The Exam Officer has been notified. Request a recall if you spot an error.</div>
                      </div>
                      <Btn size="sm" variant="soft" className="ms-auto" onClick={() => { setLocked(false); toast("Recall requested — editing re-enabled", "brand"); }}>Request recall</Btn>
                    </div>
                  )}

                  <div className="table-responsive">
                    <table className="table-x">
                      <thead>
                        <tr>
                          <th>#</th><th>Learner</th><th>Admission no.</th>
                          <th style={{ minWidth: 108 }}>CA / 40</th>
                          <th style={{ minWidth: 108 }}>Exam / 60</th>
                          <th>Total</th><th>Grade</th><th>Remark</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((r, i) => {
                          const total = r.ca + r.exam;
                          const g = gradeOf(total);
                          return (
                            <tr key={r.id} data-row>
                              <td className="mono text-muted-2">{i + 1}</td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <Avatar initials={r.name.split(" ").map(n => n[0]).join("")} color="linear-gradient(135deg,#334155,#0f172a)" size={26} />
                                  <span className="fw-bold text-ink fs-8">{r.name}</span>
                                </div>
                              </td>
                              <td className="mono fs-8">{r.admissionNo}</td>
                              <td>
                                <input type="number" className="form-control form-control-sm mono" value={r.ca || ""} placeholder="0"
                                  disabled={locked} onChange={e => setScore(r.id, "ca", Number(e.target.value))} style={{ maxWidth: 88 }} />
                              </td>
                              <td>
                                <input type="number" className="form-control form-control-sm mono" value={r.exam || ""} placeholder="0"
                                  disabled={locked} onChange={e => setScore(r.id, "exam", Number(e.target.value))} style={{ maxWidth: 88 }} />
                              </td>
                              <td className="mono fw-bold text-ink">{total || "—"}</td>
                              <td>{total ? <Badge tone={g.tone}>{g.grade}</Badge> : <span className="fs-8 text-muted-2">—</span>}</td>
                              <td className="fs-8">{total ? g.remark : "Pending"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="d-flex flex-wrap gap-3 align-items-center justify-content-between mt-3 pt-3 border-top">
                    <div className="fs-8 text-muted-2">
                      <strong className="text-ink">{stats.entered}</strong> of {stats.total} learners scored · pass rate {stats.total ? Math.round((stats.pass / stats.entered || 0) * 100) : 0}%
                    </div>
                    <div className="d-flex gap-2">
                      <Btn size="sm" variant="soft" onClick={() => toast("Broadsheet exported to Excel", "brand")}><span className="d-inline-flex align-items-center gap-1"><IconDownload size={13} /> Export</span></Btn>
                      <Btn size="sm" variant="teal" onClick={() => setConfirm(true)} disabled={locked || stats.entered !== stats.total}>Submit broadsheet</Btn>
                    </div>
                  </div>
                </Panel>
              </div>

              {/* live analytics rail */}
              <div className="col-xl-4 d-flex flex-column gap-4">
                <div className="card-x p-4 text-center" data-stagger>
                  <div className="eyebrow text-muted-2 mb-3">Live class average</div>
                  <ScoreRing value={Math.round(stats.avg)} size={140} tone={AVG_TONE(stats.avg) === "teal" ? "#0d9488" : AVG_TONE(stats.avg) === "brand" ? "#2563c9" : "#f59e0b"} />
                  <div className="d-flex justify-content-center gap-2 mt-3 flex-wrap">
                    <Badge tone="teal">Pass {stats.pass}</Badge>
                    <Badge tone="rose">Below 50 · {Math.max(0, stats.entered - stats.pass)}</Badge>
                    <Badge tone="slate">Unscored {stats.total - stats.entered}</Badge>
                  </div>
                </div>

                <Panel title="Entry progress" subtitle="Broadsheet completion" icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--amber-100)", color: "#a16207", placeItems: "center" }}><IconAlert size={17} /></span>}>
                  <div className="mb-2 d-flex justify-content-between fs-8"><span className="text-muted-2">Scored learners</span><span className="fw-800">{stats.entered}/{stats.total}</span></div>
                  <Progress value={(stats.entered / stats.total) * 100} tone={stats.entered === stats.total ? "teal" : "brand"} />
                  <div className="fs-8 text-muted-2 mt-2" style={{ fontSize: ".7rem" }}>
                    {stats.entered === stats.total
                      ? "All learners scored — ready to submit for approval."
                      : `${stats.total - stats.entered} learner(s) still pending. You must score everyone before submitting.`}
                  </div>
                </Panel>

                <Panel title="Top & struggling" subtitle="Auto-flagged from current entries" icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--brand-100)", color: "var(--brand-700)", placeItems: "center" }}><IconTrophy size={17} /></span>}>
                  <div className="mb-3">
                    <div className="eyebrow text-teal mb-2" style={{ fontSize: ".52rem" }}>Top performers</div>
                    {[...rows].filter(r => r.ca + r.exam > 0).sort((a, b) => (b.ca + b.exam) - (a.ca + a.exam)).slice(0, 3).map(r => (
                      <div key={r.id} className="d-flex justify-content-between fs-8 py-1 border-bottom">
                        <span className="fw-bold">{r.name}</span><span className="mono fw-800 text-teal">{r.ca + r.exam}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="eyebrow mb-2" style={{ fontSize: ".52rem", color: "var(--rose-500)" }}>Needs intervention</div>
                    {[...rows].filter(r => r.ca + r.exam > 0).sort((a, b) => (a.ca + a.exam) - (b.ca + b.exam)).slice(0, 3).map(r => (
                      <div key={r.id} className="d-flex justify-content-between fs-8 py-1 border-bottom">
                        <span className="fw-bold">{r.name}</span><span className="mono fw-800" style={{ color: "var(--rose-500)" }}>{r.ca + r.exam}</span>
                      </div>
                    ))}
                    {rows.filter(r => r.ca + r.exam === 0).length > 0 && (
                      <div className="fs-8 text-muted-2 mt-2" style={{ fontSize: ".7rem" }}>{rows.filter(r => r.ca + r.exam === 0).length} learners not yet scored.</div>
                    )}
                  </div>
                </Panel>
              </div>
            </div>
          </>
        )}

        {/* ============================== CLASSES ============================== */}
        {tab === "classes" && (
          <div className="row g-4">
            {TEACHER_CLASSES.map(c => {
              const scored = c.roster.filter(r => r.ca + r.exam > 0);
              const avg = scored.length ? Math.round(scored.reduce((a, r) => a + r.ca + r.exam, 0) / scored.length) : 0;
              return (
                <div className="col-md-6" key={c.id} data-stagger>
                  <div className="card-x card-x--hover h-100 p-4">
                    <div className="d-flex align-items-start justify-content-between mb-3">
                      <div>
                        <h3 className="fs-5 fw-800 mb-1">{c.name} {c.arm}</h3>
                        <div className="fs-8 text-muted-2">{c.subject} · Room {c.id.slice(-3)}</div>
                      </div>
                      <Badge tone={c.status === "submitted" ? "teal" : c.status === "draft" ? "amber" : "rose"}>{c.status}</Badge>
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-4"><div className="p-2 rounded-3 text-center" style={{ background: "var(--slate-50)" }}><div className="display-font fw-800" style={{ fontSize: "1.05rem" }}>{c.students}</div><div className="eyebrow text-muted-2" style={{ fontSize: ".48rem" }}>Learners</div></div></div>
                      <div className="col-4"><div className="p-2 rounded-3 text-center" style={{ background: "var(--slate-50)" }}><div className="display-font fw-800" style={{ fontSize: "1.05rem" }}>{avg}%</div><div className="eyebrow text-muted-2" style={{ fontSize: ".48rem" }}>Average</div></div></div>
                      <div className="col-4"><div className="p-2 rounded-3 text-center" style={{ background: "var(--slate-50)" }}><div className="display-font fw-800" style={{ fontSize: "1.05rem" }}>{c.submitted}</div><div className="eyebrow text-muted-2" style={{ fontSize: ".48rem" }}>Entered</div></div></div>
                    </div>
                    <HBars data={c.roster.slice(0, 4).map(r => ({ label: r.name.split(" ")[0], value: r.ca + r.exam }))} />
                    <div className="d-flex gap-2 mt-3">
                      <Btn size="sm" full onClick={() => { setKlass(c); setTab("upload"); }}>Score class</Btn>
                      <Btn size="sm" variant="soft" onClick={() => toast("Roster exported", "brand")}><IconDownload size={13} /></Btn>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============================== TIMETABLE ============================== */}
        {tab === "timetable" && (
          <Panel title="Weekly timetable" subtitle={`${TEACHER.name} · Second Term · 2025/2026`} icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--brand-100)", color: "var(--brand-700)", placeItems: "center" }}><IconCalendar size={17} /></span>}>
            <div className="table-responsive">
              <table className="table-x">
                <thead>
                  <tr><th>Time</th><th>Monday</th><th>Tuesday</th><th>Wednesday</th><th>Thursday</th><th>Friday</th></tr>
                </thead>
                <tbody>
                  {[
                    ["08:00 – 08:45", ["Maths · JSS 3A", "Prep · Staff room", "Maths · SS 1S", "Maths · JSS 3A", "Maths · JSS 3B"]],
                    ["08:45 – 09:30", ["Maths · SS 1S", "Maths · JSS 3B", "Basic Sci · JSS 2A", "Maths · SS 1S", "Maths · JSS 3A"]],
                    ["10:15 – 11:00", ["Basic Sci · JSS 2A", "Maths · JSS 3A", "Maths · JSS 3B", "Basic Sci · JSS 2A", "Club supervision"]],
                    ["11:00 – 11:45", ["Marking", "Maths · SS 1S", "Maths · JSS 3A", "Marking", "Staff meeting"]],
                    ["12:30 – 13:15", ["Maths · JSS 3B", "Basic Sci · JSS 2A", "Maths · SS 1S", "Maths · JSS 3B", "Remedial · Lab 2"]],
                    ["13:15 – 14:00", ["Lesson plan", "Lab prep", "Lesson plan", "Free", "Free"]],
                  ].map(([time, cells]) => (
                    <tr key={time as string}>
                      <td className="mono fs-8 fw-bold text-ink">{time as string}</td>
                      {(cells as string[]).map((cell, i) => (
                        <td key={i}>
                          {cell === "Free" ? <span className="fs-8 text-muted-2">—</span> : (
                            <span className="badge-x badge-x--brand" style={{ whiteSpace: "normal", lineHeight: 1.3 }}>{cell}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="d-flex flex-wrap gap-3 mt-3 fs-8 text-muted-2">
              <span className="d-inline-flex align-items-center gap-1"><IconClock size={13} /> 24 teaching periods weekly</span>
              <span className="d-inline-flex align-items-center gap-1"><IconFile size={13} /> 4 class arms · 92 learners</span>
            </div>
          </Panel>
        )}
      </div>

      {/* confirm submit modal */}
      <Modal open={confirm} onClose={() => setConfirm(false)} title="Submit broadsheet for approval">
        <div className="text-center mb-4">
          <div className="mb-2"><CheckBurst size={64} /></div>
          <h4 className="fs-6 fw-800 mb-1">Submit {klass.name} {klass.arm} · {klass.subject}?</h4>
          <p className="fs-8 text-muted-2 mb-0">Once submitted the broadsheet is locked and routed to the Exam Officer for verification before parents can view it.</p>
        </div>
        <div className="row g-2 mb-4">
          {[["Learners scored", `${stats.entered}/${stats.total}`], ["Class average", `${stats.avg}%`], ["Pass rate", `${Math.round((stats.pass / (stats.entered || 1)) * 100)}%`], ["Subject", klass.subject]].map(([k, v]) => (
            <div className="col-6" key={k}>
              <div className="p-2 rounded-3 d-flex justify-content-between" style={{ background: "var(--slate-50)" }}>
                <span className="fs-8 text-muted-2">{k}</span><span className="fs-8 fw-bold">{v}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="d-flex gap-2">
          <Btn variant="soft" full onClick={() => setConfirm(false)}>Cancel</Btn>
          <Btn variant="teal" full onClick={submit}>Yes, submit</Btn>
        </div>
      </Modal>

      {/* success banner */}
      {submitted && tab === "upload" && (
        <div className="position-fixed no-print" style={{ bottom: 82, right: 22, zIndex: 901 }}>
          <div className="p-3 rounded-4 d-flex align-items-center gap-3" style={{ background: "#0d9488", color: "#fff", boxShadow: "var(--shadow-lg)" }}>
            <IconCheckCircle size={20} />
            <div className="lh-sm">
              <div className="fw-bold fs-8">Broadsheet submitted</div>
              <div style={{ fontSize: ".68rem", opacity: .85 }}>Routed to Exam Officer for approval</div>
            </div>
          </div>
        </div>
      )}

      {toastNode}

      <div className="position-fixed no-print" style={{ bottom: 20, left: 20, zIndex: 900 }}>
        <div className="d-flex align-items-center gap-2 p-2 rounded-4" style={{ background: "rgba(13,20,38,.92)", backdropFilter: "blur(8px)" }}>
          <span className="eyebrow px-2" style={{ color: "#8fa6cd", fontSize: ".5rem" }}>DEMO<br />SWITCH</span>
          {([["parent", "Parent"], ["teacher", "Teacher"], ["admin", "Admin"]] as [Role, string][]).map(([r, l]) => (
            <button key={r} data-click onClick={() => onSwitch(r)} className="btn btn-sm" style={{ background: r === "teacher" ? "linear-gradient(135deg,#7c3aed,#5b21b6)" : "rgba(255,255,255,.1)", color: "#fff", fontSize: ".7rem" }}>{l}</button>
          ))}
        </div>
      </div>
    </PortalFrame>
  );
}
