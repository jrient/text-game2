/**
 * Background Music System using Web Audio API
 * Generates ambient synth music procedurally
 */
export class MusicSystem {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.loops = [];
    this.currentPattern = 0;
    this.patternTimer = 0;
    this.tempo = 120; // BPM
    this.stepDuration = 0;

    // Music settings
    this.volume = 0.3;
    this.enabled = true;

    // Simple synth melody patterns (pentatonic scale)
    this.patterns = [
      [262, 0, 294, 0, 330, 0, 392, 0], // C4 pattern
      [392, 0, 330, 0, 294, 0, 262, 0], // Descending
      [262, 294, 330, 294, 262, 330, 294, 0], // Varied
      [330, 0, 392, 0, 440, 0, 392, 0], // Higher octave
    ];

    // Bass patterns
    this.bassPatterns = [
      [131, 0, 0, 0, 165, 0, 0, 0], // C3, E3
      [196, 0, 0, 0, 165, 0, 0, 0], // G3, E3
      [131, 0, 196, 0, 165, 0, 146, 0], // C3, G3, E3, D3
      [131, 0, 0, 131, 0, 165, 0, 0], // Emphasized
    ];

    // Pad chord patterns (root, third, fifth)
    this.chordPatterns = [
      [[262, 330, 392], [294, 370, 440]], // C, D
      [[330, 392, 494], [262, 330, 392]], // E, C
      [[392, 494, 587], [330, 392, 494]], // G, E
      [[262, 330, 392], [196, 247, 294]], // C, G
    ];
  }

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);

      // Calculate step duration based on tempo
      // Eighth note at given BPM
      this.stepDuration = (60 / this.tempo) / 2;

      return true;
    } catch (e) {
      console.warn('AudioContext not supported:', e);
      return false;
    }
  }

  start() {
    if (!this.enabled) return;
    if (!this.ctx && !this.init()) return;
    if (this.isPlaying) return;

    // Resume context if suspended (browser requirement)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;
    this._startLoops();
  }

  stop() {
    this.isPlaying = false;
    this._stopLoops();
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  /**
   * Start all music loops
   */
  _startLoops() {
    // Melody loop
    this.loops.push(setInterval(() => this._playMelody(), this.stepDuration * 1000));

    // Bass loop (slower - every 2 steps)
    this.loops.push(setInterval(() => this._playBass(), this.stepDuration * 2000));

    // Pad loop (very slow - every 4 steps)
    this.loops.push(setInterval(() => this._playPad(), this.stepDuration * 4000));
  }

  /**
   * Stop all music loops
   */
  _stopLoops() {
    this.loops.forEach(loop => clearInterval(loop));
    this.loops = [];
  }

  /**
   * Play melody note
   */
  _playMelody() {
    if (!this.isPlaying || !this.ctx) return;

    const pattern = this.patterns[this.currentPattern % this.patterns.length];
    const note = pattern[this.patternTimer % pattern.length];

    if (note > 0) {
      this._playNote(note, 'triangle', 0.1, 0.3);
    }

    this.patternTimer++;
    if (this.patternTimer >= 16) { // 16 steps per pattern
      this.patternTimer = 0;
      this.currentPattern++;
    }
  }

  /**
   * Play bass note
   */
  _playBass() {
    if (!this.isPlaying || !this.ctx) return;

    const patternIndex = Math.floor(this.currentPattern / 4) % this.bassPatterns.length;
    const pattern = this.bassPatterns[patternIndex];
    const note = pattern[Math.floor(this.patternTimer / 2) % pattern.length];

    if (note > 0) {
      this._playNote(note, 'sawtooth', 0.15, 0.8);
    }
  }

  /**
   * Play pad chord
   */
  _playPad() {
    if (!this.isPlaying || !this.ctx) return;

    const chordIndex = Math.floor(this.currentPattern / 8) % this.chordPatterns.length;
    const chord = this.chordPatterns[chordIndex][this.currentPattern % 2];

    // Play all notes in chord with slight delay for richness
    chord.forEach((note, i) => {
      setTimeout(() => {
        if (this.isPlaying) {
          this._playNote(note, 'sine', 0.08, 1.5, 0.5);
        }
      }, i * 50);
    });
  }

  /**
   * Play a single note
   */
  _playNote(frequency, type, volume, duration, fadeIn = 0.01) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Setup oscillator
    osc.type = type;
    osc.frequency.value = frequency;

    // Setup filter for warmth
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1;

    // Connect nodes
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    // Envelope
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + fadeIn);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Play
    osc.start(now);
    osc.stop(now + duration);
  }

  /**
   * Play a one-off sound effect (for menu, etc.)
   */
  playSound(type) {
    if (!this.enabled) return;
    if (!this.ctx && !this.init()) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;

    switch (type) {
      case 'menuMove':
        this._playNote(440, 'sine', 0.05, 0.05);
        break;
      case 'menuSelect':
        this._playNote(523, 'sine', 0.1, 0.1);
        setTimeout(() => this._playNote(659, 'sine', 0.1, 0.15), 50);
        break;
      case 'menuBack':
        this._playNote(392, 'sine', 0.1, 0.1);
        break;
      case 'achievement':
        [523, 659, 784, 1047].forEach((freq, i) => {
          setTimeout(() => this._playNote(freq, 'square', 0.08, 0.2), i * 80);
        });
        break;
    }
  }

  destroy() {
    this.stop();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

// Singleton instance
export const musicSystem = new MusicSystem();
