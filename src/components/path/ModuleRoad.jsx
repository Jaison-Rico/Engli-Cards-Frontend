import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, ClipPath, Rect, G } from 'react-native-svg';
import { Typography } from 'heroui-native';
import PathNode from './PathNode';
import { labelBands } from './pathGeometry';
import { elevation } from '../../theme/theme';

/* ----------------------------- Geometría ----------------------------- */

const BANNER_H = 84;
const FIRST_NODE = BANNER_H + 78;
const STEP = 114;
const END_PAD = 78;

/**
 * Y por debajo de la cual el camino es visible. Todo lo que queda por encima
 * (y <= BANNER_H) lo tapa el cartel del módulo, que es opaco y va dibujado
 * después. El camino se recorta con un <Rect> para que ni su extremo
 * redondeado asome por encima del módulo.
 */
const ROAD_TOP = BANNER_H;

export const sectionHeight = (nodeCount) => FIRST_NODE + (nodeCount - 1) * STEP + END_PAD;
export const nodeLocalY = (i) => FIRST_NODE + i * STEP;

/**
 * X del camino en función de la Y GLOBAL (acumulada entre módulos). Al ser una
 * función continua, cada sección dibuja su trozo y el camino empalma sin
 * cortes entre módulos. Dos senos de periodo distinto dan una curva
 * irregular, menos "de plantilla" que un zig-zag.
 */
export const roadX = (globalY, width) => {
  const amp = Math.min(width * 0.27, 100);
  return width / 2 + amp * (0.78 * Math.sin(globalY / 185) + 0.22 * Math.sin(globalY / 67 + 1.7));
};

const roadPath = (fromY, toY, offsetY, width) => {
  if (toY <= fromY) return '';
  let d = '';
  for (let y = fromY; y <= toY; y += 6) {
    d += `${d ? ' L' : 'M'} ${roadX(offsetY + y, width).toFixed(1)} ${y}`;
  }
  return `${d} L ${roadX(offsetY + toY, width).toFixed(1)} ${toY}`;
};

/**
 * Camino troceado: devuelve un array de tramos, cada uno con su `d`. Los
 * tramos excluyen las bandas de etiqueta, de forma que la línea entra y sale
 * de cada palabra en vez de tacharla.
 */
export const roadSegments = (nodeCount, nodeSizes, offsetY, width, fromY, toY) => {
  const bands = labelBands(nodeLocalY, nodeSizes);

  const segments = [];
  let cursor = fromY;

  for (const band of bands) {
    // La banda cae fuera del tramo que estamos pintando.
    if (band.y0 >= toY) break;
    if (band.y1 <= fromY) continue;

    // Tramo anterior a la banda: el camino baja hasta la palabra.
    const head = roadPath(cursor, Math.max(cursor, band.y0), offsetY, width);
    if (head) segments.push({ d: head, y0: cursor, y1: band.y0 });

    // La banda se salta: aquí va la palabra.
    cursor = Math.max(cursor, band.y1);
  }

  // Tramo final, desde la última etiqueta hasta el final de la sección.
  const tail = roadPath(cursor, toY, offsetY, width);
  if (tail) segments.push({ d: tail, y0: cursor, y1: toY });
  return segments;
};

/* ------------------------------ Sección ------------------------------ */

/**
 * Un módulo del camino: cartel con nivel/progreso (el camino pasa por
 * debajo) y sus nodos sobre una carretera con borde y grosor.
 *
 * @param offsetY    Y global donde empieza esta sección
 * @param progressY  Y global hasta donde llega el tramo recorrido
 */
