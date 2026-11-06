/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import ImageInput from './ImageInput';

export type Field = {
  key: string; label: string; required?: boolean; default?: any;
  type?: 'text' | 'textarea' | 'date' | 'number' | 'bool' | 'select' | 'image' | 'ref';
  options?: string[]; folder?: string; ref?: { table: string; label: string };
};

export function FieldInput({ f, value, onChange }: { f: Field; value: any; onChange: (v: any) => void }) {
  const [refs, setRefs] = useState<any[]>([]);
  useEffect(() => {
    if (f.type === 'ref' && f.ref) supabase.from(f.ref.table).select(`id, ${f.ref.label}`).order(f.ref.label, { ascending: false }).then(({ data }) => setRefs(data || []));
  }, [f]);
  switch (f.type) {
    case 'textarea': return <textarea className="input min-h-[90px]" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
    case 'date': return <input type="date" className="input" value={(value ?? '').slice(0, 10)} onChange={(e) => onChange(e.target.value || null)} />;
    case 'number': return <input type="number" className="input" value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} />;
    case 'bool': return <input type="checkbox" className="h-5 w-5 accent-brand" checked={!!value} onChange={(e) => onChange(e.target.checked)} />;
    case 'select': return <select className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value || null)}><option value="">—</option>{f.options?.map((o) => <option key={o}>{o}</option>)}</select>;
    case 'ref': return <select className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value || null)}><option value="">—</option>{refs.map((r) => <option key={r.id} value={r.id}>{r[f.ref!.label]}</option>)}</select>;
    case 'image': return <ImageInput value={value ?? ''} onChange={onChange} folder={f.folder || 'misc'} />;
    default: return <input className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
  }
}

export function CrudAdmin({ table, title, fields, display, order, desc }: { table: string; title: string; fields: Field[]; display: (r: any) => string; order: string; desc?: boolean }) {
  const [rows, setRows] = useState<any[]>([]);
  const [edit, setEdit] = useState<any | null>(null);
  const [msg, setMsg] = useState('');
  const load = () => supabase.from(table).select('*').order(order, { ascending: !desc }).then(({ data }) => setRows(data || []));
  useEffect(() => { load(); }, [table]); // eslint-disable-line react-hooks/exhaustive-deps

  const blank = () => Object.fromEntries(fields.map((f) => [f.key, f.default ?? (f.type === 'bool' ? false : null)]));

  async function save() {
    for (const f of fields) if (f.required && !edit[f.key]) { setMsg(`Falta: ${f.label}`); return; }
    const payload = Object.fromEntries(fields.map((f) => [f.key, edit[f.key] === '' ? null : edit[f.key]]));
    if (table === 'periods' && payload.is_current) await supabase.from('periods').update({ is_current: false }).neq('id', edit.id ?? '00000000-0000-0000-0000-000000000000');
    const { error } = edit.id ? await supabase.from(table).update(payload).eq('id', edit.id) : await supabase.from(table).insert(payload);
    if (error) { setMsg(error.message); return; }
    setEdit(null); setMsg('Guardado ✔'); load();
  }
  async function remove(r: any) {
    if (!confirm(`¿Eliminar "${display(r)}"?`)) return;
    const { error } = await supabase.from(table).delete().eq('id', r.id);
    setMsg(error ? error.message : 'Eliminado'); load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-extrabold">{title}</h2><button className="btn-primary py-1.5" onClick={() => { setEdit(blank()); setMsg(''); }}>+ Nuevo</button></div>
        <ul className="divide-y divide-ink/5">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="flex min-w-0 items-center gap-3">
                {fields.find((f) => f.type === 'image') && <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-ink/5">{r[fields.find((f) => f.type === 'image')!.key] && <img src={r[fields.find((f) => f.type === 'image')!.key]} className="h-full w-full object-cover" alt="" />}</div>}
                <span className="truncate text-sm font-medium">{display(r)}</span>
              </div>
              <div className="flex shrink-0 gap-2 text-sm"><button className="font-semibold text-brand-600" onClick={() => { setEdit({ ...r }); setMsg(''); }}>Editar</button><button className="text-red-600" onClick={() => remove(r)}>Eliminar</button></div>
            </li>
          ))}
          {!rows.length && <li className="py-6 text-center text-sm text-ink/50">Sin registros aún.</li>}
        </ul>
      </div>
      <div className="lg:sticky lg:top-32 lg:self-start">
        {msg && <p className="mb-3 rounded-xl bg-white p-3 text-sm shadow-sm">{msg}</p>}
        {edit && (
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <h3 className="mb-4 font-bold">{edit.id ? 'Editar' : 'Nuevo'}</h3>
            <div className="space-y-4">
              {fields.map((f) => (
                <div key={f.key} className={f.type === 'bool' ? 'flex items-center justify-between' : ''}>
                  <label className="label">{f.label}{f.required && ' *'}</label>
                  <FieldInput f={f} value={edit[f.key]} onChange={(v) => setEdit({ ...edit, [f.key]: v })} />
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-2"><button className="btn-primary flex-1" onClick={save}>Guardar</button><button className="btn-ghost" onClick={() => setEdit(null)}>Cancelar</button></div>
          </div>
        )}
      </div>
    </div>
  );
}
