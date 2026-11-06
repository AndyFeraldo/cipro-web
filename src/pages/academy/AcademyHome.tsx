import { Link } from 'react-router-dom';
import { COURSES } from '../../academy';
import { courseSteps, useAcademy } from '../../academy/useAcademy';
import Scrummy from '../../components/Scrummy';
import { Constellation, Donut, Sparkle } from '../../components/Brand';
import { Blobs, Reveal, Starfield, Tilt } from '../../components/Motion';
import Icon from '../../components/Icon';

const STEPS: [string, string][] = [
  ['Ingresa', 'Con tu código Ulima y tu contraseña de “Soy cipriano”.'],
  ['Aprende', 'Lecciones cortas con ejemplos reales de CIPRO y a Scrummy como guía.'],
  ['Demuestra', 'Aprueba el mini quiz de cada lección y el examen final (70%).'],
  ['Certifícate', 'Tu certificado CIPRO se desbloquea al instante, con código verificable.'],
];

export default function AcademyHome() {
  const { isMember, progress, certs } = useAcademy();
  const available = COURSES.filter((c) => c.status === 'disponible');
  const totalHours = available.reduce((a, c) => a + c.hours, 0);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-space py-16 text-white sm:py-24">
        <Blobs variant="dark" />
        <Starfield count={80} />
        <Constellation className="pointer-events-none absolute -left-10 top-6 w-96 opacity-60" />
        <div className="container-x relative grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="animate-fadeup">
            <span className="eyebrow bg-white/10 text-brand-300"><Sparkle className="h-3.5 w-3.5 animate-spinslow" /> Gratis para ciprianos</span>
            <h1 className="mt-5 font-display text-5xl font-black leading-[1.02] sm:text-7xl">Academia <span className="text-shine">CIPRO</span></h1>
            <p className="mt-5 max-w-xl text-lg text-white/70">Cursos cortos para iniciarte en la gestión de proyectos: desde qué es un proyecto y cómo nace (Business Case y Acta de Constitución) hasta metodologías ágiles. Aprueba y llévate tu <b className="text-white">certificado CIPRO</b>.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#cursos" className="btn-primary px-6 py-3 text-base">Ver cursos <Icon name="arrow" className="h-4 w-4" /></a>
              {!isMember && <Link to="/acceso?next=/academia" className="btn border border-white/30 px-6 py-3 text-base hover:bg-white/10">Ingresar con mi código</Link>}
            </div>
            <div className="mt-10 flex flex-wrap gap-8 text-sm">
              <div><p className="font-display text-3xl font-black text-brand">{available.length}</p><p className="text-white/60">cursos disponibles</p></div>
              <div><p className="font-display text-3xl font-black text-brand">{totalHours} h</p><p className="text-white/60">de contenido</p></div>
              <div><p className="font-display text-3xl font-black text-brand">100%</p><p className="text-white/60">gratuito</p></div>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-sm animate-fadeup [animation-delay:.2s]">
            <div className="absolute inset-[8%] rounded-full bg-gradient-to-br from-brand to-brand-700 shadow-[0_0_120px_rgba(255,81,23,.5)]" />
            <Donut className="absolute -right-2 top-2 h-24 w-24 animate-spinslow" />
            <Scrummy pose="frente" className="absolute inset-x-0 bottom-0 mx-auto h-[95%] animate-float" />
            <div className="absolute -left-4 bottom-12 rotate-[-6deg] rounded-2xl bg-white px-4 py-3 text-ink shadow-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-brand">Certificado</p>
              <p className="font-display font-extrabold">¡Desbloqueado! 🎓</p>
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="relative overflow-hidden bg-cream py-16">
        <div className="dot-grid absolute inset-0 opacity-50" />
        <div className="container-x relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([t, d], i) => (
            <Reveal key={t} delay={i * 100} className="rounded-3xl bg-white p-6 shadow-sm">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand font-black text-white">{i + 1}</span>
              <h3 className="mt-4 text-lg font-extrabold">{t}</h3><p className="mt-1 text-sm text-ink/60">{d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* MIS CERTIFICADOS */}
      {certs.length > 0 && (
        <section className="container-x pt-16">
          <h2 className="text-2xl font-extrabold">🎓 Tus certificados</h2>
          <div className="mt-4 flex flex-wrap gap-3">{certs.map((c) => <Link key={c.code} to={`/academia/certificado/${c.code}`} className="btn-dark">{c.course_title}</Link>)}</div>
        </section>
      )}

      {/* CATÁLOGO */}
      <section id="cursos" className="scroll-mt-20 py-16 sm:py-24">
        <div className="container-x">
          <span className="eyebrow">Catálogo</span>
          <h2 className="section-title">Elige tu ruta de aprendizaje</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {COURSES.map((c, i) => {
              const s = courseSteps(c, progress);
              const cert = certs.find((x) => x.course_slug === c.slug);
              const soon = c.status === 'pronto';
              return (
                <Reveal key={c.slug} delay={(i % 2) * 120}>
                  <Tilt max={4}>
                    <Link to={soon ? '#cursos' : `/academia/${c.slug}`} className={`group relative block overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-ink/5 transition hover:shadow-2xl hover:shadow-brand/15 ${soon ? 'cursor-default' : ''}`}>
                      <div className="relative h-48 overflow-hidden" style={{ background: `linear-gradient(135deg, ${c.accent}, #0B0B0B)` }}>
                        <div className="dot-grid-light absolute inset-0 opacity-40" />
                        <Constellation className="absolute -left-6 top-0 w-72 opacity-60" color="#fff" />
                        <Scrummy pose={c.pose} className={`absolute -bottom-3 right-4 h-52 transition duration-500 group-hover:-translate-y-2 ${soon ? 'opacity-60 grayscale-[40%]' : ''}`} />
                        <div className="absolute left-5 top-5 flex gap-2 text-[11px] font-bold uppercase tracking-wide">
                          <span className="rounded-full bg-white/90 px-2.5 py-1 text-ink">{c.level}</span>
                          <span className="rounded-full bg-ink/60 px-2.5 py-1 text-white">{c.hours} h</span>
                          {soon && <span className="rounded-full bg-brand px-2.5 py-1 text-white">Próximamente</span>}
                          {cert && <span className="rounded-full bg-green-500 px-2.5 py-1 text-white">Certificado ✓</span>}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-extrabold group-hover:text-brand-600">{c.title}</h3>
                        <p className="mt-1 text-sm text-ink/60">{c.subtitle}</p>
                        {!soon && (
                          <>
                            <p className="mt-4 text-xs font-semibold text-ink/50">{c.lessons.length} lecciones · examen final · certificado</p>
                            {isMember && (
                              <div className="mt-3">
                                <div className="h-2 overflow-hidden rounded-full bg-ink/5"><div className="h-full rounded-full bg-gradient-to-r from-brand to-seg-3 transition-all" style={{ width: `${s.pct}%` }} /></div>
                                <p className="mt-1 text-xs text-ink/50">{s.pct}% completado</p>
                              </div>
                            )}
                            <span className="mt-4 inline-flex items-center gap-1 font-semibold text-brand">{s.done > 0 ? 'Continuar' : 'Empezar curso'} <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                          </>
                        )}
                      </div>
                    </Link>
                  </Tilt>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CERTIFICADO */}
      <section className="relative overflow-hidden bg-ink py-16 text-white">
        <Blobs variant="dark" />
        <div className="container-x relative grid items-center gap-10 md:grid-cols-2">
          <div>
            <span className="eyebrow bg-white/10 text-brand-300">Tu logro, verificable</span>
            <h2 className="section-title">Certificado CIPRO a tu nombre</h2>
            <p className="mt-4 text-white/70">Al aprobar todas las lecciones y el examen final, tu certificado se genera automáticamente con tu nombre, las horas del curso y un código único que cualquiera puede verificar en la web. Descárgalo en PDF y súmalo a tu LinkedIn.</p>
            <Link to="/academia/verificar" className="btn border border-white/30 mt-6 hover:bg-white/10">Verificar un certificado</Link>
          </div>
          <div className="rotate-2 rounded-2xl bg-cream p-6 text-ink shadow-2xl ring-8 ring-white/10">
            <div className="flex items-center justify-between"><img src="/brand/logo-dark.png" alt="CIPRO" className="h-10" /><Donut className="h-10 w-10" /></div>
            <p className="mt-6 text-xs font-black uppercase tracking-[.3em] text-brand">Certificado de aprobación</p>
            <p className="mt-2 font-display text-2xl font-black">Tu nombre aquí</p>
            <p className="mt-1 text-sm text-ink/60">por aprobar <b>Fundamentos de Gestión de Proyectos</b> · 4 horas</p>
            <p className="mt-6 font-mono text-xs text-ink/40">CIPRO-XXXXXXXX</p>
          </div>
        </div>
      </section>

      <p className="container-x py-8 text-xs text-ink/40">Contenido elaborado por CIPRO con referencia a la Guía del PMBOK® (PMI), la Guía de Scrum y materiales de formación de nuestros miembros. Los certificados CIPRO acreditan la aprobación de cursos internos del círculo; no constituyen certificaciones ni PDUs del PMI.</p>
    </div>
  );
}
