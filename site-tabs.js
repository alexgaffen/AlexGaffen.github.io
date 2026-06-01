// site-tabs.js
document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const themeBtn = document.getElementById("site-theme-btn");

    let isDarkMode = localStorage.getItem("site-dark-mode") === "true";

    function applyTheme() {
        if (isDarkMode) {
            document.documentElement.classList.add("dark-mode");
            body.classList.add("hacker-mode");
        } else {
            document.documentElement.classList.remove("dark-mode");
            body.classList.remove("hacker-mode");
        }
    }

    function setThemeState(nextState) {
        isDarkMode = nextState;
        localStorage.setItem("site-dark-mode", String(isDarkMode));
        applyTheme();
    }

    function toggleTheme() {
        setThemeState(!isDarkMode);
    }

    function initWorldCanvas() {
        if (body.classList.contains("resume-page")) return;
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
    window.toggleSiteTheme = toggleTheme;

    if (themeBtn) {
        themeBtn.addEventListener("click", toggleTheme);
    }

    initWorldCanvas();
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
    if (document.body.classList.contains('resume-page')) return;

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

document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('resume-page')) return;

    if (!document.getElementById('site-full-progress')) {
        let bar = document.createElement('div');
        bar.id = 'site-full-progress';
        document.body.appendChild(bar);
    }

    updateSiteScrollProgress();
});

