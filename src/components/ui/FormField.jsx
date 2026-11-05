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
        <Typography type="body-sm" weight="semibold" className="mb-2 ml-1">
          {label}
          {required ? <Typography type="body-sm" className="text-accent"> *</Typography> : null}
        </Typography>
      ) : null}
      <View
        className={`h-14 flex-row items-center gap-3 rounded-[18px] bg-field px-4 ${editable ? '' : 'opacity-60'}`}
        style={{
          borderWidth: focused || error ? 1.5 : 1,
          borderColor,
          ...(focused ? { backgroundColor: `${theme.colors.primary}0D`, shadowColor: theme.colors.primary, shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } } : null),
        }}
      >
        {Icon ? <Icon color={focused ? theme.colors.primary : theme.colors.subtle} size={19} /> : null}
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
        <Typography type="body-xs" className="ml-1 mt-1.5 text-danger">{error}</Typography>
      ) : hint ? (
        <Typography type="body-xs" color="muted" className="ml-1 mt-1.5">{hint}</Typography>
      ) : null}
    </View>
  );
});

export default FormField;
