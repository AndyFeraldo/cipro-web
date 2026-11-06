import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAsync } from '../lib/useQuery';
import { ROLE_LABEL, monthYear, type Member, type Role } from '../lib/types';
import Icon from '../components/Icon';

type Hist = { id: string; role: Role; position_title: string | null; periods: { code: string } | null; areas: { name: string } | null };

export default function PublicProfile() {
  const { id } = useParams();
  const m = useAsync<Member>(() => supabase.from('members').select('*').eq('id', id!).maybeSingle(), [id]);
  const h = useAsync<Hist[]>(() => supabase.from('memberships').select('id,role,position_title,periods(code),areas(name)').eq('member_id', id!) as never, [id]);
  if (m.loading) return <div className="container-x py-20">Cargando…</div>;
  if (!m.data) return <div className="container-x py-20">Perfil no encontrado. <Link to="/integrantes" className="text-brand-600">Ver integrantes</Link></div>;
  const d = m.data;
  const hist = (h.data || []).slice().sort((a, b) => (b.periods?.code || '').localeCompare(a.periods?.code || ''));
  const initials = d.full_name.split(' ').slice(0, 2).map((w) => w[0]).join('');
  return (
    <div className="pb-20">
      <div className="relative h-48 overflow-hidden bg-gradient-to-r from-brand to-brand-700"><div className="dot-grid absolute inset-0 opacity-20" /></div>
      <div className="container-x relative -mt-16">
        <div className="flex flex-wrap items-end gap-6">
          <div className="h-44 w-44 overflow-hidden rounded-full bg-white ring-4 ring-white shadow-xl">
            {d.photo_url ? <img src={d.photo_url} alt={d.full_name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center bg-gradient-to-br from-brand-300 to-brand-600 text-5xl font-extrabold text-white">{initials}</div>}
          </div>
          <div className="pb-3">
            <h1 className="text-4xl font-extrabold tracking-tight">{d.full_name}</h1>
            <p className="mt-1 text-ink/60">{[d.career, d.joined_on && `Cipriano desde ${monthYear(d.joined_on)}`].filter(Boolean).join(' · ')}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {d.is_working && d.company && <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">💼 {d.job_title ? `${d.job_title} en ` : ''}{d.company}</span>}
              {d.linkedin_url && <a href={d.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-[#0A66C2] px-3 py-1 text-xs font-semibold text-white"><Icon name="linkedin" className="h-3.5 w-3.5" /> LinkedIn</a>}
            </div>
          </div>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {d.bio && <section className="card hover:translate-y-0"><h2 className="font-extrabold">Sobre mí</h2><p className="mt-2 whitespace-pre-line text-ink/75">{d.bio}</p></section>}
            {!!d.photos?.length && (
              <section><h2 className="mb-3 font-extrabold">Momentos en CIPRO</h2>
                <div className="columns-2 gap-3 sm:columns-3">{d.photos.map((p) => <img key={p} src={p} alt="" loading="lazy" className="mb-3 w-full rounded-2xl" />)}</div>
              </section>
            )}
          </div>
          <aside className="card self-start hover:translate-y-0">
            <h2 className="font-extrabold">Carrera Cipriana</h2>
            <ol className="mt-4 space-y-3 border-l-2 border-brand-200 pl-5">
              {hist.map((x) => (
                <li key={x.id} className="relative"><span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-brand" />
                  <p className="text-xs font-bold text-brand-600">Ciclo {x.periods?.code}</p><p className="font-semibold">{x.position_title || ROLE_LABEL[x.role]}</p><p className="text-sm text-ink/60">{x.areas?.name}</p></li>
              ))}
            </ol>
          </aside>
        </div>
      </div>
    </div>
  );
}
