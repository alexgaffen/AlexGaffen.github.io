// ASCII Art Console Log
console.log(`%c
   ▄████████  ▄█       ▄████████ ▀████    ▐████▀ 
  ███    ███ ███      ███    ███   ███▌   ████▀  
  ███    ███ ███▌     ███    █▀     ███  ▐███    
  ███    ███ ███▌    ▄███▄▄▄        ▀███▄███▀    
▀███████████ ███▌   ▀▀███▀▀▀        ████▀██▄     
  ███    ███ ███      ███    █▄    ▐███  ▀███    
  ███    ███ ███      ███    ███  ▄███     ███▄  
  ███    █▀  █▀       ██████████ ████       ███▄ 
                                                 
 INIT SEQUENCE SECURE... //10x Developer Mode Engaged
`, "color: #0f0; font-family: monospace; font-size: 14px; text-shadow: 0 0 5px #0f0;");

// Neon Cursor Follower
document.addEventListener("DOMContentLoaded", () => {
    const cursor = document.createElement("div");
    cursor.style.position = "fixed";
    cursor.style.width = "8px";
    cursor.style.height = "8px";
    cursor.style.borderRadius = "50%";
    cursor.style.backgroundColor = "#0f0";
    cursor.style.boxShadow = "0 0 10px #0f0, 0 0 20px #0f0";
    cursor.style.pointerEvents = "none";
    cursor.style.transform = "translate(-50%, -50%)";
    cursor.style.zIndex = "10000";
    cursor.style.transition = "width 0.2s, height 0.2s, background-color 0.2s";
    document.body.appendChild(cursor);

    document.addEventListener("mousemove", (e) => {
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
    });

    document.querySelectorAll("a, button").forEach(el => {
        el.addEventListener("mouseenter", () => {
            cursor.style.width = "20px";
            cursor.style.height = "20px";
            cursor.style.backgroundColor = "transparent";
            cursor.style.border = "2px solid #0f0";
        });
        el.addEventListener("mouseleave", () => {
            cursor.style.width = "8px";
            cursor.style.height = "8px";
            cursor.style.backgroundColor = "#0f0";
            cursor.style.border = "none";
        });
    });

    // Custom CSS to hide default cursor
    const style = document.createElement('style');
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);
});

// CRT TV Hum Audio
const playTvStatic = () => {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if(audioCtx.state === 'suspended') audioCtx.resume();
        const bufferSize = audioCtx.sampleRate * 0.5; // 0.5 seconds
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1; // White noise
        }
        const whiteNoise = audioCtx.createBufferSource();
        whiteNoise.buffer = buffer;
        
        // Lowpass filter for TV hum/thump
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;
        
        // Volume envelope
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        
        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        whiteNoise.start();
    } catch(e) {}
};

// Listen for link clicks to trigger static
document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link && !link.hasAttribute('target') && !link.href.includes('mailto:') && !link.href.includes('#')) {
        playTvStatic();
    }
});
// Play static on initial load transition
if (document.referrer.indexOf(window.location.host) !== -1) {
    playTvStatic();
}


// GitHub Activity Feed
document.addEventListener("DOMContentLoaded", () => {
    const feed = document.getElementById("github-feed");
    if (!feed) return;
    
    fetch("https://api.github.com/users/alexgaffen/events/public")
        .then(res => res.json())
        .then(data => {
            const pushes = data.filter(e => e.type === "PushEvent").slice(0, 3);
            feed.innerHTML = "";
            if (pushes.length === 0) {
                feed.innerHTML = "<span>> No recent activity offline.</span>";
                return;
            }
            pushes.forEach(p => {
                const repo = p.repo.name.split("/")[1];
                const msg = p.payload.commits[0] ? p.payload.commits[0].message.split("\n")[0] : "Update refs";
                const hash = p.payload.commits[0] ? p.payload.commits[0].sha.substring(0,6) : "000000";
                feed.innerHTML += `<div class="gh-commit" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">> [${repo}] ${hash}: ${msg}</div>`;
            });
        })
        .catch(err => {
            feed.innerHTML = "<span style='color:red;'>> Connection refused.</span>";
        });
});

// Glitch Skill Bars in Resume
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".skill-box").forEach(box => {
        // Prevent re-applying
        if (box.dataset.glitchBound) return;
        box.dataset.glitchBound = "true";
        
        box.style.position = "relative";
        box.style.overflow = "hidden";
        
        const meter = document.createElement("div");
        meter.style.position = "absolute";
        meter.style.bottom = "0";
        meter.style.left = "0";
        meter.style.height = "4px";
        meter.style.width = "0%";
        meter.style.backgroundColor = "rgba(0, 255, 0, 0.7)";
        meter.style.transition = "width 0.1s linear";
        box.appendChild(meter);

        let glitchInterval;
        box.addEventListener("mouseenter", () => {
            box.style.animation = "glitch-skew 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite";
            
            // Randomize width fast to simulate active stat compiling
            glitchInterval = setInterval(() => {
                const randWidth = Math.floor(Math.random() * 100);
                meter.style.width = randWidth + "%";
                meter.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            }, 50);
            
            // After 0.5s, settle on a high percentage and stop glitching the box
            setTimeout(() => {
                clearInterval(glitchInterval);
                box.style.animation = "none";
                meter.style.width = (75 + Math.random() * 20) + "%"; // Settle between 75-95%
                meter.style.backgroundColor = "#0f0";
            }, 400);
        });

        box.addEventListener("mouseleave", () => {
            clearInterval(glitchInterval);
            box.style.animation = "none";
            meter.style.width = "0%";
        });
    });
});
