/* ── Placeholder Toast ─────────────────────────
   Intercepts dead href="#" links (that have no real
   JS handler) and shows a fun dismissible toast
   instead of scrolling to top.

   Excludes modal controls which already have their
   own click handlers with preventDefault.
   ──────────────────────────────────────────── */
(() => {
  const MESSAGES = [
    "This button is just for show... for now!",
    "Nothing here yet, but imagine the possibilities!",
    "You found a placeholder! Here, have a cookie \uD83C\uDF6A",
    "This is a demo, remember? But we appreciate the enthusiasm!",
    "Coming soon to a website near you...",
    "Great choice! Unfortunately, it leads nowhere \uD83D\uDE05",
    "If this button worked, you'd be impressed. Trust us.",
    "Plot twist: this button is decorative \uD83C\uDFA8",
  ];

  const EXCLUDE = '.gallery_modal-close, .gallery_modal-nav-button';

  // ── Inject toast styles ──────────────────────
  const style = document.createElement('style');
  style.textContent = `
    .placeholder-toast {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%) translateY(1rem);
      background: var(--color-dark, #0d0f2c);
      color: var(--color-white, #fff);
      padding: 0.875rem 1.5rem;
      border-radius: var(--radius-md, 0.75rem);
      font-size: 0.9375rem;
      font-weight: 500;
      box-shadow: 0 0.5rem 2rem rgba(0, 0, 0, 0.2);
      z-index: 9999;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease, transform 0.3s ease;
      text-align: center;
      max-width: calc(100vw - 2rem);
    }
    .placeholder-toast.is-visible {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
      pointer-events: auto;
    }
    @media (prefers-reduced-motion: reduce) {
      .placeholder-toast {
        transition: none;
      }
    }
  `;
  document.head.appendChild(style);

  // ── Create toast element ─────────────────────
  const toast = document.createElement('div');
  toast.className = 'placeholder-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  document.body.appendChild(toast);

  let dismissTimer = null;
  let lastIndex = -1;

  function pickMessage() {
    let index;
    do {
      index = Math.floor(Math.random() * MESSAGES.length);
    } while (index === lastIndex && MESSAGES.length > 1);
    lastIndex = index;
    return MESSAGES[index];
  }

  function showToast() {
    clearTimeout(dismissTimer);

    // Reset then re-show after a forced repaint
    toast.classList.remove('is-visible');
    void toast.offsetHeight; // force reflow
    toast.textContent = pickMessage();
    toast.classList.add('is-visible');

    dismissTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 3000);
  }

  // ── Attach to dead links ─────────────────────
  // Use capture phase to fire before Webflow's own handlers
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href="#"]');
    if (!link) return;
    if (link.closest(EXCLUDE) || link.matches(EXCLUDE)) return;

    e.preventDefault();
    e.stopPropagation();
    showToast();
  }, true);
})();
