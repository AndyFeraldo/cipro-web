import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { callMemberAccount, codeToEmail, isMemberEmail, useSession } from '../lib/session';
import { useAsync } from '../lib/useQuery';
import type { Area } from '../lib/types';
import Scrummy from '../components/Scrummy';
import { Constellation, Sparkle } from '../components/Brand';
import { Blobs } from '../components/Motion';
import ProfileFields, { emptyProfile, type ProfileForm } from '../components/ProfileFields';

type Tab = 'login' | 'activar' | 'registro';
const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: 'login', label: 'Ya tengo cuenta', hint: 'Entro con mi código Ulima y mi contraseña' },
  { id: 'activar', label: 'Tengo mi código CIPRO', hint: 'Ya aparezco en la web y la directiva me dio mi código' },
  { id: 'registro', label: 'Soy nuevo', hint: 'Aún no estoy en la web: quiero registrarme' },
];
const fromHash = (h: string): Tab => (h === '#registro' ? 'registro' : h === '#activar' ? 'activar' : 'login');
const onlyDigits = (v: string) => v.replace(/\D/g, '').slice(0, 8);

export default function MemberAccess() {
  const nav = useNavigate();
  const { session } = useSession();
  const { hash, search } = useLocation();
  const next = new URLSearchParams(search).get('next');
  const [tab, setTab] = useState<Tab>(() => fromHash(hash));
  useEffect(() => { setTab(fromHash(hash)); }, [hash]);
  useEffect(() => { if (session && isMemberEmail(session.user.email)) nav(next && next.startsWith('/') && !next.startsWith('//') ? next : '/mi-perfil'); }, [session, nav, next]);

  return (
    <div className="relative overflow-hidden bg-cream-gradient">
      <Blobs />
      <div className="dot-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <Constellation className="pointer-events-none absolute -left-10 top-10 w-96 opacity-50" />
      <div className="container-x relative grid gap-10 py-12 lg:grid-cols-[1fr_1.35fr] lg:py-16">
        <div className="hidden lg:block">
          <span className="eyebrow bg-white"><Sparkle className="h-3.5 w-3.5" /> Comunidad cipriana</span>
          <h1 className="section-title">Tu perfil cipriano, en un solo lugar</h1>
          <p className="mt-3 text-ink/65">Tu foto, tu historia en CIPRO, tu experiencia y tu LinkedIn. Así la comunidad (¡y los reclutadores!) conocen lo que haces.</p>
          <div className="mt-6 space-y-2 text-sm">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${tab === t.id ? 'bg-white shadow-md' : 'hover:bg-white/60'}`}>
                <span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black ${tab === t.id ? 'bg-brand text-white' : 'bg-white text-brand'}`}>{TABS.indexOf(t) + 1}</span>
                <span><b>{t.label}</b><br /><span className="text-ink/55">{t.hint}</span></span>
              </button>
            ))}
          </div>
          <Scrummy pose="chica-saludando" className="mt-6 h-64 animate-float" />
        </div>
        <div className="w-full">
          {next?.startsWith('/academia') && <p className="mx-auto mb-4 max-w-xl rounded-2xl bg-ink p-4 text-sm text-white">🎓 Ingresa (o activa tu cuenta) para empezar el curso en la <b className="text-brand">Academia CIPRO</b>. Volverás automáticamente.</p>}
          <div className="mx-auto mb-5 grid w-full max-w-xl grid-cols-3 rounded-full bg-white p-1 shadow-sm ring-1 ring-ink/5">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`rounded-full px-2 py-2.5 text-[11px] font-bold leading-tight transition sm:text-sm ${tab === t.id ? 'bg-brand text-white shadow' : 'text-ink/60'}`}>{t.label}</button>
            ))}
          </div>
          {tab === 'login' && <Login go={setTab} />}
          {tab === 'activar' && <Activate go={setTab} />}
          {tab === 'registro' && <Register go={setTab} />}
        </div>
      </div>
    </div>
  );
}

