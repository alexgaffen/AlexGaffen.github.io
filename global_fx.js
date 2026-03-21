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



const isSiteAudioEnabled = () => localStorage.getItem("site-audio") === "true";


// CRT TV Hum Audio
const playTvStatic = () => {
    if (!isSiteAudioEnabled()) return;
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
    if (link && isSiteAudioEnabled() && !link.hasAttribute('target') && !link.href.includes('mailto:') && !link.href.includes('#')) {
        playTvStatic();
    }
});
// Play static on initial load transition
if (isSiteAudioEnabled() && document.referrer.indexOf(window.location.host) !== -1) {
    playTvStatic();
}

// Resume Scroll Observer + Progress Line
document.addEventListener("DOMContentLoaded", function() {
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll(".job-item").forEach(function(item) {
        observer.observe(item);
    });

    // Add progress line to each section with a timeline
    var sections = document.querySelectorAll("section");
    sections.forEach(function(sec) {
        var id = sec.getAttribute("id");
        if (id === "skills" || id === "contact") return;
        var items = sec.querySelectorAll(".job-item");
        if (items.length === 0) return;
        var line = document.createElement("div");
        line.className = "tl-progress-line";
        sec.appendChild(line);
    });

    // Update progress lines on scroll
    function updateProgress() {
        var sections = document.querySelectorAll("section");
        sections.forEach(function(sec) {
            var line = sec.querySelector(".tl-progress-line");
            if (!line) return;
            var rect = sec.getBoundingClientRect();
            var sectionTop = rect.top;
            var sectionHeight = rect.height;
            var viewH = window.innerHeight;
            // Progress: 0 when section top is at bottom of viewport, 1 when bottom is at top
            var scrolled = (viewH - sectionTop) / sectionHeight;
            scrolled = Math.max(0, Math.min(1, scrolled));
            // The line runs from top:55px to the bottom of the section
            var maxH = sectionHeight - 65;
            line.style.height = Math.round(scrolled * maxH) + "px";
        });
        requestAnimationFrame(updateProgress);
    }
    requestAnimationFrame(updateProgress);
});



