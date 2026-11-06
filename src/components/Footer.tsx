import { Link } from 'react-router-dom';
import Logo from './Logo';
import Icon from './Icon';
import { useSettings } from '../lib/settings';
import { Constellation } from './Brand';

export default function Footer() {
  const { settings } = useSettings();
  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      <Constellation className="pointer-events-none absolute -right-10 top-0 w-96 opacity-40" />
      <div className="container-x relative grid gap-10 py-14 md:grid-cols-3">
        <div>
          <Logo dark tagline className="h-16" />
          <p className="mt-4 max-w-xs text-sm text-white/60">Círculo de Gestión de Proyectos · {settings.faculty || 'Facultad de Ingeniería de Sistemas'}.</p>
        </div>
        <div className="text-sm">
          <h4 className="mb-3 font-bold">Explora</h4>
          <ul className="space-y-2 text-white/70">
            <li><Link to="/#nosotros" className="hover:text-brand-400">Quiénes somos</Link></li>
            <li><Link to="/integrantes" className="hover:text-brand-400">Integrantes por ciclo</Link></li>
            <li><Link to="/noticias" className="hover:text-brand-400">Noticias</Link></li>
            <li><Link to="/galeria" className="hover:text-brand-400">Galería</Link></li>
            <li><Link to="/#scrummy" className="hover:text-brand-400">Conoce a Scrummy</Link></li>
            <li><Link to="/acceso" className="hover:text-brand-400">Soy cipriano · Ingresar</Link></li>
            <li><Link to="/acceso#registro" className="hover:text-brand-400">Registrarme como cipriano</Link></li>
            <li><Link to="/admin" className="hover:text-brand-400">🔒 Panel admin</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <h4 className="mb-3 font-bold">Conecta</h4>
          <div className="flex gap-3">
            {settings.instagram_url && <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 p-2.5 hover:bg-brand" aria-label="Instagram"><Icon name="instagram" /></a>}
            {settings.linkedin_url && <a href={settings.linkedin_url} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 p-2.5 hover:bg-brand" aria-label="LinkedIn"><Icon name="linkedin" /></a>}
            {settings.contact_email && <a href={`mailto:${settings.contact_email}`} className="rounded-full bg-white/10 p-2.5 hover:bg-brand" aria-label="Correo"><Icon name="mail" /></a>}
          </div>
          {settings.advisor_name && <p className="mt-4 text-white/60">Docente encargado: <span className="text-white">{settings.advisor_name}</span></p>}
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">© {new Date().getFullYear()} CIPRO · Hecho por ciprianos, con Scrummy 🦫</div>
    </footer>
  );
}
