import type { Course } from './types';
import { fundamentos } from './fundamentos';
import { scrum } from './scrum';

const soon = (c: Omit<Course, 'status' | 'lessons' | 'final'>): Course => ({ ...c, status: 'pronto', lessons: [], final: [] });

export const COURSES: Course[] = [
  fundamentos,
  scrum,
  soon({
    slug: 'documentos-del-proyecto', title: 'Documentos del proyecto paso a paso', level: 'Intermedio', hours: 5, pose: 'chica-saludando', accent: '#FD8A55',
    subtitle: 'Llena con plantillas CIPRO el Business Case, el Acta, la EDT, el cronograma, la RACI y el informe de cierre.',
    outcomes: ['Usar las plantillas oficiales de la PMO CIPRO', 'Documentar proyectos LIGHT, STANDARD y STRATEGIC', 'Preparar el expediente de cierre'],
  }),
  soon({
    slug: 'ruta-capm', title: 'Ruta CAPM: las 10 áreas de conocimiento', level: 'Avanzado', hours: 12, pose: 'espalda', accent: '#F4A487',
    subtitle: 'Repaso área por área y simulacros para quienes se preparan para la certificación CAPM del PMI.',
    outcomes: ['Repasar integración, alcance, cronograma, costos, calidad, recursos, comunicaciones, riesgos, adquisiciones e interesados', 'Practicar con preguntas tipo examen'],
  }),
];
export const getCourse = (slug?: string) => COURSES.find((c) => c.slug === slug);
export * from './types';
