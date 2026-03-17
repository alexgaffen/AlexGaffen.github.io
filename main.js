        // Always start at the top on page load/refresh
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);

        // Scroll reveal animation with staggered children
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    // Stagger child job-items
                    const children = entry.target.querySelectorAll('.job-item');
                    children.forEach((child, i) => {
                            child.style.transitionDelay = `${i * 0.18}s`;
                        child.classList.add('show-child');
                    });
                }
            });
        });

        const hiddenElements = document.querySelectorAll('.hidden');
        hiddenElements.forEach((el) => observer.observe(el));

        // Lock about section visibility after intro animations finish
        setTimeout(() => {
            const ac = document.querySelector('.about-content');
            if (ac) {
                ac.style.animation = 'none';
                ac.style.opacity = '1';
                ac.style.transform = 'none';
                ac.querySelectorAll('.name, .main-subheading, .tagline, .location-line, .bio-container').forEach(el => {
                    el.style.animation = 'none';
                    el.style.opacity = '1';
                    el.style.transform = 'none';
                });
            }
            const ah = document.querySelector('.about-highlights');
            if (ah) {
                ah.style.animation = 'none';
                ah.style.opacity = '1';
                ah.style.transform = 'none';
            }
        }, 1500);

        // Clickable cards (projects + certifications)
        const clickableCards = document.querySelectorAll('.clickable-card[data-href]');
        const hoverHint = document.getElementById('cardHoverHint');
        const supportsHover = window.matchMedia('(hover: hover)').matches;

        function openCardLink(url) {
            if (!url) return;
            window.open(url, '_blank', 'noopener,noreferrer');
        }

        clickableCards.forEach((card) => {
            card.setAttribute('role', 'link');
            card.setAttribute('tabindex', '0');

            card.addEventListener('click', (e) => {
                if (e.target.closest('a, button')) return;
                openCardLink(card.dataset.href);
            });

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openCardLink(card.dataset.href);
                }
            });

            if (supportsHover && hoverHint) {
                card.addEventListener('mouseenter', () => {
                    hoverHint.textContent = card.dataset.hoverText || 'Open link';
                    hoverHint.classList.add('visible');
                });

                card.addEventListener('mousemove', (e) => {
                    hoverHint.style.left = `${e.clientX + 18}px`;
                    hoverHint.style.top = `${e.clientY + 18}px`;
                });

                card.addEventListener('mouseleave', () => {
                    hoverHint.classList.remove('visible');
                });
            }
        });

        // Star theme toggle
        const htmlEl = document.documentElement;
        const starSlots = document.querySelectorAll('.star-slot');
        const starIndicator = document.querySelector('.star-indicator');

        function moveIndicator(slot) {
            const slotIndex = parseInt(slot.dataset.slot);
            const angle = slotIndex * 60 - 90; // start from top, 60° apart
            const rad = angle * Math.PI / 180;
            const radius = 38;
            const cx = 50 + radius * Math.cos(rad);
            const cy = 50 + radius * Math.sin(rad);
            starIndicator.style.left = cx + '%';
            starIndicator.style.top = cy + '%';
        }

        // Default to dark mode
        htmlEl.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        const defaultSlot = document.querySelector('.star-slot[data-theme="dark"]');
        defaultSlot.classList.add('active');
        moveIndicator(defaultSlot);

        starSlots.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                htmlEl.classList.add('theme-transitioning');
                starSlots.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                moveIndicator(btn);
                if (theme === 'dark') {
                    htmlEl.removeAttribute('data-theme');
                } else {
                    htmlEl.setAttribute('data-theme', theme);
                }
                localStorage.setItem('theme', theme);
                setTimeout(() => htmlEl.classList.remove('theme-transitioning'), 700);
            });
        });

        // Keyboard shortcuts: 1-6 switch themes, ArrowUp scrolls to top (desktop)
        const themeKeys = ['light', 'ocean', 'ember', 'dark', 'forest', 'aurora'];
        document.addEventListener('keydown', (e) => {
            // Ignore when typing in an input/textarea
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const keyNum = parseInt(e.key);
            if (keyNum >= 1 && keyNum <= 6) {
                const themeName = themeKeys[keyNum - 1];
                const slot = document.querySelector('.star-slot[data-theme="' + themeName + '"]');
                if (slot) slot.click();
            }
            if (e.key === 'ArrowUp' && window.innerWidth > 900) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });

        // Scroll-spy: highlight active nav link based on scroll position
        const navLinks = document.querySelectorAll('.nav-links a');
        const sections = document.querySelectorAll('section[id]');

        function updateActiveNav() {
            const scrollPos = window.scrollY + 120;

            let currentId = '';
            sections.forEach((section) => {
                if (section.offsetTop <= scrollPos) {
                    currentId = section.getAttribute('id');
                }
            });

            // If at the very top, default to about
            if (window.scrollY < 50) currentId = 'about';

            navLinks.forEach((link) => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + currentId) {
                    link.classList.add('active');
                }
            });
        }

        window.addEventListener('scroll', updateActiveNav);
        updateActiveNav();

        // Smooth scroll with offset for sidebar nav links so section h2 sits below header
        const NAV_OFFSET = 120; // matches the scroll-spy offset
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (!href || !href.startsWith('#')) return;
                e.preventDefault();
                const targetId = href.slice(1);
                const target = document.getElementById(targetId);
                if (!target) return;
                if (targetId === 'about') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    const top = target.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;
                    window.scrollTo({ top: top, behavior: 'smooth' });
                }
                // Keep URL clean (no hash fragment)
                history.replaceState(null, '', window.location.pathname + window.location.search);
                // ensure nav active updates after scroll settles
                setTimeout(updateActiveNav, 300);
            });
        });

        // Handle direct links on page load (preserve offset)
        if (location.hash) {
            const id = location.hash.slice(1);
            const el = document.getElementById(id);
            if (el) {
                if (id === 'about') {
                    window.scrollTo(0, 0);
                } else {
                    const top = el.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;
                    window.scrollTo(0, top);
                }
            }
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }

        // Scroll progress bar & back-to-top button (desktop only)
        const scrollProgress = document.getElementById('scrollProgress');
        const backToTop = document.getElementById('backToTop');
        const mobileTopBar = document.getElementById('mobileTopBar');
        const mobileTopBrand = document.getElementById('mobileTopBrand');
        const mobileTopHamburger = document.getElementById('mobileTopHamburger');
        let lastScrollY = window.scrollY;
        let mobileBarVisible = false;

        // Mobile nav menu toggle
        const mobileNavToggle = document.getElementById('mobileNavToggle');
        const mobileNavPanel = document.getElementById('mobileNavPanel');
        const mobileNavClose = document.getElementById('mobileNavClose');
        const mobileNavOverlay = document.getElementById('mobileNavOverlay');
        const sidebar = document.querySelector('.sidebar');

        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            scrollProgress.style.width = scrollPercent + '%';

            const delta = scrollTop - lastScrollY;
            lastScrollY = scrollTop;

            // Desktop: show/hide back-to-top arrow
            if (window.innerWidth > 900) {
                if (scrollTop > 400) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }
            }

            // Mobile: show/hide top bar when scrolling up past sidebar
            if (window.innerWidth <= 900) {
                const sidebarBottom = sidebar.offsetTop + sidebar.offsetHeight;
                if (scrollTop <= sidebarBottom) {
                    mobileBarVisible = false;
                } else if (delta < -3) {
                    mobileBarVisible = true;
                } else if (delta > 5) {
                    mobileBarVisible = false;
                }
                mobileTopBar.classList.toggle('visible', mobileBarVisible);
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Mobile top bar — brand scrolls to top, hamburger opens nav
        mobileTopBrand.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        mobileTopHamburger.addEventListener('click', openMobileNav);

        function openMobileNav() {
            mobileNavPanel.classList.add('open');
            mobileNavOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
        function closeMobileNav() {
            mobileNavPanel.classList.remove('open');
            mobileNavOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }

        mobileNavToggle.addEventListener('click', openMobileNav);
        mobileNavClose.addEventListener('click', closeMobileNav);
        mobileNavOverlay.addEventListener('click', closeMobileNav);

        // Close panel and scroll on link click
        mobileNavPanel.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (!href || !href.startsWith('#')) return;
                e.preventDefault();
                closeMobileNav();
                const targetId = href.slice(1);
                const target = document.getElementById(targetId);
                if (!target) return;
                if (targetId === 'about') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    const top = target.getBoundingClientRect().top + window.pageYOffset - NAV_OFFSET;
                    window.scrollTo({ top: top, behavior: 'smooth' });
                }
                history.replaceState(null, '', window.location.pathname + window.location.search);
            });
        });

        // Cursor glow — AI-style follow effect (only when hover capable)
        const cursorGlow = document.getElementById('cursorGlow');
        if (cursorGlow && window.matchMedia('(hover: hover)').matches) {
            const size = 420;
            const half = size / 2;
            let raf = 0;
            let x = -999, y = -999;
            document.addEventListener('mousemove', (e) => {
                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => {
                    x += (e.clientX - x) * 0.14;
                    y += (e.clientY - y) * 0.14;
                    cursorGlow.style.left = (x - half) + 'px';
                    cursorGlow.style.top = (y - half) + 'px';
                    cursorGlow.style.opacity = '0.55';
                    raf = 0;
                });
            });
            document.addEventListener('mouseleave', () => { cursorGlow.style.opacity = '0'; });
        } else if (cursorGlow) {
            cursorGlow.style.display = 'none';
        }

        // About grid lights — simple linear streaks that travel one direction and fade in/out
        (function initAboutGridLights() {
            if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;
            const about = document.getElementById('about');
            if (!about) return;
            const container = about.querySelector('.grid-lights');
            if (!container) return;

            const gridSize = 64;

            function rand(min, max) { return min + Math.random() * (max - min); }
            function snap(n) { return Math.round(n / gridSize) * gridSize; }

            const lights = [];
            const MAX_LIGHTS = 14;

            function spawnLight() {
                const rect = about.getBoundingClientRect();
                const w = Math.max(200, rect.width);
                const h = Math.max(200, rect.height);

                const isHorizontal = Math.random() < 0.5;
                const el = document.createElement('span');
                el.className = 'grid-light';

                let x, y, dx, dy, travel;
                if (isHorizontal) {
                    y = snap(rand(0, h));
                    const goRight = Math.random() < 0.5;
                    x = goRight ? -10 : w + 10;
                    dx = goRight ? 1 : -1;
                    dy = 0;
                    travel = w + 20;
                    el.style.width = '18px';
                    el.style.height = '3px';
                    el.style.borderRadius = '2px';
                } else {
                    x = snap(rand(0, w));
                    const goDown = Math.random() < 0.5;
                    y = goDown ? -10 : h + 10;
                    dx = 0;
                    dy = goDown ? 1 : -1;
                    travel = h + 20;
                    el.style.width = '3px';
                    el.style.height = '18px';
                    el.style.borderRadius = '2px';
                }

                container.appendChild(el);
                const speed = rand(60, 140);
                lights.push({ el, x, y, dx, dy, speed, traveled: 0, maxTravel: travel, opacity: 0, phase: 'in' });
            }

            // Spawn initial batch
            for (let i = 0; i < 8; i++) spawnLight();

            let last = performance.now();
            function tick(now) {
                const dt = Math.min(0.05, (now - last) / 1000);
                last = now;

                // Spawn new lights periodically
                if (lights.length < MAX_LIGHTS && Math.random() < dt * 2.5) {
                    spawnLight();
                }

                for (let i = lights.length - 1; i >= 0; i--) {
                    const s = lights[i];
                    const move = s.speed * dt;
                    s.x += s.dx * move;
                    s.y += s.dy * move;
                    s.traveled += move;

                    // Fade in/out
                    const progress = s.traveled / s.maxTravel;
                    if (progress < 0.15) {
                        s.opacity = progress / 0.15;
                    } else if (progress > 0.85) {
                        s.opacity = (1 - progress) / 0.15;
                    } else {
                        s.opacity = 1;
                    }

                    s.el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
                    s.el.style.opacity = Math.max(0, Math.min(1, s.opacity));

                    // Remove when done
                    if (s.traveled >= s.maxTravel) {
                        s.el.remove();
                        lights.splice(i, 1);
                    }
                }

                requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        })();

        // ═══════════════════════════════════════════════════════
        // THEMED CANVAS EFFECTS for Ocean / Ember / Forest / Aurora
        // ═══════════════════════════════════════════════════════
        (function initThemeFx() {
            const canvas = document.getElementById('themeFxCanvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');

            let W = 0, H = 0, particles = [], animId = null, currentTheme = 'dark';
            const DPR = Math.min(window.devicePixelRatio || 1, 2);

            function resize() {
                W = window.innerWidth;
                H = window.innerHeight;
                canvas.width = W * DPR;
                canvas.height = H * DPR;
                canvas.style.width = W + 'px';
                canvas.style.height = H + 'px';
                ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
            }

            function rand(a, b) { return a + Math.random() * (b - a); }
            function randInt(a, b) { return Math.floor(rand(a, b + 1)); }

            // ──── OCEAN: ripple rings + floating bubbles + wave lines ────
            function spawnOcean() {
                particles = [];
                // Ripple rings
                for (let i = 0; i < 6; i++) {
                    particles.push({
                        type: 'ripple', x: rand(0, W), y: rand(0, H),
                        r: rand(0, 30), maxR: rand(60, 140),
                        speed: rand(15, 35), opacity: rand(0.3, 0.6),
                        color: ['rgba(34,211,238,', 'rgba(56,189,248,', 'rgba(14,165,233,'][randInt(0,2)]
                    });
                }
                // Floating bubbles
                for (let i = 0; i < 30; i++) {
                    particles.push({
                        type: 'bubble', x: rand(0, W), y: rand(0, H),
                        r: rand(1.5, 5), vy: rand(-12, -30), vx: rand(-4, 4),
                        wobble: rand(0, Math.PI * 2), wobbleSpeed: rand(1, 3),
                        opacity: rand(0.15, 0.5),
                        color: ['rgba(34,211,238,', 'rgba(56,189,248,', 'rgba(125,211,252,'][randInt(0,2)]
                    });
                }
                // Wave lines
                for (let i = 0; i < 4; i++) {
                    particles.push({
                        type: 'wave', y: rand(H * 0.2, H * 0.8),
                        phase: rand(0, Math.PI * 2), speed: rand(0.3, 0.8),
                        amp: rand(8, 20), freq: rand(0.005, 0.015),
                        opacity: rand(0.06, 0.14),
                        color: 'rgba(34,211,238,'
                    });
                }
            }

            function drawOcean(dt) {
                for (const p of particles) {
                    if (p.type === 'ripple') {
                        p.r += p.speed * dt;
                        const life = p.r / p.maxR;
                        const alpha = p.opacity * (1 - life);
                        if (p.r >= p.maxR) {
                            p.r = 0; p.x = rand(0, W); p.y = rand(0, H);
                            p.maxR = rand(60, 140);
                        }
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                        ctx.strokeStyle = p.color + alpha.toFixed(3) + ')';
                        ctx.lineWidth = 1.5;
                        ctx.stroke();
                    } else if (p.type === 'bubble') {
                        p.wobble += p.wobbleSpeed * dt;
                        p.y += p.vy * dt;
                        p.x += Math.sin(p.wobble) * 0.5;
                        if (p.y < -10) { p.y = H + 10; p.x = rand(0, W); }
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                        ctx.fillStyle = p.color + p.opacity.toFixed(3) + ')';
                        ctx.fill();
                        // Highlight
                        ctx.beginPath();
                        ctx.arc(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.3, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(255,255,255,' + (p.opacity * 0.5).toFixed(3) + ')';
                        ctx.fill();
                    } else if (p.type === 'wave') {
                        p.phase += p.speed * dt;
                        ctx.beginPath();
                        for (let x = 0; x <= W; x += 4) {
                            const y = p.y + Math.sin(x * p.freq + p.phase) * p.amp;
                            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                        }
                        ctx.strokeStyle = p.color + p.opacity.toFixed(3) + ')';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }

            // ──── EMBER: sparks, fire particles, hot embers, heat shimmer ────
            function spawnEmber() {
                particles = [];
                // Rising sparks
                for (let i = 0; i < 50; i++) {
                    particles.push({
                        type: 'spark', x: rand(0, W), y: rand(H * 0.3, H),
                        vx: rand(-8, 8), vy: rand(-60, -20),
                        size: rand(1, 3.5), life: 0, maxLife: rand(2, 5),
                        color: ['#f97316', '#ef4444', '#eab308', '#fb923c', '#fbbf24'][randInt(0,4)],
                        flicker: rand(0, Math.PI * 2)
                    });
                }
                // Glowing embers (larger, slower)
                for (let i = 0; i < 12; i++) {
                    particles.push({
                        type: 'ember', x: rand(0, W), y: rand(H * 0.5, H),
                        vx: rand(-3, 3), vy: rand(-15, -5),
                        size: rand(3, 7), life: 0, maxLife: rand(4, 8),
                        pulse: rand(0, Math.PI * 2),
                        color: ['#f97316', '#ef4444', '#dc2626'][randInt(0,2)]
                    });
                }
                // Heat shimmer zones
                for (let i = 0; i < 3; i++) {
                    particles.push({
                        type: 'heatShimmer', x: rand(W * 0.1, W * 0.9), y: H,
                        width: rand(80, 200), height: rand(H * 0.4, H * 0.7),
                        phase: rand(0, Math.PI * 2), speed: rand(2, 4)
                    });
                }
            }

            function drawEmber(dt) {
                // Bottom fire glow
                const grd = ctx.createLinearGradient(0, H, 0, H * 0.5);
                grd.addColorStop(0, 'rgba(249,115,22,0.12)');
                grd.addColorStop(0.4, 'rgba(239,68,68,0.04)');
                grd.addColorStop(1, 'transparent');
                ctx.fillStyle = grd;
                ctx.fillRect(0, H * 0.5, W, H * 0.5);

                for (const p of particles) {
                    if (p.type === 'spark') {
                        p.life += dt;
                        p.flicker += dt * 12;
                        p.x += p.vx * dt;
                        p.vy += rand(-5, 5) * dt; // turbulence
                        p.y += p.vy * dt;
                        p.vx += rand(-10, 10) * dt;
                        const lifeRatio = p.life / p.maxLife;
                        if (p.life >= p.maxLife) {
                            p.life = 0; p.x = rand(0, W); p.y = rand(H * 0.4, H);
                            p.vx = rand(-8, 8); p.vy = rand(-60, -20);
                        }
                        const alpha = (1 - lifeRatio) * (0.5 + Math.sin(p.flicker) * 0.3);
                        const sz = p.size * (1 - lifeRatio * 0.5);
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
                        ctx.fillStyle = p.color;
                        ctx.globalAlpha = Math.max(0, alpha);
                        ctx.fill();
                        // Glow
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, sz * 3, 0, Math.PI * 2);
                        ctx.fillStyle = p.color;
                        ctx.globalAlpha = Math.max(0, alpha * 0.15);
                        ctx.fill();
                        ctx.globalAlpha = 1;
                    } else if (p.type === 'ember') {
                        p.life += dt;
                        p.pulse += dt * 2;
                        p.x += p.vx * dt + Math.sin(p.pulse * 1.5) * 0.3;
                        p.y += p.vy * dt;
                        if (p.life >= p.maxLife) {
                            p.life = 0; p.x = rand(0, W); p.y = rand(H * 0.5, H);
                            p.vy = rand(-15, -5);
                        }
                        const lifeRatio = p.life / p.maxLife;
                        const alpha = (1 - lifeRatio) * (0.5 + Math.sin(p.pulse) * 0.2);
                        const sz = p.size * (0.5 + Math.sin(p.pulse) * 0.3);
                        // Outer glow
                        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz * 4);
                        g.addColorStop(0, p.color);
                        g.addColorStop(1, 'transparent');
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, sz * 4, 0, Math.PI * 2);
                        ctx.fillStyle = g;
                        ctx.globalAlpha = Math.max(0, alpha * 0.3);
                        ctx.fill();
                        // Core
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
                        ctx.fillStyle = '#fef3c7';
                        ctx.globalAlpha = Math.max(0, alpha);
                        ctx.fill();
                        ctx.globalAlpha = 1;
                    }
                }
            }

            // ──── FOREST: leaves, fireflies, grass blades, pollen ────
            function spawnForest() {
                particles = [];
                // Fireflies
                for (let i = 0; i < 20; i++) {
                    particles.push({
                        type: 'firefly', x: rand(0, W), y: rand(0, H),
                        vx: rand(-10, 10), vy: rand(-10, 10),
                        size: rand(2, 4), pulse: rand(0, Math.PI * 2),
                        pulseSpeed: rand(1.5, 4), driftAngle: rand(0, Math.PI * 2),
                        driftSpeed: rand(0.3, 1),
                        color: ['rgba(74,222,128,', 'rgba(34,197,94,', 'rgba(134,239,172,'][randInt(0,2)]
                    });
                }
                // Falling leaves
                for (let i = 0; i < 10; i++) {
                    particles.push({
                        type: 'leaf', x: rand(0, W), y: rand(-50, H),
                        vx: rand(5, 20), vy: rand(10, 30),
                        rot: rand(0, Math.PI * 2), rotSpeed: rand(-2, 2),
                        size: rand(5, 12), wobble: rand(0, Math.PI * 2),
                        wobbleSpeed: rand(1, 3),
                        color: ['#4ade80', '#22c55e', '#86efac', '#16a34a'][randInt(0,3)]
                    });
                }
                // Pollen / spores
                for (let i = 0; i < 25; i++) {
                    particles.push({
                        type: 'pollen', x: rand(0, W), y: rand(0, H),
                        vx: rand(-4, 8), vy: rand(-6, -1),
                        size: rand(1, 2.5), opacity: rand(0.15, 0.4),
                        drift: rand(0, Math.PI * 2), driftSpeed: rand(0.5, 2)
                    });
                }
            }

            function drawForest(dt) {
                for (const p of particles) {
                    if (p.type === 'firefly') {
                        p.pulse += p.pulseSpeed * dt;
                        p.driftAngle += p.driftSpeed * dt;
                        p.x += (p.vx + Math.cos(p.driftAngle) * 15) * dt;
                        p.y += (p.vy + Math.sin(p.driftAngle) * 15) * dt;
                        // Wrap
                        if (p.x < -20) p.x = W + 20;
                        if (p.x > W + 20) p.x = -20;
                        if (p.y < -20) p.y = H + 20;
                        if (p.y > H + 20) p.y = -20;
                        const brightness = 0.3 + Math.sin(p.pulse) * 0.35 + 0.35;
                        // Glow
                        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
                        g.addColorStop(0, p.color + (brightness * 0.5).toFixed(3) + ')');
                        g.addColorStop(1, p.color + '0)');
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2);
                        ctx.fillStyle = g;
                        ctx.fill();
                        // Core
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        ctx.fillStyle = p.color + brightness.toFixed(3) + ')';
                        ctx.fill();
                    } else if (p.type === 'leaf') {
                        p.wobble += p.wobbleSpeed * dt;
                        p.rot += p.rotSpeed * dt;
                        p.x += (p.vx + Math.sin(p.wobble) * 12) * dt;
                        p.y += p.vy * dt;
                        if (p.y > H + 20) { p.y = -20; p.x = rand(0, W); }
                        if (p.x > W + 20) p.x = -20;
                        ctx.save();
                        ctx.translate(p.x, p.y);
                        ctx.rotate(p.rot);
                        ctx.globalAlpha = 0.35;
                        // Simple leaf shape
                        ctx.beginPath();
                        ctx.ellipse(0, 0, p.size, p.size * 0.4, 0, 0, Math.PI * 2);
                        ctx.fillStyle = p.color;
                        ctx.fill();
                        // Stem
                        ctx.beginPath();
                        ctx.moveTo(-p.size, 0);
                        ctx.lineTo(p.size, 0);
                        ctx.strokeStyle = '#16a34a';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                        ctx.restore();
                    } else if (p.type === 'pollen') {
                        p.drift += p.driftSpeed * dt;
                        p.x += (p.vx + Math.sin(p.drift) * 5) * dt;
                        p.y += (p.vy + Math.cos(p.drift) * 3) * dt;
                        if (p.y < -10) { p.y = H + 10; p.x = rand(0, W); }
                        if (p.x > W + 10) p.x = -10;
                        if (p.x < -10) p.x = W + 10;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        ctx.fillStyle = 'rgba(134,239,172,' + p.opacity.toFixed(3) + ')';
                        ctx.fill();
                    }
                }
            }

            // ──── AURORA: stars, shooting stars, nebula clouds, aurora bands ────
            function spawnAurora() {
                particles = [];
                // Static twinkling stars
                for (let i = 0; i < 80; i++) {
                    particles.push({
                        type: 'star', x: rand(0, W), y: rand(0, H),
                        size: rand(0.5, 2.5),
                        pulse: rand(0, Math.PI * 2), pulseSpeed: rand(0.8, 3),
                        baseOpacity: rand(0.2, 0.7),
                        color: Math.random() < 0.6 ? 'rgba(255,255,255,' : 
                               Math.random() < 0.5 ? 'rgba(192,132,252,' : 'rgba(168,85,247,'
                    });
                }
                // Shooting stars (periodic)
                for (let i = 0; i < 3; i++) {
                    particles.push({
                        type: 'shootingStar',
                        x: rand(0, W), y: rand(0, H * 0.4),
                        vx: rand(150, 350), vy: rand(60, 150),
                        length: rand(40, 100), life: 0,
                        maxLife: rand(0.6, 1.2),
                        delay: rand(i * 3, i * 3 + 5),
                        waiting: true
                    });
                }
                // Nebula / aurora bands
                for (let i = 0; i < 4; i++) {
                    particles.push({
                        type: 'aurora',
                        y: rand(H * 0.1, H * 0.7),
                        phase: rand(0, Math.PI * 2),
                        speed: rand(0.15, 0.4),
                        amp: rand(15, 40),
                        thickness: rand(30, 60),
                        opacity: rand(0.03, 0.07),
                        color: [
                            [139, 92, 246], [192, 132, 252],
                            [168, 85, 247], [124, 58, 237]
                        ][i % 4],
                        freq: rand(0.003, 0.008)
                    });
                }
            }

            function drawAurora(dt) {
                // Aurora bands first (behind everything)
                for (const p of particles) {
                    if (p.type === 'aurora') {
                        p.phase += p.speed * dt;
                        ctx.beginPath();
                        ctx.moveTo(0, p.y + Math.sin(p.phase) * p.amp);
                        for (let x = 0; x <= W; x += 3) {
                            const y = p.y + Math.sin(x * p.freq + p.phase) * p.amp +
                                      Math.sin(x * p.freq * 2.5 + p.phase * 1.5) * p.amp * 0.3;
                            ctx.lineTo(x, y);
                        }
                        ctx.lineTo(W, p.y + p.thickness + Math.sin(W * p.freq + p.phase) * p.amp);
                        for (let x = W; x >= 0; x -= 3) {
                            const y = p.y + p.thickness + Math.sin(x * p.freq + p.phase + 0.5) * p.amp * 0.7 +
                                      Math.sin(x * p.freq * 2 + p.phase * 1.3) * p.amp * 0.2;
                            ctx.lineTo(x, y);
                        }
                        ctx.closePath();
                        const g = ctx.createLinearGradient(0, p.y - p.amp, 0, p.y + p.thickness + p.amp);
                        const [r, gg, b] = p.color;
                        g.addColorStop(0, `rgba(${r},${gg},${b},0)`);
                        g.addColorStop(0.3, `rgba(${r},${gg},${b},${p.opacity})`);
                        g.addColorStop(0.7, `rgba(${r},${gg},${b},${p.opacity * 0.7})`);
                        g.addColorStop(1, `rgba(${r},${gg},${b},0)`);
                        ctx.fillStyle = g;
                        ctx.fill();
                    }
                }
                // Stars
                for (const p of particles) {
                    if (p.type === 'star') {
                        p.pulse += p.pulseSpeed * dt;
                        const alpha = p.baseOpacity + Math.sin(p.pulse) * 0.25;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        ctx.fillStyle = p.color + Math.max(0, alpha).toFixed(3) + ')';
                        ctx.fill();
                        // Cross glint on brighter stars
                        if (p.size > 1.5 && alpha > 0.5) {
                            ctx.strokeStyle = p.color + (alpha * 0.3).toFixed(3) + ')';
                            ctx.lineWidth = 0.5;
                            ctx.beginPath();
                            ctx.moveTo(p.x - p.size * 3, p.y);
                            ctx.lineTo(p.x + p.size * 3, p.y);
                            ctx.moveTo(p.x, p.y - p.size * 3);
                            ctx.lineTo(p.x, p.y + p.size * 3);
                            ctx.stroke();
                        }
                    }
                }
                // Shooting stars
                for (const p of particles) {
                    if (p.type === 'shootingStar') {
                        if (p.waiting) {
                            p.delay -= dt;
                            if (p.delay <= 0) {
                                p.waiting = false;
                                p.life = 0;
                                p.x = rand(-50, W * 0.3);
                                p.y = rand(0, H * 0.3);
                            }
                            continue;
                        }
                        p.life += dt;
                        p.x += p.vx * dt;
                        p.y += p.vy * dt;
                        const lifeRatio = p.life / p.maxLife;
                        const alpha = lifeRatio < 0.1 ? lifeRatio / 0.1 : 
                                      lifeRatio > 0.6 ? (1 - lifeRatio) / 0.4 : 1;
                        // Trail
                        const angle = Math.atan2(p.vy, p.vx);
                        const tailX = p.x - Math.cos(angle) * p.length;
                        const tailY = p.y - Math.sin(angle) * p.length;
                        const g = ctx.createLinearGradient(tailX, tailY, p.x, p.y);
                        g.addColorStop(0, 'rgba(192,132,252,0)');
                        g.addColorStop(1, `rgba(255,255,255,${(alpha * 0.8).toFixed(3)})`);
                        ctx.beginPath();
                        ctx.moveTo(tailX, tailY);
                        ctx.lineTo(p.x, p.y);
                        ctx.strokeStyle = g;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        // Head
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255,255,255,${(alpha).toFixed(3)})`;
                        ctx.fill();

                        if (p.life >= p.maxLife) {
                            p.waiting = true;
                            p.delay = rand(4, 10);
                        }
                    }
                }
            }

            // ──── ENGINE ────
            const themeFns = {
                ocean:  { spawn: spawnOcean,  draw: drawOcean },
                ember:  { spawn: spawnEmber,  draw: drawEmber },
                forest: { spawn: spawnForest, draw: drawForest },
                aurora: { spawn: spawnAurora, draw: drawAurora }
            };

            function startFx(theme) {
                if (animId) { cancelAnimationFrame(animId); animId = null; }
                currentTheme = theme;
                if (!themeFns[theme]) { particles = []; return; }
                resize();
                themeFns[theme].spawn();
                let last = performance.now();
                function loop(now) {
                    const dt = Math.min(0.1, (now - last) / 1000);
                    last = now;
                    ctx.clearRect(0, 0, W, H);
                    themeFns[theme].draw(dt);
                    animId = requestAnimationFrame(loop);
                }
                animId = requestAnimationFrame(loop);
            }

            // Observe theme changes
            const observer = new MutationObserver(() => {
                const theme = document.documentElement.getAttribute('data-theme') || 'dark';
                if (theme !== currentTheme) startFx(theme);
            });
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

            window.addEventListener('resize', () => {
                if (themeFns[currentTheme]) resize();
            });

            // Initial state
            startFx(document.documentElement.getAttribute('data-theme') || 'dark');

            // Hacker Text Effect
            const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
            const hackerElements = document.querySelectorAll('.bio-intro, .bio-personal');
            
            const hackerObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.dataset.hacked) {
                        entry.target.dataset.hacked = "true";
                        const originalText = entry.target.innerText;
                        let iteration = 0;
                        
                        // Set fixed number of frames for max ~1.8 second load time (60 frames at 30ms)
                        const totalFrames = 60; 
                        const increment = Math.max(originalText.length / totalFrames, 1);
                        
                        const interval = setInterval(() => {
                            entry.target.innerText = originalText
                                .split("")
                                .map((letter, index) => {
                                    if (index < iteration) {
                                        return originalText[index];
                                    }
                                    // Preserve spaces & newlines so the text box doesn't jitter or change size
                                    if (originalText[index] === ' ' || originalText[index] === '\n') {
                                        return originalText[index];
                                    }
                                    return letters[Math.floor(Math.random() * letters.length)];
                                })
                                .join("");
                            
                            if (iteration >= originalText.length) { 
                                clearInterval(interval);
                                entry.target.innerText = originalText;
                            }
                            
                            iteration += increment;
                        }, 30);
                    }
                });
            }, { threshold: 0.1 });
            
            hackerElements.forEach(el => hackerObserver.observe(el));
        })();