function CodeInput({ value, onChange, label = 'Código Ulima' }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input font-semibold tracking-wider" inputMode="numeric" maxLength={8} required autoComplete="username" placeholder="20204390" value={value} onChange={(e) => onChange(onlyDigits(e.target.value))} />
    </div>
  );
}

function Login({ go }: { go: (t: Tab) => void }) {
  const [ucode, setUcode] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<React.ReactNode>('');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    if (ucode.length !== 8) return setErr('Tu código Ulima tiene 8 dígitos (ej. 20204390).');
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: codeToEmail(ucode), password: pw });
    setBusy(false);
    if (error) {
      const looksLikeCiproCode = /^[A-Za-z0-9]{6}$/.test(pw) && /[A-Za-z]/.test(pw);
      setErr(looksLikeCiproCode
        ? <>Parece que escribiste tu <b>código CIPRO</b> como contraseña. Ese código sirve para <button type="button" className="font-bold underline" onClick={() => go('activar')}>activar tu cuenta</button> la primera vez.</>
        : <>Código Ulima o contraseña incorrectos. ¿Es tu primera vez? <button type="button" className="font-bold underline" onClick={() => go('activar')}>Activa tu cuenta</button>.</>);
    }
  }
  return (
    <form onSubmit={submit} className="card mx-auto max-w-xl hover:translate-y-0">
      <h2 className="text-2xl font-extrabold">Ingresa a tu perfil</h2>
      <p className="mt-1 text-sm text-ink/60">Con tu <b>código de estudiante Ulima</b> y la contraseña que creaste.</p>
      <div className="mt-6"><CodeInput value={ucode} onChange={setUcode} /></div>
      <label className="label mt-4">Contraseña</label>
      <input className="input" type="password" required autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} />
      {err && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</p>}
      <button className="btn-primary mt-6 w-full" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
      <div className="mt-5 grid gap-2 text-center text-sm text-ink/60 sm:grid-cols-2">
        <button type="button" onClick={() => go('activar')} className="rounded-xl bg-brand-50 p-3 hover:bg-brand-100"><b className="text-brand-700">¿Ya apareces en la web?</b><br />Activa tu cuenta con tu código CIPRO</button>
        <button type="button" onClick={() => go('registro')} className="rounded-xl bg-ink/[.04] p-3 hover:bg-ink/[.07]"><b className="text-ink">¿Eres nuevo?</b><br />Crea tu perfil cipriano</button>
      </div>
    </form>
  );
}

/** Para ciprianos que la directiva ya cargó en la web: activan su cuenta con su código CIPRO (una sola vez). */
function Activate({ go }: { go: (t: Tab) => void }) {
  const [code, setCode] = useState('');
  const [ucode, setUcode] = useState('');
  const [dni, setDni] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    if (code.length < 4) return setErr('Escribe tu código CIPRO (te lo da la directiva).');
    if (ucode.length !== 8) return setErr('Tu código Ulima tiene 8 dígitos.');
    if (pw.length < 6) return setErr('La contraseña debe tener al menos 6 caracteres.');
    if (pw !== pw2) return setErr('Las contraseñas no coinciden.');
    setBusy(true);
    const r = await callMemberAccount({ action: 'activate', code, university_code: ucode, dni, password: pw, email });
    if (!r.ok) { setBusy(false); return setErr(r.error || 'No se pudo activar.'); }
    await supabase.auth.signInWithPassword({ email: codeToEmail(ucode), password: pw }); // redirige a /mi-perfil
    setBusy(false);
  }
  return (
    <form onSubmit={submit} className="card mx-auto max-w-xl hover:translate-y-0">
      <h2 className="text-2xl font-extrabold">Activa tu cuenta</h2>
      <ol className="mt-3 space-y-1 text-sm text-ink/65">
        <li>1. Escribe el <b>código CIPRO</b> que te dio la directiva (ej. <span className="font-mono font-bold text-brand">K7M2QX</span>).</li>
        <li>2. Tu <b>código Ulima</b> será tu usuario para entrar.</li>
        <li>3. Crea tu contraseña. ¡Listo! Luego completas tu perfil.</li>
      </ol>
      <label className="label mt-6">Código CIPRO</label>
      <input className="input text-center font-mono text-2xl font-black uppercase tracking-[.4em]" maxLength={12} required autoComplete="one-time-code" placeholder="K7M2QX" value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <CodeInput value={ucode} onChange={setUcode} label="Código Ulima (tu usuario)" />
        <div><label className="label">Correo</label><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label">Crea tu contraseña</label><input className="input" type="password" required autoComplete="new-password" placeholder="mín. 6" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
        <div><label className="label">Repítela</label><input className="input" type="password" required autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></div>
        <div className="sm:col-span-2"><label className="label">DNI (opcional · privado)</label><input className="input" inputMode="numeric" maxLength={8} value={dni} onChange={(e) => setDni(onlyDigits(e.target.value))} /></div>
      </div>
      {err && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</p>}
      <button className="btn-primary mt-6 w-full" disabled={busy}>{busy ? 'Activando…' : 'Activar mi cuenta'}</button>
      <p className="mt-3 text-center text-sm text-ink/60">¿Ya la activaste antes? <button type="button" onClick={() => go('login')} className="font-semibold text-brand-600">Ingresa aquí</button></p>
    </form>
  );
}

