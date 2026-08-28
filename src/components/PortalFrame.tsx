import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, useRipple } from "../lib/gsap";
import { LogoMark, IconMenu, IconBell, IconSearch, IconLogout, IconChevronRight, IconCap } from "./Icons";
import { SCHOOL } from "../data/mock";
import { Avatar, Badge } from "./ui";
import type { Person } from "../data/mock";
import type { Role } from "../App";

export type NavItem = { id: string; label: string; icon: ReactNode; badge?: string };

export default function PortalFrame({
  person, role, nav, active, onNav, onExit, pageTitle, pageNote, children,
}: {
  person: Person; role: Role; nav: NavItem[]; active: string; onNav: (id: string) => void;
  onExit: () => void; pageTitle: string; pageNote: string; children: ReactNode;
}) {
  useRipple();
  const [open, setOpen] = useState(false);
  const [notif, setNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notif) return;
    gsap.fromTo(notifRef.current, { opacity: 0, y: -10, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power3.out" });
  }, [notif]);

  const roleLabel = role === "parent" ? "Parent / Guardian" : role === "teacher" ? "Teacher" : "Administrator";

  return (
    <div className="portal-shell">
      {/* ---------------- sidebar ---------------- */}
      <aside className={`portal-side no-print ${open ? "is-open" : ""}`}>
        <div className="d-flex align-items-center gap-2 px-2 mb-4">
          <LogoMark size={34} />
          <div className="lh-1">
            <div className="display-font fw-800 text-white" style={{ fontSize: ".95rem" }}>Scholaris</div>
            <div className="eyebrow" style={{ fontSize: ".5rem", color: "#7f95bb" }}>{roleLabel} portal</div>
          </div>
          <button className="btn btn-ghost btn-sm ms-auto d-lg-none" data-click onClick={() => setOpen(false)} aria-label="Close menu">✕</button>
        </div>

        <nav className="d-flex flex-column gap-1">
          {nav.map((n) => (
            <button
              key={n.id}
              data-click
              className={`portal-side__link ${active === n.id ? "is-active" : ""}`}
              onClick={() => { onNav(n.id); setOpen(false); }}
            >
              <span className="d-inline-flex" style={{ width: 18 }}>{n.icon}</span>
              <span>{n.label}</span>
              {n.badge && <span className="ms-auto badge-x badge-x--amber" style={{ fontSize: ".6rem" }}>{n.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,.1)" }}>
          <div className="rounded-4 p-3" style={{ background: "rgba(255,255,255,.05)" }}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <IconCap size={16} />
              <span className="eyebrow" style={{ fontSize: ".5rem", color: "#7f95bb" }}>{SCHOOL.session} session</span>
            </div>
            <div className="fs-8" style={{ color: "#a9bcda", lineHeight: 1.5 }}>
              Second Term in progress · 14 weeks
            </div>
            <div className="prog mt-2" style={{ height: 5 }}>
              <div className="prog__bar" style={{ width: "46%" }} />
            </div>
            <div className="fs-8 mt-1" style={{ color: "#7f95bb" }}>Week 7 of 14</div>
          </div>
        </div>

        <div className="mt-auto pt-4 d-flex flex-column gap-2" style={{ borderTop: "1px solid rgba(255,255,255,.1)" }}>
          <div className="d-flex align-items-center gap-3 px-1">
            <Avatar initials={person.initials} color={person.color} size={38} />
            <div className="lh-sm overflow-hidden">
              <div className="text-white fw-bold fs-8 text-truncate">{person.name}</div>
              <div className="fs-8 text-truncate" style={{ color: "#7f95bb", fontSize: ".68rem" }}>{person.id}</div>
            </div>
          </div>
          <button className="portal-side__link" data-click onClick={onExit}>
            <span className="d-inline-flex" style={{ width: 18 }}><IconLogout size={17} /></span>
            <span>Exit demo</span>
          </button>
        </div>
      </aside>

      {/* ---------------- main ---------------- */}
      <div className="portal-main">
        <div className="portal-topbar no-print d-flex align-items-center gap-3">
          <button className="btn btn-soft btn-sm d-lg-none" data-click onClick={() => setOpen(true)} aria-label="Open menu"><IconMenu size={16} /></button>

          <div className="d-none d-md-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: 340 }}>
            <span style={{ color: "var(--slate-400)" }}><IconSearch size={16} /></span>
            <input className="form-control form-control-sm border-0 px-0 bg-transparent" placeholder={`Search ${role === "admin" ? "students, staff, invoices" : "children, invoices, results"}…`} style={{ boxShadow: "none" }} />
          </div>

          <div className="ms-auto d-flex align-items-center gap-2 gap-md-3">
            <Badge tone="teal"><span className="dot dot--live" /> Online</Badge>
            <div className="position-relative">
              <button className="btn btn-soft btn-sm position-relative" data-click onClick={() => setNotif(!notif)} aria-label="Notifications">
                <IconBell size={16} />
                <span className="position-absolute rounded-circle" style={{ top: -3, right: -3, width: 8, height: 8, background: "#e0344b", border: "2px solid #fff" }} />
              </button>
              {notif && (
                <div ref={notifRef} className="position-absolute end-0 mt-2 p-2 rounded-4 shadow-lg bg-white" style={{ width: 300, zIndex: 40, border: "1px solid var(--slate-200)" }}>
                  <div className="fw-800 fs-8 px-2 pt-1 pb-2">Notifications</div>
                  {[
                    { t: "Second Term result published", s: "JSS 3A · Mathematics", tone: "teal" },
                    { t: "Fee reminder · due 9 Jan", s: "Ifeanyi Okonkwo", tone: "amber" },
                    { t: "PTA meeting invitation", s: "Sat 7 Feb · 10:00am", tone: "brand" },
                  ].map((n) => (
                    <div key={n.t} className="d-flex gap-2 p-2 rounded-3" style={{ background: "var(--slate-50)" }}>
                      <span className="mt-1 dot" style={{ background: n.tone === "teal" ? "#14b8a6" : n.tone === "amber" ? "#f59e0b" : "#2563c9" }} />
                      <div className="lh-sm">
                        <div className="fs-8 fw-bold">{n.t}</div>
                        <div className="fs-8 text-muted-2" style={{ fontSize: ".7rem" }}>{n.s}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="d-flex align-items-center gap-2 ps-2" style={{ borderLeft: "1px solid var(--slate-200)" }}>
              <Avatar initials={person.initials} color={person.color} size={34} />
              <div className="d-none d-lg-block lh-sm">
                <div className="fw-bold fs-8">{person.name}</div>
                <div className="text-muted-2" style={{ fontSize: ".68rem" }}>{person.role}</div>
              </div>
            </div>
          </div>
        </div>

        {/* page head */}
        <div className="portal-body">
          <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4 no-print">
            <div>
              <nav className="d-flex align-items-center gap-1 fs-8 text-muted-2 mb-1">
                <span>Portal</span> <IconChevronRight size={11} /> <span className="text-brand fw-bold">{pageTitle}</span>
              </nav>
              <h1 className="display-font mb-0" style={{ fontSize: "clamp(1.35rem,2.6vw,1.85rem)" }}>{pageTitle}</h1>
              <p className="text-muted-2 mb-0 fs-7">{pageNote}</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge-x badge-x--slate">Session {SCHOOL.session}</span>
              <span className="badge-x badge-x--brand">Second Term</span>
            </div>
          </div>
          {children}
        </div>
      </div>

      {open && <div className="position-fixed top-0 start-0 w-100 h-100 d-lg-none" style={{ background: "rgba(8,13,28,.5)", zIndex: 19 }} onClick={() => setOpen(false)} />}
    </div>
  );
}
