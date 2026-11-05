/**
 * Estado de conectividad compartido fuera de React.
 *
 *  - deviceOnline:    lo que informa NetInfo (Wi-Fi / datos activos).
 *  - serverReachable: lo que observa el cliente HTTP (la API respondió o no).
 *
 * La app se considera "online" solo si ambas son verdaderas, así el aviso
 * también aparece cuando hay Internet pero el backend no responde.
 */
let state = { deviceOnline: true, serverReachable: true };
const listeners = new Set();

const emit = () => listeners.forEach((listener) => listener(state));

const update = (patch) => {
  const next = { ...state, ...patch };
  if (next.deviceOnline === state.deviceOnline && next.serverReachable === state.serverReachable) return;
  state = next;
  emit();
};

export const getNetworkState = () => state;

export const isOnline = () => state.deviceOnline && state.serverReachable;

export const setDeviceOnline = (deviceOnline) => {
  // Al recuperar la red damos al servidor el beneficio de la duda; la próxima
  // petición confirmará si responde.
  update(deviceOnline ? { deviceOnline, serverReachable: true } : { deviceOnline });
};

export const setServerReachable = (serverReachable) => update({ serverReachable });

export const subscribeNetwork = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
