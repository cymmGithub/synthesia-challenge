/* ══════════════════════════════════════════════
   Synthesia Challenge — Entry Point
   All modules are self-initializing IIFEs.
   ══════════════════════════════════════════════ */

// Wait for DOM before initializing
document.addEventListener('DOMContentLoaded', () => {
  // ── Navbar scroll behavior ────────────────
  (() => {
    const navbar = document.querySelector('.nav_component');
    if (!navbar) return;

    const onScroll = () => {
      navbar.classList.toggle('is-scrolled', window.scrollY > 10);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // Check initial state
  })();
});
