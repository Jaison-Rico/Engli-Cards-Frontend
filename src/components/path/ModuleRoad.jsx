import React, { memo, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Typography } from 'heroui-native';
import PathNode from './PathNode';
import { elevation } from '../../theme/theme';

/* ----------------------------- Geometría ----------------------------- */

const BANNER_H = 84;
const FIRST_NODE = BANNER_H + 78;
const STEP = 114;
const END_PAD = 70;

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

  const { road, done, nodes } = useMemo(() => ({
    road: roadPath(0, height, offsetY, width),
    done: roadPath(0, localProgress, offsetY, width),
    nodes: module.nodes.map((node, i) => ({ node, x: roadX(offsetY + nodeLocalY(i), width), y: nodeLocalY(i) })),
  }), [module.nodes, height, offsetY, width, localProgress]);

  const pct = module.completed / module.nodes.length;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Grosor (sombra del borde inferior), borde y calzada */}
        <Path d={road} stroke={palette.roadDepth} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(0,5)" />
        <Path d={road} stroke={palette.roadEdge} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d={road} stroke={palette.road} strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Tramo recorrido */}
        {done ? (
          <>
            <Path d={done} stroke={palette.primarySoft} strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d={done} stroke={palette.primary} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </>
        ) : null}
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
    top: 8,
    left: 0,
    right: 0,
    height: BANNER_H - 8,
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
