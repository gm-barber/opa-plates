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
  return (
    <div style={{
      position: "relative", width: 160, height: 160, margin: "0 auto",
      borderRadius: "50%", overflow: "hidden",
      boxShadow: "0 0 40px rgba(212,168,67,0.35), 0 0 80px rgba(212,168,67,0.12)",
      border: "2px solid rgba(212,168,67,0.3)",
    }}>
      <img
        src="data:image/jpeg;base64,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"
        alt="צלחת שבורה"
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center" }}
      />
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
