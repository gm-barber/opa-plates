import { useState, useEffect, useRef } from "react";

const WHATSAPP_NUMBER = "972501234567"; // ← החלף במספר שלך

const PRODUCTS = [
  {
    id: "box1",
    name: "ארגז יחיד",
    subtitle: "מושלם לאירוע קטן",
    price: 280,
    originalPrice: null,
    badge: null,
    desc: "ארגז צלחות שבירה יווניות אמיתיות",
    events: ["מסיבה קטנה", "יום הולדת"],
    emoji: "📦",
  },
  {
    id: "box2",
    name: "2 ארגזים",
    subtitle: "הכי פופולרי לבר/בת מצווה",
    price: 520,
    originalPrice: 560,
    badge: "חיסכון ₪40",
    desc: "כמות מושלמת לאירועי בר/בת מצווה",
    events: ["בר מצווה", "בת מצווה", "חתונה קטנה"],
    emoji: "🎉",
    highlight: true,
  },
  {
    id: "box3",
    name: "3 ארגזים",
    subtitle: "לאירועים גדולים",
    price: 750,
    originalPrice: 840,
    badge: "חיסכון ₪90",
    desc: "לאירועים גדולים ומרשימים",
    events: ["חתונה", "בר מצווה גדול", "אירוע חברה"],
    emoji: "🏛️",
  },
  {
    id: "custom",
    name: "כמות מותאמת",
    subtitle: "4 ארגזים ומעלה",
    price: null,
    originalPrice: null,
    badge: "מחיר מיוחד",
    desc: "הנחות גדולות על כמויות",
    events: ["כל סוג אירוע"],
    emoji: "💎",
    custom: true,
  },
];

const EVENT_TYPES = [
  "בר מצווה",
  "בת מצווה",
  "חתונה",
  "אירוסין",
  "מסיבת יום הולדת",
  "מסיבת רווקות / רווקים",
  "אירוע חברה",
  "מסיבה פרטית",
  "אחר",
];

function GreekKeyBorder() {
  return (
    <svg width="100%" height="16" viewBox="0 0 400 16" preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
      <defs>
        <pattern id="gk" x="0" y="0" width="32" height="16" patternUnits="userSpaceOnUse">
          <path d="M0,14 L0,8 L6,8 L6,2 L14,2 L14,8 L10,8 L10,14 M16,2 L16,14 M18,14 L18,8 L24,8 L24,2 L32,2"
            fill="none" stroke="#D4A843" strokeWidth="1.5" opacity="0.6" />
        </pattern>
      </defs>
      <rect width="100%" height="16" fill="url(#gk)" />
    </svg>
  );
}

function Stars({ count = 60 }) {
  const stars = useRef(
    Array.from({ length: count }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      delay: Math.random() * 3,
    }))
  );
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {stars.current.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size, borderRadius: "50%",
          background: "#F8F4E8", opacity: s.opacity,
          animation: `twinkle ${2 + s.delay}s ease-in-out infinite alternate`,
          animationDelay: `${s.delay}s`,
        }} />
      ))}
    </div>
  );
}

function PlateVideo() {
  const videoRef = useRef(null);
  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.muted = true;
      v.play().catch(() => {});
    }
  }, []);
  return (
    <div style={{
      position: "relative", width: 160, height: 160, margin: "0 auto",
      borderRadius: "50%", overflow: "hidden",
      boxShadow: "0 0 40px rgba(212,168,67,0.35), 0 0 80px rgba(212,168,67,0.12)",
      border: "2px solid rgba(212,168,67,0.3)",
    }}>
      <video
        ref={videoRef}
        loop muted playsInline preload="auto"
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center" }}>
        <source src="https://res.cloudinary.com/drfbiuokx/video/upload/plate-shatter_whxoug.mp4" type="video/mp4" />
      </video>
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: "radial-gradient(circle, transparent 55%, rgba(212,168,67,0.18) 100%)",
        pointerEvents: "none",
      }} />
    </div>
  );
}

