import { useEffect, useRef, useState } from "react";
import {
  gsap, useTypewriter, useScrollReveal, useRipple, useMagnetic,
} from "../lib/gsap";
import { SCHOOL, NEWS, EVENTS, CALENDAR_TERM_DATES } from "../data/mock";
import {
  LogoMark, IconGrid, IconWallet, IconClipboard, IconCap, IconUsers, IconTeacher, IconParent,
  IconArrowRight, IconCheck, IconCheckCircle, IconShield, IconTrendUp, IconBell, IconFile,
  IconCard, IconBank, IconMobile, IconSparkle, IconTrophy, IconGlobe, IconPhone, IconMail, IconPin,
  SvgFacebook, SvgX, SvgLinkedIn, SvgYouTube, IconChart, IconUpload, IconEye, IconClock,
  IllustrationPay, IllustrationReport, IllustrationLock,
} from "../components/Icons";
import { AreaChart, HBars } from "../components/charts";
import { Btn, SectionHead, Avatar, Badge } from "../components/ui";
import type { Role } from "../App";

/* ------------------------------------------------------------------ */
export default function Landing({ onEnter }: { onEnter: (r: Role) => void }) {
  useRipple();
  useScrollReveal();

  const typeRef = useTypewriter(
    ["school fees in 60 seconds.", "termly results instantly.", "class results in one upload.", "the whole school at a glance."],
    { speed: 46, pause: 1800 }
  );

  const heroRef = useRef<HTMLDivElement>(null);
  const mockRef = useRef<HTMLDivElement>(null);
  const ctaRef = useMagnetic<HTMLDivElement>();
  const [menu, setMenu] = useState(false);
  const [navSolid, setNavSolid] = useState(false);

  /* hero entrance timeline */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("[data-hero='badge']", { y: 18, opacity: 0, duration: 0.6 })
        .from("[data-hero='title'] span", { y: 46, opacity: 0, duration: 0.85, stagger: 0.11 }, "-=0.25")
        .from("[data-hero='lead']", { y: 26, opacity: 0, duration: 0.7 }, "-=0.45")
        .from("[data-hero='cta'] > *", { y: 20, opacity: 0, duration: 0.6, stagger: 0.09 }, "-=0.4")
        .from("[data-hero='stat']", { y: 24, opacity: 0, duration: 0.6, stagger: 0.08 }, "-=0.35")
        .fromTo(mockRef.current, { y: 70, opacity: 0, scale: 0.94, rotateX: 12 }, { y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 1.15, ease: "power4.out" }, "-=1.1")
        .from("[data-chip]", { opacity: 0, scale: 0.7, duration: 0.5, stagger: 0.12, ease: "back.out(2)" }, "-=0.6");

      gsap.to("[data-hero-glow]", {
        yPercent: -18, scale: 1.12, ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 1 },
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const roles: { role: Role; title: string; who: string; icon: typeof IconParent; tone: string; bg: string; points: string[] }[] = [
    {
      role: "parent", title: "Parents & Guardians", who: "Pupil / Parent portal", icon: IconParent, tone: "#2563c9", bg: "#e4eeff",
      points: ["Pay school fees by card, transfer or USSD", "Download termly report cards instantly", "Track attendance, invoices & school news"],
    },
    {
      role: "teacher", title: "Teachers & Form Masters", who: "Staff workspace", icon: IconTeacher, tone: "#7c3aed", bg: "#ede9fe",
      points: ["Upload CA & exam scores for your classes only", "Auto-computed grades, ranks and remarks", "Track submission status per subject arm"],
    },
    {
      role: "admin", title: "Administrators & Bursary", who: "Command centre", icon: IconChart, tone: "#0d9488", bg: "#d5f5f0",
      points: ["Live enrolment, attendance & collection KPIs", "Approve or publish results school-wide", "Reconcile payments and audit every action"],
    },
  ];

  return (
    <div>
      {/* ================= NAV ================= */}
      <nav className={`position-fixed top-0 start-0 w-100 no-print ${navSolid ? "" : ""}`} style={{ zIndex: 1030, transition: "background .35s ease, box-shadow .35s ease", background: navSolid ? "rgba(8,13,28,.82)" : "transparent", backdropFilter: "blur(14px)", borderBottom: navSolid ? "1px solid rgba(255,255,255,.08)" : "1px solid transparent" }}>
        <div className="container-xl">
          <div className="d-flex align-items-center justify-content-between py-3">
            <a href="#top" className="d-flex align-items-center gap-2 text-white">
              <LogoMark size={38} />
              <span className="d-flex flex-column">
                <span className="display-font fw-800" style={{ fontSize: "1.05rem", lineHeight: 1 }}>Scholaris</span>
                <span className="eyebrow" style={{ fontSize: ".52rem", color: "#8fa6cd" }}>School Suite</span>
              </span>
            </a>

            <div className="d-none d-lg-flex align-items-center gap-4">
              {[
                ["#portals", "Portals"], ["#features", "Features"], ["#flow", "How it works"],
                ["#news", "News"], ["#contact", "Contact"],
              ].map(([href, label]) => (
                <a key={href} href={href} className="text-white-50 fw-semibold" style={{ fontSize: ".87rem" }}
                   onMouseEnter={(e) => gsap.to(e.currentTarget, { y: -2, color: "#fff", duration: .3 })}
                   onMouseLeave={(e) => gsap.to(e.currentTarget, { y: 0, color: "rgba(255,255,255,.5)", duration: .3 })}>
                  {label}
                </a>
              ))}
            </div>

            <div className="d-flex align-items-center gap-2">
              <Btn variant="ghost" size="sm" className="d-none d-sm-inline-flex" onClick={() => onEnter("parent")}>Parent demo</Btn>
              <div ref={ctaRef}><Btn variant="brand" size="sm" onClick={() => onEnter("admin")}>Open portals <IconArrowRight size={14} /></Btn></div>
              <button className="btn btn-ghost btn-sm d-lg-none" data-click onClick={() => setMenu(!menu)} aria-label="Menu">{menu ? "✕" : "☰"}</button>
            </div>
          </div>
          {menu && (
            <div className="d-lg-none pb-3 d-flex flex-column gap-2">
              {[["#portals", "Portals"], ["#features", "Features"], ["#flow", "How it works"], ["#news", "News"], ["#contact", "Contact"]].map(([h, l]) => (
                <a key={h} href={h} onClick={() => setMenu(false)} className="text-white-50 py-2 border-bottom border-white-10">{l}</a>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <header ref={heroRef} id="top" className="hero">
        <div className="hero__grid" />
        <div data-hero-glow className="hero__glow" style={{ width: 520, height: 520, top: "-8%", right: "-4%", background: "rgba(59,122,228,.45)" }} />
        <div data-hero-glow className="hero__glow" style={{ width: 460, height: 460, bottom: "-12%", left: "-6%", background: "rgba(20,184,166,.34)" }} />

        <div className="container-xl position-relative">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div data-hero="badge" className="chip-dark mb-4">
                <span className="dot dot--live" /> {SCHOOL.short} · {SCHOOL.accredited}
              </div>

              <h1 data-hero="title" className="display-font text-white mb-3" style={{ fontSize: "clamp(2.3rem,5.2vw,4rem)", lineHeight: 1.04 }}>
                <span className="d-block">One portal for</span>
                <span className="d-block">the entire</span>
                <span className="d-block">school community<span style={{ color: "#14b8a6" }}>.</span></span>
              </h1>

              <p data-hero="lead" className="mb-4" style={{ color: "#c3d2ec", fontSize: "1.05rem", maxWidth: 540 }}>
                Pay <span className="text-white fw-bold"><span ref={typeRef} /><span className="type-caret" /></span>
                <br className="d-none d-md-block" />
                Scholars, parents, teachers and administrators — every record, every naira, every result in one secure place.
              </p>

              <div data-hero="cta" className="d-flex flex-wrap gap-3 mb-5">
                <Btn variant="brand" size="lg" onClick={() => onEnter("parent")}>
                  <span className="d-inline-flex align-items-center gap-2">Enter parent portal <IconArrowRight size={16} /></span>
                </Btn>
                <Btn variant="ghost" size="lg" onClick={() => onEnter("teacher")}>Teacher workspace</Btn>
              </div>

              <div className="row g-3" style={{ maxWidth: 560 }}>
                {[
                  { v: "₦248M", l: "Fees processed / term" },
                  { v: "1,842", l: "Active learners" },
                  { v: "99.98%", l: "Portal uptime" },
                ].map((s) => (
                  <div key={s.l} data-hero="stat" className="col-4">
                    <div className="display-font fw-800 text-white" style={{ fontSize: "1.35rem" }}>{s.v}</div>
                    <div className="eyebrow" style={{ fontSize: ".55rem", color: "#8fa6cd" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ---- floating dashboard mockup ---- */}
            <div className="col-lg-6">
              <div ref={mockRef} className="position-relative" style={{ perspective: 1200 }}>
                <div className="glass p-3 p-md-4" style={{ boxShadow: "0 50px 90px -40px rgba(0,0,0,.8)" }}>
                  <div className="d-flex align-items-center gap-2 pb-3 mb-3" style={{ borderBottom: "1px solid rgba(255,255,255,.12)" }}>
                    <span style={{ width: 10, height: 10, borderRadius: 20, background: "#ff5f57" }} />
                    <span style={{ width: 10, height: 10, borderRadius: 20, background: "#febc2e" }} />
                    <span style={{ width: 10, height: 10, borderRadius: 20, background: "#28c840" }} />
                    <span className="mono ms-2" style={{ fontSize: ".62rem", color: "#8fa6cd" }}>portal.scholaris.edu.ng / dashboard</span>
                  </div>

                  <div className="row g-3">
                    {[
                      { l: "Fees collected", v: "₦231.4M", d: "+3.1%", i: <IconWallet size={15} />, c: "#14b8a6" },
                      { l: "Results published", v: "1,612", d: "+186", i: <IconClipboard size={15} />, c: "#6ba3f0" },
                      { l: "Attendance", v: "94%", d: "-1.2%", i: <IconUsers size={15} />, c: "#f59e0b" },
                    ].map((k) => (
                      <div className="col-4" key={k.l}>
                        <div className="rounded-3 p-3 h-100" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)" }}>
                          <span className="d-inline-flex mb-2 rounded-2 align-items-center justify-content-center" style={{ width: 26, height: 26, background: `${k.c}22`, color: k.c }}>{k.i}</span>
                          <div className="text-white fw-800 display-font" style={{ fontSize: "1.02rem", lineHeight: 1.1 }}>{k.v}</div>
                          <div style={{ fontSize: ".6rem", color: "#8fa6cd" }}>{k.l} · {k.d}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 rounded-3 p-3" style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)" }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="eyebrow" style={{ fontSize: ".55rem", color: "#8fa6cd" }}>Enrolment trend</span>
                      <span className="badge-x badge-x--teal" style={{ background: "rgba(20,184,166,.18)", color: "#5eead4" }}>Live</span>
                    </div>
                    <div style={{ filter: "saturate(1.25) brightness(1.35)" }}>
                      <AreaChart data={[{ label: "19", value: 1290 }, { label: "20", value: 1348 }, { label: "21", value: 1421 }, { label: "22", value: 1567 }, { label: "23", value: 1680 }, { label: "24", value: 1731 }, { label: "25", value: 1842 }]} height={130} stroke="#5eead4" fill="#14b8a6" />
                    </div>
                  </div>
                </div>

                {/* floating chips */}
                <div data-chip className="orb glass d-flex align-items-center gap-2 p-2 px-3 float-y" style={{ top: "-22px", left: "-26px" }}>
                  <IllustrationPay size={30} />
                  <div>
                    <div className="text-white fw-bold" style={{ fontSize: ".72rem" }}>₦150,000 paid</div>
                    <div style={{ fontSize: ".6rem", color: "#8fa6cd" }}>Chiamaka · Second Term</div>
                  </div>
                </div>
                <div data-chip className="orb glass d-flex align-items-center gap-2 p-2 px-3 float-y" style={{ bottom: "-20px", right: "-18px", animationDelay: "1.4s" }}>
                  <IllustrationReport size={30} />
                  <div>
                    <div className="text-white fw-bold" style={{ fontSize: ".72rem" }}>Result ready · A1</div>
                    <div style={{ fontSize: ".6rem", color: "#8fa6cd" }}>Mathematics · 96/100</div>
                  </div>
                </div>
                <div data-chip className="orb glass d-flex align-items-center gap-2 p-2 px-3 float-y" style={{ top: "46%", right: "-34px", animationDelay: ".8s" }}>
                  <IllustrationLock size={28} />
                  <div>
                    <div className="text-white fw-bold" style={{ fontSize: ".72rem" }}>Bank-grade security</div>
                    <div style={{ fontSize: ".6rem", color: "#8fa6cd" }}>PCI-DSS · 256-bit TLS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* marquee */}
        <div className="position-absolute bottom-0 start-0 w-100 py-3" style={{ background: "rgba(6,10,23,.6)", borderTop: "1px solid rgba(255,255,255,.07)", overflow: "hidden" }}>
          <div className="marquee">
            {[...Array(2)].map((_, k) => (
              <div key={k} className="d-flex gap-5 align-items-center">
                {["WAEC Approved Centre", "CIE Cambridge Partner", "NECO Accredited", "Microsoft Showcase School", "NERDC Compliant Curriculum", "ISO 27001 Certified"].map((t) => (
                  <span key={t} className="eyebrow d-flex align-items-center gap-2" style={{ fontSize: ".58rem", color: "#7f95bb" }}>
                    <IconCheckCircle size={13} /> {t}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ================= ROLE PORTALS ================= */}
      <section id="portals" className="section-pad bg-white">
        <div className="container-xl">
          <SectionHead
            eyebrow="Three doors, one system"
            title={<>Choose your portal and walk through <span className="grad-text">the live demo</span></>}
            lead="Every role sees only what it should. Permissions, data and workflow are separated from the ground up — a guardian can never touch a class broadsheet, and no result goes public until an administrator publishes it."
          />

          <div className="row g-4">
            {roles.map((r, i) => (
              <div className="col-lg-4" key={r.role} data-reveal="up" data-delay={i * 0.12}>
                <article className="card-x card-x--hover h-100 p-4 d-flex flex-column">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <span className="d-grid align-items-center justify-content-center rounded-4" style={{ width: 56, height: 56, background: r.bg, color: r.tone, display: "grid", placeItems: "center" }}>
                      <r.icon size={26} />
                    </span>
                    <Badge tone="slate">{r.who}</Badge>
                  </div>
                  <h3 className="fs-5 fw-800 mb-1">{r.title}</h3>
                  <ul className="list-unstyled d-flex flex-column gap-2 my-3">
                    {r.points.map((p) => (
                      <li key={p} className="d-flex gap-2 align-items-start fs-7 text-muted-2">
                        <span className="mt-1 d-inline-flex" style={{ color: r.tone }}><IconCheck size={14} /></span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <span className="avatar" style={{ width: 26, height: 26, background: r.tone, fontSize: ".6rem" }}>DEMO</span>
                      <span className="fs-8 text-muted-2">Pre-loaded sample data</span>
                    </div>
                    <Btn size="sm" onClick={() => onEnter(r.role)}>
                      Enter <IconArrowRight size={13} />
                    </Btn>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="section-pad" style={{ background: "var(--slate-50)" }}>
        <div className="container-xl">
          <SectionHead
            eyebrow="Core capabilities"
            title="Everything a modern school runs on"
            lead="Fees, results, records, circulars and analytics — purpose-built modules that talk to each other in real time."
          />

          <div className="row g-4">
            {[
              { i: <IconWallet size={22} />, t: " frictionless fee payment", d: "Card, bank transfer and USSD with instant receipts, part-payment tracking, automated reminders and a full statement history.", tone: "#2563c9", bg: "#e4eeff" },
              { i: <IconClipboard size={22} />, t: "Instant result publishing", d: "Broadsheets compile automatically the moment a teacher submits. Parents get a push alert and can download the report card as PDF.", tone: "#0d9488", bg: "#d5f5f0" },
              { i: <IconUpload size={22} />, t: "Guided score upload", d: "Teachers enter CA (40) and exam (60) marks per arm. Grades, positions, remarks and class averages compute themselves.", tone: "#7c3aed", bg: "#ede9fe" },
              { i: <IconChart size={22} />, t: "Executive dashboards", d: "Enrolment, attendance, collection rate and class performance visualised for the principal, bursar and board of governors.", tone: "#f59e0b", bg: "#fef3d8" },
              { i: <IconShield size={22} />, t: "Role-based security", d: "Granular permissions, immutable audit trails, encrypted payment channel and single sign-on for staff.", tone: "#e0344b", bg: "#fde8eb" },
              { i: <IconBell size={22} />, t: "News & circulars", d: "Targeted announcements to a class, a year group or the whole school — with read receipts and holiday calendars.", tone: "#0f172a", bg: "#e2e8f0" },
            ].map((f, i) => (
              <div className="col-md-6 col-lg-4" key={f.t} data-reveal="up" data-delay={i * 0.07}>
                <div className="card-x card-x--hover h-100 p-4">
                  <span className="d-grid mb-3 rounded-4" style={{ width: 48, height: 48, background: f.bg, color: f.tone, display: "grid", placeItems: "center" }}>{f.i}</span>
                  <h3 className="fs-6 fw-800">{f.t}</h3>
                  <p className="text-muted-2 fs-7 mb-0">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="flow" className="section-pad dark-panel position-relative overflow-hidden">
        <div className="position-absolute" style={{ top: "-120px", right: "-120px", width: 420, height: 420, background: "rgba(59,122,228,.22)", filter: "blur(120px)", borderRadius: "50%" }} />
        <div className="position-absolute" style={{ bottom: "-140px", left: "-100px", width: 380, height: 380, background: "rgba(20,184,166,.18)", filter: "blur(120px)", borderRadius: "50%" }} />
        <div className="container-xl position-relative">
          <SectionHead light eyebrow="The result pipeline" title="From teacher's desk to parent's phone" lead="A four-step chain with approvals at every gate. Nothing publishes by accident." />

          <div className="row g-4">
            {[
              { n: "01", t: "Teacher enters scores", d: "Form masters select the class arm they handle, key CA and exam marks, and save a draft.", i: <IconTeacher size={20} />, c: "#a78bfa" },
              { n: "02", t: "Broadsheet compiles", d: "Totals, WAEC grades, positions and class averages are computed and validated automatically.", i: <IconFile size={20} />, c: "#6ba3f0" },
              { n: "03", t: "Admin reviews & publishes", d: "The exam officer cross-checks outliers, approves the broadsheet and releases it school-wide.", i: <IconEye size={20} />, c: "#f59e0b" },
              { n: "04", t: "Parent is notified", d: "Guardians receive an alert, view the report card and can print or download it immediately.", i: <IconParent size={20} />, c: "#5eead4" },
            ].map((s, i) => (
              <div className="col-md-6 col-lg-3" key={s.n} data-reveal="up" data-delay={i * 0.1}>
                <div className="glass h-100 p-4">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="step-num" style={{ background: "rgba(255,255,255,.1)", color: s.c }}>{s.i}</span>
                    <span className="mono fw-800" style={{ color: "rgba(255,255,255,.22)", fontSize: "1.6rem" }}>{s.n}</span>
                  </div>
                  <h4 className="text-white fs-6 fw-800">{s.t}</h4>
                  <p className="mb-0" style={{ color: "#a9bcda", fontSize: ".82rem" }}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>

          {/* term calendar strip */}
          <div className="glass p-4 mt-5" data-reveal="scale">
            <div className="d-flex align-items-center gap-2 mb-3">
              <IconClock size={16} /> <span className="eyebrow" style={{ color: "#8fa6cd" }}>2025/2026 term calendar</span>
            </div>
            <div className="row g-3">
              {CALENDAR_TERM_DATES.map((c) => (
                <div className="col-6 col-lg-3" key={c.label}>
                  <div className="fs-7 fw-bold text-white">{c.value}</div>
                  <div className="fs-8" style={{ color: "#8fa6cd" }}>{c.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= PAYMENT SHOWCASE ================= */}
      <section className="section-pad bg-white">
        <div className="container-xl">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6" data-reveal="left">
              <div className="eyebrow text-teal mb-2">Fee module</div>
              <h2 className="display-font mb-3" style={{ fontSize: "clamp(1.6rem,3vw,2.3rem)", lineHeight: 1.15 }}>
                Three taps from invoice to receipt
              </h2>
              <p className="text-muted-2">
                No queues at the bursary, no lost tellers. Guardians see a live invoice per child per term, choose a channel,
                and get an instant receipt with a reference the school can reconcile.
              </p>

              <div className="d-flex flex-column gap-3 mt-4">
                {[
                  { i: <IconCard size={20} />, t: "Debit / credit card", d: "Visa, Mastercard & Verve · instant value", tone: "#2563c9" },
                  { i: <IconBank size={20} />, t: "Bank transfer", d: "Unique virtual account per learner", tone: "#0d9488" },
                  { i: <IconMobile size={20} />, t: "USSD & mobile money", d: "*737# dial code from any phone", tone: "#f59e0b" },
                ].map((m) => (
                  <div key={m.t} className="d-flex align-items-center gap-3 p-3 rounded-4 border">
                    <span className="rounded-3 d-grid" style={{ width: 42, height: 42, background: `${m.tone}18`, color: m.tone, display: "grid", placeItems: "center" }}>{m.i}</span>
                    <div>
                      <div className="fw-800 fs-7">{m.t}</div>
                      <div className="fs-8 text-muted-2">{m.d}</div>
                    </div>
                    <span className="ms-auto badge-x badge-x--teal">Live</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-6" data-reveal="right">
              <div className="card-x p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <Avatar initials="CO" color="linear-gradient(135deg,#f59e0b,#e0344b)" size={44} ring />
                    <div>
                      <div className="fw-800 fs-7">Chiamaka Okonkwo</div>
                      <div className="fs-8 text-muted-2">JSS 3A · SIA/2019/0331</div>
                    </div>
                  </div>
                  <Badge tone="amber">Part paid</Badge>
                </div>

                <div className="rounded-4 p-3 mb-3" style={{ background: "var(--slate-50)", border: "1px solid var(--slate-200)" }}>
                  <div className="d-flex justify-content-between fs-8 text-muted-2"><span>Invoice INV-2025-1601 · Second Term</span><span>Due 9 Jan 2026</span></div>
                  <div className="d-flex justify-content-between align-items-end mt-2">
                    <div>
                      <div className="eyebrow" style={{ fontSize: ".55rem" }}>Outstanding</div>
                      <div className="display-font fw-800" style={{ fontSize: "1.5rem", color: "#e0344b" }}>₦117,500</div>
                    </div>
                    <div className="text-end">
                      <div className="eyebrow" style={{ fontSize: ".55rem" }}>Paid so far</div>
                      <div className="fw-800 fs-7 text-teal">₦150,000 of ₦267,500</div>
                    </div>
                  </div>
                  <div className="prog mt-2"><div className="prog__bar" style={{ width: "56%" }} /></div>
                </div>

                <HBars
                  data={[
                    { label: "Tuition Fee", value: 185000 },
                    { label: "BECE Examination", value: 32000 },
                    { label: "Development Levy", value: 25000 },
                    { label: "ICT & Laboratory", value: 18000 },
                    { label: "PTA Dues", value: 7500 },
                  ]}
                  format={(n) => "₦" + n.toLocaleString()}
                />

                <Btn full className="mt-4"><span className="d-inline-flex align-items-center gap-2">Continue to payment <IconArrowRight size={15} /></span></Btn>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= NEWS ================= */}
      <section id="news" className="section-pad" style={{ background: "var(--slate-50)" }}>
        <div className="container-xl">
          <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
            <SectionHead center={false} eyebrow="School newsroom" title="Latest from the headmaster's desk" />
            <div className="d-flex gap-4 mb-2" data-reveal="fade">
              {EVENTS.slice(0, 2).map((e) => (
                <div key={e.title} className="d-flex align-items-center gap-3">
                  <div className="text-center rounded-3 px-2 py-1" style={{ background: "#fff", border: "1px solid var(--slate-200)" }}>
                    <div className="display-font fw-800 text-brand" style={{ fontSize: "1.05rem", lineHeight: 1.1 }}>{e.day}</div>
                    <div className="eyebrow text-muted-2" style={{ fontSize: ".5rem" }}>{e.month}</div>
                  </div>
                  <div>
                    <div className="fw-800 fs-7">{e.title}</div>
                    <div className="fs-8 text-muted-2">{e.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="row g-4">
            {NEWS.map((n, i) => (
              <div className="col-md-6 col-lg-3" key={n.id} data-reveal="up" data-delay={i * 0.08}>
                <article className="news-card card-x card-x--hover h-100 overflow-hidden">
                  <div className="news-thumb">
                    <img src={n.image} alt={n.title} loading="lazy" />
                    <span className="position-absolute top-0 start-0 m-2 badge-x badge-x--dark">{n.category}</span>
                  </div>
                  <div className="p-3 d-flex flex-column h-100">
                    <div className="d-flex align-items-center gap-2 fs-8 text-muted-2 mb-2">
                      <IconClock size={12} /> {n.date}
                    </div>
                    <h3 className="fs-7 fw-800" style={{ lineHeight: 1.35 }}>{n.title}</h3>
                    <p className="fs-8 text-muted-2 mt-2 mb-3">{n.excerpt.slice(0, 108)}…</p>
                    <span className="mt-auto d-inline-flex align-items-center gap-1 fw-bold text-brand" style={{ fontSize: ".78rem" }}>
                      Read circular <IconArrowRight size={13} />
                    </span>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TRUST / STATS ================= */}
      <section className="section-pad dark-panel position-relative overflow-hidden">
        <div className="container-xl position-relative">
          <div className="row g-4 align-items-center">
            <div className="col-lg-5" data-reveal="left">
              <div className="eyebrow mb-2" style={{ color: "#5eead4" }}>By the numbers</div>
              <h2 className="display-font text-white mb-3" style={{ fontSize: "clamp(1.6rem,3vw,2.2rem)" }}>
                Trusted by the school's board, bursary and 1,300+ families
              </h2>
              <p className="mb-0" style={{ color: "#a9bcda" }}>
                Deployed on campus since 2019. Every module is audited termly and reconciled against bank statements by the bursar.
              </p>
            </div>
            <div className="col-lg-7">
              <div className="row g-3">
                {[
                  { v: "27 yrs", l: "Of academic excellence", i: <IconTrophy size={18} /> },
                  { v: "168", l: "Teaching & non-teaching staff", i: <IconTeacher size={18} /> },
                  { v: "42", l: "Class arms from Primary 1 – SS 3", i: <IconCap size={18} /> },
                  { v: "₦742M", l: "Fees reconciled this session", i: <IconTrendUp size={18} /> },
                ].map((s, i) => (
                  <div className="col-6" key={s.l} data-reveal="scale" data-delay={i * 0.08}>
                    <div className="glass p-3 h-100 d-flex flex-column">
                      <span className="mb-2" style={{ color: "#5eead4" }}>{s.i}</span>
                      <div className="display-font fw-800 text-white" style={{ fontSize: "1.5rem", lineHeight: 1 }}>{s.v}</div>
                      <div className="fs-8 mt-1" style={{ color: "#8fa6cd" }}>{s.l}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="section-pad bg-white">
        <div className="container-xl">
          <SectionHead eyebrow="Voices" title="What the community says" />
          <div className="row g-4">
            {[
              { q: "I paid both children's fees from my shop in under two minutes. The receipt landed on WhatsApp before I closed the app.", n: "Mrs. Adaeze Okonkwo", r: "Parent · JSS 3 & Primary 4", c: "linear-gradient(135deg,#f59e0b,#e0344b)", i: "AO" },
              { q: "Uploading a broadsheet used to take three evenings in Excel. Now it is one table, auto-graded, and the HOD sees it instantly.", n: "Mr. Tunde Bakare", r: "Mathematics Teacher", c: "linear-gradient(135deg,#7c3aed,#2563c9)", i: "TB" },
              { q: "I open one dashboard and know the collection rate, attendance and best performing class before assembly.", n: "Dr. (Mrs) Ifeoma Eze", r: "Principal", c: "linear-gradient(135deg,#0d9488,#f59e0b)", i: "IE" },
            ].map((t, i) => (
              <div className="col-lg-4" key={t.n} data-reveal="up" data-delay={i * 0.1}>
                <div className="card-x card-x--hover h-100 p-4">
                  <div className="d-flex gap-1 mb-3" style={{ color: "#f59e0b" }}>
                    {[...Array(5)].map((_, k) => <span key={k}>★</span>)}
                  </div>
                  <p className="fs-7 text-muted-2" style={{ fontStyle: "italic" }}>“{t.q}”</p>
                  <div className="d-flex align-items-center gap-3 mt-4 pt-3 border-top">
                    <Avatar initials={t.i} color={t.c} size={38} />
                    <div>
                      <div className="fw-800 fs-7">{t.n}</div>
                      <div className="fs-8 text-muted-2">{t.r}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="position-relative overflow-hidden" style={{ background: "linear-gradient(150deg,#080d1c,#12224a 55%,#0b3b3a)", padding: "clamp(56px,7vw,96px) 0" }}>
        <div className="position-absolute" style={{ inset: 0, opacity: .5, background: "radial-gradient(600px 320px at 50% 0%, rgba(59,122,228,.4), transparent 70%)" }} />
        <div className="container-xl position-relative text-center">
          <div data-reveal="up">
            <span className="chip-dark mb-4"><IconSparkle size={13} /> Interactive demo · no signup needed</span>
            <h2 className="display-font text-white mb-3" style={{ fontSize: "clamp(1.8rem,4vw,2.9rem)", lineHeight: 1.1 }}>
              Step inside the {SCHOOL.short} portal
            </h2>
            <p className="mx-auto mb-4" style={{ color: "#b8c9e4", maxWidth: 620 }}>
              Pick a role below. The demo is fully interactive — pay a fee, upload a broadsheet, publish results and watch the admin dashboards update.
            </p>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <Btn size="lg" onClick={() => onEnter("parent")}><span className="d-inline-flex align-items-center gap-2"><IconParent size={16} /> Parent portal</span></Btn>
              <Btn size="lg" variant="ghost" onClick={() => onEnter("teacher")}><span className="d-inline-flex align-items-center gap-2"><IconTeacher size={16} /> Teacher portal</span></Btn>
              <Btn size="lg" variant="ghost" onClick={() => onEnter("admin")}><span className="d-inline-flex align-items-center gap-2"><IconGrid size={16} /> Admin console</span></Btn>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer id="contact" style={{ background: "#060a17", color: "#93a6c7", paddingTop: 64, paddingBottom: 28 }}>
        <div className="container-xl">
          <div className="row g-4 pb-4">
            <div className="col-lg-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <LogoMark size={36} />
                <span className="display-font fw-800 text-white" style={{ fontSize: "1.05rem" }}>Scholaris</span>
              </div>
              <p className="fs-8" style={{ maxWidth: 320 }}>
                {SCHOOL.name} — {SCHOOL.motto}. A unified school management suite for fees, results and records.
              </p>
              <div className="d-flex gap-2 mt-3">
                {[SvgFacebook, SvgX, SvgLinkedIn, SvgYouTube].map((I, i) => (
                  <a key={i} href="#top" className="d-grid rounded-3" style={{ width: 36, height: 36, placeItems: "center", background: "rgba(255,255,255,.07)", color: "#c9d7ee" }}><I size={15} /></a>
                ))}
              </div>
            </div>
            <div className="col-6 col-lg-2">
              <h4 className="text-white fs-8 fw-800 mb-3">PORTALS</h4>
              <ul className="list-unstyled d-flex flex-column gap-2 fs-8">
                <li><a href="#portals" className="text-reset">Parent portal</a></li>
                <li><a href="#portals" className="text-reset">Teacher workspace</a></li>
                <li><a href="#portals" className="text-reset">Admin console</a></li>
                <li><a href="#portals" className="text-reset">Bursary</a></li>
              </ul>
            </div>
            <div className="col-6 col-lg-2">
              <h4 className="text-white fs-8 fw-800 mb-3">SCHOOL</h4>
              <ul className="list-unstyled d-flex flex-column gap-2 fs-8">
                <li><a href="#news" className="text-reset">News & circulars</a></li>
                <li><a href="#flow" className="text-reset">Term calendar</a></li>
                <li><a href="#features" className="text-reset">Admissions</a></li>
                <li><a href="#contact" className="text-reset">Contact us</a></li>
              </ul>
            </div>
            <div className="col-lg-4">
              <h4 className="text-white fs-8 fw-800 mb-3">REACH US</h4>
              <ul className="list-unstyled d-flex flex-column gap-3 fs-8">
                <li className="d-flex gap-2"><IconPin size={15} /> {SCHOOL.address}, {SCHOOL.city}</li>
                <li className="d-flex gap-2"><IconPhone size={15} /> {SCHOOL.phone}</li>
                <li className="d-flex gap-2"><IconMail size={15} /> {SCHOOL.email}</li>
                <li className="d-flex gap-2"><IconGlobe size={15} /> www.scholaris.edu.ng</li>
              </ul>
            </div>
          </div>
          <div className="pt-3 d-flex flex-wrap justify-content-between gap-2 fs-8" style={{ borderTop: "1px solid rgba(255,255,255,.08)" }}>
            <span>© {new Date().getFullYear()} {SCHOOL.name}. All rights reserved.</span>
            <span className="d-flex align-items-center gap-2"><IconShield size={13} /> Demo environment · sample data only</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
