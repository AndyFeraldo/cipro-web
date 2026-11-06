import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAsync } from '../../lib/useQuery';
import { useSettings } from '../../lib/settings';
import Scrummy from '../../components/Scrummy';
import { Constellation, Donut, Sparkle } from '../../components/Brand';

type Cert = { code: string; full_name: string; course_title: string; course_slug: string; hours: number; final_score: number | null; issued_at: string };

/** Certificado imprimible (A4 horizontal) y verificable públicamente por su código. */
export default function Certificate() {
  const { code } = useParams();
  const { settings } = useSettings();
  const cert = useAsync<Cert | null>(() => supabase.rpc('academy_verify_certificate', { p_code: code ?? '' }) as never, [code]);
  if (cert.loading) return <div className="grid min-h-screen place-items-center bg-cream"><Donut className="h-14 w-14 animate-spin" /></div>;
  if (!cert.data) return <Verify notFound={code} />;
  const c = cert.data;
  const date = new Date(c.issued_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' });
  const url = `${location.origin}/academia/certificado/${c.code}`;

  return (
    <div className="min-h-screen bg-ink/90 py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-6 flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 print:hidden">
        <Link to="/academia" className="btn bg-white/10 text-white hover:bg-white/20">← Academia</Link>
        <div className="flex items-center gap-2 rounded-full bg-green-500/15 px-4 py-2 text-sm font-semibold text-green-300">✓ Certificado verificado · {c.code}</div>
        <button onClick={() => window.print()} className="btn-primary">⬇ Descargar PDF / Imprimir</button>
      </div>
      <div className="cert-sheet relative mx-auto aspect-[297/210] w-full max-w-5xl overflow-hidden bg-cream-gradient shadow-2xl print:max-w-none print:shadow-none">
        <div className="dot-grid absolute inset-0 opacity-50" />
        <div className="absolute inset-0 border-[14px] border-brand/90" />
        <div className="absolute inset-[22px] rounded-sm border border-brand/30" />
        <Constellation className="absolute -left-6 -top-4 w-1/3 opacity-70" animated={false} />
        <Constellation className="absolute -bottom-6 -right-6 w-1/3 rotate-180 opacity-70" animated={false} />
        <div className="relative flex h-full flex-col items-center justify-center px-[8%] text-center">
          <img src="/brand/logo-dark.png" alt="CIPRO" className="h-[11%]" />
          <p className="mt-[2.5%] text-[1.3vw] font-black uppercase tracking-[.45em] text-brand print:text-[11pt]">Certificado de aprobación</p>
          <p className="mt-[2%] text-[1.2vw] text-ink/60 print:text-[10pt]">El Círculo de Gestión de Proyectos certifica que</p>
          <p className="mt-[1.5%] font-display text-[4vw] font-black leading-none print:text-[30pt]">{c.full_name}</p>
          <div className="mx-auto mt-[1.2%] h-1 w-1/3 rounded-full bg-gradient-to-r from-transparent via-brand to-transparent" />
          <p className="mt-[2%] max-w-[80%] text-[1.35vw] text-ink/75 print:text-[11pt]">ha completado y aprobado satisfactoriamente el curso</p>
          <p className="mt-[0.8%] font-display text-[2.2vw] font-extrabold text-ink print:text-[18pt]">“{c.course_title}”</p>
          <p className="mt-[0.8%] text-[1.2vw] text-ink/60 print:text-[10pt]">con una duración de <b>{c.hours} horas académicas</b>{c.final_score != null ? <> · nota del examen final: <b>{c.final_score}%</b></> : null} · Academia CIPRO</p>
          <div className="mt-[4%] grid w-full grid-cols-3 items-end gap-6 text-[1vw] print:text-[8pt]">
            <div><div className="mx-auto mb-1 h-px w-3/4 bg-ink/40" /><p className="font-bold">Presidencia CIPRO</p><p className="text-ink/50">Círculo de Gestión de Proyectos</p></div>
            <div className="flex flex-col items-center"><Donut className="h-[4.5vw] w-[4.5vw] print:h-14 print:w-14" /><p className="mt-1 text-ink/50">Lima, {date}</p></div>
            <div><div className="mx-auto mb-1 h-px w-3/4 bg-ink/40" /><p className="font-bold">PMO CIPRO</p><p className="text-ink/50">Academia CIPRO</p></div>
          </div>
          <p className="absolute bottom-[5%] left-0 right-0 text-[0.85vw] text-ink/45 print:text-[7pt]">Código <b className="font-mono text-ink/70">{c.code}</b> · Verifica en {url.replace(/^https?:\/\//, '')}</p>
        </div>
        <Scrummy pose="saludando" className="absolute bottom-[6%] right-[5%] h-[24%]" />
        <Sparkle className="absolute left-[8%] top-[12%] h-[5%] w-[5%]" />
      </div>
      <p className="mx-auto mt-4 max-w-5xl px-4 text-center text-xs text-white/40 print:hidden">{settings.faculty ? `CIPRO · ${settings.faculty}. ` : ''}Certificado de un curso interno del círculo; no constituye una certificación ni PDUs del PMI.</p>
      <style>{`@media print { @page { size: A4 landscape; margin: 0 } body { -webkit-print-color-adjust: exact; print-color-adjust: exact } .cert-sheet { width: 297mm; height: 210mm; aspect-ratio: auto } header, footer, nav { display: none !important } }`}</style>
    </div>
  );
}

export function Verify({ notFound }: { notFound?: string }) {
  const [code, setCode] = useState(notFound ?? '');
  const nav = useNavigate();
  return (
    <div className="grid min-h-[70vh] place-items-center bg-cream-gradient px-4 py-16">
      <form onSubmit={(e) => { e.preventDefault(); nav(`/academia/certificado/${code.trim().toUpperCase()}`); }} className="card w-full max-w-md text-center hover:translate-y-0">
        <Scrummy pose="frente" className="mx-auto h-32" />
        <h1 className="mt-4 text-2xl font-black">Verificar certificado</h1>
        {notFound && <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">No encontramos un certificado con el código {notFound}.</p>}
        <p className="mt-2 text-sm text-ink/60">Ingresa el código que aparece en el certificado (ej. CIPRO-AB12CD34).</p>
        <input className="input mt-5 text-center font-mono text-lg font-bold uppercase tracking-widest" placeholder="CIPRO-XXXXXXXX" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required />
        <button className="btn-primary mt-4 w-full">Verificar</button>
        <Link to="/academia" className="mt-4 block text-sm text-brand">Ir a la Academia</Link>
      </form>
    </div>
  );
}
