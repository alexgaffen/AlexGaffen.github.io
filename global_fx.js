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


// ============================================================
// BLUR-UP IMAGE REVEAL — photos land soft and sharpen in place.
// Applies to every <img> on every page, including ones injected
// later (gallery cards, filmstrip thumbs) and lightbox src swaps.
// Opt a single image out with data-no-reveal.
// ============================================================
(function () {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var style = document.createElement("style");
    style.textContent =
        "img.img-reveal { filter: blur(18px); opacity: 0.35; }" +
        "img.img-reveal.is-revealed { filter: blur(0); opacity: 1; transition:" +
        " filter 0.85s cubic-bezier(0.22, 1, 0.36, 1)," +
        " opacity 0.6s ease," +
        " transform 0.8s cubic-bezier(0.22, 1, 0.36, 1); }";
    (document.head || document.documentElement).appendChild(style);

    function arm(img) {
        if (img.hasAttribute("data-no-reveal")) return;
        img.classList.remove("is-revealed");
        img.classList.add("img-reveal");

        var settled = false;
        function reveal() {
            if (settled) return;
            settled = true;
            // Two frames so the blurred state paints before the transition starts.
            requestAnimationFrame(function () {
                requestAnimationFrame(function () { img.classList.add("is-revealed"); });
            });
        }

        if (img.complete && img.naturalWidth > 0) { reveal(); return; }
        img.addEventListener("load", reveal, { once: true });
        img.addEventListener("error", reveal, { once: true });
        // Safety net: never leave an image stuck in the soft state.
        setTimeout(reveal, 8000);
    }

    function armAll(root) {
        if (root.nodeType !== 1) return;
        if (root.tagName === "IMG") arm(root);
        var imgs = root.querySelectorAll ? root.querySelectorAll("img") : [];
        for (var i = 0; i < imgs.length; i++) arm(imgs[i]);
    }

    armAll(document.documentElement);

    new MutationObserver(function (records) {
        records.forEach(function (rec) {
            if (rec.type === "attributes") {
                if (rec.target.tagName === "IMG") arm(rec.target);
                return;
            }
            for (var i = 0; i < rec.addedNodes.length; i++) armAll(rec.addedNodes[i]);
        });
    }).observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["src", "srcset"]
    });
})();


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



