import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo';
import { isMemberEmail, useSession } from '../lib/session';

const Lock = ({ className = 'h-4 w-4' }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><rect x="4" y="11" width="16" height="10" rx="2.5" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>;

const links = [
  { to: '/#nosotros', label: 'Nosotros' },
  { to: '/#areas', label: 'Áreas' },
  { to: '/integrantes', label: 'Integrantes' },
  { to: '/#proyectos', label: 'Proyectos' },
  { to: '/#alianzas', label: 'Alianzas' },
  { to: '/noticias', label: 'Noticias' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { session } = useSession();
  const member = !!session && isMemberEmail(session.user.email);
  const cta = member ? { to: '/mi-perfil', label: 'Mi perfil' } : { to: '/acceso', label: 'Soy cipriano' };
  return (
    <header className="sticky top-0 z-40 border-b border-ink/5 bg-white/80 backdrop-blur-lg">
      <nav className="container-x flex h-16 items-center justify-between">
        <Link to="/" aria-label="Inicio"><Logo /></Link>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className="rounded-full px-3 py-2 text-sm font-medium text-ink/70 hover:bg-brand-50 hover:text-brand-700">{l.label}</NavLink>
          ))}
          <Link to={cta.to} className="btn-primary ml-2">{cta.label}</Link>
          <Link to="/admin" title="Panel de administración" aria-label="Panel de administración" className="ml-1 grid h-10 w-10 place-items-center rounded-full bg-ink text-white transition hover:bg-brand"><Lock /></Link>
        </div>
        <button className="rounded-lg p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Menú">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} /></svg>
        </button>
      </nav>
      {open && (
        <div className="border-t border-ink/5 bg-white md:hidden">
          <div className="container-x flex flex-col py-2">
            {links.map((l) => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="py-2.5 font-medium">{l.label}</Link>)}
            <Link to={cta.to} onClick={() => setOpen(false)} className="btn-primary mt-2">{cta.label}</Link>
            <Link to="/admin" onClick={() => setOpen(false)} className="btn-dark my-2"><Lock /> Panel admin</Link>
          </div>
        </div>
      )}
    </header>
  );
}
