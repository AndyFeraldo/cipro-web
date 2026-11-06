import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useSettings } from '../../lib/settings';
import ImageInput from './ImageInput';

const IMAGES: [string, string][] = [
  ['logo_url', 'Logo (imagotipo, fondo claro)'], ['logo_dark_url', 'Logo para fondo negro'],
  ['mascot_url', 'Scrummy (PNG sin fondo)'], ['hero_image_url', 'Foto principal del inicio (opcional)'],
];
const TEXTS: [string, string, boolean?][] = [
  ['motto', 'Lema'], ['purpose', 'Propósito (texto del inicio)', true], ['mission', 'Misión', true], ['vision', 'Visión', true],
  ['advisor_name', 'Docente encargado'], ['faculty', 'Facultad / unidad académica'], ['founded_years', 'Años de trayectoria'],
  ['stat_projects', 'N.º de proyectos (vacío = ocultar)'], ['stat_members', 'N.º de ciprianos (vacío = ocultar)'], ['stat_alliances', 'N.º de alianzas (vacío = ocultar)'],
  ['join_form_url', 'Link del formulario de postulación'], ['instagram_url', 'Instagram'], ['linkedin_url', 'LinkedIn de CIPRO'], ['contact_email', 'Correo de contacto'],
];

export default function SettingsAdmin() {
  const { settings, reload } = useSettings();
  const [vals, setVals] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');
  useEffect(() => setVals(settings), [settings]);

  async function save() {
    const rows = [...IMAGES, ...TEXTS].map(([key]) => ({ key, value: vals[key] ?? '', updated_at: new Date().toISOString() }));
    const { error } = await supabase.from('site_settings').upsert(rows);
    setMsg(error ? error.message : 'Guardado ✔'); reload();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-extrabold">Identidad visual</h2>
        <p className="mt-1 text-sm text-ink/60">Sube aquí el logo y a Scrummy desde la carpeta “RECURSOS GRÁFICOS | CIPRO” del Drive.</p>
        <div className="mt-5 space-y-5">
          {IMAGES.map(([k, l]) => <div key={k}><label className="label">{l}</label><ImageInput value={vals[k] ?? ''} folder="brand" onChange={(v) => setVals({ ...vals, [k]: v })} /></div>)}
        </div>
      </div>
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="text-xl font-extrabold">Textos e información</h2>
        <div className="mt-5 space-y-4">
          {TEXTS.map(([k, l, long]) => (
            <div key={k}><label className="label">{l}</label>
              {long ? <textarea className="input min-h-[80px]" value={vals[k] ?? ''} onChange={(e) => setVals({ ...vals, [k]: e.target.value })} />
                : <input className="input" value={vals[k] ?? ''} onChange={(e) => setVals({ ...vals, [k]: e.target.value })} />}
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-2 flex items-center gap-3"><button className="btn-primary" onClick={save}>Guardar cambios</button>{msg && <span className="text-sm">{msg}</span>}</div>
    </div>
  );
}
