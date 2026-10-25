/**
 * Advanced Bubble & Balloon Pop - Core Game Engine 2.0
 * Features:
 * - Dual-Hand Tracking & Multi-Pointer collision
 * - Gesture Superpowers: Sonic Boom Shockwave & Pinch Laser Burst
 * - Advanced Entities: Giga Boss Bubble (Health Bar & Crown), Lightning Chain Bubble, Cluster Bubble
 * - Fruit-Ninja style Luminous Blade Slicing Ribbon
 * - Live Theme Switcher: Cyberpunk, Deep Ocean, Synthwave, Cosmic
 * - Real-time Achievements & Milestones with Toast Notifications
 * - Victory Trophy Selfie Snapshot Cam
 */

const THEMES = {
    cyberpunk: {
        bg1: '#1a1638', bg2: '#0d0f22', bg3: '#05070f',
        accent1: '#00f2fe', accent2: '#ff2a85',
        bubbleGlow: 'rgba(0, 242, 254, 0.4)'
    },
    ocean: {
        bg1: '#002b4d', bg2: '#001428', bg3: '#000814',
        accent1: '#00f093', accent2: '#00c6ff',
        bubbleGlow: 'rgba(0, 240, 147, 0.4)'
    },
    synthwave: {
        bg1: '#2d004d', bg2: '#18002b', bg3: '#090014',
        accent1: '#ff007f', accent2: '#ffd200',
        bubbleGlow: 'rgba(255, 0, 127, 0.4)'
    },
    cosmic: {
        bg1: '#150033', bg2: '#0a001a', bg3: '#020008',
        accent1: '#b300ff', accent2: '#00f2fe',
        bubbleGlow: 'rgba(179, 0, 255, 0.4)'
    }
};

const BALLOON_COLORS = [
    { base: '#ff2a85', highlight: '#ff7ebb', dark: '#b3004b' },
    { base: '#00f2fe', highlight: '#7ef8ff', dark: '#00979e' },
    { base: '#9b51e0', highlight: '#c996ff', dark: '#5e1b9b' },
    { base: '#00f093', highlight: '#73ffc8', dark: '#008f57' },
    { base: '#ff7700', highlight: '#ffaa55', dark: '#b34700' },
    { base: '#ffd200', highlight: '#ffe875', dark: '#b39400' }
];

class Particle {
    constructor(x, y, color, type = 'drop') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = type;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * (type === 'confetti' ? 9 : 14) + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - (type === 'confetti' ? 3.5 : 1);
        this.gravity = type === 'confetti' ? 0.15 : 0.35;
        this.friction = 0.94;
        this.alpha = 1;
        this.decay = Math.random() * 0.02 + 0.015;
        this.size = Math.random() * (type === 'confetti' ? 8 : 5) + 3;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.2;
    }

    update() {
        this.vx *= this.friction;
        this.vy = this.vy * this.friction + this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotSpeed;
        this.alpha -= this.decay;
        return this.alpha > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        if (this.type === 'confetti') {
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size, -this.size / 2, this.size * 2, this.size);
        } else if (this.type === 'spark') {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'ring') {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 2, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}

