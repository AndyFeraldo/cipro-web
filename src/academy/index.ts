import type { Course } from './types';
import { fundamentos } from './fundamentos';
import { scrum } from './scrum';
import { documentos } from './documentos';

const soon = (c: Omit<Course, 'status' | 'lessons' | 'final'>): Course => ({ ...c, status: 'pronto', lessons: [], final: [] });

export const COURSES: Course[] = [
  fundamentos,
  scrum,
  documentos,
  soon({
    slug: 'ruta-capm', title: 'Ruta CAPM: las 10 áreas de conocimiento', level: 'Avanzado', hours: 12, pose: 'espalda', accent: '#F4A487',
    subtitle: 'Repaso área por área y simulacros para quienes se preparan para la certificación CAPM del PMI.',
    outcomes: ['Repasar integración, alcance, cronograma, costos, calidad, recursos, comunicaciones, riesgos, adquisiciones e interesados', 'Practicar con preguntas tipo examen'],
  }),
];
export const getCourse = (slug?: string) => COURSES.find((c) => c.slug === slug);
export * from './types';
