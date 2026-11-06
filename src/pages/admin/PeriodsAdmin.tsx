import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CrudAdmin } from './CrudAdmin';

const nextCode = (codes: string[]) => {
  const sorted = codes.sort(); const last = sorted[sorted.length - 1];
  if (!last) return `${new Date().getFullYear()}-1`;
  const [y, s] = last.split('-').map(Number);
  return s === 1 ? `${y}-2` : `${y + 1}-1`;
};
const range = (code: string) => {
  const [y, s] = code.split('-').map(Number);
  return s === 1 ? { starts_on: `${y}-03-01`, ends_on: `${y}-07-31` } : { starts_on: `${y}-08-01`, ends_on: `${y}-12-31` };
};

/** Ciclos: crear el siguiente con un clic, agregar uno antiguo y marcar cuál es el actual. */
export default function PeriodsAdmin() {
  const [codes, setCodes] = useState<string[]>([]);
  const [k, setK] = useState(0);
  const [msg, setMsg] = useState('');
  const [old, setOld] = useState('');
  useEffect(() => { supabase.from('periods').select('code').then(({ data }) => setCodes((data || []).map((r) => r.code))); }, [k]);
  const next = nextCode([...codes]);

  async function create(code: string) {
    if (!/^\d{4}-[12]$/.test(code)) return setMsg('Usa el formato AAAA-1 o AAAA-2.');
    const { error } = await supabase.from('periods').insert({ code, label: `Ciclo ${code}`, ...range(code) });
    setMsg(error ? (error.message.includes('duplicate') ? `El ciclo ${code} ya existe.` : error.message) : `Ciclo ${code} creado ✔`);
    setOld(''); setK(k + 1);
  }

  return (
    <div>
      <div className="mb-6 grid gap-4 rounded-3xl bg-white p-5 shadow-sm md:grid-cols-2">
        <div>
          <h3 className="font-bold">Nuevo ciclo</h3>
          <p className="text-sm text-ink/60">El siguiente después del último registrado.</p>
          <button className="btn-primary mt-3" onClick={() => create(next)}>＋ Crear ciclo {next}</button>
        </div>
        <div>
          <h3 className="font-bold">Agregar un ciclo pasado o específico</h3>
          <p className="text-sm text-ink/60">Para el histórico de CIPRO (ej. 2019-2).</p>
          <div className="mt-3 flex gap-2"><input className="input max-w-[160px]" placeholder="2020-1" value={old} onChange={(e) => setOld(e.target.value.trim())} /><button className="btn-dark" onClick={() => create(old)}>Agregar</button></div>
        </div>
        {msg && <p className="text-sm md:col-span-2">{msg}</p>}
        <p className="text-xs text-ink/50 md:col-span-2">Para cambiar el ciclo actual (el que se muestra en el inicio), edita el ciclo y marca “Ciclo actual”.</p>
      </div>
      <CrudAdmin key={k} table="periods" title="Ciclos" order="code" desc fields={[
        { key: 'code', label: 'Código (ej. 2026-1)', required: true }, { key: 'label', label: 'Nombre' },
        { key: 'starts_on', label: 'Inicio', type: 'date' }, { key: 'ends_on', label: 'Fin', type: 'date' },
        { key: 'is_current', label: 'Ciclo actual (solo uno)', type: 'bool' }]} display={(r) => `${r.code}${r.is_current ? ' · ACTUAL' : ''}`} />
    </div>
  );
}
