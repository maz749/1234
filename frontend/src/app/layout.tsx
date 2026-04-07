'use client';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import LogoMark from '@/components/logo/LogoMark';



const NAV = [
  { href: '/facades',      label: 'Каталог' },
  { href: '/configurator', label: 'Конфигуратор' },
  { href: '/calculator',   label: 'Калькулятор' },
  { href: '/gallery',      label: 'AI Примерка' },
  { href: '/contacts',     label: 'Контакты' },
];
const FULLSCREEN = ['/configurator'];

/* ── CUSTOM CURSOR (Molteni·C — dual ring with lag) ─────────────────────── */
function Cursor() {
  const dotRef   = useRef<HTMLDivElement>(null);
  const ringRef  = useRef<HTMLDivElement>(null);
  const lblRef   = useRef<HTMLDivElement>(null);
  const mouse    = useRef({ x: -300, y: -300 });
  const lagged   = useRef({ x: -300, y: -300 });

  useEffect(() => {
    let raf: number;

    const onMove = (e: MouseEvent) => { mouse.current = { x: e.clientX, y: e.clientY }; };

    const tick = () => {
      lagged.current.x += (mouse.current.x - lagged.current.x) * 0.1;
      lagged.current.y += (mouse.current.y - lagged.current.y) * 0.1;
      const { x, y } = mouse.current;
      const { x: lx, y: ly } = lagged.current;
      dotRef.current  && (dotRef.current.style.transform  = `translate(${x}px,${y}px) translate(-50%,-50%)`);
      ringRef.current && (ringRef.current.style.transform = `translate(${lx}px,${ly}px) translate(-50%,-50%)`);
      lblRef.current  && (lblRef.current.style.transform  = `translate(${lx}px,${ly}px) translate(-50%,28px)`);
      raf = requestAnimationFrame(tick);
    };

    const onOver = (e: MouseEvent) => {
      const t   = e.target as HTMLElement;
      const lbl = t.closest('[data-cur]')?.getAttribute('data-cur') ?? null;
      const hot = !!t.closest('a,button,input,[role=button],[data-cur]');
      const r = ringRef.current, l = lblRef.current;
      if (!r) return;
      if (lbl) {
        r.style.width = r.style.height = '80px';
        r.style.borderColor = 'rgba(245,240,232,.55)';
        r.style.background  = 'rgba(245,240,232,.04)';
        if (l) { l.textContent = lbl; l.classList.add('show'); }
      } else if (hot) {
        r.style.width = r.style.height = '52px';
        r.style.borderColor = 'rgba(196,144,122,.35)';
        r.style.background  = 'transparent';
        if (l) l.classList.remove('show');
      } else {
        r.style.width = r.style.height = '36px';
        r.style.borderColor = 'rgba(245,240,232,.22)';
        r.style.background  = 'transparent';
        if (l) l.classList.remove('show');
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseover', onOver);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  id="c-dot" />
      <div ref={ringRef} id="c-ring" />
      <div ref={lblRef}  id="c-label" />
    </>
  );
}

/* ── PAGE TRANSITION (Minotti wipe) ─────────────────────────────────────── */
function Transition() {
  const pathname = usePathname();
  const [on, setOn] = useState(false);
  const prev = useRef(pathname);
  useEffect(() => {
    if (prev.current === pathname) return;
    prev.current = pathname;
    setOn(true);
    const t = setTimeout(() => setOn(false), 480);
    return () => clearTimeout(t);
  }, [pathname]);
  return (
    <div style={{
      position:'fixed',inset:0,zIndex:99996,background:'#141210',
      pointerEvents: on ? 'all' : 'none',
      opacity: on ? 1 : 0,
      transition: on ? 'opacity .22s ease' : 'opacity .38s ease .1s',
    }} />
  );
}

/* ── NAV (smart scroll shrink) ───────────────────────────────────────────── */
function Nav({ path }: { path: string }) {
  const { user, logout } = useAuthStore();
  const [sc, setSc] = useState(false);
  useEffect(() => {
    const fn = () => setSc(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <nav style={{
      position:'fixed',top:0,left:0,right:0,zIndex:1000,
      display:'flex',alignItems:'center',justifyContent:'space-between',
      padding:'0 52px', height: sc ? 62 : 80,
      background: sc ? 'rgba(20,18,16,.97)' : 'linear-gradient(to bottom,rgba(14,12,10,.72) 0%,transparent 100%)',
      backdropFilter: sc ? 'blur(24px)' : 'none',
      borderBottom: sc ? '1px solid rgba(245,240,232,.06)' : 'none',
      transition: 'all .5s cubic-bezier(.16,1,.3,1)',
    }}>
      <Link href="/" style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none' }}>
        <LogoMark size={sc ? 28 : 34} color="#f5f0e8" bg={sc ? "rgba(20,18,16,1)" : "rgba(8,7,6,0.7)"} delay={400} />
        <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:15, letterSpacing:'.24em', fontWeight:300, color:'#f5f0e8', transition:'font-size .4s' }}>
          FACADE<span style={{color:'#c4907a', margin:'0 2px'}}>·</span>STUDIO
        </span>
      </Link>
      <ul style={{ display:'flex', gap:44, listStyle:'none', alignItems:'center' }}>
        {NAV.map(l => (
          <li key={l.href}>
            <Link href={l.href} data-cur={l.label} style={{
              fontSize:9, letterSpacing:'.28em', textTransform:'uppercase',
              color: path.startsWith(l.href) ? '#f5f0e8' : 'rgba(245,240,232,.5)',
              borderBottom: path.startsWith(l.href) ? '1px solid rgba(245,240,232,.55)' : '1px solid transparent',
              paddingBottom:3, transition:'color .3s',
            }}>{l.label}</Link>
          </li>
        ))}
        {user ? (
          <>
            <li><Link href="/projects" style={{fontSize:9,letterSpacing:'.28em',textTransform:'uppercase',color:'rgba(245,240,232,.5)'}}>Проекты</Link></li>
            <li><button onClick={logout} style={{background:'transparent',border:'1px solid rgba(28,25,22,.28)',color:'#f5f0e8',padding:'7px 18px',fontSize:9,letterSpacing:'.22em',textTransform:'uppercase',cursor:'none'}}>Выйти</button></li>
          </>
        ) : (
          <li><Link href="/auth" style={{border:'1px solid rgba(28,25,22,.32)',color:'#f5f0e8',padding:'8px 22px',fontSize:9,letterSpacing:'.22em',textTransform:'uppercase',display:'inline-block'}}>Войти</Link></li>
        )}
      </ul>
    </nav>
  );
}

/* ── FOOTER ──────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background:'#1e1b18', borderTop:'1px solid rgba(245,240,232,.08)', padding:'80px 52px 48px' }}>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:56, marginBottom:64 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24 }}>
            <LogoMark size={38} color="#f5f0e8" bg="#1e1b18" delay={0} loop={true} />
            <span style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, letterSpacing:'.18em', fontWeight:300, color:'#f5f0e8' }}>
              FACADE<span style={{color:'#c4907a', margin:'0 2px'}}>·</span>STUDIO
            </span>
          </div>
          <p style={{ fontSize:11, color:'rgba(245,240,232,.18)', lineHeight:2, maxWidth:260, fontWeight:300 }}>
            Премиальные интерьерные фасады из массива дерева, МДФ и натурального камня. Собственное производство.
          </p>
        </div>
        {[
          { t:'Продукты', items:[{h:'/facades',l:'Каталог'},{h:'/configurator',l:'Конфигуратор'},{h:'/calculator',l:'Калькулятор'},{h:'/gallery',l:'AI Примерка'}] },
          { t:'Компания',  items:[{h:'/contacts',l:'Контакты'},{h:'/projects',l:'Проекты'},{h:'/auth',l:'Личный кабинет'}] },
          { t:'Контакты',  items:[{h:'#',l:'info@facade-studio.ru'},{h:'#',l:'+7 800 555-00-00'},{h:'#',l:'Пн–Пт 10–19'}] },
        ].map((col,i) => (
          <div key={i}>
            <div style={{ fontSize:8, letterSpacing:'.35em', textTransform:'uppercase', color:'#f5f0e8', marginBottom:24 }}>{col.t}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {col.items.map(item => (
                <Link key={item.l} href={item.h} style={{ fontSize:10, color:'rgba(245,240,232,.22)', letterSpacing:'.06em', fontWeight:300 }}>{item.l}</Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', paddingTop:24, borderTop:'1px solid rgba(245,240,232,.05)', alignItems:'center' }}>
        <span style={{ fontSize:9, color:'rgba(245,240,232,.1)', letterSpacing:'.15em' }}>© 2024 Facade Studio</span>
        <span style={{ fontSize:9, color:'rgba(245,240,232,.1)', letterSpacing:'.1em', fontStyle:'italic', fontFamily:'Cormorant Garamond,serif' }}>Handcrafted with precision</span>
      </div>
    </footer>
  );
}

/* ── ROOT ────────────────────────────────────────────────────────────────── */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const fs   = FULLSCREEN.includes(path);
  return (
    <html lang="ru">
      <head>
        <title>Facade Studio — Дизайн фасадов</title>
        <meta name="description" content="Премиальные интерьерные фасады. 3D конфигуратор, AI-примерка, расчёт." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Montserrat:wght@200;300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Cursor />
        <Transition />
        <Toaster position="top-right" toastOptions={{ style:{ background:'#141210', color:'#f5f0e8', border:'1px solid rgba(245,240,232,.12)', fontSize:11, letterSpacing:'.04em', boxShadow:'0 8px 32px rgba(245,240,232,.12)', borderRadius:0 } }} />
        {!fs && <Nav path={path} />}
        <main>{children}</main>
        {!fs && <Footer />}
      </body>
    </html>
  );
}
