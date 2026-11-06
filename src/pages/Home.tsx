import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAsync } from '../lib/useQuery';
import { useSettings } from '../lib/settings';
import type { Alliance, Area, GalleryItem, Membership, News, Period, Project } from '../lib/types';
import Scrummy from '../components/Scrummy';
import Icon from '../components/Icon';
import MemberCard from '../components/MemberCard';

const PILARES = [
  ['Formar', 'Competencias técnicas, power skills, liderazgo y criterio profesional.'],
  ['Aplicar', 'Proyectos reales, retos, consultorías estudiantiles y experiencias demostrables.'],
  ['Conectar', 'Relaciones con empresas, organizaciones, especialistas, egresados y comunidades.'],
  ['Impactar', 'Resultados medibles, creación de valor y contribución social o profesional.'],
  ['Sostener', 'Procesos, datos, documentación, sucesión y gobierno para crecer en el tiempo.'],
];
const VALORES = ['Pasión', 'Colaboración', 'Empatía', 'Innovación', 'Apertura a la experiencia'];
const STATUS: Record<string, string> = { planificado: 'Planificado', en_curso: 'En curso', cerrado: 'Cerrado' };

export default function Home() {
  const { settings } = useSettings();
  const areas = useAsync<Area[]>(() => supabase.from('areas').select('*').order('sort_order'));
  const period = useAsync<Period>(() => supabase.from('periods').select('*').eq('is_current', true).maybeSingle());
  const leaders = useAsync<Membership[]>(
    () => supabase.from('memberships').select('*, members(*), periods!inner(is_current)').eq('periods.is_current', true).in('role', ['presidencia', 'vicepresidencia']).order('sort_order'),
  );
  const projects = useAsync<Project[]>(() => supabase.from('projects').select('*').order('is_featured', { ascending: false }).order('sort_order').limit(6));
  const alliances = useAsync<Alliance[]>(() => supabase.from('alliances').select('*').order('sort_order'));
  const news = useAsync<News[]>(() => supabase.from('news').select('*').eq('is_published', true).order('published_at', { ascending: false }).limit(3));
  const gallery = useAsync<GalleryItem[]>(() => supabase.from('gallery').select('*').order('event_date', { ascending: false }).limit(8));

  const stats = [
    [settings.founded_years ? `+${settings.founded_years}` : '', 'años formando gestores'],
    [settings.stat_projects ? `+${settings.stat_projects}` : '', 'proyectos ejecutados'],
    [settings.stat_members ? `+${settings.stat_members}` : '', 'ciprianos'],
    [settings.stat_alliances ? `+${settings.stat_alliances}` : '', 'alianzas'],
  ].filter(([v]) => v);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="dot-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
        <div className="container-x relative grid items-center gap-8 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="eyebrow"><Icon name="star" className="h-3.5 w-3.5" /> Círculo de Gestión de Proyectos</span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Imagina y <span className="relative whitespace-nowrap text-brand">hazlo realidad<svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" preserveAspectRatio="none"><path d="M2 9 Q100 -2 198 8" stroke="#F26B1D" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".35" /></svg></span>.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-ink/65">{settings.purpose || 'Convertimos el potencial de las personas y las ideas en proyectos que generan valor, aprendizaje e impacto sostenible.'}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#unete" className="btn-primary">Únete a CIPRO <Icon name="arrow" className="h-4 w-4" /></a>
              <Link to="/integrantes" className="btn-ghost">Conoce al equipo</Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-6 rounded-[3rem] bg-gradient-to-br from-brand to-brand-700 rotate-6" />
            <div className="relative rounded-[3rem] bg-white p-6 shadow-2xl shadow-brand/30">
              {settings.hero_image_url
                ? <img src={settings.hero_image_url} alt="Comunidad CIPRO" className="aspect-[4/5] w-full rounded-[2.2rem] object-cover" />
                : <div className="grid aspect-[4/5] place-items-center rounded-[2.2rem] bg-brand-50"><Scrummy className="h-4/5 w-4/5 animate-float" wave /></div>}
            </div>
            <div className="absolute -bottom-4 left-2 rounded-2xl sm:-left-4 bg-ink px-4 py-3 text-white shadow-xl">
              <p className="text-xs text-white/60">¡Hola! Soy</p>
              <p className="font-display font-extrabold text-brand-400">Scrummy 🦫</p>
            </div>
          </div>
        </div>
        {stats.length > 0 && (
          <div className="container-x relative pb-12">
            <div className={`grid ${stats.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-4 rounded-3xl bg-ink p-6 text-white ${['','sm:grid-cols-1','sm:grid-cols-2','sm:grid-cols-3','sm:grid-cols-4'][stats.length]}`}>
              {stats.map(([v, l]) => (
                <div key={l} className="text-center"><p className="font-display text-3xl font-extrabold text-brand-400">{v}</p><p className="text-xs text-white/60">{l}</p></div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* NOSOTROS */}
      <section id="nosotros" className="scroll-mt-20 py-20">
        <div className="container-x">
          <div className="max-w-2xl">
            <span className="eyebrow">Quiénes somos</span>
            <h2 className="section-title">Una comunidad que aprende haciendo</h2>
            <p className="mt-4 text-ink/65">CIPRO es una comunidad de aprendizaje y práctica en gestión de proyectos que desarrolla talento mediante formación, proyectos reales, investigación aplicada, liderazgo progresivo y alianzas con organizaciones. Integramos enfoques predictivos, ágiles e híbridos según la naturaleza de cada proyecto.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="card bg-gradient-to-br from-brand to-brand-700 text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-white/70">Misión</p>
              <p className="mt-3 text-lg font-medium">{settings.mission}</p>
            </div>
            <div className="card bg-ink text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-400">Visión</p>
              <p className="mt-3 text-lg font-medium">{settings.vision}</p>
            </div>
          </div>
          <h3 className="mt-16 text-xl font-bold">Nuestros pilares</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PILARES.map(([t, d], i) => (
              <div key={t} className="card">
                <span className="font-display text-4xl font-extrabold text-brand-200">0{i + 1}</span>
                <h4 className="mt-2 text-lg font-bold">{t}</h4>
                <p className="mt-1 text-sm text-ink/60">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-2">
            <span className="mr-2 text-sm font-semibold text-ink/60">Nuestros valores:</span>
            {VALORES.map((v) => <span key={v} className="rounded-full bg-peach px-4 py-1.5 text-sm font-semibold text-brand-800">{v}</span>)}
          </div>
        </div>
      </section>

      {/* AREAS */}
      <section id="areas" className="scroll-mt-20 bg-brand-50/60 py-20">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <span className="eyebrow">Estructura</span>
              <h2 className="section-title">Nuestras áreas</h2>
              <p className="mt-3 text-ink/65">Una línea de gobierno combinada con un sistema transversal de proyectos.</p>
            </div>
            <Scrummy className="hidden h-28 w-28 sm:block" />
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {areas.data?.map((a) => (
              <Link to={`/integrantes?area=${a.slug}`} key={a.id} className="card group">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-white transition group-hover:rotate-6"><Icon name={a.icon || 'star'} className="h-6 w-6" /></span>
                  <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-bold text-ink/60">{a.short_name}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold">{a.name}</h3>
                <p className="mt-2 text-sm text-ink/60">{a.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">Ver integrantes <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DIRECTIVA */}
      <section className="py-20">
        <div className="container-x">
          <div className="text-center">
            <span className="eyebrow">Directiva {period.data?.code}</span>
            <h2 className="section-title">Quienes lideran CIPRO</h2>
          </div>
          <div className="mx-auto mt-10 grid max-w-2xl gap-6 sm:grid-cols-2">
            {leaders.data?.map((m) => m.members && <MemberCard key={m.id} member={m.members} title={m.position_title} big />)}
          </div>
          {settings.advisor_name && (
            <p className="mt-8 text-center text-sm text-ink/60">Docente encargado: <span className="font-semibold text-ink">{settings.advisor_name}</span></p>
          )}
          <div className="mt-8 text-center"><Link to="/integrantes" className="btn-dark">Ver todos los integrantes {period.data?.code} <Icon name="arrow" className="h-4 w-4" /></Link></div>
        </div>
      </section>

      {/* PROYECTOS */}
      <section id="proyectos" className="scroll-mt-20 bg-ink py-20 text-white">
        <div className="container-x">
          <span className="eyebrow bg-white/10 text-brand-300">Portafolio</span>
          <h2 className="section-title">Proyectos que hacemos realidad</h2>
          <p className="mt-3 max-w-xl text-white/60">Cada proyecto se registra en nuestro portafolio con responsables, entregables, evidencias y lecciones aprendidas.</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.data?.map((p) => (
              <article key={p.id} className="group overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10">
                <div className="aspect-video overflow-hidden bg-gradient-to-br from-brand-500 to-brand-800">
                  {p.cover_url ? <img src={p.cover_url} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="grid h-full place-items-center font-display text-3xl font-extrabold text-white/30">{p.name}</div>}
                </div>
                <div className="p-5">
                  <div className="flex gap-2 text-[11px] font-bold uppercase tracking-wide">
                    {p.category && <span className="rounded-full bg-brand px-2 py-0.5">{p.category}</span>}
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-white/70">{STATUS[p.status]}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold">{p.name}</h3>
                  <p className="mt-1 text-sm text-white/60">{p.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ALIANZAS */}
      <section id="alianzas" className="scroll-mt-20 py-20">
        <div className="container-x text-center">
          <span className="eyebrow">Ecosistema</span>
          <h2 className="section-title">Alianzas que nos impulsan</h2>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {alliances.data?.map((a) => {
              const inner = (
                <>
                  <div className="grid h-16 place-items-center">
                    {a.logo_url ? <img src={a.logo_url} alt={a.name} className="max-h-14 max-w-full object-contain grayscale transition group-hover:grayscale-0" /> : <span className="font-display text-lg font-extrabold text-ink/70 group-hover:text-brand">{a.name}</span>}
                  </div>
                  <p className="mt-2 text-xs text-ink/50">{a.kind}{a.since ? ` · ${a.since}` : ''}</p>
                </>
              );
              return a.website_url
                ? <a key={a.id} href={a.website_url} target="_blank" rel="noreferrer" className="card group p-5" title={a.description ?? ''}>{inner}</a>
                : <div key={a.id} className="card group p-5" title={a.description ?? ''}>{inner}</div>;
            })}
          </div>
        </div>
      </section>

      {/* NOTICIAS */}
      <section className="bg-brand-50/60 py-20">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><span className="eyebrow">Novedades</span><h2 className="section-title">Últimas noticias</h2></div>
            <Link to="/noticias" className="btn-ghost">Ver todas</Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {news.data?.map((n) => <NewsCard key={n.id} n={n} />)}
          </div>
        </div>
      </section>

      {/* GALERIA */}
      {gallery.data && gallery.data.length > 0 && (
        <section className="py-20">
          <div className="container-x">
            <span className="eyebrow">Galería</span>
            <h2 className="section-title">Momentos ciprianos</h2>
            <div className="mt-10 columns-2 gap-4 md:columns-4">
              {gallery.data.map((g) => (
                <figure key={g.id} className="mb-4 break-inside-avoid overflow-hidden rounded-2xl">
                  <img src={g.image_url} alt={g.title ?? ''} loading="lazy" className="w-full transition duration-500 hover:scale-105" />
                  {g.title && <figcaption className="bg-ink px-3 py-2 text-xs text-white/80">{g.title}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* UNETE */}
      <section id="unete" className="scroll-mt-20 py-20">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand to-brand-700 p-10 text-white md:p-14">
            <div className="dot-grid absolute inset-0 opacity-20" />
            <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <h2 className="text-3xl font-extrabold sm:text-4xl">¿Listo para liderar proyectos reales?</h2>
                <p className="mt-3 max-w-xl text-white/85">Forma parte de la Carrera Cipriana: empieza como Entry Member y crece hasta Project Leader, Mentor o Directiva.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {settings.join_form_url
                    ? <a href={settings.join_form_url} target="_blank" rel="noreferrer" className="btn bg-white text-brand-700 hover:bg-peach">Postula aquí</a>
                    : settings.contact_email && <a href={`mailto:${settings.contact_email}`} className="btn bg-white text-brand-700 hover:bg-peach">Escríbenos</a>}
                  <Link to="/acceso" className="btn border border-white/40 hover:bg-white/10">Ya soy cipriano</Link>
                </div>
              </div>
              <Scrummy className="mx-auto h-48 w-48" wave />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function NewsCard({ n }: { n: News }) {
  return (
    <Link to={`/noticias/${n.slug}`} className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-ink/5 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="aspect-[16/10] overflow-hidden bg-gradient-to-br from-peach to-brand-300">
        {n.cover_url && <img src={n.cover_url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{n.category} · {n.published_at && new Date(n.published_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        <h3 className="mt-2 font-bold leading-snug group-hover:text-brand-700">{n.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink/60">{n.excerpt}</p>
      </div>
    </Link>
  );
}
