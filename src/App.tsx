import { useEffect, useRef, useState } from "react";
import Landing from "./pages/Landing";
import ParentPortal from "./portals/ParentPortal";
import TeacherPortal from "./portals/TeacherPortal";
import AdminPortal from "./portals/AdminPortal";
import { Btn } from "./components/ui";
import { gsap, useRipple } from "./lib/gsap";
import { LogoMark, IconParent, IconTeacher, IconGrid, IconArrowRight, IconShield, IconCheck } from "./components/Icons";
import { PARENT, TEACHER, ADMIN, SCHOOL } from "./data/mock";

export type Role = "parent" | "teacher" | "admin";
type View = { kind: "landing" } | { kind: "gate"; role: Role } | { kind: "portal"; role: Role };

/* ------------------------------------------------------------------ */
export default function App() {
  const [view, setView] = useState<View>({ kind: "landing" });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    gsap.fromTo("#app-root", { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" });
  }, [view.kind, (view as { role?: Role }).role]);

  const goPortal = (r: Role) => setView({ kind: "portal", role: r });

  return (
    <div id="app-root">
      {view.kind === "landing" && <Landing onEnter={(r) => setView({ kind: "gate", role: r })} />}

      {view.kind === "gate" && (
        <LoginGate
          role={view.role}
          onCancel={() => setView({ kind: "landing" })}
          onDone={() => goPortal(view.role)}
          onRole={(r) => setView({ kind: "gate", role: r })}
        />
      )}

      {view.kind === "portal" && view.role === "parent" && (
        <ParentPortal onExit={() => setView({ kind: "landing" })} onSwitch={goPortal} />
      )}
      {view.kind === "portal" && view.role === "teacher" && (
        <TeacherPortal onExit={() => setView({ kind: "landing" })} onSwitch={goPortal} />
      )}
      {view.kind === "portal" && view.role === "admin" && (
        <AdminPortal onExit={() => setView({ kind: "landing" })} onSwitch={goPortal} />
      )}
    </div>
  );
}

/* ==================================================================== */
/*                          DEMO LOGIN GATE                             */
/* ==================================================================== */
const ROLE_META: Record<Role, {
  title: string; who: string; person: typeof PARENT; icon: typeof IconParent;
  color: string; creds: { id: string; pass: string }; perks: string[];
}> = {
  parent: {
    title: "Parent / Guardian sign in",
    who: "Pupil & parent portal",
    person: PARENT, icon: IconParent, color: "#2563c9",
    creds: { id: "adaeze.okonkwo@gmail.com", pass: "••••••••" },
    perks: ["Pay school fees by card, transfer or USSD", "View & download termly report cards", "Track attendance, invoices and circulars"],
  },
  teacher: {
    title: "Staff sign in",
    who: "Teacher workspace",
    person: TEACHER, icon: IconTeacher, color: "#7c3aed",
    creds: { id: "t.bakare@scholaris.edu.ng", pass: "••••••••" },
    perks: ["Upload CA & exam scores for your class arms", "Auto-computed grades, ranks and remarks", "Track submission status per subject"],
  },
  admin: {
    title: "Administrator sign in",
    who: "Command centre",
    person: ADMIN, icon: IconGrid, color: "#0d9488",
    creds: { id: "principal@scholaris.edu.ng", pass: "••••••••" },
    perks: ["Live enrolment, attendance & collection KPIs", "Approve broadsheets and publish results", "Reconcile payments and audit every action"],
  },
};

