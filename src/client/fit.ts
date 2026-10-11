/**
 * Size the landing card on desktop: shrink it (photo, text and all, as one
 * unit) so it fits the viewport without scrolling, and never let it grow past
 * a fixed ceiling however big the monitor is.
 *
 * This is inlined straight after the card's markup, before anything that could
 * let the browser paint in between (an external script, a pause waiting on the
 * network). Run later, the card could paint at full size and then snap down to
 * its fitted size.
 */
const wrapper = document.getElementById('main-wrapper');
const box = document.querySelector<HTMLElement>('.glistening-box');

if (wrapper && box) {
  // Tallest the text box may render. A CSS pixel's physical size depends on the
  // screen: on a standard-density desktop monitor (27" 1080p, or 1440p at 125%)
  // it is ~0.3mm, on a high-density laptop panel ~0.2mm. devicePixelRatio tracks
  // that, so the ceiling does too: 400px at ratio <= 1.25 (about 4.6-4.9" on
  // those monitors), 560px at ratio >= 2 (about 4.4" on a 14" MacBook Pro),
  // interpolated in between. The photo scales by the same factor, so the
  // composition keeps its shape.
  const maxBoxHeight = (): number => {
    const t = Math.min(1, Math.max(0, ((window.devicePixelRatio || 1) - 1.25) / 0.75));
    return 400 + t * 160;
  };

  const fit = (): void => {
    wrapper.style.zoom = '';
    if (window.innerWidth < 800) return;
    // 84 = the tab bar plus the gap above the card; 56 = the gap below it.
    const avail = window.innerHeight - 84 - 56;
    const cap = maxBoxHeight();
    // zoom leaves the %-based widths alone, so the text re-wraps wider as it
    // shrinks and one division undershoots; measure the rendered result and
    // correct until it lands.
    let z = 1;
    for (let k = 0; k < 5; k++) {
      let s = cap / box.getBoundingClientRect().height;
      if (avail > 200) s = Math.min(s, avail / wrapper.getBoundingClientRect().height);
      const nz = Math.min(1, Math.max(0.45, z * s));
      if (Math.abs(nz - z) < 0.005) break;
      z = nz;
      wrapper.style.zoom = z === 1 ? '' : String(z);
    }
  };

  const show = (): void => {
    fit();
    wrapper.classList.add('is-fit');
  };

  // The card is hidden (CSS) until it has been fitted in the fonts it is set in.
  // Forcing layout here pulls a cached font in straight away, so on any return
  // visit it is shown in the very first frame. Only on a cold cache does it wait
  // for the preloaded files -- at most 1.5s -- because a font landing after the
  // fit would re-wrap the text and resize the card in front of you.
  const faces = ['400 1em Inter', '700 1em Inter', '400 1em "Space Mono"'];
  fit();
  void wrapper.offsetHeight;
  if (faces.every((f) => document.fonts.check(f))) {
    show();
  } else {
    void Promise.race([
      Promise.all(faces.map((f) => document.fonts.load(f))),
      new Promise((r) => setTimeout(r, 1500)),
    ]).then(show, show);
  }
  void document.fonts.ready.then(fit);
  window.addEventListener('resize', fit);
  window.addEventListener('load', fit);
  // Dragging the window to a screen of a different density doesn't always fire
  // resize, so watch the ratio itself.
  const watchDensity = (): void => {
    window
      .matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
      .addEventListener('change', () => {
        fit();
        watchDensity();
      }, { once: true });
  };
  watchDensity();
}

export {};
