import { Sparkles, Apple, Users, Briefcase, School, Plane, Palette, Dog } from 'lucide-react-native';

import greetingsData from './images/greetings.json';
import fruitsData from './images/fruits.json';
import familyData from './images/family.json';
import workData from './images/work.json';
import schoolData from './images/school.json';
import travelData from './images/travel.json';

/**
 * Contenido local de cada lección del sistema (nombre en inglés o español,
 * tal como lo devuelve el backend). Lo comparten el mapa de progreso y los
 * minijuegos.
 */
export const LESSONS = {
  Greetings: { cards: greetingsData, quiz: 'Greetings', icon: Sparkles },
  Fruits: { cards: fruitsData, quiz: 'Fruits', icon: Apple },
  Family: { cards: familyData, quiz: 'Family', icon: Users },
  Familia: { cards: familyData, quiz: 'Family', icon: Users },
  Work: { cards: workData, quiz: 'Work', icon: Briefcase },
  Trabajo: { cards: workData, quiz: 'Work', icon: Briefcase },
  School: { cards: schoolData, quiz: 'School', icon: School },
  Escuela: { cards: schoolData, quiz: 'School', icon: School },
  Travel: { cards: travelData, quiz: 'Travel', icon: Plane },
  Viajes: { cards: travelData, quiz: 'Travel', icon: Plane },
  Colores: { icon: Palette },
  Animales: { icon: Dog },
};

/** Lecciones con tarjetas, sin duplicados (para el selector de minijuegos). */
export const PLAYABLE_LESSONS = [
  { name: 'Greetings', label: 'Saludos', cards: greetingsData, icon: Sparkles },
  { name: 'Fruits', label: 'Frutas', cards: fruitsData, icon: Apple },
  { name: 'Family', label: 'Familia', cards: familyData, icon: Users },
  { name: 'Work', label: 'Trabajo', cards: workData, icon: Briefcase },
  { name: 'School', label: 'Escuela', cards: schoolData, icon: School },
  { name: 'Travel', label: 'Viajes', cards: travelData, icon: Plane },
];
