// Web Audio API Sound Synthesizer for Dancing Bricks
class SoundController {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {}
  }

  playHit() {
    this.playTone(440, 'triangle', 0.08, 0.15);
  }

  playPaddleHit() {
    this.playTone(300, 'sine', 0.1, 0.2);
  }

  playCombo(level = 1) {
    const baseFreq = 440 + level * 60;
    this.playTone(baseFreq, 'square', 0.12, 0.1);
  }

  playPowerup() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.1, 0.12), i * 60);
    });
  }

  playGameOver() {
    [400, 350, 300, 220].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sawtooth', 0.2, 0.15), i * 120);
    });
  }

  playVictory() {
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'triangle', 0.15, 0.15), i * 80);
    });
  }
}

export const soundFx = new SoundController();
