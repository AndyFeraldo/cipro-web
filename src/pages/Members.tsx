import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAsync } from '../lib/useQuery';
import { ROLE_ORDER, type Area, type Membership, type Period } from '../lib/types';
import MemberCard from '../components/MemberCard';
import Scrummy from '../components/Scrummy';

export default function Members() {
  const [params, setParams] = useSearchParams();
  const periods = useAsync<Period[]>(() => supabase.from('periods').select('*').order('code', { ascending: false }));
  const areas = useAsync<Area[]>(() => supabase.from('areas').select('*').order('sort_order'));
  const [periodId, setPeriodId] = useState<string>('');
  const areaSlug = params.get('area') || '';

  useEffect(() => {
    if (!periodId && periods.data?.length) {
      const wanted = params.get('ciclo');
      setPeriodId((periods.data.find((p) => p.code === wanted) || periods.data.find((p) => p.is_current) || periods.data[0]).id);
    }
  }, [periods.data, periodId, params]);

  const ms = useAsync<Membership[]>(
    () => (periodId ? supabase.from('memberships').select('*, members(*)').eq('period_id', periodId).order('sort_order') : Promise.resolve({ data: [], error: null })),
    [periodId],
  );

  const grouped = useMemo(() => {
    const list = (ms.data || []).filter((m) => m.members && m.members.is_active !== false);
    const byArea = (areas.data || [])
      .filter((a) => !areaSlug || a.slug === areaSlug)
      .map((a) => ({
        area: a,
        people: list.filter((m) => m.area_id === a.id).sort((x, y) => ROLE_ORDER.indexOf(x.role) - ROLE_ORDER.indexOf(y.role) || x.sort_order - y.sort_order),
      }))
      .filter((g) => g.people.length);
    const noArea = list.filter((m) => !m.area_id);
    if (!areaSlug && noArea.length) byArea.push({ area: { id: 'none', slug: 'otros', name: 'Más integrantes', short_name: null, description: null, icon: null, sort_order: 99, is_active: true }, people: noArea.sort((x, y) => ROLE_ORDER.indexOf(x.role) - ROLE_ORDER.indexOf(y.role) || x.sort_order - y.sort_order) });
    return byArea;
  }, [ms.data, areas.data, areaSlug]);

  const current = periods.data?.find((p) => p.id === periodId);

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden bg-cream-gradient py-14">
        <div className="container-x flex flex-wrap items-center justify-between gap-6">
          <div>
            <span className="eyebrow">Equipo</span>
            <h1 className="section-title">Integrantes {current?.code}</h1>
            <p className="mt-2 text-ink/60">Conoce a los ciprianos de cada ciclo, organizados por área.</p>
          </div>
          <Scrummy pose="frente" className="h-40" />
        </div>
        <div className="container-x mt-8 flex flex-wrap gap-3">
          <select className="input w-auto" value={periodId} onChange={(e) => { setPeriodId(e.target.value); const p = periods.data?.find((x) => x.id === e.target.value); if (p) { params.set('ciclo', p.code); setParams(params); } }}>
            {periods.data?.map((p) => <option key={p.id} value={p.id}>Ciclo {p.code}{p.is_current ? ' (actual)' : ''}</option>)}
          </select>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { params.delete('area'); setParams(params); }} className={`rounded-full px-4 py-2 text-sm font-semibold ${!areaSlug ? 'bg-brand text-white' : 'bg-white ring-1 ring-ink/10'}`}>Todas</button>
            {areas.data?.map((a) => (
              <button key={a.id} onClick={() => { params.set('area', a.slug); setParams(params); }} className={`rounded-full px-4 py-2 text-sm font-semibold ${areaSlug === a.slug ? 'bg-brand text-white' : 'bg-white ring-1 ring-ink/10'}`}>{a.short_name || a.name}</button>
            ))}
          </div>
        </div>
      </section>

      <div className="container-x space-y-14">
        {ms.loading && <p className="text-ink/50">Cargando…</p>}
        {!ms.loading && grouped.length === 0 && <p className="rounded-3xl bg-brand-50 p-8 text-center text-ink/60">Aún no hay integrantes registrados para este ciclo.</p>}
        {grouped.map(({ area, people }) => (
          <section key={area.id}>
            <div className="mb-5 flex items-baseline gap-3 border-b border-ink/10 pb-3">
              <h2 className="flex items-center gap-2 text-2xl font-extrabold"><span className="h-3 w-3 rounded-full bg-brand" />{area.name}</h2>
              <span className="text-sm text-ink/50">{people.length} {people.length === 1 ? 'integrante' : 'integrantes'}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {people.map((m) => m.members && <MemberCard key={m.id} member={m.members} title={m.position_title} />)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
