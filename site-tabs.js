// site-tabs.js

// Apply the saved (or default) theme synchronously before first paint to avoid
// a light-mode flash. Defaults to dark mode when nothing is stored.
(function applyInitialTheme() {
    try {
        if (localStorage.getItem("site-dark-mode") === null) {
            localStorage.setItem("site-dark-mode", "false");
        }
        // Opt-in dark: anything other than an explicit "true" renders light, so a
        // first visit (or a browser that refuses storage) lands in light mode.
        var dark = localStorage.getItem("site-dark-mode") === "true";
        var html = document.documentElement;
        if (dark) {
            html.classList.add("dark-mode");
            html.removeAttribute("data-theme");
        } else {
            html.classList.remove("dark-mode");
            html.setAttribute("data-theme", "light");
        }
    } catch (e) { /* ignore */ }
})();

document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const themeBtn = document.getElementById("site-theme-btn");
    const navControls = document.querySelector(".site-tabs-controls");

    let isDarkMode = localStorage.getItem("site-dark-mode") === "true";

    function initNavSocials() {
        if (!navControls || navControls.querySelector(".nav-socials")) return;
        const socials = document.createElement("div");
        socials.className = "nav-socials";
        socials.setAttribute("aria-label", "Profile links");
        socials.innerHTML = `
            <a class="nav-social-link nav-social-github" href="https://github.com/alexgaffen" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
                <i class="fab fa-github" aria-hidden="true"></i>
            </a>
            <a class="nav-social-link nav-social-linkedin" href="https://www.linkedin.com/in/alexgaffen/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">
                <i class="fab fa-linkedin-in" aria-hidden="true"></i>
            </a>
            <a class="nav-social-link nav-social-thm" href="https://tryhackme.com/p/alexgaffen" target="_blank" rel="noopener noreferrer" aria-label="TryHackMe" title="TryHackMe">
                <i class="fas fa-skull" aria-hidden="true"></i>
            </a>
        `;
        const divider = document.createElement("span");
        divider.className = "nav-controls-divider";
        divider.setAttribute("aria-hidden", "true");
        const firstFunctionControl = document.getElementById("ag-console-fab") || themeBtn || navControls.firstChild;
        navControls.insertBefore(socials, firstFunctionControl);
        navControls.insertBefore(divider, firstFunctionControl);
    }

    function applyTheme() {
        const html = document.documentElement;
        if (isDarkMode) {
            html.classList.add("dark-mode");
            body.classList.add("hacker-mode");
            if (body.classList.contains("resume-page")) {
                html.setAttribute("data-theme", "aurora");
            } else {
                html.removeAttribute("data-theme");
            }
            if (themeBtn) {
                themeBtn.setAttribute("aria-checked", "true");
                themeBtn.dataset.mode = "dark";
            }
        } else {
            html.classList.remove("dark-mode");
            body.classList.remove("hacker-mode");
            if (body.classList.contains("resume-page")) {
                html.setAttribute("data-theme", "light");
            } else {
                html.setAttribute("data-theme", "light");
            }
            if (themeBtn) {
                themeBtn.setAttribute("aria-checked", "false");
                themeBtn.dataset.mode = "light";
            }
        }
    }

    initNavSocials();

    function setThemeState(nextState) {
        isDarkMode = nextState;
        localStorage.setItem("site-dark-mode", String(isDarkMode));
        applyTheme();
    }

    function toggleTheme() {
        const html = document.documentElement;
        html.classList.add("theme-transitioning");
        setThemeState(!isDarkMode);
        setTimeout(() => html.classList.remove("theme-transitioning"), 700);
    }

    function initWorldCanvas() {
        if (body.classList.contains("resume-page")) return;
        // The home page draws its backdrop entirely in CSS (a static grid and
        // two still colour washes), so it opts out of the animated canvas.
        if (body.classList.contains("index-page")) return;
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

            const linkDistanceSq = linkDistance * linkDistance;
            const nearCut = linkDistance * 0.4;
            const farCut = linkDistance * 0.7;
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

                    // Compare squared distances first — most pairs are out of
                    // range, and this skips the sqrt for all of them.
                    const distSq = dx * dx + dy * dy;
                    if (distSq > linkDistanceSq) continue;

                    const distance = Math.sqrt(distSq);
                    const fade = 1 - distance / linkDistance;
                    const alpha = fade * fade * visualProfile.linkAlpha;
                    ctx.beginPath();
                    ctx.moveTo(point.x, point.y);
                    ctx.lineTo(peer.x, peer.y);
                    ctx.strokeStyle = star.color;
                    ctx.globalAlpha = Math.min(1, alpha * 1.6);
                    ctx.lineWidth = distance < nearCut
                        ? visualProfile.nearLineWidth
                        : distance < farCut
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
        }

        // The backdrop drifts slowly, so painting it at ~30fps looks identical to
        // 60fps while halving the work. The loop also stops entirely whenever the
        // tab is hidden, so a background tab costs nothing.
        const FRAME_MS = 1000 / 30;
        let rafId = null;
        let lastPaint = 0;

        function loop(time) {
            rafId = requestAnimationFrame(loop);
            if (time - lastPaint < FRAME_MS) return;
            lastPaint = time;
            drawFrame(time);
        }

        function startLoop() {
            if (rafId !== null || prefersReducedMotion) return;
            lastPaint = 0;
            rafId = requestAnimationFrame(loop);
        }

        function stopLoop() {
            if (rafId === null) return;
            cancelAnimationFrame(rafId);
            rafId = null;
        }

        refreshVisualProfile();
        resizeCanvas();

        function begin() {
            if (prefersReducedMotion) drawFrame(0);
            else if (!document.hidden) startLoop();
        }

        // A page being pre-rendered for an instant tab switch must not burn CPU
        // animating a backdrop nobody is looking at yet.
        if (document.prerendering) {
            document.addEventListener("prerenderingchange", begin, { once: true });
        } else {
            begin();
        }

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) stopLoop();
            else if (!document.prerendering) begin();
        });

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

    /* -----------------------------------------------------------------------
       INSTANT TAB SWITCHING
       The tabs are still ordinary links, but the browser is told to fetch and
       pre-render the other pages ahead of the click, so switching swaps to an
       already-built page instead of tearing down and re-rendering from scratch.

         prefetch  (immediate) - pulls each tab's HTML into cache right away.
         prerender (moderate)  - on hover / pointerdown, fully renders the page
                                 in the background; the click is then a swap.

       Chromium runs the speculation rules; everything else falls back to plain
       <link rel="prefetch">, which still removes the HTML round-trip.
       ----------------------------------------------------------------------- */
    function initInstantNav() {
        var tabs = Array.prototype.slice.call(document.querySelectorAll(".site-tab"));
        var urls = tabs
            .filter(function (a) { return !a.classList.contains("is-active"); })
            .map(function (a) { return a.getAttribute("href"); })
            .filter(function (h) { return h && h.charAt(0) !== "#"; });
        if (!urls.length) return;

        var supportsRules = typeof HTMLScriptElement !== "undefined" &&
            HTMLScriptElement.supports &&
            HTMLScriptElement.supports("speculationrules");

        // Respect data-saver / metered connections: skip speculative loading.
        var conn = navigator.connection;
        if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ""))) return;

        if (supportsRules) {
            var script = document.createElement("script");
            script.type = "speculationrules";
            script.textContent = JSON.stringify({
                prefetch: [{ source: "list", urls: urls, eagerness: "immediate" }],
                // "immediate" prerenders the other tabs as soon as this page
                // loads, so the very first click is a swap rather than a build.
                // Affordable now that the gallery grid is ~0.8 MB and the
                // backdrop canvas stays paused until a prerender is activated.
                prerender: [{ source: "list", urls: urls, eagerness: "immediate" }]
            });
            document.head.appendChild(script);
        } else {
            urls.forEach(function (href) {
                var link = document.createElement("link");
                link.rel = "prefetch";
                link.as = "document";
                link.href = href;
                document.head.appendChild(link);
            });
        }
    }

    applyTheme();
    window.toggleSiteTheme = toggleTheme;
    initInstantNav();

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
        if (document.documentElement.classList.contains("resume-page") || window.location.pathname.indexOf("resume") !== -1) {
            document.documentElement.setAttribute("data-theme", "aurora");
        }
        // Apply hacker-mode to body as soon as it exists
        if (document.body) {
            document.body.classList.add("hacker-mode");
            if (document.body.classList.contains("resume-page")) {
                document.documentElement.setAttribute("data-theme", "aurora");
            }
        } else {
            // Use MutationObserver to catch body creation
            var observer = new MutationObserver(function() {
                if (document.body) {
                    document.body.classList.add("hacker-mode");
                    if (document.body.classList.contains("resume-page")) {
                        document.documentElement.setAttribute("data-theme", "aurora");
                    }
                    observer.disconnect();
                }
            });
            observer.observe(document.documentElement, { childList: true });
        }
    } else {
        document.documentElement.setAttribute("data-theme", "light");
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

