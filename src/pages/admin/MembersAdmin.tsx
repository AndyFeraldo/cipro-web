import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ROLE_LABEL, ROLE_ORDER, type Area, type Member, type Membership, type Period, type Role } from '../../lib/types';
import ImageInput from './ImageInput';

type Edit = Partial<Member> & { dni?: string; email?: string; code?: string; hasCode?: boolean };
type MRow = Membership & { members: Member };

function genCode() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }

export default function MembersAdmin() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [ms, setMs] = useState<MRow[]>([]);
  const [periodId, setPeriodId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState<Edit | null>(null);
  const [msg, setMsg] = useState('');
  const [newMs, setNewMs] = useState<{ period_id: string; area_id: string; role: Role; position_title: string }>({ period_id: '', area_id: '', role: 'miembro', position_title: '' });

  const load = async () => {
    const [p, a, m, x] = await Promise.all([
      supabase.from('periods').select('*').order('code', { ascending: false }),
      supabase.from('areas').select('*').order('sort_order'),
      supabase.from('members').select('*').order('full_name'),
      supabase.from('memberships').select('*, members(*)'),
    ]);
    setPeriods(p.data || []); setAreas(a.data || []); setMembers(m.data || []); setMs((x.data as MRow[]) || []);
    if (!periodId) setPeriodId(p.data?.find((r) => r.is_current)?.id || '');
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const list = useMemo(() => {
    let ids: Set<string> | null = null;
    if (periodId || areaId) ids = new Set(ms.filter((r) => (!periodId || r.period_id === periodId) && (!areaId || r.area_id === areaId)).map((r) => r.member_id));
    return members.filter((m) => (!ids || ids.has(m.id)) && m.full_name.toLowerCase().includes(q.toLowerCase()));
  }, [members, ms, periodId, areaId, q]);

  async function open(m?: Member) {
    setMsg('');
    if (!m) { setEdit({ full_name: '', is_active: true, code: genCode() }); setNewMs({ period_id: periodId, area_id: areaId, role: 'miembro', position_title: '' }); return; }
    const { data } = await supabase.from('member_private').select('dni,email,access_code_hash').eq('member_id', m.id).maybeSingle();
    setEdit({ ...m, dni: data?.dni ?? '', email: data?.email ?? '', hasCode: !!data?.access_code_hash, code: '' });
    setNewMs({ period_id: periodId, area_id: areaId, role: 'miembro', position_title: '' });
  }

  async function save() {
    if (!edit?.full_name) { setMsg('El nombre es obligatorio.'); return; }
    if (edit.dni && !/^\d{8}$/.test(edit.dni)) { setMsg('El DNI debe tener 8 dígitos.'); return; }
    const payload = { full_name: edit.full_name, career: edit.career || null, photo_url: edit.photo_url || null, linkedin_url: edit.linkedin_url || null, bio: edit.bio || null, is_active: edit.is_active ?? true, updated_at: new Date().toISOString() };
    let id = edit.id;
    if (id) { const { error } = await supabase.from('members').update(payload).eq('id', id); if (error) return setMsg(error.message); }
    else {
      const { data, error } = await supabase.from('members').insert(payload).select('id').single();
      if (error) return setMsg(error.message);
      id = data.id;
      if (newMs.period_id) await supabase.from('memberships').insert({ member_id: id, period_id: newMs.period_id, area_id: newMs.area_id || null, role: newMs.role, position_title: newMs.position_title || null });
    }
    if (edit.dni) {
      const { error } = await supabase.rpc('admin_set_member_access', { p_member_id: id, p_dni: edit.dni, p_code: edit.code || '', p_email: edit.email || null });
      if (error) return setMsg(error.message.includes('duplicate') ? 'Ese DNI ya está registrado.' : error.message);
    }
    setMsg(edit.code && edit.dni ? `Guardado ✔ — Código de acceso para ${edit.full_name}: ${edit.code} (anótalo, no se volverá a mostrar)` : 'Guardado ✔');
    await load();
    const fresh = (await supabase.from('members').select('*').eq('id', id!).single()).data;
    if (fresh) setEdit((e) => ({ ...e!, ...fresh, id: fresh.id, code: '', hasCode: e?.hasCode || !!e?.code }));
  }

  async function addMs() {
    if (!edit?.id || !newMs.period_id) return;
    const { error } = await supabase.from('memberships').insert({ member_id: edit.id, period_id: newMs.period_id, area_id: newMs.area_id || null, role: newMs.role, position_title: newMs.position_title || null });
    setMsg(error ? error.message : 'Ciclo agregado ✔'); load();
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
      <select className="input" value={newMs.period_id} onChange={(e) => setNewMs({ ...newMs, period_id: e.target.value })}><option value="">Ciclo…</option>{periods.map((p) => <option key={p.id} value={p.id}>{p.code}</option>)}</select>
      <select className="input" value={newMs.area_id} onChange={(e) => setNewMs({ ...newMs, area_id: e.target.value })}><option value="">Área…</option>{areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
      <select className="input" value={newMs.role} onChange={(e) => setNewMs({ ...newMs, role: e.target.value as Role })}>{ROLE_ORDER.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select>
      <input className="input" placeholder="Cargo visible (ej. Coordinadora PMO)" value={newMs.position_title} onChange={(e) => setNewMs({ ...newMs, position_title: e.target.value })} />
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_440px]">
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-extrabold">Integrantes <span className="text-sm font-normal text-ink/50">({list.length})</span></h2>
          <button className="btn-primary py-1.5" onClick={() => open()}>+ Nuevo integrante</button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <select className="input" value={periodId} onChange={(e) => setPeriodId(e.target.value)}><option value="">Todos los ciclos</option>{periods.map((p) => <option key={p.id} value={p.id}>{p.code}</option>)}</select>
          <select className="input" value={areaId} onChange={(e) => setAreaId(e.target.value)}><option value="">Todas las áreas</option>{areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
          <input className="input" placeholder="Buscar por nombre…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <ul className="mt-4 divide-y divide-ink/5">
          {list.map((m) => {
            const mine = ms.filter((r) => r.member_id === m.id && (!periodId || r.period_id === periodId));
            return (
              <li key={m.id} className="flex cursor-pointer items-center gap-3 py-2.5 hover:bg-brand-50/50" onClick={() => open(m)}>
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-brand-100">{m.photo_url && <img src={m.photo_url} alt="" className="h-full w-full object-cover" />}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{m.full_name}{!m.is_active && <span className="ml-2 text-xs text-ink/40">(inactivo)</span>}</p>
                  <p className="truncate text-xs text-ink/50">{mine.map((r) => `${pCode(r.period_id)} · ${aName(r.area_id)} · ${r.position_title || ROLE_LABEL[r.role]}`).join('  |  ') || 'Sin ciclo asignado'}</p>
                </div>
                {m.linkedin_url && <span className="text-xs font-bold text-[#0A66C2]">in</span>}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="lg:sticky lg:top-32 lg:self-start">
        {msg && <p className="mb-3 rounded-xl bg-white p-3 text-sm shadow-sm">{msg}</p>}
        {edit && (
          <div className="space-y-4 rounded-3xl bg-white p-5 shadow-sm">
            <h3 className="font-bold">{edit.id ? 'Editar integrante' : 'Nuevo integrante'}</h3>
            <div><label className="label">Foto</label><ImageInput value={edit.photo_url ?? ''} folder="members" onChange={(v) => setEdit({ ...edit, photo_url: v })} /></div>
            <div><label className="label">Nombre completo *</label><input className="input" value={edit.full_name ?? ''} onChange={(e) => setEdit({ ...edit, full_name: e.target.value })} /></div>
            <div><label className="label">Carrera</label><input className="input" value={edit.career ?? ''} onChange={(e) => setEdit({ ...edit, career: e.target.value })} placeholder="Ingeniería de Sistemas" /></div>
            <div><label className="label">LinkedIn (URL)</label><input className="input" value={edit.linkedin_url ?? ''} onChange={(e) => setEdit({ ...edit, linkedin_url: e.target.value })} placeholder="https://www.linkedin.com/in/…" /></div>
            <div><label className="label">Bio corta</label><textarea className="input" value={edit.bio ?? ''} onChange={(e) => setEdit({ ...edit, bio: e.target.value })} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-brand" checked={edit.is_active ?? true} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} /> Visible en la web</label>

            <div className="rounded-2xl bg-ink/[.03] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-ink/60">🔒 Datos privados (no se muestran en la web)</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div><label className="label">DNI</label><input className="input" inputMode="numeric" maxLength={8} value={edit.dni ?? ''} onChange={(e) => setEdit({ ...edit, dni: e.target.value.replace(/\D/g, '') })} /></div>
                <div><label className="label">Correo</label><input className="input" type="email" value={edit.email ?? ''} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></div>
              </div>
              <label className="label mt-3">Código de acceso {edit.hasCode && <span className="normal-case text-green-700">(ya tiene uno; escribe otro solo para cambiarlo)</span>}</label>
              <div className="flex gap-2"><input className="input font-mono" value={edit.code ?? ''} onChange={(e) => setEdit({ ...edit, code: e.target.value })} /><button type="button" className="btn-ghost py-1.5" onClick={() => setEdit({ ...edit, code: genCode() })}>Generar</button></div>
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
            <div className="flex gap-2 pt-2"><button className="btn-primary flex-1" onClick={save}>Guardar</button><button className="btn-ghost" onClick={() => setEdit(null)}>Cerrar</button></div>
            {edit.id && <button className="w-full text-xs text-red-600" onClick={delMember}>Eliminar integrante</button>}
          </div>
        )}
      </div>
    </div>
  );
}
