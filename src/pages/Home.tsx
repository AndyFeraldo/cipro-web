import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAsync } from '../lib/useQuery';
import { useSettings } from '../lib/settings';
import type { Alliance, Area, GalleryItem, Membership, News, Period, Project } from '../lib/types';
import Scrummy from '../components/Scrummy';
import Icon from '../components/Icon';
import MemberCard from '../components/MemberCard';
import { Constellation, Donut, Marquee, Sparkle } from '../components/Brand';
import { Blobs, CountUp, Reveal, Starfield, Tilt, useParallax } from '../components/Motion';

const PILARES = [
  ['Formar', 'Competencias técnicas, power skills, liderazgo y criterio profesional.'],
  ['Aplicar', 'Proyectos reales, retos, consultorías estudiantiles y experiencias demostrables.'],
  ['Conectar', 'Relaciones con empresas, organizaciones, especialistas, egresados y comunidades.'],
  ['Impactar', 'Resultados medibles, creación de valor y contribución social o profesional.'],
  ['Sostener', 'Procesos, datos, documentación, sucesión y gobierno para crecer en el tiempo.'],
];
const SEG = ['#FECAA3', '#F4A487', '#FD8A55', '#FE6F06', '#FF5117'];
const VALORES = ['Pasión', 'Colaboración', 'Empatía', 'Innovación', 'Apertura a la experiencia'];
const STATUS: Record<string, string> = { planificado: 'Planificado', en_curso: 'En curso', cerrado: 'Cerrado' };
const SOCIAL = ['taller-linkedin', 'invitado-especial', 'feed-1', 'feed-2', 'feed-3'];

