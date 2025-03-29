/**
 * Traducciones para el análisis de video
 * 
 * Este archivo contiene las funciones y constantes necesarias para traducir
 * los tipos de audio y texto que provienen del análisis de Gemini.
 */

// Traducciones para tipos de audio
const AUDIO_TYPE_TRANSLATIONS = {
  'voice_over': 'Voz en off',
  'talking_to_camera': 'Hablando a cámara',
  'no_voice': 'Sin voz',
  'music': 'Música'
};

// Traducciones para tipos de texto
const TEXT_TYPE_TRANSLATIONS = {
  'subtitles': 'Subtítulos',
  'complementary_text': 'Texto complementario',
  'no_text': 'Sin texto'
};

/**
 * Traduce un tipo de audio del inglés al español
 * @param {string} type - Tipo de audio en inglés (ejemplo: 'voice_over')
 * @returns {string} - Tipo de audio traducido al español
 */
export function translateAudioType(type) {
  return AUDIO_TYPE_TRANSLATIONS[type] || type;
}

/**
 * Traduce un tipo de texto del inglés al español
 * @param {string} type - Tipo de texto en inglés (ejemplo: 'subtitles')
 * @returns {string} - Tipo de texto traducido al español
 */
export function translateTextType(type) {
  return TEXT_TYPE_TRANSLATIONS[type] || type;
}

/**
 * Traduce una lista de tipos de audio del inglés al español
 * @param {Array<string>} types - Lista de tipos de audio en inglés
 * @returns {Array<string>} - Lista de tipos de audio traducidos al español
 */
export function translateAudioTypes(types) {
  if (!types || !Array.isArray(types)) return [];
  return types.map(translateAudioType);
}

/**
 * Traduce una lista de tipos de texto del inglés al español
 * @param {Array<string>} types - Lista de tipos de texto en inglés
 * @returns {Array<string>} - Lista de tipos de texto traducidos al español
 */
export function translateTextTypes(types) {
  if (!types || !Array.isArray(types)) return [];
  return types.map(translateTextType);
}

export { AUDIO_TYPE_TRANSLATIONS, TEXT_TYPE_TRANSLATIONS }; 