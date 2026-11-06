import { useState } from 'react';
import { Sparkle } from '../components/Brand';

/** Ilustraciones didácticas de la Academia (HTML/SVG, colores de marca). */
export type VisualName = 'triple' | 'cycle' | 'docs-flow' | 'wbs' | 'gantt' | 'approach' | 'risk-matrix' | 'power-interest' | 'scrum-loop' | 'kanban' | 'doc-map' | 'raci';
const SEG = ['#FF5117', '#FE6F06', '#FD8A55', '#F4A487', '#FECAA3'];

const Arrow = () => <span className="hidden text-2xl font-black text-brand sm:block">→</span>;

export function Visual({ name }: { name: VisualName }) {
  switch (name) {
    case 'triple': return (
      <div className="grid items-center gap-6 rounded-3xl bg-ink p-6 text-white sm:grid-cols-[260px_1fr]">
        <svg viewBox="-45 -35 330 275" className="mx-auto w-72">
          <polygon points="120,12 228,196 12,196" fill="rgba(255,81,23,.15)" stroke="#FF5117" strokeWidth="3" />
          {[[120, 12, '🎯 Alcance'], [228, 196, '💰 Costo'], [12, 196, '⏰ Tiempo']].map(([x, y, t]) => (
            <g key={t as string}><circle cx={x as number} cy={y as number} r="9" fill="#FF5117" /><text x={x as number} y={(y as number) + ((y as number) < 50 ? -16 : 26)} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">{t}</text></g>
          ))}
          <text x="120" y="135" textAnchor="middle" fill="#FECAA3" fontSize="15" fontWeight="800">⭐ Calidad</text>
        </svg>
        <div className="space-y-2 text-sm">
          <p className="font-bold text-brand-300">Si mueves una esquina, el triángulo se deforma:</p>
          <p>🍖 ¿Quieres invitar a 40 personas en vez de 20? (+alcance) → necesitas más carne (+costo) o más tiempo para organizar.</p>
          <p>⏰ ¿La parrillada es mañana y no pasado? (−tiempo) → menos opciones (−alcance) o pagar delivery (+costo).</p>
        </div>
      </div>
    );
    case 'cycle': return (
      <div className="rounded-3xl bg-cream p-6">
        <div className="grid gap-3 sm:grid-cols-5">
          {[['🚀', 'Inicio', '¿Hacemos la parrillada? ¡Sí!'], ['🗺️', 'Planificación', 'Lista de compras, lugar, invitados'], ['🔥', 'Ejecución', 'Compras, prender la parrilla'], ['👀', 'Monitoreo', '¿Alcanza la carne? ¿Llegan todos?'], ['✅', 'Cierre', 'Limpiar, pagar, ¿qué aprendimos?']].map(([e, t, d], i) => (
            <div key={t} className="relative rounded-2xl bg-white p-4 text-center shadow-sm" style={{ borderTop: `5px solid ${SEG[i]}` }}>
              <p className="text-3xl">{e}</p><p className="mt-1 font-black">{t}</p><p className="mt-1 text-xs text-ink/60">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl bg-white/70 p-2 text-center text-xs font-semibold text-brand-700">👀 El monitoreo no espera al final: acompaña todo el proyecto, de principio a fin</div>
      </div>
    );
    case 'docs-flow': return (
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        {[['💡', 'Business Case', '¿POR QUÉ?', 'Vale la pena hacer la parrillada: es fin de ciclo y queremos integrar al equipo.'], ['✍️', 'Acta de Constitución', '¿LO HACEMOS? ¿QUIÉN LIDERA?', 'La directiva aprueba y nombra a Lucía como encargada.'], ['🗺️', 'Plan del proyecto', '¿CÓMO?', 'Menú, compras, lugar, horario y quién lleva qué.']].map(([e, t, q, d], i) => (
          <div key={t} className="contents">
            {i > 0 && <Arrow />}
            <div className="flex-1 rounded-2xl bg-white p-4 shadow-md ring-1 ring-ink/5">
              <p className="text-3xl">{e}</p><p className="mt-1 text-[11px] font-black tracking-widest text-brand">{q}</p><p className="font-extrabold">{t}</p><p className="mt-1 text-sm text-ink/60">{d}</p>
            </div>
          </div>
        ))}
      </div>
    );
    case 'wbs': return (
      <div className="overflow-x-auto rounded-3xl bg-cream p-5">
        <div className="mx-auto w-fit rounded-xl bg-ink px-5 py-2 font-black text-white">🍖 Parrillada de fin de ciclo</div>
        <div className="mx-auto h-5 w-px bg-ink/30" />
        <div className="grid min-w-[560px] grid-cols-4 gap-3 border-t-2 border-ink/20 pt-4">
          {[['🥩 Comida', ['Carne y chorizos', 'Ensaladas', 'Postre']], ['🥤 Bebidas', ['Gaseosas', 'Agua', 'Hielo']], ['📍 Lugar', ['Reservar local', 'Parrilla y carbón', 'Mesas y sillas']], ['👥 Invitados', ['Lista de invitados', 'Invitación', 'Confirmaciones']]].map(([t, items], i) => (
            <div key={t as string}>
              <div className="rounded-xl px-3 py-2 text-center text-sm font-bold text-white" style={{ background: SEG[i] }}>{t as string}</div>
              <ul className="mt-2 space-y-1.5">{(items as string[]).map((x) => <li key={x} className="rounded-lg bg-white px-3 py-1.5 text-xs shadow-sm">📦 {x}</li>)}</ul>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-ink/50">📦 = paquete de trabajo: algo concreto que alguien puede hacer, estimar y entregar</p>
      </div>
    );
    case 'gantt': {
      const rows: [string, number, number, boolean][] = [['Definir fecha e invitados', 0, 1, true], ['Reservar local', 1, 2, true], ['Enviar invitaciones', 1, 1, false], ['Comprar comida', 3, 1, true], ['Preparar y servir 🔥', 4, 1, true], ['Diseñar playlist 🎵', 1, 2, false]];
      return (
        <div className="overflow-x-auto rounded-3xl bg-ink p-5 text-white">
          <div className="grid min-w-[520px] grid-cols-[170px_repeat(5,1fr)] gap-y-2 text-xs">
            <span />{['Lun', 'Mar', 'Mié', 'Jue', 'Vie'].map((d) => <span key={d} className="text-center text-white/50">{d}</span>)}
            {rows.map(([t, s, d, crit]) => (
              <div key={t} className="contents">
                <span className="truncate pr-2 font-semibold">{t}</span>
                <div className="relative col-span-5 h-7 rounded-md bg-white/5">
                  <div className={`absolute top-0 h-7 rounded-md ${crit ? 'bg-brand' : 'bg-white/30'}`} style={{ left: `${(s / 5) * 100}%`, width: `${(d / 5) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/70"><span className="mr-1 inline-block h-3 w-3 rounded bg-brand align-middle" /> Ruta crítica: si se atrasa la reserva o la compra, se atrasa la parrillada. <span className="ml-2 mr-1 inline-block h-3 w-3 rounded bg-white/30 align-middle" /> Tiene holgura.</p>
        </div>
      );
    }
    case 'approach': return (
      <div className="rounded-3xl bg-cream p-6">
        <div className="relative h-4 rounded-full bg-gradient-to-r from-ink via-brand to-seg-5" />
        <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
          <div className="rounded-2xl bg-white p-4"><p className="text-2xl">🏗️</p><p className="font-black">Predictivo</p><p className="text-ink/60">Construir una casa: los planos se aprueban antes y se siguen paso a paso.</p></div>
          <div className="rounded-2xl bg-white p-4"><p className="text-2xl">🔀</p><p className="font-black">Híbrido</p><p className="text-ink/60">Un matrimonio: fecha y local fijos; decoración y música se van probando.</p></div>
          <div className="rounded-2xl bg-white p-4"><p className="text-2xl">🧪</p><p className="font-black">Ágil</p><p className="text-ink/60">Crear una receta nueva: cocinas, pruebas, ajustas la sal… y repites.</p></div>
        </div>
        <p className="mt-3 text-center text-xs text-ink/50">← Más certeza · · · · · · · · · · Más incertidumbre →</p>
      </div>
    );
    case 'risk-matrix': return (
      <div className="grid items-center gap-5 rounded-3xl bg-cream p-5 sm:grid-cols-[auto_1fr]">
        <div className="flex items-center gap-2">
          <span className="-rotate-90 text-xs font-bold text-ink/50">Probabilidad →</span>
          <div className="grid grid-cols-3 gap-1">
            {['#FD8A55', '#FF5117', '#E8420C', '#FECAA3', '#FD8A55', '#FF5117', '#FFF3EC', '#FECAA3', '#FD8A55'].map((c, i) => (
              <div key={i} className="grid h-16 w-16 place-items-center rounded-lg text-2xl" style={{ background: c }}>{i === 2 ? '🌧️' : i === 4 ? '🔥' : i === 7 ? '🧂' : ''}</div>
            ))}
          </div>
        </div>
        <div className="text-sm">
          <p className="text-xs font-bold text-ink/50">Impacto →</p>
          <p className="mt-2">🌧️ <b>Que llueva</b>: probable y grave → <b>mitigar</b> (alquilar un toldo).</p>
          <p>🔥 <b>Que no prenda el carbón</b>: posible, impacto medio → llevar líquido para encender.</p>
          <p>🧂 <b>Que falte sal</b>: poco grave → <b>aceptar</b> (pedirle al vecino 😄).</p>
        </div>
      </div>
    );
    case 'power-interest': return (
      <div className="grid grid-cols-2 gap-2 rounded-3xl bg-cream p-5 text-sm">
        {[['Mantener satisfecho', '🏠 El dueño del local', 'bg-white'], ['Gestionar de cerca', '👑 La directiva que aprueba', 'bg-brand text-white'], ['Monitorear', '🐶 El vecino', 'bg-white/60'], ['Mantener informado', '🎉 Los invitados', 'bg-white']].map(([t, e, cls]) => (
          <div key={t} className={`rounded-2xl p-4 ${cls}`}><p className="font-black">{t}</p><p className="mt-1 opacity-80">{e}</p></div>
        ))}
        <p className="col-span-2 text-center text-xs text-ink/50">↑ Poder · Interés →</p>
      </div>
    );
    case 'raci': return (
      <div className="overflow-x-auto rounded-3xl bg-ink p-5 text-white">
        <table className="w-full min-w-[460px] text-center text-sm">
          <thead><tr className="text-white/60"><th className="p-2 text-left">Tarea</th><th>Lucía</th><th>Diego</th><th>Directiva</th><th>Invitados</th></tr></thead>
          <tbody>{[['Comprar la carne', 'A', 'R', 'C', 'I'], ['Reservar el local', 'R/A', '', 'C', 'I'], ['Elegir la música', 'A', 'C', '', 'R']].map(([t, ...c]) => (
            <tr key={t} className="border-t border-white/10"><td className="p-2 text-left font-semibold">{t}</td>{c.map((x, i) => <td key={i}><span className={`inline-grid h-8 w-10 place-items-center rounded-lg font-black ${x.includes('A') ? 'bg-brand' : x ? 'bg-white/15' : ''}`}>{x}</span></td>)}</tr>
          ))}</tbody>
        </table>
      </div>
    );
    case 'scrum-loop': return (
      <div className="grid items-center gap-6 rounded-3xl bg-ink p-6 text-white sm:grid-cols-[220px_1fr]">
        <div className="relative mx-auto h-52 w-52">
          <div className="absolute inset-0 animate-spinslow rounded-full border-[10px] border-dashed border-brand/70" />
          <div className="absolute inset-8 grid place-items-center rounded-full bg-brand text-center"><div><p className="text-xs font-bold">SPRINT</p><p className="text-2xl font-black">≤ 1 mes</p><p className="text-xs">🔁 se repite</p></div></div>
        </div>
        <ol className="space-y-2 text-sm">
          {[['🎯', 'Sprint Planning', '¿Qué haremos este sprint y por qué?'], ['☕', 'Daily (15 min)', '¿Cómo vamos hacia el objetivo?'], ['🎁', 'Sprint Review', 'Mostramos lo logrado a los interesados'], ['🪞', 'Retrospectiva', '¿Cómo trabajamos mejor la próxima vez?']].map(([e, t, d]) => (
            <li key={t} className="flex gap-3 rounded-xl bg-white/5 p-3"><span className="text-xl">{e}</span><span><b>{t}</b><br /><span className="text-white/60">{d}</span></span></li>
          ))}
        </ol>
      </div>
    );
    case 'kanban': return (
      <div className="grid gap-3 rounded-3xl bg-cream p-5 sm:grid-cols-3">
        {[['📝 Por hacer', ['Elegir destino del viaje', 'Cotizar bus'], 'bg-white'], ['⚙️ En curso (máx. 2)', ['Juntar cuotas', 'Reservar hospedaje'], 'bg-peach/60'], ['✅ Hecho', ['Lista de viajeros'], 'bg-green-50']].map(([t, items, bg]) => (
          <div key={t as string} className={`rounded-2xl p-3 ${bg}`}>
            <p className="mb-2 text-sm font-black">{t as string}</p>
            {(items as string[]).map((x) => <div key={x} className="mb-2 rotate-[-1deg] rounded-lg bg-white p-2 text-xs shadow">{x}</div>)}
          </div>
        ))}
      </div>
    );
    case 'doc-map': return (
      <div className="overflow-x-auto rounded-3xl bg-ink p-5 text-white">
        <div className="grid min-w-[600px] grid-cols-4 gap-3 text-xs">
          {[['🚀 Inicio', ['FOR-001 Business Case', 'FOR-002 Acta de Constitución']], ['🗺️ Planificación', ['FOR-002 Matriz de Riesgos', 'FOR-003 Cronograma y Gantt']], ['👀 Seguimiento', ['FOR-004 Ficha de Seguimiento', 'FOR-005 Reporte de Seguimiento', 'FOR-006 Acta de Reunión', 'FOR-007 Acta de Comité PMO']], ['✅ Cierre', ['FOR-008 Acta de Cierre']]].map(([t, docs], i) => (
            <div key={t as string}>
              <p className="rounded-xl px-3 py-2 text-center text-sm font-black" style={{ background: SEG[i] }}>{t as string}</p>
              {(docs as string[]).map((d) => <p key={d} className="mt-2 rounded-lg bg-white/10 p-2 font-semibold">📄 {d}</p>)}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

/** Ejemplo de la vida cotidiana. */
export function Example({ emoji, title, text, items }: { emoji: string; title: string; text: string; items?: string[] }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-brand/40 bg-white p-5">
      <span className="absolute -right-3 -top-3 text-7xl opacity-15">{emoji}</span>
      <p className="text-xs font-black uppercase tracking-widest text-brand">Ejemplo de la vida real</p>
      <p className="mt-1 text-lg font-extrabold">{emoji} {title}</p>
      <p className="mt-1 text-ink/75">{text}</p>
      {items && <ul className="mt-3 grid gap-2 sm:grid-cols-2">{items.map((x) => <li key={x} className="rounded-xl bg-cream px-3 py-2 text-sm">{x}</li>)}</ul>}
    </div>
  );
}

/** Minijuego: tarjetas que se voltean para revelar la respuesta. */
export function FlipCards({ title, items }: { title: string; items: [string, string][] }) {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  return (
    <div className="rounded-3xl bg-gradient-to-br from-brand to-brand-700 p-5 text-white">
      <p className="flex items-center gap-2 font-black"><Sparkle className="h-4 w-4" color="#fff" /> {title}</p>
      <p className="text-xs text-white/70">Toca cada tarjeta para ver la respuesta</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(([q, a], i) => (
          <button key={i} type="button" onClick={() => setOpen({ ...open, [i]: !open[i] })} className={`min-h-[96px] rounded-2xl p-4 text-left text-sm font-semibold shadow-lg transition duration-300 ${open[i] ? 'bg-ink text-white [transform:rotateY(0)]' : 'bg-white text-ink hover:-translate-y-1'}`}>
            {open[i] ? <><span className="text-brand">→ </span>{a}</> : <>❓ {q}</>}
          </button>
        ))}
      </div>
    </div>
  );
}
