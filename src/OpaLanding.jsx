// v5
import { useState, useEffect, useRef } from "react";

const WHATSAPP_NUMBER = "972556873811";
const ADMIN_PASSWORD = "opa2024";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzp7pkyu4uTtzHIz4tTyna9wgnRFX_bnrBkAQqjU3zJuetsnJ5octSNvJfMJ68O1Ag/exec";

const B="#1565C0",BD="#0D47A1",BL="#42A5F5",BBG="#E8F4FD",BBG2="#DCEEFB";
const W="#FFFFFF",TXT="#1A237E",MUT="#5C7A9F",GREEN="#2E7D32",RED="#C62828";

const DEFAULT_PRODUCTS=[
  {id:"box1",name:"חבילה בסיסית",boxes:1,plates:35,price:280,origPrice:280,badge:null,emoji:"📦",highlight:false,freeShip:false},
  {id:"box2",name:"חבילה זוגית",boxes:2,plates:70,price:520,origPrice:560,badge:"חיסכון ₪40",emoji:"🎉",highlight:false,freeShip:false},
  {id:"box3",name:"חבילה משפחתית",boxes:3,plates:105,price:750,origPrice:840,badge:"חיסכון ₪90",emoji:"🏛️",highlight:true,freeShip:false},
  {id:"custom",name:"כמות מותאמת",boxes:null,plates:null,price:240,origPrice:280,badge:"מחיר מיוחד",emoji:"💎",highlight:false,freeShip:true,custom:true},
];
const EVENT_TYPES=["בר מצווה","בת מצווה","חתונה","אירוסין","מסיבת יום הולדת","מסיבת רווקות / רווקים","אירוע חברה","מסיבה פרטית","אחר"];
const DEFAULT_PICKUP=["הרצליה","מודיעין","שדרות","צור משה"];
const ORDER_STATUSES=["חדשה","שולמה ונמסרה","בוטלה"];
const STATUS_COLORS={"חדשה":"#1565C0","שולמה ונמסרה":"#2E7D32","בוטלה":"#C62828"};

function GreekBorder(){
  return(<svg width="100%" height="16" viewBox="0 0 400 16" preserveAspectRatio="xMidYMid meet" style={{display:"block"}}>
    <defs><pattern id="gk" x="0" y="0" width="32" height="16" patternUnits="userSpaceOnUse">
      <path d="M0,14 L0,8 L6,8 L6,2 L14,2 L14,8 L10,8 L10,14 M16,2 L16,14 M18,14 L18,8 L24,8 L24,2 L32,2" fill="none" stroke={B} strokeWidth="1.5" opacity="0.5"/>
    </pattern></defs>
    <rect width="100%" height="16" fill="url(#gk)"/>
  </svg>);
}

async function callScript(params){
  try{
    const p=new URLSearchParams(params);
    await fetch(APPS_SCRIPT_URL+"?"+p.toString(),{method:"GET",mode:"no-cors"});
  }catch{}
}

async function fetchScript(params){
  try{
    const p=new URLSearchParams(params);
    const res=await fetch(APPS_SCRIPT_URL+"?"+p.toString(),{
      method:"GET",
      redirect:"follow"
    });
    const text=await res.text();
    return JSON.parse(text);
  }catch(err){
    console.error("fetchScript error:",err);
    return null;
  }
}

