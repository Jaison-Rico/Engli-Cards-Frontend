import { createAudioPlayer } from 'expo-audio';

const SOUNDS = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  wrong: require('../../assets/sounds/u_31vnwfmzt6-error-126627.mp3'),
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
};

class SoundManager {
  static instance = null;

  static getInstance() {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  async play(soundName) {
    try {
      const soundSource = SOUNDS[soundName];
      if (!soundSource) return;
      const source = typeof soundSource === 'string' ? { uri: soundSource } : soundSource;
      const player = createAudioPlayer(source);
      player.play();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  }
}

export default SoundManager.getInstance();
