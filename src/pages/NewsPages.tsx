import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAsync } from '../lib/useQuery';
import type { News } from '../lib/types';
import { NewsCard } from './Home';

export function NewsList() {
  const news = useAsync<News[]>(() => supabase.from('news').select('*').eq('is_published', true).order('published_at', { ascending: false }));
  return (
    <div className="container-x py-14">
      <span className="eyebrow">Novedades</span>
      <h1 className="section-title">Noticias CIPRO</h1>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{news.data?.map((n) => <NewsCard key={n.id} n={n} />)}</div>
    </div>
  );
}

export function NewsDetail() {
  const { slug } = useParams();
  const n = useAsync<News>(() => supabase.from('news').select('*').eq('slug', slug!).maybeSingle(), [slug]);
  if (n.loading) return <div className="container-x py-20">Cargando…</div>;
  if (!n.data) return <div className="container-x py-20">Noticia no encontrada.</div>;
  const d = n.data;
  return (
    <article className="container-x max-w-3xl py-14">
      <Link to="/noticias" className="text-sm font-semibold text-brand-600">← Noticias</Link>
      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-brand-600">{d.category} · {d.published_at && new Date(d.published_at).toLocaleDateString('es-PE', { dateStyle: 'long' })}</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight">{d.title}</h1>
      {d.excerpt && <p className="mt-4 text-lg text-ink/65">{d.excerpt}</p>}
      {d.cover_url && <img src={d.cover_url} alt="" className="mt-8 w-full rounded-3xl" />}
      <div className="mt-8 whitespace-pre-line leading-relaxed text-ink/80">{d.body}</div>
    </article>
  );
}
