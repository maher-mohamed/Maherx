import { SoundEffect } from '../types/game';

class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public play(effect: SoundEffect) {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      switch (effect) {
        case 'TICK':
          this.playTick(ctx);
          break;
        case 'BUZZ':
          this.playBuzz(ctx);
          break;
        case 'VOTE_CAST':
        case 'POP':
          this.playPop(ctx);
          break;
        case 'ROUND_START':
          this.playRoundStart(ctx);
          break;
        case 'REVEAL':
          this.playReveal(ctx);
          break;
        case 'VICTORY':
          this.playVictory(ctx);
          break;
        case 'GAME_OVER':
          this.playGameOver(ctx);
          break;
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  private playTick(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  private playPop(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  private playBuzz(ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.setValueAtTime(110, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  }

  private playRoundStart(ctx: AudioContext) {
    const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
    notes.forEach((freq, index) => {
      const startTime = ctx.currentTime + index * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }

  private playReveal(ctx: AudioContext) {
    // Dramatic mystery swell
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(220, ctx.currentTime);
    osc1.frequency.linearRampToValueAtTime(660, ctx.currentTime + 0.6);

    osc2.frequency.setValueAtTime(277.18, ctx.currentTime);
    osc2.frequency.linearRampToValueAtTime(830.61, ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 0.9);
    osc2.stop(ctx.currentTime + 0.9);
  }

  private playVictory(ctx: AudioContext) {
    const fanfare = [
      { freq: 523.25, dur: 0.12 }, // C5
      { freq: 659.25, dur: 0.12 }, // E5
      { freq: 783.99, dur: 0.12 }, // G5
      { freq: 1046.5, dur: 0.35 }  // C6
    ];

    let current = ctx.currentTime;
    fanfare.forEach(({ freq, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, current);

      gain.gain.setValueAtTime(0.25, current);
      gain.gain.exponentialRampToValueAtTime(0.001, current + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(current);
      osc.stop(current + dur);

      current += dur * 0.9;
    });
  }

  private playGameOver(ctx: AudioContext) {
    const notes = [587.33, 523.25, 493.88, 440];
    let current = ctx.currentTime;
    notes.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, current);

      gain.gain.setValueAtTime(0.2, current);
      gain.gain.exponentialRampToValueAtTime(0.01, current + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(current);
      osc.stop(current + 0.25);

      current += 0.18;
    });
  }
}

export const soundManager = new SoundEngine();
