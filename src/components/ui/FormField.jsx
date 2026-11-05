import React, { forwardRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Typography } from 'heroui-native';
import { useAppTheme } from '../../context/ThemeContext';

/**
 * Campo de formulario estándar: etiqueta, icono inicial opcional, accesorio
 * final (p. ej. mostrar contraseña) y mensaje de error. El borde cambia a
 * color de marca al enfocar y a rojo si hay error.
 *
 * Importante: el estilo que depende del foco SIEMPRE tiene las mismas claves
 * (solo cambian valores). Añadir/quitar propiedades al enfocar (sombra,
 * fondo…) hace que NativeWind vuelva a montar el componente; en Android el
 * TextInput enfocado se desmonta y el foco salta al otro campo.
 */
const FormField = forwardRef(function FormField(
  { label, required = false, icon: Icon, trailing, error, hint, className = '', editable = true, ...inputProps },
  ref,
) {
  const { theme } = useAppTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? theme.colors.danger : focused ? theme.colors.primary : theme.colors.border;

  return (
    <View className={`mb-4 ${className}`}>
      {label ? (
        <Typography type="body-sm" weight="semibold" className="mb-2 ml-1">
          {label}
          {required ? <Typography type="body-sm" className="text-accent"> *</Typography> : null}
        </Typography>
      ) : null}
      <View
        className="bg-field"
        style={[styles.box, { borderColor, borderWidth: focused || error ? 1.5 : 1, opacity: editable ? 1 : 0.6 }]}
      >
        {Icon ? <Icon color={focused ? theme.colors.primary : theme.colors.subtle} size={19} /> : null}
        <TextInput
          ref={ref}
          {...inputProps}
          editable={editable}
          placeholderTextColor={theme.colors.subtle}
          style={[styles.input, { color: theme.colors.foreground }]}
          accessibilityLabel={inputProps.accessibilityLabel ?? label}
          onFocus={(event) => { setFocused(true); inputProps.onFocus?.(event); }}
          onBlur={(event) => { setFocused(false); inputProps.onBlur?.(event); }}
        />
        {trailing}
      </View>
      {error ? (
        <Typography type="body-xs" className="ml-1 mt-1.5 text-danger">{error}</Typography>
      ) : hint ? (
        <Typography type="body-xs" color="muted" className="ml-1 mt-1.5">{hint}</Typography>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  box: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    paddingHorizontal: 16,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
});

export default FormField;
