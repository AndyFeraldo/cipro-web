import Scrummy from '../components/Scrummy';
import { Sparkle } from '../components/Brand';
import type { Block } from './types';
import { Example, FlipCards, Visual } from './Visuals';

/** Renderiza el contenido de una lección con el estilo de marca. */
export default function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((b, i) => {
        switch (b.t) {
          case 'p': return <p key={i} className="text-[17px] leading-relaxed text-ink/80">{b.text}</p>;
          case 'h': return <h3 key={i} className="flex items-center gap-2 pt-4 text-2xl font-extrabold"><Sparkle className="h-5 w-5" />{b.text}</h3>;
          case 'list': return <ul key={i} className="space-y-2">{b.items.map((it) => <li key={it} className="flex gap-3 text-ink/80"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" />{it}</li>)}</ul>;
          case 'steps': return (
            <ol key={i} className="relative space-y-4 border-l-2 border-brand-200 pl-6">
              {b.items.map(([t, d], k) => (
                <li key={t} className="relative">
                  <span className="absolute -left-[37px] grid h-7 w-7 place-items-center rounded-full bg-brand text-xs font-black text-white ring-4 ring-white">{k + 1}</span>
                  <p className="font-bold">{t}</p><p className="text-sm text-ink/70">{d}</p>
                </li>
              ))}
            </ol>
          );
          case 'cards': return (
            <div key={i} className={`grid gap-3 ${b.items.length > 4 ? 'sm:grid-cols-2 lg:grid-cols-3' : b.items.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
              {b.items.map(([t, d], k) => (
                <div key={t} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-ink/5 transition hover:-translate-y-0.5 hover:shadow-md">
                  <span className="mb-2 block h-1.5 w-10 rounded-full" style={{ background: ['#FF5117', '#FE6F06', '#FD8A55', '#F4A487', '#FECAA3'][k % 5] }} />
                  <p className="font-bold">{t}</p><p className="mt-1 text-sm text-ink/65">{d}</p>
                </div>
              ))}
            </div>
          );
          case 'table': return (
            <div key={i} className="overflow-x-auto rounded-2xl ring-1 ring-ink/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-ink text-white"><tr>{b.head.map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
                <tbody>{b.rows.map((r, k) => <tr key={k} className="odd:bg-white even:bg-cream">{r.map((c, j) => <td key={j} className={`px-4 py-3 ${j === 0 ? 'font-semibold' : 'text-ink/75'}`}>{c}</td>)}</tr>)}</tbody>
              </table>
            </div>
          );
          case 'tip': return (
            <div key={i} className="relative flex items-end gap-4 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 to-peach/60 p-5 ring-1 ring-brand-100">
              <Scrummy pose={b.pose || 'saludando'} className="-mb-5 h-28 shrink-0 sm:h-32" />
              <div className="pb-1"><p className="text-xs font-black uppercase tracking-widest text-brand-600">{b.title}</p><p className="mt-1 text-ink/80">{b.text}</p></div>
            </div>
          );
          case 'visual': return <Visual key={i} name={b.name} />;
          case 'example': return <Example key={i} emoji={b.emoji} title={b.title} text={b.text} items={b.items} />;
          case 'flip': return <FlipCards key={i} title={b.title} items={b.items} />;
          case 'download': return (
            <a key={i} href={b.href} target="_blank" rel="noreferrer" className="group flex items-center gap-4 rounded-2xl bg-ink p-4 text-white transition hover:bg-brand">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/10 text-2xl">📄</span>
              <span className="flex-1"><b>{b.title}</b><br /><span className="text-sm text-white/70">{b.text}</span></span>
              <span className="text-sm font-bold">Abrir ↗</span>
            </a>
          );
          case 'key': return <div key={i} className="rounded-2xl bg-ink p-5 font-semibold text-white"><span className="mr-2 text-brand">✦</span>{b.text}</div>;
        }
      })}
    </div>
  );
}
