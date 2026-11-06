import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { supabase, uploadMedia } from '../lib/supabase';
import { isMemberEmail, useSession } from '../lib/session';
import { ROLE_LABEL, type Member, type Role } from '../lib/types';
import ProfileFields, { emptyProfile, type ProfileForm } from '../components/ProfileFields';

type Hist = { id: string; role: Role; position_title: string | null; periods: { code: string } | null; areas: { name: string } | null };
const MAX_PHOTOS = 8;

export default function MyProfile() {
  const { session, ready } = useSession();
  const [member, setMember] = useState<Member | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyProfile);
  const [hist, setHist] = useState<Hist[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [busy, setBusy] = useState('');
  const [ciproCode, setCiproCode] = useState('');
  const uid = session?.user.id;

  async function load() {
    if (!uid) return;
    const { data: m } = await supabase.from('members').select('*').eq('user_id', uid).maybeSingle();
    if (!m) return;
    const { data: p } = await supabase.from('member_private').select('email,phone').eq('member_id', m.id).maybeSingle();
    const { data: c } = await supabase.from('member_codes').select('code').eq('member_id', m.id).maybeSingle();
    setCiproCode(c?.code ?? '');
    const { data: h } = await supabase.from('memberships').select('id,role,position_title,periods(code),areas(name)').eq('member_id', m.id);
    setMember(m);
    setHist(((h as unknown as Hist[]) || []).sort((a, b) => (b.periods?.code || '').localeCompare(a.periods?.code || '')));
    setForm({
      full_name: m.full_name ?? '', university_code: m.university_code ?? '', career: m.career ?? '', email: p?.email ?? '', phone: p?.phone ?? '',
      linkedin_url: m.linkedin_url ?? '', is_working: !!m.is_working, company: m.company ?? '', job_title: m.job_title ?? '',
      joined_on: m.joined_on ? m.joined_on.slice(0, 7) : '', bio: m.bio ?? '', area_id: '',
    });
  }
  useEffect(() => { load(); }, [uid]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return <div className="container-x py-20">Cargando…</div>;
  if (!session || !isMemberEmail(session.user.email)) return <Navigate to="/acceso" replace />;
  if (!member) return <div className="container-x py-20">Cargando tu perfil…</div>;

  const n = (s: string) => (s.trim() ? s.trim() : null);
  async function save() {
    if (!form.full_name.trim()) return setMsg({ ok: false, t: 'El nombre es obligatorio.' });
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setMsg({ ok: false, t: 'Ingresa un correo válido.' });
    if (!/linkedin\.com\//i.test(form.linkedin_url)) return setMsg({ ok: false, t: 'Ingresa el enlace de tu perfil de LinkedIn.' });
    if (!form.career.trim()) return setMsg({ ok: false, t: 'Selecciona tu carrera.' });
    setBusy('save');
    const { error } = await supabase.from('members').update({
      full_name: form.full_name.trim(), career: n(form.career), linkedin_url: n(form.linkedin_url),
      is_working: form.is_working, company: form.is_working ? n(form.company) : null, job_title: form.is_working ? n(form.job_title) : null,
      joined_on: form.joined_on ? `${form.joined_on}-01` : null, bio: n(form.bio),
    }).eq('id', member!.id);
    const e2 = (await supabase.from('member_private').update({ email: n(form.email), phone: n(form.phone) }).eq('member_id', member!.id)).error;
    setBusy('');
    setMsg(error || e2 ? { ok: false, t: (error || e2)!.message } : { ok: true, t: 'Perfil guardado ✔' });
    load();
  }
  async function setPhoto(file: File) {
    setBusy('photo');
    try {
      const url = await uploadMedia(file, `members/${uid}`);
      await supabase.from('members').update({ photo_url: url }).eq('id', member!.id);
      await load(); setMsg({ ok: true, t: 'Foto de perfil actualizada ✔' });
    } catch (e) { setMsg({ ok: false, t: (e as Error).message }); }
    setBusy('');
  }
  async function addPhotos(files: FileList) {
    const room = MAX_PHOTOS - (member!.photos?.length || 0);
    const list = Array.from(files).slice(0, room);
    setBusy('photos');
    const urls: string[] = [];
    for (const f of list) { try { urls.push(await uploadMedia(f, `members/${uid}`)); } catch { /* sigue */ } }
    await supabase.from('members').update({ photos: [...(member!.photos || []), ...urls] }).eq('id', member!.id);
    setBusy(''); load();
  }
  async function removePhoto(url: string) {
    await supabase.from('members').update({ photos: (member!.photos || []).filter((p) => p !== url) }).eq('id', member!.id);
    load();
  }

  return (
    <div className="bg-brand-50/40 pb-20">
      <div className="h-40 bg-gradient-to-r from-brand to-brand-700" />
      <div className="container-x -mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-end gap-5">
            <label className="group relative block h-36 w-36 shrink-0 cursor-pointer overflow-hidden rounded-full bg-white ring-4 ring-white shadow-xl" title="Cambiar foto">
              {member.photo_url ? <img src={member.photo_url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center bg-brand-100 text-4xl">📷</div>}
              <span className="absolute inset-0 grid place-items-center bg-ink/50 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">{busy === 'photo' ? 'Subiendo…' : 'Cambiar foto'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && setPhoto(e.target.files[0])} />
            </label>
            <div className="pb-2">
              <h1 className="text-3xl font-extrabold">{member.full_name}</h1>
              <p className="text-ink/60">{member.career}</p>
            </div>
          </div>
          <div className="flex gap-2 pb-2">
            {member.status === 'aprobado' && <Link to={`/cipriano/${member.id}`} className="btn-ghost bg-white">Ver mi perfil público</Link>}
            <button className="btn-dark" onClick={() => supabase.auth.signOut()}>Salir</button>
          </div>
        </div>

        {member.status === 'pendiente' && <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200">⏳ Tu perfil está <b>en revisión</b>. La directiva lo aprobará pronto y aparecerá en la web. Mientras tanto, ya puedes completarlo.</div>}
        {member.status === 'rechazado' && <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-800">Tu perfil no fue aprobado. Comunícate con la directiva.</div>}
        {msg && <div className={`mt-4 rounded-xl p-3 text-sm ${msg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg.t}</div>}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-extrabold">Mis datos</h2>
              <ProfileFields v={form} set={setForm} showArea={false} />
              <button className="btn-primary mt-6" onClick={save} disabled={busy === 'save'}>{busy === 'save' ? 'Guardando…' : 'Guardar cambios'}</button>
            </section>
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between"><h2 className="text-lg font-extrabold">Mis fotos en CIPRO</h2><span className="text-xs text-ink/50">{member.photos?.length || 0}/{MAX_PHOTOS}</span></div>
              <p className="text-sm text-ink/60">Eventos, proyectos, momentos con el equipo… se mostrarán en tu perfil.</p>
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {member.photos?.map((p) => (
                  <div key={p} className="group relative aspect-square overflow-hidden rounded-xl">
                    <img src={p} alt="" className="h-full w-full object-cover" />
                    <button onClick={() => removePhoto(p)} className="absolute right-1 top-1 rounded-full bg-ink/70 px-2 text-xs text-white opacity-0 group-hover:opacity-100">✕</button>
                  </div>
                ))}
                {(member.photos?.length || 0) < MAX_PHOTOS && (
                  <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-brand-200 text-center text-sm text-brand-600 hover:bg-brand-50">
                    {busy === 'photos' ? 'Subiendo…' : <span>＋<br />Agregar</span>}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && addPhotos(e.target.files)} />
                  </label>
                )}
              </div>
            </section>
          </div>
          <aside className="space-y-6">
            <section className="relative overflow-hidden rounded-3xl bg-ink p-6 text-white shadow-sm">
              <div className="dot-grid-light absolute inset-0 opacity-40" />
              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-300">Tu acceso</p>
                <p className="mt-3 text-sm text-white/60">Usuario (código Ulima)</p>
                <p className="font-mono text-xl font-bold">{member.university_code || '—'}</p>
                <p className="mt-3 text-sm text-white/60">Tu código CIPRO</p>
                <p className="font-mono text-2xl font-black tracking-[.25em] text-brand">{ciproCode || '—'}</p>
              </div>
            </section>
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-extrabold">Mi Carrera Cipriana</h2>
              <ol className="mt-4 space-y-3 border-l-2 border-brand-200 pl-5">
                {hist.map((h) => (
                  <li key={h.id} className="relative">
                    <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-brand" />
                    <p className="text-xs font-bold text-brand-600">Ciclo {h.periods?.code}</p>
                    <p className="font-semibold">{h.position_title || ROLE_LABEL[h.role]}</p>
                    <p className="text-sm text-ink/60">{h.areas?.name}</p>
                  </li>
                ))}
                {!hist.length && <li className="text-sm text-ink/60">La directiva agregará tus ciclos.</li>}
              </ol>
            </section>
            <PasswordBox />
          </aside>
        </div>
      </div>
    </div>
  );
}

function PasswordBox() {
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-extrabold">🔑 Cambiar contraseña</h2>
      <input className="input mt-3" type="password" placeholder="Nueva contraseña (mín. 6)" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
      <button className="btn-ghost mt-3 w-full" onClick={async () => {
        if (pw.length < 6) return setMsg('Mínimo 6 caracteres.');
        const { error } = await supabase.auth.updateUser({ password: pw });
        setMsg(error ? error.message : 'Contraseña actualizada ✔'); setPw('');
      }}>Actualizar</button>
      {msg && <p className="mt-2 text-sm">{msg}</p>}
    </section>
  );
}