function ModuleRoad({ module, width, offsetY, progressY, palette, onPressNode }) {
  const height = sectionHeight(module.nodes.length);
  const localProgress = Math.max(0, Math.min(height, progressY - offsetY));

  const { done, nodes, segments, doneSegments } = useMemo(() => {
    const sizes = module.nodes.map((n) => (n.type === 'boss' ? 76 : n.status === 'current' ? 72 : 64));
    return {
      done: localProgress > ROAD_TOP,
      doneSegments: localProgress > ROAD_TOP
        ? roadSegments(module.nodes.length, sizes, offsetY, width, ROAD_TOP, localProgress)
        : [],
      segments: roadSegments(module.nodes.length, sizes, offsetY, width, ROAD_TOP, height),
      nodes: module.nodes.map((node, i) => ({ node, x: roadX(offsetY + nodeLocalY(i), width), y: nodeLocalY(i) })),
    };
  }, [module.nodes, height, offsetY, width, localProgress]);

  // Id único por sección: se renderizan varias en la misma lista y un id
  // repetido haría que el clip se resolviera contra el <ClipPath> equivocado.
  const clipId = `roadClip-${module.id}`;

  const pct = module.completed / module.nodes.length;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Recorta el camino para que no asome por encima del cartel */}
        <Defs>
          <ClipPath id={clipId}>
            <Rect x={0} y={ROAD_TOP} width={width} height={height - ROAD_TOP} />
          </ClipPath>
        </Defs>
        <G clipPath={`url(#${clipId})`}>
          {/* Camino troceado: cada tramo se detiene en la banda de una
              etiqueta y continúa después, de modo que la palabra queda
              enhebrada en el camino. Los topes de los tramos son rectos
              (butt) para que no sobresalgan bajo la palabra. */}
          {segments.map((seg, i) => (
            <G key={`seg-${i}`}>
              <Path d={seg.d} stroke={palette.roadDepth} strokeWidth={30} strokeLinecap="butt" strokeLinejoin="round" fill="none" transform="translate(0,5)" />
              <Path d={seg.d} stroke={palette.roadEdge} strokeWidth={30} strokeLinecap="butt" strokeLinejoin="round" fill="none" />
              <Path d={seg.d} stroke={palette.road} strokeWidth={24} strokeLinecap="butt" strokeLinejoin="round" fill="none" />
            </G>
          ))}
          {/* Tramo recorrido (también troceado para no tachar las palabras) */}
          {done ? (
            <>
              {doneSegments.map((seg, i) => (
                <Path key={`done-${i}`} d={seg.d} stroke={palette.primarySoft} strokeWidth={24} strokeLinecap="butt" strokeLinejoin="round" fill="none" />
              ))}
              {doneSegments.map((seg, i) => (
                <Path key={`done-c-${i}`} d={seg.d} stroke={palette.primary} strokeWidth={6} strokeLinecap="butt" strokeLinejoin="round" fill="none" />
              ))}
            </>
          ) : null}
        </G>
      </Svg>

      {/* Cartel del módulo: el camino pasa por debajo */}
      <View style={[styles.banner, { backgroundColor: palette.surface, borderColor: palette.border }, elevation(1, palette.mode)]}>
        <View style={styles.bannerRow}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Typography type="body-xs" weight="bold" style={{ color: palette.primary, letterSpacing: 0.8 }}>
              MÓDULO {String(module.index + 1).padStart(2, '0')} · {module.level}
            </Typography>
            <Typography type="body" weight="bold" numberOfLines={1} style={{ color: palette.foreground, marginTop: 2 }}>
              {module.title}
            </Typography>
            <Typography type="body-xs" numberOfLines={1} style={{ color: palette.muted }}>
              {module.subtitle} · {module.words.length} palabras
            </Typography>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Typography type="body-sm" weight="bold" style={{ color: pct === 1 ? palette.primary : palette.foreground }}>
              {module.completed}/{module.nodes.length}
            </Typography>
            <View style={[styles.track, { backgroundColor: palette.primarySoft }]}>
              <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: palette.primary }]} />
            </View>
          </View>
        </View>
      </View>

      {nodes.map(({ node, x, y }) => (
        <PathNode key={node.id} node={node} x={x} y={y} palette={palette} onPress={onPressNode} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    // El cartel arranca en 0 y cubre toda la altura de BANNER_H: así tapa
    // por completo el arranque del camino de esta seccion (que se dibuja
    // desde y=0) y el tramo no asoma por encima del modulo.
    top: 0,
    left: 0,
    right: 0,
    height: BANNER_H,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  bannerRow: { flexDirection: 'row', alignItems: 'center' },
  track: { width: 64, height: 6, borderRadius: 6, marginTop: 6, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 6 },
});

export default memo(ModuleRoad);
