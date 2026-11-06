import { useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAsync } from '../lib/useQuery';
import type { GalleryItem } from '../lib/types';
import { Constellation, Sparkle } from '../components/Brand';

export default function Gallery() {
  const g = useAsync<GalleryItem[]>(() => supabase.from('gallery').select('*, periods(code)').order('sort_order'));
  const [ev, setEv] = useState('');
  const [open, setOpen] = useState<number | null>(null);
  const events = useMemo(() => [...new Set((g.data || []).map((x) => x.title || 'Otros'))], [g.data]);
  const list = (g.data || []).filter((x) => !ev || (x.title || 'Otros') === ev);
  const cur = open != null ? list[open] : null;

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden bg-cream-gradient py-14">
        <Constellation className="pointer-events-none absolute right-0 top-0 w-96 opacity-60" />
        <div className="container-x relative">
          <span className="eyebrow bg-white"><Sparkle className="h-3.5 w-3.5" /> Galería</span>
          <h1 className="section-title">Momentos ciprianos</h1>
          <p className="mt-2 text-ink/60">Eventos, alianzas y comunidad. Filtra por evento.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {['', ...events].map((e) => (
              <button key={e || 'all'} onClick={() => setEv(e)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${ev === e ? 'bg-brand text-white shadow' : 'bg-white ring-1 ring-ink/10 hover:ring-brand'}`}>{e || 'Todo'}</button>
            ))}
          </div>
        </div>
      </section>
      <div className="container-x mt-8 columns-2 gap-3 md:columns-3 lg:columns-4">
        {list.map((x, i) => (
          <button key={x.id} onClick={() => setOpen(i)} className="group relative mb-3 block w-full break-inside-avoid overflow-hidden rounded-2xl">
            <img src={x.image_url} alt={x.title ?? ''} loading="lazy" className="w-full transition duration-700 group-hover:scale-105" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-3 text-left text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">{x.title}</span>
          </button>
        ))}
      </div>
      {cur && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/90 p-4" onClick={() => setOpen(null)}>
          <img src={cur.image_url} alt={cur.title ?? ''} className="max-h-[85vh] max-w-full rounded-xl" onClick={(e) => e.stopPropagation()} />
          <p className="absolute bottom-6 left-0 right-0 text-center text-sm text-white/80">{cur.title}</p>
          <button className="absolute left-3 top-1/2 rounded-full bg-white/10 px-4 py-3 text-2xl text-white hover:bg-brand" onClick={(e) => { e.stopPropagation(); setOpen((open! - 1 + list.length) % list.length); }} aria-label="Anterior">‹</button>
          <button className="absolute right-3 top-1/2 rounded-full bg-white/10 px-4 py-3 text-2xl text-white hover:bg-brand" onClick={(e) => { e.stopPropagation(); setOpen((open! + 1) % list.length); }} aria-label="Siguiente">›</button>
          <button className="absolute right-4 top-4 text-3xl text-white" aria-label="Cerrar">×</button>
        </div>
      )}
    </div>
  );
}
