import { useSettings } from '../lib/settings';

export default function Logo({ dark = false, className = 'h-9' }: { dark?: boolean; className?: string }) {
  const { settings } = useSettings();
  const src = dark ? settings.logo_dark_url || settings.logo_url : settings.logo_url;
  if (src) return <img src={src} alt="CIPRO" className={`w-auto ${className}`} />;
  return (
    <span className={`flex items-center gap-2 font-display font-extrabold tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-lg text-white">C</span>
      <span className="text-xl">CIPRO</span>
    </span>
  );
}
