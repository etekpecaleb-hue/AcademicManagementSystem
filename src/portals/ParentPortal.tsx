import { useEffect, useMemo, useRef, useState } from "react";
import { gsap, usePageEnter } from "../lib/gsap";
import PortalFrame, { type NavItem } from "../components/PortalFrame";
import { Btn, Panel, StatTile, Avatar, Badge, Tabs, Modal, Empty, Progress, useToast } from "../components/ui";
import { ScoreRing, BarChart, Sparkline } from "../components/charts";
import {
  IconWallet, IconClipboard, IconBell, IconReceipt, IconGrid, IconArrowRight, IconCheck, IconCheckCircle,
  IconCard, IconBank, IconMobile, IconPrinter, IconDownload, IconClock, IconAlert, IconTrophy, IconCap,
  IconUsers, IconCalendar, IconShield, IconChevronRight, IconEye, IconFile, CheckBurst,
} from "../components/Icons";
import {
  PARENT, WARDS, INVOICES, PAYMENTS, NEWS, CIRCULARS, EVENTS, getResult, feeStructure,
  money, TERMS, type Ward, type Term, type Invoice, PAYMENT_METHODS, SESSION,
} from "../data/mock";
import type { Role } from "../App";

/* ==================================================================== */
export default function ParentPortal({ onExit, onSwitch }: { onExit: () => void; onSwitch: (r: Role) => void }) {
  const [tab, setTab] = useState("overview");
  const [ward, setWard] = useState<Ward>(WARDS[0]);
  const [term, setTerm] = useState<Term>("Second Term");
  const [receipt, setReceipt] = useState<null | { ref: string; amount: number; ward: string; method: string; date: string }>(null);
  const { toast, toastNode } = useToast();
  const pageRef = usePageEnter(tab);

  const nav: NavItem[] = [
    { id: "overview", label: "Overview", icon: <IconGrid size={17} /> },
    { id: "fees", label: "Pay School Fees", icon: <IconWallet size={17} />, badge: "2" },
    { id: "results", label: "Results", icon: <IconClipboard size={17} /> },
    { id: "news", label: "News & Circulars", icon: <IconBell size={17} /> },
    { id: "statement", label: "Payment Statement", icon: <IconReceipt size={17} /> },
  ];

  const result = useMemo(() => getResult(ward, term), [ward, term]);
  const totalOutstanding = INVOICES.reduce((a, i) => a + (i.total - i.paid), 0);

  const titles: Record<string, [string, string]> = {
    overview: ["Parent Dashboard", "A snapshot of your children's fees, results and school activity."],
    fees: ["Pay School Fees", "Settle invoices securely by card, bank transfer or USSD — instantly receipted."],
    results: ["Termly Results", "View and download report cards as soon as the school publishes them."],
    news: ["News & Circulars", "Official announcements, events and holiday notices from the school."],
    statement: ["Payment Statement", "Every transaction on your account with downloadable receipts."],
  };

  return (
    <PortalFrame
      person={PARENT} role="parent" nav={nav} active={tab}
      onNav={setTab} onExit={onExit} pageTitle={titles[tab][0]} pageNote={titles[tab][1]}
    >
      <div ref={pageRef}>
        {/* ============================ OVERVIEW ============================ */}
        {tab === "overview" && (
          <>
            {/* ward switcher */}
            <div className="row g-3 mb-4">
              {WARDS.map((w) => {
                const inv = INVOICES.filter((i) => i.wardId === w.id);
                const owed = inv.reduce((a, i) => a + (i.total - i.paid), 0);
                const active = ward.id === w.id;
                return (
                  <div className="col-md-6" key={w.id} data-stagger>
                    <button
                      data-click
                      onClick={() => setWard(w)}
                      className="w-100 text-start card-x p-3 h-100 border-0"
                      style={{ border: active ? "2px solid var(--brand-600)" : "1px solid var(--slate-200)", boxShadow: active ? "var(--shadow-brand)" : "var(--shadow-xs)", background: active ? "var(--brand-50)" : "#fff" }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <Avatar initials={w.initials} color={w.color} size={48} ring />
                        <div className="lh-sm">
                          <div className="fw-800 fs-7">{w.name}</div>
                          <div className="fs-8 text-muted-2">{w.className}{w.arm} · {w.admissionNo}</div>
                        </div>
                        <div className="ms-auto text-end">
                          {owed > 0
                            ? <Badge tone={owed > 100000 ? "rose" : "amber"}>{money(owed)} due</Badge>
                            : <Badge tone="teal">Fees cleared</Badge>}
                          <div className="fs-8 text-muted-2 mt-1" style={{ fontSize: ".66rem" }}>Position {w.position}/{w.classSize}</div>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* stats */}
            <div className="row g-3 mb-4">
              <div className="col-6 col-lg-3"><StatTile label="Outstanding fees" value={totalOutstanding} prefix="₦" tone="#e0344b" icon={<IconWallet size={16} />} foot="2 invoices" /></div>
              <div className="col-6 col-lg-3"><StatTile label="Term average" value={result.average} decimals={1} suffix="%" tone="#0d9488" icon={<IconClipboard size={16} />} foot={`${term} · ${ward.className}`} /></div>
              <div className="col-6 col-lg-3"><StatTile label="Attendance" value={ward.attendance} suffix="%" tone="#2563c9" icon={<IconUsers size={16} />} foot="Present this term" /></div>
              <div className="col-6 col-lg-3"><StatTile label="Payments made" value={PAYMENTS.filter(p => p.status === "successful").length} tone="#7c3aed" icon={<IconReceipt size={16} />} foot="This session" /></div>
            </div>

            <div className="row g-4">
              {/* quick actions + fee status */}
              <div className="col-lg-7 d-flex flex-column gap-4">
                <Panel
                  title="Quick actions"
                  subtitle="Most used tools for guardians"
                  icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--brand-100)", color: "var(--brand-700)", placeItems: "center" }}><IconWallet size={17} /></span>}
                >
                  <div className="row g-2">
                    {[
                      { l: "Pay fees now", d: "Card · Transfer · USSD", i: <IconWallet size={19} />, t: "#2563c9", go: () => setTab("fees") },
                      { l: "View results", d: `${term} report card`, i: <IconClipboard size={19} />, t: "#0d9488", go: () => setTab("results") },
                      { l: "Download receipt", d: "Last 5 payments", i: <IconDownload size={19} />, t: "#7c3aed", go: () => setTab("statement") },
                      { l: "School circulars", d: "4 new notices", i: <IconBell size={19} />, t: "#f59e0b", go: () => setTab("news") },
                    ].map((a) => (
                      <div className="col-6" key={a.l}>
                        <button data-click onClick={a.go} className="w-100 text-start p-3 rounded-4 h-100" style={{ border: "1px solid var(--slate-200)", background: "#fff" }}>
                          <span className="d-grid rounded-3 mb-2" style={{ width: 36, height: 36, background: `${a.t}15`, color: a.t, placeItems: "center" }}>{a.i}</span>
                          <div className="fw-800 fs-8">{a.l}</div>
                          <div className="fs-8 text-muted-2" style={{ fontSize: ".68rem" }}>{a.d}</div>
                        </button>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel
                  title={`Fee status · ${term}`}
                  subtitle="Per-child invoice position for the current term"
                  actions={<Btn size="sm" onClick={() => setTab("fees")}>Settle now <IconArrowRight size={13} /></Btn>}
                  icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--amber-100)", color: "#a16207", placeItems: "center" }}><IconAlert size={17} /></span>}
                >
                  <div className="d-flex flex-column gap-3">
                    {WARDS.map((w) => {
                      const inv = INVOICES.find((i) => i.wardId === w.id && i.term === term)!;
                      const pct = Math.round((inv.paid / inv.total) * 100);
                      return (
                        <div key={w.id} className="p-3 rounded-4" style={{ background: "var(--slate-50)", border: "1px solid var(--slate-200)" }}>
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <Avatar initials={w.initials} color={w.color} size={30} />
                            <div className="lh-sm">
                              <div className="fw-bold fs-8">{w.name}</div>
                              <div className="fs-8 text-muted-2" style={{ fontSize: ".66rem" }}>{inv.id} · due {inv.due}</div>
                            </div>
                            <div className="ms-auto text-end">
                              <div className="fw-800 fs-7">{money(inv.total - inv.paid)}</div>
                              <div className="fs-8 text-muted-2" style={{ fontSize: ".66rem" }}>{pct}% settled</div>
                            </div>
                          </div>
                          <Progress value={pct} tone={pct === 100 ? "teal" : pct > 0 ? "brand" : "rose"} />
                        </div>
                      );
                    })}
                  </div>
                </Panel>
              </div>

              {/* side column */}
              <div className="col-lg-5 d-flex flex-column gap-4">
                <Panel title="Subject performance" subtitle={`${ward.name} · ${term}`} icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--teal-100)", color: "var(--teal-600)", placeItems: "center" }}><IconTrophy size={17} /></span>}>
                  <div className="d-flex align-items-center gap-3 flex-wrap">
                    <ScoreRing value={Math.round(result.average)} tone={result.average >= 70 ? "#0d9488" : "#2563c9"} />
                    <div className="flex-grow-1" style={{ minWidth: 190 }}>
                      <BarChart data={result.rows.slice(0, 5).map(r => ({ label: r.subject.split(" ")[0], value: r.total }))} height={150} />
                    </div>
                  </div>
                  <Btn variant="soft" size="sm" full className="mt-3" onClick={() => setTab("results")}>Open full report card <IconChevronRight size={13} /></Btn>
                </Panel>

                <Panel title="Upcoming events" subtitle="Second Term diary" icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--brand-100)", color: "var(--brand-700)", placeItems: "center" }}><IconCalendar size={17} /></span>}>
                  <div className="d-flex flex-column gap-3">
                    {EVENTS.map((e) => (
                      <div key={e.title} className="d-flex align-items-center gap-3">
                        <div className="text-center rounded-3 flex-shrink-0" style={{ width: 46, padding: "4px 0", background: "var(--slate-50)", border: "1px solid var(--slate-200)" }}>
                          <div className="display-font fw-800 text-brand" style={{ fontSize: ".95rem", lineHeight: 1.1 }}>{e.day}</div>
                          <div className="eyebrow text-muted-2" style={{ fontSize: ".48rem" }}>{e.month}</div>
                        </div>
                        <div className="lh-sm">
                          <div className="fw-bold fs-8">{e.title}</div>
                          <div className="fs-8 text-muted-2" style={{ fontSize: ".68rem" }}>{e.meta}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel title="Latest circular" subtitle={`${CIRCULARS[0].date} · ${CIRCULARS[0].audience}`} icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--violet-100)", color: "var(--violet-600)", placeItems: "center" }}><IconBell size={17} /></span>}>
                  <p className="fs-8 text-muted-2 mb-3">{CIRCULARS[0].title}</p>
                  <div className="d-flex align-items-center gap-2 fs-8 text-muted-2">
                    <IconClock size={13} /> Second Term resumption: <strong className="text-ink">9 January 2026</strong>
                  </div>
                </Panel>
              </div>
            </div>
          </>
        )}

        {/* ============================ PAY FEES ============================ */}
        {tab === "fees" && <FeeWizard ward={ward} setWard={setWard} onPaid={(r) => { setReceipt(r); toast("Payment successful — receipt generated"); }} />}

        {/* ============================ RESULTS ============================ */}
        {tab === "results" && (
          <div className="d-flex flex-column gap-4">
            {/* selectors */}
            <div className="card-x p-3 d-flex flex-wrap gap-3 align-items-center justify-content-between no-print" data-stagger>
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <span className="eyebrow text-muted-2 me-1">Ward</span>
                {WARDS.map((w) => (
                  <button key={w.id} data-click onClick={() => setWard(w)}
                    className="d-flex align-items-center gap-2 px-2 py-1 rounded-3"
                    style={{ border: ward.id === w.id ? "1.5px solid var(--brand-600)" : "1px solid var(--slate-200)", background: ward.id === w.id ? "var(--brand-50)" : "#fff" }}>
                    <Avatar initials={w.initials} color={w.color} size={26} />
                    <span className="fw-bold fs-8">{w.name.split(" ")[0]} · {w.className}{w.arm}</span>
                  </button>
                ))}
              </div>
              <Tabs items={TERMS.map(t => ({ id: t, label: t }))} active={term} onChange={setTerm} />
            </div>

            {/* report card */}
            <div className="report-card" data-stagger>
              <div className="p-4 d-flex flex-wrap align-items-center justify-content-between gap-3" style={{ background: "linear-gradient(120deg,#0d1426,#1b2a4d 60%,#0b3b3a)" }}>
                <div className="d-flex align-items-center gap-3">
                  <Avatar initials={ward.initials} color={ward.color} size={54} ring />
                  <div className="lh-sm">
                    <div className="display-font fw-800 text-white" style={{ fontSize: "1.1rem" }}>{ward.name}</div>
                    <div className="fs-8" style={{ color: "#9fb6d8" }}>{ward.admissionNo} · {ward.className}{ward.arm} · {SESSION} · {term}</div>
                    <div className="mt-1 d-flex gap-2 flex-wrap">
                      <span className="badge-x" style={{ background: "rgba(255,255,255,.12)", color: "#cbd5f5" }}>Position {result.position}</span>
                      <span className="badge-x" style={{ background: "rgba(255,255,255,.12)", color: "#cbd5f5" }}>Attendance {ward.attendance}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <ScoreRing value={Math.round(result.average)} size={104} tone={result.average >= 70 ? "#5eead4" : "#6ba3f0"} />
                </div>
              </div>

              <div className="table-responsive">
                <table className="table-x">
                  <thead>
                    <tr>
                      <th>Subject</th><th>CA (40)</th><th>Exam (60)</th><th>Total</th>
                      <th>Class Avg</th><th>Grade</th><th>Remark</th><th>Subject Teacher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((r) => (
                      <tr key={r.subject}>
                        <td className="fw-bold text-ink">{r.subject}</td>
                        <td className="mono">{r.ca}</td>
                        <td className="mono">{r.exam}</td>
                        <td className="fw-bold mono text-ink">{r.total}</td>
                        <td>
                          <span className="d-inline-flex align-items-center gap-2">
                            <span className="mono fs-8">{r.classAvg}%</span>
                            <Sparkline values={[r.classAvg - 6, r.classAvg - 2, r.classAvg, r.classAvg + 1, r.total]} w={54} h={16} stroke={r.total >= r.classAvg ? "#14b8a6" : "#f59e0b"} />
                          </span>
                        </td>
                        <td><Badge tone={r.tone}>{r.grade}</Badge></td>
                        <td className="fs-8">{r.remark}</td>
                        <td className="fs-8 text-muted-2">{r.teacher}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: "var(--slate-50)" }}>
                      <td className="fw-800 text-ink">Grand Total</td>
                      <td colSpan={2} className="mono fw-bold">{result.rows.reduce((a, r) => a + r.ca + r.exam, 0)}</td>
                      <td className="fw-800 mono text-ink">{result.total}/{result.obtainable}</td>
                      <td colSpan={4} className="fw-800">Average: {result.average}%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="p-4 row g-3" style={{ borderTop: "1px solid var(--slate-200)" }}>
                <div className="col-md-6">
                  <div className="p-3 rounded-4 h-100" style={{ background: "var(--slate-50)" }}>
                    <div className="eyebrow text-muted-2 mb-2">Form master's remark</div>
                    <p className="fs-8 mb-0">{result.formMasterRemark}</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="p-3 rounded-4 h-100" style={{ background: "var(--slate-50)" }}>
                    <div className="eyebrow text-muted-2 mb-2">Principal's remark</div>
                    <p className="fs-8 mb-0">{result.principalRemark}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 d-flex flex-wrap gap-2 align-items-center justify-content-between no-print" style={{ borderTop: "1px solid var(--slate-200)", background: "var(--slate-50)" }}>
                <div className="d-flex align-items-center gap-2 fs-8 text-muted-2">
                  <IconShield size={14} /> Digitally verified · {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
                <div className="d-flex gap-2">
                  <Btn size="sm" variant="soft" onClick={() => window.print()}><span className="d-inline-flex align-items-center gap-2"><IconPrinter size={14} /> Print report card</span></Btn>
                  <Btn size="sm" onClick={() => toast("Report card exported as PDF", "brand")}><span className="d-inline-flex align-items-center gap-2"><IconDownload size={14} /> Download PDF</span></Btn>
                </div>
              </div>
            </div>

            {/* subject breakdown chart */}
            <div className="row g-4">
              <div className="col-lg-7">
                <Panel title="Subject vs class average" subtitle={`${term} · ${ward.className}${ward.arm}`} icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--brand-100)", color: "var(--brand-700)", placeItems: "center" }}><IconCap size={17} /></span>}>
                  <BarChart data={result.rows.map(r => ({ label: r.subject.split(" ")[0].slice(0, 7), value: r.total }))} height={210} format={(n) => String(n)} />
                </Panel>
              </div>
              <div className="col-lg-5">
                <Panel title="Term-on-term progress" subtitle="Average across all subjects" icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--teal-100)", color: "var(--teal-600)", placeItems: "center" }}><IconTrophy size={17} /></span>}>
                  <BarChart
                    data={TERMS.map(t => ({ label: t.replace(" Term", "").slice(0, 5), value: Math.round(getResult(ward, t).average) }))}
                    height={210} colorFrom="#14b8a6" colorTo="#2563c9" format={(n) => `${n}%`}
                  />
                </Panel>
              </div>
            </div>
          </div>
        )}

        {/* ============================ NEWS ============================ */}
        {tab === "news" && (
          <div className="row g-4">
            <div className="col-lg-8 d-flex flex-column gap-4">
              <div className="row g-3">
                {NEWS.map((n) => (
                  <div className="col-md-6" key={n.id} data-stagger>
                    <article className="card-x card-x--hover h-100 overflow-hidden">
                      <div className="news-thumb"><img src={n.image} alt={n.title} loading="lazy" /></div>
                      <div className="p-3">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <Badge tone={n.category === "Academic" ? "teal" : n.category === "Circular" ? "amber" : n.category === "Sports" ? "brand" : "violet"}>{n.category}</Badge>
                          <span className="fs-8 text-muted-2 d-inline-flex align-items-center gap-1"><IconClock size={11} /> {n.date}</span>
                        </div>
                        <h3 className="fs-7 fw-800" style={{ lineHeight: 1.35 }}>{n.title}</h3>
                        <p className="fs-8 text-muted-2 mb-3">{n.excerpt}</p>
                        <Btn size="sm" variant="soft" onClick={() => toast("Opening circular…", "brand")}>Read more <IconChevronRight size={12} /></Btn>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-lg-4 d-flex flex-column gap-4">
              <Panel title="Official circulars" subtitle="Signed & dated by the head office" icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--violet-100)", color: "var(--violet-600)", placeItems: "center" }}><IconFile size={17} /></span>}>
                <div className="d-flex flex-column gap-2">
                  {CIRCULARS.map((c) => (
                    <div key={c.id} className="p-3 rounded-4 d-flex gap-3 align-items-start" style={{ background: "var(--slate-50)" }}>
                      <span className="badge-x badge-x--slate mt-1">{c.date.split(" ")[0]} {c.date.split(" ")[1]}</span>
                      <div className="lh-sm">
                        <div className="fw-bold fs-8">{c.title}</div>
                        <div className="fs-8 text-muted-2" style={{ fontSize: ".68rem" }}>For: {c.audience}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel title="Term calendar" subtitle="Second Term · 14 weeks" icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--brand-100)", color: "var(--brand-700)", placeItems: "center" }}><IconCalendar size={17} /></span>}>
                <div className="d-flex flex-column gap-3">
                  {EVENTS.map((e) => (
                    <div key={e.title} className="d-flex gap-3 align-items-center">
                      <div className="text-center rounded-3 flex-shrink-0" style={{ width: 44, padding: "3px 0", border: "1px solid var(--slate-200)" }}>
                        <div className="display-font fw-800 text-brand" style={{ fontSize: ".9rem", lineHeight: 1.1 }}>{e.day}</div>
                        <div className="eyebrow text-muted-2" style={{ fontSize: ".46rem" }}>{e.month}</div>
                      </div>
                      <div className="lh-sm"><div className="fw-bold fs-8">{e.title}</div><div className="fs-8 text-muted-2" style={{ fontSize: ".68rem" }}>{e.meta}</div></div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </div>
        )}

        {/* ============================ STATEMENT ============================ */}
        {tab === "statement" && (
          <div className="row g-4">
            <div className="col-lg-8">
              <Panel
                title="Transaction history"
                subtitle="All fee payments across your household"
                icon={<span className="d-grid rounded-3" style={{ width: 34, height: 34, background: "var(--brand-100)", color: "var(--brand-700)", placeItems: "center" }}><IconReceipt size={17} /></span>}
                actions={<Btn size="sm" variant="soft" onClick={() => toast("Statement exported (CSV)", "brand")}><span className="d-inline-flex align-items-center gap-2"><IconDownload size={13} /> Export</span></Btn>}
              >
                <div className="table-responsive">
                  <table className="table-x">
                    <thead><tr><th>Reference</th><th>Date</th><th>Ward</th><th>Term</th><th>Channel</th><th>Amount</th><th>Status</th><th></th></tr></thead>
                    <tbody>
                      {PAYMENTS.map((p) => (
                        <tr key={p.id}>
                          <td className="mono fs-8 fw-bold">{p.reference}</td>
                          <td className="fs-8">{p.date}</td>
                          <td className="fs-8 fw-bold text-ink">{p.ward}</td>
                          <td className="fs-8">{p.term}</td>
                          <td className="fs-8">{p.method}</td>
                          <td className="fw-800 mono text-ink">{money(p.amount)}</td>
                          <td><Badge tone={p.status === "successful" ? "teal" : p.status === "pending" ? "amber" : "rose"}>{p.status}</Badge></td>
                          <td>
                            <button className="btn btn-soft btn-sm" data-click onClick={() => setReceipt({ ref: p.reference, amount: p.amount, ward: p.ward, method: p.method, date: p.date })} aria-label="View receipt">
                              <IconEye size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </div>
            <div className="col-lg-4 d-flex flex-column gap-4">
              <StatTile label="Total paid this session" value={PAYMENTS.filter(p => p.status === "successful").reduce((a, p) => a + p.amount, 0)} prefix="₦" tone="#0d9488" icon={<IconWallet size={16} />} foot="5 transactions" />
              <StatTile label="Total outstanding" value={totalOutstanding} prefix="₦" tone="#e0344b" icon={<IconAlert size={16} />} foot="Across 2 learners" />
              <Panel title="Household summary" subtitle="Session 2025/2026">
                {WARDS.map((w) => {
                  const inv = INVOICES.filter(i => i.wardId === w.id);
                  const paid = inv.reduce((a, i) => a + i.paid, 0);
                  const tot = inv.reduce((a, i) => a + i.total, 0);
                  return (
                    <div key={w.id} className="mb-3">
                      <div className="d-flex justify-content-between fs-8 mb-1">
                        <span className="fw-bold">{w.name.split(" ")[0]} · {w.className}</span>
                        <span className="fw-800">{money(paid)} / {money(tot)}</span>
                      </div>
                      <Progress value={(paid / tot) * 100} tone={paid === tot ? "teal" : "brand"} />
                    </div>
                  );
                })}
              </Panel>
            </div>
          </div>
        )}
      </div>

      {/* receipt modal */}
      <Modal open={!!receipt} onClose={() => setReceipt(null)} title="Payment receipt">
        {receipt && (
          <div>
            <div className="text-center mb-4"><CheckBurst size={68} /></div>
            <div className="text-center mb-4">
              <div className="display-font fw-800" style={{ fontSize: "1.6rem" }}>{money(receipt.amount)}</div>
              <div className="fs-8 text-muted-2">Payment successful · {receipt.date}</div>
            </div>
            <dl className="row g-2 mb-4 fs-8">
              {[["Receipt no.", receipt.ref], ["Ward", receipt.ward], ["Channel", receipt.method], ["Status", "Successful"], ["School", "Scholaris Int'l Academy"]].map(([k, v]) => (
                <div className="col-6 d-flex justify-content-between border-bottom pb-2" key={k}>
                  <dt className="text-muted-2 fw-normal">{k}</dt><dd className="mb-0 fw-bold text-end">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="d-flex gap-2">
              <Btn full variant="soft" onClick={() => window.print()}><span className="d-inline-flex align-items-center gap-2"><IconPrinter size={14} /> Print</span></Btn>
              <Btn full onClick={() => toast("Receipt downloaded", "brand")}><span className="d-inline-flex align-items-center gap-2"><IconDownload size={14} /> Download</span></Btn>
            </div>
          </div>
        )}
      </Modal>

      {toastNode}

      {/* role switcher for demo */}
      <div className="position-fixed no-print" style={{ bottom: 20, left: 20, zIndex: 900 }}>
        <div className="d-flex align-items-center gap-2 p-2 rounded-4" style={{ background: "rgba(13,20,38,.92)", backdropFilter: "blur(8px)" }}>
          <span className="eyebrow px-2" style={{ color: "#8fa6cd", fontSize: ".5rem" }}>DEMO<br />SWITCH</span>
          {([["parent", "Parent"], ["teacher", "Teacher"], ["admin", "Admin"]] as [Role, string][]).map(([r, l]) => (
            <button key={r} data-click onClick={() => onSwitch(r)} className="btn btn-sm" style={{ background: r === "parent" ? "linear-gradient(135deg,#2563c9,#1b4fa8)" : "rgba(255,255,255,.1)", color: "#fff", fontSize: ".7rem" }}>{l}</button>
          ))}
        </div>
      </div>
    </PortalFrame>
  );
}

/* ==================================================================== */
/*                          FEE PAYMENT WIZARD                          */
/* ==================================================================== */
function FeeWizard({
  ward, setWard, onPaid,
}: { ward: Ward; setWard: (w: Ward) => void; onPaid: (r: { ref: string; amount: number; ward: string; method: string; date: string }) => void }) {
  const [step, setStep] = useState(1);
  const [invoice, setInvoice] = useState<Invoice>(INVOICES.find(i => i.wardId === ward.id && i.status !== "paid") ?? INVOICES[0]);
  const [method, setMethod] = useState<string>("card");
  const [amount, setAmount] = useState<number>(invoice.total - invoice.paid);
  const [processing, setProcessing] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const struct = feeStructure(ward);

  useEffect(() => { setAmount(invoice.total - invoice.paid); }, [invoice]);

  useEffect(() => {
    if (!stepRef.current) return;
    gsap.fromTo(stepRef.current.children, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power3.out" });
  }, [step]);

  const pay = () => {
    setProcessing(true);
    window.setTimeout(() => {
      setProcessing(false);
      setStep(5);
      onPaid({
        ref: `RCPT/2026/${Math.floor(10000 + Math.random() * 89999)}`,
        amount,
        ward: ward.name,
        method: PAYMENT_METHODS.find(m => m.id === method)?.label ?? "Card",
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      });
    }, 1900);
  };

  const steps = ["Select invoice", "Amount", "Channel", "Authorise", "Receipt"];
  const selected = PAYMENT_METHODS.find(m => m.id === method)!;

  return (
    <div className="row g-4">
      {/* -------- stepper + form -------- */}
      <div className="col-lg-8">
        <div className="card-x p-4 mb-4" data-stagger>
          {/* stepper */}
          <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
            {steps.map((s, i) => {
              const n = i + 1;
              const done = step > n;
              const now = step === n;
              return (
                <div key={s} className="d-flex align-items-center gap-2 me-3 mb-2">
                  <span className="step-num" style={{
                    background: done ? "var(--teal-500)" : now ? "linear-gradient(135deg,var(--brand-600),var(--brand-700))" : "var(--slate-100)",
                    color: done || now ? "#fff" : "var(--slate-500)",
                    boxShadow: now ? "var(--shadow-brand)" : "none",
                  }}>
                    {done ? <IconCheck size={16} /> : n}
                  </span>
                  <span className="fw-bold fs-8 d-none d-sm-inline" style={{ color: now ? "var(--ink-900)" : "var(--slate-500)" }}>{s}</span>
                  {n < steps.length && <span style={{ width: 26, height: 2, background: step > n ? "var(--teal-500)" : "var(--slate-200)", borderRadius: 2 }} />}
                </div>
              );
            })}
          </div>

          <div ref={stepRef}>
            {/* STEP 1 — ward & invoice */}
            {step === 1 && (
              <>
                <h3 className="fs-6 fw-800 mb-3">Which learner are you paying for?</h3>
                <div className="row g-3 mb-4">
                  {WARDS.map(w => {
                    const inv = INVOICES.filter(i => i.wardId === w.id);
                    const owed = inv.reduce((a, i) => a + (i.total - i.paid), 0);
                    const on = w.id === ward.id;
                    return (
                      <div className="col-md-6" key={w.id}>
                        <button data-click onClick={() => { setWard(w); setInvoice(INVOICES.find(i => i.wardId === w.id && i.status !== "paid") ?? INVOICES[0]); }}
                          className="w-100 text-start p-3 rounded-4 h-100"
                          style={{ border: on ? "2px solid var(--brand-600)" : "1px solid var(--slate-200)", background: on ? "var(--brand-50)" : "#fff" }}>
                          <div className="d-flex align-items-center gap-3 mb-2">
                            <Avatar initials={w.initials} color={w.color} size={40} />
                            <div className="lh-sm">
                              <div className="fw-800 fs-7">{w.name}</div>
                              <div className="fs-8 text-muted-2" style={{ fontSize: ".68rem" }}>{w.className}{w.arm} · {w.admissionNo}</div>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between fs-8">
                            <span className="text-muted-2">Outstanding</span>
                            <span className="fw-800" style={{ color: owed > 0 ? "var(--rose-500)" : "var(--teal-600)" }}>{owed > 0 ? money(owed) : "Cleared"}</span>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <h3 className="fs-6 fw-800 mb-3">Select an invoice</h3>
                <div className="d-flex flex-column gap-2">
                  {INVOICES.filter(i => i.wardId === ward.id).map(i => {
                    const on = i.id === invoice.id;
                    return (
                      <button key={i.id} data-click onClick={() => setInvoice(i)}
                        className="w-100 text-start p-3 rounded-4 d-flex align-items-center gap-3"
                        style={{ border: on ? "2px solid var(--brand-600)" : "1px solid var(--slate-200)", background: on ? "var(--brand-50)" : "#fff" }}>
                        <span className="d-grid rounded-3 flex-shrink-0" style={{ width: 36, height: 36, placeItems: "center", background: on ? "var(--brand-600)" : "var(--slate-100)", color: on ? "#fff" : "var(--slate-600)" }}>
                          <IconReceipt size={17} />
                        </span>
                        <div className="lh-sm">
                          <div className="fw-bold fs-8">{i.id} · {i.term}</div>
                          <div className="fs-8 text-muted-2" style={{ fontSize: ".68rem" }}>Due {i.due} · {money(i.total)}</div>
                        </div>
                        <div className="ms-auto text-end">
                          <Badge tone={i.status === "paid" ? "teal" : i.status === "partial" ? "amber" : "rose"}>{i.status}</Badge>
                          <div className="fw-800 fs-8 mt-1" style={{ color: "var(--rose-500)" }}>{money(i.total - i.paid)}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="d-flex justify-content-end mt-4">
                  <Btn onClick={() => setStep(2)} disabled={invoice.status === "paid"}>Continue <IconArrowRight size={14} /></Btn>
                </div>
              </>
            )}

            {/* STEP 2 — amount + breakdown */}
            {step === 2 && (
              <>
                <h3 className="fs-6 fw-800 mb-3">Confirm the fee breakdown</h3>
                <div className="table-responsive mb-3">
                  <table className="table-x">
                    <thead><tr><th>Item</th><th>Note</th><th className="text-end">Amount</th></tr></thead>
                    <tbody>
                      {struct.lines.map(l => (
                        <tr key={l.label}><td className="fw-bold text-ink">{l.label}</td><td className="fs-8 text-muted-2">{l.note ?? "—"}</td><td className="text-end mono fw-bold">{money(l.amount)}</td></tr>
                      ))}
                    </tbody>
                    <tfoot><tr><td colSpan={2} className="fw-800">Invoice total · {invoice.id}</td><td className="text-end fw-800 mono text-ink">{money(invoice.total)}</td></tr></tfoot>
                  </table>
                </div>

                <div className="p-3 rounded-4 mb-3" style={{ background: "var(--slate-50)", border: "1px solid var(--slate-200)" }}>
                  <div className="d-flex justify-content-between fs-8 mb-2"><span className="text-muted-2">Already paid</span><span className="fw-800 text-teal">– {money(invoice.paid)}</span></div>
                  <label className="form-label">Amount to pay now (₦)</label>
                  <input type="number" className="form-control mono" value={amount} max={invoice.total - invoice.paid} min={1000}
                    onChange={e => setAmount(Math.min(invoice.total - invoice.paid, Math.max(0, Number(e.target.value))))} />
                  <div className="d-flex gap-2 mt-2 flex-wrap">
                    {[0.5, 0.75, 1].map(f => (
                      <button key={f} data-click className="btn btn-soft btn-sm" onClick={() => setAmount(Math.round((invoice.total - invoice.paid) * f))}>
                        {f === 1 ? "Pay in full" : `${f * 100}%`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="d-flex justify-content-between">
                  <Btn variant="soft" onClick={() => setStep(1)}>Back</Btn>
                  <Btn onClick={() => setStep(3)} disabled={amount < 1000}>Choose channel <IconArrowRight size={14} /></Btn>
                </div>
              </>
            )}

            {/* STEP 3 — channel */}
            {step === 3 && (
              <>
                <h3 className="fs-6 fw-800 mb-1">How would you like to pay?</h3>
                <p className="fs-8 text-muted-2 mb-3">All channels are secured by a PCI-DSS Level 1 processor. No card data is stored on the school server.</p>
                <div className="d-flex flex-column gap-2 mb-4">
                  {PAYMENT_METHODS.map(m => {
                    const on = m.id === method;
                    const icon = m.icon === "card" ? <IconCard size={20} /> : m.icon === "bank" ? <IconBank size={20} /> : <IconMobile size={20} />;
                    return (
                      <button key={m.id} data-click onClick={() => setMethod(m.id)}
                        className="w-100 text-start p-3 rounded-4 d-flex align-items-center gap-3"
                        style={{ border: on ? "2px solid var(--brand-600)" : "1px solid var(--slate-200)", background: on ? "var(--brand-50)" : "#fff" }}>
                        <span className="d-grid rounded-3 flex-shrink-0" style={{ width: 42, height: 42, placeItems: "center", background: on ? "var(--brand-600)" : "var(--slate-100)", color: on ? "#fff" : "var(--slate-700)" }}>{icon}</span>
                        <div className="lh-sm">
                          <div className="fw-800 fs-7">{m.label}</div>
                          <div className="fs-8 text-muted-2" style={{ fontSize: ".68rem" }}>{m.desc}</div>
                        </div>
                        <span className="ms-auto badge-x badge-x--slate">{m.badge}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="d-flex justify-content-between">
                  <Btn variant="soft" onClick={() => setStep(2)}>Back</Btn>
                  <Btn onClick={() => setStep(4)}>Authorise payment <IconArrowRight size={14} /></Btn>
                </div>
              </>
            )}

            {/* STEP 4 — authorise */}
            {step === 4 && (
              <>
                <h3 className="fs-6 fw-800 mb-1">Authorise {money(amount)}</h3>
                <p className="fs-8 text-muted-2 mb-3">Paying {money(amount)} for <strong>{ward.name}</strong> · {invoice.term} via {selected.label}.</p>

                {method === "card" && (
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Card number</label>
                      <input className="form-control mono" placeholder="4291 8871 0042 5518" defaultValue="4291 8871 0042 5518" />
                    </div>
                    <div className="col-6"><label className="form-label">Expiry</label><input className="form-control mono" placeholder="09 / 28" defaultValue="09 / 28" /></div>
                    <div className="col-6"><label className="form-label">CVV</label><input className="form-control mono" placeholder="•••" defaultValue="341" type="password" /></div>
                    <div className="col-12"><label className="form-label">Cardholder name</label><input className="form-control" defaultValue={PARENT.name} /></div>
                  </div>
                )}
                {method === "transfer" && (
                  <div className="p-3 rounded-4" style={{ background: "var(--slate-50)" }}>
                    <div className="eyebrow text-muted-2 mb-2">Transfer to this virtual account</div>
                    <div className="display-font fw-800 mono mb-1" style={{ fontSize: "1.3rem" }}>1014 785 220</div>
                    <div className="fs-8 text-muted-2">Scholaris Int'l Academy · Zenith Bank · Reference: {invoice.id}</div>
                    <div className="d-flex gap-2 mt-3">
                      <Btn size="sm" variant="soft" onClick={() => toast("Account details copied")}>Copy details</Btn>
                      <Btn size="sm" variant="soft" onClick={() => toast("I have sent the transfer — awaiting confirmation", "brand")}>I've paid</Btn>
                    </div>
                  </div>
                )}
                {method === "ussd" && (
                  <div className="p-3 rounded-4" style={{ background: "var(--slate-50)" }}>
                    <label className="form-label">Select your bank</label>
                    <select className="form-select mb-3" defaultValue="gtb">
                      <option value="gtb">Guaranty Trust Bank</option>
                      <option value="zen">Zenith Bank</option>
                      <option value="uba">United Bank for Africa</option>
                      <option value="acc">Access Bank</option>
                    </select>
                    <div className="eyebrow text-muted-2 mb-1">Dial this code</div>
                    <div className="display-font fw-800 mono" style={{ fontSize: "1.3rem" }}>*737*000*{amount.toString().slice(0, 5)}#</div>
                  </div>
                )}

                <div className="d-flex align-items-center gap-2 fs-8 text-muted-2 mt-4 p-3 rounded-4" style={{ background: "var(--teal-100)", color: "#0f766e" }}>
                  <IconShield size={16} /> 3-D Secure · encrypted end-to-end · receipt issued instantly
                </div>

                <div className="d-flex justify-content-between mt-4">
                  <Btn variant="soft" onClick={() => setStep(3)}>Back</Btn>
                  <Btn onClick={pay} disabled={processing}>
                    {processing
                      ? <span className="d-inline-flex align-items-center gap-2"><span className="spinner-border spinner-border-sm" /> Processing…</span>
                      : <span className="d-inline-flex align-items-center gap-2">Pay {money(amount)} <IconCheckCircle size={15} /></span>}
                  </Btn>
                </div>
              </>
            )}

            {/* STEP 5 — success */}
            {step === 5 && (
              <div className="text-center py-3">
                <div className="mb-3"><CheckBurst size={92} /></div>
                <h3 className="display-font fw-800 mb-1" style={{ fontSize: "1.5rem" }}>Payment successful</h3>
                <p className="text-muted-2 fs-8 mb-4">{money(amount)} received for {ward.name} · {invoice.term}.<br />A receipt has been sent to {PARENT.email}.</p>
                <div className="row g-2 text-start mb-4">
                  {[
                    ["Amount", money(amount)], ["Channel", selected.label], ["Ward", ward.name],
                    ["Balance remaining", money(invoice.total - invoice.paid - amount)], ["Invoice", invoice.id],
                  ].map(([k, v]) => (
                    <div className="col-sm-6" key={k}>
                      <div className="p-2 rounded-3 d-flex justify-content-between" style={{ background: "var(--slate-50)" }}>
                        <span className="fs-8 text-muted-2">{k}</span><span className="fs-8 fw-bold">{v}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="d-flex gap-2 justify-content-center">
                  <Btn variant="soft" onClick={() => { setStep(1); setInvoice(INVOICES.find(i => i.wardId === ward.id && i.status !== "paid") ?? INVOICES[0]); }}>Pay another invoice</Btn>
                  <Btn onClick={() => toast("Receipt downloaded", "brand")}><span className="d-inline-flex align-items-center gap-2"><IconDownload size={14} /> Download receipt</span></Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* -------- summary rail -------- */}
      <div className="col-lg-4 d-flex flex-column gap-4">
        <div className="card-x p-4" data-stagger>
          <div className="eyebrow text-muted-2 mb-3">Payment summary</div>
          <div className="d-flex align-items-center gap-3 mb-3">
            <Avatar initials={ward.initials} color={ward.color} size={44} />
            <div className="lh-sm">
              <div className="fw-800 fs-7">{ward.name}</div>
              <div className="fs-8 text-muted-2" style={{ fontSize: ".68rem" }}>{ward.className}{ward.arm} · {ward.admissionNo}</div>
            </div>
          </div>
          <ul className="list-unstyled d-flex flex-column gap-2 fs-8 mb-0">
            <li className="d-flex justify-content-between"><span className="text-muted-2">Invoice</span><span className="mono fw-bold">{invoice.id}</span></li>
            <li className="d-flex justify-content-between"><span className="text-muted-2">Term</span><span className="fw-bold">{invoice.term}</span></li>
                            <li className="d-flex justify-content-between"><span className="text-muted-2">Invoice total</span><span className="mono fw-bold">{money(invoice.total)}</span></li>
            <li className="d-flex justify-content-between"><span className="text-muted-2">Paid</span><span className="mono fw-bold text-teal">– {money(invoice.paid)}</span></li>
            <li className="d-flex justify-content-between border-top pt-2"><span className="fw-800">Paying now</span><span className="mono fw-800 text-brand">{money(amount)}</span></li>
            <li className="d-flex justify-content-between"><span className="text-muted-2">Balance after</span><span className="mono fw-bold">{money(Math.max(0, invoice.total - invoice.paid - amount))}</span></li>
          </ul>
        </div>

        <div className="card-x p-4" data-stagger>
          <div className="d-flex align-items-center gap-2 mb-3"><IconShield size={16} /> <span className="fw-800 fs-8">Secure checkout</span></div>
          <ul className="list-unstyled d-flex flex-column gap-2 fs-8 text-muted-2 mb-0">
            {["256-bit TLS encryption on every request", "PCI-DSS Level 1 payment processor", "Instant receipt with verifiable reference", "Part-payments tracked automatically", "Full refund & dispute trail"].map(t => (
              <li key={t} className="d-flex gap-2"><span className="text-teal mt-1"><IconCheck size={12} /></span> {t}</li>
            ))}
          </ul>
        </div>

        <Empty icon={<IconBell size={22} />} title="Need help?" note="Call the bursary on +234 803 555 0142 (8am – 4pm) or email bursary@scholaris.edu.ng" />
      </div>
    </div>
  );
}
