'use client';
import { useState, useEffect, useRef } from 'react';
import { getMaterials } from '@/services/api';
import type { Material } from '@/services/api';

const DEMO: Material[] = [
  { id:1, name:'Белый матовый',   type:'lacquer', color:'#141210', price_per_m2:320, texture_url:'', in_stock:true },
  { id:2, name:'Серый бетон',     type:'mdf',     color:'#8a8a82', price_per_m2:285, texture_url:'', in_stock:true },
  { id:3, name:'Чёрный глянец',   type:'lacquer', color:'#f5f0e8', price_per_m2:380, texture_url:'', in_stock:true },
  { id:4, name:'Дуб натуральный', type:'wood',    color:'#b8834a', price_per_m2:420, texture_url:'', in_stock:true },
  { id:5, name:'Орех',            type:'wood',    color:'#6b4226', price_per_m2:465, texture_url:'', in_stock:true },
  { id:6, name:'Венге',           type:'veneer',  color:'#2d1a0e', price_per_m2:510, texture_url:'', in_stock:true },
  { id:7, name:'Sage зелёный',    type:'mdf',     color:'#8fa88e', price_per_m2:295, texture_url:'', in_stock:true },
  { id:8, name:'Терракота',       type:'mdf',     color:'#c07a5e', price_per_m2:275, texture_url:'', in_stock:true },
];

function Counter({ val, prefix='' }: { val: number; prefix?: string }) {
  const [d, setD] = useState(val);
  const ref = useRef(val);
  useEffect(() => {
    const from=ref.current, to=val, dur=550, t0=performance.now();
    const fn=(now:number)=>{
      const p=Math.min((now-t0)/dur,1), e=1-(1-p)**3;
      setD(Math.round(from+(to-from)*e));
      if(p<1) requestAnimationFrame(fn); else ref.current=to;
    };
    requestAnimationFrame(fn);
  },[val]);
  return <>{prefix}{d.toLocaleString('ru-RU')}</>;
}

function hexRgb(h: string) {
  const s = h.replace('#','').padStart(6,'0');
  return { r:parseInt(s.slice(0,2),16), g:parseInt(s.slice(2,4),16), b:parseInt(s.slice(4,6),16) };
}
function mix(h1:string,h2:string,t:number){
  const a=hexRgb(h1),b=hexRgb(h2);
  return `rgb(${Math.round(a.r+(b.r-a.r)*t)},${Math.round(a.g+(b.g-a.g)*t)},${Math.round(a.b+(b.b-a.b)*t)})`;
}