function ShatterEffect({ active }) {
  const pieces = [
    { r: "-20px,-30px", rot: "-35deg", d: "2.2s" },
    { r: "25px,-40px", rot: "20deg", d: "2.5s" },
    { r: "-35px,10px", rot: "55deg", d: "2.1s" },
    { r: "30px,15px", rot: "-45deg", d: "2.8s" },
    { r: "5px,-50px", rot: "10deg", d: "2.3s" },
    { r: "-10px,35px", rot: "70deg", d: "2.6s" },
    { r: "40px,-15px", rot: "-60deg", d: "2.4s" },
  ];
  return (
    <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto" }}>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          animation: active ? `shard${i % 3} ${p.d} ease-out infinite` : "none",
        }}>
          <div style={{
            width: 12 + (i % 3) * 6, height: 10 + (i % 4) * 5,
            background: `rgba(212,168,67,${0.4 + (i % 3) * 0.2})`,
            clipPath: "polygon(50% 0%,100% 50%,75% 100%,25% 100%,0% 50%)",
            transform: `rotate(${i * 51}deg)`,
          }} />
        </div>
      ))}
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        filter: "drop-shadow(0 0 20px rgba(212,168,67,0.8))",
        animation: active ? "plateFloat 3s ease-in-out infinite" : "none",
      }}>
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Full plate circle outline */}
          <ellipse cx="36" cy="38" rx="30" ry="8" fill="rgba(212,168,67,0.12)" />
          {/* Left shard */}
          <path d="M10 30 Q8 18 20 12 Q30 8 36 14 L28 36 Z" fill="#F0E0B0" stroke="#D4A843" strokeWidth="1.2"/>
          {/* Right shard */}
          <path d="M36 14 Q44 8 54 14 Q64 20 62 32 L44 36 Z" fill="#EDD89A" stroke="#D4A843" strokeWidth="1.2"/>
          {/* Bottom shard */}
          <path d="M28 36 L44 36 L50 52 Q40 62 24 54 Z" fill="#E8CF88" stroke="#D4A843" strokeWidth="1.2"/>
          {/* Small chip */}
          <path d="M44 36 L62 32 L58 50 L50 52 Z" fill="#F2E4AA" stroke="#D4A843" strokeWidth="1.2"/>
          {/* Crack lines */}
          <path d="M36 14 L28 36 L44 36" stroke="#C8952A" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Inner ring hint */}
          <path d="M22 26 Q28 22 36 22 Q44 22 50 28" stroke="#D4A843" strokeWidth="0.8" strokeDasharray="2 2" fill="none" opacity="0.5"/>
        </svg>
      </div>
    </div>
  );
}

