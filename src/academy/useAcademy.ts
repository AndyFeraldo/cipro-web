import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { isMemberEmail, useSession } from '../lib/session';
import { FINAL_SLUG, type Course } from './types';

export type ProgressRow = { course_slug: string; lesson_slug: string; score: number | null; total: number | null; passed: boolean; attempts: number };
export type CertRow = { code: string; course_slug: string; course_title: string; hours: number; issued_at: string; full_name: string; final_score: number | null };

/** Progreso y certificados del cipriano conectado. */
export function useAcademy() {
  const { session, ready } = useSession();
  const isMember = !!session && isMemberEmail(session.user.email);
  const [progress, setProgress] = useState<Record<string, ProgressRow>>({});
  const [certs, setCerts] = useState<CertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    if (!isMember) { setProgress({}); setCerts([]); setLoading(false); return; }
    const [p, c] = await Promise.all([
      supabase.from('academy_progress').select('course_slug,lesson_slug,score,total,passed,attempts').eq('user_id', session!.user.id),
      supabase.from('academy_certificates').select('code,course_slug,course_title,hours,issued_at,full_name,final_score').eq('user_id', session!.user.id),
    ]);
    setProgress(Object.fromEntries((p.data || []).map((r) => [`${r.course_slug}/${r.lesson_slug}`, r as ProgressRow])));
    setCerts((c.data as CertRow[]) || []); setLoading(false);
  }, [isMember, session]);
  useEffect(() => { if (ready) reload(); }, [ready, reload]);
  return { ready, isMember, session, progress, certs, loading, reload };
}

/** Pasos del curso (lecciones + examen final) y cuántos están aprobados. */
export function courseSteps(c: Course, progress: Record<string, ProgressRow>) {
  const steps = [...c.lessons.map((l) => ({ slug: l.slug, title: l.title, minutes: l.minutes })), ...(c.final.length ? [{ slug: FINAL_SLUG, title: 'Examen final', minutes: 20 }] : [])];
  const done = steps.filter((s) => progress[`${c.slug}/${s.slug}`]?.passed).length;
  const next = steps.find((s) => !progress[`${c.slug}/${s.slug}`]?.passed) ?? steps[steps.length - 1];
  return { steps, done, total: steps.length, pct: steps.length ? Math.round((done / steps.length) * 100) : 0, next };
}
