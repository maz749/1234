'use client';
import { useEffect, useState, useRef } from 'react';
import { getMaterials } from '@/services/api';
import type { Material } from '@/services/api';
import Link from 'next/link';

const DEMO: Material[] = [
  { id:1, name:'Белый матовый',    type:'lacquer', color:'#141210', price_per_m2:320, texture_url:'', in_stock:true },
  { id:2, name:'Серый бетон',      type:'mdf',     color:'#8a8a82', price_per_m2:285, texture_url:'', in_stock:true },
  { id:3, name:'Чёрный глянец',    type:'lacquer', color:'#f5f0e8', price_per_m2:380, texture_url:'', in_stock:true },
  { id:4, name:'Дуб натуральный',  type:'wood',    color:'#b8834a', price_per_m2:420, texture_url:'', in_stock:true },
  { id:5, name:'Орех тёмный',      type:'wood',    color:'#6b4226', price_per_m2:465, texture_url:'', in_stock:true },
  { id:6, name:'Венге',            type:'veneer',  color:'#2d1a0e', price_per_m2:510, texture_url:'', in_stock:true },
  { id:7, name:'Sage зелёный',     type:'mdf',     color:'#8fa88e', price_per_m2:295, texture_url:'', in_stock:true },
  { id:8, name:'Терракота',        type:'mdf',     color:'#c07a5e', price_per_m2:275, texture_url:'', in_stock:true },
  { id:9, name:'Тёмно-синий',      type:'lacquer', color:'#2c3a52', price_per_m2:340, texture_url:'', in_stock:true },
  { id:10,name:'Розовая пудра',    type:'mdf',     color:'#d4a5a0', price_per_m2:260, texture_url:'', in_stock:true },
  { id:11,name:'Бургундский',      type:'lacquer', color:'#5c2232', price_per_m2:360, texture_url:'', in_stock:false },
  { id:12,name:'Оливковый',        type:'mdf',     color:'#6b7052', price_per_m2:280, texture_url:'', in_stock:true },
];

const IMGS: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&auto=format&fit=crop',
  2: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80&auto=format&fit=crop',
  3: 'https://images.unsplash.com/photo-1593696140826-c58b021acf8b?w=600&q=80&auto=format&fit=crop',
  4: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80&auto=format&fit=crop',
  5: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&q=80&auto=format&fit=crop',
  6: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&q=80&auto=format&fit=crop',
  7: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=80&auto=format&fit=crop',
  8: 'https://images.unsplash.com/photo-1593696140826-c58b021acf8b?w=600&q=80&auto=format&fit=crop',
  9: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80&auto=format&fit=crop',
  10:'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80&auto=format&fit=crop',
  11:'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80&auto=format&fit=crop',
  12:'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=80&auto=format&fit=crop',
};

const TYPES = ['Все', 'lacquer', 'mdf', 'wood', 'veneer'];
const TYPE_LABELS: Record<string, string> = { lacquer:'Лак', mdf:'МДФ', wood:'Дерево', veneer:'Шпон' };

