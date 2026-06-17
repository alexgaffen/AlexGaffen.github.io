// site-console.js — AG-OS interactive terminal, matrix rain & konami hyperdrive
// Drop-down hacker console available on every page. Press ` to toggle.
(function () {
    "use strict";
    if (window.__agConsole) return;
    window.__agConsole = true;

    /* ============================== DOM ============================== */
    var wrap = document.createElement("div");
    wrap.id = "ag-console";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-label", "Interactive terminal");
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML =
        '<div class="ag-console-inner">' +
        '  <div class="ag-console-bar">' +
        '    <span class="ag-dot ag-dot-r"></span><span class="ag-dot ag-dot-a"></span><span class="ag-dot ag-dot-g"></span>' +
        '    <span class="ag-console-title">visitor@alexgaffen.com: ~</span>' +
        '    <button class="ag-console-close" type="button" aria-label="Close terminal">&times;</button>' +
        '  </div>' +
        '  <div class="ag-console-body"></div>' +
        '  <form class="ag-console-inputrow">' +
        '    <span class="ag-prompt" aria-hidden="true">$</span>' +
        '    <input class="ag-console-input" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Terminal command input" placeholder="type \'help\'" />' +
        '  </form>' +
        '</div>';
    document.body.appendChild(wrap);

    var fab = document.createElement("button");
    fab.id = "ag-console-fab";
    fab.type = "button";
    fab.title = "Open terminal  ( ` )";
    fab.setAttribute("aria-label", "Open interactive terminal");
    fab.innerHTML = '<span aria-hidden="true">&gt;_</span>';
    // Prefer placing the launcher inside the site-tabs controls, to the left
    // of the light/dark toggle. Fall back to a floating button otherwise.
    var navControls = document.querySelector(".site-tabs-controls");
    var themeBtn = document.getElementById("site-theme-btn");
    if (navControls) {
        fab.classList.add("in-nav");
        if (themeBtn) navControls.insertBefore(fab, themeBtn);
        else navControls.insertBefore(fab, navControls.firstChild);
    } else {
        document.body.appendChild(fab);
    }

    var body = wrap.querySelector(".ag-console-body");
    var form = wrap.querySelector(".ag-console-inputrow");
    var input = wrap.querySelector(".ag-console-input");
    var closeBtn = wrap.querySelector(".ag-console-close");

    var isOpen = false;
    var booted = false;
    var busy = false;
    var abortRun = false;
    var history = [];
    var histIdx = -1;
    var pendingTimers = [];

    /* ============================ helpers ============================ */
    function esc(s) {
        return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    function scrollDown() { body.scrollTop = body.scrollHeight; }
    function addLine(html, cls) {
        var div = document.createElement("div");
        div.className = "ag-line" + (cls ? " " + cls : "");
        div.innerHTML = html;
        body.appendChild(div);
        scrollDown();
        return div;
    }
    function print(lines, cls) {
        (Array.isArray(lines) ? lines : [lines]).forEach(function (l) { addLine(l, cls); });
    }
    // staged output with cancellation (Ctrl+C)
    function printStaged(lines, delay, done) {
        busy = true;
        abortRun = false;
        var i = 0;
        function next() {
            if (abortRun) { busy = false; addLine("^C", "ag-err"); if (done) done(true); return; }
            if (i >= lines.length) { busy = false; if (done) done(false); return; }
            var item = lines[i++];
            addLine(typeof item === "string" ? item : item[0], typeof item === "string" ? "" : item[1]);
            var t = setTimeout(next, typeof item !== "string" && item[2] != null ? item[2] : delay);
            pendingTimers.push(t);
        }
        next();
    }
    function link(href, label, ext) {
        return '<a href="' + href + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" + esc(label) + "</a>";
    }
    function kv(k, v) {
        return '<span class="ag-key">' + esc(k) + "</span>" + v;
    }

    /* ============================ open/close ============================ */
    function openConsole() {
        if (isOpen) return;
        isOpen = true;
        wrap.classList.add("open");
        document.documentElement.classList.add("ag-console-open");
        wrap.setAttribute("aria-hidden", "false");
        fab.classList.add("hidden");
        if (!booted) { booted = true; boot(); }
        setTimeout(function () { input.focus(); }, 220);
        if (window.plausible) window.plausible("Console Opened");
    }
    function closeConsole() {
        if (!isOpen) return;
        isOpen = false;
        abortRun = true;
        pendingTimers.forEach(clearTimeout);
        pendingTimers = [];
        busy = false;
        wrap.classList.remove("open");
        document.documentElement.classList.remove("ag-console-open");
        wrap.setAttribute("aria-hidden", "true");
        fab.classList.remove("hidden");
        fab.focus();
    }
    window.addEventListener("pagehide", function () {
        document.documentElement.classList.remove("ag-console-open");
    });
    function boot() {
        print([
            '<span class="ag-ascii">    _    ____</span>',
            '<span class="ag-ascii">   / \\  / ___|   <span class="ag-bright">alex gaffen</span> — portfolio shell</span>',
            '<span class="ag-ascii">  / _ \\| |  _    mcmaster cs · ai · robotics · security</span>',
            '<span class="ag-ascii"> / ___ \\ |_| |   AG-OS v4.2 LTS (kernel 6.6.6-arch-btw)</span>',
            '<span class="ag-ascii">/_/   \\_\\____|</span>',
            "&nbsp;",
            'Type <span class="ag-cmd">help</span> to list commands. <span class="ag-dim">Tab = autocomplete · ↑↓ = history · Esc = close</span>',
            "&nbsp;"
        ]);
    }

    /* ============================ matrix rain ============================ */
    var matrix = { canvas: null, raf: null, on: false };
    function matrixStop() {
        if (!matrix.on) return;
        matrix.on = false;
        if (matrix.raf) cancelAnimationFrame(matrix.raf);
        if (matrix.canvas) matrix.canvas.remove();
        matrix.canvas = null;
    }
    function matrixStart() {
        if (matrix.on) return;
        matrix.on = true;
        var c = document.createElement("canvas");
        c.id = "ag-matrix";
        document.body.appendChild(c);
        matrix.canvas = c;
        var mctx = c.getContext("2d");
        var fontSize = 16, cols = 0, drops = [];
        var chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノ01<>/{}#$&*+=?";
        function size() {
            c.width = window.innerWidth;
            c.height = window.innerHeight;
            cols = Math.floor(c.width / fontSize);
            drops = Array(cols).fill(1).map(function () { return (Math.random() * -40) | 0; });
        }
        size();
        window.addEventListener("resize", size);
        function step() {
            if (!matrix.on) return;
            mctx.fillStyle = "rgba(0, 0, 0, 0.07)";
            mctx.fillRect(0, 0, c.width, c.height);
            mctx.font = fontSize + "px monospace";
            for (var i = 0; i < cols; i++) {
                var ch = chars[(Math.random() * chars.length) | 0];
                mctx.fillStyle = Math.random() > 0.975 ? "#d8ffd8" : "#00ff41";
                mctx.fillText(ch, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > c.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
            matrix.raf = requestAnimationFrame(step);
        }
        step();
        c.addEventListener("click", matrixStop);
    }

    /* ============================ toast ============================ */
    function toast(msg) {
        var t = document.getElementById("ag-toast");
        if (!t) {
            t = document.createElement("div");
            t.id = "ag-toast";
            t.setAttribute("role", "status");
            document.body.appendChild(t);
        }
        t.textContent = msg;
        t.classList.add("show");
        clearTimeout(t.__hide);
        t.__hide = setTimeout(function () { t.classList.remove("show"); }, 2600);
    }

    /* ============================ commands ============================ */
    var FAKE_FS = {
        "resume.txt": "run 'experience' or open the full page with 'resume'",
        "skills.txt": "run 'skills'",
        "flag.txt": '<span class="ag-ok">CTF{w3lc0m3_t0_my_p0rtf0l10_h4ck3r}</span> — nice find. 🏴',
        ".bashrc": "alias hire-alex='mailto:alexgaffen@gmail.com'  # recommended",
        "secrets.txt": null // permission denied
    };

    var commands = {
        help: {
            desc: "list all commands",
            run: function () {
                var rows = [
                    ["ABOUT   ", "whoami · neofetch · interests · education"],
                    ["CAREER  ", "experience · projects · skills · certs · awards"],
                    ["LINKS   ", "contact · social · github"],
                    ["GO TO   ", "home · resume · photos · play"],
                    ["SYSTEM  ", "ls · cat <file> · echo · date · theme · history · clear · exit"],
                    ["FUN     ", "hack · matrix · sudo · hint"]
                ];
                print(rows.map(function (r) {
                    return '<span class="ag-key">' + r[0] + "</span>" + esc(r[1]);
                }));
            }
        },
        whoami: {
            desc: "who is alex?",
            run: function () {
                print([
                    '<span class="ag-bright">Alex Gaffen</span> — Software Developer &amp; Researcher',
                    "4th-year Honours Computer Science Co-op @ McMaster University",
                    "Into the problems without clean answers: <span class=\"ag-ok\">medical AI</span>, <span class=\"ag-ok\">robotics</span>, <span class=\"ag-ok\">systems security</span>.",
                    'Currently: biomedical ML research @ McMaster (Wang Lab). Open to AI &amp; cybersecurity roles.'
                ]);
            }
        },
        neofetch: {
            desc: "system info",
            run: function () {
                var left = [
                    "       .---.      ",
                    "      /  A  \\     ",
                    "     /  / \\  \\    ",
                    "    /  /___\\  \\   ",
                    "   /  _____G   \\  ",
                    "  /__/       \\__\\ ",
                    "                  "
                ];
                var right = [
                    kv("visitor", "@alexgaffen.com"),
                    '<span class="ag-dim">─────────────────────</span>',
                    kv("OS:       ", "AG-OS (Arch-based, btw)"),
                    kv("Host:     ", "McMaster University · Year 4"),
                    kv("Kernel:   ", "honours-cs-coop 6.6.6"),
                    kv("Uptime:   ", "~5 years of building software"),
                    kv("Shell:    ", "python · c/c++ · bash · js"),
                    kv("Focus:    ", "AI · Robotics · Cybersecurity · Medtech"),
                    kv("Research: ", "Biomedical ML @ Wang Lab"),
                    kv("GPU:      ", "neural nets go brrr"),
                    kv("Theme:    ", 'purple <span class="ag-swatch"></span> #a855f7')
                ];
                var out = [];
                var n = Math.max(left.length, right.length);
                for (var i = 0; i < n; i++) {
                    out.push('<span class="ag-ascii">' + esc(left[i] || "                  ") + "</span>" + (right[i] || ""));
                }
                print(out);
            }
        },
        experience: {
            desc: "work history",
            run: function () {
                print([
                    kv("[2026–now] ", '<span class="ag-bright">AI &amp; Full-Stack Developer</span> — McMaster Wang Lab'),
                    '<span class="ag-dim">           end-to-end clinical AI for liver fibrosis diagnosis · React + Flask + deep learning</span>',
                    kv("[8 months] ", '<span class="ag-bright">AI &amp; Robotics Research Engineer</span> — Adaptron Inc (co-op)'),
                    kv("[2024]     ", '<span class="ag-bright">Front-End Developer Intern</span> — Bonbon Technologies, LA (remote)'),
                    '<span class="ag-dim">           Svelte components for a loyalty platform · shipped on deadline</span>',
                    kv("[2022]     ", '<span class="ag-bright">CS Tutor</span> — Ontario ICS3U/4U curriculum'),
                    "&nbsp;",
                    "Full detail: " + link("resume.html#workexperience", "resume.html#workexperience")
                ]);
            }
        },
        projects: {
            desc: "things i've built",
            run: function () {
                print([
                    kv("mock-market  ", "full-stack trading sim — React · Node · C++ signals · Docker · Firebase"),
                    kv("ghost-shell  ", "autonomous AI honeypot — Python LLM agent + Go terminal emulator"),
                    kv("battle-game  ", "networked multiplayer game in C — raw sockets, client-server"),
                    kv("matrix-viz   ", "matrix visualizer web app — Elm, team of 6"),
                    "&nbsp;",
                    "Code: " + link("https://github.com/alexgaffen", "github.com/alexgaffen", true) + ' · details: ' + link("resume.html#projects", "resume.html#projects")
                ]);
            }
        },
        skills: {
            desc: "tech stack",
            run: function () {
                print([
                    kv("languages  ", "Python · C/C++ · JavaScript · Bash · Go · Elm"),
                    kv("ai/ml      ", "PyTorch · TensorFlow/Keras · scikit-learn · CNNs · transformers"),
                    kv("web        ", "React · Node.js · Svelte · Flask · Firebase"),
                    kv("systems    ", "Linux · Docker · Git · sockets · OS internals · compilers"),
                    kv("security   ", "network security · firewalls/VPNs · applied cryptography · honeypots")
                ]);
            }
        },
        certs: {
            desc: "certifications",
            run: function () {
                print([
                    "• Deep Learning Specialization — DeepLearning.AI (Andrew Ng, 5 courses)",
                    "• PyTorch for Deep Learning — DeepLearning.AI",
                    "• Machine Learning A-Z — Udemy"
                ]);
            }
        },
        awards: {
            desc: "awards",
            run: function () {
                print([
                    "🏆 McMaster Award of Excellence — entrance scholarship",
                    "🥇 Euclid Mathematics Contest — 1st in school (Waterloo)",
                    "🥇 Canadian Senior Mathematics Contest — 1st in school"
                ]);
            }
        },
        education: {
            desc: "education",
            run: function () {
                print([
                    '<span class="ag-bright">Honours Computer Science Co-op (B.A.Sc.)</span> — McMaster University, 2022–present',
                    '<span class="ag-dim">A+ in compilers &amp; algorithms · applied cryptography · OS · networks &amp; security</span>'
                ]);
            }
        },
        interests: {
            desc: "beyond the keyboard",
            run: function () {
                print([
                    "🎻 violinist — McMaster Symphony Orchestra",
                    "📷 photography — " + link("photography.html", "see the gallery"),
                    "⚽ intramural soccer · pickleball · football",
                    "🏋️ gym, running, and picking up new things to see if I can"
                ]);
            }
        },
        contact: {
            desc: "get in touch",
            run: function () {
                print([
                    kv("email    ", link("mailto:alexgaffen@gmail.com", "alexgaffen@gmail.com")),
                    kv("form     ", link("resume.html#contact", "resume.html#contact")),
                    '<span class="ag-dim">response time: faster than my CI pipeline</span>'
                ]);
            }
        },
        social: {
            desc: "profiles",
            run: function () {
                print([
                    kv("github     ", link("https://github.com/alexgaffen", "github.com/alexgaffen", true)),
                    kv("linkedin   ", link("https://www.linkedin.com/in/alexgaffen/", "linkedin.com/in/alexgaffen", true)),
                    kv("tryhackme  ", link("https://tryhackme.com/p/alexgaffen", "tryhackme.com/p/alexgaffen", true))
                ]);
            }
        },
        github: {
            desc: "live github stats",
            run: function () {
                addLine('<span class="ag-dim">querying api.github.com…</span>');
                fetch("https://api.github.com/users/alexgaffen")
                    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
                    .then(function (d) {
                        print([
                            kv("user        ", esc(d.login) + (d.name ? " (" + esc(d.name) + ")" : "")),
                            kv("public repos", String(d.public_repos)),
                            kv("followers   ", String(d.followers)),
                            kv("member since", new Date(d.created_at).getFullYear().toString()),
                            kv("profile     ", link(d.html_url, d.html_url, true))
                        ]);
                    })
                    .catch(function () {
                        print('<span class="ag-err">api unreachable</span> — visit ' + link("https://github.com/alexgaffen", "github.com/alexgaffen", true));
                    });
            }
        },
        home: { desc: "go home", run: function () { addLine("cd ~ …"); location.href = "index.html"; } },
        resume: { desc: "open resume", run: function () { addLine("opening resume…"); location.href = "resume.html"; } },
        photos: { desc: "open gallery", run: function () { addLine("opening gallery…"); location.href = "photography.html"; } },
        play: { desc: "secret game", run: function () { addLine("loading game…"); location.href = "game.html"; } },
        theme: {
            desc: "toggle light/dark",
            run: function () {
                if (window.toggleSiteTheme) { window.toggleSiteTheme(); addLine("theme toggled."); }
                else addLine('<span class="ag-err">theme controller not found</span>');
            }
        },
        matrix: {
            desc: "there is no spoon",
            run: function () {
                if (matrix.on) { matrixStop(); addLine("matrix disengaged."); }
                else { matrixStart(); addLine('wake up, neo… <span class="ag-dim">(click anywhere or run \'matrix\' again to exit)</span>'); }
            }
        },
        hack: {
            desc: "???",
            run: function () {
                printStaged([
                    ["initializing exploit framework v6.6.6 …", "ag-dim", 420],
                    ["[*] scanning alexgaffen.com (443/tcp) …", "", 600],
                    ["[*] enumerating attack surface … 0 open ports. suspicious.", "", 650],
                    ["[*] attempting SQLi on a static site …", "", 700],
                    ["[!] that's not how any of this works", "ag-err", 550],
                    ["[*] deploying zero-day …", "", 800],
                    ['<span class="ag-err">█ ACCESS DENIED █</span>', "", 500],
                    ['<span class="ag-ok">ghost-shell</span> already logged this session: your IP, keystrokes, and your favourite snack. 👻', "", 80],
                    ['<span class="ag-dim">(it\'s one of my projects — run \'projects\')</span>', "", 0]
                ], 0);
            }
        },
        sudo: {
            desc: "permission games",
            run: function (args) {
                var rest = args.join(" ");
                if (/make me a sandwich/i.test(rest)) { print("Okay. 🥪"); return; }
                if (/rm\s+-rf/i.test(rest)) { print(['<span class="ag-err">nice try.</span> this incident will be reported to Santa.']); return; }
                print('visitor is not in the sudoers file. <span class="ag-dim">this incident will be reported.</span>');
            }
        },
        ls: {
            desc: "list files",
            run: function () {
                print('<span class="ag-ok">resume.txt</span>  <span class="ag-ok">skills.txt</span>  <span class="ag-ok">flag.txt</span>  <span class="ag-ok">.bashrc</span>  <span class="ag-err">secrets.txt</span>  <span class="ag-dir">photos/</span>  <span class="ag-dir">projects/</span>');
            }
        },
        cat: {
            desc: "read a file",
            run: function (args) {
                var f = (args[0] || "").trim();
                if (!f) { print("usage: cat <file>"); return; }
                if (f === "secrets.txt") { print('<span class="ag-err">cat: secrets.txt: Permission denied</span> <span class="ag-dim">(try \'hack\'… or don\'t)</span>'); return; }
                if (f in FAKE_FS) { print(FAKE_FS[f]); return; }
                print('<span class="ag-err">cat: ' + esc(f) + ": No such file or directory</span>");
            }
        },
        echo: { desc: "echo", run: function (args) { print(esc(args.join(" ")) || "&nbsp;"); } },
        date: { desc: "date", run: function () { print(esc(new Date().toString())); } },
        history: {
            desc: "command history",
            run: function () { print(history.map(function (h, i) { return '<span class="ag-dim">' + (i + 1) + "</span>  " + esc(h); })); }
        },
        hint: {
            desc: "psst",
            run: function () {
                print([
                    "• there's a flag hiding in the filesystem",
                    "• ↑ ↑ ↓ ↓ ← → ← → B A — works anywhere on the site",
                    "• clicking empty space on the home page fires neurons"
                ]);
            }
        },
        clear: { desc: "clear screen", run: function () { body.innerHTML = ""; } },
        exit: { desc: "close terminal", run: function () { closeConsole(); } }
    };
    // aliases
    commands.exp = commands.work = commands.experience;
    commands.proj = commands.projects;
    commands.edu = commands.education;
    commands.certifications = commands.certs;
    commands.about = commands.whoami;
    commands.game = commands.play;
    commands.photography = commands.photos;
    commands.cls = commands.clear;
    commands.quit = commands.exit;

    function runCommand(raw) {
        var text = raw.trim();
        addLine('<span class="ag-prompt-echo">$</span> ' + esc(text), "ag-echo");
        if (!text) return;
        history.push(text);
        histIdx = history.length;
        var parts = text.split(/\s+/);
        var name = parts[0].toLowerCase();
        var cmd = commands[name];
        if (cmd) {
            cmd.run(parts.slice(1));
        } else {
            addLine('<span class="ag-err">command not found:</span> ' + esc(name) + ' <span class="ag-dim">— try \'help\'</span>');
        }
    }

    /* ============================ input wiring ============================ */
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (busy) return;
        var v = input.value;
        input.value = "";
        runCommand(v);
    });

    input.addEventListener("keydown", function (e) {
        e.stopPropagation();
        if (e.key === "c" && e.ctrlKey) { abortRun = true; return; }
        if (busy) {
            // allow typing while output animates; only swallow control keys
            if (e.key === "Enter" || e.key === "Tab" || e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
            return;
        }
        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (histIdx > 0) { histIdx--; input.value = history[histIdx] || ""; }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (histIdx < history.length) { histIdx++; input.value = history[histIdx] || ""; }
        } else if (e.key === "Tab") {
            e.preventDefault();
            var cur = input.value.trim().toLowerCase();
            if (!cur) return;
            var matches = Object.keys(commands).filter(function (k) { return k.indexOf(cur) === 0; });
            if (matches.length === 1) input.value = matches[0] + " ";
            else if (matches.length > 1) addLine('<span class="ag-dim">' + matches.sort().join("  ") + "</span>");
        }
    });

    closeBtn.addEventListener("click", closeConsole);
    fab.addEventListener("click", openConsole);
    wrap.addEventListener("click", function (e) {
        if (e.target === wrap) closeConsole();
        else if (!busy && e.target.closest(".ag-console-body")) {
            var sel = window.getSelection();
            if (!sel || sel.isCollapsed) input.focus();
        }
    });

    document.addEventListener("keydown", function (e) {
        if (!isOpen || e.target === input) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        if (e.key === "Escape" || e.key === "`" || e.key === "~") closeConsole();
        else input.focus();
    }, true);

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            if (matrix.on) { matrixStop(); return; }
            if (isOpen) { closeConsole(); return; }
        }
        if ((e.key === "`" || e.key === "~") && !e.ctrlKey && !e.metaKey && !e.altKey) {
            var t = e.target;
            var editable = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
            if (editable && t !== input) return;
            e.preventDefault();
            if (isOpen) closeConsole(); else openConsole();
        }
    });

    /* ============================ konami code ============================ */
    var KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    var kIdx = 0;
    document.addEventListener("keydown", function (e) {
        var key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        if (key === KONAMI[kIdx]) {
            kIdx++;
            if (kIdx === KONAMI.length) {
                kIdx = 0;
                toast("⚡ HYPERDRIVE ENGAGED");
                window.dispatchEvent(new CustomEvent("ag:hyperdrive"));
                document.body.classList.add("ag-spin");
                setTimeout(function () { document.body.classList.remove("ag-spin"); }, 1300);
            }
        } else {
            kIdx = key === KONAMI[0] ? 1 : 0;
        }
    });
})();
