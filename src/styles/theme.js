// Sistema de diseño centralizado para Engli Cards
// Solo estilos: no cambia lógica ni flujos
// Usa tabs para respetar la convención del repo

import { Appearance, Platform, StyleSheet } from 'react-native';

// Paletas en HSL (documentadas) y derivadas en strings válidos
const paletteLight = {
	primary: 'hsl(183, 45%, 65%)', // #7dcace Turquesa suave
	background: 'hsl(210, 50%, 98%)',
	foreground: 'hsl(210, 30%, 20%)',
	secondary: 'hsl(195, 50%, 90%)',
	accent: 'hsl(185, 65%, 55%)',
	muted: 'hsl(195, 30%, 95%)',
	mutedForeground: 'hsl(210, 20%, 50%)',
	border: 'hsl(195, 30%, 90%)',
	card: 'hsl(0, 0%, 100%)'
};

const paletteDark = {
	background: 'hsl(210, 30%, 10%)',
	foreground: 'hsl(210, 30%, 95%)',
	primary: 'hsl(195, 60%, 55%)',
	secondary: 'hsl(195, 30%, 20%)',
	card: 'hsl(210, 25%, 15%)',
	accent: 'hsl(185, 65%, 55%)',
	muted: 'hsla(0,0%,100%,0.06)',
	mutedForeground: 'hsl(210, 20%, 70%)',
	border: 'hsla(0,0%,100%,0.12)'
};

// Tokens
export const tokens = {
	radius: {
		lg: 24,
		md: 16,
		sm: 12
	},
	spacing: {
		xs: 6,
		sm: 10,
		md: 16,
		lg: 24,
		xl: 32
	},
	// Alturas/paddings comunes
	components: {
		buttonHeight: 44, // h-11
		buttonPaddingX: 32 // px-8
	},
	// Duraciones de animaciones/transiciones
	motion: {
		transition: 400,
		fadeIn: 600,
		slideUp: 800,
		float: 3000
	}
};

// Sombras (aproximación cross‑platform)
const turquoiseRGBA = 'rgba(125, 202, 206, 0.2)'; // desde #7dcace
export const shadows = {
	soft: Platform.select({
		ios: {
			shadowColor: turquoiseRGBA,
			shadowOffset: { width: 0, height: 10 },
			shadowOpacity: 1,
			shadowRadius: 20
		},
		android: { elevation: 8 }
	}),
	card: Platform.select({
		ios: {
			shadowColor: turquoiseRGBA,
			shadowOffset: { width: 0, height: 20 },
			shadowOpacity: 1,
			shadowRadius: 30
		},
		android: { elevation: 10 }
	})
};

// Gradientes (nombres para usar con expo-linear-gradient si se añade)
export const gradients = {
	hero: ['hsl(183, 46%, 66%)', 'hsl(183, 46%, 66%)'],
	card: ['hsl(0, 0%, 100%)', 'hsl(195, 40%, 98%)']
};

export const getTheme = (scheme) => {
	const colorScheme = scheme || Appearance.getColorScheme() || 'light';
	const colors = colorScheme === 'dark' ? paletteDark : paletteLight;
	return { colors, tokens, shadows, gradients, colorScheme };
};

// Instancia por defecto (lee el esquema del SO al cargar)
export const theme = getTheme();

// Estilos globales reutilizables
export const globalStyles = StyleSheet.create({
	appBackground: {
		flex: 1,
		backgroundColor: theme.colors.background
	},
	container: {
		flex: 1,
		backgroundColor: theme.colors.background,
		paddingHorizontal: tokens.spacing.lg
	},
	section: {
		paddingVertical: 20
	},
	card: {
		backgroundColor: theme.colors.card,
		borderRadius: tokens.radius.lg,
		...shadows.card
	},
	input: {
		height: 50,
		borderWidth: 2,
		borderColor: theme.colors.border,
		borderRadius: tokens.radius.lg,
		paddingHorizontal: tokens.spacing.md,
		backgroundColor: theme.colors.card,
		color: theme.colors.foreground
	},
	buttonPrimary: {
		height: tokens.components.buttonHeight,
		paddingHorizontal: tokens.components.buttonPaddingX,
		borderRadius: tokens.radius.lg,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: paletteLight.accent // se ve bien en ambos modos
	},
	buttonPrimaryText: {
		color: '#fff',
		fontWeight: '700'
	},
	title: {
		fontSize: 28,
		fontWeight: '800',
		color: theme.colors.foreground
	},
	subtitle: {
		fontSize: 18,
		color: theme.colors.mutedForeground
	}
});

// Utilidades de animación (contratos simples)
export const motionPresets = {
	fadeIn: {
		duration: tokens.motion.fadeIn,
		translateY: 20
	},
	slideUp: {
		duration: tokens.motion.slideUp,
		translateY: 40
	},
	float: {
		duration: tokens.motion.float
	}
};

export default theme;
