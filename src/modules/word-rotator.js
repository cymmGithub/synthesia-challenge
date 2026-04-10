/* ── Word Rotator ── */
(() => {
  const INTERVAL = 2500;
  const WORDS = ['text', 'slides', 'PDFs', 'links'];

  const placeholder = document.querySelector('.hero_rotator-word');
  if (!placeholder) return;

  // Measure each word's natural width using a hidden probe element
  const probe = document.createElement('span');
  probe.style.cssText = 'visibility:hidden;position:absolute;white-space:nowrap;';
  // Copy font styles from the placeholder
  const styles = window.getComputedStyle(placeholder);
  probe.style.fontSize = styles.fontSize;
  probe.style.fontFamily = styles.fontFamily;
  probe.style.fontWeight = styles.fontWeight;
  probe.style.letterSpacing = styles.letterSpacing;
  document.body.appendChild(probe);

  const wordWidths = WORDS.map((text) => {
    probe.textContent = text;
    return probe.offsetWidth;
  });

  document.body.removeChild(probe);

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

  // Set fixed dimensions — width locked to widest word
  const wordHeight = wordEls[0].offsetHeight;
  const maxWidth = Math.max(...wordWidths);
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

  let intervalId = null;

  function rotateWord() {
    currentIndex = (currentIndex + 1) % WORDS.length;
    track.style.transform = `translateY(-${currentIndex * wordHeight}px)`;
  }

  function start() {
    if (!intervalId) intervalId = setInterval(rotateWord, INTERVAL);
  }

  function stop() {
    clearInterval(intervalId);
    intervalId = null;
  }

  // Pause when tab is hidden to avoid wasted work
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  start();
})();
