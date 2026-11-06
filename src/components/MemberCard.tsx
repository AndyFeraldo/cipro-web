import type { Member } from '../lib/types';
import Icon from './Icon';

export default function MemberCard({ member, title, big = false }: { member: Member; title?: string | null; big?: boolean }) {
  const initials = member.full_name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <div className={`group relative overflow-hidden rounded-3xl bg-white text-center shadow-sm ring-1 ring-ink/5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/15 ${big ? 'p-6' : 'p-4'}`}>
      <div className={`relative mx-auto overflow-hidden rounded-full ring-4 ring-brand-100 ${big ? 'h-36 w-36' : 'h-24 w-24'}`}>
        {member.photo_url ? (
          <img src={member.photo_url} alt={member.full_name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand-300 to-brand-600 font-display text-2xl font-bold text-white">{initials}</div>
        )}
      </div>
      <h4 className={`mt-3 font-bold leading-tight ${big ? 'text-lg' : 'text-sm'}`}>{member.full_name}</h4>
      {title && <p className="mt-0.5 text-xs font-semibold text-brand-600">{title}</p>}
      {member.career && <p className="mt-0.5 text-xs text-ink/55">{member.career}</p>}
      {member.linkedin_url && (
        <a href={member.linkedin_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#0A66C2] px-3 py-1 text-xs font-semibold text-white hover:opacity-90" aria-label={`LinkedIn de ${member.full_name}`}>
          <Icon name="linkedin" className="h-3.5 w-3.5" /> LinkedIn
        </a>
      )}
    </div>
  );
}