export default function FacadesPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filter, setFilter]       = useState('Все');
  const [colorFilter, setColorFilter] = useState('');
  const [hov, setHov]             = useState<number|null>(null);
  const [lensPos, setLensPos]     = useState({ x:0, y:0 });
  const [lensVis, setLensVis]     = useState<number|null>(null);
  const [loaded, setLoaded]       = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMaterials().then(setMaterials).catch(() => setMaterials(DEMO));
    setTimeout(() => setLoaded(true), 80);
  }, []);

  // Fantoni color proximity filter
  const filtered = materials.filter(m => {
    if (filter !== 'Все' && m.type !== filter) return false;
    if (colorFilter) {
      // simple hue match by comparing hex
      const tr = parseInt(colorFilter.slice(1,3),16);
      const tg = parseInt(colorFilter.slice(3,5),16);
      const tb = parseInt(colorFilter.slice(5,7),16);
      const mr = parseInt(m.color.replace('#','').slice(0,2),16);
      const mg = parseInt(m.color.replace('#','').slice(2,4),16);
      const mb = parseInt(m.color.replace('#','').slice(4,6),16);
      const dist = Math.sqrt((tr-mr)**2+(tg-mg)**2+(tb-mb)**2);
      return dist < 140;
    }
    return true;
  });

  // Drag-to-scroll (Valcucine)
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    scrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft = scrollLeft.current - (x - startX.current);
  };
  const onMouseUp = () => { isDragging.current = false; };

  const onCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, id: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setLensPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setLensVis(id);
  };

  return (
    <div style={{ background:'#141210', minHeight:'100vh', paddingTop:80 }}>

      {/* ── HERO BANNER ── */}
      <div style={{ position:'relative', height:'40vh', overflow:'hidden', marginBottom:0 }}>
        <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=80&auto=format&fit=crop" alt=""
          style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 60%' }} />
        <div style={{ position:'absolute', inset:0, background:'rgba(14,12,10,.7)' }} />
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 8vw' }}>
          <div style={{
            opacity:loaded?1:0, transform:loaded?'none':'translateY(24px)',
            transition:'all .9s cubic-bezier(.16,1,.3,1) .1s',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
              <span style={{ width:28, height:1, background:'#f5f0e8', display:'block' }} />
              <span style={{ fontSize:9, letterSpacing:'.42em', textTransform:'uppercase', color:'#f5f0e8' }}>Каталог материалов</span>
            </div>
            <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(44px,6vw,84px)', fontWeight:300, color:'#f5f0e8', lineHeight:.92 }}>
              47 материалов<br /><em style={{ color:'#f5f0e8', fontStyle:'italic' }}>премиум-класса</em>
            </h1>
          </div>
        </div>
      </div>

      {/* ── FILTER BAR (Fantoni color-wheel + type) ── */}
      <div style={{ padding:'32px 8vw', background:'#0a0908', borderBottom:'1px solid rgba(245,240,232,.05)', display:'flex', alignItems:'center', gap:32, flexWrap:'wrap' }}>

        {/* Type pills */}
        <div style={{ display:'flex', gap:6 }}>
          {TYPES.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{
              padding:'6px 18px', fontSize:8, letterSpacing:'.22em', textTransform:'uppercase', cursor:'none',
              border:`1px solid ${filter===t?'rgba(28,25,22,.4)':'rgba(245,240,232,.06)'}`,
              background: filter===t?'rgba(245,240,232,.06)':'transparent',
              color: filter===t?'#f5f0e8':'rgba(245,240,232,.38)',
              transition:'all .22s',
            }}>
              {t === 'Все' ? 'Все' : TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        <div style={{ width:1, height:24, background:'rgba(255,255,255,.06)' }} />

        {/* Fantoni color wheel filter */}
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:8, letterSpacing:'.28em', textTransform:'uppercase', color:'rgba(245,240,232,.22)' }}>Цвет</span>
          <div style={{ display:'flex', gap:8 }}>
            {['#141210','#f5f0e8','#b8834a','#8a8a82','#8fa88e','#c07a5e','#2d1a0e','#2c3a52',''].map((c,i) => (
              <button key={i} onClick={() => setColorFilter(c)} style={{
                width: c?24:18, height: c?24:18, borderRadius:'50%', cursor:'none',
                background: c || 'transparent',
                border: colorFilter===c
                  ? `2px solid rgba(245,240,232,.82)`
                  : c ? `2px solid rgba(245,240,232,.1)` : `1px solid rgba(245,240,232,.18)`,
                fontSize: c?0:9, color:'rgba(245,240,232,.38)',
                transition:'all .25s var(--ease-expo)',
                boxShadow: colorFilter===c?`0 0 14px ${c}66`:'none',
                flexShrink:0,
              }}>
                {!c && '✕'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginLeft:'auto', fontSize:9, color:'rgba(245,240,232,.18)', letterSpacing:'.1em' }}>
          {filtered.length} материалов
        </div>
      </div>

      {/* ── HORIZONTAL SCROLL (Valcucine drag-to-scroll) ── */}
      <div style={{ padding:'60px 0 40px' }}>
        <div style={{ padding:'0 8vw', marginBottom:20 }}>
          <span style={{ fontSize:8, letterSpacing:'.3em', textTransform:'uppercase', color:'rgba(255,255,255,.18)' }}>
            ← Перетащите для прокрутки →
          </span>
        </div>

        <div
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          style={{
            display:'flex', gap:3,
            overflowX:'auto', padding:'0 8vw',
            scrollbarWidth:'none', userSelect:'none', cursor: isDragging.current ? 'grabbing' : 'none',
          }}
        >
          <style>{`.no-scroll::-webkit-scrollbar{display:none}`}</style>

          {filtered.map((m, i) => {
            const img = IMGS[m.id] || IMGS[1];
            const isHov = hov === m.id;
            const isLens = lensVis === m.id;
            return (
              <div key={m.id}
                onMouseEnter={() => setHov(m.id)}
                onMouseLeave={() => { setHov(null); setLensVis(null); }}
                onMouseMove={e => onCardMouseMove(e, m.id)}
                data-cur={m.name}
                style={{
                  flexShrink:0, width:280, position:'relative', overflow:'hidden',
                  opacity: loaded?1:0, transform: loaded?'none':'translateY(24px)',
                  transition:`opacity .7s ease ${i*.04}s, transform .7s ease ${i*.04}s`,
                }}
              >
                {/* Photo */}
                <div style={{ aspectRatio:'3/4', overflow:'hidden', position:'relative' }}>
                  <img src={img} alt={m.name} style={{
                    width:'100%', height:'100%', objectFit:'cover',
                    transform: isHov?'scale(1.07)':'scale(1)',
                    transition:'transform .9s cubic-bezier(.16,1,.3,1)',
                    pointerEvents:'none',
                  }} />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(14,12,10,.85) 0%,transparent 55%)', opacity:isHov?1:.35, transition:'opacity .5s' }} />

                  {/* Fantoni zoom lens */}
                  <div style={{
                    position:'absolute', left:lensPos.x, top:lensPos.y,
                    width:90, height:90, borderRadius:'50%',
                    border:'1.5px solid rgba(245,240,232,.65)',
                    overflow:'hidden',
                    transform:'translate(-50%,-50%)',
                    opacity: isLens?1:0, transition:'opacity .3s',
                    pointerEvents:'none', zIndex:10,
                    boxShadow:'0 0 24px rgba(0,0,0,.8)',
                  }}>
                    <img src={img} alt="" style={{
                      position:'absolute', width:'200%', height:'200%',
                      objectFit:'cover',
                      top:`-${lensPos.y * .8}px`, left:`-${lensPos.x * .8}px`,
                      transform:'scale(1.6)',
                    }} />
                  </div>

                  {/* Stock badge */}
                  {!m.in_stock && (
                    <div style={{ position:'absolute', top:12, right:12, fontSize:7, letterSpacing:'.22em', textTransform:'uppercase', background:'rgba(14,12,10,.75)', color:'rgba(245,240,232,.45)', padding:'4px 10px' }}>
                      Под заказ
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'20px 16px 14px', transform: isHov?'translateY(0)':'translateY(8px)', opacity:isHov?1:.8, transition:'all .5s ease' }}>
                    <div style={{ fontSize:7, letterSpacing:'.24em', textTransform:'uppercase', color:'#f5f0e8', marginBottom:4 }}>{TYPE_LABELS[m.type]}</div>
                    <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:20, color:'#f5f0e8', lineHeight:1.1 }}>{m.name}</div>
                    <div style={{ fontSize:9, color:'rgba(245,240,232,.42)', marginTop:4 }}>€{m.price_per_m2}/м²</div>
                  </div>
                </div>

                {/* Color swatch */}
                <div style={{ padding:'12px 16px', background:'#141210', display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', background:m.color, border:'1.5px solid rgba(245,240,232,.12)', flexShrink:0 }} />
                  <span style={{ fontSize:8, color:'rgba(245,240,232,.38)', letterSpacing:'.1em' }}>{m.color.toUpperCase()}</span>
                  <Link href="/configurator" style={{ marginLeft:'auto', fontSize:7, letterSpacing:'.22em', textTransform:'uppercase', color:'rgba(245,240,232,.6)', cursor:'none' }}>
                    3D →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── GRID VIEW (Boffi full catalog below scroll) ── */}
      <div style={{ padding:'60px 8vw 120px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:48 }}>
          <span style={{ width:28, height:1, background:'#f5f0e8', display:'block' }} />
          <span style={{ fontSize:9, letterSpacing:'.42em', textTransform:'uppercase', color:'#f5f0e8' }}>Полный каталог</span>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:2 }}>
          {filtered.map((m, i) => {
            const img = IMGS[m.id] || IMGS[1];
            const isH = hov === m.id + 1000;
            return (
              <div key={`g-${m.id}`}
                onMouseEnter={() => setHov(m.id + 1000)}
                onMouseLeave={() => setHov(null)}
                data-cur={m.name}
                style={{ position:'relative', overflow:'hidden', cursor:'none' }}
              >
                <div style={{ aspectRatio:'4/3', overflow:'hidden', position:'relative' }}>
                  <img src={img} alt={m.name} style={{ width:'100%', height:'100%', objectFit:'cover', transform:isH?'scale(1.07)':'scale(1)', transition:'transform .9s cubic-bezier(.16,1,.3,1)' }} />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(14,12,10,.85) 0%,transparent 55%)', opacity:isH?1:.3, transition:'opacity .5s' }} />
                  <div style={{ position:'absolute', bottom:12, left:12, right:12 }}>
                    <div style={{ fontSize:7, letterSpacing:'.2em', textTransform:'uppercase', color:'#f5f0e8', marginBottom:3 }}>{TYPE_LABELS[m.type]}</div>
                    <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:18, color:'#f5f0e8' }}>{m.name}</div>
                    <div style={{ fontSize:9, color:'rgba(245,240,232,.38)', marginTop:3 }}>€{m.price_per_m2}/м²</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
