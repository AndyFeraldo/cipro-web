// Crea/gestiona cuentas de ciprianos (login con DNI + contraseña).
// - register: auto-registro público -> queda "pendiente" hasta que el admin lo apruebe.
// - activate: un integrante ya cargado por la directiva activa su cuenta con su código de activación.
// - admin_set_access: el admin crea o cambia la contraseña de acceso de un integrante.
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const DOMAIN = 'ciprianos.cipro.invalid';
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const clean = (v: unknown, max = 300) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ ok: false, error: 'Método no permitido' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ ok: false, error: 'Solicitud inválida' }, 400); }

  const dni = String(body.dni ?? '').replace(/\D/g, '');
  const password = String(body.password ?? '');
  if (!/^\d{8}$/.test(dni)) return json({ ok: false, error: 'El DNI debe tener 8 dígitos.' });
  if (password.length < 6) return json({ ok: false, error: 'La contraseña debe tener al menos 6 caracteres.' });
  const email = `${dni}@${DOMAIN}`;

  if (body.action === 'register') {
    const full_name = clean(body.full_name, 120);
    if (!full_name) return json({ ok: false, error: 'El nombre completo es obligatorio.' });
    if (!/^\S+@\S+\.\S+$/.test(String(body.email ?? ''))) return json({ ok: false, error: 'Ingresa un correo válido.' });
    if (!/linkedin\.com\//i.test(String(body.linkedin_url ?? ''))) return json({ ok: false, error: 'Ingresa el enlace de tu perfil de LinkedIn.' });
    const { data: exists } = await admin.from('member_private').select('member_id').eq('dni', dni).maybeSingle();
    if (exists) return json({ ok: false, error: 'Este DNI ya está registrado. Si no recuerdas tu contraseña, pídela a la directiva.' });

    const { data: created, error: uErr } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { dni, kind: 'cipriano' } });
    if (uErr || !created.user) return json({ ok: false, error: uErr?.message?.includes('already') ? 'Este DNI ya tiene una cuenta.' : 'No se pudo crear la cuenta.' });
    const uid = created.user.id;

    const joined = clean(body.joined_on, 7); // "YYYY-MM"
    const { data: m, error: mErr } = await admin.from('members').insert({
      user_id: uid, full_name, status: 'pendiente',
      university_code: clean(body.university_code, 20), career: clean(body.career, 120),
      linkedin_url: clean(body.linkedin_url, 300), bio: clean(body.bio, 1000),
      is_working: !!body.is_working, company: body.is_working ? clean(body.company, 120) : null, job_title: body.is_working ? clean(body.job_title, 120) : null,
      joined_on: joined && /^\d{4}-\d{2}$/.test(joined) ? `${joined}-01` : null,
    }).select('id').single();
    if (mErr || !m) { await admin.auth.admin.deleteUser(uid); return json({ ok: false, error: 'No se pudo guardar el perfil.' }); }

    await admin.from('member_private').insert({ member_id: m.id, dni, email: clean(body.email, 160), phone: clean(body.phone, 30) });
    const areaId = clean(body.area_id, 40);
    const { data: period } = await admin.from('periods').select('id').eq('is_current', true).maybeSingle();
    if (period) await admin.from('memberships').insert({ member_id: m.id, period_id: period.id, area_id: areaId, role: 'miembro' });
    return json({ ok: true, email });
  }

  if (body.action === 'activate') {
    // Integrantes que la directiva ya cargó en la web: activan su cuenta con el código que les dio el admin.
    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'desconocida';
    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await admin.from('activation_attempts').select('id', { count: 'exact', head: true }).eq('ip', ip).eq('ok', false).gte('at', since);
    if ((count ?? 0) >= 10) return json({ ok: false, error: 'Demasiados intentos. Vuelve a intentarlo en una hora.' });

    const code = String(body.code ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code));
    const sha = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
    const { data: inv } = await admin.from('member_invites').select('member_id, expires_at').eq('code_sha', sha).maybeSingle();
    if (!inv || new Date(inv.expires_at) < new Date()) {
      await admin.from('activation_attempts').insert({ ip, ok: false });
      return json({ ok: false, error: 'Código inválido o vencido. Pide uno nuevo a la directiva.' });
    }
    const email_contact = clean(body.email, 160);
    if (!email_contact || !/^\S+@\S+\.\S+$/.test(email_contact)) return json({ ok: false, error: 'Ingresa un correo válido.' });
    const { data: member } = await admin.from('members').select('id,user_id').eq('id', inv.member_id).maybeSingle();
    if (!member || member.user_id) return json({ ok: false, error: 'Esta cuenta ya fue activada.' });
    const { data: other } = await admin.from('member_private').select('member_id').eq('dni', dni).neq('member_id', member.id).maybeSingle();
    if (other) return json({ ok: false, error: 'Ese DNI ya está registrado en otra cuenta.' });

    const { data: c, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { dni, kind: 'cipriano' } });
    if (error || !c.user) return json({ ok: false, error: error?.message?.includes('already') ? 'Este DNI ya tiene una cuenta. Ingresa con tu contraseña.' : 'No se pudo activar la cuenta.' });
    await admin.from('members').update({ user_id: c.user.id }).eq('id', member.id);
    await admin.from('member_private').upsert({ member_id: member.id, dni, email: email_contact }, { onConflict: 'member_id' });
    await admin.from('member_invites').delete().eq('member_id', member.id);
    await admin.from('activation_attempts').insert({ ip, ok: true });
    return json({ ok: true });
  }

  if (body.action === 'admin_set_access') {
    const auth = req.headers.get('Authorization') ?? '';
    const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });
    const { data: isAdmin } = await asUser.rpc('is_admin');
    if (!isAdmin) return json({ ok: false, error: 'No autorizado' }, 403);

    const memberId = clean(body.member_id, 40);
    const { data: member } = await admin.from('members').select('id,user_id').eq('id', memberId).maybeSingle();
    if (!member) return json({ ok: false, error: 'Integrante no encontrado.' });
    const { data: other } = await admin.from('member_private').select('member_id').eq('dni', dni).neq('member_id', member.id).maybeSingle();
    if (other) return json({ ok: false, error: 'Ese DNI ya pertenece a otro integrante.' });

    let uid = member.user_id as string | null;
    if (uid) {
      const { error } = await admin.auth.admin.updateUserById(uid, { email, password, email_confirm: true });
      if (error) return json({ ok: false, error: error.message });
    } else {
      const { data: c, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { dni, kind: 'cipriano' } });
      if (error || !c.user) return json({ ok: false, error: error?.message ?? 'No se pudo crear la cuenta.' });
      uid = c.user.id;
      await admin.from('members').update({ user_id: uid }).eq('id', member.id);
    }
    const priv: Record<string, unknown> = { member_id: member.id, dni };
    if (clean(body.email, 160)) priv.email = clean(body.email, 160);
    if (clean(body.phone, 30)) priv.phone = clean(body.phone, 30);
    await admin.from('member_private').upsert(priv, { onConflict: 'member_id' });
    await admin.from('member_invites').delete().eq('member_id', member.id);
    return json({ ok: true });
  }

  return json({ ok: false, error: 'Acción desconocida' }, 400);
});
