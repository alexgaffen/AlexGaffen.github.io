// site-tabs.js
document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const audioBtn = document.getElementById("site-audio-btn");
    const themeBtn = document.getElementById("site-theme-btn");
    const storedAudioPreference = localStorage.getItem("site-audio");

    if (storedAudioPreference === null) {
        localStorage.setItem("site-audio", "false");
    }

    let siteAudioEnabled = storedAudioPreference === "true";
    let isDarkMode = localStorage.getItem("site-dark-mode") === "true";
    let globalAudioCtx = null;
    let ambientLayer = null;
    const ambientProfiles = {
        home: { frequencies: [196, 293.66, 440], types: ["sine", "triangle", "sine"], gain: 0.016, lfoRate: 0.08, lfoDepth: 0.003, filter: 920 },
        resume: { frequencies: [220, 329.63, 493.88], types: ["triangle", "sine", "sine"], gain: 0.014, lfoRate: 0.06, lfoDepth: 0.0025, filter: 860 },
        photos: { frequencies: [174.61, 261.63, 392], types: ["sine", "sine", "triangle"], gain: 0.015, lfoRate: 0.05, lfoDepth: 0.0022, filter: 720 },
        blog: { frequencies: [155.56, 233.08, 349.23], types: ["triangle", "triangle", "sine"], gain: 0.013, lfoRate: 0.09, lfoDepth: 0.0028, filter: 780 },
        default: { frequencies: [196, 261.63, 392], types: ["sine", "triangle", "sine"], gain: 0.014, lfoRate: 0.07, lfoDepth: 0.0025, filter: 800 }
    };

    function getPageKey() {
        if (body.classList.contains("index-page")) return "home";
        if (body.classList.contains("resume-page")) return "resume";
        if (body.classList.contains("photo-page")) return "photos";
        if (body.classList.contains("blog-page")) return "blog";
        return "default";
    }

    function applyTheme() {
        if (isDarkMode) {
            document.documentElement.classList.add("dark-mode");
            body.classList.add("hacker-mode");
        } else {
            document.documentElement.classList.remove("dark-mode");
            body.classList.remove("hacker-mode");
        }
    }

    function setAudioState(nextState, playClickSound) {
        siteAudioEnabled = nextState;
        localStorage.setItem("site-audio", String(siteAudioEnabled));
        window.siteAudioEnabled = siteAudioEnabled;
        if (audioBtn) audioBtn.innerText = siteAudioEnabled ? "🔊" : "🔇";
        if (playClickSound && siteAudioEnabled) playGlobalSound("click");
        if (siteAudioEnabled) startAmbientLayer();
        else stopAmbientLayer();
    }

    function setThemeState(nextState) {
        isDarkMode = nextState;
        localStorage.setItem("site-dark-mode", String(isDarkMode));
        applyTheme();
        if (siteAudioEnabled) playGlobalSound("click");
    }

    function toggleAudio() {
        setAudioState(!siteAudioEnabled, true);
    }

    function toggleTheme() {
        setThemeState(!isDarkMode);
    }

    function playGlobalSound(type) {
        if (!window.siteAudioEnabled) return;

        try {
            if (!globalAudioCtx) globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (globalAudioCtx.state === "suspended") globalAudioCtx.resume();

            const osc = globalAudioCtx.createOscillator();
            const gain = globalAudioCtx.createGain();
            osc.connect(gain);
            gain.connect(globalAudioCtx.destination);

            if (type === "hover") {
                osc.type = "square";
                osc.frequency.setValueAtTime(300, globalAudioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(600, globalAudioCtx.currentTime + 0.05);
                gain.gain.setValueAtTime(0.015, globalAudioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, globalAudioCtx.currentTime + 0.05);
                osc.start();
                osc.stop(globalAudioCtx.currentTime + 0.05);
            } else if (type === "click") {
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(150, globalAudioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(80, globalAudioCtx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.03, globalAudioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, globalAudioCtx.currentTime + 0.1);
                osc.start();
                osc.stop(globalAudioCtx.currentTime + 0.1);
            }
        } catch (e) {}
    }

    function stopAmbientLayer() {
        if (!ambientLayer || !globalAudioCtx) return;

        try {
            const now = globalAudioCtx.currentTime;
            ambientLayer.master.gain.cancelScheduledValues(now);
            ambientLayer.master.gain.setValueAtTime(ambientLayer.master.gain.value, now);
            ambientLayer.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

            ambientLayer.oscillators.forEach((oscillator) => oscillator.stop(now + 0.24));
            ambientLayer.lfo.stop(now + 0.24);

            window.setTimeout(() => {
                try {
                    ambientLayer.oscillators.forEach((oscillator) => oscillator.disconnect());
                    ambientLayer.oscillatorGains.forEach((gainNode) => gainNode.disconnect());
                    ambientLayer.lfo.disconnect();
                    ambientLayer.lfoGain.disconnect();
                    ambientLayer.filter.disconnect();
                    ambientLayer.master.disconnect();
                } catch (e) {}
            }, 320);
        } catch (e) {}

        ambientLayer = null;
    }

    function startAmbientLayer() {
        if (!siteAudioEnabled || document.hidden) return;

        try {
            if (!globalAudioCtx) globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (globalAudioCtx.state === "suspended") globalAudioCtx.resume();
            if (ambientLayer) stopAmbientLayer();

            const profile = ambientProfiles[getPageKey()] || ambientProfiles.default;
            const now = globalAudioCtx.currentTime;
            const master = globalAudioCtx.createGain();
            master.gain.setValueAtTime(0.0001, now);
            master.gain.exponentialRampToValueAtTime(profile.gain, now + 0.6);

            const filter = globalAudioCtx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(profile.filter, now);
            filter.Q.setValueAtTime(0.8, now);

            filter.connect(master);
            master.connect(globalAudioCtx.destination);

            const oscillatorGains = [];
            const oscillators = profile.frequencies.map((frequency, index) => {
                const oscillator = globalAudioCtx.createOscillator();
                const gainNode = globalAudioCtx.createGain();
                oscillator.type = profile.types[index] || "sine";
                oscillator.frequency.setValueAtTime(frequency, now);
                oscillator.detune.setValueAtTime(index * 4, now);
                gainNode.gain.setValueAtTime(0.002 + index * 0.0013, now);
                oscillator.connect(gainNode);
                gainNode.connect(filter);
                oscillator.start(now);
                oscillatorGains.push(gainNode);
                return oscillator;
            });

            const lfo = globalAudioCtx.createOscillator();
            const lfoGain = globalAudioCtx.createGain();
            lfo.type = "sine";
            lfo.frequency.setValueAtTime(profile.lfoRate, now);
            lfoGain.gain.setValueAtTime(profile.lfoDepth, now);
            lfo.connect(lfoGain);
            lfoGain.connect(master.gain);
            lfo.start(now);

            ambientLayer = { master, filter, oscillators, oscillatorGains, lfo, lfoGain };
        } catch (e) {}
    }

    function initWorldCanvas() {
        if (document.getElementById("site-world-canvas")) return;

        const canvas = document.createElement("canvas");
        canvas.id = "site-world-canvas";
        canvas.className = "site-world-canvas";
        body.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let stars = [];
        let width = 0;
        let height = 0;
        let linkDistance = 180;
        let colors = [];
        let visualProfile = {
            linkAlpha: 0.2,
            glowAlpha: 0.16,
            nodeAlpha: 0.92,
            sparkAlpha: 0.55,
            nearLineWidth: 1.2,
            farLineWidth: 0.8
        };

        function readNumberVar(name, fallback) {
            const value = parseFloat(getComputedStyle(body).getPropertyValue(name));
            return Number.isFinite(value) ? value : fallback;
        }

        function refreshVisualProfile() {
            const computed = getComputedStyle(body);
            colors = [
                computed.getPropertyValue("--site-world-a").trim() || "rgba(90, 197, 255, 0.42)",
                computed.getPropertyValue("--site-world-b").trim() || "rgba(255, 143, 92, 0.22)",
                computed.getPropertyValue("--site-world-c").trim() || "rgba(255, 243, 175, 0.24)"
            ];
            visualProfile = {
                linkAlpha: readNumberVar("--site-world-link-alpha", 0.2),
                glowAlpha: readNumberVar("--site-world-glow-alpha", 0.16),
                nodeAlpha: readNumberVar("--site-world-node-alpha", 0.92),
                sparkAlpha: readNumberVar("--site-world-spark-alpha", 0.55),
                nearLineWidth: readNumberVar("--site-world-near-line-width", 1.2),
                farLineWidth: readNumberVar("--site-world-far-line-width", 0.8)
            };
        }

        function resizeCanvas() {
            const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

            const count = Math.max(34, Math.min(70, Math.round(width / 30)));
            linkDistance = Math.max(200, Math.min(380, width * 0.27));
            stars = Array.from({ length: count }, (_, index) => ({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: 1.4 + Math.random() * 3.6,
                speed: 0.05 + Math.random() * 0.28,
                phase: Math.random() * Math.PI * 2,
                driftX: 10 + Math.random() * 22,
                driftY: 8 + Math.random() * 18,
                glow: 5 + Math.random() * 10,
                color: colors[index % colors.length]
            }));
        }

        function drawFrame(time) {
            ctx.clearRect(0, 0, width, height);

            const orbit = time * 0.00016;
            const points = stars.map((star) => {
                if (!prefersReducedMotion) {
                    star.y = (star.y + star.speed) % (height + 60);
                }

                const pulseX = star.x + Math.sin(orbit + star.phase) * star.driftX;
                const pulseY = star.y + Math.cos(orbit * 1.18 + star.phase) * star.driftY;

                return {
                    x: pulseX,
                    y: pulseY,
                    star
                };
            });

            for (let index = 0; index < points.length; index += 1) {
                const point = points[index];
                const star = point.star;

                for (let linkIndex = index + 1; linkIndex < points.length; linkIndex += 1) {
                    const peer = points[linkIndex];
                    const dx = point.x - peer.x;
                    const dy = point.y - peer.y;
                    const distance = Math.hypot(dx, dy);

                    if (distance > linkDistance) continue;

                    const fade = 1 - distance / linkDistance;
                    const alpha = fade * fade * visualProfile.linkAlpha;
                    ctx.beginPath();
                    ctx.moveTo(point.x, point.y);
                    ctx.lineTo(peer.x, peer.y);
                    ctx.strokeStyle = star.color;
                    ctx.globalAlpha = Math.min(1, alpha * 1.6);
                    ctx.lineWidth = distance < linkDistance * 0.4
                        ? visualProfile.nearLineWidth
                        : distance < linkDistance * 0.7
                            ? (visualProfile.nearLineWidth + visualProfile.farLineWidth) / 2
                            : visualProfile.farLineWidth;
                    ctx.stroke();
                }

                // outer glow ring (wide, soft)
                ctx.beginPath();
                ctx.fillStyle = star.color;
                ctx.globalAlpha = visualProfile.glowAlpha * 1.4;
                ctx.arc(point.x, point.y, star.radius * star.glow * 1.3, 0, Math.PI * 2);
                ctx.fill();

                // mid glow (tighter, stronger)
                ctx.beginPath();
                ctx.fillStyle = star.color;
                ctx.globalAlpha = visualProfile.glowAlpha * 2.2;
                ctx.arc(point.x, point.y, star.radius * 3.5, 0, Math.PI * 2);
                ctx.fill();

                // solid node core
                ctx.beginPath();
                ctx.fillStyle = star.color;
                ctx.globalAlpha = visualProfile.nodeAlpha;
                ctx.arc(point.x, point.y, star.radius, 0, Math.PI * 2);
                ctx.fill();

                // bright white highlight
                ctx.beginPath();
                ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                ctx.globalAlpha = visualProfile.sparkAlpha * 1.25;
                ctx.arc(point.x, point.y, Math.max(0.6, star.radius * 0.44), 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalAlpha = 1;
            if (!prefersReducedMotion) requestAnimationFrame(drawFrame);
        }

        refreshVisualProfile();
        resizeCanvas();
        if (prefersReducedMotion) drawFrame(0);
        else requestAnimationFrame(drawFrame);

        window.addEventListener("resize", () => {
            resizeCanvas();
            if (prefersReducedMotion) drawFrame(0);
        });

        const themeObserver = new MutationObserver(() => {
            refreshVisualProfile();
            if (prefersReducedMotion) drawFrame(0);
        });
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    }

    applyTheme();
    window.siteAudioEnabled = siteAudioEnabled;
    window.toggleSiteAudio = toggleAudio;
    window.toggleSiteTheme = toggleTheme;

    if (audioBtn) {
        audioBtn.innerText = siteAudioEnabled ? "🔊" : "🔇";
        audioBtn.addEventListener("click", toggleAudio);
    }

    if (themeBtn) {
        themeBtn.addEventListener("click", toggleTheme);
    }

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopAmbientLayer();
        else if (siteAudioEnabled) startAmbientLayer();
    });

    document.querySelectorAll(".site-tab, .site-tabs-btn").forEach((el) => {
        el.addEventListener("mouseenter", () => playGlobalSound("hover"));
    });

    initWorldCanvas();
    if (siteAudioEnabled) startAmbientLayer();
});

