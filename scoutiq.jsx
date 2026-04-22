import { useState, useMemo, useEffect, useRef, useCallback } from "react";

const ATHLETES = [
  { id:"a1", name:"Arjun Mehta", sport:"Football", position:"Striker", age:22, nationality:"🇮🇳 India", height:"5'11\"", weight:"74 kg", experience:4, stats:{Speed:88,Stamina:82,Accuracy:91,Strength:76,Agility:85} },
  { id:"a2", name:"Carlos Rivera", sport:"Football", position:"Midfielder", age:24, nationality:"🇦🇷 Argentina", height:"5'9\"", weight:"71 kg", experience:6, stats:{Speed:79,Stamina:90,Accuracy:84,Strength:70,Agility:88} },
  { id:"a3", name:"Luca Bianchi", sport:"Football", position:"Goalkeeper", age:26, nationality:"🇮🇹 Italy", height:"6'2\"", weight:"84 kg", experience:8, stats:{Speed:65,Stamina:78,Accuracy:87,Strength:85,Agility:80} },
  { id:"a4", name:"Kwame Asante", sport:"Football", position:"Defender", age:21, nationality:"🇬🇭 Ghana", height:"6'0\"", weight:"80 kg", experience:3, stats:{Speed:83,Stamina:85,Accuracy:72,Strength:90,Agility:79} },
  { id:"a5", name:"Hiroshi Tanaka", sport:"Football", position:"Winger", age:20, nationality:"🇯🇵 Japan", height:"5'8\"", weight:"67 kg", experience:2, stats:{Speed:94,Stamina:76,Accuracy:80,Strength:65,Agility:92} },
  { id:"b1", name:"Marcus Johnson", sport:"Basketball", position:"Point Guard", age:23, nationality:"🇺🇸 USA", height:"6'1\"", weight:"82 kg", experience:5, stats:{Speed:90,Stamina:85,Accuracy:88,Strength:72,Agility:93} },
  { id:"b2", name:"Dmitri Volkov", sport:"Basketball", position:"Center", age:25, nationality:"🇷🇺 Russia", height:"7'0\"", weight:"113 kg", experience:7, stats:{Speed:62,Stamina:80,Accuracy:75,Strength:96,Agility:68} },
  { id:"b3", name:"Priya Nair", sport:"Basketball", position:"Shooting Guard", age:22, nationality:"🇮🇳 India", height:"5'10\"", weight:"68 kg", experience:4, stats:{Speed:86,Stamina:82,Accuracy:92,Strength:68,Agility:87} },
  { id:"b4", name:"Elijah Brooks", sport:"Basketball", position:"Small Forward", age:24, nationality:"🇨🇦 Canada", height:"6'7\"", weight:"100 kg", experience:6, stats:{Speed:80,Stamina:88,Accuracy:83,Strength:86,Agility:81} },
  { id:"b5", name:"Yusuf Al-Rashid", sport:"Basketball", position:"Power Forward", age:27, nationality:"🇯🇴 Jordan", height:"6'9\"", weight:"106 kg", experience:9, stats:{Speed:70,Stamina:84,Accuracy:78,Strength:93,Agility:74} },
  { id:"t1", name:"Sofia Andersen", sport:"Tennis", position:"Singles", age:19, nationality:"🇩🇰 Denmark", height:"5'9\"", weight:"63 kg", experience:3, stats:{Speed:87,Stamina:83,Accuracy:91,Strength:72,Agility:89} },
  { id:"t2", name:"Rafael Montoya", sport:"Tennis", position:"Singles", age:25, nationality:"🇪🇸 Spain", height:"6'1\"", weight:"80 kg", experience:7, stats:{Speed:82,Stamina:91,Accuracy:88,Strength:78,Agility:84} },
  { id:"t3", name:"Aiko Yamamoto", sport:"Tennis", position:"Doubles", age:23, nationality:"🇯🇵 Japan", height:"5'7\"", weight:"60 kg", experience:5, stats:{Speed:85,Stamina:80,Accuracy:86,Strength:65,Agility:91} },
  { id:"t4", name:"Brendan O'Neil", sport:"Tennis", position:"Singles", age:28, nationality:"🇦🇺 Australia", height:"6'3\"", weight:"87 kg", experience:10, stats:{Speed:75,Stamina:89,Accuracy:93,Strength:83,Agility:77} },
  { id:"t5", name:"Amara Diallo", sport:"Tennis", position:"Doubles", age:21, nationality:"🇸🇳 Senegal", height:"5'11\"", weight:"67 kg", experience:3, stats:{Speed:91,Stamina:79,Accuracy:84,Strength:70,Agility:90} },
];

