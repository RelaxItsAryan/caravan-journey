export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private engineOscillator: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private isInitialized = false;
  private noiseBuffer: AudioBuffer | null = null;
  private windSource: AudioBufferSourceNode | null = null;
  
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
      
      this.isInitialized = true;
    } catch (e) {
      console.warn('Audio initialization failed:', e);
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
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = 'square';
    osc.frequency.value = 100;
    gain.gain.value = 0.2;
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.3);
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
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.isInitialized = false;
  }
}
