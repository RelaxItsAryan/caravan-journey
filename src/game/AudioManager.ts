export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private engineOscillator: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private isInitialized = false;
  private noiseBuffer: AudioBuffer | null = null;
  private windSource: AudioBufferSourceNode | null = null;
  
  // Background music
  private musicElement: HTMLAudioElement | null = null;
  private musicGain: GainNode | null = null;
  
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.audioContext.destination);
      
      // Create noise buffer for wind
      this.noiseBuffer = this.createNoiseBuffer();
      
      // Start ambient wind
      this.startWind();
      
      // Start engine sound
      this.startEngine();
      
      // Start background music
      this.startMusic();
      
      this.isInitialized = true;
    } catch (e) {
      console.warn('Audio initialization failed:', e);
    }
  }
  
  private startMusic(): void {
    if (!this.audioContext || !this.masterGain) return;
    
    try {
      this.musicElement = new Audio('/Song.mp3');
      this.musicElement.loop = true;
      this.musicElement.volume = 1.0; // Background music volume
      
      // Create a media element source
      const source = this.audioContext.createMediaElementSource(this.musicElement);
      this.musicGain = this.audioContext.createGain();
      this.musicGain.gain.value = 1.2;
      
      source.connect(this.musicGain);
      this.musicGain.connect(this.audioContext.destination);
      
      this.musicElement.play().catch(e => {
        console.warn('Music autoplay blocked:', e);
      });
    } catch (e) {
      console.warn('Failed to start music:', e);
    }
  }
  
  setMusicVolume(volume: number): void {
    if (this.musicGain) {
      this.musicGain.gain.value = volume;
    }
    if (this.musicElement) {
      this.musicElement.volume = volume;
    }
  }
  
  private createNoiseBuffer(): AudioBuffer {
    const bufferSize = this.audioContext!.sampleRate * 2;
    const buffer = this.audioContext!.createBuffer(1, bufferSize, this.audioContext!.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
  }
  
  private startWind(): void {
    if (!this.audioContext || !this.masterGain || !this.noiseBuffer) return;
    
    this.windSource = this.audioContext.createBufferSource();
    this.windSource.buffer = this.noiseBuffer;
    this.windSource.loop = true;
    
    // Low-pass filter for wind effect
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    
    this.windGain = this.audioContext.createGain();
    this.windGain.gain.value = 0.05;
    
    this.windSource.connect(filter);
    filter.connect(this.windGain);
    this.windGain.connect(this.masterGain);
    
    this.windSource.start();
  }
  
  private startEngine(): void {
    if (!this.audioContext || !this.masterGain) return;
    
    this.engineOscillator = this.audioContext.createOscillator();
    this.engineOscillator.type = 'sawtooth';
    this.engineOscillator.frequency.value = 60;
    
    this.engineGain = this.audioContext.createGain();
    this.engineGain.gain.value = 0.02;
    
    // Add some distortion for engine rumble
    const distortion = this.audioContext.createWaveShaper();
    // Skip distortion curve to avoid type issues
    
    const lowpass = this.audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 200;
    
    this.engineOscillator.connect(distortion);
    distortion.connect(lowpass);
    lowpass.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);
    
    this.engineOscillator.start();
  }
  
  private makeDistortionCurve(amount: number): Float32Array {
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }
    
    return curve as Float32Array;
  }
  
  updateSpeed(speed: number, maxSpeed: number): void {
    if (!this.engineOscillator || !this.engineGain) return;
    
    const speedRatio = speed / maxSpeed;
    this.engineOscillator.frequency.value = 40 + speedRatio * 80;
    this.engineGain.gain.value = 0.01 + speedRatio * 0.03;
  }
  
  updateWeather(weather: string, intensity: number): void {
    if (!this.windGain) return;
    
    switch (weather) {
      case 'sandstorm':
        this.windGain.gain.value = 0.15 + intensity * 0.1;
        break;
      case 'dusty':
        this.windGain.gain.value = 0.08;
        break;
      case 'windy':
        this.windGain.gain.value = 0.1;
        break;
      default:
        this.windGain.gain.value = 0.04;
    }
  }
  
  playCollisionSound(): void {
    if (!this.audioContext || !this.masterGain) return;
    
    // Create a harsh crash sound with multiple components
    const now = this.audioContext.currentTime;
    
    // Low thud
    const thudOsc = this.audioContext.createOscillator();
    const thudGain = this.audioContext.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.value = 60;
    thudOsc.frequency.exponentialRampToValueAtTime(30, now + 0.2);
    thudGain.gain.value = 0.7;
    thudGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    thudOsc.connect(thudGain);
    thudGain.connect(this.masterGain);
    thudOsc.start();
    thudOsc.stop(now + 0.3);
    
    // Metal crunch
    const crunchOsc = this.audioContext.createOscillator();
    const crunchGain = this.audioContext.createGain();
    crunchOsc.type = 'sawtooth';
    crunchOsc.frequency.value = 200;
    crunchOsc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
    crunchGain.gain.value = 0.35;
    crunchGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    crunchOsc.connect(crunchGain);
    crunchGain.connect(this.masterGain);
    crunchOsc.start();
    crunchOsc.stop(now + 0.2);
    
    // White noise burst for impact
    const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.15, this.audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseData.length);
    }
    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.value = 0.45;
    noiseSource.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noiseSource.start();
  }
  
  playCoinSound(): void {
    if (!this.audioContext || !this.masterGain) return;
    
    const now = this.audioContext.currentTime;
    
    // Bright coin chime with two tones
    const osc1 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = 1200;
    gain1.gain.value = 0.4;
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start();
    osc1.stop(now + 0.15);
    
    // Second higher tone slightly delayed
    const osc2 = this.audioContext.createOscillator();
    const gain2 = this.audioContext.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = 1800;
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(0.35, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(now + 0.03);
    osc2.stop(now + 0.2);
  }
  
  playGemSound(): void {
    if (!this.audioContext || !this.masterGain) return;
    
    const now = this.audioContext.currentTime;
    
    // Sparkling gem sound - arpeggiated tones
    const frequencies = [880, 1320, 1760, 2200];
    frequencies.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const startTime = now + i * 0.04;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(startTime);
      osc.stop(startTime + 0.25);
    });
  }
  
  playPickupSound(): void {
    if (!this.audioContext || !this.masterGain) return;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = 440;
    osc.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.1);
    gain.gain.value = 0.15;
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.2);
  }
  
  playGameOverSound(): void {
    if (!this.audioContext || !this.masterGain) return;
    
    const now = this.audioContext.currentTime;
    
    // Dramatic descending tones
    const notes = [440, 370, 311, 262];
    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const startTime = now + i * 0.25;
      gain.gain.setValueAtTime(0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
    
    // Low rumble bass
    const bassOsc = this.audioContext.createOscillator();
    const bassGain = this.audioContext.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.value = 80;
    bassOsc.frequency.exponentialRampToValueAtTime(40, now + 1.2);
    bassGain.gain.value = 0.5;
    bassGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
    bassOsc.connect(bassGain);
    bassGain.connect(this.masterGain);
    bassOsc.start();
    bassOsc.stop(now + 1.2);
    
    // Final crash
    const crashBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.5, this.audioContext.sampleRate);
    const crashData = crashBuffer.getChannelData(0);
    for (let i = 0; i < crashData.length; i++) {
      crashData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.audioContext.sampleRate * 0.15));
    }
    const crashSource = this.audioContext.createBufferSource();
    crashSource.buffer = crashBuffer;
    const crashGain = this.audioContext.createGain();
    crashGain.gain.setValueAtTime(0, now + 0.8);
    crashGain.gain.linearRampToValueAtTime(0.5, now + 0.85);
    crashGain.gain.exponentialRampToValueAtTime(0.01, now + 1.3);
    crashSource.connect(crashGain);
    crashGain.connect(this.masterGain);
    crashSource.start(now + 0.8);
  }
  
  setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
  }
  
  dispose(): void {
    if (this.engineOscillator) {
      this.engineOscillator.stop();
      this.engineOscillator.disconnect();
    }
    if (this.windSource) {
      this.windSource.stop();
      this.windSource.disconnect();
    }
    if (this.musicElement) {
      this.musicElement.pause();
      this.musicElement.src = '';
      this.musicElement = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.isInitialized = false;
  }
}
