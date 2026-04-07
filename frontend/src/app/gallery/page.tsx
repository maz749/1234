'use client';
import { useState, useRef, useCallback, useEffect } from 'react';

/* ── TYPES ────────────────────────────────────────────────────────────── */
interface Zone {
  id: string;
  label: string;
  x1: number; y1: number;
  x2: number; y2: number;
}

interface Material {
  id: number;
  name: string;
  color: string;
  type: string;
  price: number;
}

/* ── MATERIALS ────────────────────────────────────────────────────────── */
const MATERIALS: Material[] = [
  { id:1,  name:'Белый матовый',   color:'#f5f0e8', type:'Лак',    price:320 },
  { id:2,  name:'Серый бетон',     color:'#8a8a82', type:'МДФ',    price:285 },
  { id:3,  name:'Чёрный глянец',   color:'#f5f0e8', type:'Лак',    price:380 },
  { id:4,  name:'Дуб натуральный', color:'#c49a5a', type:'Дерево', price:420 },
  { id:5,  name:'Орех тёмный',     color:'#7a5230', type:'Дерево', price:465 },
  { id:6,  name:'Венге',           color:'#2d1a0e', type:'Шпон',   price:510 },
  { id:7,  name:'Sage зелёный',    color:'#8fa88e', type:'МДФ',    price:295 },
  { id:8,  name:'Терракота',       color:'#c07a5e', type:'МДФ',    price:275 },
  { id:9,  name:'Тёмно-синий',     color:'#2c3a52', type:'Лак',    price:340 },
  { id:10, name:'Розовая пудра',   color:'#d4a5a0', type:'МДФ',    price:260 },
  { id:11, name:'Оливковый',       color:'#6b7052', type:'МДФ',    price:280 },
  { id:12, name:'Графит',          color:'#3a3a3a', type:'Лак',    price:360 },
];

/* ── COLOR UTILS ──────────────────────────────────────────────────────── */
function hexRgb(h: string) {
  const s = h.replace('#','').padStart(6,'0');
  return { r:parseInt(s.slice(0,2),16), g:parseInt(s.slice(2,4),16), b:parseInt(s.slice(4,6),16) };
}
function luminance(h: string) {
  const {r,g,b} = hexRgb(h);
  return (0.299*r + 0.587*g + 0.114*b) / 255;
}
function blendParams(color: string) {
  const lum = luminance(color);
  if (lum > 0.88) return { mode:'multiply' as const, opacity: 0.08 };
  if (lum > 0.60) return { mode:'multiply' as const, opacity: 0.55 };
  if (lum > 0.30) return { mode:'multiply' as const, opacity: 0.78 };
  return               { mode:'multiply' as const, opacity: 0.90 };
}

/* ── COUNTER ──────────────────────────────────────────────────────────── */
function Counter({ val }: { val: number }) {
  const [d, setD] = useState(val);
  const prev = useRef(val);
  useEffect(() => {
    const from=prev.current, to=val, dur=500, t0=performance.now();
    const fn=(now:number)=>{
      const p=Math.min((now-t0)/dur,1);
      setD(Math.round(from+(to-from)*(1-Math.pow(1-p,3))));
      if(p<1) requestAnimationFrame(fn); else prev.current=to;
    };
    requestAnimationFrame(fn);
  },[val]);
  return <>{d.toLocaleString('ru-RU')}</>;
}

