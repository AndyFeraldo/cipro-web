import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ROLE_LABEL, type Member, type Role } from '../lib/types';
import MemberCard from '../components/MemberCard';
import Scrummy from '../components/Scrummy';

type Result = { ok: boolean; error?: string; member?: Member; memberships?: { period: string; area: string | null; role: Role; position_title: string | null }[] };

export default function MemberAccess() {
  const [dni, setDni] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Result | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.rpc('member_login', { p_dni: dni.trim(), p_code: code.trim() });
    setBusy(false);
    setRes(error ? { ok: false, error: 'No se pudo conectar. Intenta de nuevo.' } : (data as Result));
  }

  if (res?.ok && res.member) {
    return (
      <div className="container-x max-w-3xl py-14">
        <div className="flex items-center justify-between">
          <div><span className="eyebrow">Mi espacio cipriano</span><h1 className="section-title">¡Hola, {res.member.full_name.split(' ')[0]}! 👋</h1></div>
          <button onClick={() => { setRes(null); setCode(''); }} className="btn-ghost">Salir</button>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-[240px_1fr]">
          <MemberCard member={res.member} big />
          <div className="card">
            <h2 className="font-bold">Mi Carrera Cipriana</h2>
            <ol className="mt-4 space-y-3 border-l-2 border-brand-200 pl-5">
              {res.memberships?.map((m, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-brand" />
                  <p className="text-xs font-bold text-brand-600">Ciclo {m.period}</p>
                  <p className="font-semibold">{m.position_title || ROLE_LABEL[m.role]}</p>
                  <p className="text-sm text-ink/60">{m.area}</p>
                </li>
              ))}
              {!res.memberships?.length && <li className="text-sm text-ink/60">Aún no hay ciclos registrados.</li>}
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x grid min-h-[70vh] items-center gap-10 py-14 md:grid-cols-2">
      <div className="mx-auto hidden md:block"><Scrummy className="h-80 w-80 animate-float" wave /></div>
      <form onSubmit={submit} className="card mx-auto w-full max-w-sm hover:translate-y-0">
        <span className="eyebrow">Acceso ciprianos</span>
        <h1 className="mt-3 text-2xl font-extrabold">Ingresa con tu DNI</h1>
        <p className="mt-1 text-sm text-ink/60">Usa tu DNI y el código de acceso que te entregó la directiva.</p>
        <label className="label mt-6">DNI</label>
        <input className="input" inputMode="numeric" maxLength={8} pattern="[0-9]{8}" required value={dni} onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))} placeholder="12345678" />
        <label className="label mt-4">Código de acceso</label>
        <input className="input" type="password" required value={code} onChange={(e) => setCode(e.target.value)} />
        {res && !res.ok && <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{res.error}</p>}
        <button className="btn-primary mt-6 w-full" disabled={busy}>{busy ? 'Validando…' : 'Ingresar'}</button>
      </form>
    </div>
  );
}
