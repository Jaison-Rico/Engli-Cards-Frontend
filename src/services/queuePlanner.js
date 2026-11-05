/**
 * Reglas de compactación de la cola offline (función pura, sin SQLite).
 *
 * Recibe las operaciones ya encoladas para la MISMA entidad (mismo tipo y mismo
 * ID, en orden) y la nueva operación. Devuelve qué filas borrar, cuáles
 * actualizar y si hay que insertar la nueva:
 *
 *   crear + editar   → un solo "crear" con los datos finales
 *   crear + borrar   → nada (el servidor nunca supo de la entidad)
 *   editar + editar  → un solo "editar" con los datos combinados
 *   editar + borrar  → solo "borrar"
 */
export const isTemporaryId = (id) => String(id ?? '').startsWith('offline-');

export const createTemporaryId = () =>
  `offline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function planQueueChange(existing, change) {
  const plan = { remove: [], update: [], insert: false, cancelledCreate: false };
  const pendingCreate = existing.find((row) => row.operation === 'create');
  const pendingUpdates = existing.filter((row) => row.operation === 'update');

  switch (change.operation) {
    case 'create':
      plan.insert = true;
      break;

    case 'update':
      if (pendingCreate) {
        plan.update.push({ id: pendingCreate.id, payload: { ...pendingCreate.payload, ...change.payload } });
      } else if (pendingUpdates.length > 0) {
        const merged = pendingUpdates.reduce((acc, row) => ({ ...acc, ...row.payload }), {});
        const [keep, ...rest] = pendingUpdates;
        plan.update.push({ id: keep.id, payload: { ...merged, ...change.payload } });
        plan.remove.push(...rest.map((row) => row.id));
      } else if (!isTemporaryId(change.entityId)) {
        plan.insert = true;
      }
      break;

    case 'delete':
      plan.remove.push(...existing.map((row) => row.id));
      if (pendingCreate) {
        plan.cancelledCreate = true;
      } else if (!isTemporaryId(change.entityId)) {
        plan.insert = true;
      }
      break;

    default:
      throw new Error(`Operación offline desconocida: ${change.operation}`);
  }

  return plan;
}