// Immediately apply theme before DOMContentLoaded to prevent FOUC
(function() {
    var isDark = localStorage.getItem("site-dark-mode") === "true";
    if (isDark) {
        document.documentElement.classList.add("dark-mode");
        // Apply hacker-mode to body as soon as it exists
        if (document.body) {
            document.body.classList.add("hacker-mode");
        } else {
            // Use MutationObserver to catch body creation
            var observer = new MutationObserver(function() {
                if (document.body) {
                    document.body.classList.add("hacker-mode");
                    observer.disconnect();
                }
            });
            observer.observe(document.documentElement, { childList: true });
        }
    }
})();

function updateSiteScrollProgress() {
    let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    let scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    let activeTab = document.querySelector('.site-tab.is-active');
    if (activeTab) activeTab.style.setProperty('--tab-scroll-progress', scrolled + '%');
    let fullBar = document.getElementById('site-full-progress');
    if (fullBar) fullBar.style.width = scrolled + '%';
}

window.updateSiteScrollProgress = updateSiteScrollProgress;
window.addEventListener('scroll', updateSiteScrollProgress);
window.addEventListener('resize', updateSiteScrollProgress);

// Create full-width progress bar on all pages
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('site-full-progress')) {
        let bar = document.createElement('div');
        bar.id = 'site-full-progress';
        document.body.appendChild(bar);
    }

    updateSiteScrollProgress();
});