/* ── MAIN ─────────────────────────────────────────────────────────────── */
export default function AIConfiguratorPage() {
  const [photoUrl,  setPhotoUrl]  = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [zones,     setZones]     = useState<Zone[]>([]);
  const [detecting, setDetecting] = useState(false);
  const [detected,  setDetected]  = useState(false);
  const [selMat,    setSelMat]    = useState<Material>(MATERIALS[0]);
  const [hovMat,    setHovMat]    = useState<number | null>(null);
  const [dragOver,  setDragOver]  = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<string>('');
  const [step,      setStep]      = useState<'upload'|'detecting'|'ready'>('upload');
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── FILE HANDLING ── */
  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) { setError('Пожалуйста загрузите изображение'); return; }
    if (file.size > 15 * 1024 * 1024)   { setError('Файл слишком большой (макс. 15МБ)'); return; }
    setError(null);
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
    setPhotoFile(file);
    setDetected(false);
    setZones([]);
    setStep('upload');
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  /* ── AI ZONE DETECTION ── */
  const detectZones = async () => {
    if (!photoFile) return;
    setDetecting(true);
    setStep('detecting');
    setError(null);

    try {
      /* Convert to base64 */
      const base64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res((r.result as string).split(',')[1]);
        r.onerror = rej;
        r.readAsDataURL(photoFile);
      });

      const mime = photoFile.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

      /* Claude API — detect furniture zones */
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are an interior design AI that detects furniture and cabinetry zones in photos.
You must respond ONLY with valid JSON — no text before or after.
JSON format:
{
  "zones": [
    { "id": "upper_cabinets", "label": "Верхние шкафы", "x1": 5, "y1": 8, "x2": 95, "y2": 42 },
    { "id": "lower_cabinets", "label": "Нижние шкафы",  "x1": 5, "y1": 54, "x2": 95, "y2": 78 }
  ],
  "message": "Обнаружена кухня с верхними и нижними шкафами"
}
Rules:
- Coordinates are PERCENTAGES (0-100) of the image dimensions
- x1,y1 = top-left corner, x2,y2 = bottom-right corner
- Detect ALL visible furniture surfaces that could have facade panels: cabinets, doors, drawer fronts, wardrobe doors, bathroom vanity
- Do NOT include countertops, walls, floors, appliances, ceiling
- Each zone should tightly wrap the furniture surface
- If you see upper AND lower cabinets separately, create 2 zones
- If it's a wardrobe, create zones for each door group
- Label zones in Russian
- Be as precise as possible with coordinates`,
          messages: [{
            role: 'user',
            content: [{
              type: 'image',
              source: { type: 'base64', media_type: mime, data: base64 }
            }, {
              type: 'text',
              text: 'Определи все зоны мебели/фасадов на этом фото. Верни только JSON с координатами зон в процентах.'
            }]
          }]
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const text = data.content?.[0]?.text || '';

      /* Parse JSON from response */
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      if (!parsed.zones || !Array.isArray(parsed.zones)) throw new Error('Неверный формат ответа');

      setZones(parsed.zones);
      setAiMessage(parsed.message || `Обнаружено ${parsed.zones.length} зон фасадов`);
      setDetected(true);
      setStep('ready');

    } catch (err: any) {
      console.error(err);
      setError('Не удалось определить зоны. Попробуйте другое фото или настройте зоны вручную.');
      /* Fallback: rough auto-zones */
      setZones([
        { id:'upper', label:'Верхние шкафы', x1:5,  y1:8,  x2:95, y2:42 },
        { id:'lower', label:'Нижние шкафы',  x1:5,  y1:54, x2:95, y2:78 },
      ]);
      setDetected(true);
      setStep('ready');
    }

    setDetecting(false);
  };

  /* ── ZONE EDITING ── */
  const updateZone = (id: string, key: keyof Zone, val: number) => {
    setZones(zs => zs.map(z => z.id === id ? { ...z, [key]: val } : z));
  };

  const { mode: blendMode, opacity } = blendParams(selMat.color);

  /* ─────────────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────────────── */
  return (
    <div style={{ background:'#141210', minHeight:'100vh', paddingTop:80, fontFamily:'Montserrat,sans-serif' }}>

      {/* ── HEADER ── */}
      <div style={{ padding:'56px 8vw 40px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
          <span style={{ width:28, height:1, background:'#f5f0e8', display:'block' }} />
          <span style={{ fontSize:9, letterSpacing:'.42em', textTransform:'uppercase', color:'#f5f0e8' }}>AI Примерка</span>
        </div>
        <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(36px,5vw,68px)', fontWeight:300, color:'#f5f0e8', lineHeight:.92, marginBottom:12 }}>
          Загрузите вашу<br /><em style={{ color:'#f5f0e8', fontStyle:'italic' }}>кухню или шкаф</em>
        </h1>
        <p style={{ fontSize:11, color:'rgba(245,240,232,.38)', lineHeight:1.9, maxWidth:520 }}>
          AI автоматически определит зоны фасадов и покажет как будут выглядеть наши материалы именно на вашей мебели.
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns: photoUrl ? '1fr 340px' : '1fr', gap:0, minHeight:'70vh' }}>

        {/* ── LEFT: PHOTO + OVERLAYS ── */}
        <div style={{ position:'relative', minHeight: photoUrl ? '70vh' : 'auto' }}>

          {!photoUrl ? (
            /* Upload zone */
            <div
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              style={{
                margin:'0 8vw 60px',
                border: `1.5px dashed ${dragOver ? '#f5f0e8' : 'rgba(245,240,232,.1)'}`,
                background: dragOver ? 'rgba(245,240,232,.04)' : 'rgba(245,240,232,.03)',
                borderRadius:2, cursor:'none',
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                gap:20, padding:'80px 40px',
                transition:'all .3s ease',
              }}
            >
              {/* Upload icon */}
              <div style={{ width:72, height:72, border:'1.5px solid rgba(245,240,232,.1)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(28,25,22,.7)" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:14, color:'rgba(245,240,232,.65)', marginBottom:8, letterSpacing:'.04em' }}>
                  Перетащите фото или нажмите для выбора
                </div>
                <div style={{ fontSize:10, color:'rgba(245,240,232,.3)', letterSpacing:'.1em' }}>
                  JPG, PNG, WEBP · до 15 МБ
                </div>
              </div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center' }}>
                {['Кухня', 'Ванная', 'Шкаф', 'Гостиная', 'Прихожая'].map(r => (
                  <span key={r} style={{ fontSize:8, letterSpacing:'.18em', textTransform:'uppercase', color:'rgba(245,240,232,.5)', border:'1px solid rgba(28,25,22,.2)', padding:'4px 12px' }}>{r}</span>
                ))}
              </div>
            </div>
          ) : (
            /* Photo with overlays */
            <div style={{ position:'relative', width:'100%', height:'100%', overflow:'hidden' }}>
              <img
                src={photoUrl}
                alt="Ваша кухня"
                style={{ width:'100%', height:'100%', objectFit:'contain', objectPosition:'center top', display:'block', background:'#0a0908' }}
              />

              {/* ── ZONE OVERLAYS (blend-mode) ── */}
              {detected && zones.map(zone => (
                <div key={zone.id} style={{
                  position:'absolute',
                  left:`${zone.x1}%`, top:`${zone.y1}%`,
                  width:`${zone.x2-zone.x1}%`, height:`${zone.y2-zone.y1}%`,
                  background: selMat.color,
                  opacity,
                  mixBlendMode: blendMode,
                  transition:'background .4s ease, opacity .4s ease',
                  pointerEvents:'none',
                }} />
              ))}

              {/* Zone labels */}
              {detected && zones.map(zone => (
                <div key={`lbl-${zone.id}`} style={{
                  position:'absolute',
                  left:`${zone.x1}%`, top:`${zone.y1}%`,
                  fontSize:8, letterSpacing:'.15em', textTransform:'uppercase',
                  color:'rgba(28,25,22,.8)',
                  background:'rgba(14,12,10,.7)',
                  padding:'3px 8px',
                  pointerEvents:'none',
                }}>
                  {zone.label}
                </div>
              ))}

              {/* Detecting overlay */}
              {detecting && (
                <div style={{ position:'absolute', inset:0, background:'rgba(14,12,10,.75)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
                  <div style={{
                    width:48, height:48, border:'1px solid rgba(245,240,232,.3)',
                    borderTop:'1px solid #f5f0e8', borderRadius:'50%',
                    animation:'spin .9s linear infinite',
                  }} />
                  <div style={{ fontSize:11, color:'rgba(245,240,232,.55)', letterSpacing:'.15em' }}>
                    AI анализирует фото...
                  </div>
                </div>
              )}

              {/* Bottom gradient */}
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(14,12,10,.4) 0%, transparent 30%)', pointerEvents:'none' }} />

              {/* AI message */}
              {detected && aiMessage && (
                <div style={{
                  position:'absolute', bottom:20, left:20,
                  fontSize:10, color:'rgba(245,240,232,.5)',
                  background:'rgba(14,12,10,.75)', padding:'8px 14px',
                  letterSpacing:'.06em', backdropFilter:'blur(8px)',
                }}>
                  ✦ {aiMessage}
                </div>
              )}
            </div>
          )}

          <input ref={fileRef} type="file" accept="image/*" onChange={onFileInput} style={{ display:'none' }} />
        </div>

        {/* ── RIGHT: CONTROLS PANEL ── */}
        {photoUrl && (
          <div style={{ background:'rgba(20,18,16,.98)', borderLeft:'1px solid rgba(245,240,232,.05)', display:'flex', flexDirection:'column', overflow:'hidden' }}>

            {/* Step 1: detect button */}
            {!detected && (
              <div style={{ padding:'32px 28px', borderBottom:'1px solid rgba(245,240,232,.05)' }}>
                <div style={{ fontSize:8, letterSpacing:'.3em', textTransform:'uppercase', color:'#f5f0e8', marginBottom:14 }}>
                  Шаг 1 — Определить зоны
                </div>
                <p style={{ fontSize:10, color:'rgba(245,240,232,.38)', lineHeight:1.8, marginBottom:20 }}>
                  AI найдёт все зоны мебели на фото и точно разметит их для примерки материала.
                </p>
                <button
                  onClick={detectZones}
                  disabled={detecting}
                  style={{
                    width:'100%', background:'#c4907a', color:'#141210',
                    border:'none', padding:'14px', fontSize:9, fontWeight:500,
                    letterSpacing:'.22em', textTransform:'uppercase', cursor:'none',
                    opacity: detecting ? .7 : 1,
                  }}
                >
                  {detecting ? 'Анализирую...' : '✦ Определить зоны AI'}
                </button>
                {error && (
                  <div style={{ marginTop:12, fontSize:9, color:'rgba(255,100,100,.7)', lineHeight:1.7 }}>{error}</div>
                )}
                <button
                  onClick={() => { setPhotoUrl(null); setPhotoFile(null); setZones([]); setDetected(false); setStep('upload'); }}
                  style={{ width:'100%', marginTop:10, background:'transparent', border:'1px solid rgba(245,240,232,.06)', color:'rgba(245,240,232,.38)', padding:'10px', fontSize:8, letterSpacing:'.18em', textTransform:'uppercase', cursor:'none' }}
                >
                  Загрузить другое фото
                </button>
              </div>
            )}

            {/* Step 2: material selector */}
            {detected && (
              <>
                <div style={{ padding:'24px 28px', borderBottom:'1px solid rgba(245,240,232,.05)', flex:1, overflowY:'auto' }}>
                  <div style={{ fontSize:8, letterSpacing:'.3em', textTransform:'uppercase', color:'#f5f0e8', marginBottom:16 }}>
                    Шаг 2 — Выберите материал
                  </div>

                  <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                    {MATERIALS.map(m => {
                      const isS = selMat.id === m.id;
                      const isH = hovMat === m.id;
                      return (
                        <button key={m.id}
                          onClick={() => setSelMat(m)}
                          onMouseEnter={() => setHovMat(m.id)}
                          onMouseLeave={() => setHovMat(null)}
                          style={{
                            display:'flex', alignItems:'center', gap:14,
                            padding:'10px 12px',
                            background: isS ? 'rgba(245,240,232,.08)' : isH ? 'rgba(245,240,232,.04)' : 'transparent',
                            border: `1px solid ${isS ? 'rgba(28,25,22,.4)' : 'transparent'}`,
                            cursor:'none', transition:'all .2s', textAlign:'left',
                          }}
                        >
                          <div style={{
                            width:32, height:32, borderRadius:'50%', background:m.color, flexShrink:0,
                            border: isS ? '2px solid rgba(245,240,232,.55)' : '2px solid rgba(245,240,232,.1)',
                            boxShadow: isS ? `0 0 14px ${m.color}66` : 'none',
                            transition:'all .3s',
                            position:'relative', overflow:'hidden',
                          }}>
                            <div style={{ position:'absolute', top:4, left:4, right:4, height:'38%', borderRadius:'50% 50% 0 0', background:'rgba(245,240,232,.18)', pointerEvents:'none' }} />
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:11, color: isS ? '#f5f0e8' : 'rgba(245,240,232,.5)', marginBottom:2, transition:'color .2s' }}>{m.name}</div>
                            <div style={{ fontSize:8, color:'rgba(245,240,232,.18)', letterSpacing:'.08em' }}>{m.type} · €{m.price}/м²</div>
                          </div>
                          {isS && <div style={{ width:4, height:4, borderRadius:'50%', background:'#f5f0e8', flexShrink:0 }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Zone calibration */}
                <div style={{ padding:'20px 28px', borderTop:'1px solid rgba(245,240,232,.05)', borderBottom:'1px solid rgba(245,240,232,.05)' }}>
                  <div style={{ fontSize:8, letterSpacing:'.28em', textTransform:'uppercase', color:'rgba(245,240,232,.18)', marginBottom:14 }}>
                    Настройка зон
                  </div>
                  {zones.map(zone => (
                    <div key={zone.id} style={{ marginBottom:14 }}>
                      <div style={{ fontSize:9, color:'rgba(28,25,22,.7)', marginBottom:8, letterSpacing:'.1em' }}>{zone.label}</div>
                      {(['y1','y2'] as const).map(key => (
                        <div key={key} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                          <span style={{ fontSize:7, color:'rgba(245,240,232,.22)', width:12 }}>{key==='y1'?'↑':'↓'}</span>
                          <input type="range" min={0} max={100} step={0.5}
                            value={zone[key]}
                            onChange={e => updateZone(zone.id, key, parseFloat(e.target.value))}
                            style={{ flex:1, height:1 }}
                          />
                          <span style={{ fontSize:8, color:'rgba(245,240,232,.38)', width:28, textAlign:'right' }}>{zone[key].toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Bottom actions */}
                <div style={{ padding:'20px 28px' }}>
                  {/* Price estimate */}
                  <div style={{ marginBottom:16, padding:'12px 14px', background:'rgba(245,240,232,.04)', border:'1px solid rgba(245,240,232,.05)' }}>
                    <div style={{ fontSize:8, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(245,240,232,.22)', marginBottom:6 }}>Примерная стоимость</div>
                    <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:28, color:'#f5f0e8' }}>
                      от €<Counter val={selMat.price * 8} />
                    </div>
                    <div style={{ fontSize:8, color:'rgba(245,240,232,.18)', marginTop:4 }}>{selMat.name} · ~8 м²</div>
                  </div>

                  <a href="/contacts" style={{
                    display:'block', background:'#c4907a', color:'#141210',
                    padding:'13px', fontSize:8, fontWeight:500,
                    letterSpacing:'.22em', textTransform:'uppercase',
                    textAlign:'center', textDecoration:'none', marginBottom:8,
                  }}>
                    Получить точный расчёт
                  </a>
                  <button
                    onClick={() => { setPhotoUrl(null); setPhotoFile(null); setZones([]); setDetected(false); setStep('upload'); }}
                    style={{ width:'100%', background:'transparent', border:'1px solid rgba(245,240,232,.06)', color:'rgba(245,240,232,.38)', padding:'10px', fontSize:8, letterSpacing:'.18em', textTransform:'uppercase', cursor:'none' }}
                  >
                    Загрузить другое фото
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── HOW IT WORKS ── */}
      {!photoUrl && (
        <div style={{ padding:'80px 8vw', borderTop:'1px solid rgba(245,240,232,.05)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:48 }}>
            {[
              { n:'01', title:'Загрузите фото',       desc:'Сфотографируйте свою кухню, ванную, шкаф или любую другую мебель' },
              { n:'02', title:'AI разметит зоны',     desc:'Нейросеть автоматически определит все поверхности фасадов и обведёт их' },
              { n:'03', title:'Выберите материал',    desc:'Переключайте материалы и мгновенно видьте результат на своей мебели' },
            ].map(s => (
              <div key={s.n}>
                <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:64, color:'rgba(28,25,22,.15)', fontWeight:300, lineHeight:1, marginBottom:16 }}>{s.n}</div>
                <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, color:'#f5f0e8', marginBottom:10 }}>{s.title}</div>
                <div style={{ fontSize:11, color:'rgba(245,240,232,.38)', lineHeight:1.8 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
