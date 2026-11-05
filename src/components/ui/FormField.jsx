import React, { forwardRef, useState } from 'react';
import { View, TextInput } from 'react-native';
import { Typography } from 'heroui-native';
import { useAppTheme } from '../../context/ThemeContext';

/**
 * Campo de formulario estándar: etiqueta, icono inicial opcional, accesorio
 * final (p. ej. mostrar contraseña) y mensaje de error. El borde cambia a
 * color de marca al enfocar y a rojo si hay error.
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
        <Typography type="body-sm" weight="semibold" className="mb-1.5">
          {label}
          {required ? <Typography type="body-sm" className="text-accent"> *</Typography> : null}
        </Typography>
      ) : null}
      <View
        className={`h-[52px] flex-row items-center gap-2.5 rounded-2xl bg-field px-4 ${editable ? '' : 'opacity-60'}`}
        style={{ borderWidth: focused || error ? 1.5 : 1, borderColor }}
      >
        {Icon ? <Icon color={focused ? theme.colors.primary : theme.colors.subtle} size={18} /> : null}
        <TextInput
          ref={ref}
          {...inputProps}
          editable={editable}
          placeholderTextColor={theme.colors.subtle}
          className="flex-1 text-[15px] text-foreground"
          style={{ paddingVertical: 0 }}
          accessibilityLabel={inputProps.accessibilityLabel ?? label}
          onFocus={(event) => { setFocused(true); inputProps.onFocus?.(event); }}
          onBlur={(event) => { setFocused(false); inputProps.onBlur?.(event); }}
        />
        {trailing}
      </View>
      {error ? (
        <Typography type="body-xs" className="mt-1.5 text-danger">{error}</Typography>
      ) : hint ? (
        <Typography type="body-xs" color="muted" className="mt-1.5">{hint}</Typography>
      ) : null}
    </View>
  );
});

export default FormField;