const deriveScore = (stats) => Math.round(Object.values(stats).reduce((a,b)=>a+b,0)/Object.values(stats).length);
const ATHLETES_WITH_SCORE = ATHLETES.map(a=>({...a, score: deriveScore(a.stats)}));

const SPORT_CONFIG = {
  Football:   { color:"#22c55e", dim:"rgba(34,197,94,0.12)",  emoji:"⚽" },
  Basketball: { color:"#f97316", dim:"rgba(249,115,22,0.12)", emoji:"🏀" },
  Tennis:     { color:"#a855f7", dim:"rgba(168,85,247,0.12)", emoji:"🎾" },
};

function scoreColor(s) {
  if (s>=75) return "#00d4ff";
  if (s>=50) return "#f59e0b";
  return "#ef4444";
}

function useDebounce(val, delay=300) {
  const [d,setD] = useState(val);
  useEffect(()=>{
    const t = setTimeout(()=>setD(val), delay);
    return ()=>clearTimeout(t);
  },[val,delay]);
  return d;
}

function useShortlist() {
  const KEY = "scoutiq_shortlist";
  const [list, setList] = useState(()=>{
    try { return JSON.parse(localStorage.getItem(KEY)||"[]"); } catch { return []; }
  });
  const save = (next) => { setList(next); localStorage.setItem(KEY, JSON.stringify(next)); };
  const add = (a) => save(list.find(x=>x.id===a.id) ? list : [...list,a]);
  const remove = (id) => save(list.filter(x=>x.id!==id));
  const has = (id) => list.some(x=>x.id===id);
  const avg = list.length ? Math.round(list.reduce((s,a)=>s+a.score,0)/list.length) : 0;
  return { list, add, remove, has, avg };
}

