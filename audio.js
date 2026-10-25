/**
 * Advanced Audio Synthesizer Engine using Web Audio API
 * Generates rich, reactive sound effects and generative ambient synth music programmatically
 * with zero external audio assets.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.volume = 0.7;
        this.musicEnabled = true;
        this.ambientPlaying = false;
        this.ambientInterval = null;
        this.initialized = false;

        // Restore settings
        const savedMute = localStorage.getItem('bubble_sound_muted');
        if (savedMute !== null) {
            this.muted = savedMute === 'true';
        }
        const savedMusic = localStorage.getItem('bubble_music_enabled');
        if (savedMusic !== null) {
            this.musicEnabled = savedMusic === 'true';
        }
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        this.initialized = true;
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('bubble_sound_muted', this.muted);
        if (this.muted) {
            this.stopAmbientMusic();
        } else if (this.musicEnabled) {
            this.startAmbientMusic();
        }
        return this.muted;
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        localStorage.setItem('bubble_music_enabled', this.musicEnabled);
        if (!this.musicEnabled) {
            this.stopAmbientMusic();
        } else if (!this.muted) {
            this.startAmbientMusic();
        }
        return this.musicEnabled;
    }

    // Play standard bubble pop with combo-scaling frequency
    playPop(combo = 1) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const baseFreq = 380 + Math.min(combo * 45, 650);

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * 0.7, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.02);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, now + 0.12);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.5 * this.volume, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.14);

        // Click transient
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(baseFreq * 3, now);
        clickOsc.frequency.exponentialRampToValueAtTime(120, now + 0.03);

        clickGain.gain.setValueAtTime(0.3 * this.volume, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        clickOsc.connect(clickGain);
        clickGain.connect(this.ctx.destination);

        clickOsc.start(now);
        clickOsc.stop(now + 0.035);
    }

    // High-speed blade slash whoosh
    playSwoosh() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.Q.setValueAtTime(3, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.18 * this.volume, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.18);
    }

    // Chain lightning crackle
    playZap() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const freqs = [800, 1400, 600, 1800, 400];
        freqs.forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(f, now + i * 0.02);

            gain.gain.setValueAtTime(0.15 * this.volume, now + i * 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.02 + 0.05);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.02);
            osc.stop(now + i * 0.02 + 0.06);
        });
    }

    // Sonic boom / Shockwave detonation
    playShockwave() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.6);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.linearRampToValueAtTime(80, now + 0.5);

        gain.gain.setValueAtTime(0.7 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.75);
    }

    // Laser burst
    playLaser() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);

        gain.gain.setValueAtTime(0.3 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.14);
    }

    // Boss impact punch
    playBossHit() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.2);

        gain.gain.setValueAtTime(0.5 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.24);
    }

    // Boss defeat celebration
    playBossDefeat() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const chords = [
            [261.63, 329.63, 392.00], // C4
            [329.63, 392.00, 493.88], // E4
            [392.00, 493.88, 587.33], // G4
            [523.25, 659.25, 783.99]  // C5
        ];

        chords.forEach((chord, i) => {
            chord.forEach(freq => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.12);

                gain.gain.setValueAtTime(0.001, now + i * 0.12);
                gain.gain.linearRampToValueAtTime(0.18 * this.volume, now + i * 0.12 + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.4);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + i * 0.12);
                osc.stop(now + i * 0.12 + 0.45);
            });
        });
    }

    // Achievement unlock chime
    playAchievement() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.08);

            gain.gain.setValueAtTime(0.001, now + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.22 * this.volume, now + i * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.4);
        });
    }

    // Play bomb explosion
    playBomb() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.45);

        gain.gain.setValueAtTime(0.6 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.linearRampToValueAtTime(80, now + 0.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.52);
    }

    // Golden bonus bubble chime
    playBonus() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [587.33, 739.99, 880.00, 1174.66];

        notes.forEach((freq, index) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + index * 0.05);

            gain.gain.setValueAtTime(0.001, now + index * 0.05);
            gain.gain.linearRampToValueAtTime(0.3 * this.volume, now + index * 0.05 + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.05 + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + index * 0.05);
            osc.stop(now + index * 0.05 + 0.36);
        });
    }

    // Freeze / Ice bubble chime
    playFreeze() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [1200, 1500, 1800, 2400];

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.04);
            osc.frequency.linearRampToValueAtTime(freq * 0.9, now + i * 0.04 + 0.5);

            gain.gain.setValueAtTime(0.2 * this.volume, now + i * 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.6);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + i * 0.04);
            osc.stop(now + i * 0.04 + 0.65);
        });
    }

    // Bubble Frenzy fanfare
    playFrenzy() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [440, 554.37, 659.25, 880, 1108.73];

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.06);

            gain.gain.setValueAtTime(0.25 * this.volume, now + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.4);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + i * 0.06);
            osc.stop(now + i * 0.06 + 0.45);
        });
    }

    // Extra life heart sound
    playHeart() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const chords = [523.25, 659.25, 783.99];

        chords.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.25 * this.volume, now + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.5);
        });
    }

    // Game Over fanfare
    playGameOver(isHighScore = false) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const melody = isHighScore 
            ? [523.25, 659.25, 783.99, 1046.50]
            : [440, 415.30, 392, 349.23];

        melody.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.14);

            gain.gain.setValueAtTime(0.25 * this.volume, now + i * 0.14);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.5);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + i * 0.14);
            osc.stop(now + i * 0.14 + 0.55);
        });
    }

    // UI Click
    playClick() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

        gain.gain.setValueAtTime(0.15 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.035);
    }

    // Generative Chill Ambient Synth Music
    startAmbientMusic() {
        if (this.ambientPlaying || this.muted || !this.musicEnabled) return;
        this.init();
        if (!this.ctx) return;

        this.ambientPlaying = true;
        // Pentatonic progression notes: C3, D3, E3, G3, A3, C4, E4
        const scale = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 329.63];

        const playAmbientChord = () => {
            if (!this.ambientPlaying || this.muted || !this.musicEnabled || !this.ctx) return;
            const now = this.ctx.currentTime;
            // Pick 2 harmonious notes
            const root = scale[Math.floor(Math.random() * 3)];
            const fifth = root * 1.5;

            [root, fifth].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const filter = this.ctx.createBiquadFilter();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);

                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(350, now);

                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.035 * this.volume, now + 1.5 + idx * 0.2);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.8);

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now);
                osc.stop(now + 5.0);
            });
        };

        playAmbientChord();
        this.ambientInterval = setInterval(playAmbientChord, 4500);
    }

    stopAmbientMusic() {
        this.ambientPlaying = false;
        if (this.ambientInterval) {
            clearInterval(this.ambientInterval);
            this.ambientInterval = null;
        }
    }
}

// Global instance
window.soundEngine = new SoundEngine();
