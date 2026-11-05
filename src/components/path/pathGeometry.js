/**
 * Geometría compartida entre el camino (`ModuleRoad`) y sus nodos
 * (`PathNode`). Vive en su propio archivo para que ambos módulos puedan
 * importarla sin ciclo de imports.
 *
 * La idea: cada nombre de nodo (p. ej. "Aprende I") ocupa una banda vertical
 * reservada en el camino. El camino se dibuja en tramos y se interrumpe justo
 * en esa banda, así la palabra queda "enhebrada": el tramo de arriba baja
 * hasta la palabra y el de abajo sale de ella hacia el nodo siguiente.
 */

/** Margen entre la base del nodo y el inicio de la banda de su nombre. */
export const LABEL_GAP = 8;

/** Alto de la banda reservada para el nombre del nodo. */
export const LABEL_HEIGHT = 22;

/** Grosor de la base del nodo (la ficha tiene "canto" debajo). */
export const NODE_DEPTH = 7;

/** Datos de la banda de etiqueta, agrupados por convenience. */
export const LABEL = {
  gap: LABEL_GAP,
  height: LABEL_HEIGHT,
  depth: NODE_DEPTH,
};

/**
 * Inicio de la banda de etiqueta de un nodo, en la misma coordenada Y que
 * usa `ModuleRoad` para situarlo (Y local de la sección).
 *
 * @param nodeY  Y local del nodo
 * @param size   lado de la ficha del nodo
 */
export const labelTop = (nodeY, size) => nodeY + size / 2 + NODE_DEPTH + LABEL_GAP;

/**
 * Bandas de etiqueta de todos los nodos de la sección, ordenadas por Y.
 * Son los huecos donde el camino no se dibuja.
 */
export const labelBands = (nodeLocalY, nodeSizes) => {
  const bands = [];
  for (let i = 0; i < nodeSizes.length; i += 1) {
    const top = labelTop(nodeLocalY(i), nodeSizes[i]);
    bands.push({ y0: top, y1: top + LABEL_HEIGHT });
  }
  return bands.sort((a, b) => a.y0 - b.y0);
};
