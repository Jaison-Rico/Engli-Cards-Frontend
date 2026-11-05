import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import Toast from './Toast';
import DialogModal from './DialogModal';
import ActionSheet from './ActionSheet';

/**
 * Feedback visual unificado. Sustituye a `Alert.alert` y a los toasts sueltos.
 *
 *   const { toast, confirm, alert, actionSheet } = useFeedback();
 *
 *   toast.success('Mazo creado');
 *   toast.offline('Guardado en el dispositivo');
 *   const ok = await confirm({ title, message, confirmText, destructive: true });
 *   await alert({ title, message, tone: 'success', icon: Trophy });
 *   actionSheet({ title, options: [{ label, icon, onPress, destructive }] });
 */
const FeedbackContext = createContext(null);

const TOAST_DURATION = { success: 2600, info: 3000, offline: 3600, error: 4200 };

export function FeedbackProvider({ children }) {
  const [currentToast, setCurrentToast] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [sheet, setSheet] = useState(null);
  const toastTimer = useRef(null);
  const toastId = useRef(0);

  const hideToast = useCallback(() => {
    clearTimeout(toastTimer.current);
    setCurrentToast(null);
  }, []);

  const showToast = useCallback((type, title, options = {}) => {
    clearTimeout(toastTimer.current);
    toastId.current += 1;
    const next = { id: toastId.current, type, title, message: options.message };
    setCurrentToast(next);
    if (type === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
    if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    toastTimer.current = setTimeout(hideToast, options.duration ?? TOAST_DURATION[type] ?? 3000);
  }, [hideToast]);

  const toast = useMemo(() => ({
    success: (title, options) => showToast('success', title, options),
    error: (title, options) => showToast('error', title, options),
    info: (title, options) => showToast('info', title, options),
    offline: (title, options) => showToast('offline', title, options),
    hide: hideToast,
  }), [showToast, hideToast]);

  /** Diálogo con promesa: resuelve `true` si se confirma, `false` si se cancela. */
  const confirm = useCallback((options) => new Promise((resolve) => {
    if (options?.destructive) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    setDialog({
      cancelText: 'Cancelar',
      confirmText: 'Aceptar',
      ...options,
      resolve,
    });
  }), []);

  /** Diálogo informativo de un solo botón. */
  const alert = useCallback((options) => new Promise((resolve) => {
    setDialog({ confirmText: 'Entendido', ...options, cancelText: null, resolve });
  }), []);

  const closeDialog = useCallback((result) => {
    setDialog((current) => {
      current?.resolve?.(result);
      return null;
    });
  }, []);

  const actionSheet = useCallback((options) => setSheet(options), []);

  const value = useMemo(
    () => ({ toast, confirm, alert, actionSheet }),
    [toast, confirm, alert, actionSheet],
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <Toast toast={currentToast} onDismiss={hideToast} />
      <DialogModal dialog={dialog} onClose={closeDialog} />
      <ActionSheet sheet={sheet} onClose={() => setSheet(null)} />
    </FeedbackContext.Provider>
  );
}

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useFeedback debe usarse dentro de <FeedbackProvider>');
  return context;
};
