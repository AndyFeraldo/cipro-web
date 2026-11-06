import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { callMemberAccount, dniToEmail, isMemberEmail, useSession } from '../lib/session';
import { useAsync } from '../lib/useQuery';
import type { Area } from '../lib/types';
import Scrummy from '../components/Scrummy';
import ProfileFields, { emptyProfile, type ProfileForm } from '../components/ProfileFields';

type Tab = 'login' | 'activar' | 'registro';
const TAB_LABEL: Record<Tab, string> = { login: 'Ya tengo cuenta', activar: 'Tengo un código', registro: 'Registrarme' };

export default function MemberAccess() {
  const nav = useNavigate();
  const { session } = useSession();
  const { hash } = useLocation();
  const fromHash = (h: string): Tab => (h === '#registro' ? 'registro' : h === '#activar' ? 'activar' : 'login');
  const [tab, setTab] = useState<Tab>(() => fromHash(hash));
  useEffect(() => { setTab(fromHash(hash)); }, [hash]);
  useEffect(() => { if (session && isMemberEmail(session.user.email)) nav('/mi-perfil'); }, [session, nav]);

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
      <div className="dot-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="container-x relative grid gap-10 py-14 lg:grid-cols-[1fr_1.3fr]">
        <div className="hidden lg:block">
          <span className="eyebrow">Comunidad cipriana</span>
          <h1 className="section-title">Tu perfil cipriano, en un solo lugar</h1>
          <p className="mt-3 text-ink/65">Crea tu perfil con tu foto, tu historia en CIPRO, tu experiencia y tu LinkedIn. Así la comunidad (¡y los reclutadores!) conocen lo que haces.</p>
          <Scrummy pose="chica-saludando" className="mt-8 h-80 animate-float" />
        </div>
        <div className="w-full">
          <div className="mx-auto mb-5 flex w-full max-w-xl rounded-full bg-white p-1 shadow-sm ring-1 ring-ink/5">
            {(['login', 'activar', 'registro'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-full px-2 py-2.5 text-xs font-bold transition sm:text-sm ${tab === t ? 'bg-brand text-white shadow' : 'text-ink/60'}`}>
                {TAB_LABEL[t]}
              </button>
            ))}
          </div>
          {tab === 'login' && <Login onRegister={() => setTab('registro')} onActivate={() => setTab('activar')} />}
          {tab === 'activar' && <Activate />}
          {tab === 'registro' && <Register />}
        </div>
      </div>
    </div>
  );
}

function Login({ onRegister, onActivate }: { onRegister: () => void; onActivate: () => void }) {
  const [dni, setDni] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: dniToEmail(dni), password: pw });
    setBusy(false);
    if (error) setErr('DNI o contraseña incorrectos.');
  }
  return (
    <form onSubmit={submit} className="card mx-auto max-w-xl hover:translate-y-0">
      <h2 className="text-2xl font-extrabold">Ingresa con tu DNI</h2>
      <p className="mt-1 text-sm text-ink/60">Usa la contraseña que creaste al registrarte (o la que te dio la directiva).</p>
      <label className="label mt-6">DNI</label>
      <input className="input" inputMode="numeric" maxLength={8} pattern="[0-9]{8}" required autoComplete="username" value={dni} onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))} placeholder="12345678" />
      <label className="label mt-4">Contraseña</label>
      <input className="input" type="password" required autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
      {err && <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{err}</p>}
      <button className="btn-primary mt-6 w-full" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
      <p className="mt-4 text-center text-sm text-ink/60">¿Aún no tienes cuenta? <button type="button" onClick={onRegister} className="font-semibold text-brand-600">Regístrate aquí</button></p>
      <p className="mt-1 text-center text-sm text-ink/60">¿La directiva te dio un código? <button type="button" onClick={onActivate} className="font-semibold text-brand-600">Activa tu cuenta</button></p>
    </form>
  );
}

/** Para ciprianos que la directiva ya cargó en la web: activan su cuenta con el código de 6 caracteres. */
function Activate() {
  const [code, setCode] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    if (code.replace(/[^A-Za-z0-9]/g, '').length !== 6) return setErr('El código tiene 6 caracteres.');
    if (!/^\d{8}$/.test(dni)) return setErr('El DNI debe tener 8 dígitos.');
    if (pw.length < 6) return setErr('La contraseña debe tener al menos 6 caracteres.');
    if (pw !== pw2) return setErr('Las contraseñas no coinciden.');
    setBusy(true);
    const r = await callMemberAccount({ action: 'activate', code, dni, password: pw, email });
    if (!r.ok) { setBusy(false); return setErr(r.error || 'No se pudo activar.'); }
    await supabase.auth.signInWithPassword({ email: dniToEmail(dni), password: pw }); // redirige a /mi-perfil
    setBusy(false);
  }
  return (
    <form onSubmit={submit} className="card mx-auto max-w-xl hover:translate-y-0">
      <h2 className="text-2xl font-extrabold">Activa tu cuenta</h2>
      <p className="mt-1 text-sm text-ink/60">Si ya apareces en la web de CIPRO, la directiva te dará un <b>código de activación</b>. Úsalo una sola vez para crear tu contraseña; luego entrarás con tu DNI.</p>
      <label className="label mt-6">Código de activación</label>
      <input className="input text-center font-mono text-2xl font-bold uppercase tracking-[.5em]" maxLength={7} required autoComplete="one-time-code" placeholder="ABC123" value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div><label className="label">DNI (será tu usuario)</label><input className="input" inputMode="numeric" maxLength={8} required autoComplete="username" value={dni} onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))} /></div>
        <div><label className="label">Correo</label><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label">Crea tu contraseña</label><input className="input" type="password" required autoComplete="new-password" placeholder="mín. 6" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
        <div><label className="label">Repítela</label><input className="input" type="password" required autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></div>
      </div>
      {err && <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{err}</p>}
      <button className="btn-primary mt-6 w-full" disabled={busy}>{busy ? 'Activando…' : 'Activar mi cuenta'}</button>
    </form>
  );
}

function Register() {
  const areas = useAsync<Area[]>(() => supabase.from('areas').select('*').eq('is_active', true).order('sort_order'));
  const [v, setV] = useState<ProfileForm>(emptyProfile);
  const [dni, setDni] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [accept, setAccept] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    if (!/^\d{8}$/.test(dni)) return setErr('El DNI debe tener 8 dígitos.');
    if (pw.length < 6) return setErr('La contraseña debe tener al menos 6 caracteres.');
    if (pw !== pw2) return setErr('Las contraseñas no coinciden.');
    setBusy(true);
    const r = await callMemberAccount({ action: 'register', dni, password: pw, ...v });
    if (!r.ok) { setBusy(false); return setErr(r.error || 'No se pudo registrar.'); }
    await supabase.auth.signInWithPassword({ email: dniToEmail(dni), password: pw }); // redirige a /mi-perfil
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="card mx-auto max-w-xl hover:translate-y-0">
      <h2 className="text-2xl font-extrabold">Crea tu perfil cipriano</h2>
      <p className="mt-1 text-sm text-ink/60">Después podrás subir tu foto y personalizar tu perfil. La directiva lo revisará antes de publicarlo.</p>
      <div className="mt-6 grid gap-4 rounded-2xl bg-ink/[.03] p-4 sm:grid-cols-3">
        <div><label className="label">DNI * (tu usuario)</label><input className="input" inputMode="numeric" maxLength={8} required autoComplete="username" value={dni} onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))} /></div>
        <div><label className="label">Contraseña *</label><input className="input" type="password" required autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="mín. 6" /></div>
        <div><label className="label">Repetir *</label><input className="input" type="password" required autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></div>
      </div>
      <div className="mt-5"><ProfileFields v={v} set={setV} areas={areas.data || []} /></div>
      <label className="mt-5 flex items-start gap-2 text-sm text-ink/70"><input type="checkbox" required className="mt-0.5 h-4 w-4 accent-brand" checked={accept} onChange={(e) => setAccept(e.target.checked)} /> Acepto que CIPRO muestre en su web mi nombre, foto, carrera, descripción y LinkedIn.</label>
      {err && <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{err}</p>}
      <button className="btn-primary mt-6 w-full" disabled={busy}>{busy ? 'Creando tu perfil…' : 'Registrarme'}</button>
      <p className="mt-3 text-center text-xs text-ink/50">¿Problemas? Escríbenos desde la sección <Link to="/#unete" className="underline">Únete</Link>.</p>
    </form>
  );
}
