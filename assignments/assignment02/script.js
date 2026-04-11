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