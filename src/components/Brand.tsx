/** Elementos gráficos de la identidad CIPRO (archivo madre): dona de 5 segmentos, estrella de 4 puntas y constelaciones. */
const SEGS = ['#FECAA3', '#F4A487', '#FD8A55', '#FE6F06', '#FF5117']; // sentido horario desde las 12

function arc(cx: number, cy: number, r1: number, r2: number, a0: number, a1: number) {
  const p = (r: number, a: number) => [cx + r * Math.cos((a - 90) * Math.PI / 180), cy + r * Math.sin((a - 90) * Math.PI / 180)];
  const [x1, y1] = p(r2, a0), [x2, y2] = p(r2, a1), [x3, y3] = p(r1, a1), [x4, y4] = p(r1, a0);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${x1},${y1} A${r2},${r2} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${r1},${r1} 0 ${large} 0 ${x4},${y4} Z`;
}

/** La "O" de CIPRO. `labels` permite mostrar los 5 pilares en los segmentos. */
export function Donut({ className = '', active, onHover, gap = 5 }: { className?: string; active?: number | null; onHover?: (i: number | null) => void; gap?: number }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden={!onHover}>
      {SEGS.map((c, i) => (
        <path key={i} d={arc(100, 100, 52, 96, i * 72 + gap / 2, (i + 1) * 72 - gap / 2)} fill={c}
          style={{ transformOrigin: '100px 100px', transform: active === i ? 'scale(1.06)' : undefined, transition: 'transform .25s, opacity .25s', opacity: active == null || active === i ? 1 : 0.6, cursor: onHover ? 'pointer' : undefined }}
          onMouseEnter={() => onHover?.(i)} onMouseLeave={() => onHover?.(null)} onClick={() => onHover?.(i)} />
      ))}
    </svg>
  );
}

export function Sparkle({ className = 'h-6 w-6', color = '#FF5117', style }: { className?: string; color?: string; style?: React.CSSProperties }) {
  return <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden><path d="M50 0 C54 34 66 46 100 50 C66 54 54 66 50 100 C46 66 34 54 0 50 C34 46 46 34 50 0Z" fill={color} /></svg>;
}

/** Constelación decorativa (líneas finas con nodos), como en las piezas de marca. */
export function Constellation({ className = '', color = '#FF5117' }: { className?: string; color?: string }) {
  const pts: [number, number][] = [[20, 40], [90, 70], [150, 30], [230, 90], [300, 60], [340, 140], [260, 190], [180, 160], [110, 210], [40, 170]];
  const links = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [1, 7]];
  return (
    <svg viewBox="0 0 360 240" className={className} fill="none" aria-hidden>
      {links.map(([a, b], i) => <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke={color} strokeOpacity=".35" strokeWidth="1" />)}
      {pts.map(([x, y], i) => i % 3 === 0
        ? <circle key={i} cx={x} cy={y} r="4.5" stroke={color} strokeWidth="1.5" />
        : <circle key={i} cx={x} cy={y} r="3.2" fill={color} />)}
    </svg>
  );
}

/** Cinta en movimiento con el lema y verbos de gestión (estilo moodboard). */
export function Marquee({ items, dark = true }: { items: string[]; dark?: boolean }) {
  const row = [...items, ...items];
  return (
    <div className={`relative overflow-hidden py-4 ${dark ? 'bg-ink text-white' : 'bg-brand text-white'}`}>
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-display text-xl font-extrabold uppercase tracking-wide sm:text-2xl">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10">{t}<Sparkle className="h-5 w-5" color={dark ? '#FF5117' : '#fff'} /></span>
        ))}
      </div>
    </div>
  );
}
