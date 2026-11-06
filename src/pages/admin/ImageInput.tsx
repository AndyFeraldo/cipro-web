import { useState } from 'react';
import { uploadMedia } from '../../lib/supabase';

export default function ImageInput({ value, onChange, folder }: { value: string; onChange: (v: string) => void; folder: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-ink/5">{value && <img src={value} alt="" className="h-full w-full object-cover" />}</div>
      <label className="btn-ghost cursor-pointer py-1.5">
        {busy ? 'Subiendo…' : value ? 'Cambiar' : 'Subir imagen'}
        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return;
          setBusy(true);
          try { onChange(await uploadMedia(f, folder)); } catch (er) { alert('Error al subir: ' + (er as Error).message); }
          setBusy(false);
        }} />
      </label>
      {value && <button type="button" className="text-xs text-red-600" onClick={() => onChange('')}>Quitar</button>}
    </div>
  );
}
