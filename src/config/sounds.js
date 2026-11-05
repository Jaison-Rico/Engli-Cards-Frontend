import { createAudioPlayer } from 'expo-audio';

// Todos los sonidos son locales: funcionan sin conexión y suenan al instante.
// correct/success/pop son campanillas sintetizadas, cortas y suaves.
const SOUNDS = {
  correct: { source: require('../../assets/sounds/correct.wav'), volume: 0.55 },
  wrong: { source: require('../../assets/sounds/u_31vnwfmzt6-error-126627.mp3'), volume: 0.5 },
  click: { source: require('../../assets/sounds/pop.wav'), volume: 0.4 },
  success: { source: require('../../assets/sounds/success.wav'), volume: 0.6 },
};

class SoundManager {
  static instance = null;

  static getInstance() {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  // Un reproductor reutilizable por sonido (antes se creaba uno nuevo en cada
  // toque y nunca se liberaba).
  players = {};

  getPlayer(soundName) {
    if (!this.players[soundName]) {
      const config = SOUNDS[soundName];
      if (!config) return null;
      const player = createAudioPlayer(config.source);
      player.volume = config.volume;
      this.players[soundName] = player;
    }
    return this.players[soundName];
  }

  async play(soundName) {
    try {
      const player = this.getPlayer(soundName);
      if (!player) return;
      await player.seekTo(0);
      player.play();
    } catch (error) {
      if (__DEV__) console.warn('No se pudo reproducir el sonido:', error?.message ?? error);
    }
  }
}

export default SoundManager.getInstance();
