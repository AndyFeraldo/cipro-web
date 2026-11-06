import { useSettings } from '../lib/settings';

/** Muestra a Scrummy. Si en el panel admin se subió la imagen oficial, usa esa; si no, una ilustración temporal. */
export default function Scrummy({ className = '', wave = false }: { className?: string; wave?: boolean }) {
  const { settings } = useSettings();
  if (settings.mascot_url) return <img src={settings.mascot_url} alt="Scrummy, la mascota de CIPRO" className={`object-contain ${className}`} />;
  return (
    <svg viewBox="0 0 220 240" className={className} role="img" aria-label="Scrummy, la mascota de CIPRO">
      <ellipse cx="110" cy="228" rx="62" ry="8" fill="#000" opacity=".08" />
      {/* cola */}
      <ellipse cx="170" cy="190" rx="30" ry="16" fill="#7A3E1C" transform="rotate(-30 170 190)" />
      <path d="M150 196 l40 -24 M155 202 l40 -24" stroke="#5E2E14" strokeWidth="2" opacity=".5" />
      {/* cuerpo */}
      <ellipse cx="110" cy="170" rx="54" ry="56" fill="#B8662E" />
      <ellipse cx="110" cy="182" rx="34" ry="38" fill="#FFD9BF" />
      {/* polo naranja */}
      <path d="M62 160 q48 22 96 0 v20 q-48 22 -96 0z" fill="#F26B1D" />
      <text x="110" y="183" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" fontFamily="Plus Jakarta Sans, Arial">CIPRO</text>
      {/* brazo saludando */}
      <g className={wave ? 'origin-[160px_150px] animate-wave' : ''}>
        <path d="M156 150 q26 -20 30 -50" stroke="#B8662E" strokeWidth="16" strokeLinecap="round" fill="none" />
        <circle cx="186" cy="98" r="11" fill="#B8662E" />
      </g>
      <path d="M64 150 q-18 18 -14 40" stroke="#B8662E" strokeWidth="16" strokeLinecap="round" fill="none" />
      {/* cabeza */}
      <circle cx="68" cy="58" r="14" fill="#B8662E" /><circle cx="68" cy="58" r="7" fill="#FFB993" />
      <circle cx="152" cy="58" r="14" fill="#B8662E" /><circle cx="152" cy="58" r="7" fill="#FFB993" />
      <ellipse cx="110" cy="92" rx="50" ry="46" fill="#C9763A" />
      <ellipse cx="110" cy="112" rx="28" ry="20" fill="#FFD9BF" />
      <circle cx="90" cy="86" r="7" fill="#111" /><circle cx="92" cy="84" r="2.4" fill="#fff" />
      <circle cx="130" cy="86" r="7" fill="#111" /><circle cx="132" cy="84" r="2.4" fill="#fff" />
      <ellipse cx="110" cy="102" rx="8" ry="6" fill="#3B1D0E" />
      <path d="M100 112 q10 8 20 0" stroke="#3B1D0E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="104" y="114" width="12" height="11" rx="2" fill="#fff" stroke="#E7D3C4" />
      <line x1="110" y1="114" x2="110" y2="125" stroke="#E7D3C4" />
      <circle cx="78" cy="104" r="6" fill="#F26B1D" opacity=".35" /><circle cx="142" cy="104" r="6" fill="#F26B1D" opacity=".35" />
    </svg>
  );
}