function Register({ go }: { go: (t: Tab) => void }) {
  const areas = useAsync<Area[]>(() => supabase.from('areas').select('*').eq('is_active', true).eq('is_historical', false).order('sort_order'));
  const [v, setV] = useState<ProfileForm>(emptyProfile);
  const [ucode, setUcode] = useState('');
  const [dni, setDni] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [accept, setAccept] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    if (ucode.length !== 8) return setErr('Tu código Ulima tiene 8 dígitos.');
    if (pw.length < 6) return setErr('La contraseña debe tener al menos 6 caracteres.');
    if (pw !== pw2) return setErr('Las contraseñas no coinciden.');
    setBusy(true);
    const r = await callMemberAccount({ action: 'register', ...v, university_code: ucode, dni, password: pw });
    if (!r.ok) { setBusy(false); return setErr(r.error || 'No se pudo registrar.'); }
    await supabase.auth.signInWithPassword({ email: codeToEmail(ucode), password: pw }); // redirige a /mi-perfil
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="card mx-auto max-w-xl hover:translate-y-0">
      <h2 className="text-2xl font-extrabold">Crea tu perfil cipriano</h2>
      <p className="mt-1 text-sm text-ink/60">La directiva lo revisará antes de publicarlo. ¿Ya apareces en la web? Mejor <button type="button" onClick={() => go('activar')} className="font-semibold text-brand-600">activa tu cuenta</button>.</p>
      <div className="mt-6 grid gap-4 rounded-2xl bg-ink/[.03] p-4 sm:grid-cols-2">
        <CodeInput value={ucode} onChange={setUcode} label="Código Ulima * (tu usuario)" />
        <div><label className="label">DNI * (privado)</label><input className="input" inputMode="numeric" maxLength={8} required value={dni} onChange={(e) => setDni(onlyDigits(e.target.value))} /></div>
        <div><label className="label">Contraseña *</label><input className="input" type="password" required autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="mín. 6" /></div>
        <div><label className="label">Repetir *</label><input className="input" type="password" required autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></div>
      </div>
      <div className="mt-5"><ProfileFields v={v} set={setV} areas={areas.data || []} /></div>
      <label className="mt-5 flex items-start gap-2 text-sm text-ink/70"><input type="checkbox" required className="mt-0.5 h-4 w-4 accent-brand" checked={accept} onChange={(e) => setAccept(e.target.checked)} /> Acepto que CIPRO muestre en su web mi nombre, foto, carrera, descripción y LinkedIn.</label>
      {err && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</p>}
      <button className="btn-primary mt-6 w-full" disabled={busy}>{busy ? 'Creando tu perfil…' : 'Registrarme'}</button>
      <p className="mt-3 text-center text-xs text-ink/50">¿Problemas? Escríbenos desde la sección <Link to="/#unete" className="underline">Únete</Link>.</p>
    </form>
  );
}
