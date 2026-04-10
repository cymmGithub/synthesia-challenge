/* ── Gallery Modal ─────────────────────────────
   Full-screen image preview with keyboard nav,
   focus trap, and accessibility.

   HTML contract (built in Webflow):
   <div class="gallery_modal" id="gallery-modal"
        role="dialog" aria-modal="true"
        aria-label="Image preview">
     <div class="gallery_modal-backdrop"></div>
     <div class="gallery_modal-content">
       <button class="gallery_modal-close"
               aria-label="Close preview">&times;</button>
       <button class="gallery_modal-nav-button is-prev"
               aria-label="Previous image">&#8249;</button>
       <button class="gallery_modal-nav-button is-next"
               aria-label="Next image">&#8250;</button>
       <img class="gallery_modal-image" src="" alt="" />
       <div class="gallery_modal-author"></div>
     </div>
   </div>

   Listens for custom event from gallery.js:
   window 'gallery:open-modal' → { detail: { index, images } }
   ──────────────────────────────────────────── */
(() => {
  const modal = document.getElementById('gallery-modal');
  if (!modal) return;

  const backdrop = modal.querySelector('.gallery_modal-backdrop');
  const content = modal.querySelector('.gallery_modal-content');
  const image = modal.querySelector('.gallery_modal-image');
  const authorEl = modal.querySelector('.gallery_modal-author');
  const closeBtn = modal.querySelector('.gallery_modal-close');
  const prevBtn = modal.querySelector('.gallery_modal-nav-button.is-prev');
  const nextBtn = modal.querySelector('.gallery_modal-nav-button.is-next');

  let images = [];
  let currentIndex = 0;
  let triggerElement = null;
  const FULL_WIDTH = 1200;

  // Replace HTML entities with inline SVGs
  closeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>';
  prevBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4l-6 6 6 6"/></svg>';
  nextBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4l6 6-6 6"/></svg>';

  // ── Focusable elements for trap ───────────
  function getFocusable() {
    return modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  }

  // ── Show image at index ───────────────────
  function showImage(index) {
    const img = images[index];
    if (!img) return;

    currentIndex = index;
    const aspect = img.height / img.width;
    const fullH = Math.round(FULL_WIDTH * aspect);

    image.src = `https://picsum.photos/id/${img.id}/${FULL_WIDTH}/${fullH}`;
    image.alt = `Photo by ${img.author}`;
    authorEl.textContent = img.author;

    // Update nav button visibility
    prevBtn.style.display = index > 0 ? 'flex' : 'none';
    nextBtn.style.display = index < images.length - 1 ? 'flex' : 'none';
  }

  // ── Open ──────────────────────────────────
  function open(index, imageList) {
    images = imageList;
    triggerElement = document.activeElement;

    showImage(index);
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Focus the close button
    requestAnimationFrame(() => closeBtn.focus());
  }

  // ── Close ─────────────────────────────────
  function close() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';

    // Restore focus to the card that opened the modal
    if (triggerElement) {
      triggerElement.focus();
      triggerElement = null;
    }
  }

  // ── Navigate ──────────────────────────────
  function prev() {
    if (currentIndex > 0) showImage(currentIndex - 1);
  }

  function next() {
    if (currentIndex < images.length - 1) showImage(currentIndex + 1);
  }

  // ── Event listeners ───────────────────────

  // Open via custom event from gallery.js
  window.addEventListener('gallery:open-modal', (e) => {
    open(e.detail.index, e.detail.images);
  });

  // Close triggers
  closeBtn.addEventListener('click', (e) => { e.preventDefault(); close(); });
  backdrop.addEventListener('click', close);

  // Navigation buttons
  prevBtn.addEventListener('click', (e) => { e.preventDefault(); prev(); });
  nextBtn.addEventListener('click', (e) => { e.preventDefault(); next(); });

  // Keyboard handling
  modal.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;

    switch (e.key) {
      case 'Escape':
        close();
        break;

      case 'ArrowLeft':
        e.preventDefault();
        prev();
        break;

      case 'ArrowRight':
        e.preventDefault();
        next();
        break;

      case 'Tab': {
        // Focus trap
        const focusable = getFocusable();
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
        break;
      }
    }
  });
})();
