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



