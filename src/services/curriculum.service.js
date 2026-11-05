import { seedCurriculum, getCurriculum, getNodeProgress, saveNodeResult } from './localDatabase';
import { MODULES, NODE_PLAN, CURRICULUM_VERSION, PASS_ACCURACY } from '../data/curriculum';
import { normalizeCard } from './learning.service';

/**
 * Plan de estudios del mapa, 100% local (SQLite):
 *  - `ensureCurriculumSeeded` siembra los 15 módulos / 210 tarjetas una sola
 *    vez por versión (idempotente, en una transacción).
 *  - `getCurriculumMap` arma módulos → nodos con su estado. El desbloqueo es
 *    secuencial: solo el primer nodo sin completar está disponible.
 *  - `completeNode` guarda el intento y decide si aprueba según el tipo.
 */

let seedPromise = null;

export const ensureCurriculumSeeded = () => {
  if (!seedPromise) {
    seedPromise = seedCurriculum(CURRICULUM_VERSION, MODULES).catch((error) => {
      seedPromise = null; // permite reintentar
      throw error;
    });
  }
  return seedPromise;
};

export const nodeIdOf = (moduleId, slug) => `${moduleId}:${slug}`;

const starsFor = (accuracy) => (accuracy >= 0.95 ? 3 : accuracy >= 0.85 ? 2 : 1);

/** Tarjetas normalizadas de un nodo. */
const cardsForNode = (moduleId, words, [from, to]) =>
  words.slice(from, to).map(([front, back]) => normalizeCard({ front, back }, `module:${moduleId}`)).filter(Boolean);

/**
 * @returns {Promise<{ modules: Array, totalNodes: number, doneNodes: number, currentNodeId: string|null }>}
 */
export const getCurriculumMap = async (userId) => {
  await ensureCurriculumSeeded();
  const [modules, progressRows] = await Promise.all([getCurriculum(), userId ? getNodeProgress(userId) : []]);
  const progress = new Map(progressRows.map((r) => [r.node_id, r]));

  let currentNodeId = null;
  let doneNodes = 0;
  let totalNodes = 0;

  const result = modules.map((mod, moduleIndex) => {
    const nodes = NODE_PLAN.map((plan) => {
      const id = nodeIdOf(mod.id, plan.slug);
      const row = progress.get(id);
      const done = Boolean(row?.completed);
      let status = 'locked';
      if (done) status = 'done';
      else if (!currentNodeId) { status = 'current'; currentNodeId = id; }
      totalNodes += 1;
      if (done) doneNodes += 1;
      return {
        id,
        moduleId: mod.id,
        type: plan.type,
        title: plan.title,
        status,
        accuracy: row?.best_accuracy ?? 0,
        stars: done ? starsFor(row?.best_accuracy ?? 1) : 0,
        cards: cardsForNode(mod.id, mod.words, plan.cards),
      };
    });
    const completed = nodes.filter((n) => n.status === 'done').length;
    return { ...mod, index: moduleIndex, nodes, completed };
  });

  return { modules: result, totalNodes, doneNodes, currentNodeId };
};

/**
 * Registra el resultado de un nodo.
 * @returns {Promise<boolean>} si el nodo quedó aprobado.
 */
export const completeNode = async (userId, nodeId, type, accuracy) => {
  if (!userId || !nodeId) return false;
  const passed = accuracy >= (PASS_ACCURACY[type] ?? 0);
  try {
    await saveNodeResult(userId, nodeId, accuracy, passed);
  } catch (e) {
    if (__DEV__) console.warn('No se pudo guardar el progreso del nodo:', e?.message ?? e);
  }
  return passed;
};
