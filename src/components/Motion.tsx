import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

/** Aparece con desenfoque + desplazamiento al entrar en pantalla. */
export function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }: { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'section' | 'li' }) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <Tag ref={ref as never} className={`reveal ${inView ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</Tag>;
}

/** Orbes de color difuminados que flotan (fondo animado). */
export function Blobs({ variant = 'light', className = '' }: { variant?: 'light' | 'dark' | 'brand'; className?: string }) {
  const sets = {
    light: ['bg-brand/25', 'bg-seg-5/80', 'bg-seg-3/30'],
    dark: ['bg-brand/40', 'bg-seg-2/25', 'bg-seg-4/20'],
    brand: ['bg-white/25', 'bg-seg-5/40', 'bg-seg-2/40'],
  }[variant];
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className={`absolute -left-24 -top-24 h-[28rem] w-[28rem] rounded-full blur-3xl animate-blob ${sets[0]}`} />
      <div className={`absolute -right-32 top-1/4 h-[32rem] w-[32rem] rounded-full blur-3xl animate-blob ${sets[1]}`} style={{ animationDelay: '-6s' }} />
      <div className={`absolute -bottom-32 left-1/3 h-[26rem] w-[26rem] rounded-full blur-3xl animate-blob ${sets[2]}`} style={{ animationDelay: '-12s' }} />
    </div>
  );
}

/** Campo de estrellas titilantes (sección espacial). */
export function Starfield({ count = 60, className = '' }: { count?: number; className?: string }) {
  const stars = useMemo(() => Array.from({ length: count }, (_, i) => ({
    x: (i * 37.7) % 100, y: (i * 61.3 + (i % 7) * 11) % 100, s: 1 + ((i * 13) % 3), d: (i % 10) * 0.35, big: i % 17 === 0,
  })), [count]);
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      {stars.map((st, i) => st.big
        ? <svg key={i} viewBox="0 0 100 100" className="absolute h-3 w-3 animate-twinkle" style={{ left: `${st.x}%`, top: `${st.y}%`, animationDelay: `${st.d}s` }}><path d="M50 0 C54 34 66 46 100 50 C66 54 54 66 50 100 C46 66 34 54 0 50 C34 46 46 34 50 0Z" fill="#FECAA3" /></svg>
        : <span key={i} className="absolute rounded-full bg-white animate-twinkle" style={{ left: `${st.x}%`, top: `${st.y}%`, width: st.s, height: st.s, animationDelay: `${st.d}s`, opacity: 0.7 }} />)}
    </div>
  );
}

/** Movimiento según el mouse (parallax). Devuelve un estilo para cada profundidad. */
export function useParallax() {
  const [p, setP] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const on = (e: MouseEvent) => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setP({ x: e.clientX / window.innerWidth - 0.5, y: e.clientY / window.innerHeight - 0.5 })); };
    window.addEventListener('mousemove', on); return () => { window.removeEventListener('mousemove', on); cancelAnimationFrame(raf); };
  }, []);
  return (depth: number) => ({ transform: `translate3d(${p.x * depth}px, ${p.y * depth}px, 0)`, transition: 'transform .3s ease-out' });
}

/** Número que cuenta hacia arriba al aparecer. */
export function CountUp({ value, className = '' }: { value: string; className?: string }) {
  const num = parseInt(value.replace(/\D/g, ''), 10);
  const prefix = value.match(/^\D*/)?.[0] ?? '';
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el || isNaN(num)) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => { const k = Math.min(1, (t - t0) / 1400); setN(Math.round(num * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    io.observe(el); return () => io.disconnect();
  }, [num]);
  return <span ref={ref} className={className}>{isNaN(num) ? value : `${prefix}${n}`}</span>;
}

/** Barra de progreso de lectura en la parte superior. */
export function ScrollProgress() {
  const [k, setK] = useState(0);
  useEffect(() => {
    const on = () => { const h = document.documentElement; setK(h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)); };
    on(); window.addEventListener('scroll', on, { passive: true }); return () => window.removeEventListener('scroll', on);
  }, []);
  return <div className="scroll-bar fixed inset-x-0 top-0 z-50 h-1 bg-gradient-to-r from-brand via-seg-3 to-seg-5" style={{ transform: `scaleX(${k})` }} aria-hidden />;
}

/** Tarjeta que se inclina levemente siguiendo el mouse. */
export function Tilt({ children, className = '', max = 6 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className={`tilt ${className}`}
      onMouseMove={(e) => { const r = ref.current!.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; ref.current!.style.transform = `perspective(900px) rotateX(${-y * max}deg) rotateY(${x * max}deg) translateY(-4px)`; }}
      onMouseLeave={() => { ref.current!.style.transform = ''; }}>
      {children}
    </div>
  );
}
