import * as Speech from 'expo-speech';

/**
 * Servicio de Text-to-Speech bilingüe.
 *
 * - `speak(text, { lang })`: si se indica el idioma ('es' | 'en' o un código
 *   BCP-47) se usa ese; si no, se detecta a partir del texto.
 * - Se elige una voz instalada concreta (identifier) del idioma pedido: pasar
 *   solo `language` hace que algunos motores Android lean con la voz por
 *   defecto del sistema (p. ej. español con acento inglés).
 */

const CANDIDATES = {
  es: ['es-CO', 'es-419', 'es-MX', 'es-US', 'es-ES', 'es'],
  en: ['en-US', 'en-GB', 'en-AU', 'en'],
};

const voiceCache = {};
let voicesPromise = null;

const norm = (lang) => (lang || '').replace('_', '-').toLowerCase();

const loadVoices = () => {
  if (!voicesPromise) {
    voicesPromise = Speech.getAvailableVoicesAsync()
      .then((voices) => voices ?? [])
      .catch(() => {
        voicesPromise = null; // reintenta la próxima vez
        return [];
      });
  }
  return voicesPromise;
};

/** Prefiere voces "Enhanced" y locales (no de red) del primer candidato que exista. */
async function resolveVoice(base) {
  if (voiceCache[base]) return voiceCache[base];
  const candidates = CANDIDATES[base];
  const voices = await loadVoices();
  const pick = (list) =>
    list.find((v) => v.quality === 'Enhanced' && !/network/i.test(v.identifier ?? ''))
    ?? list.find((v) => !/network/i.test(v.identifier ?? ''))
    ?? list[0];

  let result = { language: candidates[0], voice: undefined };
  for (const lang of candidates) {
    const matches = voices.filter((v) => norm(v.language) === lang.toLowerCase());
    if (matches.length) {
      const v = pick(matches);
      result = { language: v.language, voice: v.identifier };
      break;
    }
  }
  if (!result.voice) {
    const loose = voices.filter((v) => norm(v.language).startsWith(base));
    if (loose.length) {
      const v = pick(loose);
      result = { language: v.language, voice: v.identifier };
    }
  }
  // Solo se cachea si hubo voces: si la lista vino vacía se reintenta luego.
  if (voices.length) voiceCache[base] = result;
  return result;
}

const SPANISH_HINTS = /[ñáéíóúü¿¡]|\b(el|la|los|las|un|una|de|del|y|que|es|por|para|con|buenos|buenas|hola|gracias|adiós|señor|señora)\b/i;

/** Detecta 'es' o 'en' a partir del texto (heurística ligera). */
export const detectLanguage = (text = '') => (SPANISH_HINTS.test(text) ? 'es' : 'en');

/** Normaliza 'es-ES', 'en-US', 'es', etc. a 'es' | 'en'. */
const toBase = (lang) => (norm(lang).startsWith('es') ? 'es' : 'en');

export async function speak(text, { lang, rate = 0.9 } = {}) {
  if (!text) return;
  const base = lang ? toBase(lang) : detectLanguage(text);
  try {
    Speech.stop();
    const { language, voice } = await resolveVoice(base);
    Speech.speak(text, { language, voice, rate, pitch: 1.0 });
  } catch {
    try { Speech.speak(text, { language: CANDIDATES[base][0], rate }); } catch { /* sin voz disponible */ }
  }
}

export const stopSpeaking = () => {
  try { Speech.stop(); } catch { /* noop */ }
};

/** Precarga la lista de voces para que el primer "Escuchar" no tarde. */
export const warmUpVoices = () => {
  loadVoices().then(() => Promise.all([resolveVoice('es'), resolveVoice('en')])).catch(() => {});
};
