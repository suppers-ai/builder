export class AudioManager {
  private audioContext: AudioContext;
  private sounds: Map<string, AudioBuffer> = new Map();
  private musicGainNode: GainNode;
  private sfxGainNode: GainNode;
  private currentMusic: AudioBufferSourceNode | null = null;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create gain nodes for volume control
    this.musicGainNode = this.audioContext.createGain();
    this.musicGainNode.gain.value = 0.3;
    this.musicGainNode.connect(this.audioContext.destination);
    
    this.sfxGainNode = this.audioContext.createGain();
    this.sfxGainNode.gain.value = 0.5;
    this.sfxGainNode.connect(this.audioContext.destination);
    
    // Initialize synthesized sounds
    this.initializeSounds();
  }

  private initializeSounds(): void {
    // Create synthetic sound effects using Web Audio API
    this.createCollectSound();
    this.createDamageSound();
    this.createPowerUpSound();
    this.createEtherealSound();
    this.createLevelCompleteSound();
    this.createGameOverSound();
  }

  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine'): AudioBuffer {
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const channel = buffer.getChannelData(0);
    
    for (let i = 0; i < channel.length; i++) {
      const t = i / sampleRate;
      channel[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 3);
    }
    
    return buffer;
  }

  private createCollectSound(): void {
    const buffer = this.audioContext.createBuffer(1, 0.3 * this.audioContext.sampleRate, this.audioContext.sampleRate);
    const channel = buffer.getChannelData(0);
    
    for (let i = 0; i < channel.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Rising pitch for collection
      const freq = 440 + (880 - 440) * t / 0.3;
      channel[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 2) * 0.3;
    }
    
    this.sounds.set('collect', buffer);
  }

  private createDamageSound(): void {
    const buffer = this.audioContext.createBuffer(1, 0.2 * this.audioContext.sampleRate, this.audioContext.sampleRate);
    const channel = buffer.getChannelData(0);
    
    for (let i = 0; i < channel.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Low frequency hit
      channel[i] = (Math.random() * 2 - 1) * Math.exp(-t * 10) * 0.5;
      channel[i] += Math.sin(2 * Math.PI * 100 * t) * Math.exp(-t * 5) * 0.3;
    }
    
    this.sounds.set('damage', buffer);
  }

  private createPowerUpSound(): void {
    const buffer = this.audioContext.createBuffer(1, 0.5 * this.audioContext.sampleRate, this.audioContext.sampleRate);
    const channel = buffer.getChannelData(0);
    
    for (let i = 0; i < channel.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Magical ascending tones
      const freq1 = 523.25; // C5
      const freq2 = 659.25; // E5
      const freq3 = 783.99; // G5
      
      let signal = 0;
      if (t < 0.15) {
        signal = Math.sin(2 * Math.PI * freq1 * t);
      } else if (t < 0.3) {
        signal = Math.sin(2 * Math.PI * freq2 * t);
      } else {
        signal = Math.sin(2 * Math.PI * freq3 * t);
      }
      
      channel[i] = signal * Math.exp(-t * 2) * 0.3;
    }
    
    this.sounds.set('powerup', buffer);
  }

  private createEtherealSound(): void {
    const buffer = this.audioContext.createBuffer(1, 0.8 * this.audioContext.sampleRate, this.audioContext.sampleRate);
    const channel = buffer.getChannelData(0);
    
    for (let i = 0; i < channel.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Whooshing ethereal sound
      const freq = 200 + Math.sin(t * 10) * 100;
      channel[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 1.5) * 0.2;
      channel[i] += (Math.random() * 2 - 1) * 0.05 * Math.exp(-t * 2); // Add some noise
    }
    
    this.sounds.set('ethereal', buffer);
  }

  private createLevelCompleteSound(): void {
    const buffer = this.audioContext.createBuffer(1, 1 * this.audioContext.sampleRate, this.audioContext.sampleRate);
    const channel = buffer.getChannelData(0);
    
    for (let i = 0; i < channel.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Victory fanfare
      let signal = 0;
      
      if (t < 0.2) {
        signal = Math.sin(2 * Math.PI * 523.25 * t); // C5
      } else if (t < 0.4) {
        signal = Math.sin(2 * Math.PI * 659.25 * t); // E5
      } else if (t < 0.6) {
        signal = Math.sin(2 * Math.PI * 783.99 * t); // G5
      } else {
        signal = Math.sin(2 * Math.PI * 1046.50 * t); // C6
      }
      
      channel[i] = signal * Math.exp(-t * 0.5) * 0.3;
    }
    
    this.sounds.set('levelComplete', buffer);
  }

  private createGameOverSound(): void {
    const buffer = this.audioContext.createBuffer(1, 1.5 * this.audioContext.sampleRate, this.audioContext.sampleRate);
    const channel = buffer.getChannelData(0);
    
    for (let i = 0; i < channel.length; i++) {
      const t = i / this.audioContext.sampleRate;
      // Descending sad tones
      const freq = 440 * Math.exp(-t * 0.5);
      channel[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 1) * 0.3;
    }
    
    this.sounds.set('gameOver', buffer);
  }

  public playSound(soundName: string, volume: number = 1): void {
    const buffer = this.sounds.get(soundName);
    if (!buffer) return;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(this.sfxGainNode);
    
    source.start();
  }

  public playBackgroundMusic(): void {
    // Create a simple looping ambient music
    this.stopBackgroundMusic();
    
    const duration = 8;
    const buffer = this.audioContext.createBuffer(2, duration * this.audioContext.sampleRate, this.audioContext.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      
      for (let i = 0; i < channelData.length; i++) {
        const t = i / this.audioContext.sampleRate;
        
        // Create ambient drone with harmonics
        let signal = 0;
        signal += Math.sin(2 * Math.PI * 110 * t) * 0.1; // A2
        signal += Math.sin(2 * Math.PI * 165 * t) * 0.05; // E3
        signal += Math.sin(2 * Math.PI * 220 * t) * 0.05; // A3
        
        // Add some movement
        signal *= 1 + Math.sin(2 * Math.PI * 0.1 * t) * 0.3;
        
        // Stereo effect
        if (channel === 1) {
          signal *= 1 + Math.sin(2 * Math.PI * 0.15 * t) * 0.2;
        }
        
        channelData[i] = signal;
      }
    }
    
    this.currentMusic = this.audioContext.createBufferSource();
    this.currentMusic.buffer = buffer;
    this.currentMusic.loop = true;
    this.currentMusic.connect(this.musicGainNode);
    this.currentMusic.start();
  }

  public stopBackgroundMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  public setMusicVolume(volume: number): void {
    this.musicGainNode.gain.value = Math.max(0, Math.min(1, volume));
  }

  public setSfxVolume(volume: number): void {
    this.sfxGainNode.gain.value = Math.max(0, Math.min(1, volume));
  }

  public resume(): void {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}