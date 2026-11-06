import type { Pose } from '../components/Scrummy';

export type Block =
  | { t: 'p'; text: string }
  | { t: 'h'; text: string }
  | { t: 'list'; items: string[] }
  | { t: 'steps'; items: [string, string][] }
  | { t: 'cards'; items: [string, string][] }
  | { t: 'table'; head: string[]; rows: string[][] }
  | { t: 'tip'; pose?: Pose; title: string; text: string }
  | { t: 'key'; text: string };

export type Question = { q: string; options: string[] };
export type Lesson = { slug: string; title: string; minutes: number; summary: string; blocks: Block[]; quiz?: Question[] };
export type Course = {
  slug: string; title: string; subtitle: string; level: 'Inicial' | 'Intermedio' | 'Avanzado'; hours: number;
  pose: Pose; accent: string; status: 'disponible' | 'pronto'; outcomes: string[];
  lessons: Lesson[]; final: Question[];
};
export const FINAL_SLUG = 'examen-final';
export const FINAL_PASS = 70;
export const LESSON_PASS = 60;
