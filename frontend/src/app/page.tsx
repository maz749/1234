'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import LogoMark from '@/components/logo/LogoMark';

/* ═══════════════════════════════════════════════════════════════════════════
   HOOKS
═══════════════════════════════════════════════════════════════════════════ */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold });
    ob.observe(el);
    return () => ob.disconnect();
  }, [threshold]);
  return { ref, vis };
}

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const fn = () => setY(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return y;
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERO — fullscreen cinematic с параллаксом и морфингом заголовка
═══════════════════════════════════════════════════════════════════════════ */
const SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=92&auto=format&fit=crop',
    word: 'Безупречность',
    sub:  'Lacquer · Gloss · Matt',
    color: '#c4907a',
  },
  {
    img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&q=92&auto=format&fit=crop',
    word: 'Натуральность',
    sub:  'Oak · Walnut · Ash',
    color: '#b8834a',
  },
  {
    img: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=1920&q=92&auto=format&fit=crop',
    word: 'Глубина',
    sub:  'Wenge · Ebony · Dark',
    color: '#8a9aaa',
  },
];

function Hero() {
  const [idx, setIdx]     = useState(0);
  const [prev, setPrev]   = useState(-1);
  const [loaded, setLoaded] = useState(false);
  const scrollY = useScrollY();
  const interval = useRef<ReturnType<typeof setInterval>>();

  const advance = useCallback(() => {
    setIdx(i => {
      setPrev(i);
      return (i + 1) % SLIDES.length;
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    interval.current = setInterval(advance, 5500);
    return () => { clearTimeout(t); clearInterval(interval.current); };
  }, [advance]);

  const s = SLIDES[idx];
  const p = prev >= 0 ? SLIDES[prev] : null;

  return (
    <section style={{ position: 'relative', height: '100vh', overflow: 'hidden', background: '#080706' }}>

      {/* ── Интро-оверлей с логотипом — растворяется когда loaded ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: '#080706',
        opacity: loaded ? 0 : 1,
        pointerEvents: loaded ? 'none' : 'all',
        transition: 'opacity .9s ease 1s',
      }}>
        <LogoMark size={120} color="#f5f0e8" bg="#080706" delay={100} />
        <div style={{
          marginTop: 20,
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 11, letterSpacing: '.42em', textTransform: 'uppercase',
          color: 'rgba(245,240,232,.25)',
          opacity: loaded ? 0 : 1,
          transition: 'opacity .5s ease',
        }}>
          Facade Studio
        </div>
      </div>

      {/* ── Фоновые фото с crossfade ── */}
      {SLIDES.map((sl, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0,
          opacity: i === idx ? 1 : 0,
          transition: 'opacity 1.4s cubic-bezier(.4,0,.2,1)',
          zIndex: 1,
        }}>
          <img src={sl.img} alt="" style={{
            width: '100%', height: '115%',
            objectFit: 'cover', objectPosition: 'center',
            transform: `translateY(${scrollY * 0.35}px)`,
            marginTop: '-7.5%',
          }} />
        </div>
      ))}

      {/* ── Градиентные оверлеи ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to bottom, rgba(8,7,6,.45) 0%, rgba(8,7,6,.1) 30%, rgba(8,7,6,.15) 60%, rgba(8,7,6,.9) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to right, rgba(8,7,6,.7) 0%, transparent 65%)' }} />

      {/* ── Боковая линия-прогресс ── */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, zIndex: 10, background: 'rgba(245,240,232,.04)' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: `${((idx + 1) / SLIDES.length) * 100}%`,
          background: s.color,
          transition: 'height 5.5s linear, background 1.4s ease',
        }} />
      </div>

      {/* ── Контент ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 8vw 10vh' }}>

        {/* Категория */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, opacity: loaded ? 1 : 0, transition: 'opacity .8s ease .4s' }}>
          <div style={{ width: 40, height: 1, background: s.color, transition: 'background 1.4s' }} />
          <span style={{ fontSize: 8, letterSpacing: '.5em', textTransform: 'uppercase', color: s.color, transition: 'color 1.4s', fontWeight: 400 }}>
            Facade Studio
          </span>
        </div>

        {/* Главный заголовок — огромный */}
        <div style={{ overflow: 'hidden', marginBottom: 8 }}>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(80px, 12vw, 175px)',
            fontWeight: 300,
            lineHeight: .85,
            letterSpacing: '-.03em',
            color: '#f5f0e8',
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'none' : 'translateY(60px)',
            transition: 'opacity 1s ease .2s, transform 1.2s cubic-bezier(.16,1,.3,1) .2s',
          }}>
            {s.word}
          </h1>
        </div>

        {/* Sub */}
        <div style={{ overflow: 'hidden', marginBottom: 48 }}>
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(18px, 2vw, 28px)',
            fontStyle: 'italic',
            color: 'rgba(245,240,232,.38)',
            fontWeight: 300,
            letterSpacing: '.08em',
            opacity: loaded ? 1 : 0,
            transform: loaded ? 'none' : 'translateY(30px)',
            transition: 'opacity .8s ease .5s, transform .8s cubic-bezier(.16,1,.3,1) .5s',
          }}>
            {s.sub}
          </p>
        </div>

        {/* Кнопки */}
        <div style={{ display: 'flex', gap: 12, opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(20px)', transition: 'all .8s ease .7s' }}>
          <Link href="/configurator" data-cur="3D" style={{
            background: s.color,
            color: '#080706',
            padding: '15px 42px',
            fontSize: 8, fontWeight: 600,
            letterSpacing: '.28em', textTransform: 'uppercase',
            transition: 'background 1.4s ease',
            display: 'inline-block',
          }}>
            Конфигуратор
          </Link>
          <Link href="/facades" style={{
            background: 'transparent',
            color: 'rgba(245,240,232,.6)',
            border: '1px solid rgba(245,240,232,.18)',
            padding: '15px 42px',
            fontSize: 8,
            letterSpacing: '.28em', textTransform: 'uppercase',
            display: 'inline-block',
          }}>
            Каталог
          </Link>
        </div>

        {/* Слайд-индикаторы */}
        <div style={{ position: 'absolute', right: '8vw', bottom: '10vh', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          {SLIDES.map((sl, i) => (
            <button key={i} onClick={() => { setPrev(idx); setIdx(i); clearInterval(interval.current); interval.current = setInterval(advance, 5500); }} style={{
              background: 'none', border: 'none', cursor: 'none', padding: 0,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 8, letterSpacing: '.2em', color: i === idx ? 'rgba(245,240,232,.5)' : 'rgba(245,240,232,.18)', transition: 'color .4s' }}>
                0{i+1}
              </span>
              <div style={{ height: 1, width: i === idx ? 36 : 16, background: i === idx ? s.color : 'rgba(245,240,232,.18)', transition: 'all .5s cubic-bezier(.34,1.56,.64,1)' }} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div style={{ position: 'absolute', bottom: 44, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: loaded ? .4 : 0, transition: 'opacity 1s ease 1.5s' }}>
        <div style={{ width: 1, height: 60, background: 'rgba(245,240,232,.12)', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, width: '100%', height: '50%', background: '#f5f0e8', animation: 'scrollPulse 2.4s ease-in-out infinite' }} />
        </div>
        <span style={{ fontSize: 7, letterSpacing: '.4em', textTransform: 'uppercase', color: 'rgba(245,240,232,.3)' }}>Scroll</span>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MARQUEE — бегущая строка
═══════════════════════════════════════════════════════════════════════════ */
function Marquee() {
  const items = ['Кухни', 'Шкафы', 'Панели', 'Двери', 'МДФ', 'Шпон', 'Лак', 'Массив', 'Европейская фурнитура', 'Blum · Hettich · Grass'];
  const text = items.join('  ·  ') + '  ·  ';
  return (
    <div style={{ overflow: 'hidden', borderTop: '1px solid rgba(245,240,232,.06)', borderBottom: '1px solid rgba(245,240,232,.06)', padding: '18px 0', background: '#0a0908' }}>
      <style>{`
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
      `}</style>
      <div style={{ display: 'flex', whiteSpace: 'nowrap', animation: 'marquee 28s linear infinite' }}>
        {[0,1].map(k => (
          <span key={k} style={{ display: 'inline-block', paddingRight: 0 }}>
            {items.map((item, i) => (
              <span key={i}>
                <span style={{ fontSize: 9, letterSpacing: '.32em', textTransform: 'uppercase', color: 'rgba(245,240,232,.28)', fontWeight: 300 }}>{item}</span>
                <span style={{ fontSize: 9, color: '#c4907a', margin: '0 24px', opacity: .6 }}>·</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STATEMENT — фраза слева + мозаика фото справа
═══════════════════════════════════════════════════════════════════════════ */
const MOSAIC = [
  { img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=88&auto=format&fit=crop',   row: '1/3', col: '1/2' },
  { img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=88&auto=format&fit=crop', row: '1/2', col: '2/3' },
  { img: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&q=88&auto=format&fit=crop',  row: '2/3', col: '2/3' },
  { img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=88&auto=format&fit=crop', row: '1/2', col: '3/4' },
  { img: 'https://images.unsplash.com/photo-1593696140826-c58b021acf8b?w=600&q=88&auto=format&fit=crop', row: '2/3', col: '3/4' },
];

function Statement() {
  const { ref, vis } = useInView(.12);
  const [hovIdx, setHovIdx] = useState<number|null>(null);

  return (
    <section ref={ref} style={{ padding: 'clamp(80px,10vh,140px) 0', background: '#141210', overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, alignItems: 'center', minHeight: 560 }}>

        {/* ── ЛЕВАЯ: текст ── */}
        <div style={{ padding: '0 8vw' }}>
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(28px,3.4vw,52px)',
            fontWeight: 300, lineHeight: 1.28, letterSpacing: '.01em',
            color: vis ? 'rgba(245,240,232,.85)' : 'rgba(245,240,232,0)',
            transition: 'color 1.6s ease',
          }}>
            Мы делаем фасады для тех, кто понимает разницу между{' '}
            <em style={{ fontStyle: 'italic', color: vis ? '#c4907a' : 'rgba(196,144,122,0)', transition: 'color 1.6s ease .35s' }}>
              мебелью
            </em>
            {' '}и{' '}
            <em style={{ fontStyle: 'italic', color: vis ? '#f5f0e8' : 'rgba(245,240,232,0)', transition: 'color 1.6s ease .7s' }}>
              пространством
            </em>.
          </p>

          {/* Растущая линия */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 44 }}>
            <div style={{ width: 1, height: vis ? 64 : 0, background: '#c4907a', transition: 'height 1.1s cubic-bezier(.16,1,.3,1) .5s' }} />
            <p style={{
              fontSize: 12, color: 'rgba(245,240,232,.32)', lineHeight: 1.8, maxWidth: 260, fontWeight: 300,
              opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(10px)',
              transition: 'all .9s ease .9s',
            }}>
              Производство в России. Европейская фурнитура. Без посредников.
            </p>
          </div>

          <div style={{ marginTop: 44, opacity: vis ? 1 : 0, transition: 'opacity .8s ease 1.1s' }}>
            <Link href="/contacts" style={{
              fontSize: 8, letterSpacing: '.38em', textTransform: 'uppercase',
              color: 'rgba(245,240,232,.35)',
              borderBottom: '1px solid rgba(245,240,232,.12)', paddingBottom: 3,
            }}>
              О компании
            </Link>
          </div>
        </div>

        {/* ── ПРАВАЯ: мозаика 3×2 ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: 3,
          height: 560,
        }}>
          {MOSAIC.map((m, i) => (
            <div key={i}
              onMouseEnter={() => setHovIdx(i)}
              onMouseLeave={() => setHovIdx(null)}
              style={{
                gridRow: m.row, gridColumn: m.col,
                overflow: 'hidden', position: 'relative',
                opacity: vis ? 1 : 0,
                transform: vis ? 'none' : `translateY(${20 + i * 8}px)`,
                transition: `opacity .8s ease ${i * .1}s, transform .9s cubic-bezier(.16,1,.3,1) ${i * .1}s`,
              }}
            >
              <img src={m.img} alt="" style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transform: hovIdx === i ? 'scale(1.08)' : 'scale(1)',
                transition: 'transform 1.2s cubic-bezier(.16,1,.3,1)',
                filter: hovIdx !== null && hovIdx !== i ? 'brightness(.6)' : 'brightness(1)',
              }} />
              {/* Тонкий оверлей */}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,7,6,.15)', transition: 'opacity .4s' }} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   WORKS — горизонтальный скролл портфолио
═══════════════════════════════════════════════════════════════════════════ */
const WORKS = [
  { img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1000&q=88&auto=format&fit=crop', name: 'Белый глянец',      mat: 'Lacquer Matt',  city: 'Москва',    year: '2024', w: '520px' },
  { img: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&q=88&auto=format&fit=crop',  name: 'Тёмный орех',      mat: 'Шпон венге',    city: 'Питер',     year: '2024', w: '380px' },
  { img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=88&auto=format&fit=crop', name: 'Дуб натуральный',  mat: 'Шпон дуб',      city: 'Сочи',      year: '2023', w: '460px' },
  { img: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=700&q=88&auto=format&fit=crop',  name: 'Серый бетон',      mat: 'МДФ текстура',  city: 'Казань',    year: '2024', w: '400px' },
  { img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=700&q=88&auto=format&fit=crop', name: 'Sage матовый',     mat: 'МДФ крашеный',  city: 'Новосибирск', year: '2023', w: '440px' },
  { img: 'https://images.unsplash.com/photo-1593696140826-c58b021acf8b?w=700&q=88&auto=format&fit=crop', name: 'Нюд',              mat: 'МДФ матовый',   city: 'Екатеринбург', year: '2024', w: '380px' },
];

function Works() {
  const track = useRef<HTMLDivElement>(null);
  const [hov, setHov] = useState<number|null>(null);
  const { ref, vis } = useInView(.1);

  // Горизонтальный скролл колёсиком
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const fn = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY * 1.4;
    };
    el.addEventListener('wheel', fn, { passive: false });
    return () => el.removeEventListener('wheel', fn);
  }, []);

  return (
    <section style={{ padding: 'clamp(80px,12vh,140px) 0', background: '#0a0908', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '0 8vw', marginBottom: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div ref={ref}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, opacity: vis?1:0, transition: 'opacity .7s ease' }}>
            <div style={{ width: 24, height: 1, background: '#c4907a' }} />
            <span style={{ fontSize: 8, letterSpacing: '.46em', textTransform: 'uppercase', color: 'rgba(245,240,232,.38)' }}>Работы</span>
          </div>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(44px,5.5vw,82px)',
            fontWeight: 300, lineHeight: .9,
            color: '#f5f0e8',
            opacity: vis?1:0, transform: vis?'none':'translateY(32px)',
            transition: 'opacity .9s ease .1s, transform .9s cubic-bezier(.16,1,.3,1) .1s',
          }}>
            Реализованные<br /><em style={{ fontStyle: 'italic' }}>проекты</em>
          </h2>
        </div>
        <div style={{ opacity: vis?1:0, transition: 'opacity .7s ease .3s', textAlign: 'right' }}>
          <div style={{ fontSize: 9, color: 'rgba(245,240,232,.28)', letterSpacing: '.12em', marginBottom: 6 }}>← тяни для скролла →</div>
          <Link href="/facades" style={{ fontSize: 8, letterSpacing: '.36em', textTransform: 'uppercase', color: 'rgba(245,240,232,.35)', borderBottom: '1px solid rgba(245,240,232,.12)', paddingBottom: 3 }}>
            Все работы
          </Link>
        </div>
      </div>

      {/* Горизонтальный трек */}
      <div ref={track} style={{ display: 'flex', gap: 3, paddingLeft: '8vw', paddingRight: '8vw', overflowX: 'auto', scrollbarWidth: 'none', cursor: 'none' }}>
        <style>{`::-webkit-scrollbar{display:none}`}</style>
        {WORKS.map((w, i) => (
          <div key={i}
            style={{ flexShrink: 0, width: w.w, position: 'relative', overflow: 'hidden' }}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
            data-cur="View"
          >
            <div style={{ paddingBottom: '130%', position: 'relative' }}>
              <img src={w.img} alt={w.name} style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%', objectFit: 'cover',
                transform: hov===i ? 'scale(1.06)' : 'scale(1)',
                transition: 'transform 1.2s cubic-bezier(.16,1,.3,1)',
              }} />
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(8,7,6,${hov===i?.9:.5}) 0%, transparent 55%)`, transition: 'background .5s' }} />

              {/* Номер */}
              <div style={{ position: 'absolute', top: 20, right: 22, fontFamily: 'Cormorant Garamond,serif', fontSize: 52, color: 'rgba(245,240,232,.1)', fontWeight: 300, lineHeight: 1 }}>
                {String(i+1).padStart(2,'0')}
              </div>

              {/* Инфо внизу */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 24px' }}>
                <div style={{ fontSize: 7, letterSpacing: '.3em', textTransform: 'uppercase', color: 'rgba(245,240,232,.38)', marginBottom: 8 }}>{w.mat}</div>
                <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 24, color: '#f5f0e8', lineHeight: 1.1, marginBottom: 6 }}>{w.name}</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 9, color: 'rgba(245,240,232,.35)' }}>{w.city}</span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#c4907a', display: 'inline-block' }} />
                  <span style={{ fontSize: 9, color: 'rgba(245,240,232,.35)' }}>{w.year}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   VIDEO SECTION — fullbleed с текстом поверх
═══════════════════════════════════════════════════════════════════════════ */
function VideoSection() {
  const { ref, vis } = useInView(.1);
  const scrollY = useScrollY();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [offsetTop, setOffsetTop] = useState(0);

  useEffect(() => {
    setOffsetTop(sectionRef.current?.offsetTop ?? 0);
  }, []);

  const parallax = Math.max(0, scrollY - offsetTop) * .3;

  return (
    <section ref={sectionRef} style={{ position: 'relative', height: '90vh', overflow: 'hidden', background: '#060504' }}>
      {/* Video / fallback photo */}
      <div style={{ position: 'absolute', inset: 0, transform: `translateY(${parallax}px) scale(1.15)`, transformOrigin: 'center top' }}>
        <video
          autoPlay muted loop playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .65 }}
          poster="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=80"
        >
          <source src="https://www.pexels.com/download/video/3015432/?fps=25.0&h=1080&w=1920" type="video/mp4" />
        </video>
      </div>

      {/* Оверлей */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(6,5,4,.3) 0%, rgba(6,5,4,.5) 100%)' }} />

      {/* Текст по центру */}
      <div ref={ref} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 8vw' }}>
        <div style={{ fontSize: 8, letterSpacing: '.5em', textTransform: 'uppercase', color: '#c4907a', marginBottom: 24, opacity: vis?1:0, transition: 'opacity .8s ease' }}>
          Ручная работа
        </div>
        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 'clamp(52px,7vw,110px)',
          fontWeight: 300, lineHeight: .88,
          letterSpacing: '-.02em',
          color: '#f5f0e8',
          opacity: vis?1:0,
          transform: vis?'none':'translateY(40px)',
          transition: 'opacity 1s ease .2s, transform 1.2s cubic-bezier(.16,1,.3,1) .2s',
          maxWidth: 900,
        }}>
          Каждый фасад —<br />
          <em style={{ fontStyle: 'italic', color: 'rgba(245,240,232,.55)' }}>произведение</em>
        </h2>
        <div style={{ marginTop: 48, width: vis?80:0, height: 1, background: 'rgba(245,240,232,.25)', transition: 'width 1.2s ease .8s' }} />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MATERIALS — split с интерактивным списком и большим фото
═══════════════════════════════════════════════════════════════════════════ */
const MATS = [
  { name: 'Дуб натуральный', type: 'Шпон',    color: '#b8834a', price: '€420/м²', img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1000&q=88&auto=format&fit=crop' },
  { name: 'Белый матовый',   type: 'МДФ',     color: '#e0dbd2', price: '€320/м²', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1000&q=88&auto=format&fit=crop' },
  { name: 'Венге',           type: 'Шпон',    color: '#2d1a0e', price: '€510/м²', img: 'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=1000&q=88&auto=format&fit=crop' },
  { name: 'Нюд',             type: 'МДФ',     color: '#c4907a', price: '€275/м²', img: 'https://images.unsplash.com/photo-1593696140826-c58b021acf8b?w=1000&q=88&auto=format&fit=crop' },
  { name: 'Sage',            type: 'МДФ',     color: '#8fa88e', price: '€295/м²', img: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1000&q=88&auto=format&fit=crop' },
  { name: 'Графит',          type: 'Lacquer', color: '#3e3c38', price: '€380/м²', img: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=1000&q=88&auto=format&fit=crop' },
];

function Materials() {
  const [active, setActive] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(true);
  const { ref, vis } = useInView(.08);

  const handleHover = (i: number) => {
    setImgLoaded(false);
    setActive(i);
    setTimeout(() => setImgLoaded(true), 50);
  };

  return (
    <section style={{ background: '#141210', padding: 'clamp(80px,12vh,140px) 0', overflow: 'hidden' }}>
      <div style={{ padding: '0 8vw', marginBottom: 72 }}>
        <div ref={ref}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, opacity: vis?1:0, transition: 'opacity .7s' }}>
            <div style={{ width: 24, height: 1, background: '#c4907a' }} />
            <span style={{ fontSize: 8, letterSpacing: '.46em', textTransform: 'uppercase', color: 'rgba(245,240,232,.38)' }}>Материалы</span>
          </div>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(44px,5.5vw,82px)',
            fontWeight: 300, lineHeight: .9, color: '#f5f0e8',
            opacity: vis?1:0, transform: vis?'none':'translateY(32px)',
            transition: 'opacity .9s ease .1s, transform .9s cubic-bezier(.16,1,.3,1) .1s',
          }}>
            47 отделок<br /><em style={{ fontStyle: 'italic' }}>на выбор</em>
          </h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 640 }}>

        {/* Большое фото слева */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {MATS.map((m, i) => (
            <div key={i} style={{
              position: 'absolute', inset: 0,
              opacity: i===active ? 1 : 0,
              transition: 'opacity .9s cubic-bezier(.4,0,.2,1)',
            }}>
              <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: i===active?'scale(1.03)':'scale(1)', transition: 'transform 6s ease' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 55%, #141210 100%)' }} />
            </div>
          ))}
          {/* Цветной квадрат */}
          <div style={{
            position: 'absolute', bottom: 40, left: 40,
            width: 48, height: 48,
            background: MATS[active].color,
            transition: 'background .6s ease',
            boxShadow: `0 0 60px ${MATS[active].color}44`,
          }} />
          <div style={{ position: 'absolute', bottom: 44, left: 108, fontSize: 16, letterSpacing: '.12em', color: 'rgba(245,240,232,.5)', fontFamily: 'Cormorant Garamond,serif', fontStyle: 'italic' }}>
            {MATS[active].name}
          </div>
        </div>

        {/* Список справа */}
        <div style={{ padding: '52px 8vw 52px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {MATS.map((m, i) => (
            <div key={i}
              onMouseEnter={() => handleHover(i)}
              style={{
                padding: '20px 0',
                borderBottom: '1px solid rgba(245,240,232,.05)',
                cursor: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                opacity: vis?1:0, transform: vis?'none':'translateX(28px)',
                transition: `opacity .6s ease ${i*.07}s, transform .6s ease ${i*.07}s`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <div style={{
                  width: 2, height: i===active ? 36 : 12,
                  background: i===active ? '#c4907a' : 'rgba(245,240,232,.1)',
                  transition: 'all .5s cubic-bezier(.16,1,.3,1)', flexShrink: 0,
                }} />
                <div>
                  <div style={{
                    fontFamily: i===active ? 'Cormorant Garamond,serif' : 'Montserrat,sans-serif',
                    fontSize: i===active ? 30 : 12,
                    fontWeight: 300,
                    color: i===active ? '#f5f0e8' : 'rgba(245,240,232,.28)',
                    transition: 'all .5s cubic-bezier(.16,1,.3,1)',
                    letterSpacing: i===active ? '-.01em' : '.04em',
                  }}>{m.name}</div>
                  <div style={{ fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: i===active?'rgba(245,240,232,.3)':'transparent', transition: 'color .3s', marginTop: 4 }}>{m.type}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: i===active?'#c4907a':'transparent', transition: 'color .3s', fontFamily: 'Cormorant Garamond,serif' }}>
                {m.price}
              </div>
            </div>
          ))}
          <div style={{ marginTop: 40 }}>
            <Link href="/facades" style={{ fontSize: 8, letterSpacing: '.36em', textTransform: 'uppercase', color: 'rgba(245,240,232,.3)', borderBottom: '1px solid rgba(245,240,232,.1)', paddingBottom: 3 }}>
              Все материалы
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   NUMBERS — минималистичные цифры
═══════════════════════════════════════════════════════════════════════════ */
function Numbers() {
  const data = [
    { v: '12', unit: 'лет', l: 'на рынке' },
    { v: '2 400', unit: '', l: 'проектов' },
    { v: '47', unit: '', l: 'материалов' },
    { v: '25', unit: 'дн', l: 'производство' },
  ];
  const { ref, vis } = useInView(.15);
  return (
    <section ref={ref} style={{ padding: 'clamp(60px,8vh,100px) 8vw', borderTop: '1px solid rgba(245,240,232,.05)', borderBottom: '1px solid rgba(245,240,232,.05)', background: '#0a0908' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
        {data.map((d, i) => (
          <div key={i} style={{
            textAlign: 'center', padding: '0 16px',
            borderRight: i<3 ? '1px solid rgba(245,240,232,.05)' : 'none',
            opacity: vis?1:0, transform: vis?'none':'translateY(20px)',
            transition: `opacity .7s ease ${i*.1}s, transform .7s ease ${i*.1}s`,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 5, marginBottom: 10 }}>
              <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 'clamp(44px,5vw,76px)', fontWeight: 300, color: '#f5f0e8', lineHeight: 1 }}>{d.v}</span>
              {d.unit && <span style={{ fontSize: 13, color: '#c4907a' }}>{d.unit}</span>}
            </div>
            <div style={{ fontSize: 8, letterSpacing: '.32em', textTransform: 'uppercase', color: 'rgba(245,240,232,.25)' }}>{d.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROCESS — вертикальный таймлайн
═══════════════════════════════════════════════════════════════════════════ */
const STEPS = [
  { n: '01', title: 'Консультация',  desc: 'Замер, подбор материалов, техническое задание. Выезд мастера бесплатно.' },
  { n: '02', title: 'Визуализация',  desc: '3D-рендер за 3 дня. Утверждение цвета, фактуры, фурнитуры в конфигураторе.' },
  { n: '03', title: 'Производство',  desc: '25 рабочих дней. ЧПУ-обработка, шлифовка, покраска, контроль качества.' },
  { n: '04', title: 'Монтаж',        desc: 'Собственная бригада. Монтаж за 1-2 дня. Гарантия 5 лет на все виды работ.' },
];

function Process() {
  const { ref, vis } = useInView(.08);
  return (
    <section style={{ padding: 'clamp(80px,12vh,140px) 8vw', background: '#141210' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8vw', alignItems: 'start' }}>

        {/* Левая — заголовок прилипший */}
        <div style={{ position: 'sticky', top: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 24, height: 1, background: '#c4907a' }} />
            <span style={{ fontSize: 8, letterSpacing: '.46em', textTransform: 'uppercase', color: 'rgba(245,240,232,.38)' }}>Процесс</span>
          </div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(44px,5vw,82px)', fontWeight: 300, lineHeight: .9, color: '#f5f0e8', marginBottom: 40 }}>
            От идеи<br /><em style={{ fontStyle: 'italic' }}>до результата</em>
          </h2>
          <p style={{ fontSize: 12, color: 'rgba(245,240,232,.32)', lineHeight: 1.8, maxWidth: 340, marginBottom: 48 }}>
            Полный цикл без посредников — от первого звонка до ключей в двери.
          </p>
          <Link href="/contacts" style={{ fontSize: 8, letterSpacing: '.36em', textTransform: 'uppercase', color: 'rgba(245,240,232,.35)', borderBottom: '1px solid rgba(245,240,232,.12)', paddingBottom: 3 }}>
            Начать проект
          </Link>
        </div>

        {/* Правая — шаги */}
        <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {STEPS.map((s, i) => (
            <div key={s.n} style={{
              padding: '40px 0',
              borderBottom: '1px solid rgba(245,240,232,.06)',
              opacity: vis?1:0, transform: vis?'none':'translateX(30px)',
              transition: `opacity .7s ease ${i*.15}s, transform .7s ease ${i*.15}s`,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, marginBottom: 16 }}>
                <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 48, color: 'rgba(245,240,232,.08)', fontWeight: 300, lineHeight: 1, minWidth: 60 }}>{s.n}</span>
                <span style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 26, color: '#f5f0e8', fontWeight: 300 }}>{s.title}</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(245,240,232,.35)', lineHeight: 1.8, paddingLeft: 80 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CTA — финальный блок с большой буквой
═══════════════════════════════════════════════════════════════════════════ */
function CTA() {
  const { ref, vis } = useInView(.15);
  return (
    <section ref={ref} style={{ position: 'relative', padding: 'clamp(100px,15vh,180px) 8vw', background: '#0a0908', overflow: 'hidden', borderTop: '1px solid rgba(245,240,232,.05)' }}>

      {/* Фоновая буква */}
      <div style={{
        position: 'absolute', right: '-2vw', top: '50%', transform: 'translateY(-50%)',
        fontFamily: 'Cormorant Garamond,serif',
        fontSize: '38vw', fontWeight: 300, lineHeight: 1,
        color: 'rgba(245,240,232,.025)',
        userSelect: 'none', pointerEvents: 'none',
        transition: 'opacity 1.5s ease',
        opacity: vis ? 1 : 0,
      }}>F</div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 720 }}>
        <div style={{ opacity: vis?1:0, transform: vis?'none':'translateY(40px)', transition: 'all 1.1s cubic-bezier(.16,1,.3,1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{ width: 24, height: 1, background: '#c4907a' }} />
            <span style={{ fontSize: 8, letterSpacing: '.46em', textTransform: 'uppercase', color: 'rgba(245,240,232,.38)' }}>Начать</span>
          </div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(52px,7vw,112px)', fontWeight: 300, lineHeight: .88, letterSpacing: '-.02em', color: '#f5f0e8', marginBottom: 24 }}>
            Спроектируйте<br />
            <em style={{ color: '#c4907a', fontStyle: 'italic' }}>пространство мечты</em>
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(245,240,232,.3)', lineHeight: 1.8, maxWidth: 400, marginBottom: 56, fontWeight: 300 }}>
            Бесплатный замер и консультация дизайнера.<br />
            Или попробуйте 3D-конфигуратор прямо сейчас.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/configurator" data-cur="3D" style={{ background: '#c4907a', color: '#080706', padding: '16px 46px', fontSize: 8, fontWeight: 600, letterSpacing: '.28em', textTransform: 'uppercase', display: 'inline-block' }}>
              Конфигуратор
            </Link>
            <Link href="/contacts" style={{ background: 'transparent', color: 'rgba(245,240,232,.55)', border: '1px solid rgba(245,240,232,.14)', padding: '16px 46px', fontSize: 8, letterSpacing: '.28em', textTransform: 'uppercase', display: 'inline-block' }}>
              Консультация
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <div style={{ background: '#141210' }}>
      <Hero />
      <Marquee />
      <Statement />
      <Works />
      <VideoSection />
      <Materials />
      <Numbers />
      <Process />
      <CTA />
    </div>
  );
}