export default function Home() {
  const { settings } = useSettings();
  const [pillar, setPillar] = useState<number | null>(0);
  const px = useParallax();
  const areas = useAsync<Area[]>(() => supabase.from('areas').select('*').eq('is_historical', false).order('sort_order'));
  const period = useAsync<Period>(() => supabase.from('periods').select('*').eq('is_current', true).maybeSingle());
  const team = useAsync<Membership[]>(() => supabase.from('memberships').select('*, members(*), periods!inner(is_current)').eq('periods.is_current', true).order('sort_order'));
  const projects = useAsync<Project[]>(() => supabase.from('projects').select('*').order('is_featured', { ascending: false }).order('sort_order').limit(6));
  const alliances = useAsync<Alliance[]>(() => supabase.from('alliances').select('*').order('sort_order'));
  const news = useAsync<News[]>(() => supabase.from('news').select('*').eq('is_published', true).order('published_at', { ascending: false }).limit(3));
  const gallery = useAsync<GalleryItem[]>(() => supabase.from('gallery').select('*').not('title', 'ilike', '%ponentes%').order('sort_order').limit(40));

  const members = (team.data || []).filter((m) => m.members);
  const leaders = members.filter((m) => m.role === 'presidencia' || m.role === 'vicepresidencia');
  const faces = members.filter((m) => m.members?.photo_url).slice(0, 6);
  // Selección curada para el mosaico del inicio (si existen); si no, las primeras de cada evento
  const FEATURED = ['comunidad-2025-2', 'semind-pucp-2026-1', 'cipro-x-leadutp-1', 'comunidad-2025-1', 'entry-members-2026-2-1', 'semind-pucp-2026-2', 'visita-proyecta-uni-1', 'cipro-x-proyecta-uni-1', 'bim-hackathon-2'];
  const all = gallery.data || [];
  const curated = FEATURED.map((k) => all.find((g) => g.image_url.includes(`/${k}.webp`))).filter(Boolean) as GalleryItem[];
  const galleryPicks = curated.length >= 6 ? curated : all.filter((g, i, arr) => arr.findIndex((x) => x.title === g.title) === i).slice(0, 9);
  const stats = [
    [settings.founded_years ? `+${settings.founded_years}` : '', 'años formando gestores'],
    [settings.stat_projects ? `+${settings.stat_projects}` : '', 'proyectos ejecutados'],
    [settings.stat_members ? `+${settings.stat_members}` : '', 'ciprianos'],
    [settings.stat_alliances ? `+${settings.stat_alliances}` : (alliances.data?.length ? `${alliances.data.length}` : ''), 'alianzas y redes'],
  ].filter(([v]) => v);

  return (
    <>
      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden bg-cream-gradient">
        <div className="aurora absolute inset-0" />
        <Blobs />
        <div className="dot-grid absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div style={px(-25)} className="pointer-events-none absolute -left-10 top-24 hidden w-80 lg:block"><Constellation className="w-full opacity-60" /></div>
        <div className="container-x relative grid items-center gap-10 pb-16 pt-12 md:grid-cols-[1.1fr_1fr] md:pb-24 md:pt-16">
          <div className="animate-fadeup">
            <span className="eyebrow bg-white/80 shadow-sm"><Sparkle className="h-3.5 w-3.5 animate-spinslow" /> Círculo de Gestión de Proyectos</span>
            <h1 className="mt-6 font-display text-[2.9rem] font-black leading-[0.98] tracking-tight sm:text-7xl">
              Imagina<br />y hazlo <span className="text-shine relative inline-block">realidad<Sparkle className="absolute -right-7 -top-4 h-7 w-7 animate-twinkle sm:-right-9 sm:h-9 sm:w-9" /></span>.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-ink/65">{settings.purpose || 'Convertimos el potencial de las personas y las ideas en proyectos que generan valor, aprendizaje e impacto sostenible.'}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/acceso#registro" className="btn-primary px-6 py-3 text-base">Únete a CIPRO <Icon name="arrow" className="h-4 w-4" /></Link>
              <Link to="/integrantes" className="btn-ghost bg-white px-6 py-3 text-base">Conoce al equipo</Link>
            </div>
            {faces.length > 0 && (
              <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex shrink-0 -space-x-3">{faces.map((m, i) => <img key={m.id} src={m.members!.photo_url!} alt="" className={`h-11 w-11 rounded-full object-cover ring-[3px] ring-white ${i > 3 ? 'hidden sm:block' : ''}`} />)}</div>
                <p className="text-sm text-ink/60"><b className="text-ink">{members.length} ciprianos</b> en el ciclo {period.data?.code}</p>
              </div>
            )}
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[460px] animate-fadeup [animation-delay:.2s]">
            <span className="absolute inset-[6%] rounded-full bg-brand/40 animate-pulsering [animation-duration:3.5s]" />
            <div style={px(12)} className="absolute inset-[6%] overflow-hidden rounded-full bg-brand shadow-[0_40px_80px_-20px_rgba(255,81,23,.6)]">
              <Constellation className="absolute inset-0 h-full w-full opacity-90" color="#fff" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-700/40 to-transparent" />
            </div>
            <div style={px(-30)} className="absolute -left-2 top-4"><Donut className="h-24 w-24 animate-spinslow drop-shadow-lg sm:h-28 sm:w-28" /></div>
            <Sparkle className="absolute right-6 top-10 h-10 w-10 animate-twinkle" color="#fff" />
            <Sparkle className="absolute bottom-24 left-2 h-6 w-6 animate-twinkle [animation-delay:1s]" />
            <div style={px(22)} className="absolute inset-x-0 bottom-0 h-[96%]"><Scrummy className="mx-auto h-full animate-float" /></div>
            <div style={px(-14)} className="absolute -right-1 bottom-10 rounded-2xl bg-ink px-4 py-3 text-white shadow-xl sm:-right-4">
              <p className="text-xs text-white/60">¡Hola! Soy</p>
              <p className="font-display text-lg font-extrabold text-brand-400">Scrummy 🦫</p>
            </div>
          </div>
        </div>
      </section>

      <Marquee items={['Imagina', 'Planifica', 'Ejecuta', 'Conecta', 'Hazlo realidad', 'PMO', 'Agilidad', 'Liderazgo']} />

      {stats.length > 0 && (
        <section className="bg-ink pb-10 text-white">
          <div className={`container-x grid gap-6 pt-2 text-center ${stats.length > 2 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2'}`}>
            {stats.map(([v, l]) => <div key={l}><p className="font-display text-4xl font-black text-brand"><CountUp value={v} /></p><p className="text-sm text-white/60">{l}</p></div>)}
          </div>
        </section>
      )}

      {/* ───────── NOSOTROS ───────── */}
      <section id="nosotros" className="scroll-mt-20 py-20 sm:py-28">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="relative">
            <img src="/media/gallery/comunidad-2025-2.webp" alt="Comunidad CIPRO" className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-2xl" />
            <img src="/media/gallery/entry-members-2026-2-1.webp" alt="" className="absolute -bottom-8 -right-3 hidden w-48 rotate-3 rounded-2xl border-[6px] border-white object-cover shadow-xl sm:block" />
            <div className="absolute -left-4 -top-5 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold shadow-lg"><Donut className="h-6 w-6" /> +{settings.founded_years || 10} años</div>
            <Sparkle className="absolute -right-5 -top-6 h-12 w-12 animate-twinkle" />
          </Reveal>
          <Reveal delay={150}>
            <span className="eyebrow">Quiénes somos</span>
            <h2 className="section-title">Una comunidad que <span className="text-brand">aprende haciendo</span></h2>
            <p className="mt-5 text-ink/65">CIPRO es una comunidad de aprendizaje y práctica en gestión de proyectos que desarrolla talento mediante formación, proyectos reales, investigación aplicada, liderazgo progresivo y alianzas con organizaciones. Integramos enfoques predictivos, ágiles e híbridos según la naturaleza de cada proyecto.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-brand p-6 text-white"><p className="text-xs font-bold uppercase tracking-[.2em] text-white/70">Misión</p><p className="mt-2 text-sm leading-relaxed">{settings.mission}</p></div>
              <div className="rounded-3xl bg-ink p-6 text-white"><p className="text-xs font-bold uppercase tracking-[.2em] text-brand">Visión</p><p className="mt-2 text-sm leading-relaxed">{settings.vision}</p></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── PILARES (la "O" de CIPRO) ───────── */}
      <section className="relative overflow-hidden bg-cream py-20 sm:py-28">
        <Blobs />
        <div className="dot-grid absolute inset-0 opacity-50" />
        <div className="container-x relative grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <Reveal className="relative mx-auto w-full max-w-sm">
            <Donut className="w-full drop-shadow-xl" active={pillar} onHover={setPillar} />
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div><p className="font-display text-3xl font-black">{pillar != null ? PILARES[pillar][0] : 'CIPRO'}</p><p className="text-xs font-semibold uppercase tracking-widest text-ink/50">pilar {pillar != null ? pillar + 1 : ''}</p></div>
            </div>
            <Sparkle className="absolute -right-2 -top-2 h-14 w-14 animate-twinkle" />
          </Reveal>
          <Reveal delay={150}>
            <span className="eyebrow bg-white">Nuestros 5 pilares</span>
            <h2 className="section-title">Cada segmento de nuestra <span className="text-brand">“O”</span> es un pilar</h2>
            <ul className="mt-8 space-y-2">
              {PILARES.map(([t, d], i) => (
                <li key={t} onMouseEnter={() => setPillar(i)} onClick={() => setPillar(i)} className={`flex cursor-pointer gap-4 rounded-2xl p-4 transition ${pillar === i ? 'bg-white shadow-lg' : 'hover:bg-white/60'}`}>
                  <span className="mt-1 h-4 w-4 shrink-0 rounded-full" style={{ background: SEG[i] }} />
                  <div><h3 className="font-bold">{t}</h3><p className="text-sm text-ink/60">{d}</p></div>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm font-semibold text-ink/50">Valores:</span>
              {VALORES.map((v) => <span key={v} className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-brand-700 shadow-sm ring-1 ring-brand-100 transition hover:-translate-y-0.5 hover:bg-brand hover:text-white">{v}</span>)}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────── ÁREAS ───────── */}
      <section id="areas" className="scroll-mt-20 py-20 sm:py-28">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <span className="eyebrow">Estructura</span>
              <h2 className="section-title">Nuestras áreas</h2>
              <p className="mt-3 text-ink/65">Una línea de gobierno combinada con un sistema transversal de proyectos.</p>
            </div>
            <Scrummy pose="lado" className="hidden h-36 animate-float sm:block" />
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {areas.data?.map((a, i) => (
              <Reveal key={a.id} delay={i * 80}><Link to={`/integrantes?area=${a.slug}`} className="group relative block h-full overflow-hidden rounded-3xl border border-ink/5 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10">
                <span className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 transition group-hover:scale-150" style={{ background: SEG[i % 5] }} />
                <div className="relative flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl text-white transition group-hover:rotate-6" style={{ background: SEG[(i + 4) % 5] === '#FECAA3' ? '#FF5117' : SEG[(i + 4) % 5] }}><Icon name={a.icon || 'star'} className="h-6 w-6" /></span>
                  <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-white">{a.short_name}</span>
                </div>
                <h3 className="relative mt-4 text-lg font-bold">{a.name}</h3>
                <p className="relative mt-2 text-sm text-ink/60">{a.description}</p>
                <span className="relative mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">Ver integrantes <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </Link></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── DIRECTIVA ───────── */}
      <section className="relative overflow-hidden bg-cream-gradient py-20 sm:py-28">
        <Blobs />
        <Constellation className="pointer-events-none absolute right-0 top-10 w-96 opacity-50" />
        <div className="container-x relative text-center">
          <span className="eyebrow bg-white">Directiva {period.data?.code}</span>
          <h2 className="section-title">Quienes lideran CIPRO</h2>
          <div className="mx-auto mt-10 grid max-w-2xl gap-6 sm:grid-cols-2">
            {leaders.map((m, i) => <Reveal key={m.id} delay={i * 150}><Tilt><MemberCard member={m.members!} title={m.position_title} big /></Tilt></Reveal>)}
          </div>
          {settings.advisor_name && <p className="mt-8 text-sm text-ink/60">Docente encargado: <span className="font-semibold text-ink">{settings.advisor_name}</span></p>}
          <Link to="/integrantes" className="btn-dark mt-6">Ver a los {members.length} integrantes {period.data?.code} <Icon name="arrow" className="h-4 w-4" /></Link>
        </div>
      </section>

      {/* ───────── PROYECTOS (universo CIPRO) ───────── */}
      <section id="proyectos" className="relative scroll-mt-20 overflow-hidden bg-space py-20 text-white sm:py-28">
        <Blobs variant="dark" />
        <Starfield count={70} />
        <div className="dot-grid-light absolute inset-0 opacity-30" />
        <Constellation className="pointer-events-none absolute -right-10 top-8 w-[28rem] opacity-70" />
        {[['left-[8%] top-16', 0], ['right-[20%] top-[40%]', 0.8], ['left-[45%] bottom-12', 1.6]].map(([pos, d], i) => <Sparkle key={i} className={`absolute ${pos} h-5 w-5 animate-twinkle`} color="#fff" style={{ animationDelay: `${d}s` }} />)}
        <div className="container-x relative">
          <span className="eyebrow bg-white/10 text-brand-300">Portafolio</span>
          <h2 className="section-title">Proyectos que hacemos <span className="text-brand">realidad</span></h2>
          <p className="mt-3 max-w-xl text-white/60">Cada proyecto se registra en nuestro portafolio con responsables, entregables, evidencias y lecciones aprendidas.</p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.data?.map((p, i) => (
              <Reveal key={p.id} delay={i * 120}><Tilt><article className="group overflow-hidden rounded-3xl bg-white/[.06] ring-1 ring-white/10 backdrop-blur transition hover:-translate-y-1 hover:bg-white/10 hover:ring-brand/60">
                <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-brand to-brand-800">
                  {p.cover_url ? <img src={p.cover_url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /> : <div className="grid h-full place-items-center"><Donut className="h-24 w-24 opacity-80" /></div>}
                </div>
                <div className="p-6">
                  <div className="flex gap-2 text-[11px] font-bold uppercase tracking-wide">
                    {p.category && <span className="rounded-full bg-brand px-2.5 py-0.5">{p.category}</span>}
                    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-white/70">{STATUS[p.status]}</span>
                  </div>
                  <h3 className="mt-3 text-xl font-bold">{p.name}</h3>
                  <p className="mt-1 text-sm text-white/60">{p.summary}</p>
                </div>
              </article></Tilt></Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── SCRUMMY ───────── */}
      <section id="scrummy" className="relative scroll-mt-20 overflow-hidden py-20 sm:py-28" style={{ backgroundImage: 'url(/brand/fondo-crema.webp)', backgroundSize: 'cover' }}>
        <Blobs />
        <div className="container-x relative grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow bg-white">Nuestra mascota</span>
            <h2 className="section-title">Conoce a <span className="text-brand">Scrummy</span></h2>
            <p className="mt-5 text-lg text-ink/70">Scrummy es un castor, y no por casualidad: en la naturaleza los castores son los grandes <b>gestores de proyectos</b>. Planifican, construyen en equipo y entregan represas que transforman su entorno.</p>
            <p className="mt-3 text-ink/65">Su nombre viene de <b>Scrum</b>, y lleva en su polera la “O” de CIPRO. Lo verás en nuestras campañas, en el onboarding de cada ciclo… ¡y hasta de visita en otras universidades!</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {['Curioso', 'Colaborador', 'Ágil', 'Buena onda'].map((t) => <span key={t} className="rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-white">{t}</span>)}
            </div>
          </Reveal>
          <Reveal delay={150} className="relative flex items-end justify-center gap-0 sm:gap-2">
            <div className="absolute bottom-0 left-1/2 h-3/4 w-3/4 -translate-x-1/2 rounded-full bg-brand/90 blur-0" />
            <Constellation className="absolute inset-x-0 top-0 w-full opacity-60" color="#fff" />
            <Scrummy pose="chica-saludando" className="relative z-10 h-56 animate-float [animation-delay:-1s] sm:h-72" />
            <Scrummy pose="saludando" className="relative z-20 -mx-6 h-72 animate-float sm:h-96" />
            <Scrummy pose="espalda" className="relative z-10 h-56 animate-float [animation-delay:-2.5s] sm:h-72" />
          </Reveal>
        </div>
      </section>

      {/* ───────── ALIANZAS ───────── */}
      <section id="alianzas" className="scroll-mt-20 py-20 sm:py-28">
        <div className="container-x text-center">
          <span className="eyebrow">Ecosistema</span>
          <h2 className="section-title">Alianzas y redes que nos impulsan</h2>
          <p className="mx-auto mt-3 max-w-xl text-ink/60">Círculos, organizaciones y empresas con quienes construimos proyectos, eventos y comunidad.</p>
          <div className="mt-12 grid grid-cols-3 gap-6 sm:grid-cols-4 lg:grid-cols-5">
            {alliances.data?.map((a, i) => {
              const inner = (
                <>
                  <div className="mx-auto h-24 w-24 overflow-hidden rounded-full shadow-lg ring-4 ring-white transition group-hover:scale-105 group-hover:ring-brand sm:h-28 sm:w-28">
                    {a.logo_url ? <img src={a.logo_url} alt={a.name} loading="lazy" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center bg-ink p-2 font-display text-sm font-extrabold text-white">{a.name}</div>}
                  </div>
                  <p className="mt-3 text-sm font-bold">{a.name}</p>
                  <p className="text-xs text-ink/50">{a.kind}</p>
                </>
              );
              return a.website_url
                ? <Reveal key={a.id} delay={(i % 5) * 70}><a href={a.website_url} target="_blank" rel="noreferrer" className="group block" title={a.description ?? ''}>{inner}</a></Reveal>
                : <Reveal key={a.id} delay={(i % 5) * 70}><div className="group" title={a.description ?? ''}>{inner}</div></Reveal>;
            })}
          </div>
        </div>
      </section>

      {/* ───────── NOTICIAS ───────── */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><span className="eyebrow bg-white">Novedades</span><h2 className="section-title">Últimas noticias</h2></div>
            <Link to="/noticias" className="btn-ghost bg-white">Ver todas</Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">{news.data?.map((n, i) => <Reveal key={n.id} delay={i * 120}><NewsCard n={n} /></Reveal>)}</div>
        </div>
      </section>

      {/* ───────── GALERÍA ───────── */}
      {galleryPicks.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="container-x">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><span className="eyebrow">Galería</span><h2 className="section-title">Momentos ciprianos</h2></div>
              <Link to="/galeria" className="btn-primary">Ver galería completa <Icon name="arrow" className="h-4 w-4" /></Link>
            </div>
            <div className="mt-10 grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] md:grid-cols-4">
              {galleryPicks.map((g, i) => (
                <Link to="/galeria" key={g.id} style={{ animationDelay: `${i * 70}ms` }} className={`group relative overflow-hidden rounded-2xl ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
                  <img src={g.image_url} alt={g.title ?? ''} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent p-3 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">{g.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────── REDES ───────── */}
      <section className="relative overflow-hidden bg-ink py-20 text-white">
        <Blobs variant="dark" />
        <Starfield count={35} />
        <Constellation className="pointer-events-none absolute -left-10 bottom-0 w-96 opacity-50" />
        <div className="container-x relative">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><span className="eyebrow bg-white/10 text-brand-300">Así comunicamos</span><h2 className="section-title">CIPRO en redes</h2></div>
            {settings.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="btn-primary"><Icon name="instagram" className="h-4 w-4" /> Síguenos</a>}
          </div>
          <div className="-mx-4 mt-10 flex snap-x gap-4 overflow-x-auto px-4 pb-4">
            {SOCIAL.map((s) => <img key={s} src={`/media/social/${s}.webp`} alt="Pieza de CIPRO en redes" loading="lazy" className="h-80 w-auto shrink-0 snap-start rounded-2xl object-cover ring-1 ring-white/10 transition duration-500 hover:-translate-y-2 hover:rotate-1 hover:ring-brand sm:h-96" />)}
          </div>
        </div>
      </section>

      {/* ───────── ÚNETE ───────── */}
      <section id="unete" className="scroll-mt-20 py-20 sm:py-28">
        <div className="container-x">
          <Reveal className="relative overflow-hidden rounded-[2.5rem] bg-brand p-8 text-white sm:p-14">
            <Blobs variant="brand" />
            <Constellation className="absolute inset-0 h-full w-full opacity-40" color="#fff" />
            <Sparkle className="absolute right-[38%] top-8 h-8 w-8 animate-twinkle" color="#fff" />
            <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <h2 className="font-display text-4xl font-black leading-tight sm:text-5xl">¿Listo para liderar<br />proyectos reales?</h2>
                <p className="mt-4 max-w-xl text-white/85">Forma parte de la Carrera Cipriana: empieza como Entry Member y crece hasta Project Leader, Mentor o Directiva.</p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link to="/acceso#registro" className="btn bg-ink px-6 py-3 text-base text-white hover:bg-black">Crear mi perfil cipriano</Link>
                  {settings.join_form_url && <a href={settings.join_form_url} target="_blank" rel="noreferrer" className="btn bg-white px-6 py-3 text-base text-brand-700 hover:bg-peach">Postular</a>}
                  {!settings.join_form_url && settings.contact_email && <a href={`mailto:${settings.contact_email}`} className="btn border border-white/50 px-6 py-3 text-base hover:bg-white/10">Escríbenos</a>}
                </div>
              </div>
              <Scrummy pose="chica-saludando" className="mx-auto -mb-14 h-64 animate-float sm:-mb-14 sm:h-80" />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

export function NewsCard({ n }: { n: News }) {
  return (
    <Link to={`/noticias/${n.slug}`} className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-ink/5 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-peach to-brand">
        {n.cover_url ? <img src={n.cover_url} alt="" loading="lazy" className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" /> : <div className="grid h-full place-items-center"><Donut className="h-20 w-20" /></div>}
        {n.category && <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">{n.category}</span>}
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold text-brand">{n.published_at && new Date(n.published_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</p>
        <h3 className="mt-1.5 font-bold leading-snug group-hover:text-brand-700">{n.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink/60">{n.excerpt}</p>
      </div>
    </Link>
  );
}
