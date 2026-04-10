/* ── Gallery Modal ── */
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
  let cachedFocusable = null;
  let sessionController = null;
  const FULL_WIDTH = 1200;

  closeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>';
  prevBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4l-6 6 6 6"/></svg>';
  nextBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4l6 6-6 6"/></svg>';

  function getFocusable() {
    if (!cachedFocusable) {
      cachedFocusable = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    }
    return cachedFocusable;
  }

  function showImage(index) {
    const img = images[index];
    if (!img) return;

    currentIndex = index;
    const aspect = img.height / img.width;
    const fullH = Math.round(FULL_WIDTH * aspect);

    image.style.opacity = '0';
    content.classList.add('is-loading');

    const newImg = new Image();
    newImg.src = `https://picsum.photos/id/${img.id}/${FULL_WIDTH}/${fullH}`;
    newImg.onload = () => {
      image.src = newImg.src;
      image.style.opacity = '1';
      content.classList.remove('is-loading');
    };

    image.alt = `Photo by ${img.author}`;
    authorEl.textContent = img.author;

    prevBtn.style.display = index > 0 ? 'flex' : 'none';
    nextBtn.style.display = index < images.length - 1 ? 'flex' : 'none';
  }

  function open(index, imageList) {
    images = imageList;
    triggerElement = document.activeElement;
    cachedFocusable = null;

    if (sessionController) sessionController.abort();
    sessionController = new AbortController();
    const { signal } = sessionController;

    // Per-session listeners (cleaned up on close)
    closeBtn.addEventListener('click', (e) => { e.preventDefault(); close(); }, { signal });
    backdrop.addEventListener('click', close, { signal });
    prevBtn.addEventListener('click', (e) => { e.preventDefault(); prev(); }, { signal });
    nextBtn.addEventListener('click', (e) => { e.preventDefault(); next(); }, { signal });
    modal.addEventListener('keydown', handleKeydown, { signal });

    showImage(index);
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => closeBtn.focus());
  }

  function close() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    cachedFocusable = null;

    if (sessionController) {
      sessionController.abort();
      sessionController = null;
    }

    // Restore focus to the card that opened the modal
    if (triggerElement) {
      triggerElement.focus();
      triggerElement = null;
    }
  }

  function prev() {
    if (currentIndex > 0) showImage(currentIndex - 1);
  }

  function next() {
    if (currentIndex < images.length - 1) showImage(currentIndex + 1);
  }

  function handleKeydown(e) {
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
  }

  window.addEventListener('gallery:open-modal', (e) => {
    open(e.detail.index, e.detail.images);
  });
})();
