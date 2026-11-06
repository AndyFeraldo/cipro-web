import { useEffect, useState } from 'react';
import { supabase, uploadMedia } from '../../lib/supabase';
import type { Period } from '../../lib/types';

/** Sube varias fotos a la galería de una vez (por ejemplo, una carpeta de evento del Drive). */
export default function GalleryBulk({ onDone }: { onDone: () => void }) {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [periodId, setPeriodId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [progress, setProgress] = useState('');
  useEffect(() => { supabase.from('periods').select('*').order('code', { ascending: false }).then(({ data }) => setPeriods(data || [])); }, []);

  async function upload(files: FileList) {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    let ok = 0;
    for (const [i, f] of list.entries()) {
      setProgress(`Subiendo ${i + 1} de ${list.length}…`);
      try {
        const url = await uploadMedia(f, 'gallery');
        const { error } = await supabase.from('gallery').insert({ image_url: url, title: title || null, event_date: date || null, period_id: periodId || null });
        if (!error) ok++;
      } catch { /* continúa con la siguiente */ }
    }
    setProgress(`Listo: ${ok} de ${list.length} fotos subidas ✔`);
    onDone();
  }

  return (
    <div className="mb-6 rounded-3xl border-2 border-dashed border-brand-200 bg-white p-5">
      <h3 className="font-bold">📸 Subir varias fotos de un evento</h3>
      <p className="text-sm text-ink/60">Descarga la carpeta del evento desde el Drive y selecciona todas las fotos a la vez.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <input className="input" placeholder="Evento (ej. Ciprothon 2026-1)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <select className="input" value={periodId} onChange={(e) => setPeriodId(e.target.value)}><option value="">Ciclo…</option>{periods.map((p) => <option key={p.id} value={p.id}>{p.code}</option>)}</select>
      </div>
      <label className="btn-primary mt-4 cursor-pointer">Elegir fotos<input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && upload(e.target.files)} /></label>
      {progress && <span className="ml-3 text-sm">{progress}</span>}
    </div>
  );
}
