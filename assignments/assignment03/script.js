window.addEventListener("DOMContentLoaded", () => {
    const bgImage = document.getElementById("bgImage");

    window.addEventListener("scroll", () => {
        if (!bgImage) return;

        const scrollY = window.scrollY;
        const offset = scrollY * 0.18;
        const scale = 1.08 + scrollY * 0.00004;

        bgImage.style.transform = `translateY(${offset}px) scale(${scale})`;
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -8% 0px"
    });

    document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .zoom-in").forEach((el) => {
        if (!el.classList.contains("visible")) {
            observer.observe(el);
        }
    });

    const wrapper = document.getElementById("particleAvatar");
    const img = document.getElementById("profileImage");
    const canvas = document.getElementById("particleCanvas");

    if (!wrapper || !img || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    const PAD = 170;

    let particles = [];
    let initialized = false;
    let animationId = null;

    let burstMode = false;
    let particleLayerOpacity = 0;
    let imageLayerOpacity = 1;

    const mouse = {
        x: 0,
        y: 0,
        inside: false
    };

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function smoothstep(edge0, edge1, x) {
        const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
        return t * t * (3 - 2 * t);
    }

    function layoutCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const w = wrapper.clientWidth;
        const h = wrapper.clientHeight;
        const fullW = w + PAD * 2;
        const fullH = h + PAD * 2;

        canvas.style.position = "absolute";
        canvas.style.left = `${-PAD}px`;
        canvas.style.top = `${-PAD}px`;
        canvas.style.width = `${fullW}px`;
        canvas.style.height = `${fullH}px`;
        canvas.style.pointerEvents = "none";
        canvas.style.zIndex = "2";

        canvas.width = Math.floor(fullW * dpr);
        canvas.height = Math.floor(fullH * dpr);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function buildParticles() {
        particles = [];

        const w = wrapper.clientWidth;
        const h = wrapper.clientHeight;
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) / 2;

        const off = document.createElement("canvas");
        off.width = w;
        off.height = h;

        const offCtx = off.getContext("2d", { willReadFrequently: true });

        offCtx.clearRect(0, 0, w, h);
        offCtx.save();
        offCtx.beginPath();
        offCtx.arc(cx, cy, radius, 0, Math.PI * 2);
        offCtx.closePath();
        offCtx.clip();
        offCtx.drawImage(img, 0, 0, w, h);
        offCtx.restore();

        let data;
        try {
            data = offCtx.getImageData(0, 0, w, h).data;
        } catch (err) {
            console.error("Particle sampling failed:", err);
            img.style.opacity = "1";
            return false;
        }

        const gap = 5;
        const fadeStart = radius * 0.82;
        const fadeRange = radius - fadeStart || 1;

        for (let y = 0; y < h; y += gap) {
            for (let x = 0; x < w; x += gap) {
                const dx = x - cx;
                const dy = y - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > radius) continue;

                const i = (y * w + x) * 4;
                const alphaByte = data[i + 3];

                if (alphaByte < 20) continue;

                let edgeFade = 1;
                if (dist > fadeStart) {
                    edgeFade = 1 - (dist - fadeStart) / fadeRange;
                    edgeFade = clamp(edgeFade, 0, 1);
                }

                const jitterX = (Math.random() - 0.5) * 1.2;
                const jitterY = (Math.random() - 0.5) * 1.2;

                const px = x + jitterX;
                const py = y + jitterY;

                particles.push({
                    homeX: px,
                    homeY: py,
                    x: px,
                    y: py,
                    rx: px,
                    ry: py,
                    vx: 0,
                    vy: 0,
                    r: data[i],
                    g: data[i + 1],
                    b: data[i + 2],
                    a: (alphaByte / 255) * edgeFade,
                    size: 1.4 + Math.random() * 0.7
                });
            }
        }

        return particles.length > 0;
    }

    function burstParticles() {
        const cx = wrapper.clientWidth / 2;
        const cy = wrapper.clientHeight / 2;

        for (const p of particles) {
            const dx = p.homeX - cx;
            const dy = p.homeY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;

            const nx = dx / dist;
            const ny = dy / dist;
            const tx = -ny;
            const ty = nx;

            const outward = 4.2 + Math.random() * 2.0;
            const swirl = (Math.random() - 0.5) * 1.15;

            p.vx = nx * outward + tx * swirl;
            p.vy = ny * outward + ty * swirl;
        }
    }

    function updateMouse(event) {
        const rect = wrapper.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    }

    function updateParticles() {
        const cx = wrapper.clientWidth / 2;
        const cy = wrapper.clientHeight / 2;

        let avgOffset = 0;
        let groupX = 0;
        let groupY = 0;

        for (const p of particles) {
            groupX += p.x;
            groupY += p.y;
        }

        groupX /= Math.max(particles.length, 1);
        groupY /= Math.max(particles.length, 1);

        for (const p of particles) {
            if (burstMode) {
                const dx = p.x - cx;
                const dy = p.y - cy;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                p.vx += (dx / dist) * 0.012;
                p.vy += (dy / dist) * 0.012;

                if (mouse.inside) {
                    const mdx = p.x - mouse.x;
                    const mdy = p.y - mouse.y;
                    const mdist = Math.sqrt(mdx * mdx + mdy * mdy) || 1;

                    if (mdist < 85) {
                        const force = (85 - mdist) / 85;
                        p.vx += (mdx / mdist) * force * 0.40;
                        p.vy += (mdy / mdist) * force * 0.40;
                    }
                }

                p.vx *= 0.970;
                p.vy *= 0.970;
            }
            else {
                const homeDx = p.homeX - p.x;
                const homeDy = p.homeY - p.y;

                const cohesionDx = cx - groupX;
                const cohesionDy = cy - groupY;

                p.vx = p.vx * 0.78 + homeDx * 0.010 + cohesionDx * 0.008;
                p.vy = p.vy * 0.78 + homeDy * 0.010 + cohesionDy * 0.008;
            }
            p.x += p.vx;
            p.y += p.vy;

            const renderEase = burstMode ? 0.16 : 0.045;
            p.rx = lerp(p.rx, p.x, renderEase);
            p.ry = lerp(p.ry, p.y, renderEase);
            const dxHome = p.homeX - p.x;
            const dyHome = p.homeY - p.y;
            const homeDist = Math.sqrt(dxHome * dxHome + dyHome * dyHome);

            if (!burstMode && homeDist < 0.03 && Math.abs(p.vx) < 0.003 && Math.abs(p.vy) < 0.003) {
                p.x = p.homeX;
                p.y = p.homeY;
                p.vx = 0;
                p.vy = 0;
            }

            avgOffset += homeDist;
        }

        return avgOffset / Math.max(particles.length, 1);
    }

    function drawParticles(avgOffset) {
        const fullW = wrapper.clientWidth + PAD * 2;
        const fullH = wrapper.clientHeight + PAD * 2;

        ctx.clearRect(0, 0, fullW, fullH);

        const targetParticleOpacity = burstMode ? 1 : smoothstep(0.04, 8.5, avgOffset);
        const targetImageOpacity = 1 - targetParticleOpacity;
        const blendEase = burstMode ? 0.10 : 0.04;
        particleLayerOpacity = lerp(particleLayerOpacity, targetParticleOpacity, blendEase);
        imageLayerOpacity = lerp(imageLayerOpacity, targetImageOpacity, blendEase);
        img.style.opacity = imageLayerOpacity.toFixed(3);

        if (particleLayerOpacity < 0.01) return;

        for (const p of particles) {
            const x = p.rx + PAD;
            const y = p.ry + PAD;
            const outerSize = p.size * 1.7;
            const innerSize = p.size;

            ctx.beginPath();
            ctx.arc(x, y, outerSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${(p.a * particleLayerOpacity * 0.16).toFixed(4)})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y, innerSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${(p.a * particleLayerOpacity).toFixed(4)})`;
            ctx.fill();
        }
    }

    function animate() {
        const avgOffset = updateParticles();
        drawParticles(avgOffset);
        animationId = requestAnimationFrame(animate);
    }

    function initParticles() {
        layoutCanvas();

        const ok = buildParticles();
        if (!ok) {
            initialized = false;
            return;
        }

        initialized = true;
        particleLayerOpacity = 0;
        imageLayerOpacity = 1;
        img.style.opacity = "1";

        cancelAnimationFrame(animationId);
        animationId = requestAnimationFrame(animate);
    }

    function tryInit(attempt = 0) {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
            initParticles();
            return;
        }

        if (attempt < 60) {
            requestAnimationFrame(() => tryInit(attempt + 1));
        } else {
            console.error("Image never became ready for particles.");
        }
    }

    wrapper.addEventListener("mouseenter", (event) => {
        if (!initialized) return;

        updateMouse(event);
        mouse.inside = true;
        burstMode = true;
        burstParticles();
    });

    wrapper.addEventListener("mousemove", (event) => {
        updateMouse(event);
        mouse.inside = true;
    });

    wrapper.addEventListener("mouseleave", () => {
        mouse.inside = false;
        burstMode = false;

        for (const p of particles) {
            p.vx *= 0.28;
            p.vy *= 0.28;
        }
    });

    window.addEventListener("resize", () => {
        initialized = false;
        tryInit();
    });

    img.addEventListener("load", () => {
        tryInit();
    });

    img.addEventListener("error", () => {
        console.error("Profile image failed to load:", img.src);
        img.style.opacity = "1";
    });

    if (img.complete && img.naturalWidth > 0) {
        tryInit();
    } else {
        img.style.opacity = "1";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const reveals = document.querySelectorAll(".reveal-left, .reveal-right, .reveal-up");

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    reveals.forEach(el => observer.observe(el));
});

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("debugDashCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const scoreEl = document.getElementById("gameScore");
    const highScoreEl = document.getElementById("gameHighScore");
    const levelEl = document.getElementById("gameLevel");
    const livesEl = document.getElementById("gameLives");
    const timeEl = document.getElementById("gameTime");
    const powerEl = document.getElementById("gamePower");
    const statusEl = document.getElementById("gameStatus");
    const startBtn = document.getElementById("startGameBtn");
    const pauseBtn = document.getElementById("pauseGameBtn");
    const resetBtn = document.getElementById("resetGameBtn");
    const moveButtons = document.querySelectorAll(".move-btn");

    if (!ctx || !scoreEl || !highScoreEl || !levelEl || !livesEl || !timeEl || !powerEl || !statusEl || !startBtn || !pauseBtn || !resetBtn) return;

    const highScoreStorageKey = "debugDashHighScore";
    const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        w: false,
        a: false,
        s: false,
        d: false
    };

    const state = {
        score: 0,
        highScore: loadHighScore(),
        level: 1,
        lives: 3,
        maxLives: 5,
        timeLeft: 90,
        running: false,
        paused: false,
        gameOver: false,
        lastTime: 0,
        tokenTimer: 0,
        enemyTimer: 0,
        powerTimer: 0,
        hazardTimer: 0,
        messageTimer: 0,
        dashCooldown: 0,
        animationId: null
    };

    const player = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: 28,
        speed: 275,
        invincible: 0,
        shield: 0,
        slow: 0,
        magnet: 0
    };

    let tokens = [];
    let enemies = [];
    let powers = [];
    let hazards = [];
    let particles = [];

    function loadHighScore() {
        try {
            const saved = window.localStorage.getItem(highScoreStorageKey);
            const parsed = Number.parseInt(saved, 10);
            return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
        } catch (error) {
            console.warn("High score could not be loaded from this browser.", error);
            return 0;
        }
    }

    function saveHighScore(value) {
        try {
            window.localStorage.setItem(highScoreStorageKey, String(value));
        } catch (error) {
            console.warn("High score could not be saved in this browser.", error);
        }
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    function choose(values) {
        return values[Math.floor(Math.random() * values.length)];
    }

    function distance(a, b) {
        return Math.hypot(a.x - b.x, a.y - b.y);
    }

    function getEnemyLimit() {
        return Math.min(16, 4 + state.level);
    }

    function getEnemyInterval() {
        return Math.max(0.42, 1.35 - state.level * 0.08);
    }

    function updateHud(message) {
        scoreEl.textContent = state.score;
        highScoreEl.textContent = state.highScore;
        levelEl.textContent = state.level;
        livesEl.textContent = Math.max(0, state.lives);
        timeEl.textContent = Math.ceil(Math.max(0, state.timeLeft));
        powerEl.textContent = getPowerText();
        if (message) {
            statusEl.textContent = message;
            state.messageTimer = 2.2;
        }
    }

    function getPowerText() {
        const active = [];
        if (player.shield > 0) active.push("SHD " + Math.ceil(player.shield) + "s");
        if (player.magnet > 0) active.push("MAG " + Math.ceil(player.magnet) + "s");
        if (player.slow > 0) active.push("SLO " + Math.ceil(player.slow) + "s");
        if (active.length === 0) return "None";
        return active.join(" | ");
    }

    function updateHighScore() {
        if (state.score > state.highScore) {
            state.highScore = state.score;
            saveHighScore(state.highScore);
            return true;
        }
        return false;
    }

    function clearMovementKeys() {
        Object.keys(keys).forEach((key) => {
            keys[key] = false;
        });
        moveButtons.forEach((button) => button.classList.remove("active"));
    }

    function resetGameState() {
        state.score = 0;
        state.level = 1;
        state.lives = 3;
        state.timeLeft = 90;
        state.tokenTimer = 0;
        state.enemyTimer = 0;
        state.powerTimer = 0;
        state.hazardTimer = 0;
        state.messageTimer = 0;
        state.dashCooldown = 0;
        state.gameOver = false;
        state.paused = false;
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
        player.invincible = 0;
        player.shield = 0;
        player.slow = 0;
        player.magnet = 0;
        tokens = [];
        enemies = [];
        powers = [];
        hazards = [];
        particles = [];
        clearMovementKeys();
        spawnToken();
        spawnToken();
        spawnPower("shield");
    }

    function resetGame() {
        state.running = false;
        state.paused = false;
        cancelAnimationFrame(state.animationId);
        state.animationId = null;
        resetGameState();
        startBtn.textContent = "Start Game";
        pauseBtn.textContent = "Pause";
        pauseBtn.disabled = false;
        updateHud("Press Start Game. Collect tokens, use power-ups, and survive the bug swarm.");
        drawScene();
    }

    function startGame() {
        if (state.paused) {
            resumeGame();
            return;
        }

        if (state.running) return;

        if (state.gameOver || state.lives <= 0 || state.timeLeft <= 0) {
            resetGameState();
        }

        state.running = true;
        state.paused = false;
        state.gameOver = false;
        state.lastTime = performance.now();
        startBtn.textContent = "Running";
        pauseBtn.textContent = "Pause";
        updateHud("Run started. Space gives a short dash. P pauses the game.");
        state.animationId = requestAnimationFrame(gameLoop);
    }

    function pauseGame() {
        if (!state.running || state.gameOver) return;
        state.running = false;
        state.paused = true;
        cancelAnimationFrame(state.animationId);
        state.animationId = null;
        startBtn.textContent = "Resume";
        pauseBtn.textContent = "Resume";
        updateHud("Paused. Press Resume, Start Game, or P to continue.");
        drawScene();
    }

    function resumeGame() {
        if (!state.paused || state.gameOver) return;
        state.running = true;
        state.paused = false;
        state.lastTime = performance.now();
        startBtn.textContent = "Running";
        pauseBtn.textContent = "Pause";
        updateHud("Resumed. Keep debugging.");
        state.animationId = requestAnimationFrame(gameLoop);
    }

    function togglePause() {
        if (state.paused) {
            resumeGame();
        } else {
            pauseGame();
        }
    }

    function endGame(message) {
        state.running = false;
        state.paused = false;
        state.gameOver = true;
        clearMovementKeys();
        cancelAnimationFrame(state.animationId);
        state.animationId = null;
        startBtn.textContent = "Start Game";
        pauseBtn.textContent = "Pause";

        const newRecord = updateHighScore();
        const recordText = newRecord ? " New browser high score: " + state.highScore + "!" : "";
        updateHud(message + recordText + " Press Start Game for a fresh run.");
        drawScene();
    }

    function spawnPointAwayFromPlayer(margin = 32) {
        let point;
        let attempts = 0;
        do {
            point = {
                x: randomBetween(margin, canvas.width - margin),
                y: randomBetween(margin, canvas.height - margin)
            };
            attempts++;
        } while (distance(point, player) < 140 && attempts < 30);
        return point;
    }

    function spawnToken() {
        const p = spawnPointAwayFromPlayer(36);
        tokens.push({
            x: p.x,
            y: p.y,
            r: 12,
            value: 10,
            spin: Math.random() * Math.PI * 2,
            life: 14
        });
    }

    function spawnPower(forceType) {
        const types = ["shield", "magnet", "slow", "life"];
        const type = forceType || choose(types);
        const p = spawnPointAwayFromPlayer(42);
        powers.push({
            x: p.x,
            y: p.y,
            r: 15,
            type,
            pulse: Math.random() * Math.PI * 2,
            life: 13
        });
    }

    function spawnEnemy() {
        if (enemies.length >= getEnemyLimit()) return;

        const availableTypes = ["chaser"];
        if (state.level >= 2) availableTypes.push("patrol");
        if (state.level >= 3) availableTypes.push("glitch");

        const type = choose(availableTypes);
        const side = Math.floor(Math.random() * 4);
        const start = {
            x: side === 0 ? -28 : side === 1 ? canvas.width + 28 : randomBetween(0, canvas.width),
            y: side === 2 ? -28 : side === 3 ? canvas.height + 28 : randomBetween(0, canvas.height)
        };

        const enemy = {
            x: start.x,
            y: start.y,
            r: type === "glitch" ? 13 : 15,
            type,
            speed: randomBetween(74, 120) + state.level * 7,
            vx: randomBetween(-1, 1),
            vy: randomBetween(-1, 1),
            phase: Math.random() * Math.PI * 2
        };

        if (type === "patrol") {
            const len = Math.hypot(enemy.vx, enemy.vy) || 1;
            enemy.vx = (enemy.vx / len) * (105 + state.level * 8);
            enemy.vy = (enemy.vy / len) * (105 + state.level * 8);
        }

        enemies.push(enemy);
    }

    function spawnHazard() {
        if (state.level < 2 || hazards.length >= 3) return;
        const vertical = Math.random() > 0.5;
        const size = randomBetween(70, 130);
        const p = spawnPointAwayFromPlayer(80);

        hazards.push({
            x: clamp(p.x - (vertical ? 18 : size / 2), 20, canvas.width - size - 20),
            y: clamp(p.y - (vertical ? size / 2 : 18), 20, canvas.height - size - 20),
            w: vertical ? 36 : size,
            h: vertical ? size : 36,
            warning: 1.25,
            life: 5.1,
            pulse: 0
        });
    }

    function addParticles(x, y, amount, rgba) {
        for (let i = 0; i < amount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = randomBetween(55, 190);
            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                r: randomBetween(1.5, 4.5),
                life: randomBetween(0.35, 0.85),
                maxLife: 0.85,
                color: rgba
            });
        }
    }

    function updateLevel() {
        const nextLevel = Math.min(12, Math.floor(state.score / 100) + 1);
        if (nextLevel !== state.level) {
            state.level = nextLevel;
            updateHud("Level " + state.level + ". More bugs are entering the system.");
            addParticles(player.x, player.y, 28, "96, 165, 250");
        }
    }

    function updateTimers(dt) {
        state.timeLeft = Math.max(0, state.timeLeft - dt);
        state.tokenTimer += dt;
        state.enemyTimer += dt;
        state.powerTimer += dt;
        state.hazardTimer += dt;
        state.dashCooldown = Math.max(0, state.dashCooldown - dt);
        state.messageTimer = Math.max(0, state.messageTimer - dt);

        player.invincible = Math.max(0, player.invincible - dt);
        player.shield = Math.max(0, player.shield - dt);
        player.slow = Math.max(0, player.slow - dt);
        player.magnet = Math.max(0, player.magnet - dt);

        if (state.tokenTimer > Math.max(0.45, 1.05 - state.level * 0.035)) {
            spawnToken();
            state.tokenTimer = 0;
        }

        if (state.enemyTimer > getEnemyInterval()) {
            spawnEnemy();
            state.enemyTimer = 0;
        }

        if (state.powerTimer > Math.max(4.4, 7.8 - state.level * 0.20)) {
            spawnPower();
            state.powerTimer = 0;
        }

        if (state.hazardTimer > Math.max(3.2, 6.8 - state.level * 0.28)) {
            spawnHazard();
            state.hazardTimer = 0;
        }
    }

    function movePlayer(dt) {
        let dx = 0;
        let dy = 0;

        if (keys.ArrowLeft || keys.a) dx -= 1;
        if (keys.ArrowRight || keys.d) dx += 1;
        if (keys.ArrowUp || keys.w) dy -= 1;
        if (keys.ArrowDown || keys.s) dy += 1;

        if (dx !== 0 || dy !== 0) {
            const len = Math.hypot(dx, dy);
            dx /= len;
            dy /= len;
        }

        player.x += dx * player.speed * dt;
        player.y += dy * player.speed * dt;

        const half = player.size / 2;
        player.x = clamp(player.x, half, canvas.width - half);
        player.y = clamp(player.y, half, canvas.height - half);
    }

    function dashPlayer() {
        if (!state.running || state.dashCooldown > 0) return;

        let dx = 0;
        let dy = 0;
        if (keys.ArrowLeft || keys.a) dx -= 1;
        if (keys.ArrowRight || keys.d) dx += 1;
        if (keys.ArrowUp || keys.w) dy -= 1;
        if (keys.ArrowDown || keys.s) dy += 1;

        if (dx === 0 && dy === 0) return;

        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;

        player.x = clamp(player.x + dx * 86, player.size / 2, canvas.width - player.size / 2);
        player.y = clamp(player.y + dy * 86, player.size / 2, canvas.height - player.size / 2);
        player.invincible = Math.max(player.invincible, 0.28);
        state.dashCooldown = 1.25;
        addParticles(player.x, player.y, 18, "147, 197, 253");
        updateHud("Dash used. Cooldown active.");
    }

    function updateTokens(dt) {
        for (const token of tokens) {
            token.life -= dt;
            token.spin += dt * 3.2;

            if (player.magnet > 0) {
                const dx = player.x - token.x;
                const dy = player.y - token.y;
                const dist = Math.hypot(dx, dy) || 1;
                if (dist < 230) {
                    token.x += (dx / dist) * 185 * dt;
                    token.y += (dy / dist) * 185 * dt;
                }
            }
        }
        tokens = tokens.filter((token) => token.life > 0);
    }

    function updatePowers(dt) {
        for (const power of powers) {
            power.life -= dt;
            power.pulse += dt * 4;
        }
        powers = powers.filter((power) => power.life > 0);
    }

    function updateEnemies(dt) {
        const slowFactor = player.slow > 0 ? 0.48 : 1;

        for (const enemy of enemies) {
            enemy.phase += dt * 4;

            if (enemy.type === "chaser") {
                const dx = player.x - enemy.x;
                const dy = player.y - enemy.y;
                const len = Math.hypot(dx, dy) || 1;
                enemy.x += (dx / len) * enemy.speed * slowFactor * dt;
                enemy.y += (dy / len) * enemy.speed * slowFactor * dt;
            } else if (enemy.type === "patrol") {
                enemy.x += enemy.vx * slowFactor * dt;
                enemy.y += enemy.vy * slowFactor * dt;
                if (enemy.x < enemy.r || enemy.x > canvas.width - enemy.r) enemy.vx *= -1;
                if (enemy.y < enemy.r || enemy.y > canvas.height - enemy.r) enemy.vy *= -1;
                enemy.x = clamp(enemy.x, enemy.r, canvas.width - enemy.r);
                enemy.y = clamp(enemy.y, enemy.r, canvas.height - enemy.r);
            } else {
                const dx = player.x - enemy.x;
                const dy = player.y - enemy.y;
                const len = Math.hypot(dx, dy) || 1;
                const sideX = -dy / len;
                const sideY = dx / len;
                enemy.x += ((dx / len) * enemy.speed + sideX * Math.sin(enemy.phase) * 110) * slowFactor * dt;
                enemy.y += ((dy / len) * enemy.speed + sideY * Math.cos(enemy.phase) * 110) * slowFactor * dt;
            }
        }

        enemies = enemies.filter((enemy) => enemy.x > -80 && enemy.x < canvas.width + 80 && enemy.y > -80 && enemy.y < canvas.height + 80);
    }

    function updateHazards(dt) {
        for (const hazard of hazards) {
            hazard.pulse += dt * 7;
            if (hazard.warning > 0) {
                hazard.warning -= dt;
            } else {
                hazard.life -= dt;
            }
        }
        hazards = hazards.filter((hazard) => hazard.life > 0);
    }

    function updateParticles(dt) {
        for (const p of particles) {
            p.life -= dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 0.96;
            p.vy *= 0.96;
        }
        particles = particles.filter((p) => p.life > 0);
    }

    function collectToken(index) {
        const token = tokens[index];
        state.score += token.value;
        addParticles(token.x, token.y, 12, "56, 189, 248");
        tokens.splice(index, 1);
        updateHighScore();
        updateLevel();
        updateHud("Token collected. Score +" + token.value + ".");
    }

    function collectPower(index) {
        const power = powers[index];
        addParticles(power.x, power.y, 18, getPowerParticleColor(power.type));

        if (power.type === "shield") {
            player.shield = Math.max(player.shield, 9);
            updateHud("Shield active. Your next hit is blocked.");
        } else if (power.type === "magnet") {
            player.magnet = Math.max(player.magnet, 9);
            updateHud("Magnet active. Tokens will move toward you.");
        } else if (power.type === "slow") {
            player.slow = Math.max(player.slow, 7);
            updateHud("Slow mode active. Bugs are slowed.");
        } else if (power.type === "life") {
            state.lives = Math.min(state.maxLives, state.lives + 1);
            updateHud("Life restored. Lives: " + state.lives + ".");
        }

        state.score += power.type === "life" ? 5 : 15;
        updateHighScore();
        updateLevel();
        powers.splice(index, 1);
    }

    function getPowerParticleColor(type) {
        if (type === "shield") return "96, 165, 250";
        if (type === "magnet") return "74, 222, 128";
        if (type === "slow") return "196, 181, 253";
        return "244, 114, 182";
    }

    function damagePlayer(sourceX, sourceY, sourceLabel) {
        if (player.invincible > 0 || state.lives <= 0) return false;

        if (player.shield > 0) {
            player.shield = 0;
            player.invincible = 0.8;
            addParticles(sourceX, sourceY, 22, "96, 165, 250");
            updateHud("Shield blocked the " + sourceLabel + ".");
            return false;
        }

        state.lives = Math.max(0, state.lives - 1);
        player.invincible = 1.25;
        addParticles(player.x, player.y, 26, "248, 113, 113");

        if (state.lives <= 0) {
            endGame("Game over. Final score: " + state.score + ".");
            return true;
        }

        updateHud(sourceLabel + " hit. Lives remaining: " + state.lives + ".");
        return true;
    }

    function rectCircleCollision(rect, circle) {
        const closestX = clamp(circle.x, rect.x, rect.x + rect.w);
        const closestY = clamp(circle.y, rect.y, rect.y + rect.h);
        const dx = circle.x - closestX;
        const dy = circle.y - closestY;
        return dx * dx + dy * dy < Math.pow(player.size / 2, 2);
    }

    function checkCollisions() {
        for (let i = tokens.length - 1; i >= 0; i--) {
            if (distance(player, tokens[i]) < player.size / 2 + tokens[i].r) {
                collectToken(i);
            }
        }

        for (let i = powers.length - 1; i >= 0; i--) {
            if (distance(player, powers[i]) < player.size / 2 + powers[i].r) {
                collectPower(i);
            }
        }

        if (player.invincible <= 0) {
            for (let i = enemies.length - 1; i >= 0; i--) {
                if (distance(player, enemies[i]) < player.size / 2 + enemies[i].r) {
                    const hitEnemy = enemies[i];
                    enemies.splice(i, 1);
                    damagePlayer(hitEnemy.x, hitEnemy.y, "Bug");
                    break;
                }
            }
        }

        if (player.invincible <= 0) {
            for (const hazard of hazards) {
                if (hazard.warning <= 0 && rectCircleCollision(hazard, player)) {
                    damagePlayer(player.x, player.y, "Firewall");
                    break;
                }
            }
        }
    }

    function drawRoundedRect(x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    function drawBackground() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "rgba(2, 6, 23, 1)");
        gradient.addColorStop(0.5, "rgba(15, 23, 42, 1)");
        gradient.addColorStop(1, "rgba(2, 6, 23, 1)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.strokeStyle = "rgba(148, 163, 184, 0.105)";
        ctx.lineWidth = 1;
        for (let x = 0; x <= canvas.width; x += 45) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += 45) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        ctx.restore();

        ctx.save();
        ctx.fillStyle = "rgba(56, 189, 248, 0.045)";
        for (let i = 0; i < 42; i++) {
            const x = (i * 83 + state.level * 13) % canvas.width;
            const y = (i * 47 + state.score * 0.2) % canvas.height;
            ctx.fillRect(x, y, 2, 2);
        }
        ctx.restore();
    }

    function drawPlayer() {
        const half = player.size / 2;
        ctx.save();
        if (player.invincible > 0 && Math.floor(player.invincible * 16) % 2 === 0) {
            ctx.globalAlpha = 0.48;
        }

        if (player.shield > 0) {
            ctx.beginPath();
            ctx.arc(player.x, player.y, player.size * 0.92, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(96, 165, 250, 0.72)";
            ctx.lineWidth = 4;
            ctx.shadowColor = "rgba(96, 165, 250, 0.7)";
            ctx.shadowBlur = 18;
            ctx.stroke();
        }

        ctx.shadowColor = "rgba(147, 197, 253, 0.66)";
        ctx.shadowBlur = 18;
        ctx.fillStyle = "rgba(147, 197, 253, 0.96)";
        ctx.strokeStyle = "rgba(219, 234, 254, 0.92)";
        ctx.lineWidth = 2;
        drawRoundedRect(player.x - half, player.y - half, player.size, player.size, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(15, 23, 42, 0.96)";
        ctx.font = "bold 15px Courier New";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("</>", player.x, player.y + 1);
        ctx.restore();
    }

    function drawTokens() {
        for (const token of tokens) {
            const fade = clamp(token.life / 2.2, 0.32, 1);
            ctx.save();
            ctx.globalAlpha = fade;
            ctx.translate(token.x, token.y);
            ctx.rotate(token.spin);
            ctx.shadowColor = "rgba(56, 189, 248, 0.72)";
            ctx.shadowBlur = 14;
            ctx.fillStyle = "rgba(56, 189, 248, 0.92)";
            ctx.strokeStyle = "rgba(224, 242, 254, 0.96)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, token.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "rgba(2, 6, 23, 0.95)";
            ctx.font = "bold 14px Courier New";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("{}", 0, 1);
            ctx.restore();
        }
    }

    function drawPowers() {
        for (const power of powers) {
            const scale = 1 + Math.sin(power.pulse) * 0.08;
            const label = power.type === "shield" ? "SHD" : power.type === "magnet" ? "MAG" : power.type === "slow" ? "SLO" : "+";
            const rgb = getPowerParticleColor(power.type);
            ctx.save();
            ctx.translate(power.x, power.y);
            ctx.scale(scale, scale);
            ctx.shadowColor = "rgba(" + rgb + ", 0.72)";
            ctx.shadowBlur = 18;
            ctx.fillStyle = "rgba(" + rgb + ", 0.88)";
            ctx.strokeStyle = "rgba(255, 255, 255, 0.92)";
            ctx.lineWidth = 2;
            drawRoundedRect(-22, -15, 44, 30, 10);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "rgba(2, 6, 23, 0.95)";
            ctx.font = "bold 13px Courier New";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, 0, 1);
            ctx.restore();
        }
    }

    function drawEnemies() {
        for (const enemy of enemies) {
            let fill = "rgba(248, 113, 113, 0.92)";
            let glow = "rgba(248, 113, 113, 0.64)";
            let label = "!";

            if (enemy.type === "patrol") {
                fill = "rgba(251, 146, 60, 0.92)";
                glow = "rgba(251, 146, 60, 0.58)";
                label = "//";
            } else if (enemy.type === "glitch") {
                fill = "rgba(244, 114, 182, 0.92)";
                glow = "rgba(244, 114, 182, 0.58)";
                label = "?";
            }

            ctx.save();
            ctx.translate(enemy.x, enemy.y);
            ctx.rotate(Math.sin(enemy.phase) * 0.22);
            ctx.shadowColor = glow;
            ctx.shadowBlur = 15;
            ctx.fillStyle = fill;
            ctx.strokeStyle = "rgba(254, 226, 226, 0.9)";
            ctx.lineWidth = 2;

            if (enemy.type === "glitch") {
                ctx.beginPath();
                ctx.moveTo(0, -enemy.r - 3);
                ctx.lineTo(enemy.r + 3, 0);
                ctx.lineTo(0, enemy.r + 3);
                ctx.lineTo(-enemy.r - 3, 0);
                ctx.closePath();
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, enemy.r, 0, Math.PI * 2);
            }
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "rgba(2, 6, 23, 0.96)";
            ctx.font = "bold 14px Courier New";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, 0, 1);
            ctx.restore();
        }
    }

    function drawHazards() {
        for (const hazard of hazards) {
            const warning = hazard.warning > 0;
            const alpha = warning ? 0.16 + Math.abs(Math.sin(hazard.pulse)) * 0.18 : 0.34;
            ctx.save();
            ctx.fillStyle = warning ? "rgba(251, 191, 36, " + alpha + ")" : "rgba(239, 68, 68, " + alpha + ")";
            ctx.strokeStyle = warning ? "rgba(253, 224, 71, 0.72)" : "rgba(248, 113, 113, 0.72)";
            ctx.lineWidth = warning ? 2 : 3;
            drawRoundedRect(hazard.x, hazard.y, hazard.w, hazard.h, 10);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = warning ? "rgba(253, 224, 71, 0.9)" : "rgba(254, 202, 202, 0.92)";
            ctx.font = "bold 12px Courier New";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(warning ? "WARNING" : "FIREWALL", hazard.x + hazard.w / 2, hazard.y + hazard.h / 2);
            ctx.restore();
        }
    }

    function drawParticles() {
        for (const p of particles) {
            const alpha = clamp(p.life / p.maxLife, 0, 1);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = "rgba(" + p.color + ", " + alpha + ")";
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function drawOverlay() {
        if (state.running) return;

        ctx.save();
        ctx.fillStyle = "rgba(2, 6, 23, 0.58)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
        ctx.font = "bold 30px Courier New";
        ctx.textAlign = "center";

        const title = state.gameOver ? "Game Over" : state.paused ? "Paused" : "Debug Dash Deluxe";
        ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 34);
        ctx.font = "16px Courier New";
        ctx.fillText(state.paused ? "Press Resume or P to continue" : "Press Start Game to play", canvas.width / 2, canvas.height / 2 + 2);
        ctx.fillText("High score: " + state.highScore + "   Level: " + state.level + "   Score: " + state.score, canvas.width / 2, canvas.height / 2 + 30);
        ctx.fillText("Move: WASD / arrows   Dash: Space   Pause: P", canvas.width / 2, canvas.height / 2 + 58);
        ctx.restore();
    }

    function drawScene() {
        drawBackground();
        drawHazards();
        drawTokens();
        drawPowers();
        drawEnemies();
        drawParticles();
        drawPlayer();
        drawOverlay();
    }

    function gameLoop(timestamp) {
        if (!state.running) return;

        const dt = Math.min((timestamp - state.lastTime) / 1000, 0.035);
        state.lastTime = timestamp;

        updateTimers(dt);
        movePlayer(dt);
        updateTokens(dt);
        updatePowers(dt);
        updateEnemies(dt);
        updateHazards(dt);
        updateParticles(dt);
        checkCollisions();
        updateHighScore();
        updateHud();
        drawScene();

        if (state.running && state.timeLeft <= 0) {
            endGame("Time is up. Final score: " + state.score + ".");
            return;
        }

        if (state.running) {
            state.animationId = requestAnimationFrame(gameLoop);
        }
    }

    function setDirection(direction, isPressed) {
        const map = {
            up: "ArrowUp",
            down: "ArrowDown",
            left: "ArrowLeft",
            right: "ArrowRight"
        };
        if (map[direction]) {
            keys[map[direction]] = isPressed;
        }
    }

    window.addEventListener("keydown", (event) => {
        const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

        if (key in keys) {
            keys[key] = true;
            if (state.running) event.preventDefault();
        }

        if (key === " " || event.code === "Space") {
            if (state.running) {
                event.preventDefault();
                dashPlayer();
            }
        }

        if (key === "p") {
            event.preventDefault();
            togglePause();
        }
    });

    window.addEventListener("keyup", (event) => {
        const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
        if (key in keys) {
            keys[key] = false;
        }
    });

    moveButtons.forEach((button) => {
        const direction = button.dataset.direction;

        button.addEventListener("pointerdown", (event) => {
            event.preventDefault();
            button.classList.add("active");
            setDirection(direction, true);
        });

        button.addEventListener("pointerup", (event) => {
            event.preventDefault();
            button.classList.remove("active");
            setDirection(direction, false);
        });

        button.addEventListener("pointercancel", () => {
            button.classList.remove("active");
            setDirection(direction, false);
        });

        button.addEventListener("pointerleave", () => {
            button.classList.remove("active");
            setDirection(direction, false);
        });
    });

    startBtn.addEventListener("click", startGame);
    pauseBtn.addEventListener("click", togglePause);
    resetBtn.addEventListener("click", resetGame);

    resetGame();
});