function LoginGate({ role, onCancel, onDone, onRole }: { role: Role; onCancel: () => void; onDone: () => void; onRole: (r: Role) => void }) {
  const meta = ROLE_META[role];
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  useRipple(panelRef);

  useEffect(() => {
    if (!panelRef.current) return;
    gsap.fromTo(panelRef.current, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: "power3.out" });
  }, []);

  const submit = () => {
    setLoading(true);
    window.setTimeout(onDone, 1250);
  };

  return (
    <div className="d-flex min-vh-100" style={{ background: "linear-gradient(160deg,#060a17,#0d1426 45%,#0b1c2e)" }}>
      {/* left brand panel */}
      <div className="d-none d-lg-flex flex-column justify-content-between p-5 position-relative" style={{ width: "46%", overflow: "hidden" }}>
        <div className="position-absolute" style={{ top: "-90px", left: "-90px", width: 380, height: 380, background: "rgba(59,122,228,.28)", filter: "blur(110px)", borderRadius: "50%" }} />
        <div className="position-absolute" style={{ bottom: "-110px", right: "-60px", width: 340, height: 340, background: "rgba(20,184,166,.22)", filter: "blur(110px)", borderRadius: "50%" }} />

        <div className="d-flex align-items-center gap-2 position-relative">
          <LogoMark size={38} />
          <div>
            <div className="display-font fw-800 text-white" style={{ fontSize: "1.02rem" }}>Scholaris</div>
            <div className="eyebrow" style={{ fontSize: ".5rem", color: "#7f95bb" }}>School Suite</div>
          </div>
        </div>

        <div className="position-relative">
          <span className="badge-x mb-4" style={{ background: "rgba(255,255,255,.1)", color: "#cbd5f5" }}>{meta.who}</span>
          <h2 className="display-font text-white mb-3" style={{ fontSize: "clamp(1.7rem,3vw,2.4rem)", lineHeight: 1.12 }}>
            Welcome back.<br />Let's check on <span className="grad-text">the numbers</span>.
          </h2>
          <ul className="list-unstyled d-flex flex-column gap-2 mb-0">
            {meta.perks.map(p => (
              <li key={p} className="d-flex align-items-start gap-2 fs-8" style={{ color: "#a9bcda" }}>
                <span className="mt-1 text-teal" style={{ color: "#5eead4" }}><IconCheck size={13} /></span> {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="position-relative d-flex align-items-center gap-2 fs-8" style={{ color: "#7f95bb" }}>
          <IconShield size={14} /> {SCHOOL.accredited} · {SCHOOL.city}
        </div>
      </div>

      {/* right form panel */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
        <div className="w-100" ref={panelRef} style={{ maxWidth: 430 }}>
          <div className="glass p-4">
            <div className="d-flex align-items-center gap-3 mb-4">
              <span className="d-grid rounded-4 flex-shrink-0" style={{ width: 52, height: 52, placeItems: "center", background: `${meta.color}30`, color: "#fff" }}>
                <meta.icon size={24} />
              </span>
              <div>
                <h1 className="fs-6 fw-800 text-white mb-0">{meta.title}</h1>
                <div className="fs-8" style={{ color: "#8fa6cd" }}>{SCHOOL.name}</div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label" style={{ color: "#a9bcda" }}>Email / Staff ID</label>
              <input className="form-control" defaultValue={meta.creds.id} />
            </div>
            <div className="mb-2">
              <label className="form-label" style={{ color: "#a9bcda" }}>Password</label>
              <input className="form-control" type="password" defaultValue="demopassword" />
            </div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <label className="d-flex align-items-center gap-2 fs-8" style={{ color: "#8fa6cd" }}>
                <input type="checkbox" defaultChecked className="form-check-input mt-0" /> Remember this device
              </label>
              <a href="#" className="fs-8" style={{ color: "#6ba3f0" }}>Forgot password?</a>
            </div>

            <Btn full size="lg" onClick={submit} disabled={loading}>
              {loading
                ? <span className="d-inline-flex align-items-center gap-2"><span className="spinner-border spinner-border-sm" /> Verifying…</span>
                : <span className="d-inline-flex align-items-center gap-2">Sign in securely <IconArrowRight size={15} /></span>}
            </Btn>

            <div className="d-flex align-items-center gap-2 my-3">
              <span style={{ height: 1, background: "rgba(255,255,255,.14)", flex: 1 }} />
              <span className="eyebrow" style={{ color: "#7f95bb", fontSize: ".5rem" }}>OR SWITCH ROLE</span>
              <span style={{ height: 1, background: "rgba(255,255,255,.14)", flex: 1 }} />
            </div>

            <div className="d-flex gap-2">
              {(["parent", "teacher", "admin"] as Role[]).map(r => (
                <button key={r} data-click onClick={() => onRole(r)}
                  className="btn btn-sm flex-grow-1 text-capitalize"
                  style={{ background: r === role ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.06)", color: "#cbd5f5", fontSize: ".74rem", border: r === role ? "1px solid rgba(255,255,255,.34)" : "1px solid transparent" }}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center mt-4">
            <button data-click onClick={onCancel} className="btn btn-ghost btn-sm">← Back to website</button>
          </div>

          <p className="text-center fs-8 mt-3 mb-0" style={{ color: "#6f86ad" }}>
            Demo environment — credentials are pre-filled. No real payment is processed.
          </p>
        </div>
      </div>
    </div>
  );
}
