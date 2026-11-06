import { useSettings } from '../lib/settings';

/** Logo oficial (wordmark del archivo madre). Se puede reemplazar desde el panel admin (Marca y textos). */
export default function Logo({ dark = false, className = 'h-8', tagline = false }: { dark?: boolean; className?: string; tagline?: boolean }) {
  const { settings } = useSettings();
  const custom = dark ? settings.logo_dark_url : settings.logo_url;
  const src = custom || (tagline ? (dark ? '/brand/logo-light.png' : '/brand/logo-dark.png') : (dark ? '/brand/wordmark-light.png' : '/brand/wordmark-dark.png'));
  return <img src={src} alt="CIPRO" className={`w-auto ${className}`} />;
}