// Animated stat bar
function StatBar({ label, value, delay=0 }) {
  const [w, setW] = useState(0);
  useEffect(()=>{ const t=setTimeout(()=>setW(value),50+delay); return()=>clearTimeout(t); },[value,delay]);
  const c = scoreColor(value);
  return (
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{color:"#94a3b8",fontSize:11,fontWeight:600,letterSpacing:"0.8px",textTransform:"uppercase",fontFamily:"'DM Mono',monospace"}}>{label}</span>
        <span style={{color:c,fontSize:12,fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{value}</span>
      </div>
      <div style={{height:6,background:"#1e293b",borderRadius:99,overflow:"hidden"}}>
        <div style={{height:6,borderRadius:99,background:c,width:`${w}%`,transition:"width 0.7s cubic-bezier(.4,0,.2,1)",boxShadow:`0 0 8px ${c}88`}}/>
      </div>
    </div>
  );
}

function ReadinessRing({ score }) {
  const c = scoreColor(score);
  const r = 40, circ = 2*Math.PI*r;
  const [dash, setDash] = useState(circ);
  useEffect(()=>{ const t=setTimeout(()=>setDash(circ*(1-score/100)),100); return()=>clearTimeout(t); },[score]);
  return (
    <div style={{position:"relative",width:100,height:100,flexShrink:0}}>
      <svg width="100" height="100" style={{transform:"rotate(-90deg)"}}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1e293b" strokeWidth="8"/>
        <circle cx="50" cy="50" r={r} fill="none" stroke={c} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={dash}
          strokeLinecap="round"
          style={{transition:"stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)",filter:`drop-shadow(0 0 6px ${c})`}}
        />
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span style={{color:c,fontSize:22,fontWeight:900,lineHeight:1,fontFamily:"'DM Mono',monospace"}}>{score}</span>
        <span style={{color:"#475569",fontSize:9,letterSpacing:"1px",fontWeight:600}}>SCORE</span>
      </div>
    </div>
  );
}

// Athlete Card
function AthleteCard({ athlete, onPress, shortlisted }) {
  const sc = SPORT_CONFIG[athlete.sport];
  const sc2 = scoreColor(athlete.score);
  return (
    <div onClick={()=>onPress(athlete)} style={{
      display:"flex",alignItems:"center",gap:12,
      background:"#111827",border:`1px solid #1e293b`,borderRadius:14,
      padding:"12px 14px",cursor:"pointer",position:"relative",overflow:"hidden",
      transition:"transform 0.15s,border-color 0.15s,box-shadow 0.15s",
    }}
    onMouseEnter={e=>{e.currentTarget.style.borderColor=sc.color;e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow=`0 4px 20px ${sc.color}22`;}}
    onMouseLeave={e=>{e.currentTarget.style.borderColor="#1e293b";e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}
    >
      {/* Left accent */}
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:sc.color,borderRadius:"14px 0 0 14px"}}/>
      {/* Avatar */}
      <div style={{width:46,height:46,borderRadius:"50%",background:sc.dim,border:`1.5px solid ${sc.color}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:4}}>
        <span style={{color:sc.color,fontSize:13,fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{athlete.name.split(" ").map(w=>w[0]).join("").slice(0,2)}</span>
      </div>
      {/* Info */}
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{color:"#f1f5f9",fontSize:14,fontWeight:700,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{athlete.name}</span>
          {shortlisted && <span style={{fontSize:10,background:"rgba(250,204,21,.15)",color:"#facc15",padding:"1px 5px",borderRadius:4}}>★</span>}
        </div>
        <div style={{color:"#64748b",fontSize:11,marginTop:2}}>{athlete.position}</div>
        <div style={{display:"flex",gap:8,marginTop:5,alignItems:"center"}}>
          <span style={{background:sc.dim,color:sc.color,fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,letterSpacing:"0.4px"}}>{sc.emoji} {athlete.sport}</span>
          <span style={{color:"#475569",fontSize:10}}>Age {athlete.age}</span>
        </div>
      </div>
      {/* Score */}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
        <div style={{width:42,height:42,borderRadius:"50%",border:`2px solid ${sc2}`,background:"#0a0e1a",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{color:sc2,fontSize:14,fontWeight:800,fontFamily:"'DM Mono',monospace"}}>{athlete.score}</span>
        </div>
        <span style={{color:"#475569",fontSize:8,fontWeight:600,letterSpacing:"1px",marginTop:3}}>SCORE</span>
      </div>
    </div>
  );
}

// Profile Screen
function ProfileScreen({ athlete, shortlist, onBack }) {
  const { add, remove, has } = shortlist;
  const isIn = has(athlete.id);
  const sc = SPORT_CONFIG[athlete.sport];
  const [animate, setAnimate] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setAnimate(true),50); return()=>clearTimeout(t); },[]);

  return (
    <div style={{height:"100%",overflowY:"auto",background:"#0a0e1a"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 16px 12px",borderBottom:"1px solid #1e293b",position:"sticky",top:0,background:"#0a0e1aee",backdropFilter:"blur(10px)",zIndex:10}}>
        <button onClick={onBack} style={{background:"#1e293b",border:"none",color:"#94a3b8",width:36,height:36,borderRadius:10,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>←</button>
        <span style={{color:"#f1f5f9",fontSize:16,fontWeight:700,flex:1}}>Athlete Profile</span>
        <div style={{background:sc.dim,border:`1px solid ${sc.color}`,padding:"3px 10px",borderRadius:99}}>
          <span style={{color:sc.color,fontSize:11,fontWeight:600}}>{sc.emoji} {athlete.sport}</span>
        </div>
      </div>

      <div style={{padding:"20px 16px",display:"flex",flexDirection:"column",gap:20}}>
        {/* Hero */}
        <div style={{display:"flex",alignItems:"center",gap:16,opacity:animate?1:0,transform:animate?"none":"translateY(10px)",transition:"all 0.4s"}}>
          <div style={{width:72,height:72,borderRadius:"50%",background:sc.dim,border:`2px solid ${sc.color}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{color:sc.color,fontSize:22,fontWeight:800,fontFamily:"'DM Mono',monospace"}}>{athlete.name.split(" ").map(w=>w[0]).join("").slice(0,2)}</span>
          </div>
          <div>
            <div style={{color:"#f1f5f9",fontSize:20,fontWeight:800,letterSpacing:"-0.3px"}}>{athlete.name}</div>
            <div style={{color:"#64748b",fontSize:13,marginTop:3}}>{athlete.position} · {athlete.nationality}</div>
          </div>
        </div>

        {/* Readiness */}
        <div style={{background:"#111827",border:"1px solid #1e293b",borderRadius:14,padding:16,opacity:animate?1:0,transition:"all 0.4s 0.1s"}}>
          <div style={{color:"#475569",fontSize:10,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:14}}>Readiness Score</div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <ReadinessRing score={athlete.score}/>
            <div>
              <div style={{color:"#f1f5f9",fontSize:13,fontWeight:600,marginBottom:4}}>
                {athlete.score>=80?"🔥 Elite Prospect":athlete.score>=60?"⚡ Strong Candidate":"📈 Developing Talent"}
              </div>
              <div style={{color:"#475569",fontSize:11,lineHeight:1.5}}>
                Based on avg of 5 performance metrics
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{opacity:animate?1:0,transition:"all 0.4s 0.15s"}}>
          <div style={{color:"#475569",fontSize:10,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:10}}>Profile</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            {[["Age",`${athlete.age} yrs`],["Height",athlete.height],["Weight",athlete.weight],["Experience",`${athlete.experience} yrs`],["Nationality",athlete.nationality.split(" ")[1]]].map(([l,v])=>(
              <div key={l} style={{background:"#111827",border:"1px solid #1e293b",borderRadius:10,padding:"10px 12px"}}>
                <div style={{color:"#475569",fontSize:9,fontWeight:600,letterSpacing:"0.8px",textTransform:"uppercase",marginBottom:4}}>{l}</div>
                <div style={{color:"#f1f5f9",fontSize:12,fontWeight:700}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div style={{background:"#111827",border:"1px solid #1e293b",borderRadius:14,padding:16,opacity:animate?1:0,transition:"all 0.4s 0.2s"}}>
          <div style={{color:"#475569",fontSize:10,fontWeight:700,letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:14}}>Performance Stats</div>
          {Object.entries(athlete.stats).map(([k,v],i)=>(
            <StatBar key={k} label={k} value={v} delay={i*80}/>
          ))}
        </div>

        {/* Shortlist Button */}
        <button onClick={()=>isIn?remove(athlete.id):add(athlete)} style={{
          width:"100%",padding:"15px",borderRadius:14,border:`1.5px solid ${isIn?"#ef4444":"#00d4ff"}`,
          background:isIn?"rgba(239,68,68,.1)":"rgba(0,212,255,.08)",
          color:"#f1f5f9",fontSize:15,fontWeight:700,cursor:"pointer",
          transition:"all 0.2s",letterSpacing:"0.3px",
          opacity:animate?1:0,
        }}
        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.01)"}
        onMouseLeave={e=>e.currentTarget.style.transform=""}
        >
          {isIn?"★  Remove from Shortlist":"☆  Add to Shortlist"}
        </button>
      </div>
    </div>
  );
}

// Shortlist Screen
function ShortlistScreen({ shortlist }) {
  const { list, remove, avg } = shortlist;
  const top = list.length ? Math.max(...list.map(a=>a.score)) : 0;

  if (!list.length) return (
    <div style={{height:"100%",background:"#0a0e1a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32}}>
      <div style={{fontSize:52,marginBottom:16}}>📋</div>
      <div style={{color:"#f1f5f9",fontSize:18,fontWeight:700,marginBottom:8}}>Shortlist is Empty</div>
      <div style={{color:"#64748b",fontSize:13,textAlign:"center",lineHeight:1.6}}>Browse athletes in Discover and tap "Add to Shortlist" to save them here.</div>
    </div>
  );

  return (
    <div style={{height:"100%",overflowY:"auto",background:"#0a0e1a"}}>
      <div style={{padding:"20px 16px 0"}}>
        <div style={{color:"#f1f5f9",fontSize:24,fontWeight:800,letterSpacing:"-0.5px"}}>Shortlist</div>
        <div style={{color:"#475569",fontSize:11,marginTop:2,letterSpacing:"0.5px"}}>Trial Candidates</div>

        {/* Stats row */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:1,background:"#1e293b",borderRadius:14,overflow:"hidden",margin:"16px 0",border:"1px solid #1e293b"}}>
          {[["Shortlisted",list.length,"#f1f5f9"],["Avg Score",avg,scoreColor(avg)],["Top Score",top,scoreColor(top)]].map(([l,v,c])=>(
            <div key={l} style={{background:"#111827",padding:"14px 0",display:"flex",flexDirection:"column",alignItems:"center"}}>
              <span style={{color:c,fontSize:22,fontWeight:800,fontFamily:"'DM Mono',monospace"}}>{v}</span>
              <span style={{color:"#475569",fontSize:9,fontWeight:600,letterSpacing:"0.8px",textTransform:"uppercase",marginTop:3}}>{l}</span>
            </div>
          ))}
        </div>

        <div style={{color:"#475569",fontSize:11,fontStyle:"italic",marginBottom:12}}>Swipe left or tap × to remove</div>
      </div>

      <div style={{padding:"0 16px 32px",display:"flex",flexDirection:"column",gap:8}}>
        {list.map(athlete => {
          const sc = SPORT_CONFIG[athlete.sport];
          const sc2 = scoreColor(athlete.score);
          return (
            <div key={athlete.id} style={{display:"flex",alignItems:"center",gap:12,background:"#111827",border:"1px solid #1e293b",borderRadius:14,padding:"12px 14px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:sc.color}}/>
              <div style={{width:42,height:42,borderRadius:"50%",background:sc.dim,border:`1.5px solid ${sc.color}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:4}}>
                <span style={{color:sc.color,fontSize:12,fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{athlete.name.split(" ").map(w=>w[0]).join("").slice(0,2)}</span>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{color:"#f1f5f9",fontSize:14,fontWeight:700}}>{athlete.name}</div>
                <div style={{color:"#64748b",fontSize:11,marginTop:2}}>{athlete.position} · {athlete.sport} · Age {athlete.age}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                <div style={{width:38,height:38,borderRadius:"50%",border:`2px solid ${sc2}`,background:"#0a0e1a",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{color:sc2,fontSize:12,fontWeight:800,fontFamily:"'DM Mono',monospace"}}>{athlete.score}</span>
                </div>
                <button onClick={()=>remove(athlete.id)} style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.4)",color:"#ef4444",width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Discover Screen
function DiscoverScreen({ shortlist, onOpenProfile }) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(new Set());
  const dSearch = useDebounce(search, 300);

  const toggleFilter = (s) => setFilters(prev => {
    const n = new Set(prev);
    n.has(s) ? n.delete(s) : n.add(s);
    return n;
  });

  const results = useMemo(() => {
    let r = ATHLETES_WITH_SCORE;
    if (filters.size) r = r.filter(a=>filters.has(a.sport));
    if (dSearch.trim()) { const q=dSearch.toLowerCase(); r=r.filter(a=>a.name.toLowerCase().includes(q)); }
    return r;
  }, [filters, dSearch]);

  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",background:"#0a0e1a"}}>
      {/* Header */}
      <div style={{padding:"20px 16px 0",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <div style={{color:"#f1f5f9",fontSize:26,fontWeight:800,letterSpacing:"-0.5px",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:"1px"}}>ScoutIQ</div>
            <div style={{color:"#475569",fontSize:11,letterSpacing:"0.5px"}}>Athlete Discovery</div>
          </div>
          <div style={{background:"rgba(0,212,255,.1)",border:"1px solid #00d4ff",padding:"4px 10px",borderRadius:99}}>
            <span style={{color:"#00d4ff",fontSize:11,fontWeight:600,fontFamily:"'DM Mono',monospace"}}>{ATHLETES_WITH_SCORE.length} Athletes</span>
          </div>
        </div>

        {/* Search */}
        <div style={{display:"flex",alignItems:"center",gap:8,background:"#111827",border:"1px solid #1e293b",borderRadius:12,padding:"10px 14px",marginBottom:8}}>
          <span style={{fontSize:14}}>🔎</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search athletes..."
            style={{flex:1,background:"none",border:"none",outline:"none",color:"#f1f5f9",fontSize:14,caretColor:"#00d4ff"}}
          />
          {search && <button onClick={()=>setSearch("")} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:16,padding:0,lineHeight:1}}>×</button>}
        </div>

        {/* Result count */}
        {(dSearch||filters.size>0) && (
          <div style={{color:"#475569",fontSize:11,marginBottom:4}}>{results.length} result{results.length!==1?"s":""}</div>
        )}

        {/* Filters */}
        <div style={{display:"flex",gap:8,paddingBottom:12,overflowX:"auto"}}>
          {Object.entries(SPORT_CONFIG).map(([sport,cfg])=>{
            const active = filters.has(sport);
            return (
              <button key={sport} onClick={()=>toggleFilter(sport)} style={{
                whiteSpace:"nowrap",padding:"5px 14px",borderRadius:99,cursor:"pointer",fontSize:12,fontWeight:600,transition:"all 0.15s",flexShrink:0,
                background:active?cfg.dim:"transparent",border:`1.5px solid ${active?cfg.color:"#1e293b"}`,color:active?cfg.color:"#64748b",
              }}>{cfg.emoji} {sport}</button>
            );
          })}
          {filters.size>0 && (
            <button onClick={()=>setFilters(new Set())} style={{whiteSpace:"nowrap",padding:"5px 14px",borderRadius:99,cursor:"pointer",fontSize:12,fontWeight:600,background:"rgba(239,68,68,.1)",border:"1.5px solid #ef4444",color:"#ef4444",flexShrink:0}}>Clear ×</button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{flex:1,overflowY:"auto",padding:"0 16px 24px",display:"flex",flexDirection:"column",gap:8}}>
        {results.length===0 ? (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 0"}}>
            <div style={{fontSize:48,marginBottom:16}}>🔍</div>
            <div style={{color:"#f1f5f9",fontSize:18,fontWeight:700,marginBottom:8}}>No Athletes Found</div>
            <div style={{color:"#64748b",fontSize:13,textAlign:"center"}}>{dSearch?`No results for "${dSearch}"`:"Try adjusting your sport filters"}</div>
          </div>
        ) : results.map(a=>(
          <AthleteCard key={a.id} athlete={a} onPress={onOpenProfile} shortlisted={shortlist.has(a.id)}/>
        ))}
      </div>
    </div>
  );
}

// Main App
export default function App() {
  const [tab, setTab] = useState("discover");
  const [profile, setProfile] = useState(null);
  const shortlist = useShortlist();

  const openProfile = useCallback((athlete) => setProfile(athlete), []);
  const closeProfile = useCallback(() => setProfile(null), []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        body { background: #0a0e1a; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 99px; }
        input::placeholder { color: #475569; }
      `}</style>

      {/* Phone shell */}
      <div style={{
        minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",
        background:"#050810",fontFamily:"system-ui,sans-serif",
      }}>
        <div style={{
          width:390,height:844,maxHeight:"100vh",background:"#0a0e1a",borderRadius:40,
          overflow:"hidden",display:"flex",flexDirection:"column",
          boxShadow:"0 0 0 10px #0d1117, 0 0 0 11px #1e293b, 0 30px 80px rgba(0,0,0,0.8)",
          position:"relative",
        }}>
          {/* Status bar */}
          <div style={{height:44,background:"#0a0e1a",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",flexShrink:0}}>
            <span style={{color:"#f1f5f9",fontSize:12,fontWeight:600,fontFamily:"'DM Mono',monospace"}}>9:41</span>
            <div style={{width:120,height:28,background:"#0a0e1a",borderRadius:99,position:"absolute",left:"50%",transform:"translateX(-50%)",border:"2px solid #1e293b"}}/>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <span style={{fontSize:10}}>📶</span>
              <span style={{color:"#f1f5f9",fontSize:10}}>🔋</span>
            </div>
          </div>

          {/* Screen content */}
          <div style={{flex:1,overflow:"hidden",position:"relative"}}>
            {profile ? (
              <ProfileScreen athlete={profile} shortlist={shortlist} onBack={closeProfile}/>
            ) : tab==="discover" ? (
              <DiscoverScreen shortlist={shortlist} onOpenProfile={openProfile}/>
            ) : (
              <ShortlistScreen shortlist={shortlist}/>
            )}
          </div>

          {/* Bottom Tab Bar */}
          {!profile && (
            <div style={{
              height:72,background:"#111827",borderTop:"1px solid #1e293b",
              display:"flex",alignItems:"center",flexShrink:0,
            }}>
              {[
                { id:"discover", label:"Discover", icon:"🔍" },
                { id:"shortlist", label:"Shortlist", icon:"★", badge: shortlist.list.length },
              ].map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)} style={{
                  flex:1,height:"100%",background:"none",border:"none",cursor:"pointer",
                  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,
                  position:"relative",
                }}>
                  <span style={{fontSize:20,lineHeight:1,opacity:tab===t.id?1:0.5,transition:"opacity 0.2s"}}>{t.icon}</span>
                  <span style={{fontSize:10,fontWeight:600,color:tab===t.id?"#00d4ff":"#475569",transition:"color 0.2s",letterSpacing:"0.3px"}}>{t.label}</span>
                  {t.badge>0 && (
                    <div style={{position:"absolute",top:10,right:"calc(50% - 18px)",background:"#00d4ff",color:"#0a0e1a",fontSize:9,fontWeight:700,width:16,height:16,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {t.badge}
                    </div>
                  )}
                  {tab===t.id && <div style={{position:"absolute",bottom:0,width:32,height:2,background:"#00d4ff",borderRadius:99}}/>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
