// site-tabs.js
document.addEventListener("DOMContentLoaded", () => {
    const audioBtn = document.getElementById("site-audio-btn");
    const themeBtn = document.getElementById("site-theme-btn");

    // Initialize state
    let siteAudioEnabled = localStorage.getItem("site-audio") === "true";
    let isDarkMode = localStorage.getItem("site-dark-mode") === "true";

    function applyTheme() {
        if (isDarkMode) {
            document.documentElement.classList.add("dark-mode");
            document.body.classList.add("hacker-mode"); 
        } else {
            document.documentElement.classList.remove("dark-mode");
            document.body.classList.remove("hacker-mode");
        }
    }

    // Apply right away
    applyTheme();

    if (audioBtn) {
        audioBtn.innerText = siteAudioEnabled ? "🔊" : "🔇";
        audioBtn.addEventListener("click", () => {
            siteAudioEnabled = !siteAudioEnabled;
            localStorage.setItem("site-audio", siteAudioEnabled);
            audioBtn.innerText = siteAudioEnabled ? "🔊" : "🔇";
            window.siteAudioEnabled = siteAudioEnabled;
            playGlobalSound('click');
        });
    }
    
    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            isDarkMode = !isDarkMode;
            localStorage.setItem("site-dark-mode", isDarkMode);
            applyTheme();
            playGlobalSound('click');
        });
    }

    // Export Audio var so individual pages can read it
    window.siteAudioEnabled = siteAudioEnabled;

    let globalAudioCtx = null;
    function playGlobalSound(type) {
        if (!window.siteAudioEnabled) return;
        try {
            if(!globalAudioCtx) globalAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if(globalAudioCtx.state === 'suspended') globalAudioCtx.resume();
            const osc = globalAudioCtx.createOscillator();
            const gain = globalAudioCtx.createGain();
            osc.connect(gain);
            gain.connect(globalAudioCtx.destination);
            
            if (type === 'hover') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(300, globalAudioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(600, globalAudioCtx.currentTime + 0.05);
                gain.gain.setValueAtTime(0.015, globalAudioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, globalAudioCtx.currentTime + 0.05);
                osc.start(); osc.stop(globalAudioCtx.currentTime + 0.05);
            } else if (type === 'click') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, globalAudioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(80, globalAudioCtx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.03, globalAudioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, globalAudioCtx.currentTime + 0.1);
                osc.start(); osc.stop(globalAudioCtx.currentTime + 0.1);
            }
        } catch(e) {}
    }

    // Add global hover effects to tab links
    document.querySelectorAll('.site-tab, .site-tabs-btn').forEach(el => {
        el.addEventListener('mouseenter', () => playGlobalSound('hover'));
    });
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
window.addEventListener('scroll', () => {
    let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    let scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    let activeTab = document.querySelector('.site-tab.is-active');
    if (activeTab) activeTab.style.setProperty('--tab-scroll-progress', scrolled + '%');
    let fullBar = document.getElementById('site-full-progress');
    if (fullBar) fullBar.style.width = scrolled + '%';
});

// Create full-width progress bar on all pages
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('site-full-progress')) {
        let bar = document.createElement('div');
        bar.id = 'site-full-progress';
        document.body.appendChild(bar);
    }
});