class FloatingText {
    constructor(x, y, text, color = '#ffd200', size = 28) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.size = size;
        this.alpha = 1;
        this.vy = -2.5;
        this.scale = 0.5;
    }

    update() {
        this.y += this.vy;
        this.vy *= 0.96;
        if (this.scale < 1.2) {
            this.scale += 0.15;
        } else {
            this.scale = 1.0;
        }
        this.alpha -= 0.022;
        return this.alpha > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.font = `800 ${Math.floor(this.size * this.scale)}px 'Fredoka', 'Outfit', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = this.color;
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

class Balloon {
    constructor(canvasWidth, canvasHeight, forcedType = null, customX = null, customY = null, customRadius = null) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        this.radius = customRadius || (Math.floor(Math.random() * 20) + 40);
        this.x = customX !== null ? customX : (Math.random() * (canvasWidth - this.radius * 2.5) + this.radius * 1.25);
        this.y = customY !== null ? customY : (canvasHeight + this.radius + Math.random() * 80);

        const rand = Math.random();
        if (forcedType) {
            this.type = forcedType;
        } else if (rand < 0.07) {
            this.type = 'bomb';      // 7% bomb
        } else if (rand < 0.13) {
            this.type = 'star';      // 6% golden star
        } else if (rand < 0.18) {
            this.type = 'freeze';    // 5% freeze
        } else if (rand < 0.23) {
            this.type = 'lightning'; // 5% electric chain
        } else if (rand < 0.28) {
            this.type = 'frenzy';    // 5% bubble rush
        } else if (rand < 0.32) {
            this.type = 'heart';     // 4% heart
        } else if (rand < 0.36) {
            this.type = 'cluster';   // 4% cluster
        } else {
            this.type = 'standard';
        }

        // Setup Palettes and Points
        if (this.type === 'boss') {
            this.radius = 80;
            this.palette = { base: '#ff0055', highlight: '#ff99bb', dark: '#80002b' };
            this.maxHealth = 6;
            this.health = 6;
            this.points = 250;
        } else if (this.type === 'lightning') {
            this.palette = { base: '#00e5ff', highlight: '#b3ffff', dark: '#007a8a' };
            this.points = 25;
        } else if (this.type === 'cluster') {
            this.palette = { base: '#b300ff', highlight: '#f0b3ff', dark: '#590080' };
            this.points = 20;
        } else if (this.type === 'star') {
            this.palette = { base: '#ffd200', highlight: '#fff6a8', dark: '#d48800' };
            this.points = 50;
        } else if (this.type === 'bomb') {
            this.palette = { base: '#22252a', highlight: '#555b66', dark: '#0d0e11' };
            this.points = -30;
        } else if (this.type === 'freeze') {
            this.palette = { base: '#00f2fe', highlight: '#d0faff', dark: '#0288d1' };
            this.points = 20;
        } else if (this.type === 'frenzy') {
            this.palette = { base: '#ff2a85', highlight: '#ffd200', dark: '#9b51e0' };
            this.points = 25;
        } else if (this.type === 'heart') {
            this.palette = { base: '#ff3366', highlight: '#ff99b3', dark: '#b30030' };
            this.points = 15;
        } else {
            this.palette = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
            this.points = 10;
        }

        // Speed & wobble
        this.baseSpeed = this.type === 'boss' ? 1.0 : (Math.random() * 2.2 + 2.4);
        this.wobbleSpeed = Math.random() * 0.05 + 0.03;
        this.wobbleAmp = this.type === 'boss' ? 0.8 : (Math.random() * 1.5 + 1.2);
        this.wobbleOffset = Math.random() * Math.PI * 2;
        this.stringLength = this.radius * 0.85;
        this.pulse = 0;
        this.hitShake = 0;
    }

    update(timeDilation = 1.0) {
        const speed = this.baseSpeed * timeDilation;
        this.y -= speed;
        this.wobbleOffset += this.wobbleSpeed * timeDilation;
        this.x += Math.sin(this.wobbleOffset) * this.wobbleAmp * timeDilation;
        this.pulse += 0.05 * timeDilation;
        if (this.hitShake > 0) this.hitShake--;

        if (this.x < this.radius) this.x = this.radius;
        if (this.x > this.canvasWidth - this.radius) this.x = this.canvasWidth - this.radius;

        return this.y + this.radius > -40;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + (Math.random() - 0.5) * this.hitShake, this.y);

        const scaleX = 1 + Math.sin(this.wobbleOffset) * 0.04;
        const scaleY = 1 - Math.sin(this.wobbleOffset) * 0.04;
        ctx.scale(scaleX, scaleY);

        // String
        if (this.type !== 'bomb') {
            ctx.beginPath();
            ctx.moveTo(0, this.radius);
            const wave = Math.sin(this.pulse * 2) * 6;
            ctx.quadraticCurveTo(wave, this.radius + this.stringLength * 0.5, wave * 0.5, this.radius + this.stringLength);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = this.type === 'boss' ? 3 : 1.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(-5, this.radius + 3);
            ctx.lineTo(5, this.radius + 3);
            ctx.lineTo(0, this.radius - 2);
            ctx.closePath();
            ctx.fillStyle = this.palette.dark;
            ctx.fill();
        }

        // Spherical 3D Gradient
        const grad = ctx.createRadialGradient(
            -this.radius * 0.3, -this.radius * 0.35, this.radius * 0.1,
            0, 0, this.radius
        );

        if (this.type === 'freeze') {
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.3, '#b3f7ff');
            grad.addColorStop(0.7, '#00f2fe');
            grad.addColorStop(1, '#0277bd');
        } else if (this.type === 'lightning') {
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.4, '#00e5ff');
            grad.addColorStop(1, '#005b66');
        } else if (this.type === 'frenzy') {
            const hue = (this.pulse * 50) % 360;
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.5, `hsl(${hue}, 100%, 65%)`);
            grad.addColorStop(1, `hsl(${(hue + 60) % 360}, 100%, 45%)`);
        } else {
            grad.addColorStop(0, this.palette.highlight);
            grad.addColorStop(0.65, this.palette.base);
            grad.addColorStop(1, this.palette.dark);
        }

        // Outer Glow
        if (this.type === 'boss') {
            ctx.shadowColor = '#ff0055';
            ctx.shadowBlur = 30;
        } else if (this.type === 'lightning') {
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur = 22;
        } else if (this.type === 'star') {
            ctx.shadowColor = '#ffd200';
            ctx.shadowBlur = 20;
        } else if (this.type === 'bomb') {
            ctx.shadowColor = '#ff3366';
            ctx.shadowBlur = 12;
        } else {
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 4;
        }

        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius * 0.9, this.radius * 1.05, 0, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Highlight Glare
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.beginPath();
        ctx.ellipse(
            -this.radius * 0.38,
            -this.radius * 0.42,
            this.radius * 0.28,
            this.radius * 0.16,
            -Math.PI / 4,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.fill();

        // Entity Details
        if (this.type === 'boss') {
            this.drawBossCrown(ctx);
        } else if (this.type === 'lightning') {
            this.drawElectricIcon(ctx);
        } else if (this.type === 'cluster') {
            this.drawClusterIcon(ctx);
        } else if (this.type === 'star') {
            this.drawStarIcon(ctx, 0, 0, 5, this.radius * 0.4, this.radius * 0.2);
        } else if (this.type === 'bomb') {
            this.drawBombDetails(ctx);
        } else if (this.type === 'freeze') {
            this.drawSnowflake(ctx, 0, 0, this.radius * 0.42);
        } else if (this.type === 'frenzy') {
            this.drawSparkleIcon(ctx, 0, 0, this.radius * 0.45);
        } else if (this.type === 'heart') {
            this.drawHeartIcon(ctx, 0, -2, this.radius * 0.4);
        }

        ctx.restore();
    }

    drawBossCrown(ctx) {
        // Boss Health Bar above crown
        const barW = this.radius * 1.6;
        const barH = 10;
        const barY = -this.radius * 1.45;

        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(-barW / 2, barY, barW, barH);
        const healthPct = Math.max(0, this.health / this.maxHealth);
        ctx.fillStyle = healthPct > 0.4 ? '#00f093' : '#ff3366';
        ctx.fillRect(-barW / 2, barY, barW * healthPct, barH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-barW / 2, barY, barW, barH);

        // Crown Icon
        ctx.font = `900 ${Math.floor(this.radius * 0.65)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffd200';
        ctx.fillText('👑', 0, -this.radius * 0.85);

        // Angry / Smirking face
        ctx.fillStyle = '#ffffff';
        ctx.font = `800 ${Math.floor(this.radius * 0.4)}px sans-serif`;
        ctx.fillText('😈', 0, 4);
    }

    drawElectricIcon(ctx) {
        ctx.font = `900 ${Math.floor(this.radius * 0.7)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 12;
        ctx.fillText('⚡', 0, 0);
    }

    drawClusterIcon(ctx) {
        ctx.font = `900 ${Math.floor(this.radius * 0.65)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('✨', 0, 0);
    }

    drawStarIcon(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx, y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffd200';
        ctx.shadowBlur = 10;
        ctx.fill();
    }

    drawBombDetails(ctx) {
        ctx.beginPath();
        ctx.arc(0, -this.radius * 1.05, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ff9900';
        ctx.shadowColor = '#ff3300';
        ctx.shadowBlur = 8;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, -this.radius);
        ctx.quadraticCurveTo(8, -this.radius - 12, 0, -this.radius * 1.05);
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.font = `900 ${Math.floor(this.radius * 0.75)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💣', 0, 2);
    }

    drawSnowflake(ctx, x, y, size) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI) / 3);
            ctx.beginPath();
            ctx.moveTo(-size, 0);
            ctx.lineTo(size, 0);
            ctx.moveTo(-size * 0.6, -size * 0.3);
            ctx.lineTo(-size * 0.6, size * 0.3);
            ctx.moveTo(size * 0.6, -size * 0.3);
            ctx.lineTo(size * 0.6, size * 0.3);
            ctx.stroke();
            ctx.restore();
        }
    }

    drawSparkleIcon(ctx, x, y, size) {
        ctx.font = `700 ${Math.floor(size * 1.3)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('🔥', x, y);
    }

    drawHeartIcon(ctx, x, y, size) {
        ctx.font = `700 ${Math.floor(size * 1.3)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('❤️', x, y);
    }
}

class BubbleGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.bgCanvas = document.getElementById('bg-canvas');
        this.bgCtx = this.bgCanvas ? this.bgCanvas.getContext('2d') : null;

        // Elements
        this.hudScore = document.getElementById('hud-score');
        this.hudTime = document.getElementById('hud-time');
        this.hudBest = document.getElementById('hud-best');
        this.comboDisplay = document.querySelector('.combo-display');
        this.comboBadge = document.querySelector('.combo-badge');
        this.comboBarFill = document.querySelector('.combo-bar-fill');
        this.livesContainer = document.querySelector('.lives-container');
        this.freezeOverlay = document.getElementById('freeze-overlay');
        this.frenzyBanner = document.getElementById('frenzy-banner');
        this.shockwaveGauge = document.getElementById('hud-shockwave-fill');

        // Modals
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.pauseModal = document.getElementById('pause-modal');
        this.gameOverModal = document.getElementById('game-over-modal');
        this.achievementsModal = document.getElementById('achievements-modal');

        // State
        this.state = 'menu';
        this.mode = 'arcade';
        this.inputMode = 'hand';
        this.theme = localStorage.getItem('bubble_theme') || 'cyberpunk';

        this.score = 0;
        this.highScores = {
            arcade: parseInt(localStorage.getItem('bubble_best_arcade') || '0', 10),
            survival: parseInt(localStorage.getItem('bubble_best_survival') || '0', 10),
            zen: parseInt(localStorage.getItem('bubble_best_zen') || '0', 10)
        };

        this.timeLeft = 60;
        this.lives = 3;
        this.maxLives = 3;
        this.totalPopped = 0;
        this.bombsHit = 0;
        this.bossesDefeated = 0;
        this.activeBoss = null;
        this.lastBossSpawnScore = 0;

        // Combo system
        this.combo = 1;
        this.maxCombo = 1;
        this.comboTimer = 0;
        this.comboDuration = 1800;
        this.lastPopTime = 0;

        // Freeze & Frenzy
        this.isFrozen = false;
        this.freezeTimeLeft = 0;
        this.isFrenzy = false;
        this.frenzyTimeLeft = 0;

        // Screen Shake
        this.shakeDuration = 0;
        this.shakeMagnitude = 0;

        // Shockwaves & Lasers
        this.shockwaves = [];
        this.lasers = [];
        this.chainBeams = [];

        // Blade Ribbon Trails for each hand
        this.bladeRibbons = [[], []];

        // Entities
        this.balloons = [];
        this.particles = [];
        this.floatingTexts = [];
        this.bgBubbles = [];

        // Achievements
        this.achievements = {
            blade_master: { name: 'Blade Slicer', desc: 'Slice 3 balloons with high speed', unlocked: false, icon: '🗡️' },
            king_slayer: { name: 'King Slayer', desc: 'Defeat a Giga Boss Bubble', unlocked: false, icon: '👑' },
            shockwave: { name: 'Sonic Boom', desc: 'Detonate a Fist Shockwave', unlocked: false, icon: '💥' },
            lightning: { name: 'Chain Storm', desc: 'Pop a Chain Lightning Bubble', unlocked: false, icon: '⚡' },
            frenzy_god: { name: 'Combo Master', desc: 'Reach a 7x Combo streak', unlocked: false, icon: '🔥' },
            centurion: { name: 'Centurion', desc: 'Score over 1,000 points', unlocked: false, icon: '🏆' }
        };
        this.loadAchievements();

        // Spawn timer
        this.lastSpawnTime = 0;
        this.spawnInterval = 850;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.applyTheme(this.theme);
        this.initBackgroundBubbles();
        this.bindEvents();
        this.updateHUD();

        requestAnimationFrame((t) => this.loop(t));
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        if (this.bgCanvas) {
            this.bgCanvas.width = this.width;
            this.bgCanvas.height = this.height;
        }
    }

    applyTheme(themeKey) {
        this.theme = themeKey;
        localStorage.setItem('bubble_theme', themeKey);
        const t = THEMES[themeKey] || THEMES.cyberpunk;
        document.documentElement.style.setProperty('--bg-primary', t.bg3);
        document.documentElement.style.setProperty('--accent-cyan', t.accent1);
        document.documentElement.style.setProperty('--accent-pink', t.accent2);
    }

    loadAchievements() {
        try {
            const saved = JSON.parse(localStorage.getItem('bubble_achievements') || '{}');
            Object.keys(saved).forEach(k => {
                if (this.achievements[k]) this.achievements[k].unlocked = true;
            });
        } catch (e) {}
    }

    unlockAchievement(key) {
        if (!this.achievements[key] || this.achievements[key].unlocked) return;
        this.achievements[key].unlocked = true;
        try {
            const saved = {};
            Object.keys(this.achievements).forEach(k => {
                if (this.achievements[k].unlocked) saved[k] = true;
            });
            localStorage.setItem('bubble_achievements', JSON.stringify(saved));
        } catch (e) {}

        window.soundEngine.playAchievement();
        this.showAchievementToast(this.achievements[key]);
    }

    showAchievementToast(ach) {
        const toast = document.getElementById('achievement-toast');
        if (!toast) return;
        toast.querySelector('.toast-icon').innerText = ach.icon;
        toast.querySelector('.toast-title').innerText = ach.name;
        toast.querySelector('.toast-desc').innerText = ach.desc;

        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
    }

    initBackgroundBubbles() {
        this.bgBubbles = [];
        for (let i = 0; i < 30; i++) {
            this.bgBubbles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 25 + 8,
                speed: Math.random() * 0.8 + 0.3,
                alpha: Math.random() * 0.25 + 0.05,
                wobble: Math.random() * Math.PI * 2
            });
        }
    }

    bindEvents() {
        // Mode Selector
        document.querySelectorAll('[data-mode]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-mode]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.mode = btn.dataset.mode;
                window.soundEngine.playClick();
                this.updateHUD();
            });
        });

        // Input Selector
        document.querySelectorAll('[data-input]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-input]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.inputMode = btn.dataset.input;
                window.soundEngine.playClick();
                window.visionController.setMode(this.inputMode === 'hand');
            });
        });

        // Theme Selector Buttons
        document.querySelectorAll('[data-theme]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('[data-theme]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.applyTheme(btn.dataset.theme);
                window.soundEngine.playClick();
            });
        });

        // Start Game
        const startBtn = document.getElementById('btn-start-game');
        if (startBtn) startBtn.addEventListener('click', () => this.startGame());

        // Pause / Resume
        const pauseBtn = document.getElementById('btn-pause');
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.pauseGame());

        const resumeBtn = document.getElementById('btn-resume');
        if (resumeBtn) resumeBtn.addEventListener('click', () => this.resumeGame());

        document.querySelectorAll('.btn-restart').forEach(btn => {
            btn.addEventListener('click', () => this.startGame());
        });

        document.querySelectorAll('.btn-menu').forEach(btn => {
            btn.addEventListener('click', () => this.goToMenu());
        });

        // Sound Toggle
        const soundBtn = document.getElementById('btn-toggle-sound');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                const muted = window.soundEngine.toggleMute();
                soundBtn.innerHTML = muted ? '🔇' : '🔊';
            });
        }

        // Music Toggle
        const musicBtn = document.getElementById('btn-toggle-music');
        if (musicBtn) {
            musicBtn.addEventListener('click', () => {
                const enabled = window.soundEngine.toggleMusic();
                musicBtn.innerHTML = enabled ? '🎵' : '🎼';
            });
        }

        // Camera Visibility
        const camToggleBtn = document.getElementById('btn-toggle-cam');
        if (camToggleBtn) {
            camToggleBtn.addEventListener('click', () => {
                const videoEl = document.getElementById('webcam-video');
                if (videoEl) {
                    videoEl.classList.toggle('cam-hidden');
                    camToggleBtn.classList.toggle('active');
                }
            });
        }

        // Skeleton Toggle
        const skelToggleBtn = document.getElementById('btn-toggle-skeleton');
        if (skelToggleBtn) {
            skelToggleBtn.addEventListener('click', () => {
                const show = window.visionController.toggleSkeleton();
                skelToggleBtn.classList.toggle('active', show);
            });
        }

        // Achievements Modal
        const achBtn = document.getElementById('btn-achievements');
        if (achBtn) {
            achBtn.addEventListener('click', () => this.openAchievementsModal());
        }

        const closeAchBtn = document.getElementById('btn-close-achievements');
        if (closeAchBtn) {
            closeAchBtn.addEventListener('click', () => this.achievementsModal.classList.remove('active'));
        }

        // Selfie Trophy Photo Snapshot
        const snapshotBtn = document.getElementById('btn-trophy-snapshot');
        if (snapshotBtn) {
            snapshotBtn.addEventListener('click', () => this.captureTrophyPhoto());
        }

        // Initialize Vision with gesture superpower listeners
        const videoEl = document.getElementById('webcam-video');
        window.visionController.init(
            videoEl,
            this.canvas,
            (state) => {
                const statusDot = document.querySelector('.status-dot');
                const statusText = document.querySelector('.status-text');
                if (!statusDot || !statusText) return;

                if (state === 'dual') {
                    statusDot.className = 'status-dot active';
                    statusText.innerText = 'Dual-Hand Tracking Active (Both Hands)';
                } else if (state === 'active') {
                    statusDot.className = 'status-dot active';
                    statusText.innerText = 'Hand Tracking Active (Show 2nd Hand to Dual-Wield!)';
                } else if (state === 'searching') {
                    statusDot.className = 'status-dot searching';
                    statusText.innerText = 'Searching for Hand... Show palm to camera';
                } else if (state === 'mouse') {
                    statusDot.className = 'status-dot active';
                    statusText.innerText = 'Mouse & Touch Mode Active';
                } else {
                    statusDot.className = 'status-dot';
                    statusText.innerText = 'Camera Off (Using Mouse / Touch)';
                }
            },
            (gestureType, handIndex, pos) => {
                if (this.state !== 'playing') return;

                if (gestureType === 'shockwave') {
                    this.triggerShockwave(pos.x, pos.y);
                } else if (gestureType === 'pinch') {
                    this.triggerLaserBurst(pos.x, pos.y);
                }
            }
        );
    }

    startGame() {
        window.soundEngine.init();
        window.soundEngine.playClick();
        window.soundEngine.startAmbientMusic();

        this.state = 'playing';
        this.score = 0;
        this.timeLeft = 60;
        this.lives = this.maxLives;
        this.combo = 1;
        this.maxCombo = 1;
        this.comboTimer = 0;
        this.totalPopped = 0;
        this.bombsHit = 0;
        this.bossesDefeated = 0;
        this.activeBoss = null;
        this.lastBossSpawnScore = 0;
        this.isFrozen = false;
        this.freezeTimeLeft = 0;
        this.isFrenzy = false;
        this.frenzyTimeLeft = 0;
        this.balloons = [];
        this.particles = [];
        this.floatingTexts = [];
        this.shockwaves = [];
        this.lasers = [];
        this.chainBeams = [];
        this.bladeRibbons = [[], []];
        this.lastSpawnTime = performance.now();

        this.startScreen.classList.remove('active');
        this.pauseModal.classList.remove('active');
        this.gameOverModal.classList.remove('active');
        this.gameScreen.classList.add('active');

        if (this.inputMode === 'hand') {
            window.visionController.startCamera();
        } else {
            window.visionController.setMode(false);
        }

        this.updateHUD();
        this.updateLivesDisplay();
    }

    pauseGame() {
        if (this.state !== 'playing') return;
        this.state = 'paused';
        window.soundEngine.playClick();
        this.pauseModal.classList.add('active');
    }

    resumeGame() {
        if (this.state !== 'paused') return;
        this.state = 'playing';
        window.soundEngine.playClick();
        this.pauseModal.classList.remove('active');
    }

    goToMenu() {
        this.state = 'menu';
        window.soundEngine.playClick();
        this.pauseModal.classList.remove('active');
        this.gameOverModal.classList.remove('active');
        this.gameScreen.classList.remove('active');
        this.startScreen.classList.add('active');
        this.updateHUD();
    }

    // Trigger Sonic Boom Shockwave
    triggerShockwave(cx, cy) {
        this.unlockAchievement('shockwave');
        window.soundEngine.playShockwave();
        this.shakeDuration = 25;
        this.shakeMagnitude = 20;

        this.shockwaves.push({
            x: cx,
            y: cy,
            radius: 10,
            maxRadius: Math.max(this.width, this.height) * 0.9,
            alpha: 1.0
        });

        this.floatingTexts.push(new FloatingText(cx, cy - 30, 'SONIC BOOM! 💥', '#ff007f', 48));

        // Pop all non-boss balloons in range
        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const b = this.balloons[i];
            if (b.type !== 'bomb') {
                if (b.type === 'boss') {
                    b.health -= 3;
                    b.hitShake = 15;
                    if (b.health <= 0) this.popBalloon(b, i);
                } else {
                    this.popBalloon(b, i);
                }
            }
        }
    }

    // Trigger Laser Burst
    triggerLaserBurst(x, y) {
        window.soundEngine.playLaser();
        this.lasers.push({
            x: x,
            y: y,
            alpha: 1.0,
            width: 14
        });

        // Pierce all balloons directly in the column
        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const b = this.balloons[i];
            if (Math.abs(b.x - x) < b.radius + 20) {
                if (b.type === 'boss') {
                    b.health -= 1;
                    b.hitShake = 10;
                    window.soundEngine.playBossHit();
                    if (b.health <= 0) this.popBalloon(b, i);
                } else {
                    this.popBalloon(b, i);
                }
            }
        }
    }

    // Chain Lightning zap
    triggerLightningChain(startBalloon) {
        this.unlockAchievement('lightning');
        window.soundEngine.playZap();

        let current = startBalloon;
        let chainCount = 0;

        for (let i = this.balloons.length - 1; i >= 0 && chainCount < 3; i--) {
            const other = this.balloons[i];
            if (other !== current && other.type !== 'bomb') {
                const dist = Math.hypot(other.x - current.x, other.y - current.y);
                if (dist < 320) {
                    this.chainBeams.push({
                        x1: current.x, y1: current.y,
                        x2: other.x, y2: other.y,
                        alpha: 1.0
                    });
                    this.popBalloon(other, i);
                    chainCount++;
                }
            }
        }
    }

    popBalloon(balloon, index) {
        this.totalPopped++;

        if (balloon.type === 'boss') {
            balloon.health--;
            balloon.hitShake = 12;
            window.soundEngine.playBossHit();

            for (let i = 0; i < 15; i++) {
                this.particles.push(new Particle(balloon.x, balloon.y, '#ff0055', 'spark'));
            }

            if (balloon.health > 0) return;

            // Defeated Boss!
            this.balloons.splice(index, 1);
            this.activeBoss = null;
            this.bossesDefeated++;
            this.unlockAchievement('king_slayer');
            window.soundEngine.playBossDefeat();

            this.score += balloon.points;
            this.floatingTexts.push(new FloatingText(balloon.x, balloon.y, `BOSS DEFEATED! +${balloon.points} 👑`, '#ffd200', 44));
            this.shakeDuration = 25;
            this.shakeMagnitude = 18;

            // Erupt into 6 star balloons
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const starB = new Balloon(this.width, this.height, 'star', balloon.x + Math.cos(angle) * 40, balloon.y + Math.sin(angle) * 40, 36);
                starB.baseSpeed = 3.5;
                this.balloons.push(starB);
            }
            this.updateHUD();
            return;
        }

        this.balloons.splice(index, 1);

        if (balloon.type === 'bomb') {
            this.bombsHit++;
            this.combo = 1;
            this.shakeDuration = 20;
            this.shakeMagnitude = 18;
            window.soundEngine.playBomb();

            this.score = Math.max(0, this.score + balloon.points);
            this.floatingTexts.push(new FloatingText(balloon.x, balloon.y, `${balloon.points} BOMB!`, '#ff3366', 36));

            for (let i = 0; i < 40; i++) {
                this.particles.push(new Particle(balloon.x, balloon.y, '#ff4400', 'drop'));
                this.particles.push(new Particle(balloon.x, balloon.y, '#333333', 'spark'));
            }
        } else {
            const now = performance.now();
            if (now - this.lastPopTime < this.comboDuration) {
                this.combo++;
            } else {
                this.combo = 1;
            }
            this.lastPopTime = now;
            this.comboTimer = this.comboDuration;

            if (this.combo > this.maxCombo) this.maxCombo = this.combo;
            if (this.combo >= 7) this.unlockAchievement('frenzy_god');

            const multiplier = Math.min(this.combo, 5);
            let earned = balloon.points * multiplier;
            if (this.isFrenzy) earned *= 2;
            this.score += earned;

            if (this.score >= 1000) this.unlockAchievement('centurion');

            // Handle special types
            if (balloon.type === 'lightning') {
                this.triggerLightningChain(balloon);
            } else if (balloon.type === 'cluster') {
                // Split into 3 micro bubbles
                for (let k = 0; k < 3; k++) {
                    const mb = new Balloon(this.width, this.height, 'standard', balloon.x + (k - 1) * 30, balloon.y, 28);
                    mb.baseSpeed = 4.2;
                    this.balloons.push(mb);
                }
                window.soundEngine.playPop(this.combo);
            } else if (balloon.type === 'star') {
                window.soundEngine.playBonus();
            } else if (balloon.type === 'freeze') {
                window.soundEngine.playFreeze();
                this.triggerFreeze();
            } else if (balloon.type === 'frenzy') {
                window.soundEngine.playFrenzy();
                this.triggerFrenzy();
            } else if (balloon.type === 'heart') {
                window.soundEngine.playHeart();
                if (this.mode === 'survival' && this.lives < this.maxLives) {
                    this.lives++;
                    this.updateLivesDisplay();
                } else if (this.mode === 'arcade') {
                    this.timeLeft += 5;
                }
            } else {
                window.soundEngine.playPop(this.combo);
            }

            const scoreText = multiplier > 1 ? `+${earned} (x${multiplier})` : `+${earned}`;
            const textColor = balloon.type === 'star' ? '#ffd200' : (multiplier >= 3 ? '#ff2a85' : '#ffffff');
            this.floatingTexts.push(new FloatingText(balloon.x, balloon.y, scoreText, textColor, 28 + multiplier * 2));

            if (this.combo === 3) {
                this.floatingTexts.push(new FloatingText(balloon.x, balloon.y - 40, 'GREAT! x3', '#00f2fe', 32));
            } else if (this.combo === 5) {
                this.floatingTexts.push(new FloatingText(balloon.x, balloon.y - 40, 'SUPER COMBO x5! 🔥', '#ff2a85', 38));
            } else if (this.combo >= 8 && this.combo % 4 === 0) {
                this.floatingTexts.push(new FloatingText(balloon.x, balloon.y - 40, 'UNSTOPPABLE! 🚀', '#ffd200', 44));
            }

            const particleCount = balloon.type === 'star' ? 35 : 20;
            for (let i = 0; i < particleCount; i++) {
                this.particles.push(new Particle(balloon.x, balloon.y, balloon.palette.base, 'drop'));
                if (balloon.type === 'star' || this.combo >= 4) {
                    this.particles.push(new Particle(balloon.x, balloon.y, '#ffffff', 'spark'));
                }
            }
        }

        // Spawn Boss when score milestone reached
        if (this.score - this.lastBossSpawnScore >= 350 && !this.activeBoss && this.mode !== 'zen') {
            this.spawnBoss();
            this.lastBossSpawnScore = this.score;
        }

        this.updateHUD();
    }

    spawnBoss() {
        this.activeBoss = new Balloon(this.width, this.height, 'boss');
        this.balloons.push(this.activeBoss);
        this.floatingTexts.push(new FloatingText(this.width / 2, this.height * 0.35, '⚠️ MEGA BOSS APPROACHING! 👑', '#ff0055', 46));
        window.soundEngine.playFrenzy();
    }

    triggerFreeze() {
        this.isFrozen = true;
        this.freezeTimeLeft = 5000;
        if (this.freezeOverlay) this.freezeOverlay.classList.add('freeze-active');
        this.floatingTexts.push(new FloatingText(this.width / 2, this.height * 0.4, 'TIME FROZEN! ❄️', '#00f2fe', 42));
    }

    triggerFrenzy() {
        this.isFrenzy = true;
        this.frenzyTimeLeft = 4000;
        if (this.frenzyBanner) this.frenzyBanner.classList.add('frenzy-active');
        this.floatingTexts.push(new FloatingText(this.width / 2, this.height * 0.35, 'BUBBLE RUSH! ⚡', '#ffd200', 48));

        for (let i = 0; i < 8; i++) {
            const b = new Balloon(this.width, this.height, 'star');
            b.y += i * 40;
            this.balloons.push(b);
        }
    }

    triggerGameOver() {
        this.state = 'over';
        const isHighScore = this.score > this.highScores[this.mode];
        if (isHighScore) {
            this.highScores[this.mode] = this.score;
            localStorage.setItem(`bubble_best_${this.mode}`, this.score.toString());
        }

        window.soundEngine.playGameOver(isHighScore);

        let grade = 'C';
        let gradeBadge = '🥉';
        if (this.score >= 1500) { grade = 'SSS'; gradeBadge = '👑'; }
        else if (this.score >= 1000) { grade = 'SS'; gradeBadge = '💎'; }
        else if (this.score >= 600) { grade = 'S'; gradeBadge = '⭐'; }
        else if (this.score >= 350) { grade = 'A'; gradeBadge = '🥇'; }
        else if (this.score >= 180) { grade = 'B'; gradeBadge = '🥈'; }

        const badgeEl = document.querySelector('.game-over-badge');
        if (badgeEl) badgeEl.innerText = gradeBadge;

        const scoreEl = document.querySelector('.big-score');
        if (scoreEl) scoreEl.innerText = this.score;

        const statPopped = document.getElementById('stat-popped');
        if (statPopped) statPopped.innerText = this.totalPopped;

        const statCombo = document.getElementById('stat-max-combo');
        if (statCombo) statCombo.innerText = `${this.maxCombo}x`;

        const statGrade = document.getElementById('stat-grade');
        if (statGrade) statGrade.innerText = grade;

        const newRecordPill = document.querySelector('.new-record-pill');
        if (newRecordPill) {
            newRecordPill.style.display = isHighScore && this.score > 0 ? 'inline-block' : 'none';
        }

        for (let i = 0; i < 80; i++) {
            this.particles.push(new Particle(
                this.width * 0.5 + (Math.random() - 0.5) * 300,
                this.height * 0.4,
                BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)].base,
                'confetti'
            ));
        }

        this.gameOverModal.classList.add('active');
    }

    updateHUD() {
        if (this.hudScore) this.hudScore.innerText = this.score;
        if (this.hudBest) this.hudBest.innerText = this.highScores[this.mode] || 0;

        if (this.hudTime) {
            if (this.mode === 'arcade') {
                this.hudTime.innerText = `${Math.max(0, Math.ceil(this.timeLeft))}s`;
                if (this.timeLeft <= 10) {
                    this.hudTime.classList.add('time-urgent');
                } else {
                    this.hudTime.classList.remove('time-urgent');
                }
            } else if (this.mode === 'survival') {
                this.hudTime.innerText = `${this.totalPopped}`;
                this.hudTime.classList.remove('time-urgent');
            } else {
                this.hudTime.innerText = '∞';
                this.hudTime.classList.remove('time-urgent');
            }
        }

        // Shockwave super-power charge meter
        if (this.shockwaveGauge) {
            const chargePct = Math.floor(window.visionController.superpower.shockwaveCharge * 100);
            this.shockwaveGauge.style.width = `${chargePct}%`;
        }

        const timeCard = document.getElementById('hud-time-card');
        const livesCard = document.getElementById('hud-lives-card');
        if (timeCard && livesCard) {
            if (this.mode === 'survival') {
                timeCard.style.display = 'none';
                livesCard.style.display = 'flex';
            } else {
                timeCard.style.display = 'flex';
                livesCard.style.display = 'none';
            }
        }
    }

    updateLivesDisplay() {
        if (!this.livesContainer) return;
        const hearts = this.livesContainer.querySelectorAll('.heart-icon');
        hearts.forEach((heart, index) => {
            if (index < this.lives) {
                heart.classList.remove('heart-lost');
                heart.innerText = '❤️';
            } else {
                heart.classList.add('heart-lost');
                heart.innerText = '🖤';
            }
        });
    }

    openAchievementsModal() {
        const grid = document.getElementById('achievements-grid');
        if (grid) {
            grid.innerHTML = '';
            Object.values(this.achievements).forEach(ach => {
                const item = document.createElement('div');
                item.className = `achievement-card ${ach.unlocked ? 'unlocked' : 'locked'}`;
                item.innerHTML = `
                    <span class="ach-icon">${ach.icon}</span>
                    <div class="ach-info">
                        <span class="ach-name">${ach.name}</span>
                        <span class="ach-desc">${ach.desc}</span>
                    </div>
                    <span class="ach-status">${ach.unlocked ? '✅' : '🔒'}</span>
                `;
                grid.appendChild(item);
            });
        }
        this.achievementsModal.classList.add('active');
    }

    captureTrophyPhoto() {
        // Offscreen canvas merging camera frame and trophy card
        const snapCanvas = document.createElement('canvas');
        snapCanvas.width = 1280;
        snapCanvas.height = 720;
        const sCtx = snapCanvas.getContext('2d');

        // Draw camera frame if available
        const videoEl = document.getElementById('webcam-video');
        if (videoEl && videoEl.videoWidth) {
            sCtx.save();
            sCtx.translate(1280, 0);
            sCtx.scale(-1, 1);
            sCtx.drawImage(videoEl, 0, 0, 1280, 720);
            sCtx.restore();
        } else {
            // Dark gradient backdrop
            const bgGrad = sCtx.createRadialGradient(640, 360, 100, 640, 360, 700);
            bgGrad.addColorStop(0, '#1a1638');
            bgGrad.addColorStop(1, '#05070f');
            sCtx.fillStyle = bgGrad;
            sCtx.fillRect(0, 0, 1280, 720);
        }

        // Overlay Holographic Trophy Frame
        sCtx.fillStyle = 'rgba(10, 14, 26, 0.75)';
        sCtx.fillRect(340, 120, 600, 480);
        sCtx.strokeStyle = '#00f2fe';
        sCtx.lineWidth = 4;
        sCtx.shadowColor = '#00f2fe';
        sCtx.shadowBlur = 25;
        sCtx.strokeRect(340, 120, 600, 480);

        sCtx.font = "800 48px 'Fredoka', sans-serif";
        sCtx.textAlign = 'center';
        sCtx.fillStyle = '#ffd200';
        sCtx.shadowColor = '#ffd200';
        sCtx.fillText('BUBBLE POP CHAMPION 🏆', 640, 200);

        sCtx.font = "700 80px 'Fredoka', sans-serif";
        sCtx.fillStyle = '#ffffff';
        sCtx.fillText(this.score.toString(), 640, 310);

        sCtx.font = "600 24px 'Outfit', sans-serif";
        sCtx.fillStyle = '#94a3b8';
        sCtx.fillText(`MAX COMBO: ${this.maxCombo}x  |  POPPED: ${this.totalPopped}`, 640, 380);

        const dateStr = new Date().toLocaleDateString();
        sCtx.font = "500 20px 'Outfit', sans-serif";
        sCtx.fillText(`Achieved on ${dateStr}`, 640, 460);

        // Download PNG
        const a = document.createElement('a');
        a.download = `bubble-pop-trophy-${Date.now()}.png`;
        a.href = snapCanvas.toDataURL('image/png');
        a.click();
    }

    updateEntities(delta) {
        if (this.combo > 1) {
            this.comboTimer -= delta;
            if (this.comboTimer <= 0) this.combo = 1;
        }

        if (this.isFrozen) {
            this.freezeTimeLeft -= delta;
            if (this.freezeTimeLeft <= 0) {
                this.isFrozen = false;
                if (this.freezeOverlay) this.freezeOverlay.classList.remove('freeze-active');
            }
        }

        if (this.isFrenzy) {
            this.frenzyTimeLeft -= delta;
            if (this.frenzyTimeLeft <= 0) {
                this.isFrenzy = false;
                if (this.frenzyBanner) this.frenzyBanner.classList.remove('frenzy-active');
            }
        }

        if (this.comboDisplay && this.comboBarFill) {
            if (this.combo > 1) {
                this.comboDisplay.classList.add('combo-active');
                if (this.comboBadge) this.comboBadge.innerText = `${this.combo}x COMBO`;
                const pct = Math.max(0, (this.comboTimer / this.comboDuration) * 100);
                this.comboBarFill.style.width = `${pct}%`;
            } else {
                this.comboDisplay.classList.remove('combo-active');
            }
        }

        if (this.mode === 'arcade') {
            this.timeLeft -= delta / 1000;
            if (this.timeLeft <= 0) {
                this.timeLeft = 0;
                this.updateHUD();
                this.triggerGameOver();
                return;
            }
        }

        const timeDilation = this.isFrozen ? 0.28 : 1.0;

        // Spawning
        const now = performance.now();
        const currentInterval = this.isFrenzy ? 280 : Math.max(420, this.spawnInterval - Math.floor(this.score / 150) * 20);

        if (now - this.lastSpawnTime > currentInterval) {
            this.balloons.push(new Balloon(this.width, this.height));
            this.lastSpawnTime = now;
        }

        // Multi-Pointer Processing (Dual Hands)
        const pointers = window.visionController.pointers;

        pointers.forEach((p, idx) => {
            if (p.active && p.x > 0 && p.y > 0) {
                // Update Blade Ribbon Trail
                const ribbon = this.bladeRibbons[idx];
                ribbon.push({
                    x: p.x,
                    y: p.y,
                    speed: p.speed,
                    alpha: 1.0,
                    color: p.color
                });
                if (ribbon.length > 20) ribbon.shift();

                if (p.isBladeActive) {
                    window.soundEngine.playSwoosh();
                    this.unlockAchievement('blade_master');
                }
            }
        });

        // Decay ribbons
        this.bladeRibbons.forEach(ribbon => {
            for (let i = ribbon.length - 1; i >= 0; i--) {
                ribbon[i].alpha -= 0.05;
                if (ribbon[i].alpha <= 0) ribbon.splice(i, 1);
            }
        });

        // Check Collisions for all active pointers
        const pointerRadius = 34;

        for (let i = this.balloons.length - 1; i >= 0; i--) {
            const b = this.balloons[i];
            const inScreen = b.update(timeDilation);

            if (!inScreen) {
                this.balloons.splice(i, 1);
                if (b === this.activeBoss) this.activeBoss = null;

                if (this.mode === 'survival' && b.type !== 'bomb') {
                    this.lives--;
                    this.updateLivesDisplay();
                    this.shakeDuration = 10;
                    this.shakeMagnitude = 10;
                    window.soundEngine.playBomb();

                    if (this.lives <= 0) {
                        this.triggerGameOver();
                        return;
                    }
                }
                continue;
            }

            // Check against each hand pointer
            pointers.forEach(p => {
                if (p.active && p.x > 0 && p.y > 0) {
                    const dist = Math.hypot(p.x - b.x, p.y - b.y);
                    let isHit = dist < b.radius + pointerRadius;

                    if (!isHit && p.prevX > 0 && p.prevY > 0) {
                        const segmentDist = this.distToSegment(b.x, b.y, p.prevX, p.prevY, p.x, p.y);
                        if (segmentDist < b.radius + pointerRadius * 0.75) {
                            isHit = true;
                        }
                    }

                    if (isHit) {
                        this.popBalloon(b, i);
                    }
                }
            });
        }

        // Update Shockwaves
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.radius += 25;
            sw.alpha -= 0.035;
            if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
                this.shockwaves.splice(i, 1);
            }
        }

        // Update Lasers
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            this.lasers[i].alpha -= 0.08;
            if (this.lasers[i].alpha <= 0) {
                this.lasers.splice(i, 1);
            }
        }

        // Update Chain Beams
        for (let i = this.chainBeams.length - 1; i >= 0; i--) {
            this.chainBeams[i].alpha -= 0.08;
            if (this.chainBeams[i].alpha <= 0) {
                this.chainBeams.splice(i, 1);
            }
        }

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (!this.particles[i].update()) {
                this.particles.splice(i, 1);
            }
        }

        // Floating Texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            if (!this.floatingTexts[i].update()) {
                this.floatingTexts.splice(i, 1);
            }
        }

        this.updateHUD();
    }

    distToSegment(px, py, x1, y1, x2, y2) {
        const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
        if (l2 === 0) return Math.hypot(px - x1, py - y1);
        let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.ctx.save();
        if (this.shakeDuration > 0) {
            const rx = (Math.random() - 0.5) * this.shakeMagnitude;
            const ry = (Math.random() - 0.5) * this.shakeMagnitude;
            this.ctx.translate(rx, ry);
            this.shakeDuration--;
        }

        // 1. Draw Neon Holographic Skeleton if enabled
        window.visionController.drawNeonSkeleton(this.ctx, this.width, this.height);

        // 2. Draw Balloons
        for (const balloon of this.balloons) {
            balloon.draw(this.ctx);
        }

        // 3. Draw Chain Lightning Beams
        for (const beam of this.chainBeams) {
            this.ctx.save();
            this.ctx.globalAlpha = beam.alpha;
            this.ctx.strokeStyle = '#00e5ff';
            this.ctx.shadowColor = '#00e5ff';
            this.ctx.shadowBlur = 18;
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.moveTo(beam.x1, beam.y1);
            // Zigzag electric line
            const midX = (beam.x1 + beam.x2) / 2 + (Math.random() - 0.5) * 40;
            const midY = (beam.y1 + beam.y2) / 2 + (Math.random() - 0.5) * 40;
            ctx.lineTo(midX, midY);
            this.ctx.lineTo(beam.x2, beam.y2);
            this.ctx.stroke();
            this.ctx.restore();
        }

        // 4. Draw Laser Bursts
        for (const laser of this.lasers) {
            this.ctx.save();
            this.ctx.globalAlpha = laser.alpha;
            this.ctx.strokeStyle = '#00f2fe';
            this.ctx.shadowColor = '#00f2fe';
            this.ctx.shadowBlur = 25;
            this.ctx.lineWidth = laser.width;
            this.ctx.beginPath();
            this.ctx.moveTo(laser.x, laser.y);
            this.ctx.lineTo(laser.x, 0);
            this.ctx.stroke();

            // Core beam
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.moveTo(laser.x, laser.y);
            this.ctx.lineTo(laser.x, 0);
            this.ctx.stroke();
            this.ctx.restore();
        }

        // 5. Draw Expanding Shockwaves
        for (const sw of this.shockwaves) {
            this.ctx.save();
            this.ctx.globalAlpha = sw.alpha;
            this.ctx.strokeStyle = '#ff007f';
            this.ctx.lineWidth = 8;
            this.ctx.shadowColor = '#ff007f';
            this.ctx.shadowBlur = 30;
            this.ctx.beginPath();
            this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
        }

        // 6. Draw Blade Slicing Ribbons (Fruit Ninja Style)
        this.bladeRibbons.forEach((ribbon, idx) => {
            if (ribbon.length < 2) return;
            this.ctx.save();
            for (let i = 1; i < ribbon.length; i++) {
                const pt1 = ribbon[i - 1];
                const pt2 = ribbon[i];
                const width = (i / ribbon.length) * 12 + 2;

                this.ctx.globalAlpha = pt2.alpha * 0.8;
                this.ctx.strokeStyle = pt2.color;
                this.ctx.shadowColor = pt2.color;
                this.ctx.shadowBlur = 20;
                this.ctx.lineWidth = width;
                this.ctx.lineCap = 'round';

                this.ctx.beginPath();
                this.ctx.moveTo(pt1.x, pt1.y);
                this.ctx.lineTo(pt2.x, pt2.y);
                this.ctx.stroke();
            }
            this.ctx.restore();
        });

        // 7. Draw Particles
        for (const particle of this.particles) {
            particle.draw(this.ctx);
        }

        // 8. Draw Floating Texts
        for (const text of this.floatingTexts) {
            text.draw(this.ctx);
        }

        // 9. Draw Reticles for each active Hand
        window.visionController.pointers.forEach(p => {
            if (p.active && p.x > 0 && p.y > 0) {
                this.ctx.save();
                this.ctx.translate(p.x, p.y);

                const pulse = Math.sin(performance.now() * 0.01) * 4;
                const ringRadius = 26 + pulse;

                this.ctx.beginPath();
                this.ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
                this.ctx.strokeStyle = p.isPinched ? '#ff2a85' : p.color;
                this.ctx.lineWidth = 3;
                this.ctx.shadowColor = p.color;
                this.ctx.shadowBlur = 18;
                this.ctx.stroke();

                // Gesture Badge indicator
                if (p.gesture === 'fist') {
                    this.ctx.font = '20px sans-serif';
                    this.ctx.fillText('✊', 0, -35);
                } else if (p.gesture === 'pinch') {
                    this.ctx.font = '20px sans-serif';
                    this.ctx.fillText('🤏', 0, -35);
                }

                this.ctx.beginPath();
                this.ctx.arc(0, 0, 7, 0, Math.PI * 2);
                this.ctx.fillStyle = '#ffffff';
                this.ctx.shadowBlur = 12;
                this.ctx.fill();

                this.ctx.restore();
            }
        });

        this.ctx.restore();
    }

    drawBackground() {
        if (!this.bgCtx) return;
        this.bgCtx.clearRect(0, 0, this.width, this.height);

        for (const b of this.bgBubbles) {
            b.y -= b.speed;
            b.wobble += 0.02;
            b.x += Math.sin(b.wobble) * 0.5;

            if (b.y < -b.radius) {
                b.y = this.height + b.radius;
                b.x = Math.random() * this.width;
            }

            this.bgCtx.save();
            this.bgCtx.globalAlpha = b.alpha;
            const grad = this.bgCtx.createRadialGradient(
                b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.1,
                b.x, b.y, b.radius
            );
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
            grad.addColorStop(0.5, 'rgba(155, 81, 224, 0.3)');
            grad.addColorStop(1, 'rgba(0, 242, 254, 0.05)');

            this.bgCtx.beginPath();
            this.bgCtx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            this.bgCtx.fillStyle = grad;
            this.bgCtx.fill();
            this.bgCtx.restore();
        }
    }

    loop(timestamp) {
        if (!this.lastFrameTime) this.lastFrameTime = timestamp;
        const delta = Math.min(timestamp - this.lastFrameTime, 100);
        this.lastFrameTime = timestamp;

        this.drawBackground();

        if (this.state === 'playing') {
            this.updateEntities(delta);
            this.draw();
        } else if (this.state === 'over' || this.state === 'paused') {
            this.draw();
        }

        requestAnimationFrame((t) => this.loop(t));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.bubbleGame = new BubbleGame();
});
