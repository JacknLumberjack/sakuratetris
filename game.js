/* ============================================
   SAKURA TETRIS — Game Engine (Phase 3 Polish)
   ============================================ */

(() => {
  'use strict';

  // ---- Constants ----
  const COLS = 10;
  const ROWS = 20;
  const BLOCK_SIZE = 30;
  const PREVIEW_BLOCK = 22;
  const PREVIEW_GRID = 4;

  // Vibrant piece colors (distinct & elegant)
  const COLORS = [
    null,
    '#67E8F9', // I — Cyan
    '#FBBF24', // O — Gold
    '#C084FC', // T — Purple
    '#86EFAC', // S — Mint green
    '#FB7185', // Z — Coral red
    '#818CF8', // J — Indigo
    '#FB923C', // L — Orange
  ];

  // Brighter versions for glow / highlight
  const GLOW_COLORS = [
    null,
    '#A5F3FC',
    '#FCD34D',
    '#D8B4FE',
    '#BBF7D0',
    '#FDA4AF',
    '#A5B4FC',
    '#FDBA74',
  ];

  // Ghost piece colors (very transparent)
  const GHOST_COLORS = [
    null,
    'rgba(103,232,249,0.18)',
    'rgba(251,191,36,0.18)',
    'rgba(192,132,252,0.18)',
    'rgba(134,239,172,0.18)',
    'rgba(251,113,133,0.18)',
    'rgba(129,140,248,0.18)',
    'rgba(251,146,60,0.18)',
  ];

  // ---- SRS Wall Kick Data ----
  // Offsets for J, L, S, T, Z pieces (standard SRS)
  const KICK_TABLE_JLSTZ = {
    '0>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    '1>0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    '1>2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    '2>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    '2>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    '3>2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    '3>0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    '0>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  };

  // Offsets for I piece
  const KICK_TABLE_I = {
    '0>1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    '1>0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    '1>2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
    '2>1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
    '2>3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    '3>2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    '3>0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
    '0>3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  };

  // Tetromino shapes (each rotation state)
  const SHAPES = {
    I: [
      [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
      [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
      [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]],
    ],
    O: [
      [[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    ],
    T: [
      [[0, 1, 0, 0], [1, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 1, 0, 0], [0, 1, 1, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
      [[0, 0, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
      [[0, 1, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
    ],
    S: [
      [[0, 1, 1, 0], [1, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 1, 0, 0], [0, 1, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0]],
      [[0, 0, 0, 0], [0, 1, 1, 0], [1, 1, 0, 0], [0, 0, 0, 0]],
      [[1, 0, 0, 0], [1, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
    ],
    Z: [
      [[1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 0, 1, 0], [0, 1, 1, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
      [[0, 0, 0, 0], [1, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
      [[0, 1, 0, 0], [1, 1, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]],
    ],
    J: [
      [[1, 0, 0, 0], [1, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 1, 1, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
      [[0, 0, 0, 0], [1, 1, 1, 0], [0, 0, 1, 0], [0, 0, 0, 0]],
      [[0, 1, 0, 0], [0, 1, 0, 0], [1, 1, 0, 0], [0, 0, 0, 0]],
    ],
    L: [
      [[0, 0, 1, 0], [1, 1, 1, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
      [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 1, 0], [0, 0, 0, 0]],
      [[0, 0, 0, 0], [1, 1, 1, 0], [1, 0, 0, 0], [0, 0, 0, 0]],
      [[1, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]],
    ],
  };

  const PIECE_NAMES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  const PIECE_IDS = { I: 1, O: 2, T: 3, S: 4, Z: 5, J: 6, L: 7 };

  // Scoring
  const LINE_SCORES = [0, 100, 300, 500, 800];
  const COMBO_BONUS = 50; // per combo level per line

  // Speed curve (ms per drop) — index = level
  const SPEEDS = [];
  for (let i = 0; i <= 30; i++) {
    SPEEDS.push(Math.max(80, 800 - i * 45));
  }

  // DAS / ARR constants (ms)
  const DAS_DELAY = 170;   // initial delay before auto-repeat
  const ARR_RATE = 50;     // repeat rate once DAS is charged

  // ---- Reduced Motion ----
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- DOM ----
  const canvas = document.getElementById('game-board');
  const ctx = canvas.getContext('2d');
  const prevCanvas = document.getElementById('preview-canvas');
  const prevCtx = prevCanvas.getContext('2d');
  const holdCanvas = document.getElementById('hold-canvas');
  const holdCtx = holdCanvas.getContext('2d');
  const scoreEl = document.getElementById('score-value');
  const levelEl = document.getElementById('level-value');
  const linesEl = document.getElementById('lines-value');
  const highScoreEl = document.getElementById('high-score-value');
  const comboEl = document.getElementById('combo-value');
  const btnStart = document.getElementById('btn-start');
  const btnPause = document.getElementById('btn-pause');
  const overlay = document.getElementById('game-over-overlay');
  const overlayScore = document.getElementById('overlay-score');
  const overlayHigh = document.getElementById('overlay-high');
  const petalContainer = document.getElementById('petal-container');
  const levelFlash = document.getElementById('level-flash');
  const pauseOverlay = document.getElementById('pause-overlay');
  const boardContainer = document.querySelector('.board-container');
  const btnTheme = document.getElementById('btn-theme');
  const btnSpeed = document.getElementById('btn-speed');

  // ---- Dark/Light Mode ----
  let lightMode = localStorage.getItem('sakuraTetrisTheme') === 'light';
  function applyColorMode() {
    document.body.classList.toggle('light-mode', lightMode);
    btnTheme.textContent = lightMode ? '☀️ Light' : '🌙 Dark';
    localStorage.setItem('sakuraTetrisTheme', lightMode ? 'light' : 'dark');
  }
  applyColorMode();
  btnTheme.addEventListener('click', () => {
    lightMode = !lightMode;
    applyColorMode();
    if (!started || gameOver) drawInitialScreen();
    else drawBoard();
  });

  // ---- Speed Mode ----
  let speedMode = false;
  btnSpeed.addEventListener('click', () => {
    speedMode = !speedMode;
    btnSpeed.textContent = speedMode ? '⚡ Fast' : '🐢 Normal';
  });

  // ---- Phase 3: Audio Engine (Improved) ----
  let audioCtx = null;
  let sfxGain = null;    // master gain for SFX
  let musicGain = null;  // master gain for music
  let sfxVolume = parseInt(localStorage.getItem('sakuraTetrisSfxVol') ?? '60') / 100;
  let musicVolume = parseInt(localStorage.getItem('sakuraTetrisMusicVol') ?? '40') / 100;
  let musicScheduled = [];  // scheduled oscillator nodes
  let musicPlaying = false;
  let musicLoopTimer = null;

  const volSfxSlider = document.getElementById('vol-sfx');
  const volMusicSlider = document.getElementById('vol-music');
  volSfxSlider.value = sfxVolume * 100;
  volMusicSlider.value = musicVolume * 100;

  function ensureAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      sfxGain = audioCtx.createGain();
      sfxGain.gain.value = sfxVolume;
      sfxGain.connect(audioCtx.destination);
      musicGain = audioCtx.createGain();
      musicGain.gain.value = musicVolume;
      musicGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Volume slider handlers
  volSfxSlider.addEventListener('input', (e) => {
    sfxVolume = e.target.value / 100;
    localStorage.setItem('sakuraTetrisSfxVol', e.target.value);
    if (sfxGain) sfxGain.gain.value = sfxVolume;
  });
  volMusicSlider.addEventListener('input', (e) => {
    musicVolume = e.target.value / 100;
    localStorage.setItem('sakuraTetrisMusicVol', e.target.value);
    if (musicGain) musicGain.gain.value = musicVolume;
  });

  function playTone(freq, duration, type = 'sine', volume = 0.15) {
    if (sfxVolume === 0 || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  function playMove() { playTone(300, 0.04, 'sine', 0.08); }
  function playRotate() { playTone(660, 0.07, 'sine', 0.1); }
  function playHoldSound() { playTone(550, 0.05, 'sine', 0.08); }
  function playLockSound() { playTone(140, 0.1, 'triangle', 0.12); }
  function playHardDropSound() {
    playTone(180, 0.08, 'triangle', 0.1);
    setTimeout(() => playTone(110, 0.12, 'sine', 0.06), 30);
  }

  function playLineClear(count) {
    if (sfxVolume === 0 || !audioCtx) return;
    const notes = [523, 659, 784, 1047];
    const n = Math.min(count, 4);
    for (let i = 0; i < n; i++) {
      setTimeout(() => playTone(notes[i], 0.18, 'sine', 0.1), i * 70);
    }
  }

  function playTetrisSound() {
    if (sfxVolume === 0 || !audioCtx) return;
    const notes = [1047, 988, 880, 784, 659];
    notes.forEach((f, i) => {
      setTimeout(() => playTone(f, 0.2, 'sine', 0.09), i * 75);
    });
  }

  function playGameOverSound() {
    if (sfxVolume === 0 || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.6);
    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.7);
  }

  // ---- Korobeiniki Lo-fi Chill ----
  // Melody dropped one octave, original longer durations for a relaxed feel
  const MELODY = [
    // Part A — warm mid-range
    [330, 2], [247, 1], [262, 1], [294, 2], [262, 1], [247, 1],
    [220, 2], [220, 1], [262, 1], [330, 2], [294, 1], [262, 1],
    [247, 2], [247, 1], [262, 1], [294, 2], [330, 2],
    [262, 2], [220, 2], [220, 2], [0, 2],
    // Part B
    [294, 2], [349, 1], [440, 2], [392, 1], [349, 1],
    [330, 2], [262, 1], [330, 2], [294, 1], [262, 1],
    [247, 2], [247, 1], [262, 1], [294, 2], [330, 2],
    [262, 2], [220, 2], [220, 2], [0, 2],
  ];

  // Bass — low and gentle
  const BASS = [
    // Part A
    [82, 4], [73, 4],
    [55, 4], [82, 4],
    [62, 4], [73, 4],
    [65, 4], [55, 4],
    // Part B
    [73, 4], [82, 4],
    [65, 4], [82, 4],
    [62, 4], [73, 4],
    [65, 4], [55, 4],
  ];

  // ---- Music Engine (metallic lo-fi) ----
  function scheduleMusicNote(freq, startTime, duration, type = 'sine', vol = 0.06) {
    if (!audioCtx || !musicGain) return;
    // Main tone
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    // Smooth envelope
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.05);
    gain.gain.setValueAtTime(vol * 0.7, startTime + duration * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.95);
    osc.connect(gain);
    gain.connect(musicGain);
    osc.start(startTime);
    osc.stop(startTime + duration);
    musicScheduled.push(osc);

    // Metallic shimmer layer (quiet sawtooth)
    if (type === 'sine') {
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.value = freq;
      osc2.detune.value = 5;
      gain2.gain.setValueAtTime(0.001, startTime);
      gain2.gain.linearRampToValueAtTime(vol * 0.12, startTime + 0.03);
      gain2.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.6);
      osc2.connect(gain2);
      gain2.connect(musicGain);
      osc2.start(startTime);
      osc2.stop(startTime + duration);
      musicScheduled.push(osc2);
    }
  }

  // Gentle chime on level-up
  function playLevelUpChime(lvl) {
    if (sfxVolume === 0 || !audioCtx) return;
    const notes = [262, 330, 392, 440, 494, 523, 587, 659];
    const base = notes[(lvl - 1) % notes.length];
    [base, base * 1.25, base * 1.5].forEach((freq, i) => {
      setTimeout(() => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(sfxGain);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      }, i * 120);
    });
  }

  // Subtle pitch shift per level
  function getLevelPitchMultiplier() {
    const semitones = ((level - 1) % 8) * 1;
    return Math.pow(2, semitones / 12);
  }

  function playKorobeiniki() {
    if (musicVolume === 0 || !audioCtx || paused || gameOver || !started) {
      musicPlaying = false;
      return;
    }
    musicPlaying = true;

    // Speeds up noticeably per level
    const bpm = Math.min(260, 120 + (level - 1) * 8);
    const beatDur = 60 / bpm;
    const pitch = getLevelPitchMultiplier();

    const now = audioCtx.currentTime + 0.05;
    let totalBeats = 0;

    // Melody — sine + metallic shimmer
    let t = 0;
    MELODY.forEach(([freq, beats]) => {
      const dur = beats * beatDur;
      if (freq > 0) {
        scheduleMusicNote(freq * pitch, now + t, dur * 0.92, 'sine', 0.045);
      }
      t += dur;
    });
    totalBeats = t;

    // Bass — warm triangle
    let tb = 0;
    BASS.forEach(([freq, beats]) => {
      const dur = beats * beatDur;
      if (freq > 0) {
        scheduleMusicNote(freq * Math.pow(pitch, 0.5), now + tb, dur * 0.85, 'triangle', 0.025);
      }
      tb += dur;
    });

    // Loop
    musicLoopTimer = setTimeout(() => {
      if (musicVolume > 0 && started && !gameOver && !paused) {
        playKorobeiniki();
      } else {
        musicPlaying = false;
      }
    }, totalBeats * 1000);
  }

  function stopMusic() {
    if (musicLoopTimer) {
      clearTimeout(musicLoopTimer);
      musicLoopTimer = null;
    }
    // Stop all scheduled oscillators
    musicScheduled.forEach(osc => {
      try { osc.stop(); } catch (e) { }
    });
    musicScheduled = [];
    musicPlaying = false;
  }

  function resumeMusic() {
    if (musicVolume > 0 && started && !gameOver && !paused && !musicPlaying) {
      playKorobeiniki();
    }
  }

  // M key toggles music on/off via slider
  function toggleMusic() {
    if (musicVolume > 0) {
      musicVolume = 0;
      volMusicSlider.value = 0;
      localStorage.setItem('sakuraTetrisMusicVol', '0');
      if (musicGain) musicGain.gain.value = 0;
      stopMusic();
    } else {
      musicVolume = 0.4;
      volMusicSlider.value = 40;
      localStorage.setItem('sakuraTetrisMusicVol', '40');
      if (musicGain) musicGain.gain.value = 0.4;
      ensureAudio();
      resumeMusic();
    }
  }

  canvas.width = COLS * BLOCK_SIZE;
  canvas.height = ROWS * BLOCK_SIZE;
  prevCanvas.width = PREVIEW_GRID * PREVIEW_BLOCK;
  prevCanvas.height = PREVIEW_GRID * PREVIEW_BLOCK;
  holdCanvas.width = PREVIEW_GRID * PREVIEW_BLOCK;
  holdCanvas.height = PREVIEW_GRID * PREVIEW_BLOCK;

  // ---- State ----
  let board = [];
  let current = null;   // { name, id, rotation, x, y }
  let next = null;
  let hold = null;       // held piece { name, id }
  let holdUsed = false;  // can only hold once per drop
  let score = 0;
  let level = 1;
  let lines = 0;
  let highScore = parseInt(localStorage.getItem('sakuraTetrisHigh') || '0', 10);
  let combo = -1;        // combo counter (-1 = no active combo)
  let backToBack = false; // back-to-back difficult clear
  let gameOver = false;
  let paused = false;
  let started = false;
  let lastDrop = 0;
  let animFrameId = null;
  let lockDelay = 0;
  const LOCK_DELAY_MAX = 500; // ms

  // Phase 2: Particle system
  let particles = [];

  // Phase 2: Lock shimmer
  let lockShimmer = null; // { cells: [{x,y,id}], startTime }
  const SHIMMER_DURATION = 350; // ms

  // Phase 2: Score rolling animation
  let displayScore = 0;
  let displayHighScore = 0;
  let scoreAnimId = null;

  // DAS state
  const keysDown = {};
  let dasTimer = {};      // key -> timestamp when pressed
  let dasCharged = {};    // key -> bool

  // ---- Level Themes ----
  const LEVEL_THEMES = [
    { name: 'Sakura', bg: ['#1a0a10', '#2d1028', '#0f0a1a'], glow: '255, 183, 197', accent: '#FFB7C5' },
    { name: 'Ocean', bg: ['#0a1628', '#0d2137', '#061224'], glow: '100, 200, 255', accent: '#64C8FF' },
    { name: 'Forest', bg: ['#0a1a0e', '#122d16', '#0a1f0f'], glow: '134, 239, 172', accent: '#86EFAC' },
    { name: 'Sunset', bg: ['#1a0f08', '#2d1a0e', '#1a0a06'], glow: '251, 146, 60', accent: '#FB923C' },
    { name: 'Cosmic', bg: ['#12061a', '#1e0a2d', '#0d0618'], glow: '192, 132, 252', accent: '#C084FC' },
    { name: 'Golden', bg: ['#1a1508', '#2d2410', '#1a1005'], glow: '251, 191, 36', accent: '#FBBF24' },
    { name: 'Neon', bg: ['#0a0a1a', '#0d1030', '#08081e'], glow: '129, 140, 248', accent: '#818CF8' },
    { name: 'Ice', bg: ['#081418', '#0c2028', '#061018'], glow: '103, 232, 249', accent: '#67E8F9' },
  ];

  function applyTheme(lvl) {
    const theme = LEVEL_THEMES[(lvl - 1) % LEVEL_THEMES.length];
    const root = document.documentElement;
    root.style.setProperty('--sakura-bg-start', theme.bg[0]);
    root.style.setProperty('--sakura-bg-mid', theme.bg[1]);
    root.style.setProperty('--sakura-bg-end', theme.bg[2]);
    boardContainer.style.setProperty('--board-glow-color', theme.glow);
    boardContainer.style.setProperty('--board-glow-intensity', '0.15');
    // Flash the glow brighter then settle
    setTimeout(() => {
      boardContainer.style.setProperty('--board-glow-intensity', '0.1');
    }, 800);
  }

  function triggerShake(intensity = 1) {
    if (prefersReducedMotion) return;
    boardContainer.classList.remove('board-shake');
    // Force reflow to restart animation
    void boardContainer.offsetWidth;
    boardContainer.classList.add('board-shake');
    boardContainer.addEventListener('animationend', () => {
      boardContainer.classList.remove('board-shake');
    }, { once: true });
  }

  // -- random bag --
  let bag = [];
  function refillBag() {
    bag = [...PIECE_NAMES].sort(() => Math.random() - 0.5);
  }
  function nextFromBag() {
    if (bag.length === 0) refillBag();
    return bag.pop();
  }

  // ---- Board helpers ----
  function createBoard() {
    return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
  }

  function getShape(name, rotation) {
    return SHAPES[name][rotation];
  }

  function collides(name, rotation, px, py) {
    const shape = getShape(name, rotation);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!shape[r][c]) continue;
        const nx = px + c;
        const ny = py + r;
        if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
        if (ny >= 0 && board[ny][nx]) return true;
      }
    }
    return false;
  }

  function lock() {
    const shape = getShape(current.name, current.rotation);
    const lockedCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!shape[r][c]) continue;
        const ny = current.y + r;
        const nx = current.x + c;
        if (ny < 0) {
          triggerGameOver();
          return;
        }
        board[ny][nx] = current.id;
        lockedCells.push({ x: nx, y: ny, id: current.id });
      }
    }

    // Phase 2: Lock shimmer effect
    lockShimmer = { cells: lockedCells, startTime: performance.now() };

    playLockSound();
    holdUsed = false;   // allow hold again after lock
    clearLines();
    spawnPiece();
  }

  function clearLines() {
    let cleared = 0;
    const flashRows = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r].every(v => v !== 0)) {
        flashRows.push(r);
        cleared++;
      }
    }

    if (cleared === 0) {
      combo = -1; // reset combo
      return;
    }

    // combo tracking
    combo++;

    // back-to-back: tetris or t-spin (we track tetris for now)
    const isDifficult = (cleared === 4);
    let b2bBonus = 0;
    if (isDifficult) {
      if (backToBack) {
        b2bBonus = Math.floor(LINE_SCORES[cleared] * level * 0.5);
      }
      backToBack = true;
    } else {
      backToBack = false;
    }

    // Phase 2: Spawn particles for each cleared row
    if (!prefersReducedMotion) {
      flashRows.forEach(row => {
        spawnLineClearParticles(row);
      });
    }

    // Screen shake on line clear
    triggerShake(cleared);

    // Phase 3: Sound
    if (cleared === 4) {
      playTetrisSound();
    } else {
      playLineClear(cleared);
    }

    // flash effect (kept as secondary effect)
    flashRows.forEach(row => {
      const flash = document.createElement('div');
      flash.className = 'line-clear-flash';
      flash.style.top = (16 + row * BLOCK_SIZE) + 'px';
      flash.style.height = BLOCK_SIZE + 'px';
      boardContainer.appendChild(flash);
      flash.addEventListener('animationend', () => flash.remove());
    });

    // Phase 2: Petal burst on Tetris
    if (cleared === 4 && !prefersReducedMotion) {
      const centerRow = flashRows.reduce((a, b) => a + b, 0) / flashRows.length;
      spawnPetalBurst(centerRow);
    }

    // remove rows
    for (let i = flashRows.length - 1; i >= 0; i--) {
      board.splice(flashRows[i], 1);
    }
    while (board.length < ROWS) {
      board.unshift(new Array(COLS).fill(0));
    }

    const prevLevel = level;

    lines += cleared;
    score += LINE_SCORES[cleared] * level;
    score += combo * COMBO_BONUS * cleared;  // combo bonus
    score += b2bBonus;                        // back-to-back bonus
    level = Math.floor(lines / 10) + 1;

    // level-up: theme change + chime
    if (level > prevLevel) {
      showLevelFlash(level);
      applyTheme(level);
      playLevelUpChime(level);
      // Restart music with new pitch
      stopMusic();
      setTimeout(() => resumeMusic(), 400);
    }

    // Phase 2: Update board glow
    updateBoardGlow();

    updateHUD();
  }

  // ---- Level Up Flash ----
  function showLevelFlash(newLevel) {
    levelFlash.textContent = `Level ${newLevel}`;
    levelFlash.classList.add('visible');
    setTimeout(() => {
      levelFlash.classList.remove('visible');
    }, 1200);
  }

  // ---- Phase 2: Particle System ----
  function spawnLineClearParticles(row) {
    const count = 25;
    for (let i = 0; i < count; i++) {
      const colorIdx = Math.floor(Math.random() * 7) + 1;
      particles.push({
        x: Math.random() * (COLS * BLOCK_SIZE),
        y: row * BLOCK_SIZE + BLOCK_SIZE / 2,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.8) * 5,
        life: 1,
        decay: 0.015 + Math.random() * 0.02,
        color: COLORS[colorIdx],
        glow: GLOW_COLORS[colorIdx],
        size: 2 + Math.random() * 3,
      });
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08; // gravity
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = p.life * 0.9;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.glow;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ---- Phase 2: Lock Shimmer ----
  function drawLockShimmer() {
    if (!lockShimmer) return;
    const elapsed = performance.now() - lockShimmer.startTime;
    if (elapsed > SHIMMER_DURATION) {
      lockShimmer = null;
      return;
    }
    const progress = elapsed / SHIMMER_DURATION;
    const alpha = (1 - progress) * 0.5;

    ctx.save();
    ctx.globalAlpha = alpha;
    for (const cell of lockShimmer.cells) {
      const bx = cell.x * BLOCK_SIZE;
      const by = cell.y * BLOCK_SIZE;
      // white glow overlay
      const grad = ctx.createRadialGradient(
        bx + BLOCK_SIZE / 2, by + BLOCK_SIZE / 2, 0,
        bx + BLOCK_SIZE / 2, by + BLOCK_SIZE / 2, BLOCK_SIZE * 0.7
      );
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      grad.addColorStop(0.5, 'rgba(255, 220, 230, 0.3)');
      grad.addColorStop(1, 'rgba(255, 183, 197, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(bx, by, BLOCK_SIZE, BLOCK_SIZE);
    }
    ctx.restore();
  }

  // ---- Phase 2: Petal Burst ----
  function spawnPetalBurst(centerRow) {
    const count = 28;
    const baseX = 16 + (COLS * BLOCK_SIZE) / 2; // center of board + padding
    const baseY = 16 + centerRow * BLOCK_SIZE;

    for (let i = 0; i < count; i++) {
      const petal = document.createElement('div');
      petal.className = 'petal-burst';

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const dist = 60 + Math.random() * 120;
      const bx = Math.cos(angle) * dist;
      const by = Math.sin(angle) * dist;
      const spin = 180 + Math.random() * 540;
      const duration = 0.8 + Math.random() * 0.6;
      const size = 8 + Math.random() * 10;

      petal.style.left = baseX + 'px';
      petal.style.top = baseY + 'px';
      petal.style.width = size + 'px';
      petal.style.height = size + 'px';
      petal.style.setProperty('--burst-x', bx + 'px');
      petal.style.setProperty('--burst-y', by + 'px');
      petal.style.setProperty('--burst-spin', spin + 'deg');
      petal.style.setProperty('--burst-duration', duration + 's');

      boardContainer.appendChild(petal);
      petal.addEventListener('animationend', () => petal.remove());
    }
  }

  // ---- Phase 2: Dynamic Board Glow ----
  function updateBoardGlow() {
    // Intensity: base 0.08, increases with combo and level
    const comboFactor = Math.min(combo, 8) * 0.03;
    const levelFactor = Math.min(level, 15) * 0.008;
    const intensity = 0.08 + comboFactor + levelFactor;

    // Color shifts warmer (more red) at higher combos
    const r = Math.min(255, 255);
    const g = Math.max(100, 183 - combo * 8);
    const b = Math.max(120, 197 - combo * 6);

    boardContainer.style.setProperty('--board-glow-intensity', intensity.toFixed(3));
    boardContainer.style.setProperty('--board-glow-color', `${r}, ${g}, ${b}`);
  }

  // ---- Phase 2: Score Rolling Animation ----
  function animateScore() {
    let changed = false;
    if (displayScore !== score) {
      const diff = score - displayScore;
      const step = Math.max(1, Math.ceil(Math.abs(diff) * 0.12));
      displayScore += diff > 0 ? Math.min(step, diff) : Math.max(-step, diff);
      scoreEl.textContent = displayScore.toLocaleString();
      changed = true;
    }
    if (displayHighScore !== highScore) {
      const diff = highScore - displayHighScore;
      const step = Math.max(1, Math.ceil(Math.abs(diff) * 0.12));
      displayHighScore += diff > 0 ? Math.min(step, diff) : Math.max(-step, diff);
      highScoreEl.textContent = displayHighScore.toLocaleString();
      changed = true;
    }
    if (changed) {
      scoreAnimId = requestAnimationFrame(animateScore);
    } else {
      scoreAnimId = null;
    }
  }

  function triggerScoreAnimation() {
    if (!scoreAnimId) {
      scoreAnimId = requestAnimationFrame(animateScore);
    }
  }

  // ---- Piece ----
  function spawnPiece() {
    const name = next ? next.name : nextFromBag();
    const id = PIECE_IDS[name];
    current = { name, id, rotation: 0, x: 3, y: -1 };

    const nextName = nextFromBag();
    next = { name: nextName, id: PIECE_IDS[nextName] };

    if (collides(current.name, current.rotation, current.x, current.y)) {
      if (collides(current.name, current.rotation, current.x, current.y + 1)) {
        triggerGameOver();
        return;
      }
    }

    lockDelay = 0;
    drawPreview();
  }

  // ---- Hold Piece ----
  function holdPiece() {
    if (holdUsed) return;
    holdUsed = true;

    if (hold === null) {
      hold = { name: current.name, id: current.id };
      spawnPiece();
    } else {
      const temp = { name: current.name, id: current.id };
      const id = PIECE_IDS[hold.name];
      current = { name: hold.name, id, rotation: 0, x: 3, y: -1 };
      hold = temp;

      if (collides(current.name, current.rotation, current.x, current.y)) {
        triggerGameOver();
        return;
      }
    }

    lockDelay = 0;
    drawHold();
  }

  // ---- Ghost ----
  function ghostY() {
    let gy = current.y;
    while (!collides(current.name, current.rotation, current.x, gy + 1)) {
      gy++;
    }
    return gy;
  }

  // ---- Drawing ----
  function drawBlock(context, x, y, colorIdx, size, ghost = false) {
    const bx = x * size;
    const by = y * size;
    const pad = 1;

    if (ghost) {
      context.fillStyle = GHOST_COLORS[colorIdx];
      context.fillRect(bx + pad, by + pad, size - pad * 2, size - pad * 2);
      context.strokeStyle = 'rgba(255,183,197,0.15)';
      context.lineWidth = 1;
      context.strokeRect(bx + pad, by + pad, size - pad * 2, size - pad * 2);
      return;
    }

    // main fill
    context.fillStyle = COLORS[colorIdx];
    context.fillRect(bx + pad, by + pad, size - pad * 2, size - pad * 2);

    // subtle inner highlight
    const grad = context.createLinearGradient(bx, by, bx, by + size);
    grad.addColorStop(0, 'rgba(255,255,255,0.2)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.1)');
    context.fillStyle = grad;
    context.fillRect(bx + pad, by + pad, size - pad * 2, size - pad * 2);

    // glow outline
    context.strokeStyle = GLOW_COLORS[colorIdx];
    context.lineWidth = 0.5;
    context.strokeRect(bx + pad + 0.5, by + pad + 0.5, size - pad * 2 - 1, size - pad * 2 - 1);
  }

  function getBoardBg() {
    return lightMode ? 'rgba(255, 245, 248, 0.92)' : 'rgba(10, 5, 12, 0.92)';
  }
  function getGridColor() {
    return lightMode ? 'rgba(200, 150, 170, 0.1)' : 'rgba(255, 183, 197, 0.04)';
  }
  function getTextColor() {
    return lightMode ? 'rgba(45, 16, 40, 0.4)' : 'rgba(255, 183, 197, 0.4)';
  }

  function drawBoard() {
    // background
    ctx.fillStyle = getBoardBg();
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // subtle grid
    ctx.strokeStyle = getGridColor();
    ctx.lineWidth = 0.5;
    for (let c = 1; c < COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * BLOCK_SIZE, 0);
      ctx.lineTo(c * BLOCK_SIZE, canvas.height);
      ctx.stroke();
    }
    for (let r = 1; r < ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * BLOCK_SIZE);
      ctx.lineTo(canvas.width, r * BLOCK_SIZE);
      ctx.stroke();
    }

    // locked blocks
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c]) {
          drawBlock(ctx, c, r, board[r][c], BLOCK_SIZE);
        }
      }
    }

    // Phase 2: lock shimmer (drawn over locked blocks)
    drawLockShimmer();

    if (!current || gameOver) {
      // Still draw particles when game over
      updateParticles();
      drawParticles();
      return;
    }

    // ghost
    const gy = ghostY();
    const shape = getShape(current.name, current.rotation);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!shape[r][c]) continue;
        const py = gy + r;
        if (py >= 0) drawBlock(ctx, current.x + c, py, current.id, BLOCK_SIZE, true);
      }
    }

    // current piece
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!shape[r][c]) continue;
        const py = current.y + r;
        if (py >= 0) drawBlock(ctx, current.x + c, py, current.id, BLOCK_SIZE);
      }
    }

    // Phase 2: particles on top
    updateParticles();
    drawParticles();
  }

  // Helper: get bounding box of a piece shape for centering
  function getShapeBounds(name) {
    const shape = getShape(name, 0);
    let minR = 4, maxR = 0, minC = 4, maxC = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (shape[r][c]) {
          minR = Math.min(minR, r);
          maxR = Math.max(maxR, r);
          minC = Math.min(minC, c);
          maxC = Math.max(maxC, c);
        }
      }
    }
    return { minR, maxR, minC, maxC, w: maxC - minC + 1, h: maxR - minR + 1 };
  }

  function drawPiecePreview(context, canvasEl, piece) {
    context.fillStyle = 'rgba(10, 5, 12, 0.6)';
    context.fillRect(0, 0, canvasEl.width, canvasEl.height);

    if (!piece) return;

    const bounds = getShapeBounds(piece.name);
    const shape = getShape(piece.name, 0);
    const gridPx = PREVIEW_BLOCK;

    // center offset
    const offsetX = (canvasEl.width - bounds.w * gridPx) / 2 - bounds.minC * gridPx;
    const offsetY = (canvasEl.height - bounds.h * gridPx) / 2 - bounds.minR * gridPx;

    context.save();
    context.translate(offsetX, offsetY);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (shape[r][c]) {
          drawBlock(context, c, r, piece.id, gridPx);
        }
      }
    }
    context.restore();
  }

  function drawPreview() {
    drawPiecePreview(prevCtx, prevCanvas, next);
  }

  function drawHold() {
    drawPiecePreview(holdCtx, holdCanvas, hold);
  }

  function updateHUD() {
    // Phase 2: score rolls instead of jumping
    levelEl.textContent = level;
    linesEl.textContent = lines;
    comboEl.textContent = combo > 0 ? `${combo}x` : '—';

    // high score live update
    if (score > highScore) {
      highScore = score;
    }

    // Trigger rolling animation
    triggerScoreAnimation();
  }

  // ---- Movement ----
  function moveLeft() {
    if (!collides(current.name, current.rotation, current.x - 1, current.y)) {
      current.x--;
      lockDelay = 0;
      playMove();
      return true;
    }
    return false;
  }
  function moveRight() {
    if (!collides(current.name, current.rotation, current.x + 1, current.y)) {
      current.x++;
      lockDelay = 0;
      playMove();
      return true;
    }
    return false;
  }
  function moveDown() {
    if (!collides(current.name, current.rotation, current.x, current.y + 1)) {
      current.y++;
      lockDelay = 0;
      return true;
    }
    return false;
  }
  function hardDrop() {
    let dropped = 0;
    while (!collides(current.name, current.rotation, current.x, current.y + 1)) {
      current.y++;
      dropped++;
    }
    score += dropped * 2;
    playHardDropSound();
    triggerShake();
    updateHUD();
    lock();
  }

  // ---- SRS Rotation ----
  function rotate(direction = 1) {
    if (current.name === 'O') return; // O doesn't rotate

    const oldRot = current.rotation;
    const newRot = (oldRot + direction + 4) % 4;
    const key = `${oldRot}>${newRot}`;

    const kickTable = current.name === 'I' ? KICK_TABLE_I : KICK_TABLE_JLSTZ;
    const offsets = kickTable[key];

    if (!offsets) return;

    for (const [dx, dy] of offsets) {
      if (!collides(current.name, newRot, current.x + dx, current.y - dy)) {
        current.x += dx;
        current.y -= dy;
        current.rotation = newRot;
        lockDelay = 0;
        playRotate();
        return;
      }
    }
  }

  // ---- DAS / ARR ----
  function handleDAS(timestamp) {
    if (paused || gameOver || !started || !current) return;

    const processKey = (key, action) => {
      if (!keysDown[key]) return;
      const elapsed = timestamp - dasTimer[key];
      if (!dasCharged[key]) {
        if (elapsed >= DAS_DELAY) {
          dasCharged[key] = true;
          action();
          dasTimer[key] = timestamp; // reset for ARR
        }
      } else {
        if (elapsed >= ARR_RATE) {
          action();
          dasTimer[key] = timestamp;
        }
      }
    };

    processKey('ArrowLeft', moveLeft);
    processKey('ArrowRight', moveRight);
    processKey('ArrowDown', () => {
      if (moveDown()) {
        score += 1;
        updateHUD();
      }
    });
  }

  // ---- Game Loop ----
  function loop(timestamp) {
    if (gameOver || paused) return;

    let speed = SPEEDS[Math.min(level, SPEEDS.length - 1)];
    if (speedMode) speed = Math.max(30, speed * 0.35); // 3x faster in speed mode
    const delta = timestamp - lastDrop;

    // DAS handling
    handleDAS(timestamp);

    if (delta >= speed) {
      if (!moveDown()) {
        lockDelay += delta;
        if (lockDelay >= LOCK_DELAY_MAX) {
          lock();
          lockDelay = 0;
        }
      } else {
        lockDelay = 0;
      }
      lastDrop = timestamp;
    }

    drawBoard();
    animFrameId = requestAnimationFrame(loop);
  }

  // ---- Controls ----
  document.addEventListener('keydown', (e) => {
    if (!started || gameOver) {
      // Allow starting with Enter or button
      if (e.key === 'Enter' && !started) {
        e.preventDefault();
        ensureAudio();
        startGame();
      }
      return;
    }

    if (e.key === 'p' || e.key === 'P') {
      togglePause();
      return;
    }
    if (e.key === 'm' || e.key === 'M') {
      toggleMusic();
      return;
    }

    if (paused) return;

    // Only handle the initial press (not auto-repeat from OS)
    if (e.repeat) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        keysDown['ArrowLeft'] = true;
        dasTimer['ArrowLeft'] = performance.now();
        dasCharged['ArrowLeft'] = false;
        moveLeft();
        break;
      case 'ArrowRight':
        e.preventDefault();
        keysDown['ArrowRight'] = true;
        dasTimer['ArrowRight'] = performance.now();
        dasCharged['ArrowRight'] = false;
        moveRight();
        break;
      case 'ArrowDown':
        e.preventDefault();
        keysDown['ArrowDown'] = true;
        dasTimer['ArrowDown'] = performance.now();
        dasCharged['ArrowDown'] = false;
        if (moveDown()) {
          score += 1;
          updateHUD();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        rotate(1); // clockwise
        break;
      case 'z':
      case 'Z':
        e.preventDefault();
        rotate(-1); // counter-clockwise
        break;
      case ' ':
        e.preventDefault();
        hardDrop();
        break;
      case 'c':
      case 'C':
        playHoldSound();
        e.preventDefault();
        holdPiece();
        break;
    }

    drawBoard();
  });

  document.addEventListener('keyup', (e) => {
    keysDown[e.key] = false;
    dasCharged[e.key] = false;
  });

  // ---- Game Control ----
  function startGame() {
    ensureAudio();
    board = createBoard();
    score = 0;
    displayScore = 0;
    displayHighScore = highScore;
    level = 1;
    lines = 0;
    combo = -1;
    backToBack = false;
    gameOver = false;
    paused = false;
    started = true;
    current = null;
    next = null;
    hold = null;
    holdUsed = false;
    bag = [];
    lockDelay = 0;
    particles = [];
    lockShimmer = null;

    overlay.classList.remove('visible');
    pauseOverlay.classList.remove('visible');

    // Reset board glow
    boardContainer.style.setProperty('--board-glow-intensity', '0.08');
    boardContainer.style.setProperty('--board-glow-color', '255, 183, 197');

    // Apply level 1 theme
    applyTheme(1);

    // Start music
    stopMusic();
    setTimeout(() => resumeMusic(), 300);

    updateHUD();
    drawHold();
    spawnPiece();
    drawBoard();

    lastDrop = performance.now();
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = requestAnimationFrame(loop);

    btnStart.textContent = 'Restart';
    btnPause.textContent = 'Pause';
  }

  function togglePause() {
    if (gameOver || !started) return;
    paused = !paused;
    btnPause.textContent = paused ? 'Resume' : 'Pause';

    // Phase 2: Pause overlay
    if (paused) {
      pauseOverlay.classList.add('visible');
      stopMusic();
    } else {
      pauseOverlay.classList.remove('visible');
      lastDrop = performance.now();
      animFrameId = requestAnimationFrame(loop);
      resumeMusic();
    }
  }

  function triggerGameOver() {
    gameOver = true;
    started = false;

    // save high score
    if (score > highScore) {
      highScore = score;
    }
    localStorage.setItem('sakuraTetrisHigh', String(highScore));

    overlayScore.textContent = `Score: ${score.toLocaleString()}`;
    overlayHigh.textContent = `Best: ${highScore.toLocaleString()}`;
    overlay.classList.add('visible');
    btnStart.textContent = 'Play Again';
    playGameOverSound();
    stopMusic();
  }

  btnStart.addEventListener('click', () => { ensureAudio(); startGame(); });
  btnPause.addEventListener('click', togglePause);

  // ---- Falling Petals (Background) ----
  function spawnPetal() {
    const petal = document.createElement('div');
    const sizeClass = Math.random() < 0.3 ? 'small' : (Math.random() < 0.5 ? 'large' : '');
    petal.className = `petal ${sizeClass}`.trim();

    const startX = Math.random() * 100;
    const drift = (Math.random() - 0.5) * 200;
    const duration = 8 + Math.random() * 12;
    const delay = Math.random() * 2;
    const spin = 180 + Math.random() * 540;

    petal.style.left = startX + '%';
    petal.style.setProperty('--drift', drift + 'px');
    petal.style.setProperty('--spin', spin + 'deg');
    petal.style.animationDuration = duration + 's';
    petal.style.animationDelay = delay + 's';

    petalContainer.appendChild(petal);

    setTimeout(() => {
      petal.remove();
    }, (duration + delay) * 1000 + 500);
  }

  // Petals: respect reduced motion
  if (!prefersReducedMotion) {
    setInterval(spawnPetal, 600);
    for (let i = 0; i < 15; i++) {
      setTimeout(spawnPetal, i * 150);
    }
  }

  // ---- Phase 3: Touch Controls ----
  const touchControls = document.getElementById('touch-controls');
  if (touchControls) {
    touchControls.addEventListener('touchstart', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      e.preventDefault();
      ensureAudio();

      const action = btn.dataset.action;
      if (!started && action !== 'pause') {
        startGame();
        return;
      }
      if (paused && action !== 'pause') return;

      switch (action) {
        case 'left': moveLeft(); drawBoard(); break;
        case 'right': moveRight(); drawBoard(); break;
        case 'down':
          if (moveDown()) { score += 1; updateHUD(); }
          drawBoard();
          break;
        case 'drop': hardDrop(); break;
        case 'cw': rotate(1); drawBoard(); break;
        case 'ccw': rotate(-1); drawBoard(); break;
        case 'hold': playHoldSound(); holdPiece(); drawBoard(); break;
        case 'pause': togglePause(); break;
      }
    }, { passive: false });

    // Long-press repeat for left/right/down
    let touchRepeatTimer = null;
    let touchRepeatAction = null;

    touchControls.addEventListener('touchstart', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'left' || action === 'right' || action === 'down') {
        touchRepeatAction = action;
        touchRepeatTimer = setTimeout(() => {
          touchRepeatTimer = setInterval(() => {
            if (!started || paused || gameOver) return;
            if (touchRepeatAction === 'left') { moveLeft(); drawBoard(); }
            else if (touchRepeatAction === 'right') { moveRight(); drawBoard(); }
            else if (touchRepeatAction === 'down') {
              if (moveDown()) { score += 1; updateHUD(); }
              drawBoard();
            }
          }, ARR_RATE);
        }, DAS_DELAY);
      }
    }, { passive: true });

    const clearTouchRepeat = () => {
      if (touchRepeatTimer) { clearTimeout(touchRepeatTimer); clearInterval(touchRepeatTimer); touchRepeatTimer = null; }
      touchRepeatAction = null;
    };
    touchControls.addEventListener('touchend', clearTouchRepeat);
    touchControls.addEventListener('touchcancel', clearTouchRepeat);
  }

  // ---- Swipe gestures on canvas ----
  let touchStartX = 0, touchStartY = 0, touchStartTime = 0;
  canvas.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    touchStartTime = Date.now();
    e.preventDefault();
    ensureAudio();
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    if (!started || paused || gameOver) {
      if (!started) { startGame(); }
      return;
    }
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const elapsed = Date.now() - touchStartTime;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 20 && elapsed < 300) {
      // Tap = rotate
      rotate(1);
      drawBoard();
      return;
    }

    if (dist > 30) {
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > 0) moveRight(); else moveLeft();
      } else {
        // Vertical swipe
        if (dy > 0) {
          if (dy > 80) hardDrop(); else { if (moveDown()) { score += 1; updateHUD(); } }
        }
      }
      drawBoard();
    }
  }, { passive: true });

  // ---- Initial render ----
  displayHighScore = highScore;
  highScoreEl.textContent = highScore.toLocaleString();
  drawBoard();
  drawPreview();
  drawHold();

  // Draw initial "press start" state
  function drawInitialScreen() {
    ctx.fillStyle = getBoardBg();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '500 16px "Zen Maru Gothic", sans-serif';
    ctx.fillStyle = getTextColor();
    ctx.textAlign = 'center';
    ctx.fillText('Press Start to Play', canvas.width / 2, canvas.height / 2);
    ctx.font = '300 11px "Zen Maru Gothic", sans-serif';
    ctx.fillText('桜テトリス', canvas.width / 2, canvas.height / 2 + 28);
  }
  drawInitialScreen();

})();
