const paths: Record<string, string> = {
  crown: 'M3 7l4.5 4L12 4l4.5 7L21 7l-2 12H5L3 7z',
  compass: 'M12 2a10 10 0 100 20 10 10 0 000-20zm3.5 6.5l-2 5-5 2 2-5 5-2z',
  kanban: 'M4 4h4v16H4zM10 4h4v10h-4zM16 4h4v7h-4z',
  users: 'M16 11a3 3 0 100-6 3 3 0 000 6zM8 11a3 3 0 100-6 3 3 0 000 6zm0 2c-2.7 0-8 1.3-8 4v3h10v-3c0-1 .4-2 1.1-2.7C10.1 13.1 8.9 13 8 13zm8 0c-2.7 0-8 1.3-8 4v3h16v-3c0-2.7-5.3-4-8-4z',
  megaphone: 'M3 10v4h3l6 4V6L6 10H3zm13-3v10a5 5 0 000-10zm2 5c0-1.8-1-3.3-2.5-4v8c1.5-.7 2.5-2.2 2.5-4z',
  sparkles: 'M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6zm7 12l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z',
  linkedin: 'M4.98 3.5a2.5 2.5 0 11.02 5 2.5 2.5 0 01-.02-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.6 8.65 21 11.3 21 14.7V21h-4v-5.6c0-1.33-.03-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95V21H9z',
  instagram: 'M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 5a5 5 0 100 10 5 5 0 000-10zm6-1.5a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4zM12 9a3 3 0 110 6 3 3 0 010-6z',
  mail: 'M2 5h20v14H2zm2 2v.5l8 5 8-5V7l-8 5-8-5z',
  arrow: 'M5 12h12m-5-6l6 6-6 6',
  star: 'M12 2l2.6 7H22l-6 4.6 2.3 7.4L12 16.6 5.7 21l2.3-7.4L2 9h7.4z',
};
export default function Icon({ name, className = 'h-5 w-5' }: { name: string; className?: string }) {
  const stroke = name === 'arrow';
  return (
    <svg viewBox="0 0 24 24" className={className} fill={stroke ? 'none' : 'currentColor'} stroke={stroke ? 'currentColor' : undefined} strokeWidth={stroke ? 2 : undefined} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={paths[name] ?? paths.star} />
    </svg>
  );
}
