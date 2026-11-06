import type { Area } from '../lib/types';
import { MONTHS } from '../lib/types';

export type ProfileForm = {
  full_name: string; university_code: string; career: string; email: string; phone: string; linkedin_url: string;
  is_working: boolean; company: string; job_title: string; joined_on: string; bio: string; area_id: string;
};
export const emptyProfile: ProfileForm = { full_name: '', university_code: '', career: '', email: '', phone: '', linkedin_url: '', is_working: false, company: '', job_title: '', joined_on: '', bio: '', area_id: '' };

const thisYear = new Date().getFullYear();
const YEARS = Array.from({ length: thisYear - 2013 }, (_, i) => String(thisYear - i));

/** Campos del perfil cipriano. `joined_on` se maneja como "AAAA-MM" (solo mes y año). */
export default function ProfileFields({ v, set, areas, showArea = true }: { v: ProfileForm; set: (v: ProfileForm) => void; areas?: Area[]; showArea?: boolean }) {
  const f = (k: keyof ProfileForm) => ({ value: v[k] as string, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set({ ...v, [k]: e.target.value }) });
  const [y, m] = v.joined_on ? v.joined_on.split('-') : ['', ''];
  const setJoined = (ny: string, nm: string) => set({ ...v, joined_on: ny && nm ? `${ny}-${nm}` : ny ? `${ny}-${nm || '01'}` : '' });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2"><label className="label">Nombre completo *</label><input className="input" required {...f('full_name')} /></div>
      <div><label className="label">Código universitario</label><input className="input" inputMode="numeric" placeholder="20204390" value={v.university_code} onChange={(e) => set({ ...v, university_code: e.target.value.replace(/\D/g, '') })} /></div>
      <div><label className="label">Carrera</label><input className="input" placeholder="Ingeniería de Sistemas" {...f('career')} /></div>
      <div>
        <label className="label">¿Cuándo ingresaste a CIPRO?</label>
        <div className="flex gap-2">
          <select className="input" value={m} onChange={(e) => setJoined(y || String(thisYear), e.target.value)}><option value="">Mes</option>{MONTHS.map((mm, i) => <option key={mm} value={String(i + 1).padStart(2, '0')}>{mm[0].toUpperCase() + mm.slice(1)}</option>)}</select>
          <select className="input" value={y} onChange={(e) => setJoined(e.target.value, m)}><option value="">Año</option>{YEARS.map((yy) => <option key={yy}>{yy}</option>)}</select>
        </div>
      </div>
      {showArea && areas && (
        <div><label className="label">Área en la que estás</label><select className="input" {...f('area_id')}><option value="">Selecciona…</option>{areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
      )}
      <div><label className="label">LinkedIn (opcional)</label><input className="input" placeholder="https://www.linkedin.com/in/…" {...f('linkedin_url')} /></div>
      <div><label className="label">Correo (opcional)</label><input className="input" type="email" {...f('email')} /></div>
      <div><label className="label">Celular (opcional)</label><input className="input" inputMode="tel" {...f('phone')} /></div>

      <div className="sm:col-span-2 rounded-2xl bg-brand-50 p-4">
        <label className="flex cursor-pointer items-center gap-3 font-semibold">
          <input type="checkbox" className="h-5 w-5 accent-brand" checked={v.is_working} onChange={(e) => set({ ...v, is_working: e.target.checked })} />
          Me encuentro trabajando actualmente 💼
        </label>
        {v.is_working && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div><label className="label">Empresa</label><input className="input" {...f('company')} /></div>
            <div><label className="label">Cargo</label><input className="input" placeholder="Practicante de PMO" {...f('job_title')} /></div>
          </div>
        )}
      </div>
      <div className="sm:col-span-2"><label className="label">Cuéntanos sobre ti</label><textarea className="input min-h-[100px]" maxLength={1000} placeholder="Tus intereses, lo que te apasiona de la gestión de proyectos…" {...f('bio')} /></div>
      <p className="sm:col-span-2 text-xs text-ink/50">🔒 Tu DNI, correo y celular son privados: no aparecen en la web.</p>
    </div>
  );
}
