import { Audio } from 'expo-av';

const SOUNDS = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  // Sound Effect by Shagor Miah from Pixabay
  wrong: require('../../assets/sounds/u_31vnwfmzt6-error-126627.mp3'),
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
};

class SoundManager {
  static instance = null;
  sounds = {};

  static getInstance() {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  async play(soundName) {
    try {
      const source = typeof SOUNDS[soundName] === 'string' ? { uri: SOUNDS[soundName] } : SOUNDS[soundName];
      const { sound } = await Audio.Sound.createAsync(source);
      await sound.playAsync();
      // Auto unload after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  }
}

export default SoundManager.getInstance();