function AdminPanel({products,setProducts,pickupLocations,setPickupLocations,onClose}){
  const[tab,setTab]=useState("orders");
  const[orders,setOrders]=useState([]);
  const[loading,setLoading]=useState(false);
  const[stats,setStats]=useState(null);
  const[editing,setEditing]=useState(null);
  const[form,setForm]=useState({});

  useEffect(()=>{if(tab==="orders"||tab==="stats")loadOrders();},[tab]);

  async function loadOrders(){
    setLoading(true);
    const data=await fetchScript({action:"getOrders"});
    if(Array.isArray(data)){
      setOrders(data);
      calcStats(data);
    }
    setLoading(false);
  }

  function calcStats(data){
    const total=data.length;
    const revenue=data.filter(o=>["שולמה","נמסרה"].includes(o.status)).reduce((a,o)=>a+Number(o.total||0),0);
    const pending=data.filter(o=>o.status==="חדשה").length;
    const delivered=data.filter(o=>o.status==="נמסרה").length;
    const eventCounts={};
    data.forEach(o=>{if(o.event)eventCounts[o.event]=(eventCounts[o.event]||0)+1;});
    const topEvent=Object.entries(eventCounts).sort((a,b)=>b[1]-a[1])[0];
    setStats({total,revenue,pending,delivered,topEvent:topEvent?topEvent[0]:"-"});
  }

  async function updateStatus(rowId,status){
    if(status==="שולמה ונמסרה"||status==="בוטלה"){
      // עדכן ויזואלית בלבד, אל תמחק עדיין
      setOrders(prev=>prev.map(o=>o.rowId===rowId?{...o,status,pendingDelete:true}:o));
    } else {
      setOrders(prev=>prev.map(o=>o.rowId===rowId?{...o,status,pendingDelete:false}:o));
    }
    await callScript({action:"updateStatus",rowId,status});
  }

  async function confirmDelete(rowId){
    setOrders(prev=>prev.filter(o=>o.rowId!==rowId));
  }

  function openMapsRoute(){
    const addrs=orders.filter(o=>o.status==="חדשה"&&o.address&&o.address.trim()).map(o=>encodeURIComponent(o.address));
    if(!addrs.length){alert("אין הזמנות עם כתובות");return;}
    const url=`https://www.google.com/maps/dir/${addrs.join("/")}`;
    window.open(url,"_blank");
  }

  function exportCSV(){
    const h=["#","תאריך","שם","טלפון","מייל","אירוע","תאריך אירוע","חבילה","סה\"כ","משלוח","כתובת","סטטוס","הסכמה"];
    const rows=orders.map(o=>[o.rowId,o.timestamp,o.name,o.phone,o.email,o.event,o.date,o.pkg,o.total,o.delivery,o.address,o.status,o.consent]);
    const csv=[h,...rows].map(r=>r.map(v=>`"${v||""}"`).join(",")).join("\n");
    const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="הזמנות_opa.csv";a.click();
  }

  function exportMarketing(){
    const consented=orders.filter(o=>o.consent==="כן");
    if(!consented.length){alert("אין לקוחות שאישרו פרסומים");return;}
    const h=["שם","טלפון","מייל","אירוע","תאריך אירוע"];
    const rows=consented.map(o=>[o.name,o.phone,o.email,o.event,o.date]);
    const csv=[h,...rows].map(r=>r.map(v=>`"${v||""}"`).join(",")).join("\n");
    const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="לקוחות_פרסום_opa.csv";a.click();
  }

  async function sendTestEmail(){
    if(!confirm("לשלוח מייל בדיקה עכשיו?"))return;
    await callScript({action:"sendDigestNow"});
    alert("המייל נשלח! בדוק את תיבת הדואר שלך תוך דקה.");
  }

  function exportMarketing(){
    const consented=orders.filter(o=>o.consent==="כן");
    if(!consented.length){alert("אין לקוחות שאישרו פרסומים");return;}
    const h=["שם","טלפון","מייל","אירוע","תאריך אירוע"];
    const rows=consented.map(o=>[o.name,o.phone,o.email,o.event,o.date]);
    const csv=[h,...rows].map(r=>r.map(v=>`"${v||""}"`).join(",")).join("\n");
    const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="לקוחות_פרסום_opa.csv";a.click();
  }

  async function sendTestEmail(){
    if(!confirm("לשלוח מייל בדיקה עכשיו?"))return;
    await callScript({action:"sendDigestNow"});
    alert("המייל נשלח! בדוק את תיבת הדואר שלך.");
  }

  function startEdit(p){setEditing(p.id);setForm({...p});}
  function saveEdit(){setProducts(prev=>prev.map(p=>p.id===editing?{...form,price:Number(form.price),origPrice:Number(form.origPrice),boxes:form.boxes?Number(form.boxes):null,plates:form.plates?Number(form.plates):null}:p));setEditing(null);}
  function addProduct(){const p={id:`p_${Date.now()}`,name:"מוצר חדש",boxes:1,plates:35,price:280,origPrice:280,badge:null,emoji:"📦",highlight:false,freeShip:false};setProducts(prev=>[...prev,p]);setEditing(p.id);setForm(p);}
  const inp=(key,label,type="text")=>(<div style={{marginBottom:8}}><div style={{fontSize:11,color:MUT,marginBottom:3}}>{label}</div><input type={type} value={form[key]||""} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} style={{width:"100%",border:`1px solid ${BL}`,borderRadius:6,padding:"6px 10px",fontSize:13,direction:"rtl",boxSizing:"border-box"}}/></div>);

  const TABS=[{id:"orders",label:"📋 הזמנות"},{id:"stats",label:"📊 סטטיסטיקות"},{id:"products",label:"📦 מוצרים"},{id:"pickup",label:"📍 איסוף"}];

  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
    <div style={{background:W,borderRadius:16,width:"100%",maxWidth:560,maxHeight:"92vh",overflow:"hidden",display:"flex",flexDirection:"column",direction:"rtl"}}>
      <div style={{padding:"14px 18px",borderBottom:`1px solid ${BBG2}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:17,fontWeight:700,color:BD}}>⚙️ פאנל ניהול</div>
        <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:MUT}}>✕</button>
      </div>
      <div style={{display:"flex",borderBottom:`1px solid ${BBG2}`,overflowX:"auto"}}>
        {TABS.map(t=>(<button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"10px 4px",border:"none",background:"none",color:tab===t.id?B:MUT,fontWeight:tab===t.id?700:400,fontSize:11,cursor:"pointer",borderBottom:`2px solid ${tab===t.id?B:"transparent"}`,whiteSpace:"nowrap",fontFamily:"'Heebo',sans-serif"}}>{t.label}</button>))}
      </div>
      <div style={{overflowY:"auto",padding:"14px 16px",flex:1}}>

        {/* ORDERS */}
        {tab==="orders"&&(<div>
          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
            <button onClick={loadOrders} style={{background:BBG,border:`1px solid ${BL}`,borderRadius:7,padding:"6px 12px",fontSize:12,cursor:"pointer",color:B}}>🔄 רענן</button>
            <button onClick={exportCSV} style={{background:GREEN,color:W,border:"none",borderRadius:7,padding:"6px 12px",fontSize:12,cursor:"pointer",fontWeight:600}}>⬇️ כל ההזמנות</button>
            <button onClick={exportMarketing} style={{background:"#7B1FA2",color:W,border:"none",borderRadius:7,padding:"6px 12px",fontSize:12,cursor:"pointer",fontWeight:600}}>📧 לקוחות לפרסום</button>
            <button onClick={openMapsRoute} style={{background:"#E65100",color:W,border:"none",borderRadius:7,padding:"6px 12px",fontSize:12,cursor:"pointer",fontWeight:600}}>🗺️ מסלול משלוח</button>
            <button onClick={sendTestEmail} style={{background:"#1565C0",color:W,border:"none",borderRadius:7,padding:"6px 12px",fontSize:12,cursor:"pointer",fontWeight:600}}>📨 שלח מייל בדיקה</button>
          </div>
          {loading?<div style={{textAlign:"center",padding:30,color:MUT}}>טוען...</div>:
          orders.length===0?<div style={{textAlign:"center",padding:30,color:MUT}}>אין הזמנות עדיין</div>:
          orders.map((o,i)=>(<div key={i} style={{background:BBG,borderRadius:10,padding:12,marginBottom:10,border:`2px solid ${STATUS_COLORS[o.status]||B}30`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div>
                <div style={{fontWeight:700,color:TXT}}>{o.name} <span style={{fontSize:11,color:MUT}}>#{o.rowId}</span></div>
                <div style={{fontSize:12,color:MUT}}>{o.phone} | {o.email}</div>
                <div style={{fontSize:12,color:MUT}}>{o.event}{o.date?` | ${o.date}`:""}</div>
                <div style={{fontSize:12,color:B,fontWeight:600}}>{o.pkg} — ₪{o.total}</div>
                {o.address&&<div style={{fontSize:11,color:MUT}}>📍 {o.address}</div>}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                <select value={o.status||"חדשה"} onChange={e=>updateStatus(o.rowId,e.target.value)}
                  style={{background:STATUS_COLORS[o.status]||B,color:W,border:"none",borderRadius:8,padding:"5px 10px",fontSize:12,cursor:"pointer",fontFamily:"'Heebo',sans-serif"}}>
                  {ORDER_STATUSES.map(s=><option key={s} value={s} style={{background:W,color:TXT}}>{s}</option>)}
                </select>
                {o.pendingDelete&&(
                  <button onClick={()=>confirmDelete(o.rowId)}
                    style={{background:"#C62828",color:W,border:"none",borderRadius:7,padding:"5px 12px",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                    ✓ בצע ומחק
                  </button>
                )}
              </div>
            </div>
          </div>))}
        </div>)}

        {/* STATS */}
        {tab==="stats"&&(<div>
          <button onClick={loadOrders} style={{background:BBG,border:`1px solid ${BL}`,borderRadius:7,padding:"6px 12px",fontSize:12,cursor:"pointer",color:B,marginBottom:14}}>🔄 רענן</button>
          {stats?(<div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              {[["📋 סה\"כ הזמנות",stats.total,B],["💰 הכנסות",`₪${stats.revenue}`,GREEN],["🆕 חדשות",stats.pending,"#E65100"],["✅ נמסרו",stats.delivered,MUT]].map(([l,v,c])=>(
                <div key={l} style={{background:BBG,borderRadius:12,padding:"14px",textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:800,color:c}}>{v}</div>
                  <div style={{fontSize:11,color:MUT,marginTop:3}}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{background:BBG,borderRadius:12,padding:14,marginBottom:10}}>
              <div style={{fontSize:12,color:MUT,marginBottom:4}}>אירוע הכי פופולרי</div>
              <div style={{fontSize:18,fontWeight:700,color:B}}>🎉 {stats.topEvent}</div>
            </div>
            <div style={{background:BBG,borderRadius:12,padding:14}}>
              <div style={{fontSize:12,color:MUT,marginBottom:8}}>התפלגות סטטוסים</div>
              {ORDER_STATUSES.map(s=>{
                const count=orders.filter(o=>o.status===s).length;
                const pct=orders.length?Math.round(count/orders.length*100):0;
                return(<div key={s} style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:12,color:STATUS_COLORS[s]||B,fontWeight:600}}>{s}</span>
                    <span style={{fontSize:11,color:MUT}}>{count} ({pct}%)</span>
                  </div>
                  <div style={{height:6,background:"#ddd",borderRadius:3}}>
                    <div style={{height:"100%",width:`${pct}%`,background:STATUS_COLORS[s]||B,borderRadius:3,transition:"width 0.4s"}}/>
                  </div>
                </div>);
              })}
            </div>
          </div>):<div style={{textAlign:"center",padding:30,color:MUT}}>טוען...</div>}
        </div>)}

        {/* PRODUCTS */}
        {tab==="products"&&(<div>
          {products.map(p=>(<div key={p.id} style={{background:BBG,borderRadius:10,padding:12,marginBottom:10}}>
            {editing===p.id?(<div>
              {inp("name","שם חבילה")}{inp("price","מחיר ₪","number")}{inp("origPrice","מחיר מקורי ₪","number")}
              {inp("boxes","ארגזים","number")}{inp("plates","צלחות","number")}{inp("badge","Badge")}{inp("emoji","אימוג'י")}
              <div style={{display:"flex",gap:12,marginBottom:8}}>
                {[["freeShip","משלוח חינם"],["highlight","הכי נמכר"]].map(([k,l])=>(<label key={k} style={{fontSize:12,color:MUT,display:"flex",gap:6,alignItems:"center",cursor:"pointer"}}><input type="checkbox" checked={!!form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.checked}))}/>{l}</label>))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={saveEdit} style={{flex:1,background:B,color:W,border:"none",borderRadius:8,padding:9,fontWeight:700,cursor:"pointer"}}>שמור</button>
                <button onClick={()=>setEditing(null)} style={{flex:1,background:"none",border:`1px solid ${MUT}`,borderRadius:8,padding:9,cursor:"pointer",color:MUT}}>ביטול</button>
              </div>
            </div>):(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontWeight:600,color:TXT}}>{p.emoji} {p.name}</div><div style={{fontSize:12,color:MUT}}>₪{p.price} | {p.plates||"?"} צלחות</div></div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>startEdit(p)} style={{background:B,color:W,border:"none",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:12}}>ערוך</button>
                <button onClick={()=>setProducts(prev=>prev.filter(x=>x.id!==p.id))} style={{background:RED,color:W,border:"none",borderRadius:6,padding:"5px 8px",cursor:"pointer",fontSize:12}}>מחק</button>
              </div>
            </div>)}
          </div>))}
          <button onClick={addProduct} style={{width:"100%",background:GREEN,color:W,border:"none",borderRadius:10,padding:11,fontWeight:700,fontSize:14,cursor:"pointer"}}>+ הוסף מוצר</button>
        </div>)}

        {/* PICKUP */}
        {tab==="pickup"&&(<div>
          <div style={{fontSize:13,color:MUT,marginBottom:12}}>מקומות זמינים לאיסוף עצמי:</div>
          {pickupLocations.map((loc,idx)=>(<div key={idx} style={{display:"flex",gap:8,marginBottom:8}}>
            <input value={loc} onChange={e=>setPickupLocations(prev=>prev.map((l,i)=>i===idx?e.target.value:l))} style={{flex:1,border:`1px solid ${BL}`,borderRadius:7,padding:"8px 12px",fontSize:13,direction:"rtl"}}/>
            <button onClick={()=>setPickupLocations(prev=>prev.filter((_,i)=>i!==idx))} style={{background:RED,color:W,border:"none",borderRadius:7,padding:"0 12px",cursor:"pointer"}}>✕</button>
          </div>))}
          <button onClick={()=>setPickupLocations(prev=>[...prev,"מקום חדש"])} style={{width:"100%",background:B,color:W,border:"none",borderRadius:9,padding:10,fontWeight:700,cursor:"pointer",marginTop:6}}>+ הוסף מקום</button>
        </div>)}
      </div>
    </div>
  </div>);
}

export default function OpaLanding(){
  const[products,setProducts]=useState(DEFAULT_PRODUCTS);
  const[pickupLocations,setPickupLocations]=useState(DEFAULT_PICKUP);
  const[selectedPickupLocation,setSelectedPickupLocation]=useState("");
  const[selectedId,setSelectedId]=useState("box2");
  const[deliveryType,setDeliveryType]=useState("delivery");
  const[customBoxes,setCustomBoxes]=useState(4);
  const[form,setForm]=useState({name:"",phone:"",email:"",event:"",date:"",address:"",notes:""});
  const[consent,setConsent]=useState(true);
  const[submitted,setSubmitted]=useState(false);
  const[errors,setErrors]=useState({});
  const[showAdmin,setShowAdmin]=useState(false);
  const[adminInput,setAdminInput]=useState("");
  const[adminAuth,setAdminAuth]=useState(false);
  const[showAdminLogin,setShowAdminLogin]=useState(false);
  const[showCustomModal,setShowCustomModal]=useState(false);
  const orderRef=useRef(null);

  // Auto-fill from localStorage
  useEffect(()=>{
    const link=document.createElement("link");
    link.rel="stylesheet";link.href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Heebo:wght@300;400;500;600;700&display=swap";
    document.head.appendChild(link);
    try{
      const saved=JSON.parse(localStorage.getItem("opa_user")||"{}");
      if(saved.name)setForm(prev=>({...prev,name:saved.name||"",phone:saved.phone||"",email:saved.email||"",address:saved.address||""}));
    }catch{}
    return()=>document.head.removeChild(link);
  },[]);

  const selectedProduct=products.find(p=>p.id===selectedId);
  const isCustom=selectedId==="custom";
  const isFreeShip=isCustom||false;

  function getTotal(){
    if(!selectedProduct)return 0;
    if(isCustom)return customBoxes*240;
    let base=selectedProduct.price;
    if(!isFreeShip&&deliveryType==="delivery")base+=30;
    return base;
  }

  function getPkgName(){
    if(isCustom)return `${customBoxes} ארגזים (${customBoxes*35} צלחות) — מותאם אישית`;
    return`${selectedProduct?.name} — ${selectedProduct?.plates} צלחות`;
  }

  function getDeliveryStr(){
    if(isFreeShip)return "משלוח חינם 🎁";
    if(deliveryType==="delivery")return "משלוח (+₪30)";
    return`איסוף עצמי מ${selectedPickupLocation}`;
  }

  function scrollToOrder(){orderRef.current?.scrollIntoView({behavior:"smooth",block:"start"});}

  function validate(){
    const e={};
    if(!form.name.trim())e.name="שדה חובה";
    if(!form.phone.trim()||!/^[0-9]{9,10}$/.test(form.phone.replace(/\D/g,"")))e.phone="מספר לא תקין";
    if(!form.email.trim()||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))e.email="מייל לא תקין";
    if(!form.event)e.event="בחר סוג אירוע";
    if(!isFreeShip&&deliveryType==="delivery"&&!form.address.trim())e.address="שדה חובה למשלוח";
    if(!isFreeShip&&deliveryType==="pickup"&&!selectedPickupLocation)e.pickup="בחר מקום איסוף";
    setErrors(e);
    return Object.keys(e).length===0;
  }

  async function handleSubmit(){
    if(!validate())return;
    // Save to localStorage
    try{localStorage.setItem("opa_user",JSON.stringify({name:form.name,phone:form.phone,email:form.email,address:form.address}));}catch{}
    // Save to Sheets
    const data={
      action:"saveOrder",
      name:form.name,phone:form.phone,email:form.email,
      event:form.event,date:form.date,
      pkg:getPkgName(),total:String(getTotal()),
      delivery:getDeliveryStr(),
      address:form.address||selectedPickupLocation||"",
      notes:form.notes||"",
      consent:consent?"כן":"לא"
    };
    await callScript(data);
    setSubmitted(true);
  }

  function getDiscount(p){if(!p.origPrice||p.origPrice===p.price)return null;return Math.round((1-p.price/p.origPrice)*100);}

  // Mini package selector inside form
  function PackageSelector(){
    return(<div style={{marginBottom:18}}>
      <div style={{fontSize:13,fontWeight:600,color:BD,marginBottom:10}}>📦 החבילה שנבחרה — לחץ לשינוי:</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {products.map(p=>{
          const isSel=selectedId===p.id;
          return(<div key={p.id} onClick={()=>{if(p.custom)setShowCustomModal(true);else setSelectedId(p.id);}}
            style={{background:isSel?B+15:BBG,border:`2px solid ${isSel?B:BL+"40"}`,borderRadius:10,padding:"10px 10px",cursor:"pointer",textAlign:"center",transition:"all 0.2s"}}>
            <div style={{fontSize:16,marginBottom:2}}>{p.emoji}</div>
            <div style={{fontSize:12,fontWeight:700,color:isSel?BD:TXT}}>{p.name}</div>
            <div style={{fontSize:11,color:MUT}}>{p.custom?"4+ ארגזים":`${p.boxes} ארגז${p.boxes>1?"ים":""}|${p.plates} צלחות`}</div>
            <div style={{fontSize:13,fontWeight:800,color:isSel?BD:B}}>{p.custom?`₪${customBoxes*240}`:`₪${p.price}`}</div>
            {!p.custom&&<div style={{fontSize:10,color:MUT}}>₪{Math.round(p.price/p.boxes)}/ארגז</div>}
            {(p.freeShip||p.custom)&&<div style={{fontSize:9,color:GREEN,fontWeight:600}}>🎁 משלוח חינם</div>}
            {!p.custom&&<div style={{fontSize:10,color:MUT}}>₪{Math.round(p.price/p.boxes)}/ארגז</div>}
            {p.freeShip&&<div style={{fontSize:9,color:GREEN,fontWeight:600}}>🎁 משלוח חינם</div>}
            {p.custom&&<div style={{fontSize:9,color:GREEN,fontWeight:600}}>🎁 משלוח חינם</div>}
          </div>);
        })}
      </div>
      {isCustom&&(<div style={{marginTop:10}}>
        <div style={{fontSize:12,color:MUT,marginBottom:6}}>כמות ארגזים:</div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setCustomBoxes(Math.max(4,customBoxes-1))} style={{width:36,height:36,borderRadius:"50%",border:`2px solid ${B}`,background:BBG,color:B,fontSize:20,cursor:"pointer",fontWeight:700}}>-</button>
          <div style={{flex:1,textAlign:"center",fontSize:18,fontWeight:700,color:BD}}>{customBoxes} ארגזים = ₪{customBoxes*240}</div>
          <button onClick={()=>setCustomBoxes(customBoxes+1)} style={{width:36,height:36,borderRadius:"50%",border:`2px solid ${B}`,background:B,color:W,fontSize:20,cursor:"pointer",fontWeight:700}}>+</button>
        </div>
      </div>)}
    </div>);
  }

  const css=`
    @keyframes fadeInUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
    @keyframes shimmer{0%,100%{opacity:1}50%{opacity:0.5}}
    @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(21,101,192,0.4)}50%{box-shadow:0 0 0 12px rgba(21,101,192,0)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    *{box-sizing:border-box;margin:0;padding:0}
    input,select,textarea{outline:none}
    input:focus,select:focus,textarea:focus{border-color:${B}!important}
    .card:hover{transform:translateY(-3px);transition:all 0.2s}
    .btn-main:hover{background:${BD}!important;transform:scale(1.02)}
    .btn-wa:hover{background:#1b9e4b!important}
  `;

  return(<div style={{background:W,minHeight:"100vh",color:TXT,fontFamily:"'Heebo',sans-serif",direction:"rtl"}}>
    <style>{css}</style>

    {/* Admin login */}
    {showAdminLogin&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:W,borderRadius:14,padding:28,width:300,direction:"rtl"}}>
        <div style={{fontSize:16,fontWeight:700,marginBottom:16,color:BD}}>🔐 כניסת מנהל</div>
        <input type="password" placeholder="סיסמה" value={adminInput} onChange={e=>setAdminInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&(adminInput===ADMIN_PASSWORD?(setAdminAuth(true),setShowAdmin(true),setShowAdminLogin(false)):alert("שגוי"))}
          style={{width:"100%",border:`1.5px solid ${BL}`,borderRadius:8,padding:"9px 12px",fontSize:14,marginBottom:12}}/>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>adminInput===ADMIN_PASSWORD?(setAdminAuth(true),setShowAdmin(true),setShowAdminLogin(false)):alert("שגוי")}
            style={{flex:1,background:B,color:W,border:"none",borderRadius:8,padding:10,fontWeight:700,cursor:"pointer"}}>כניסה</button>
          <button onClick={()=>setShowAdminLogin(false)} style={{flex:1,background:"none",border:`1px solid ${MUT}`,borderRadius:8,padding:10,cursor:"pointer",color:MUT}}>ביטול</button>
        </div>
      </div>
    </div>)}

    {showAdmin&&adminAuth&&<AdminPanel products={products} setProducts={setProducts} pickupLocations={pickupLocations} setPickupLocations={setPickupLocations} onClose={()=>setShowAdmin(false)}/>}

    {/* Custom modal */}
    {showCustomModal&&(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:998,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:W,borderRadius:16,padding:28,width:"100%",maxWidth:360,direction:"rtl"}}>
        <div style={{fontSize:17,fontWeight:700,color:BD,marginBottom:6}}>💎 כמות מותאמת</div>
        <div style={{fontSize:13,color:MUT,marginBottom:16}}>₪240 לארגז • משלוח חינם</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
          {[4,5,6,7,8,9,10,12].map(n=>(<div key={n} onClick={()=>setCustomBoxes(n)} style={{background:customBoxes===n?B:BBG,color:customBoxes===n?W:TXT,border:`2px solid ${customBoxes===n?B:BL}30`,borderRadius:10,padding:"10px 0",textAlign:"center",cursor:"pointer",fontWeight:700,fontSize:15}}>{n}</div>))}
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,color:MUT,marginBottom:4}}>כמות אחרת:</div>
          <input type="number" min="4" value={customBoxes} onChange={e=>setCustomBoxes(Math.max(4,Number(e.target.value)))} style={{width:"100%",border:`1.5px solid ${BL}`,borderRadius:8,padding:"8px 12px",fontSize:14}}/>
        </div>
        <div style={{background:BBG,borderRadius:10,padding:"12px 16px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:13,color:TXT}}>{customBoxes} ארגזים | {customBoxes*35} צלחות</div>
            <div style={{fontSize:11,color:GREEN,fontWeight:600}}>🎁 משלוח חינם • 14% הנחה</div>
          </div>
          <div style={{fontSize:22,fontWeight:800,color:B}}>₪{customBoxes*240}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{setSelectedId("custom");setShowCustomModal(false);}} style={{flex:1,background:B,color:W,border:"none",borderRadius:10,padding:12,fontWeight:700,cursor:"pointer"}}>בחר</button>
          <button onClick={()=>setShowCustomModal(false)} style={{flex:1,background:"none",border:`1px solid ${MUT}`,borderRadius:10,padding:12,cursor:"pointer",color:MUT}}>ביטול</button>
        </div>
      </div>
    </div>)}

    {/* HERO */}
    <div style={{background:"linear-gradient(135deg, #003087 0%, #0055B3 35%, #1976D2 65%, #00ACC1 100%)",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 20px 40px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",backgroundSize:"28px 28px",pointerEvents:"none"}}/>
      <svg style={{position:"absolute",bottom:0,left:0,width:"100%",opacity:0.1}} viewBox="0 0 1440 120" preserveAspectRatio="none"><path d="M0,60 C240,110 480,10 720,60 C960,110 1200,10 1440,60 L1440,120 L0,120 Z" fill="white"/></svg>
      <div style={{position:"absolute",top:16,right:20,fontSize:24}}>🇬🇷 🇮🇱</div>
      <button onClick={()=>adminAuth?setShowAdmin(true):setShowAdminLogin(true)} style={{position:"absolute",top:16,left:16,background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",color:W,borderRadius:8,padding:"5px 12px",fontSize:11,cursor:"pointer"}}>⚙️ מנהל</button>

      <div style={{position:"relative",textAlign:"center",animation:"fadeInUp 0.8s ease"}}>
        <div style={{fontSize:12,letterSpacing:6,color:"rgba(255,255,255,0.7)",marginBottom:16}}>✦ ΑΜΠΕΛΟΣ HELLAS ✦</div>
        <div style={{width:170,height:170,margin:"0 auto 20px",borderRadius:"50%",overflow:"hidden",border:"3px solid rgba(255,255,255,0.6)",boxShadow:"0 0 50px rgba(255,255,255,0.25)",animation:"float 4s ease-in-out infinite",background:"#001a4d"}}>
          <video autoPlay loop muted playsInline preload="auto" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none";if(e.target.nextSibling)e.target.nextSibling.style.display="block"}}>
            <source src="https://res.cloudinary.com/drfbiuokx/video/upload/plate-shatter_whxoug.mp4" type="video/mp4"/>
          </video>
          <img src="https://res.cloudinary.com/drfbiuokx/image/upload/v1777910434/plate-broken_cq2dqn.jpg" alt="צלחת שבורה" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 30%",display:"none"}}/>
        </div>
        <h1 style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(72px,16vw,130px)",fontWeight:900,color:W,lineHeight:0.85,textShadow:"0 4px 30px rgba(0,0,0,0.3)",letterSpacing:"-2px"}}>!OPA</h1>
        <div style={{fontSize:"clamp(18px,4vw,26px)",color:"rgba(255,255,255,0.9)",fontWeight:300,marginTop:10,letterSpacing:2}}>צלחות יווניות לשבירה</div>
        <div style={{width:60,height:2,background:"rgba(255,255,255,0.5)",margin:"14px auto"}}/>
        <div style={{fontSize:15,color:"rgba(255,255,255,0.8)",maxWidth:340,margin:"0 auto 28px",lineHeight:1.9}}>תביאו את האווירה של יוון לאירוע שלכם<br/>חוויה שהאורחים לא ישכחו לעולם</div>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={scrollToOrder} className="btn-main" style={{background:W,color:B,border:"none",borderRadius:50,padding:"14px 32px",fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"'Heebo',sans-serif",transition:"all 0.2s",animation:"pulse 2.5s infinite"}}>📦 להזמנה ←</button>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="btn-wa" style={{background:"#25D366",color:W,borderRadius:50,padding:"14px 28px",fontSize:15,fontWeight:600,cursor:"pointer",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:8,transition:"all 0.2s"}}>💬 צור קשר בוואטסאפ (מענה אנושי)</a>
        </div>
        <div style={{display:"flex",gap:20,justifyContent:"center",marginTop:32,flexWrap:"wrap"}}>
          {[["🚚","משלוח עד בית הלקוח"],["🤝","איסוף עצמי"],["💳","תשלום עם קבלת המשלוח/איסוף עצמי"]].map(([icon,label])=>(<div key={label} style={{textAlign:"center"}}><div style={{fontSize:22,marginBottom:4}}>{icon}</div><div style={{fontSize:11,color:"rgba(255,255,255,0.75)"}}>{label}</div></div>))}
        </div>
      </div>
      <div style={{position:"absolute",bottom:20,left:"50%",transform:"translateX(-50%)",color:"rgba(255,255,255,0.5)",fontSize:20,animation:"shimmer 2s infinite"}}>↓</div>
    </div>

    <GreekBorder/>

    {/* WHY */}
    <div style={{padding:"60px 20px",background:BBG,textAlign:"center"}}>
      <div style={{maxWidth:680,margin:"0 auto"}}>
        <div style={{fontSize:11,letterSpacing:5,color:B,marginBottom:10}}>THE STORY</div>
        <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(22px,5vw,34px)",color:BD,marginBottom:16}}>למה לשבור צלחות?</h2>
        <div style={{width:50,height:3,background:B,margin:"0 auto 24px",borderRadius:2}}/>
        <div style={{background:W,borderRadius:16,padding:"24px 28px",marginBottom:28,textAlign:"right",boxShadow:"0 4px 20px rgba(21,101,192,0.08)",border:`1px solid ${BL}30`}}>
          <div style={{fontSize:28,marginBottom:10}}>🏛️</div>
          <div style={{fontSize:14,lineHeight:2,color:TXT}}>מסורת שבירת הצלחות ביוון נולדה לפני מאות שנים. ביוון העתיקה האמינו ששבירת חפצי חרס מרחיקה רוחות רעות ומזמינה מזל טוב. בטברנות היווניות המסורתיות, שבירת צלחת היא הדרך לומר <strong>"אופה!"</strong> — קריאת שמחה וחגיגה. 🎊</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:16}}>
          {[{icon:"🤩",title:"גימיק שיזכרו לנצח",text:'הרגע שכולם צועקים "אופה!" הוא ה-highlight של כל אירוע'},{icon:"🧿",title:"סמל מזל וברכה",text:"לפי המסורת היוונית — שבירת צלחת מביאה מזל טוב"},{icon:"📱",title:"תוכן ויראלי",text:"הצילום הכי משותף ברשתות"},{icon:"🫶",title:"אחדות ושמחה",text:"כולם ביחד — שוברים ושמחים כאחד"}].map(item=>(<div key={item.title} style={{background:W,borderRadius:14,padding:"20px 14px",border:`1px solid ${BL}30`}}><div style={{fontSize:30,marginBottom:8}}>{item.icon}</div><div style={{fontWeight:700,fontSize:13,color:BD,marginBottom:6}}>{item.title}</div><div style={{fontSize:12,color:MUT,lineHeight:1.7}}>{item.text}</div></div>))}
        </div>
      </div>
    </div>

    <GreekBorder/>

    {/* PRODUCTS */}
    <div style={{padding:"60px 20px",background:W}}>
      <div style={{maxWidth:640,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:11,letterSpacing:5,color:B,marginBottom:10}}>PACKAGES</div>
          <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(20px,5vw,30px)",color:BD,marginBottom:8}}>בחר את החבילה שלך</h2>
          <div style={{fontSize:13,color:MUT,marginBottom:10}}>כל ארגז מכיל 35 צלחות</div>
          <div style={{background:`linear-gradient(90deg,${GREEN},#43A047)`,color:W,borderRadius:50,padding:"6px 20px",fontSize:13,fontWeight:700,display:"inline-block"}}>🎁 4 ארגזים ומעלה — משלוח חינם (בין חדרה לבאר שבע)</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
          {products.map(p=>{
            const disc=getDiscount(p);const isSel=selectedId===p.id;
            return(<div key={p.id} className="card" onClick={()=>{if(p.custom)setShowCustomModal(true);else{setSelectedId(p.id);scrollToOrder();}}} style={{background:isSel?`linear-gradient(135deg,${BBG},${BBG2})`:BBG,border:`2px solid ${isSel?B:p.highlight?BL+"80":"rgba(21,101,192,0.15)"}`,borderRadius:16,padding:"18px 14px",cursor:"pointer",textAlign:"center",position:"relative",boxShadow:isSel?`0 4px 20px rgba(21,101,192,0.2)`:"none",transition:"all 0.25s"}}>
              {p.highlight&&<div style={{marginTop:6,background:RED,color:W,fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,display:"inline-block"}}>הכי נמכר ⭐</div>}
              {p.badge&&<div style={{position:"absolute",top:-10,right:"50%",transform:"translateX(50%)",background:p.freeShip?GREEN:B,color:W,fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,whiteSpace:"nowrap"}}>{p.badge}</div>}
              <div style={{fontSize:26,marginBottom:6}}>{p.emoji}</div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:14,fontWeight:700,color:isSel?BD:TXT,marginBottom:2}}>{p.name}</div>
              <div style={{fontSize:11,color:MUT,marginBottom:6}}>{p.custom?"4+ ארגזים | לחץ לבחירה":`${p.boxes} ${p.boxes===1?"ארגז":"ארגזים"} | ${p.plates} צלחות`}</div>
              {p.custom?(<div><div style={{fontSize:11,color:MUT,textDecoration:"line-through"}}>₪{p.origPrice}/ארגז</div><div style={{fontSize:22,fontWeight:800,color:B}}>₪{p.price}<span style={{fontSize:11}}>/ארגז</span></div>{disc&&<div style={{fontSize:10,background:GREEN,color:W,borderRadius:10,padding:"2px 8px",display:"inline-block",marginTop:3}}>{disc}% הנחה</div>}<div style={{fontSize:10,color:GREEN,fontWeight:600,marginTop:3}}>🎁 משלוח חינם</div></div>):(<div>{p.origPrice!==p.price&&<div style={{fontSize:11,color:MUT,textDecoration:"line-through"}}>₪{p.origPrice}</div>}<div style={{fontSize:24,fontWeight:800,color:B}}>₪{p.price}</div><div style={{fontSize:10,color:MUT,marginTop:2}}>₪{Math.round(p.price/p.boxes)}/ארגז</div>{disc&&<div style={{fontSize:10,background:GREEN,color:W,borderRadius:10,padding:"2px 8px",display:"inline-block",marginTop:3}}>{disc}% הנחה</div>}</div>)}
            </div>);
          })}
        </div>

        {selectedProduct&&!isFreeShip&&!isCustom&&(<div style={{background:BBG,borderRadius:14,padding:16,marginBottom:14,border:`1px solid ${BL}40`}}>
          <div style={{fontSize:14,fontWeight:600,color:BD,marginBottom:12}}>🚚 בחר אפשרות אספקה:</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[["delivery","🚚","משלוח עד הבית","(+₪30)"],["pickup","🤝","איסוף עצמי","(חינם)"]].map(([val,icon,label,note])=>(<div key={val} onClick={()=>setDeliveryType(val)} style={{background:deliveryType===val?W:BBG2,border:`2px solid ${deliveryType===val?B:BL+"50"}`,borderRadius:10,padding:"12px 10px",textAlign:"center",cursor:"pointer"}}><div style={{fontSize:22,marginBottom:4}}>{icon}</div><div style={{fontSize:13,fontWeight:700,color:deliveryType===val?BD:TXT}}>{label}</div><div style={{fontSize:11,color:deliveryType===val?B:MUT}}>{note}</div></div>))}
          </div>
        </div>)}

        {deliveryType==="pickup"&&!isFreeShip&&(<div style={{background:BBG,borderRadius:14,padding:16,marginBottom:14,border:`1px solid ${BL}40`}}>
          <div style={{fontSize:13,fontWeight:600,color:BD,marginBottom:10}}>📍 בחר מקום איסוף:</div>
          <select value={selectedPickupLocation} onChange={e=>setSelectedPickupLocation(e.target.value)} style={{width:"100%",background:W,border:`1.5px solid ${errors.pickup?"#C62828":BL}`,borderRadius:9,padding:"10px 13px",color:selectedPickupLocation?TXT:MUT,fontSize:14,fontFamily:"'Heebo',sans-serif",direction:"rtl"}}>
            <option value="" disabled>בחר עיר...</option>
            {pickupLocations.map((loc,i)=><option key={i} value={loc}>{loc}</option>)}
          </select>
          {errors.pickup&&<div style={{fontSize:11,color:RED,marginTop:4}}>{errors.pickup}</div>}
        </div>)}

        {isFreeShip&&selectedProduct&&(<div style={{background:"#E8F5E9",border:`1px solid ${GREEN}40`,borderRadius:12,padding:"10px 16px",marginBottom:14,textAlign:"center",color:GREEN,fontWeight:600,fontSize:13}}>🎁 כולל משלוח חינם עד הבית (בין חדרה לבאר שבע)</div>)}
      </div>
    </div>

    <GreekBorder/>

    {/* HOW */}
    <div style={{padding:"50px 20px",background:BBG,textAlign:"center"}}>
      <div style={{maxWidth:500,margin:"0 auto"}}>
        <div style={{fontSize:11,letterSpacing:5,color:B,marginBottom:10}}>HOW IT WORKS</div>
        <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(18px,4vw,26px)",color:BD,marginBottom:32}}>איך זה עובד?</h2>
        {[{n:"01",title:"בחרו חבילה",text:"בחרו את הכמות המתאימה לאירוע שלכם ומלאו טופס הזמנה"},{n:"02",title:"בוחרים משלוח עד הבית או איסוף עצמי",text:"עלות משלוח — ₪30 (באר שבע-חדרה). בכל הזמנה של 4 ארגזים ומעלה משלוח חינם. ניתן לאסוף מהרצליה, מודיעין, שדרות, צור משה"},{n:"03",title:"קבלת המשלוח ותשלום",text:"המשלוח אצלכם עד 5 ימי עסקים. עם קבלת המשלוח או האיסוף העצמי יתבצע התשלום 💳"}].map((step,i)=>(<div key={step.n} style={{display:"flex",gap:14,alignItems:"flex-start",textAlign:"right",marginBottom:i<2?24:0}}>
          <div style={{width:42,height:42,borderRadius:"50%",background:B,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cinzel',serif",fontSize:13,color:W,flexShrink:0,fontWeight:700}}>{step.n}</div>
          <div><div style={{fontWeight:700,color:BD,fontSize:14,marginBottom:4}}>{step.title}</div><div style={{fontSize:13,color:MUT,lineHeight:1.7}}>{step.text}</div></div>
        </div>))}
      </div>
    </div>

    <GreekBorder/>

    {/* EVENTS */}
    <div style={{padding:"50px 20px",background:W,textAlign:"center"}}>
      <div style={{maxWidth:500,margin:"0 auto"}}>
        <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(18px,4vw,26px)",color:BD,marginBottom:24}}>מתאים לכל אירוע 🎊</h2>
        <div style={{display:"flex",flexWrap:"wrap",gap:10,justifyContent:"center"}}>
          {["בר מצווה 🎺","בת מצווה 👑","חתונה 💍","אירוסין 💫","יום הולדת 🎂","רווקות 🥂","אירוע חברה 🤝","מסיבה פרטית 🎶"].map(ev=>(<div key={ev} style={{background:BBG,border:`1px solid ${BL}40`,borderRadius:50,padding:"8px 18px",fontSize:13,color:TXT}}>{ev}</div>))}
        </div>
      </div>
    </div>

    <GreekBorder/>

    {/* ORDER FORM */}
    <div ref={orderRef} style={{padding:"60px 20px",background:BBG}}>
      <div style={{maxWidth:480,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:11,letterSpacing:5,color:B,marginBottom:10}}>ORDER NOW</div>
          <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(20px,5vw,30px)",color:BD,marginBottom:6}}>הזמינו עכשיו</h2>
          <div style={{fontSize:15,color:MUT}}>מלאו את הטופס ונצור אתכם קשר בהקדם</div>
        </div>

        {submitted?(<div style={{background:W,border:`2px solid ${B}`,borderRadius:20,padding:40,textAlign:"center"}}>
          <div style={{fontSize:52,marginBottom:12}}>🎉</div>
          <h3 style={{fontFamily:"'Cinzel',serif",color:BD,fontSize:22,marginBottom:8}}>!OPA</h3>
          <div style={{color:TXT,fontSize:17,lineHeight:2,fontWeight:600}}>ההזמנה שלכם התקבלה! 🎉<br/><span style={{color:MUT,fontSize:14,fontWeight:400}}>ניצור קשר ביום העסקים הקרוב לתיאום משלוח</span></div>
          <button onClick={()=>setSubmitted(false)} style={{marginTop:16,background:"none",border:`1px solid ${B}`,color:B,borderRadius:50,padding:"8px 22px",cursor:"pointer",fontSize:13}}>הזמנה נוספת</button>
        </div>):(
        <div style={{background:W,borderRadius:20,padding:"28px 22px",border:`1px solid ${BL}40`,boxShadow:"0 4px 20px rgba(21,101,192,0.08)"}}>
          <PackageSelector/>

          {!isFreeShip&&!isCustom&&(<div style={{background:BBG,borderRadius:12,padding:14,marginBottom:16,border:`1px solid ${BL}40`}}>
            <div style={{fontSize:13,fontWeight:600,color:BD,marginBottom:10}}>🚚 אפשרות אספקה:</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["delivery","🚚","משלוח עד הבית (בין חדרה-באר שבע) (+₪30)"],["pickup","🤝","איסוף עצמי (חינם)"]].map(([val,icon,label])=>(<div key={val} onClick={()=>setDeliveryType(val)} style={{background:deliveryType===val?B:BBG2,color:deliveryType===val?W:TXT,border:`2px solid ${deliveryType===val?B:BL+"40"}`,borderRadius:9,padding:"10px",textAlign:"center",cursor:"pointer",fontSize:13,fontWeight:deliveryType===val?700:400}}>{icon} {label}</div>))}
            </div>
            {deliveryType==="pickup"&&(<div style={{marginTop:10}}>
              <select value={selectedPickupLocation} onChange={e=>setSelectedPickupLocation(e.target.value)} style={{width:"100%",background:W,border:`1.5px solid ${errors.pickup?RED:BL}`,borderRadius:9,padding:"10px 13px",color:selectedPickupLocation?TXT:MUT,fontSize:14,fontFamily:"'Heebo',sans-serif",direction:"rtl",marginTop:6}}>
                <option value="" disabled>בחר עיר...</option>
                {pickupLocations.map((loc,i)=><option key={i} value={loc}>{loc}</option>)}
              </select>
              {errors.pickup&&<div style={{fontSize:11,color:RED,marginTop:4}}>{errors.pickup}</div>}
            </div>)}
          </div>)}

          {/* Summary */}
          <div style={{background:BBG,borderRadius:12,padding:"10px 14px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center",border:`1px solid ${BL}40`}}>
            <div><div style={{fontSize:12,color:MUT}}>סה"כ לתשלום</div><div style={{fontSize:11,color:MUT}}>{getDeliveryStr()}</div></div>
            <div style={{fontSize:28,fontWeight:800,color:B}}>₪{getTotal()}</div>
          </div>

          {[{label:"שם מלא *",key:"name",type:"text",placeholder:"ישראל ישראלי"},{label:"טלפון *",key:"phone",type:"tel",placeholder:"050-0000000"},{label:"כתובת מייל *",key:"email",type:"email",placeholder:"israel@email.com"}].map(f=>(<div key={f.key} style={{marginBottom:13}}>
            <label style={{fontSize:14,color:MUT,display:"block",marginBottom:6}}>{f.label}</label>
            <input type={f.type} value={form[f.key]} placeholder={f.placeholder} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} style={{width:"100%",background:"#F8FBFF",border:`1.5px solid ${errors[f.key]?RED:BL+"60"}`,borderRadius:9,padding:"10px 13px",color:TXT,fontSize:15,fontFamily:"'Heebo',sans-serif",direction:"rtl"}}/>
            {errors[f.key]&&<div style={{fontSize:11,color:RED,marginTop:3}}>{errors[f.key]}</div>}
          </div>))}

          {(!isFreeShip&&deliveryType==="delivery")||(isFreeShip)?(<div style={{marginBottom:13}}>
            <label style={{fontSize:14,color:MUT,display:"block",marginBottom:6}}>{!isFreeShip&&deliveryType==="delivery"?"כתובת למשלוח *":"כתובת למשלוח"}</label>
            <input type="text" value={form.address} placeholder="רחוב, עיר" onChange={e=>setForm(p=>({...p,address:e.target.value}))} style={{width:"100%",background:"#F8FBFF",border:`1.5px solid ${errors.address?RED:BL+"60"}`,borderRadius:9,padding:"10px 13px",color:TXT,fontSize:15,fontFamily:"'Heebo',sans-serif",direction:"rtl"}}/>
            {errors.address&&<div style={{fontSize:11,color:RED,marginTop:3}}>{errors.address}</div>}
          </div>):null}

          <div style={{marginBottom:13}}>
            <label style={{fontSize:14,color:MUT,display:"block",marginBottom:6}}>סוג אירוע *</label>
            <select value={form.event} onChange={e=>setForm(p=>({...p,event:e.target.value}))} style={{width:"100%",background:"#F8FBFF",border:`1.5px solid ${errors.event?RED:BL+"60"}`,borderRadius:9,padding:"10px 13px",color:form.event?TXT:MUT,fontSize:15,fontFamily:"'Heebo',sans-serif",direction:"rtl"}}>
              <option value="" disabled>בחר...</option>
              {EVENT_TYPES.map(e=><option key={e} value={e}>{e}</option>)}
            </select>
            {errors.event&&<div style={{fontSize:11,color:RED,marginTop:3}}>{errors.event}</div>}
          </div>

          <div style={{marginBottom:13}}>
            <label style={{fontSize:14,color:MUT,display:"block",marginBottom:6}}>תאריך האירוע</label>
            <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} style={{width:"100%",background:"#F8FBFF",border:`1.5px solid ${BL}60`,borderRadius:9,padding:"10px 13px",color:TXT,fontSize:14,fontFamily:"'Heebo',sans-serif"}}/>
          </div>

          <div style={{marginBottom:18}}>
            <label style={{fontSize:14,color:MUT,display:"block",marginBottom:6}}>הערות</label>
            <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} rows={2} placeholder="שאלות, בקשות מיוחדות..." style={{width:"100%",background:"#F8FBFF",border:`1.5px solid ${BL}60`,borderRadius:9,padding:"10px 13px",color:TXT,fontSize:14,fontFamily:"'Heebo',sans-serif",resize:"vertical",direction:"rtl"}}/>
          </div>

          <div style={{background:BBG,borderRadius:10,padding:"12px 14px",marginBottom:18,border:`1px solid ${BL}30`}}>
            <label style={{display:"flex",gap:10,alignItems:"flex-start",cursor:"pointer"}}>
              <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} style={{width:18,height:18,marginTop:2,cursor:"pointer",accentColor:B,flexShrink:0}}/>
              <span style={{fontSize:14,color:MUT,lineHeight:1.8}}>אני מסכים/ה שפרטיי ישמשו לקבלת הטבות ומבצעים ממוכר זה בלבד</span>
            </label>
          </div>

          <button onClick={handleSubmit} className="btn-main" style={{width:"100%",background:B,color:W,border:"none",borderRadius:12,padding:15,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"'Heebo',sans-serif",transition:"all 0.2s"}}>
            ✅ שליחת הזמנה
          </button>
          <div style={{textAlign:"center",fontSize:13,color:MUT,marginTop:8}}>ניצור קשר ביום העסקים הקרוב לתיאום משלוח</div>
        </div>)}
      </div>
    </div>

    <GreekBorder/>
    <div style={{padding:"28px 20px",background:BD,textAlign:"center"}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:20,color:W,marginBottom:5}}>OPA! 🏛️</div>
      <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",marginBottom:14}}>צלחות יווניות לשבירה • משלוח לכל הארץ</div>
      <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:8,background:"#25D366",color:W,borderRadius:50,padding:"10px 22px",fontSize:14,fontWeight:600,textDecoration:"none"}}>💬 צור קשר בוואטסאפ (מענה אנושי)</a>
    </div>
  </div>);
}