export default function CalculatorPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [sel,    setSel]    = useState<Material|null>(null);
  const [w,      setW]      = useState(3.2);
  const [h,      setH]      = useState(2.4);
  const [doors,  setDoors]  = useState(4);
  const [drawers,setDraw]   = useState(4);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getMaterials().then(m=>{ setMaterials(m); setSel(m[0]); }).catch(()=>{ setMaterials(DEMO); setSel(DEMO[0]); });
    setTimeout(()=>setLoaded(true),80);
  }, []);

  const ppm    = sel?.price_per_m2 || 0;
  const area   = w * h;
  const base   = Math.round(area * ppm);
  const dPrice = Math.round(doors   * ppm * 0.28);
  const drPrice= Math.round(drawers * ppm * 0.18);
  const total  = base + dPrice + drPrice;

  const c = sel?.color || '#b8834a';
  const hi = mix(c,'#ffffff',.28);
  const lo = mix(c,'#000000',.38);

  return (
    <div style={{ background:'#141210', minHeight:'100vh', paddingTop:80 }}>

      {/* ── HERO ── */}
      <div style={{ position:'relative', height:'32vh', overflow:'hidden' }}>
        <img src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&q=80&auto=format&fit=crop" alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 60%' }} />
        <div style={{ position:'absolute', inset:0, background:'rgba(14,12,10,.72)' }} />
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 8vw' }}>
          <div style={{ opacity:loaded?1:0, transform:loaded?'none':'translateY(22px)', transition:'all .9s cubic-bezier(.16,1,.3,1)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
              <span style={{ width:28, height:1, background:'#f5f0e8', display:'block' }} />
              <span style={{ fontSize:9, letterSpacing:'.42em', textTransform:'uppercase', color:'#f5f0e8' }}>Калькулятор стоимости</span>
            </div>
            <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(38px,5.5vw,72px)', fontWeight:300, color:'#f5f0e8', lineHeight:.92 }}>
              Точная смета<br /><em style={{ color:'#f5f0e8', fontStyle:'italic' }}>за 30 секунд</em>
            </h1>
          </div>
        </div>
      </div>

      {/* ── SPLIT (Minotti) ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', minHeight:'70vh' }}>

        {/* LEFT: controls */}
        <div style={{ padding:'60px 7vw 60px 8vw', borderRight:'1px solid rgba(245,240,232,.05)' }}>

          {/* Material selector */}
          <div style={{ marginBottom:44 }}>
            <div style={{ fontSize:9, letterSpacing:'.32em', textTransform:'uppercase', color:'#f5f0e8', marginBottom:22 }}>Материал</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
              {materials.map(m => (
                <button key={m.id} onClick={()=>setSel(m)} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'9px 14px',
                  border:`1px solid ${sel?.id===m.id?'rgba(245,240,232,.6)':'rgba(245,240,232,.07)'}`,
                  background: sel?.id===m.id?'rgba(245,240,232,.07)':'transparent',
                  cursor:'none', transition:'all .2s',
                }}>
                  <div style={{ width:14, height:14, borderRadius:'50%', background:m.color, border:'1px solid rgba(245,240,232,.18)', flexShrink:0 }} />
                  <span style={{ fontSize:9, color: sel?.id===m.id?'#f5f0e8':'rgba(245,240,232,.45)', letterSpacing:'.05em' }}>{m.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          {[
            { l:'Ширина кухни',  v:w,      min:1.5,max:6,  step:.1, set:setW,     unit:'м' },
            { l:'Высота фасадов',v:h,      min:1.8,max:3,  step:.1, set:setH,     unit:'м' },
          ].map(f => (
            <div key={f.l} style={{ marginBottom:32 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:12 }}>
                <span style={{ fontSize:9, letterSpacing:'.22em', textTransform:'uppercase', color:'rgba(245,240,232,.38)' }}>{f.l}</span>
                <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:36, color:'#f5f0e8', lineHeight:1 }}>
                  {f.v.toFixed(1)}<span style={{ fontSize:14, color:'#f5f0e8', marginLeft:3 }}>{f.unit}</span>
                </span>
              </div>
              <input type="range" min={f.min} max={f.max} step={f.step} value={f.v} onChange={e=>f.set(parseFloat(e.target.value))} style={{ width:'100%' }} />
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:6 }}>
                <span style={{ fontSize:7, color:'rgba(255,255,255,.14)' }}>{f.min}</span>
                <span style={{ fontSize:7, color:'rgba(255,255,255,.14)' }}>{f.max}</span>
              </div>
            </div>
          ))}

          {/* Counters */}
          <div style={{ display:'flex', gap:40, marginBottom:44 }}>
            {[{ l:'Дверей', v:doors, min:2, max:8, set:setDoors }, { l:'Ящиков', v:drawers, min:2, max:8, set:setDraw }].map(f => (
              <div key={f.l}>
                <div style={{ fontSize:9, letterSpacing:'.22em', textTransform:'uppercase', color:'rgba(245,240,232,.38)', marginBottom:12 }}>{f.l}</div>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <button onClick={()=>f.set(Math.max(f.min,f.v-1))} style={{ width:32,height:32,border:'1px solid rgba(245,240,232,.1)',background:'transparent',color:'rgba(245,240,232,.5)',fontSize:16,cursor:'none' }}>−</button>
                  <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:38, color:'#f5f0e8', minWidth:28 }}>{f.v}</span>
                  <button onClick={()=>f.set(Math.min(f.max,f.v+1))} style={{ width:32,height:32,border:'1px solid rgba(245,240,232,.1)',background:'transparent',color:'rgba(245,240,232,.5)',fontSize:16,cursor:'none' }}>+</button>
                </div>
              </div>
            ))}
          </div>

          {/* Price breakdown bars */}
          <div style={{ borderTop:'1px solid rgba(245,240,232,.05)', paddingTop:32 }}>
            <div style={{ fontSize:9, letterSpacing:'.32em', textTransform:'uppercase', color:'#f5f0e8', marginBottom:22 }}>Структура стоимости</div>
            {[
              { l:'Базовые фасады', v:base,    max:total, color:'#f5f0e8' },
              { l:'Дверные блоки',  v:dPrice,  max:total, color:'rgba(245,240,232,.6)' },
              { l:'Ящики',          v:drPrice, max:total, color:'rgba(245,240,232,.38)' },
            ].map(b => (
              <div key={b.l} style={{ marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                  <span style={{ fontSize:9, color:'rgba(245,240,232,.42)', letterSpacing:'.08em' }}>{b.l}</span>
                  <span style={{ fontSize:11, color:'#f5f0e8', fontFamily:'Cormorant Garamond,serif' }}>
                    <Counter val={b.v} prefix="€" />
                  </span>
                </div>
                <div style={{ height:2, background:'rgba(255,255,255,.06)', borderRadius:1 }}>
                  <div style={{ height:'100%', width:`${total?b.v/total*100:0}%`, background:b.color, borderRadius:1, transition:'width .6s cubic-bezier(.16,1,.3,1)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: SVG preview + total */}
        <div style={{ padding:'60px 8vw 60px 7vw', display:'flex', flexDirection:'column' }}>

          {/* SVG kitchen */}
          <div style={{ flex:1, background:'#141210', position:'relative', overflow:'hidden', marginBottom:40 }}>
            <svg viewBox="0 0 720 480" style={{ width:'100%', height:'100%' }}>
              <defs>
                <linearGradient id="c_u" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={hi}/><stop offset="100%" stopColor={lo}/></linearGradient>
                <linearGradient id="c_l" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c}/><stop offset="100%" stopColor={mix(c,'#000000',.5)}/></linearGradient>
                <linearGradient id="c_wt" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5a5450"/><stop offset="100%" stopColor="#252220"/></linearGradient>
                <filter id="csh"><feGaussianBlur stdDeviation="6"/></filter>
                <radialGradient id="c_ceil" cx="50%" cy="0%" r="60%"><stop offset="0%" stopColor="rgba(255,240,200,.08)"/><stop offset="100%" stopColor="transparent"/></radialGradient>
                <radialGradient id="c_vig" cx="50%" cy="50%" r="80%"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,.5)"/></radialGradient>
              </defs>
              <rect width="720" height="480" fill="#141210"/>
              <rect width="720" height="480" fill="url(#c_ceil)"/>
              <rect x="0" y="340" width="720" height="140" fill="#0a0908"/>
              <line x1="0" y1="340" x2="720" y2="340" stroke="rgba(245,240,232,.05)" strokeWidth="1"/>
              <rect x="48" y="60" width="624" height="4" rx="2" fill="rgba(255,240,185,.22)"/>
              <ellipse cx="360" cy="342" rx="310" ry="12" fill="rgba(0,0,0,.5)" filter="url(#csh)"/>
              {/* Upper cabs */}
              {Array.from({length:doors}).map((_,i)=>{
                const dw=(624)/doors, x=48+i*dw, y=64, ht=158, g=2.5;
                return(<g key={i}>
                  <rect x={x+g} y={y+g} width={dw-g*2} height={ht-g*2} fill="url(#c_u)" rx=".5"/>
                  <rect x={x+g} y={y+g} width={dw-g*2} height={(ht-g*2)*.35} fill="rgba(245,240,232,.06)"/>
                  <rect x={x+dw/2-32} y={y+ht-20} width={64} height={7} rx="3.5" fill="#f5f0e8" opacity=".8"/>
                  {i>0&&<rect x={x} y={y} width={3} height={ht} fill="rgba(0,0,0,.7)"/>}
                </g>);
              })}
              {/* Worktop */}
              <rect x="40" y="222" width="640" height="24" fill="url(#c_wt)" rx=".5"/>
              <line x1="40" y1="222" x2="680" y2="222" stroke="rgba(28,25,22,.2)" strokeWidth="1.5"/>
              {/* Lower drawers */}
              {Array.from({length:drawers}).map((_,i)=>{
                const dw=624/drawers, x=48+i*dw, y=246, ht1=52, ht2=76, g=2.5, sp=2;
                return(<g key={i}>
                  <rect x={x+g} y={y+g} width={dw-g*2} height={ht1} fill="url(#c_l)" rx=".5"/>
                  <rect x={x+dw/2-26} y={y+ht1-12} width={52} height={6} rx="3" fill="#f5f0e8" opacity=".7"/>
                  <rect x={x+g} y={y+ht1+sp} width={dw-g*2} height={ht2} fill="url(#c_l)" rx=".5"/>
                  <rect x={x+dw/2-26} y={y+ht1+sp+ht2/2-3} width={52} height={6} rx="3" fill="#f5f0e8" opacity=".7"/>
                  {i>0&&<rect x={x} y={y} width={3} height={ht1+sp+ht2+4} fill="rgba(0,0,0,.7)"/>}
                </g>);
              })}
              {/* Plinth */}
              <rect x="48" y="340" width="624" height="10" fill="#0c0a08"/>
              <rect width="720" height="480" fill="url(#c_vig)"/>
              {/* Dimension overlay */}
              <text x="360" y="426" fontSize="9" fill="rgba(245,240,232,.5)" textAnchor="middle" fontFamily="Montserrat,sans-serif" letterSpacing="2">
                {w.toFixed(1)}м × {h.toFixed(1)}м
              </text>
            </svg>
          </div>

          {/* TOTAL */}
          <div style={{ textAlign:'center', padding:'32px 0', borderTop:'1px solid rgba(245,240,232,.12)' }}>
            <div style={{ fontSize:9, letterSpacing:'.38em', textTransform:'uppercase', color:'rgba(245,240,232,.38)', marginBottom:10 }}>Итого</div>
            <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(56px,7vw,86px)', color:'#f5f0e8', lineHeight:1, marginBottom:6 }}>
              €<Counter val={total} />
            </div>
            <div style={{ fontSize:9, color:'rgba(245,240,232,.55)', letterSpacing:'.1em' }}>
              {area.toFixed(1)} м² · €{ppm}/м² · {sel?.name}
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:28 }}>
              <a href="/configurator" style={{ background:'#c4907a', color:'#141210', padding:'13px 32px', fontSize:8, fontWeight:500, letterSpacing:'.22em', textTransform:'uppercase', textDecoration:'none' }}>
                Конфигуратор 3D
              </a>
              <a href="/contacts" style={{ background:'transparent', border:'1px solid rgba(255,255,255,.16)', color:'rgba(245,240,232,.65)', padding:'13px 32px', fontSize:8, letterSpacing:'.22em', textTransform:'uppercase', textDecoration:'none' }}>
                Получить смету
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
