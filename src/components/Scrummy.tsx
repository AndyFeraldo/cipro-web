import { useSettings } from '../lib/settings';

export type Pose = 'saludando' | 'chica-saludando' | 'frente' | 'lado' | 'espalda';

/** Scrummy, el castor de CIPRO (renders oficiales recortados). El admin puede reemplazar la pose principal. */
export default function Scrummy({ className = '', pose = 'saludando' }: { className?: string; pose?: Pose; wave?: boolean }) {
  const { settings } = useSettings();
  const src = pose === 'saludando' && settings.mascot_url ? settings.mascot_url : `/brand/scrummy-${pose}.webp`;
  return <img src={src} alt="Scrummy, la mascota de CIPRO" className={`object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,.18)] ${className}`} loading="lazy" />;
}
