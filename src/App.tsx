import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation, Outlet } from 'react-router-dom';
import { SettingsProvider } from './lib/settings';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Members from './pages/Members';
import { NewsDetail, NewsList } from './pages/NewsPages';
import MemberAccess from './pages/MemberAccess';
import AdminLayout from './pages/admin/AdminLayout';
import MyProfile from './pages/MyProfile';
import PublicProfile from './pages/PublicProfile';
import Gallery from './pages/Gallery';
import AcademyHome from './pages/academy/AcademyHome';
import CoursePage from './pages/academy/CoursePage';
import LessonPage from './pages/academy/LessonPage';
import Certificate, { Verify } from './pages/academy/Certificate';
import { SessionProvider } from './lib/session';
import { ScrollProgress } from './components/Motion';

function ScrollHandler() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 80);
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}
function PublicLayout() {
  const { pathname } = useLocation();
  return <><ScrollProgress /><Navbar /><main key={pathname} className="page-enter"><Outlet /></main><Footer /></>;
}

export default function App() {
  return (
    <SessionProvider>
    <SettingsProvider>
      <BrowserRouter>
        <ScrollHandler />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/integrantes" element={<Members />} />
            <Route path="/galeria" element={<Gallery />} />
            <Route path="/academia" element={<AcademyHome />} />
            <Route path="/academia/verificar" element={<Verify />} />
            <Route path="/academia/:course" element={<CoursePage />} />
            <Route path="/academia/:course/:lesson" element={<LessonPage />} />
            <Route path="/noticias" element={<NewsList />} />
            <Route path="/noticias/:slug" element={<NewsDetail />} />
            <Route path="/acceso" element={<MemberAccess />} />
            <Route path="/mi-perfil" element={<MyProfile />} />
            <Route path="/cipriano/:id" element={<PublicProfile />} />
          </Route>
          <Route path="/admin" element={<AdminLayout />} />
          <Route path="/academia/certificado/:code" element={<Certificate />} />
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
    </SessionProvider>
  );
}
