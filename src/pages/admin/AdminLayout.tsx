import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import Logo from '../../components/Logo';
import MembersAdmin from './MembersAdmin';
import { CrudAdmin } from './CrudAdmin';
import SettingsAdmin from './SettingsAdmin';
import GalleryBulk from './GalleryBulk';

const TABS = ['Integrantes', 'Ciclos', 'Áreas', 'Noticias', 'Proyectos', 'Alianzas', 'Galería', 'Marca y textos'] as const;

export default function AdminLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>('Integrantes');
  const [showPw, setShowPw] = useState(false);
  const [galleryKey, setGalleryKey] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    supabase.rpc('is_admin').then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  if (!session) return <AdminLogin />;
  if (isAdmin === null) return <div className="p-10">Verificando permisos…</div>;
  if (!isAdmin) return (
    <div className="container-x py-20 text-center">
      <p>Esta cuenta ({userCode(session.user.email)}) no tiene permisos de administrador.</p>
      <button className="btn-ghost mt-4" onClick={() => supabase.auth.signOut()}>Cerrar sesión</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-50/40">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-white">
        <div className="container-x flex h-14 items-center justify-between">
          <div className="flex items-center gap-3"><Logo className="h-8" /><span className="rounded-full bg-ink px-2 py-0.5 text-xs font-bold text-white">ADMIN</span></div>
          <div className="flex items-center gap-3 text-sm"><span className="hidden text-ink/60 sm:inline">Código {userCode(session.user.email)}</span><button onClick={() => setShowPw(true)} title="Cambiar contraseña" aria-label="Cambiar contraseña" className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand-700 hover:bg-brand hover:text-white"><KeyIcon /></button><button className="btn-ghost py-1.5" onClick={() => supabase.auth.signOut()}>Salir</button></div>
        </div>
        <nav className="container-x flex gap-1 overflow-x-auto pb-2">
          {TABS.map((t) => <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold ${tab === t ? 'bg-brand text-white' : 'text-ink/60 hover:bg-brand-50'}`}>{t}</button>)}
        </nav>
      </header>
      {showPw && <ChangePassword email={session.user.email!} onClose={() => setShowPw(false)} />}
      <main className="container-x py-8">
        {tab === 'Integrantes' && <MembersAdmin />}
        {tab === 'Ciclos' && <CrudAdmin table="periods" title="Ciclos" order="code" fields={[
          { key: 'code', label: 'Código (ej. 2026-1)', required: true }, { key: 'label', label: 'Nombre' },
          { key: 'starts_on', label: 'Inicio', type: 'date' }, { key: 'ends_on', label: 'Fin', type: 'date' },
          { key: 'is_current', label: 'Ciclo actual (solo uno)', type: 'bool' }]} display={(r) => `${r.code}${r.is_current ? ' · ACTUAL' : ''}`} />}
        {tab === 'Áreas' && <CrudAdmin table="areas" title="Áreas" order="sort_order" fields={[
          { key: 'name', label: 'Nombre', required: true }, { key: 'slug', label: 'Identificador (sin espacios)', required: true },
          { key: 'short_name', label: 'Sigla' }, { key: 'description', label: 'Descripción', type: 'textarea' },
          { key: 'icon', label: 'Ícono', type: 'select', options: ['crown', 'compass', 'kanban', 'users', 'megaphone', 'sparkles', 'star'] },
          { key: 'sort_order', label: 'Orden', type: 'number' }, { key: 'is_active', label: 'Activa', type: 'bool', default: true }]} display={(r) => r.name} />}
        {tab === 'Noticias' && <CrudAdmin table="news" title="Noticias" order="published_at" desc fields={[
          { key: 'title', label: 'Título', required: true }, { key: 'slug', label: 'URL (ej. ciprothon-2026)', required: true },
          { key: 'category', label: 'Categoría', type: 'select', options: ['noticia', 'evento', 'concurso', 'alianza', 'logro'] },
          { key: 'published_at', label: 'Fecha', type: 'date' }, { key: 'excerpt', label: 'Resumen', type: 'textarea' },
          { key: 'body', label: 'Contenido', type: 'textarea' }, { key: 'cover_url', label: 'Imagen de portada', type: 'image', folder: 'news' },
          { key: 'is_published', label: 'Publicada', type: 'bool', default: true }]} display={(r) => `${r.title}${r.is_published ? '' : ' (borrador)'}`} />}
        {tab === 'Proyectos' && <CrudAdmin table="projects" title="Proyectos" order="sort_order" fields={[
          { key: 'name', label: 'Nombre', required: true }, { key: 'slug', label: 'Identificador', required: true },
          { key: 'summary', label: 'Resumen', type: 'textarea' }, { key: 'description', label: 'Descripción', type: 'textarea' },
          { key: 'category', label: 'Categoría', type: 'select', options: ['LIGHT', 'STANDARD', 'STRATEGIC'] },
          { key: 'status', label: 'Estado', type: 'select', options: ['planificado', 'en_curso', 'cerrado'], default: 'en_curso' },
          { key: 'period_id', label: 'Ciclo', type: 'ref', ref: { table: 'periods', label: 'code' } },
          { key: 'cover_url', label: 'Portada', type: 'image', folder: 'projects' },
          { key: 'is_featured', label: 'Destacado', type: 'bool' }, { key: 'sort_order', label: 'Orden', type: 'number' },
          { key: 'is_published', label: 'Publicado', type: 'bool', default: true }]} display={(r) => r.name} />}
        {tab === 'Alianzas' && <CrudAdmin table="alliances" title="Alianzas" order="sort_order" fields={[
          { key: 'name', label: 'Nombre', required: true }, { key: 'kind', label: 'Tipo (empresa, organización estudiantil…)' },
          { key: 'description', label: 'Descripción', type: 'textarea' }, { key: 'since', label: 'Desde (año)' },
          { key: 'website_url', label: 'Sitio web' }, { key: 'logo_url', label: 'Logo', type: 'image', folder: 'alliances' },
          { key: 'sort_order', label: 'Orden', type: 'number' }, { key: 'is_published', label: 'Publicada', type: 'bool', default: true }]} display={(r) => r.name} />}
        {tab === 'Galería' && <GalleryBulk onDone={() => setGalleryKey((k) => k + 1)} />}
        {tab === 'Galería' && <CrudAdmin key={galleryKey} table="gallery" title="Galería" order="event_date" desc fields={[
          { key: 'image_url', label: 'Foto', type: 'image', folder: 'gallery', required: true }, { key: 'title', label: 'Descripción' },
          { key: 'event_date', label: 'Fecha', type: 'date' }, { key: 'period_id', label: 'Ciclo', type: 'ref', ref: { table: 'periods', label: 'code' } }]}
          display={(r) => r.title || 'Foto'} />}
        {tab === 'Marca y textos' && <SettingsAdmin />}
      </main>
    </div>
  );
}

/** "2020-4390" o "20204390" -> correo institucional de la cuenta admin */
export function codeToEmail(input: string) {
  const v = input.trim().toLowerCase();
  return v.includes('@') ? v : `${v.replace(/\D/g, '')}@aloe.ulima.edu.pe`;
}
const userCode = (email?: string) => (email || '').split('@')[0].replace(/^(\d{4})(\d+)$/, '$1-$2');

function ChangePassword({ email, onClose }: { email: string; onClose: () => void }) {
  const [cur, setCur] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    if (pw.length < 6) return setMsg({ ok: false, t: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    if (pw !== pw2) return setMsg({ ok: false, t: 'Las contraseñas no coinciden.' });
    setBusy(true);
    const check = await supabase.auth.signInWithPassword({ email, password: cur });
    if (check.error) { setBusy(false); return setMsg({ ok: false, t: 'La contraseña actual no es correcta.' }); }
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setMsg({ ok: false, t: error.message });
    setMsg({ ok: true, t: 'Contraseña actualizada ✔' }); setCur(''); setPw(''); setPw2('');
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white"><KeyIcon /></span><h2 className="text-lg font-extrabold">Cambiar contraseña</h2></div>
        <label className="label mt-5">Contraseña actual</label>
        <input className="input" type="password" required autoComplete="current-password" value={cur} onChange={(e) => setCur(e.target.value)} />
        <label className="label mt-3">Nueva contraseña (mín. 6 caracteres)</label>
        <input className="input" type="password" required autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <label className="label mt-3">Repite la nueva contraseña</label>
        <input className="input" type="password" required autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
        {msg && <p className={`mt-3 rounded-lg p-2 text-sm ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg.t}</p>}
        <div className="mt-5 flex gap-2"><button className="btn-primary flex-1" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</button><button type="button" className="btn-ghost" onClick={onClose}>Cerrar</button></div>
      </form>
    </div>
  );
}
function KeyIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="7.5" cy="15.5" r="4.5" /><path d="M10.7 12.3 21 2M16 7l3 3M18.5 4.5l2 2" /></svg>;
}

function AdminLogin() {
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="grid min-h-screen place-items-center bg-ink p-4">
      <form className="w-full max-w-sm rounded-3xl bg-white p-8" onSubmit={async (e) => {
        e.preventDefault(); setErr(''); setBusy(true);
        const { error } = await supabase.auth.signInWithPassword({ email: codeToEmail(codigo), password });
        setBusy(false);
        if (error) setErr('Código o contraseña incorrectos.');
      }}>
        <Logo />
        <h1 className="mt-6 text-xl font-extrabold">Panel de administración</h1>
        <label className="label mt-6">Código universitario</label>
        <input className="input" required autoComplete="username" placeholder="2020-4390" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
        <label className="label mt-4">Contraseña</label>
        <input className="input" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
        <button className="btn-primary mt-6 w-full" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
      </form>
    </div>
  );
}
