/* ── Word Rotator ──────────────────────────────
   Cycles through words in the hero heading with
   a vertical slide-up transition.

   Webflow setup: Just put a placeholder word in the H1
   wrapped in a span with class "hero_rotator-word".

   Example H1 text in Webflow:
   "Turn [span.hero_rotator-word]text[/span] to video in minutes"

   The JS will:
   1. Find the span
   2. Wrap it in the rotator structure
   3. Inject all the cycling words
   4. Animate them
   ──────────────────────────────────────────── */
(() => {
  const INTERVAL = 2500;
  const WORDS = ['text', 'slides', 'PDFs', 'links'];

  const placeholder = document.querySelector('.hero_rotator-word');
  if (!placeholder) return;

  // Build the rotator structure around the placeholder
  const rotator = document.createElement('span');
  rotator.className = 'hero_rotator';
  rotator.setAttribute('aria-live', 'polite');

  const track = document.createElement('span');
  track.className = 'hero_rotator-track';

  // Create a word element for each cycling word
  const wordEls = WORDS.map((text) => {
    const word = document.createElement('span');
    word.className = 'hero_rotator-word';
    word.textContent = text;
    track.appendChild(word);
    return word;
  });

  rotator.appendChild(track);

  // Replace the placeholder span with the full rotator
  placeholder.parentNode.replaceChild(rotator, placeholder);

  // Measure and lock dimensions to prevent layout shift
  const wordHeight = wordEls[0].offsetHeight;

  let maxWidth = 0;
  wordEls.forEach((word) => {
    const w = word.offsetWidth;
    if (w > maxWidth) maxWidth = w;
  });

  rotator.style.height = `${wordHeight}px`;
  rotator.style.width = `${maxWidth}px`;

  wordEls.forEach((word) => {
    word.style.height = `${wordHeight}px`;
  });

  let currentIndex = 0;

  // Respect reduced motion preference
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReducedMotion) return;

  function rotateWord() {
    currentIndex = (currentIndex + 1) % WORDS.length;
    track.style.transform = `translateY(-${currentIndex * wordHeight}px)`;
  }

  setInterval(rotateWord, INTERVAL);
})();