export default function OpaLanding() {
  const [selectedProduct, setSelectedProduct] = useState("box2");
  const [form, setForm] = useState({ name: "", phone: "", event: "", date: "", address: "", qty: "2", notes: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const orderRef = useRef(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Heebo:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  function scrollToOrder() {
    orderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (selectedProduct !== "custom") {
      const prod = PRODUCTS.find(p => p.id === selectedProduct);
      if (prod) setForm(f => ({ ...f, qty: selectedProduct === "box1" ? "1" : selectedProduct === "box2" ? "2" : "3" }));
    }
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "שדה חובה";
    if (!form.phone.trim() || !/^[0-9]{9,10}$/.test(form.phone.replace(/\D/g, ""))) e.phone = "מספר לא תקין";
    if (!form.event) e.event = "בחר סוג אירוע";
    if (!form.address.trim()) e.address = "שדה חובה";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const prod = PRODUCTS.find(p => p.id === selectedProduct);
    const priceText = prod?.price ? `₪${prod.price}` : "מחיר לפי הסכמה";
    const msg = encodeURIComponent(
      `🏛️ *הזמנה חדשה — צלחות שבירה יווניות*\n\n` +
      `👤 שם: ${form.name}\n` +
      `📞 טלפון: ${form.phone}\n` +
      `🎉 סוג אירוע: ${form.event}\n` +
      `📅 תאריך: ${form.date || "לא צוין"}\n` +
      `📦 כמות: ${prod?.name || form.qty + " ארגזים"}\n` +
      `💰 מחיר: ${priceText}\n` +
      `📍 כתובת משלוח: ${form.address}\n` +
      `📝 הערות: ${form.notes || "אין"}\n\n` +
      `תשלום עם קבלת הסחורה ✅`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
    setSubmitted(true);
  }

  const css = `
    @keyframes twinkle { from { opacity: 0.2; } to { opacity: 0.9; } }
    @keyframes plateFloat { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-12px) rotate(3deg); } }
    @keyframes shard0 { 0% { transform: translate(0,0) rotate(0); opacity:1; } 100% { transform: translate(-20px,-30px) rotate(-35deg); opacity:0; } }
    @keyframes shard1 { 0% { transform: translate(0,0) rotate(0); opacity:1; } 100% { transform: translate(25px,-40px) rotate(20deg); opacity:0; } }
    @keyframes shard2 { 0% { transform: translate(0,0) rotate(0); opacity:1; } 100% { transform: translate(-35px,10px) rotate(55deg); opacity:0; } }
    @keyframes fadeInUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
    @keyframes shimmer { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
    @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(212,168,67,0.4); } 50% { box-shadow: 0 0 0 12px rgba(212,168,67,0); } }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { margin: 0; }
    input, select, textarea { outline: none; }
    input:focus, select:focus, textarea:focus { border-color: #D4A843 !important; }
    .product-card:hover { transform: translateY(-4px); }
    .order-btn:hover { background: #E8BC55 !important; transform: scale(1.02); }
    .wa-btn:hover { background: #20b954 !important; transform: scale(1.03); }
    .fade-in { animation: fadeInUp 0.8s ease forwards; }
  `;

  const baseStyle = { fontFamily: "'Heebo', sans-serif", direction: "rtl" };
  const gold = "#D4A843";
  const navy = "#0D1B2A";
  const navyLight = "#162637";
  const navyCard = "#1A2F42";
  const cream = "#F8F4E8";
  const muted = "#7A9BB5";

  return (
    <div style={{ background: navy, minHeight: "100vh", color: cream, ...baseStyle }}>
      <style>{css}</style>

      {/* HERO */}
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "60px 20px 40px" }}>
        <Stars count={80} />
        {/* Night sea gradient */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 80%, #1B3A5C 0%, #0D1B2A 60%)", pointerEvents: "none" }} />
        {/* Glow */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,168,67,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", textAlign: "center", animation: "fadeInUp 1s ease forwards" }}>
          <div style={{ fontSize: 13, letterSpacing: 6, color: gold, fontFamily: "'Cinzel', serif", marginBottom: 20, opacity: 0.8 }}>
            ✦ ΑΜΠΕΛΟΣ HELLAS ✦
          </div>

          <PlateVideo />

          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(64px,15vw,120px)", fontWeight: 900, color: gold, lineHeight: 0.9, marginTop: 16, textShadow: "0 0 60px rgba(212,168,67,0.5)", letterSpacing: "-2px" }}>
            !OPA
          </h1>
          <div style={{ fontSize: "clamp(18px,4vw,28px)", color: cream, fontWeight: 300, marginTop: 8, letterSpacing: 2 }}>
            צלחות יווניות לשבירה
          </div>
          <div style={{ width: 60, height: 2, background: gold, margin: "16px auto", opacity: 0.6 }} />
          <div style={{ fontSize: 15, color: muted, maxWidth: 340, margin: "0 auto 32px", lineHeight: 1.8 }}>
            תביאו את האווירה של יוון לאירוע שלכם<br />
            חוויה שהאורחים לא ישכחו לעולם
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={scrollToOrder}
              style={{ background: gold, color: navy, border: "none", borderRadius: 50, padding: "14px 32px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo', sans-serif", transition: "all 0.2s", animation: "pulse 2.5s infinite" }}
              className="order-btn">
              📦 להזמנה ←
            </button>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"
              style={{ background: "#25D366", color: "white", border: "none", borderRadius: 50, padding: "14px 28px", fontSize: 16, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}
              className="wa-btn">
              💬 וואטסאפ
            </a>
          </div>

          <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 36, flexWrap: "wrap" }}>
            {[["₪280", "מארגז אחד"], ["✈️", "ישר מיוון"], ["🚚", "משלוח עד הבית"], ["💳", "תשלום עם קבלה"]].map(([icon, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 11, color: muted, letterSpacing: 1 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", color: muted, fontSize: 20, animation: "shimmer 2s infinite" }}>↓</div>
      </div>

      <GreekKeyBorder />

      {/* WHY SECTION */}
      <div style={{ padding: "60px 20px", background: navyLight, textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontSize: 11, letterSpacing: 5, color: gold, fontFamily: "'Cinzel', serif", marginBottom: 12 }}>THE EXPERIENCE</div>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(24px,5vw,36px)", color: cream, marginBottom: 20 }}>
            למה לשבור צלחות?
          </h2>
          <div style={{ width: 50, height: 2, background: gold, margin: "0 auto 32px", opacity: 0.5 }} />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, textAlign: "center" }}>
            {[
              { icon: "🎊", title: "רגע בלתי נשכח", text: "הצלחת מתנפצת — כולם צועקים 'אופה!' ומחייכים" },
              { icon: "📸", title: "פוטוגני מטורף", text: "הצלחת השבורה = הצילום הכי שמתשמשתף מהאירוע" },
              { icon: "🇬🇷", title: "מסורת יוונית אמיתית", text: "בטברנות יוון שוברים צלחות מסמל אושר ושמחה" },
            ].map(item => (
              <div key={item.title} style={{ background: navyCard, borderRadius: 14, padding: "24px 16px", border: `1px solid rgba(212,168,67,0.2)` }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: gold, marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 12, color: muted, lineHeight: 1.7 }}>{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <GreekKeyBorder />

      {/* PRODUCTS */}
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ fontSize: 11, letterSpacing: 5, color: gold, fontFamily: "'Cinzel', serif", marginBottom: 12 }}>PRODUCTS</div>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(22px,5vw,32px)", color: cream, marginBottom: 8 }}>בחר את הארגז שלך</h2>
          <div style={{ fontSize: 13, color: muted, marginBottom: 36 }}>תשלום עם קבלת הסחורה • משלוח לכל הארץ</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {PRODUCTS.map(p => (
              <div key={p.id} onClick={() => { setSelectedProduct(p.id); if (!p.custom) scrollToOrder(); }}
                className="product-card"
                style={{
                  background: selectedProduct === p.id ? `linear-gradient(135deg, ${navyCard}, #1E3B54)` : navyCard,
                  border: `2px solid ${selectedProduct === p.id ? gold : p.highlight ? gold + "50" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 16, padding: "20px 14px", cursor: "pointer", textAlign: "center", position: "relative",
                  transition: "all 0.25s", boxShadow: selectedProduct === p.id ? `0 0 24px rgba(212,168,67,0.25)` : "none",
                }}>
                {p.badge && (
                  <div style={{ position: "absolute", top: -10, right: "50%", transform: "translateX(50%)", background: p.highlight ? gold : "#2D5A3D", color: p.highlight ? navy : "#7FFFAA", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
                    {p.badge}
                  </div>
                )}
                {p.highlight && (
                  <div style={{ position: "absolute", top: -10, left: 12, background: "#C8452A", color: "white", fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>
                    הכי נמכר
                  </div>
                )}
                <div style={{ fontSize: 28, marginBottom: 6 }}>{p.emoji}</div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 15, fontWeight: 700, color: selectedProduct === p.id ? gold : cream, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: muted, marginBottom: 10 }}>{p.subtitle}</div>
                {p.price ? (
                  <div>
                    {p.originalPrice && <div style={{ fontSize: 12, color: muted, textDecoration: "line-through" }}>₪{p.originalPrice}</div>}
                    <div style={{ fontSize: 26, fontWeight: 800, color: gold, fontFamily: "'Cinzel', serif" }}>₪{p.price}</div>
                  </div>
                ) : (
                  <div style={{ fontSize: 18, fontWeight: 700, color: gold }}>צור קשר</div>
                )}
                <div style={{ fontSize: 10, color: muted, marginTop: 8 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <GreekKeyBorder />

      {/* HOW IT WORKS */}
      <div style={{ padding: "50px 20px", background: navyLight, textAlign: "center" }}>
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <div style={{ fontSize: 11, letterSpacing: 5, color: gold, fontFamily: "'Cinzel', serif", marginBottom: 12 }}>HOW IT WORKS</div>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(20px,4vw,28px)", color: cream, marginBottom: 36 }}>איך זה עובד?</h2>
          {[
            { n: "01", title: "בחרו חבילה", text: "בחרו את הכמות המתאימה לאירוע שלכם ומלאו טופס הזמנה" },
            { n: "02", title: "משלוח עד הבית", text: "הצלחות מגיעות אליכם במשלוח מהיר, תשלום עם קבלת החבילה" },
            { n: "03", title: "שוברים ושמחים", text: "\"אופה!\" — הצלחת מתרסקת, האורחים מתמוגגים" },
          ].map((step, i) => (
            <div key={step.n} style={{ display: "flex", gap: 16, alignItems: "flex-start", textAlign: "right", marginBottom: i < 2 ? 28 : 0 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", border: `2px solid ${gold}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel', serif", fontSize: 13, color: gold, flexShrink: 0 }}>
                {step.n}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: cream, fontSize: 15, marginBottom: 4 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: muted, lineHeight: 1.7 }}>{step.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <GreekKeyBorder />

      {/* EVENTS */}
      <div style={{ padding: "50px 20px", textAlign: "center" }}>
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(20px,4vw,28px)", color: cream, marginBottom: 28 }}>
            מתאים לכל אירוע 🎊
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {["בר מצווה 🎺", "בת מצווה 👑", "חתונה 💍", "אירוסין 💫", "יום הולדת 🎂", "רווקות 🥂", "אירוע חברה 🤝", "מסיבה פרטית 🎶"].map(ev => (
              <div key={ev} style={{ background: navyCard, border: `1px solid rgba(212,168,67,0.25)`, borderRadius: 50, padding: "8px 18px", fontSize: 13, color: cream }}>
                {ev}
              </div>
            ))}
          </div>
        </div>
      </div>

      <GreekKeyBorder />

      {/* ORDER FORM */}
      <div ref={orderRef} style={{ padding: "60px 20px", background: navyLight }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 11, letterSpacing: 5, color: gold, fontFamily: "'Cinzel', serif", marginBottom: 12 }}>ORDER NOW</div>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(22px,5vw,32px)", color: cream, marginBottom: 8 }}>הזמינו עכשיו</h2>
            <div style={{ fontSize: 13, color: muted }}>מלאו את הטופס ונחזור אליכם בוואטסאפ</div>
          </div>

          {submitted ? (
            <div style={{ background: navyCard, border: `2px solid ${gold}`, borderRadius: 20, padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
              <h3 style={{ fontFamily: "'Cinzel', serif", color: gold, fontSize: 24, marginBottom: 10 }}>!OPA</h3>
              <div style={{ color: cream, fontSize: 15, lineHeight: 1.8 }}>
                ההזמנה שלכם נשלחה בוואטסאפ!<br />
                <span style={{ color: muted, fontSize: 13 }}>ניצור קשר בהקדם לאישור.</span>
              </div>
              <button onClick={() => setSubmitted(false)}
                style={{ marginTop: 20, background: "transparent", border: `1px solid ${gold}`, color: gold, borderRadius: 50, padding: "10px 24px", cursor: "pointer", fontSize: 13 }}>
                הזמנה נוספת
              </button>
            </div>
          ) : (
            <div style={{ background: navyCard, borderRadius: 20, padding: "28px 24px", border: `1px solid rgba(212,168,67,0.2)` }}>
              {/* Product selection in form */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, color: muted, display: "block", marginBottom: 8 }}>בחר ארגז</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {PRODUCTS.map(p => (
                    <div key={p.id} onClick={() => setSelectedProduct(p.id)}
                      style={{ background: selectedProduct === p.id ? gold + "20" : navy, border: `1.5px solid ${selectedProduct === p.id ? gold : "rgba(255,255,255,0.1)"}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, color: selectedProduct === p.id ? gold : cream }}>{p.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: gold }}>{p.price ? `₪${p.price}` : "💎"}</span>
                    </div>
                  ))}
                </div>
              </div>

              {[
                { label: "שם מלא *", key: "name", type: "text", placeholder: "ישראל ישראלי" },
                { label: "טלפון *", key: "phone", type: "tel", placeholder: "050-0000000" },
                { label: "כתובת למשלוח *", key: "address", type: "text", placeholder: "רחוב, עיר" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, color: muted, display: "block", marginBottom: 6 }}>{f.label}</label>
                  <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: "100%", background: navy, border: `1.5px solid ${errors[f.key] ? "#C84040" : "rgba(255,255,255,0.12)"}`, borderRadius: 10, padding: "11px 14px", color: cream, fontSize: 14, fontFamily: "'Heebo', sans-serif", direction: "rtl" }} />
                  {errors[f.key] && <div style={{ fontSize: 11, color: "#C86060", marginTop: 4 }}>{errors[f.key]}</div>}
                </div>
              ))}

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: muted, display: "block", marginBottom: 6 }}>סוג אירוע *</label>
                <select value={form.event} onChange={e => setForm(p => ({ ...p, event: e.target.value }))}
                  style={{ width: "100%", background: navy, border: `1.5px solid ${errors.event ? "#C84040" : "rgba(255,255,255,0.12)"}`, borderRadius: 10, padding: "11px 14px", color: form.event ? cream : muted, fontSize: 14, fontFamily: "'Heebo', sans-serif", direction: "rtl" }}>
                  <option value="" disabled>בחר...</option>
                  {EVENT_TYPES.map(e => <option key={e} value={e} style={{ background: navyCard }}>{e}</option>)}
                </select>
                {errors.event && <div style={{ fontSize: 11, color: "#C86060", marginTop: 4 }}>{errors.event}</div>}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: muted, display: "block", marginBottom: 6 }}>תאריך האירוע</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  style={{ width: "100%", background: navy, border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: cream, fontSize: 14, fontFamily: "'Heebo', sans-serif", colorScheme: "dark" }} />
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={{ fontSize: 12, color: muted, display: "block", marginBottom: 6 }}>הערות (אופציונלי)</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} placeholder="כמות מותאמת, שאלות, בקשות מיוחדות..."
                  style={{ width: "100%", background: navy, border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "11px 14px", color: cream, fontSize: 14, fontFamily: "'Heebo', sans-serif", resize: "vertical", direction: "rtl" }} />
              </div>

              {/* Price summary */}
              {selectedProduct !== "custom" && (
                <div style={{ background: gold + "15", border: `1px solid ${gold}40`, borderRadius: 12, padding: "12px 16px", marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, color: cream }}>{PRODUCTS.find(p => p.id === selectedProduct)?.name}</div>
                    <div style={{ fontSize: 11, color: muted }}>תשלום עם קבלת הסחורה</div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: gold, fontFamily: "'Cinzel', serif" }}>
                    ₪{PRODUCTS.find(p => p.id === selectedProduct)?.price}
                  </div>
                </div>
              )}

              <button onClick={handleSubmit} className="order-btn"
                style={{ width: "100%", background: gold, color: navy, border: "none", borderRadius: 12, padding: "15px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Heebo', sans-serif", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <span>💬</span>
                <span>שלח הזמנה בוואטסאפ</span>
              </button>
              <div style={{ textAlign: "center", fontSize: 11, color: muted, marginTop: 10 }}>ניצור אתכם קשר תוך שעה לאישור ההזמנה</div>
            </div>
          )}
        </div>
      </div>

      <GreekKeyBorder />

      {/* FOOTER */}
      <div style={{ padding: "32px 20px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, color: gold, marginBottom: 6 }}>OPA! 🏛️</div>
        <div style={{ fontSize: 12, color: muted, marginBottom: 16 }}>צלחות שבירה יווניות אמיתיות • ישר מיוון לביתכם</div>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#25D366", color: "white", borderRadius: 50, padding: "10px 22px", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
          💬 דברו איתנו בוואטסאפ
        </a>
      </div>
    </div>
  );
}
