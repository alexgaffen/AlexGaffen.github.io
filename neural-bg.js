// neural-bg.js — Interactive 3D neural network background (home page)
// Hand-rolled 3D: perspective projection, depth fog, signal pulses, parallax.
// Reuses #site-world-canvas so site-tabs.js skips its 2D fallback.
(function () {
    "use strict";
    if (window.__neuralBgInit) return;
    window.__neuralBgInit = true;

    var canvas = document.createElement("canvas");
    canvas.id = "site-world-canvas";
    canvas.className = "site-world-canvas";
    (document.body || document.documentElement).appendChild(canvas);

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var W = 0, H = 0, CX = 0, CY = 0, FOV = 1000, R = 0;
    var nodes = [], edges = [], pulses = [];
    var rotY = 0, rotX = -0.22;
    var tiltX = 0, tiltY = 0, targetTiltX = 0, targetTiltY = 0;
    var baseSpeed = 0.0016;
    var hyper = 0;            // frames of hyperdrive remaining
    var rafId = null;
    var lastSpawn = 0;

    // ---- theme palettes ----
    var dark = true;
    var palette = {};
    function refreshPalette() {
        dark = document.documentElement.classList.contains("dark-mode");
        palette = dark
            ? {
                edge: ["168,85,247", "34,211,238", "59,130,246"],
                node: ["192,132,252", "103,232,249", "147,197,253"],
                pulse: "233,213,255",
                spark: "255,255,255",
                edgeAlpha: 0.5,
                glowAlpha: 0.38,
                nodeAlpha: 0.95
            }
            : {
                edge: ["109,40,217", "8,145,178", "29,78,216"],
                node: ["109,40,217", "14,116,144", "30,64,175"],
                pulse: "88,28,135",
                spark: "255,255,255",
                edgeAlpha: 0.34,
                glowAlpha: 0.16,
                nodeAlpha: 0.85
            };
    }

    // ---- geometry ----
    function buildNetwork() {
        var count = W < 700 ? 64 : 110;
        // Sphere larger than the viewport: content sits "inside" the network,
        // so nodes fill the margins instead of hiding behind the main card.
        R = Math.max(W, H) * 0.85;
        nodes = [];

        // ~70% on a fibonacci sphere shell, ~30% inner cloud
        var shell = Math.round(count * 0.7);
        var golden = Math.PI * (3 - Math.sqrt(5));
        for (var i = 0; i < shell; i++) {
            var y = 1 - (i / (shell - 1)) * 2;
            var rad = Math.sqrt(1 - y * y);
            var theta = golden * i;
            nodes.push({
                x: Math.cos(theta) * rad * R,
                y: y * R * 0.78,
                z: Math.sin(theta) * rad * R,
                r: 1.6 + Math.random() * 2.2,
                c: i % 3,
                phase: Math.random() * Math.PI * 2
            });
        }
        for (var j = shell; j < count; j++) {
            var u = Math.random() * Math.PI * 2;
            var v = Math.acos(2 * Math.random() - 1);
            var rr = R * (0.25 + Math.random() * 0.6);
            nodes.push({
                x: Math.sin(v) * Math.cos(u) * rr,
                y: Math.cos(v) * rr * 0.78,
                z: Math.sin(v) * Math.sin(u) * rr,
                r: 1.2 + Math.random() * 2.0,
                c: j % 3,
                phase: Math.random() * Math.PI * 2
            });
        }

        // connect each node to its 2 nearest neighbours (dedup, cap degree 4)
        edges = [];
        var seen = {};
        var degree = new Array(nodes.length).fill(0);
        for (var a = 0; a < nodes.length; a++) {
            var dists = [];
            for (var b = 0; b < nodes.length; b++) {
                if (a === b) continue;
                var dx = nodes[a].x - nodes[b].x;
                var dy = nodes[a].y - nodes[b].y;
                var dz = nodes[a].z - nodes[b].z;
                dists.push([dx * dx + dy * dy + dz * dz, b]);
            }
            dists.sort(function (p, q) { return p[0] - q[0]; });
            for (var k = 0; k < 2 && k < dists.length; k++) {
                var nb = dists[k][1];
                if (degree[a] >= 4 || degree[nb] >= 4) continue;
                var key = Math.min(a, nb) + "-" + Math.max(a, nb);
                if (seen[key]) continue;
                seen[key] = true;
                degree[a]++; degree[nb]++;
                edges.push([a, nb, a % 3]);
            }
        }
        pulses = [];
    }

    function resize() {
        var ratio = Math.min(window.devicePixelRatio || 1, 1.75);
        W = window.innerWidth;
        H = window.innerHeight;
        CX = W / 2;
        CY = H / 2;
        canvas.width = Math.round(W * ratio);
        canvas.height = Math.round(H * ratio);
        canvas.style.width = W + "px";
        canvas.style.height = H + "px";
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        buildNetwork();
    }

    // ---- projection ----
    var proj = [];
    function projectAll() {
        var ry = rotY + tiltY;
        var rx = rotX + tiltX;
        var cy = Math.cos(ry), sy = Math.sin(ry);
        var cx = Math.cos(rx), sx = Math.sin(rx);
        proj.length = nodes.length;
        for (var i = 0; i < nodes.length; i++) {
            var p = nodes[i];
            var x1 = p.x * cy + p.z * sy;
            var z1 = -p.x * sy + p.z * cy;
            var y1 = p.y * cx - z1 * sx;
            var z2 = p.y * sx + z1 * cx;
            var s = FOV / (FOV + z2 + R * 1.05);
            proj[i] = {
                x: CX + x1 * s,
                y: CY + y1 * s,
                s: s,
                fog: Math.max(0.1, Math.min(1, (s - 0.3) * 2.0))
            };
        }
    }

    // ---- pulses (signals travelling along edges) ----
    function spawnPulse(burst) {
        if (!edges.length) return;
        var e = edges[(Math.random() * edges.length) | 0];
        pulses.push({
            a: e[0], b: e[1],
            t: 0,
            v: (burst ? 0.030 : 0.012) + Math.random() * 0.012,
            burst: !!burst
        });
    }

    // ---- main loop ----
    function frame(time) {
        ctx.clearRect(0, 0, W, H);

        var speed = baseSpeed;
        if (hyper > 0) {
            speed = baseSpeed * (3 + (hyper / 240) * 9);
            if (hyper > 200 && pulses.length < 70) { spawnPulse(true); spawnPulse(true); }
            hyper--;
        }
        rotY += speed;
        rotX += Math.sin(time * 0.00008) * 0.00012;
        tiltX += (targetTiltX - tiltX) * 0.04;
        tiltY += (targetTiltY - tiltY) * 0.04;

        projectAll();

        // edges
        for (var i = 0; i < edges.length; i++) {
            var e = edges[i];
            var pa = proj[e[0]], pb = proj[e[1]];
            var fog = (pa.fog + pb.fog) / 2;
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.strokeStyle = "rgba(" + palette.edge[e[2]] + "," + (fog * palette.edgeAlpha).toFixed(3) + ")";
            ctx.lineWidth = 0.6 + fog * 0.9;
            ctx.stroke();
        }

        // pulses
        for (var p = pulses.length - 1; p >= 0; p--) {
            var pu = pulses[p];
            pu.t += pu.v * (hyper > 0 ? 2.2 : 1);
            if (pu.t >= 1) { pulses.splice(p, 1); continue; }
            var A = proj[pu.a], B = proj[pu.b];
            var x = A.x + (B.x - A.x) * pu.t;
            var y = A.y + (B.y - A.y) * pu.t;
            var fog2 = (A.fog + B.fog) / 2;
            var rad = (pu.burst ? 3.2 : 2.4) * fog2 + 0.6;
            ctx.beginPath();
            ctx.fillStyle = "rgba(" + palette.pulse + "," + (0.22 * fog2).toFixed(3) + ")";
            ctx.arc(x, y, rad * 3.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.fillStyle = "rgba(" + palette.pulse + "," + (0.95 * fog2).toFixed(3) + ")";
            ctx.arc(x, y, rad, 0, Math.PI * 2);
            ctx.fill();
        }

        // nodes
        for (var n = 0; n < nodes.length; n++) {
            var nd = nodes[n];
            var pr = proj[n];
            var breathe = 1 + Math.sin(time * 0.0011 + nd.phase) * 0.18;
            var radius = nd.r * Math.max(pr.s, 0.35) * 2.1 * breathe;
            var col = palette.node[nd.c];

            ctx.beginPath();
            ctx.fillStyle = "rgba(" + col + "," + (palette.glowAlpha * pr.fog).toFixed(3) + ")";
            ctx.arc(pr.x, pr.y, radius * 3.6, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = "rgba(" + col + "," + (palette.nodeAlpha * pr.fog).toFixed(3) + ")";
            ctx.arc(pr.x, pr.y, radius, 0, Math.PI * 2);
            ctx.fill();

            if (pr.fog > 0.55) {
                ctx.beginPath();
                ctx.fillStyle = "rgba(" + palette.spark + "," + (0.7 * pr.fog).toFixed(3) + ")";
                ctx.arc(pr.x, pr.y, Math.max(0.5, radius * 0.38), 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // ambient pulse spawner
        if (time - lastSpawn > 650 && pulses.length < 10) {
            spawnPulse(false);
            lastSpawn = time;
        }

        rafId = requestAnimationFrame(frame);
    }

    function staticFrame() {
        projectAll();
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < edges.length; i++) {
            var e = edges[i];
            var pa = proj[e[0]], pb = proj[e[1]];
            var fog = (pa.fog + pb.fog) / 2;
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.strokeStyle = "rgba(" + palette.edge[e[2]] + "," + (fog * palette.edgeAlpha).toFixed(3) + ")";
            ctx.lineWidth = 0.6 + fog * 0.9;
            ctx.stroke();
        }
        for (var n = 0; n < nodes.length; n++) {
            var pr = proj[n];
            var col = palette.node[nodes[n].c];
            ctx.beginPath();
            ctx.fillStyle = "rgba(" + col + "," + (palette.nodeAlpha * pr.fog).toFixed(3) + ")";
            ctx.arc(pr.x, pr.y, nodes[n].r * pr.s, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ---- interactivity ----
    window.addEventListener("mousemove", function (e) {
        targetTiltY = ((e.clientX / W) - 0.5) * 0.55;
        targetTiltX = ((e.clientY / H) - 0.5) * 0.35;
    }, { passive: true });

    window.addEventListener("click", function (e) {
        var t = e.target;
        if (t.closest && t.closest("a,button,input,textarea,select,label,form,[role='button'],.site-tabs,.ag-console,#ag-console-fab")) return;
        for (var i = 0; i < 10; i++) spawnPulse(true);
    }, { passive: true });

    window.addEventListener("ag:hyperdrive", function () {
        hyper = 240;
    });

    document.addEventListener("visibilitychange", function () {
        if (reduced) return;
        if (document.hidden) {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = null;
        } else if (!rafId) {
            rafId = requestAnimationFrame(frame);
        }
    });

    var resizeTimer = null;
    window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            resize();
            if (reduced) staticFrame();
        }, 150);
    });

    new MutationObserver(function () {
        refreshPalette();
        if (reduced) staticFrame();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // ---- boot ----
    refreshPalette();
    resize();
    if (reduced) {
        staticFrame();
    } else {
        rafId = requestAnimationFrame(frame);
    }
})();
