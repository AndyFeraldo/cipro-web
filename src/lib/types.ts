export type Period = { id: string; code: string; label: string | null; is_current: boolean; starts_on: string | null; ends_on: string | null };
export type Area = { id: string; slug: string; name: string; short_name: string | null; description: string | null; icon: string | null; sort_order: number; is_active: boolean };
export type Member = {
  id: string; full_name: string; career: string | null; photo_url: string | null; linkedin_url: string | null; bio: string | null; is_active: boolean;
  user_id?: string | null; university_code?: string | null; is_working?: boolean; company?: string | null; job_title?: string | null;
  joined_on?: string | null; photos?: string[]; status?: 'pendiente' | 'aprobado' | 'rechazado';
};
export type Role = 'past_president' | 'presidencia' | 'vicepresidencia' | 'coordinador' | 'project_leader' | 'mentor' | 'miembro' | 'entry_member' | 'alumni';
export type Membership = { id: string; member_id: string; period_id: string; area_id: string | null; role: Role; position_title: string | null; sort_order: number; members?: Member };
export type News = { id: string; slug: string; title: string; excerpt: string | null; body: string | null; cover_url: string | null; category: string | null; published_at: string | null; is_published: boolean };
export type Project = { id: string; slug: string; name: string; summary: string | null; description: string | null; category: 'LIGHT' | 'STANDARD' | 'STRATEGIC' | null; status: 'planificado' | 'en_curso' | 'cerrado'; cover_url: string | null; period_id: string | null; is_featured: boolean; is_published: boolean; sort_order: number };
export type Alliance = { id: string; name: string; kind: string | null; logo_url: string | null; website_url: string | null; description: string | null; since: string | null; sort_order: number; is_published: boolean };
export type GalleryItem = { id: string; title: string | null; image_url: string; event_date: string | null; period_id: string | null; sort_order: number };

export const ROLE_LABEL: Record<Role, string> = {
  past_president: 'Past President', presidencia: 'Presidencia', vicepresidencia: 'Vicepresidencia', coordinador: 'Coordinación', project_leader: 'Project Leader',
  mentor: 'Mentor Cipriano', miembro: 'Cipriano Activo', entry_member: 'Entry Member', alumni: 'Alumni',
};
export const ROLE_ORDER: Role[] = ['presidencia', 'vicepresidencia', 'past_president', 'coordinador', 'project_leader', 'mentor', 'miembro', 'entry_member', 'alumni'];

export const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre'];
/** '2025-08-01' -> 'agosto 2025' */
export const monthYear = (d?: string | null) => (d ? `${MONTHS[Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}` : '');
