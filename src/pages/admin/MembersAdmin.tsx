import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ROLE_LABEL, ROLE_ORDER, type Area, type Member, type Membership, type Period, type Role } from '../../lib/types';
import ImageInput from './ImageInput';
import { callMemberAccount } from '../../lib/session';
import { ULIMA_CAREERS } from '../../lib/careers';

type Edit = Partial<Member> & { dni?: string; email?: string; phone?: string; password?: string; origCode?: string };
type MRow = Membership & { members: Member };

function genPassword() { return Math.random().toString(36).slice(2, 6).toUpperCase() + Math.floor(1000 + Math.random() * 9000); }

/** Chip del código CIPRO con botón de copiar. */
function CodeChip({ code, big = false }: { code?: string; big?: boolean }) {
  const [copied, setCopied] = useState(false);
  if (!code) return null;
  return (
    <button type="button" title="Copiar código CIPRO" onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-ink font-mono font-bold text-white transition hover:bg-brand ${big ? 'px-3 py-2 text-xl tracking-[.25em]' : 'px-2 py-1 text-[11px] tracking-widest'}`}>
      {code}<span className={big ? 'text-sm' : 'text-[10px]'}>{copied ? '✓' : '⧉'}</span>
    </button>
  );
}

export default function MembersAdmin() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [ms, setMs] = useState<MRow[]>([]);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [periodId, setPeriodId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [q, setQ] = useState('');
  const [onlyPending, setOnlyPending] = useState(false);
  const [edit, setEdit] = useState<Edit | null>(null);
  const [codeDraft, setCodeDraft] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [newMs, setNewMs] = useState<{ period_id: string; area_id: string; role: Role; position_title: string }>({ period_id: '', area_id: '', role: 'miembro', position_title: '' });

  const load = async () => {
    const [p, a, m, x, c] = await Promise.all([
      supabase.from('periods').select('*').order('code', { ascending: false }),
      supabase.from('areas').select('*').order('sort_order'),
      supabase.from('members').select('*').order('full_name'),
      supabase.from('memberships').select('*, members(*)'),
      supabase.from('member_codes').select('member_id, code'),
    ]);
    setPeriods(p.data || []); setAreas(a.data || []); setMembers(m.data || []); setMs((x.data as MRow[]) || []);
    setCodes(Object.fromEntries((c.data || []).map((r) => [r.member_id, r.code])));
    if (!periodId) setPeriodId(p.data?.find((r) => r.is_current)?.id || '');
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const list = useMemo(() => {
    if (onlyPending) return members.filter((m) => m.status === 'pendiente');
    let ids: Set<string> | null = null;
    if (periodId || areaId) ids = new Set(ms.filter((r) => (!periodId || r.period_id === periodId) && (!areaId || r.area_id === areaId)).map((r) => r.member_id));
    const term = q.toLowerCase().trim();
    return members.filter((m) => (!ids || ids.has(m.id)) && (!term || m.full_name.toLowerCase().includes(term) || (codes[m.id] || '').toLowerCase().includes(term) || (m.university_code || '').includes(term)));
  }, [members, ms, periodId, areaId, q, onlyPending, codes]);
  const pending = members.filter((m) => m.status === 'pendiente').length;

  async function open(m?: Member) {
    setMsg(''); setCodeDraft(null);
    if (!m) { setEdit({ full_name: '', is_active: true, status: 'aprobado', password: '' }); setNewMs({ period_id: periodId, area_id: areaId, role: 'miembro', position_title: '' }); return; }
    const { data } = await supabase.from('member_private').select('dni,email,phone').eq('member_id', m.id).maybeSingle();
    setEdit({ ...m, dni: data?.dni ?? '', email: data?.email ?? '', phone: data?.phone ?? '', password: '', origCode: m.university_code ?? '' });
    setNewMs({ period_id: periodId, area_id: areaId, role: 'miembro', position_title: '' });
  }

  async function save() {
    if (!edit?.full_name) { setMsg('El nombre es obligatorio.'); return; }
    const ucode = (edit.university_code || '').trim();
    if (ucode && !/^\d{8}$/.test(ucode)) { setMsg('El código Ulima debe tener 8 dígitos.'); return; }
    if (edit.dni && !/^\d{8}$/.test(edit.dni)) { setMsg('El DNI debe tener 8 dígitos.'); return; }
    if (edit.password && edit.password.length < 6) { setMsg('La contraseña debe tener al menos 6 caracteres.'); return; }
    if (edit.password && !ucode) { setMsg('Para darle acceso, escribe su código Ulima (será su usuario).'); return; }
    if (edit.user_id && ucode !== edit.origCode && !edit.password) { setMsg('Cambiaste el código Ulima de alguien con cuenta: asígnale también una contraseña nueva para que pueda entrar con su nuevo código.'); return; }
    const payload = {
      full_name: edit.full_name, career: edit.career || null, photo_url: edit.photo_url || null, linkedin_url: edit.linkedin_url || null, bio: edit.bio || null,
      is_active: edit.is_active ?? true, status: edit.status ?? 'aprobado', university_code: ucode || null,
      is_working: !!edit.is_working, company: edit.is_working ? edit.company || null : null, job_title: edit.is_working ? edit.job_title || null : null,
      joined_on: edit.joined_on ? `${edit.joined_on.slice(0, 7)}-01` : null,
    };
    let id = edit.id;
    if (id) { const { error } = await supabase.from('members').update(payload).eq('id', id); if (error) return setMsg(error.message.includes('university_code') ? 'Ese código Ulima ya pertenece a otro integrante.' : error.message); }
    else {
      const { data, error } = await supabase.from('members').insert(payload).select('id').single();
      if (error) return setMsg(error.message.includes('university_code') ? 'Ese código Ulima ya pertenece a otro integrante.' : error.message);
      id = data.id;
      if (newMs.period_id) await supabase.from('memberships').insert({ member_id: id, period_id: newMs.period_id, area_id: newMs.area_id || null, role: newMs.role, position_title: newMs.position_title || null });
    }
    if (edit.dni || edit.email || edit.phone) {
      const { error } = await supabase.from('member_private').upsert({ member_id: id, dni: edit.dni || null, email: edit.email || null, phone: edit.phone || null }, { onConflict: 'member_id' });
      if (error) return setMsg(error.message.includes('duplicate') ? 'Ese DNI ya está registrado.' : error.message);
    }
    if (edit.password) {
      const r = await callMemberAccount({ action: 'admin_set_access', member_id: id, university_code: ucode, password: edit.password });
      if (!r.ok) return setMsg(r.error || 'No se pudo crear el acceso.');
    }
    setMsg(edit.password ? `Guardado ✔ — ${edit.full_name} entra en “Soy cipriano” con su código Ulima ${ucode} y la contraseña ${edit.password}` : 'Guardado ✔');
    await load();
    const fresh = (await supabase.from('members').select('*').eq('id', id!).single()).data;
    if (fresh) setEdit((e) => ({ ...e!, ...fresh, id: fresh.id, password: '', origCode: fresh.university_code ?? '' }));
  }

  async function regenerate() {
    if (!edit?.id || !confirm('¿Generar un código CIPRO nuevo? El anterior dejará de funcionar.')) return;
    const { data, error } = await supabase.rpc('admin_regenerate_code', { p_member_id: edit.id });
    if (error) return setMsg(error.message);
    setCodes({ ...codes, [edit.id]: data as string }); setMsg(`Nuevo código: ${data}`);
  }
  async function saveCustomCode() {
    if (!edit?.id || codeDraft == null) return;
    const c = codeDraft.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (c.length < 4 || c.length > 12) return setMsg('El código debe tener entre 4 y 12 letras o números.');
    const { error } = await supabase.from('member_codes').upsert({ member_id: edit.id, code: c, updated_at: new Date().toISOString() }, { onConflict: 'member_id' });
    if (error) return setMsg(error.message.includes('duplicate') ? `El código ${c} ya lo tiene otra persona.` : error.message);
    setCodes({ ...codes, [edit.id]: c }); setCodeDraft(null); setMsg(`Código actualizado a ${c} ✔`);
  }

  async function createPeriod() {
    const code = prompt('Código del nuevo ciclo (ej. 2027-1 o 2020-2):')?.trim();
    if (!code) return;
    if (!/^\d{4}-[12]$/.test(code)) { setMsg('El ciclo debe tener el formato AAAA-1 o AAAA-2 (ej. 2027-1).'); return; }
    const y = Number(code.slice(0, 4)), s = code.endsWith('1') ? 1 : 2;
    const { data, error } = await supabase.from('periods').insert({ code, label: `Ciclo ${code}`, starts_on: `${y}-${s === 1 ? '03' : '08'}-01`, ends_on: `${y}-${s === 1 ? '07-31' : '12-31'}` }).select('id').single();
    if (error) { setMsg(error.message.includes('duplicate') ? `El ciclo ${code} ya existe.` : error.message); return; }
    await load(); setNewMs((n) => ({ ...n, period_id: data.id })); setMsg(`Ciclo ${code} creado ✔`);
  }
  async function addMs() {
    if (!edit?.id || !newMs.period_id) return;
    const { error } = await supabase.from('memberships').insert({ member_id: edit.id, period_id: newMs.period_id, area_id: newMs.area_id || null, role: newMs.role, position_title: newMs.position_title || null });
    setMsg(error ? (error.message.includes('duplicate') ? 'Ya está en ese ciclo y área.' : error.message) : 'Ciclo agregado ✔'); load();
  }
  async function delMs(id: string) { await supabase.from('memberships').delete().eq('id', id); load(); }
  async function delMember() {
    if (!edit?.id || !confirm(`¿Eliminar a ${edit.full_name} y todo su historial?`)) return;
    await supabase.from('members').delete().eq('id', edit.id); setEdit(null); load();
  }

  const pCode = (id: string) => periods.find((p) => p.id === id)?.code;
  const aName = (id: string | null) => areas.find((a) => a.id === id)?.short_name || areas.find((a) => a.id === id)?.name || '—';
  const MsForm = (
    <div className="grid gap-2 sm:grid-cols-2">
      <select className="input" value={newMs.period_id} onChange={(e) => (e.target.value === '__new' ? createPeriod() : setNewMs({ ...newMs, period_id: e.target.value }))}>
        <option value="">Ciclo…</option>
        {periods.map((p) => <option key={p.id} value={p.id}>{p.code}{p.is_current ? ' (actual)' : ''}</option>)}
        <option value="__new">＋ Crear nuevo ciclo…</option>
      </select>
      <select className="input" value={newMs.area_id} onChange={(e) => setNewMs({ ...newMs, area_id: e.target.value })}>
        <option value="">Área…</option>
        <optgroup label="Áreas actuales">{areas.filter((a) => !a.is_historical).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</optgroup>
        <optgroup label="Áreas históricas">{areas.filter((a) => a.is_historical).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</optgroup>
      </select>
      <select className="input" value={newMs.role} onChange={(e) => setNewMs({ ...newMs, role: e.target.value as Role })}>{ROLE_ORDER.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select>
      <input className="input" placeholder="Cargo visible (ej. Gerente de PMO)" value={newMs.position_title} onChange={(e) => setNewMs({ ...newMs, position_title: e.target.value })} />
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_460px]">
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold">Integrantes <span className="text-sm font-normal text-ink/50">({list.length})</span></h2>
          <div className="flex gap-2">
            <button onClick={() => setOnlyPending(!onlyPending)} className={`btn py-1.5 ${onlyPending ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'}`}>⏳ Solicitudes {pending > 0 && <span className="rounded-full bg-amber-600 px-1.5 text-xs text-white">{pending}</span>}</button>
            <button className="btn-primary py-1.5" onClick={() => open()}>+ Nuevo integrante</button>
          </div>
        </div>
        {onlyPending && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Ciprianos que se registraron solos. Ábrelos, revisa sus datos y presiona <b>Aprobar</b> para que aparezcan en la web.</p>}
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <select className="input" value={periodId} onChange={(e) => setPeriodId(e.target.value)}><option value="">Todos los ciclos</option>{periods.map((p) => <option key={p.id} value={p.id}>{p.code}</option>)}</select>
          <select className="input" value={areaId} onChange={(e) => setAreaId(e.target.value)}><option value="">Todas las áreas</option>{areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
          <input className="input" placeholder="Buscar nombre, código CIPRO o Ulima…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <p className="mt-3 flex flex-wrap gap-4 text-xs text-ink/50"><span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-green-500" />con cuenta activa</span><span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-ink/15" />aún sin cuenta (envíale su código CIPRO)</span><span><b className="font-mono">⧉</b> clic en el código para copiarlo</span></p>
        <ul className="mt-2 divide-y divide-ink/5">
          {list.map((m) => {
            const mine = ms.filter((r) => r.member_id === m.id && (!periodId || r.period_id === periodId));
            return (
              <li key={m.id} className={`flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-brand-50/50 ${edit?.id === m.id ? 'bg-brand-50' : ''}`} onClick={() => open(m)}>
                <span title={m.user_id ? 'Tiene cuenta' : 'Sin cuenta'} className={`h-2.5 w-2.5 shrink-0 rounded-full ${m.user_id ? 'bg-green-500' : 'bg-ink/15'}`} />
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-brand-100">{m.photo_url && <img src={m.photo_url} alt="" className="h-full w-full object-cover" />}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{m.full_name}{!m.is_active && <span className="ml-2 text-xs text-ink/40">(oculto)</span>}{m.status === 'pendiente' && <span className="ml-2 rounded-full bg-amber-100 px-2 text-xs text-amber-800">pendiente</span>}{m.status === 'rechazado' && <span className="ml-2 rounded-full bg-red-100 px-2 text-xs text-red-700">rechazado</span>}</p>
                  <p className="truncate text-xs text-ink/50">{mine.map((r) => `${pCode(r.period_id)} · ${aName(r.area_id)} · ${r.position_title || ROLE_LABEL[r.role]}`).join('  |  ') || 'Sin ciclo asignado'}</p>
                </div>
                <CodeChip code={codes[m.id]} />
              </li>
            );
          })}
        </ul>
      </div>

      <div className="lg:sticky lg:top-32 lg:self-start">
        {msg && <p className="mb-3 rounded-xl bg-white p-3 text-sm shadow-sm">{msg}</p>}
        {edit && (
          <div className="max-h-[calc(100vh-9rem)] space-y-4 overflow-y-auto rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><h3 className="font-bold">{edit.id ? 'Editar integrante' : 'Nuevo integrante'}</h3><button className="text-sm text-ink/40 hover:text-ink" onClick={() => setEdit(null)}>✕</button></div>

            {edit.id && (
              <div className="rounded-2xl bg-ink p-4 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div><p className="text-xs font-bold uppercase tracking-[.2em] text-brand-300">Código CIPRO</p><p className="text-xs text-white/50">{edit.user_id ? 'Su identificador único en CIPRO' : 'Envíaselo para que active su cuenta'}</p></div>
                  {codeDraft == null && <CodeChip code={codes[edit.id]} big />}
                </div>
                {codeDraft != null ? (
                  <div className="mt-3 flex gap-2">
                    <input className="input bg-white font-mono font-bold uppercase tracking-widest text-ink" maxLength={12} autoFocus value={codeDraft} onChange={(e) => setCodeDraft(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} />
                    <button className="btn-primary py-1.5" onClick={saveCustomCode}>Guardar</button>
                    <button className="btn py-1.5 text-white/70" onClick={() => setCodeDraft(null)}>✕</button>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <button className="btn bg-white/10 py-1.5 hover:bg-white/20" onClick={regenerate}>↻ Generar nuevo</button>
                    <button className="btn bg-white/10 py-1.5 hover:bg-white/20" onClick={() => setCodeDraft(codes[edit.id!] || '')}>✎ Editar</button>
                    {!edit.user_id && codes[edit.id] && <button className="btn bg-brand py-1.5 hover:bg-brand-600" onClick={() => { navigator.clipboard?.writeText(`¡Hola ${(edit.full_name || '').split(' ')[0]}! Activa tu perfil cipriano en ${location.origin}/acceso#activar con tu código CIPRO: ${codes[edit.id!]} y tu código Ulima como usuario.`); setMsg('Mensaje copiado ✔ — pégalo en WhatsApp'); }}>📋 Copiar mensaje de invitación</button>}
                  </div>
                )}
              </div>
            )}

            {edit.id && edit.status !== 'aprobado' && (
              <div className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200">
                <p className="text-sm text-amber-900">{edit.status === 'pendiente' ? '⏳ Se registró por su cuenta y espera aprobación.' : 'Perfil rechazado.'}</p>
                <div className="mt-2 flex gap-2">
                  <button className="btn bg-green-600 py-1.5 text-white" onClick={async () => { await supabase.from('members').update({ status: 'aprobado' }).eq('id', edit.id!); setEdit({ ...edit, status: 'aprobado' }); setMsg('Aprobado ✔ — ya aparece en la web'); load(); }}>✓ Aprobar</button>
                  {edit.status === 'pendiente' && <button className="btn bg-white py-1.5 text-red-700 ring-1 ring-red-200" onClick={async () => { await supabase.from('members').update({ status: 'rechazado' }).eq('id', edit.id!); setEdit({ ...edit, status: 'rechazado' }); setMsg('Rechazado'); load(); }}>Rechazar</button>}
                </div>
              </div>
            )}

            <div><label className="label">Foto</label><ImageInput value={edit.photo_url ?? ''} folder="members" onChange={(v) => setEdit({ ...edit, photo_url: v })} /></div>
            <div><label className="label">Nombre completo *</label><input className="input" value={edit.full_name ?? ''} onChange={(e) => setEdit({ ...edit, full_name: e.target.value })} /></div>
            <div><label className="label">Carrera</label><input className="input" list="ulima-careers" value={edit.career ?? ''} onChange={(e) => setEdit({ ...edit, career: e.target.value })} placeholder="Elige o escribe…" /><datalist id="ulima-careers">{ULIMA_CAREERS.map((c) => <option key={c} value={c} />)}</datalist></div>
            <div><label className="label">LinkedIn (URL)</label><input className="input" value={edit.linkedin_url ?? ''} onChange={(e) => setEdit({ ...edit, linkedin_url: e.target.value })} placeholder="https://www.linkedin.com/in/…" /></div>
            <div><label className="label">Ingresó a CIPRO (mes)</label><input className="input" type="month" value={(edit.joined_on ?? '').slice(0, 7)} onChange={(e) => setEdit({ ...edit, joined_on: e.target.value })} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-brand" checked={!!edit.is_working} onChange={(e) => setEdit({ ...edit, is_working: e.target.checked })} /> Trabajando actualmente</label>
            {edit.is_working && <div className="grid gap-3 sm:grid-cols-2"><input className="input" placeholder="Empresa" value={edit.company ?? ''} onChange={(e) => setEdit({ ...edit, company: e.target.value })} /><input className="input" placeholder="Cargo" value={edit.job_title ?? ''} onChange={(e) => setEdit({ ...edit, job_title: e.target.value })} /></div>}
            <div><label className="label">Bio corta</label><textarea className="input" value={edit.bio ?? ''} onChange={(e) => setEdit({ ...edit, bio: e.target.value })} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-brand" checked={edit.is_active ?? true} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} /> Visible en la web</label>

            <div className="rounded-2xl bg-ink/[.03] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-ink/60">🔑 Acceso y datos privados</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div><label className="label">Código Ulima (usuario)</label><input className="input font-mono" inputMode="numeric" maxLength={8} placeholder="20204390" value={edit.university_code ?? ''} onChange={(e) => setEdit({ ...edit, university_code: e.target.value.replace(/\D/g, '') })} /></div>
                <div><label className="label">DNI</label><input className="input" inputMode="numeric" maxLength={8} value={edit.dni ?? ''} onChange={(e) => setEdit({ ...edit, dni: e.target.value.replace(/\D/g, '') })} /></div>
                <div><label className="label">Correo</label><input className="input" type="email" value={edit.email ?? ''} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></div>
                <div><label className="label">Celular</label><input className="input" value={edit.phone ?? ''} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></div>
              </div>
              <label className="label mt-3">{edit.user_id ? 'Restablecer contraseña (solo si la olvidó)' : 'Crear su contraseña ahora (opcional — o que use su código CIPRO)'}</label>
              <div className="flex gap-2"><input className="input font-mono" value={edit.password ?? ''} onChange={(e) => setEdit({ ...edit, password: e.target.value })} placeholder="mín. 6" /><button type="button" className="btn-ghost py-1.5" onClick={() => setEdit({ ...edit, password: genPassword() })}>Generar</button></div>
            </div>

            {!edit.id && <div><p className="label">Ciclo y área</p>{MsForm}</div>}
            {edit.id && (
              <div>
                <p className="label">Historial por ciclos</p>
                <ul className="mb-3 space-y-1">
                  {ms.filter((r) => r.member_id === edit.id).sort((a, b) => (pCode(b.period_id) || '').localeCompare(pCode(a.period_id) || '')).map((r) => (
                    <li key={r.id} className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-1.5 text-sm">
                      <span><b>{pCode(r.period_id)}</b> · {aName(r.area_id)} · {r.position_title || ROLE_LABEL[r.role]}</span>
                      <button className="text-xs text-red-600" onClick={() => delMs(r.id)}>quitar</button>
                    </li>
                  ))}
                </ul>
                {MsForm}
                <button className="btn-ghost mt-2 w-full py-1.5" onClick={addMs}>+ Agregar a ciclo</button>
              </div>
            )}
            <div className="sticky bottom-0 -mx-5 -mb-5 flex gap-2 rounded-b-3xl bg-white p-5 pt-3 shadow-[0_-8px_16px_-12px_rgba(0,0,0,.2)]"><button className="btn-primary flex-1" onClick={save}>Guardar</button><button className="btn-ghost" onClick={() => setEdit(null)}>Cerrar</button></div>
            {edit.id && <button className="w-full text-xs text-red-600" onClick={delMember}>Eliminar integrante</button>}
          </div>
        )}
      </div>
    </div>
  );
}
