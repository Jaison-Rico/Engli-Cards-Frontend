import { Easing, FadeInDown } from 'react-native-reanimated';

/**
 * Sistema de movimiento único de la app. Todas las animaciones toman sus
 * curvas de aquí para que la sensación sea consistente: rápida, sin rebotes
 * exagerados y con desaceleración natural.
 */

/** Curvas (cubic-bezier). */
export const EASE = {
  /** Salida suave: entradas y barras de progreso. */
  out: Easing.bezier(0.22, 1, 0.36, 1),
  /** Entrada-salida: giros y transiciones de estado. */
  inOut: Easing.bezier(0.45, 0, 0.2, 1),
  /** Lineal: temporizadores (Supervivencia). */
  linear: Easing.linear,
};

/** Duraciones en ms. */
export const DURATION = {
  instant: 90,
  fast: 160,
  base: 240,
  flip: 420,
  progress: 600,
};

/** Muelles. `snappy` está casi críticamente amortiguado (sin rebote visible). */
export const SPRING = {
  snappy: { damping: 28, stiffness: 400, mass: 0.5 },
  /** Para tarjetas arrastradas que vuelven a su sitio: un rebote mínimo. */
  settle: { damping: 20, stiffness: 260, mass: 0.7 },
};

/** Entrada escalonada estándar para listas y secciones. */
export const enterStagger = (index = 0, step = 40) =>
  FadeInDown.delay(index * step).springify().damping(38).stiffness(360);
