import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { getCourse } from '../../academy';
import { courseSteps, useAcademy } from '../../academy/useAcademy';
import { supabase } from '../../lib/supabase';
import Scrummy from '../../components/Scrummy';
import { Constellation, Sparkle } from '../../components/Brand';
import { Blobs, Reveal } from '../../components/Motion';
import Icon from '../../components/Icon';

export default function CoursePage() {
  const { course: slug } = useParams();
  const c = getCourse(slug);
  const nav = useNavigate();
  const { isMember, progress, certs, reload } = useAcademy();
  const [msg, setMsg] = useState('');
  if (!c || c.status !== 'disponible') return <div className="container-x py-20">Curso no disponible. <Link to="/academia" className="text-brand">Volver a la Academia</Link></div>;
  const s = courseSteps(c, progress);
  const cert = certs.find((x) => x.course_slug === c.slug);
  const complete = s.done === s.total;

  async function claim() {
    setMsg('');
    const { data, error } = await supabase.rpc('academy_issue_certificate', { p_course: c!.slug });
    if (error) return setMsg(error.message);
    await reload(); nav(`/academia/certificado/${(data as { code: string }).code}`);
  }

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden py-14 text-white" style={{ background: `linear-gradient(135deg, ${c.accent}, #0B0B0B 70%)` }}>
        <Blobs variant="dark" />
        <Constellation className="pointer-events-none absolute right-0 top-0 w-96 opacity-60" color="#fff" />
        <div className="container-x relative grid items-end gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <Link to="/academia" className="text-sm text-white/70 hover:text-white">← Academia CIPRO</Link>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide"><span className="rounded-full bg-white px-3 py-1 text-ink">{c.level}</span><span className="rounded-full bg-white/15 px-3 py-1">{c.hours} horas académicas</span><span className="rounded-full bg-white/15 px-3 py-1">{c.lessons.length} lecciones + examen</span></div>
            <h1 className="mt-4 font-display text-4xl font-black sm:text-5xl">{c.title}</h1>
            <p className="mt-3 max-w-2xl text-white/75">{c.subtitle}</p>
            {isMember && (
              <div className="mt-6 max-w-md">
                <div className="h-2.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-white transition-all" style={{ width: `${s.pct}%` }} /></div>
                <p className="mt-1 text-sm text-white/70">{s.done} de {s.total} pasos aprobados</p>
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              {!isMember && <Link to={`/acceso?next=/academia/${c.slug}`} className="btn bg-white px-6 py-3 text-ink hover:bg-peach">Ingresa con tu código para empezar</Link>}
              {isMember && !complete && <Link to={`/academia/${c.slug}/${s.next.slug}`} className="btn bg-white px-6 py-3 text-ink hover:bg-peach">{s.done ? 'Continuar' : 'Empezar'}: {s.next.title} <Icon name="arrow" className="h-4 w-4" /></Link>}
              {isMember && complete && (cert
                ? <Link to={`/academia/certificado/${cert.code}`} className="btn bg-white px-6 py-3 text-ink">🎓 Ver mi certificado</Link>
                : <button onClick={claim} className="btn bg-white px-6 py-3 text-ink hover:bg-peach">🎓 Obtener mi certificado</button>)}
            </div>
            {msg && <p className="mt-3 rounded-xl bg-white/10 p-3 text-sm">{msg}</p>}
          </div>
          <Scrummy pose={c.pose} className="mx-auto h-56 animate-float md:h-72" />
        </div>
      </section>

      <div className="container-x mt-12 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div>
          <h2 className="text-2xl font-extrabold">Contenido del curso</h2>
          <ol className="mt-6 space-y-3">
            {s.steps.map((st, i) => {
              const p = progress[`${c.slug}/${st.slug}`];
              const isFinal = st.slug === 'examen-final';
              const locked = isMember && !s.isUnlocked(st.slug);
              return (
                <Reveal as="li" key={st.slug} delay={i * 60}>
                  <Link to={!isMember ? `/acceso?next=/academia/${c.slug}/${st.slug}` : locked ? '#' : `/academia/${c.slug}/${st.slug}`} onClick={(e) => locked && e.preventDefault()} aria-disabled={locked}
                    className={`group flex items-center gap-4 rounded-2xl p-4 ring-1 transition ${locked ? 'cursor-not-allowed opacity-55' : 'hover:-translate-y-0.5 hover:shadow-lg'} ${isFinal ? 'bg-ink text-white ring-ink' : 'bg-white ring-ink/5'}`}>
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-black ${p?.passed ? 'bg-green-500 text-white' : locked ? 'bg-ink/10 text-ink/40' : isFinal ? 'bg-brand text-white' : 'bg-brand-50 text-brand-700'}`}>{p?.passed ? '✓' : locked ? '🔒' : isFinal ? '🎓' : i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold group-hover:text-brand">{st.title}</p>
                      <p className={`text-sm ${isFinal ? 'text-white/60' : 'text-ink/55'}`}>{isFinal ? `${c.final.length} preguntas · aprueba con 70%` : `${st.minutes} min · ${c.lessons[i].summary}`}</p>
                    </div>
                    {p && <span className={`text-xs font-semibold ${p.passed ? 'text-green-600' : 'text-amber-600'}`}>{p.total ? `${p.score}/${p.total}` : ''}</span>}
                  </Link>
                </Reveal>
              );
            })}
          </ol>
        </div>
        <aside className="space-y-6">
          <div className="rounded-3xl bg-cream p-6">
            <h3 className="flex items-center gap-2 font-extrabold"><Sparkle className="h-4 w-4" /> Lo que aprenderás</h3>
            <ul className="mt-4 space-y-2 text-sm">{c.outcomes.map((o) => <li key={o} className="flex gap-2"><span className="text-brand">✓</span>{o}</li>)}</ul>
          </div>
          <div className="rounded-3xl bg-ink p-6 text-white">
            <h3 className="font-extrabold">Requisitos del certificado</h3>
            <ul className="mt-3 space-y-1 text-sm text-white/70"><li>• Avanzar en orden: cada lección se desbloquea al aprobar la anterior</li><li>• Aprobar el mini quiz de cada lección (60%)</li><li>• Aprobar el examen final (70%)</li><li>• Tener tu perfil cipriano activo</li></ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
