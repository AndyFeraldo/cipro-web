import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { FINAL_PASS, FINAL_SLUG, LESSON_PASS, getCourse, type Question } from '../../academy';
import { courseSteps, useAcademy } from '../../academy/useAcademy';
import Blocks from '../../academy/Blocks';
import { supabase } from '../../lib/supabase';
import Scrummy from '../../components/Scrummy';
import { Donut, Sparkle } from '../../components/Brand';

type Result = { score: number; total: number; pct: number; passed: boolean; pass_pct: number; results: boolean[] };

export default function LessonPage() {
  const { course: cs, lesson: ls } = useParams();
  const c = getCourse(cs);
  const nav = useNavigate();
  const { ready, isMember, progress, reload } = useAcademy();
  const [menu, setMenu] = useState(false);
  useEffect(() => { window.scrollTo(0, 0); setMenu(false); }, [ls]);

  if (!ready) return <div className="grid min-h-[60vh] place-items-center"><Donut className="h-14 w-14 animate-spin" /></div>;
  if (!isMember) return <Navigate to={`/acceso?next=/academia/${cs}/${ls}`} replace />;
  if (!c || c.status !== 'disponible') return <Navigate to="/academia" replace />;
  const isFinal = ls === FINAL_SLUG;
  const idx = c.lessons.findIndex((l) => l.slug === ls);
  const lesson = isFinal ? null : c.lessons[idx];
  if (!isFinal && !lesson) return <Navigate to={`/academia/${c.slug}`} replace />;
  const s = courseSteps(c, progress);
  const stepIdx = s.steps.findIndex((x) => x.slug === ls);
  const prev = s.steps[stepIdx - 1], next = s.steps[stepIdx + 1];
  const passed = !!progress[`${c.slug}/${ls}`]?.passed;
  if (!s.isUnlocked(ls!)) return <Locked course={c.slug} title={s.steps[stepIdx]?.title} next={s.next} />;

  const Outline = (
    <nav className="space-y-1">
      <Link to={`/academia/${c.slug}`} className="mb-3 block text-sm font-semibold text-brand">← {c.title}</Link>
      <div className="mb-4"><div className="h-2 overflow-hidden rounded-full bg-ink/5"><div className="h-full bg-gradient-to-r from-brand to-seg-3" style={{ width: `${s.pct}%` }} /></div><p className="mt-1 text-xs text-ink/50">{s.pct}% del curso</p></div>
      {s.steps.map((st, i) => {
        const ok = progress[`${c.slug}/${st.slug}`]?.passed;
        const active = st.slug === ls;
        const open = s.isUnlocked(st.slug);
        const inner = (<>
          <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-black ${ok ? 'bg-green-500 text-white' : active ? 'bg-white text-brand' : open ? 'bg-brand-50 text-brand' : 'bg-ink/5 text-ink/30'}`}>{ok ? '✓' : !open ? '🔒' : st.slug === FINAL_SLUG ? '🎓' : i + 1}</span>
          <span className="leading-tight">{st.title}</span>
        </>);
        return open
          ? <Link key={st.slug} to={`/academia/${c.slug}/${st.slug}`} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active ? 'bg-brand text-white shadow' : 'hover:bg-brand-50'}`}>{inner}</Link>
          : <div key={st.slug} title="Aprueba la lección anterior para desbloquear" className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink/35">{inner}</div>;
      })}
    </nav>
  );

  return (
    <div className="bg-cream/60">
      <div className="container-x grid gap-8 py-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block"><div className="sticky top-24 rounded-3xl bg-white p-5 shadow-sm">{Outline}</div></aside>
        <div className="min-w-0">
          <button className="btn-ghost mb-4 bg-white lg:hidden" onClick={() => setMenu(!menu)}>☰ Contenido del curso ({s.pct}%)</button>
          {menu && <div className="mb-6 rounded-3xl bg-white p-5 shadow-sm lg:hidden">{Outline}</div>}

          <article className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-ink/5">
            <header className="relative overflow-hidden px-6 py-10 text-white sm:px-10" style={{ background: `linear-gradient(135deg, ${c.accent}, #0B0B0B 75%)` }}>
              <div className="dot-grid-light absolute inset-0 opacity-30" />
              <div className="relative flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.25em] text-white/70">{isFinal ? 'Evaluación final' : `Lección ${idx + 1} de ${c.lessons.length} · ${lesson!.minutes} min`}</p>
                  <h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">{isFinal ? `Examen final · ${c.title}` : lesson!.title}</h1>
                  {passed && <span className="mt-3 inline-flex rounded-full bg-green-500 px-3 py-1 text-xs font-bold">✓ Aprobado</span>}
                </div>
                <Scrummy pose={isFinal ? 'saludando' : (['frente', 'lado', 'chica-saludando', 'saludando'] as const)[idx % 4]} className="hidden h-32 sm:block" />
              </div>
            </header>
            <div className="px-6 py-8 sm:px-10">
              {isFinal
                ? <p className="text-lg text-ink/75">{c.final.length} preguntas. Necesitas al menos <b>{FINAL_PASS}%</b> para aprobar y desbloquear tu certificado. Puedes intentarlo las veces que quieras.</p>
                : <Blocks blocks={lesson!.blocks} />}
              <Quiz key={`${c.slug}/${ls}`} course={c.slug} lesson={ls!} questions={isFinal ? c.final : lesson!.quiz || []} pass={isFinal ? FINAL_PASS : LESSON_PASS} final={isFinal} onDone={reload}
                onNext={() => (next ? nav(`/academia/${c.slug}/${next.slug}`) : nav(`/academia/${c.slug}`))} nextLabel={next ? (next.slug === FINAL_SLUG ? 'Ir al examen final' : 'Siguiente lección') : 'Obtener mi certificado'} />
            </div>
          </article>
          <div className="mt-6 flex justify-between gap-3">
            {prev ? <Link to={`/academia/${c.slug}/${prev.slug}`} className="btn-ghost bg-white">← {prev.title}</Link> : <span />}
            {next && (passed ? <Link to={`/academia/${c.slug}/${next.slug}`} className="btn-ghost bg-white">{next.title} →</Link> : <span className="btn cursor-not-allowed bg-white text-ink/35 ring-1 ring-ink/10">🔒 {next.title}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function Quiz({ course, lesson, questions, pass, final, onDone, onNext, nextLabel }: { course: string; lesson: string; questions: Question[]; pass: number; final: boolean; onDone: () => void; onNext: () => void; nextLabel: string }) {
  const [ans, setAns] = useState<(number | null)[]>(questions.map(() => null));
  const [res, setRes] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  if (!questions.length) return null;
  const complete = ans.every((a) => a !== null);

  async function submit() {
    setBusy(true); setErr('');
    const { data, error } = await supabase.rpc('academy_submit_quiz', { p_course: course, p_lesson: lesson, p_answers: ans });
    setBusy(false);
    if (error) return setErr(error.message);
    setRes(data as Result); onDone();
  }

  return (
    <section className={`mt-12 rounded-3xl p-6 sm:p-8 ${final ? 'bg-white' : 'bg-cream'} ring-1 ring-brand-100`}>
      {!final && <h2 className="flex items-center gap-2 text-2xl font-extrabold"><Sparkle className="h-5 w-5" /> Mini quiz</h2>}
      {!final && <p className="mt-1 text-sm text-ink/60">Aprueba con {pass}% para marcar la lección como completada.</p>}
      <ol className="mt-6 space-y-6">
        {questions.map((q, i) => (
          <li key={i}>
            <p className="font-bold"><span className="mr-2 text-brand">{i + 1}.</span>{q.q}{res && <span className={`ml-2 text-sm ${res.results[i] ? 'text-green-600' : 'text-red-600'}`}>{res.results[i] ? '✓ Correcta' : '✗ Revisa esta'}</span>}</p>
            <div className="mt-3 grid gap-2">
              {q.options.map((o, k) => {
                const sel = ans[i] === k;
                return (
                  <button key={k} type="button" disabled={!!res?.passed} onClick={() => { const a = [...ans]; a[i] = k; setAns(a); setRes(null); }}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm ring-1 transition ${sel ? 'bg-brand text-white ring-brand' : 'bg-white ring-ink/10 hover:ring-brand'}`}>
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${sel ? 'bg-white text-brand' : 'bg-ink/5'}`}>{'ABCD'[k]}</span>{o}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ol>
      {err && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{err}</p>}
      {res ? (
        <div className={`mt-8 flex flex-wrap items-center gap-5 rounded-3xl p-6 ${res.passed ? 'bg-green-50 ring-1 ring-green-200' : 'bg-amber-50 ring-1 ring-amber-200'}`}>
          <Scrummy pose={res.passed ? 'saludando' : 'lado'} className={`h-24 ${res.passed ? 'animate-float' : ''}`} />
          <div className="flex-1">
            <p className="text-2xl font-black">{res.passed ? '¡Aprobado! 🎉' : 'Casi… ¡inténtalo otra vez!'}</p>
            <p className="text-sm text-ink/70">Obtuviste {res.score} de {res.total} ({res.pct}%). {res.passed ? '' : `Necesitas ${res.pass_pct}%. Revisa el contenido y vuelve a intentarlo.`}</p>
          </div>
          {res.passed ? <button className="btn-primary px-6 py-3" onClick={onNext}>{nextLabel} →</button> : <button className="btn-dark" onClick={() => { setRes(null); setAns(questions.map(() => null)); }}>Reintentar</button>}
        </div>
      ) : (
        <button className="btn-primary mt-8 w-full py-3 sm:w-auto sm:px-10" disabled={!complete || busy} onClick={submit}>{busy ? 'Calificando…' : complete ? 'Enviar respuestas' : `Responde las ${questions.length} preguntas`}</button>
      )}
    </section>
  );
}

function Locked({ course, title, next }: { course: string; title?: string; next: { slug: string; title: string } }) {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-cream-gradient px-4 py-16">
      <div className="card max-w-md text-center hover:translate-y-0">
        <Scrummy pose="espalda" className="mx-auto h-40" />
        <p className="mt-4 text-4xl">🔒</p>
        <h1 className="mt-2 text-2xl font-black">“{title}” aún está bloqueada</h1>
        <p className="mt-2 text-ink/60">Los cursos se recorren en orden: aprueba primero la lección anterior para desbloquear esta.</p>
        <Link to={`/academia/${course}/${next.slug}`} className="btn-primary mt-6">Continuar con: {next.title} →</Link>
        <Link to={`/academia/${course}`} className="mt-3 block text-sm text-brand">Ver el temario</Link>
      </div>
    </div>
  );
}
