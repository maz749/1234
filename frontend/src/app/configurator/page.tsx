'use client';
import { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { getMaterials, createProject } from '@/services/api';
import { useAuthStore } from '@/store';
import type { Material } from '@/services/api';
import type { SceneType } from '@/components/configurator/Scene3D';
import toast from 'react-hot-toast';
import Link from 'next/link';

const Scene3D = lazy(() => import('@/components/configurator/Scene3D'));

/* ── MATERIALS ────────────────────────────────────────────────────────── */
const DEMO: Material[] = [
  /* ── Нейтральные ── */
  { id:1,  name:'Кашемир',         type:'mdf',     color:'#e8e2d8', price_per_m2:320, texture_url:'', in_stock:true },
  { id:2,  name:'Белый матовый',   type:'mdf',     color:'#141210', price_per_m2:295, texture_url:'', in_stock:true },
  { id:3,  name:'Белый глянец',    type:'lacquer', color:'#f7f5f1', price_per_m2:350, texture_url:'', in_stock:true },
  /* ── Серые ── */
  { id:4,  name:'Тауп',            type:'mdf',     color:'#9a9088', price_per_m2:285, texture_url:'', in_stock:true },
  { id:5,  name:'Графит',          type:'mdf',     color:'#3e3c38', price_per_m2:295, texture_url:'', in_stock:true },
  { id:6,  name:'Чёрный глянец',   type:'lacquer', color:'#f5f0e8', price_per_m2:380, texture_url:'', in_stock:true },
  /* ── Дерево ── */
  { id:7,  name:'Дуб натуральный', type:'wood',    color:'#c8a464', price_per_m2:420, texture_url:'', in_stock:true },
  { id:8,  name:'Орех тёмный',     type:'wood',    color:'#7a5230', price_per_m2:465, texture_url:'', in_stock:true },
  { id:9,  name:'Венге',           type:'veneer',  color:'#2d1a0e', price_per_m2:510, texture_url:'', in_stock:true },
  /* ── Цветные ── */
  { id:10, name:'Sage',            type:'mdf',     color:'#8fa68c', price_per_m2:295, texture_url:'', in_stock:true },
  { id:11, name:'Полночь',         type:'lacquer', color:'#242d3d', price_per_m2:340, texture_url:'', in_stock:true },
  { id:12, name:'Нюд',             type:'mdf',     color:'#c4a99a', price_per_m2:275, texture_url:'', in_stock:true },
  { id:13, name:'Пыльная лаванда', type:'mdf',     color:'#9d93a8', price_per_m2:275, texture_url:'', in_stock:true },
  { id:14, name:'Терракота',       type:'mdf',     color:'#b8725a', price_per_m2:275, texture_url:'', in_stock:true },
];

const TYPE_LABELS: Record<string,string> = { lacquer:'Лак', mdf:'МДФ', wood:'Дерево', veneer:'Шпон' };

const SCENES: { id: SceneType; label: string; desc: string }[] = [
  { id:'kitchen',  label:'Кухня',     desc:'Верхние и нижние шкафы' },
  { id:'wardrobe', label:'Шкаф-купе', desc:'Раздвижные двери' },
  { id:'panels',   label:'Панели',    desc:'Стеновые рейки' },
  { id:'door',     label:'Двери',     desc:'Межкомнатная дверь' },
];

type Tab = 'Отделка' | 'Размеры' | 'Опции';

function Counter({ val }: { val: number }) {
  const [d, setD] = useState(val);
  const prev = useRef(val);
  useEffect(() => {
    const from = prev.current, to = val, dur = 700, t0 = performance.now();
    const fn = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      setD(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(fn); else prev.current = to;
    };
    requestAnimationFrame(fn);
  }, [val]);
  return <>{d.toLocaleString('ru-RU')}</>;
}

export default function ConfiguratorPage() {
  const { isAuthenticated } = useAuthStore();

  const [materials, setMaterials] = useState<Material[]>(DEMO);
  const [sel,       setSel]       = useState<Material>(DEMO[0]);
  const [scene,     setScene]     = useState<SceneType>('kitchen');
  const [tab,       setTab]       = useState<Tab>('Отделка');
  const [typeFilter,setTypeFilter]= useState('');
  const [width,     setWidth]     = useState(3.0);
  const [height,    setHeight]    = useState(2.4);
  const [doors,     setDoors]     = useState(5);
  const [drawers,   setDrawers]   = useState(5);
  const [options,   setOptions]   = useState<Record<string, boolean>>({});
  const [showSave,  setShowSave]  = useState(false);
  const [projName,  setProjName]  = useState('Мой проект');
  const [saving,    setSaving]    = useState(false);
  const [loaded,    setLoaded]    = useState(false);
  const [autoRot,   setAutoRot]   = useState(true);
  const [hovId,     setHovId]     = useState<number | null>(null);

  useEffect(() => {
    getMaterials().then(m => { setMaterials(m); setSel(m[0]); }).catch(() => {});
    setTimeout(() => setLoaded(true), 100);
  }, []);

  const handleSave = async () => {
    if (!isAuthenticated()) { toast.error('Войдите для сохранения'); return; }
    setSaving(true);
    try {
      await createProject({ name: projName, config_json: JSON.stringify({ sel, scene, width, height, doors, drawers }) });
      toast.success('Проект сохранён'); setShowSave(false);
    } catch { toast.error('Ошибка'); }
    setSaving(false);
  };

  const types    = Array.from(new Set(materials.map(m => m.type)));
  const filtered = materials.filter(m => !typeFilter || m.type === typeFilter);
  const optPrice = Object.values(options).filter(Boolean).length * 95;
  const price    = Math.round(width * height * sel.price_per_m2) + optPrice;

  const OPTS = [
    { id:'soft',  name:'Soft-close',         add:'+€120', desc:'Blum Clip Top' },
    { id:'led',   name:'LED подсветка',       add:'+€280', desc:'3000K лента' },
    { id:'al',    name:'Алюм. профиль',       add:'+€90',  desc:'Матовый анод.' },
    { id:'blum',  name:'Выдвижные Blum',      add:'+€340', desc:'Tandembox' },
    { id:'glass', name:'Стеклянные вставки',  add:'+€210', desc:'Triplex 6мм' },
    { id:'hett',  name:'Доводчики Hettich',   add:'+€160', desc:'Selekt' },
  ];

  return (
    <div style={{
      position:'fixed', inset:0, overflow:'hidden',
      fontFamily:'Montserrat, sans-serif', background:'var(--void)',
      opacity: loaded ? 1 : 0, transition:'opacity .6s ease',
      display:'flex', flexDirection:'column',
    }}>

      {/* ── TOP BAR ── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 40px', height:62, flexShrink:0,
        borderBottom:'1px solid rgba(245,240,232,.05)',
        background:'rgba(13,11,9,.97)', backdropFilter:'blur(12px)',
        position:'relative', zIndex:30,
      }}>
        <Link href="/" style={{ fontFamily:'Cormorant Garamond,serif', fontSize:16, letterSpacing:'.22em', fontWeight:300, color:'var(--cream)' }}>
          FACADE<span style={{ color:'var(--gold)' }}>·</span>STUDIO
        </Link>

        {/* Scene tabs */}
        <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', display:'flex' }}>
          {SCENES.map(s => (
            <button key={s.id} onClick={() => setScene(s.id)} style={{
              padding:'0 28px', height:62, fontSize:9, letterSpacing:'.18em',
              textTransform:'uppercase', border:'none', background:'transparent', cursor:'none',
              color: scene===s.id ? 'var(--cream)' : 'rgba(245,240,232,.38)',
              borderBottom: scene===s.id ? '2px solid var(--gold)' : '2px solid transparent',
              transition:'all .25s', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3,
            }}>
              <span style={{ fontSize:7, color: scene===s.id ? 'rgba(245,240,232,.65)' : 'transparent', transition:'color .25s', letterSpacing:'.1em' }}>
                {s.desc}
              </span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <button onClick={() => setAutoRot(v => !v)} style={{
            background:'transparent', border:'none', cursor:'none', padding:'6px 10px',
            fontSize:8, letterSpacing:'.15em',
            color: autoRot ? 'rgba(28,25,22,.8)' : 'rgba(245,240,232,.3)',
            transition:'color .25s',
          }}>↻ авторотация</button>

          <div style={{ width:1, height:22, background:'rgba(245,240,232,.06)' }} />

          <div style={{ textAlign:'right', minWidth:110 }}>
            <div style={{ fontSize:7, letterSpacing:'.25em', textTransform:'uppercase', color:'rgba(245,240,232,.3)', marginBottom:1 }}>от</div>
            <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:24, color:'var(--cream)', lineHeight:1 }}>
              €<Counter val={price} />
            </div>
          </div>

          <div style={{ width:1, height:22, background:'rgba(245,240,232,.06)' }} />

          <button onClick={() => setShowSave(v => !v)} style={{
            background:'transparent', border:'1px solid rgba(245,240,232,.1)',
            color:'rgba(245,240,232,.5)', padding:'7px 14px',
            fontSize:8, letterSpacing:'.18em', textTransform:'uppercase', cursor:'none',
          }}>Сохранить</button>

          <Link href="/contacts" style={{
            background:'#c4907a', color:'#141210', padding:'8px 18px',
            fontSize:8, fontWeight:600, letterSpacing:'.2em', textTransform:'uppercase',
          }}>Заказать</Link>
        </div>
      </div>

      {/* Save dropdown */}
      {showSave && (
        <div style={{
          position:'absolute', top:68, right:40, zIndex:40,
          background:'rgba(20,18,16,.98)', backdropFilter:'blur(24px)',
          border:'1px solid rgba(245,240,232,.07)', padding:'22px', width:248,
        }}>
          <div style={{ fontSize:8, letterSpacing:'.28em', color:'rgba(28,25,22,.8)', marginBottom:12 }}>СОХРАНИТЬ</div>
          <input value={projName} onChange={e => setProjName(e.target.value)}
            style={{ width:'100%', background:'transparent', border:'none', borderBottom:'1px solid rgba(28,25,22,.35)', color:'var(--cream)', padding:'8px 0', fontSize:12, outline:'none', marginBottom:14, fontFamily:'Montserrat,sans-serif' }} />
          <button onClick={handleSave} disabled={saving} style={{ width:'100%', background:'var(--cream)', color:'var(--void)', border:'none', padding:'11px', fontSize:8, fontWeight:600, letterSpacing:'.2em', cursor:'none' }}>
            {saving ? '...' : 'СОХРАНИТЬ'}
          </button>
        </div>
      )}

      {/* ── MAIN: 3D + RIGHT PANEL ── */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

        {/* 3D VIEWPORT */}
        <div style={{ flex:1, position:'relative' }} onPointerDown={() => setAutoRot(false)}>
          <Suspense fallback={
            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12 }}>
              <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:20, color:'rgba(28,25,22,.2)' }}>Загрузка 3D</div>
              <div style={{ fontSize:7, letterSpacing:'.3em', color:'rgba(245,240,232,.1)' }}>THREE.JS · WebGL</div>
            </div>
          }>
            <Scene3D color={sel.color} finishType={sel.type} sceneType={scene} autoRotate={autoRot} />
          </Suspense>

          {/* Interaction hint */}
          <div style={{
            position:'absolute', bottom:22, left:'50%', transform:'translateX(-50%)',
            fontSize:8, letterSpacing:'.2em', color:'rgba(245,240,232,.3)',
            opacity: autoRot ? 0 : 1, transition:'opacity .5s', pointerEvents:'none',
            whiteSpace:'nowrap',
          }}>
            ТЯНИ · СКРОЛЛ ДЛЯ ЗУМА
          </div>

          {/* Material chip */}
          <div style={{
            position:'absolute', bottom:22, left:28,
            display:'flex', alignItems:'center', gap:10,
            background:'rgba(14,12,10,.75)', backdropFilter:'blur(14px)',
            border:'1px solid rgba(245,240,232,.07)', padding:'9px 14px',
          }}>
            <div style={{
              width:16, height:16, borderRadius:'50%', background:sel.color,
              boxShadow:`0 0 10px ${sel.color}66`, border:'1.5px solid rgba(245,240,232,.18)',
              transition:'all .4s',
            }} />
            <div>
              <div style={{ fontSize:10, color:'var(--cream)', marginBottom:1 }}>{sel.name}</div>
              <div style={{ fontSize:7, color:'rgba(245,240,232,.38)', letterSpacing:'.08em' }}>
                {TYPE_LABELS[sel.type]} · €{sel.price_per_m2}/м²
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{
          width:308, flexShrink:0,
          borderLeft:'1px solid rgba(245,240,232,.05)',
          background:'rgba(20,18,16,.98)',
          display:'flex', flexDirection:'column', overflow:'hidden',
        }}>
          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid rgba(245,240,232,.05)', flexShrink:0 }}>
            {(['Отделка','Размеры','Опции'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex:1, padding:'14px 0', fontSize:8, letterSpacing:'.18em',
                textTransform:'uppercase', border:'none', background:'transparent', cursor:'none',
                color: tab===t ? 'var(--cream)' : 'rgba(245,240,232,.3)',
                borderBottom: tab===t ? '1px solid var(--gold)' : '1px solid transparent',
                marginBottom:-1, transition:'color .25s',
              }}>{t}</button>
            ))}
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:'16px 18px 20px' }}>

            {/* ОТДЕЛКА */}
            {tab==='Отделка' && (
              <>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:16 }}>
                  {['', ...types].map(t => (
                    <button key={t} onClick={() => setTypeFilter(t)} style={{
                      padding:'4px 11px', fontSize:7, letterSpacing:'.18em', textTransform:'uppercase', cursor:'none',
                      border:`1px solid ${typeFilter===t ? 'rgba(28,25,22,.4)' : 'rgba(245,240,232,.07)'}`,
                      background: typeFilter===t ? 'rgba(245,240,232,.06)' : 'transparent',
                      color: typeFilter===t ? 'var(--cream)' : 'rgba(245,240,232,.38)',
                      transition:'all .2s',
                    }}>{t==='' ? 'Все' : TYPE_LABELS[t]||t}</button>
                  ))}
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                  {filtered.map(m => {
                    const isS = sel.id===m.id, isH = hovId===m.id;
                    return (
                      <button key={m.id}
                        onClick={() => setSel(m)}
                        onMouseEnter={() => setHovId(m.id)}
                        onMouseLeave={() => setHovId(null)}
                        style={{
                          display:'flex', alignItems:'center', gap:11,
                          padding:'9px 11px', cursor:'none',
                          background: isS ? 'rgba(245,240,232,.08)' : isH ? 'rgba(245,240,232,.04)' : 'transparent',
                          border:`1px solid ${isS ? 'rgba(28,25,22,.35)' : 'transparent'}`,
                          transition:'all .2s',
                        }}
                      >
                        <div style={{
                          width:30, height:30, borderRadius:'50%', flexShrink:0,
                          background:m.color,
                          border: isS ? '2px solid rgba(245,240,232,.72)' : '2px solid rgba(245,240,232,.1)',
                          boxShadow: isS ? `0 0 0 2px var(--void), 0 0 0 4px rgba(28,25,22,.4), 0 4px 14px ${m.color}55` : 'none',
                          transition:'all .3s cubic-bezier(.34,1.56,.64,1)',
                          position:'relative', overflow:'hidden',
                        }}>
                          <div style={{ position:'absolute', top:3, left:3, right:3, height:'38%', borderRadius:'50% 50% 0 0', background:'rgba(245,240,232,.3)', pointerEvents:'none' }} />
                        </div>
                        <div style={{ flex:1, textAlign:'left' }}>
                          <div style={{ fontSize:11, color: isS ? 'var(--cream)' : 'rgba(245,240,232,.6)', marginBottom:2, transition:'color .2s' }}>{m.name}</div>
                          <div style={{ fontSize:7, color:'rgba(245,240,232,.18)', letterSpacing:'.08em' }}>{TYPE_LABELS[m.type]}</div>
                        </div>
                        <div style={{ fontSize:9, color: isS ? 'var(--gold)' : 'rgba(255,255,255,.18)', transition:'color .2s' }}>€{m.price_per_m2}</div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* РАЗМЕРЫ */}
            {tab==='Размеры' && (
              <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                {[
                  { label:'Ширина', val:width,  min:1.2, max:6.0, step:.1, set:setWidth,  unit:'м' },
                  { label:'Высота', val:height, min:1.8, max:3.0, step:.1, set:setHeight, unit:'м' },
                ].map(f => (
                  <div key={f.label}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:9 }}>
                      <span style={{ fontSize:8, letterSpacing:'.22em', textTransform:'uppercase', color:'rgba(245,240,232,.38)' }}>{f.label}</span>
                      <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:32, color:'var(--cream)', lineHeight:1 }}>
                        {f.val.toFixed(1)}<span style={{ fontSize:12, color:'var(--gold)', marginLeft:3 }}>{f.unit}</span>
                      </span>
                    </div>
                    <input type="range" min={f.min} max={f.max} step={f.step} value={f.val}
                      onChange={e => f.set(parseFloat(e.target.value))} style={{ width:'100%' }} />
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop:3 }}>
                      <span style={{ fontSize:7, color:'rgba(245,240,232,.1)' }}>{f.min}</span>
                      <span style={{ fontSize:7, color:'rgba(245,240,232,.1)' }}>{f.max}</span>
                    </div>
                  </div>
                ))}

                <div style={{ height:1, background:'rgba(245,240,232,.05)' }} />

                {[
                  { label:'Секций', val:doors,   min:2, max:8, set:setDoors   },
                  { label:'Ящиков', val:drawers, min:0, max:8, set:setDrawers },
                ].map(f => (
                  <div key={f.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:8, letterSpacing:'.22em', textTransform:'uppercase', color:'rgba(245,240,232,.38)' }}>{f.label}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                      <button onClick={() => f.set(Math.max(f.min, f.val-1))} style={{ width:32, height:32, border:'1px solid rgba(245,240,232,.1)', background:'transparent', color:'rgba(245,240,232,.55)', fontSize:18, cursor:'none', lineHeight:1 }}>−</button>
                      <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:38, color:'var(--cream)', minWidth:28, textAlign:'center' }}>{f.val}</span>
                      <button onClick={() => f.set(Math.min(f.max, f.val+1))} style={{ width:32, height:32, border:'1px solid rgba(245,240,232,.1)', background:'transparent', color:'rgba(245,240,232,.55)', fontSize:18, cursor:'none', lineHeight:1 }}>+</button>
                    </div>
                  </div>
                ))}

                <div style={{ height:1, background:'rgba(245,240,232,.05)' }} />

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                  <span style={{ fontSize:8, letterSpacing:'.22em', textTransform:'uppercase', color:'rgba(245,240,232,.38)' }}>Площадь</span>
                  <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:32, color:'var(--gold)' }}>
                    {(width*height).toFixed(1)}<span style={{ fontSize:12, marginLeft:3 }}>м²</span>
                  </span>
                </div>
              </div>
            )}

            {/* ОПЦИИ */}
            {tab==='Опции' && (
              <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                {OPTS.map(o => {
                  const on = !!options[o.id];
                  return (
                    <button key={o.id} onClick={() => setOptions(v => ({ ...v, [o.id]: !on }))} style={{
                      padding:'11px 13px', cursor:'none',
                      border:`1px solid ${on ? 'rgba(245,240,232,.45)' : 'rgba(255,255,255,.06)'}`,
                      background: on ? 'rgba(245,240,232,.07)' : 'rgba(245,240,232,.03)',
                      display:'flex', justifyContent:'space-between', alignItems:'center',
                      transition:'all .22s',
                    }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{
                          width:15, height:15, border:`1.5px solid ${on ? 'var(--gold)' : 'rgba(245,240,232,.18)'}`,
                          borderRadius:2, background: on ? 'var(--gold)' : 'transparent',
                          transition:'all .2s', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                        }}>
                          {on && <span style={{ fontSize:9, color:'var(--void)', lineHeight:1 }}>✓</span>}
                        </div>
                        <div style={{ textAlign:'left' }}>
                          <div style={{ fontSize:10, color: on ? 'rgba(245,240,232,.9)' : 'rgba(245,240,232,.5)', marginBottom:2 }}>{o.name}</div>
                          <div style={{ fontSize:7, color:'rgba(245,240,232,.18)', letterSpacing:'.08em' }}>{o.desc}</div>
                        </div>
                      </div>
                      <span style={{ fontSize:9, color:'var(--gold)', flexShrink:0 }}>{o.add}</span>
                    </button>
                  );
                })}

                {Object.values(options).some(Boolean) && (
                  <div style={{ marginTop:10, padding:'13px', background:'rgba(245,240,232,.03)', border:'1px solid rgba(245,240,232,.05)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                      <span style={{ fontSize:9, color:'rgba(245,240,232,.38)' }}>База</span>
                      <span style={{ fontSize:9, color:'rgba(245,240,232,.5)' }}>€{price-optPrice}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:9 }}>
                      <span style={{ fontSize:9, color:'rgba(245,240,232,.38)' }}>Опции</span>
                      <span style={{ fontSize:9, color:'var(--gold)' }}>+€{optPrice}</span>
                    </div>
                    <div style={{ height:1, background:'rgba(255,255,255,.06)', marginBottom:9 }} />
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                      <span style={{ fontSize:9, color:'rgba(245,240,232,.55)' }}>Итого</span>
                      <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:20, color:'var(--cream)' }}>€<Counter val={price} /></span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom CTA */}
          <div style={{ padding:'14px 18px', borderTop:'1px solid rgba(245,240,232,.05)', flexShrink:0 }}>
            <Link href="/contacts" style={{
              display:'block', textAlign:'center',
              background:'#c4907a', color:'#141210', padding:'12px',
              fontSize:8, fontWeight:600, letterSpacing:'.22em', textTransform:'uppercase', marginBottom:7,
            }}>
              Заказать консультацию
            </Link>
            <button onClick={() => setShowSave(true)} style={{
              width:'100%', background:'transparent',
              border:'1px solid rgba(245,240,232,.1)', color:'rgba(245,240,232,.38)',
              padding:'9px', fontSize:8, letterSpacing:'.18em', textTransform:'uppercase', cursor:'none',
            }}>
              Сохранить конфигурацию
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
