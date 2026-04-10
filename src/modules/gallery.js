/* ── Template Gallery ──────────────────────────
   Infinite scroll gallery using picsum.photos API.
   Features: masonry layout, blur-up loading,
   shimmer skeletons, Intersection Observer.

   Pure logic lives in gallery-utils.js (testable).
   This module handles DOM wiring only.

   HTML contract (built in Webflow):
   <div class="gallery_grid" id="gallery-grid"></div>
   <div class="gallery_loader" id="gallery-loader">
     <span class="gallery_loader-dot"></span>
     <span class="gallery_loader-dot"></span>
     <span class="gallery_loader-dot"></span>
   </div>
   <div class="gallery_sentinel" id="gallery-sentinel"></div>
   ──────────────────────────────────────────── */
import {
  DEFAULTS,
  getColumnCount,
  calculateSpan,
  buildImageUrl,
  buildApiUrl,
  getSkeletonHeights,
} from './gallery-utils.js';

(() => {
  const grid = document.getElementById('gallery-grid');
  const loader = document.getElementById('gallery-loader');
  const sentinel = document.getElementById('gallery-sentinel');
  if (!grid || !sentinel) return;


  let currentPage = 3;
  let isLoading = false;
  let allImages = [];

  // ── Helpers that bridge pure utils → DOM ──
  function getSpan(imageWidth, imageHeight) {
    const columns = getColumnCount(window.innerWidth);
    return calculateSpan(imageWidth, imageHeight, grid.offsetWidth, columns);
  }

  // ── Skeleton placeholders ─────────────────
  function createSkeletons(count) {
    const skeletons = [];
    const heights = getSkeletonHeights(count);

    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'gallery_skeleton';
      skeleton.style.gridRowEnd = `span ${heights[i]}`;

      const inner = document.createElement('div');
      inner.className = 'gallery_skeleton-inner';
      skeleton.appendChild(inner);

      grid.appendChild(skeleton);
      skeletons.push(skeleton);
    }
    return skeletons;
  }

  function removeSkeletons(skeletons) {
    skeletons.forEach((s) => {
      if (s.parentNode) s.parentNode.removeChild(s);
    });
  }

  // ── Card creation with blur-up ────────────
  function createCard(image) {
    const card = document.createElement('div');
    card.className = 'gallery_card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Photo by ${image.author}`);
    card.dataset.imageId = image.id;

    const span = getSpan(image.width, image.height);
    card.style.gridRowEnd = `span ${span}`;

    // Image wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'gallery_card-image-wrapper';

    // Thumbnail (blur-up placeholder)
    const thumbSrc = buildImageUrl(image.id, image.width, image.height, DEFAULTS.THUMB_WIDTH);
    const thumb = document.createElement('img');
    thumb.className = 'gallery_card-image is-thumb';
    thumb.src = thumbSrc;
    thumb.alt = `Photo by ${image.author}`;
    thumb.loading = 'lazy';
    wrapper.appendChild(thumb);

    // Load full image in background
    const fullSrc = buildImageUrl(image.id, image.width, image.height, DEFAULTS.FULL_WIDTH);
    const fullImg = new Image();
    fullImg.src = fullSrc;

    fullImg.onload = () => {
      thumb.src = fullImg.src;
      thumb.classList.remove('is-thumb');
      thumb.classList.add('is-loaded');

      requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    };

    // Hover overlay
    const overlay = document.createElement('div');
    overlay.className = 'gallery_card-overlay';

    const icon = document.createElement('span');
    icon.className = 'gallery_card-icon';
    icon.innerHTML = '&#x2922;';
    overlay.appendChild(icon);

    const author = document.createElement('span');
    author.className = 'gallery_card-author';
    author.textContent = image.author;
    overlay.appendChild(author);

    card.appendChild(wrapper);
    card.appendChild(overlay);

    // Start hidden for staggered reveal
    card.style.opacity = '0';
    card.style.transform = 'translateY(8px)';
    card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

    // Click to open modal
    card.addEventListener('click', () => {
      const index = allImages.findIndex((img) => img.id === image.id);
      window.dispatchEvent(
        new CustomEvent('gallery:open-modal', {
          detail: { index, images: allImages },
        })
      );
    });

    // Keyboard support
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });

    return card;
  }

  // ── Fetch and render ──────────────────────
  async function loadPage(page) {
    if (isLoading) return;
    isLoading = true;

    if (loader) loader.style.display = 'flex';
    const skeletons = createSkeletons(DEFAULTS.PER_PAGE);

    try {
      const res = await fetch(buildApiUrl(page));
      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const images = await res.json();
      if (images.length === 0) {
        observer.disconnect();
        return;
      }

      allImages = [...allImages, ...images];
      removeSkeletons(skeletons);

      images.forEach((image) => {
        const card = createCard(image);
        grid.appendChild(card);
      });

      currentPage++;
    } catch (err) {
      console.error('Gallery fetch error:', err);
      removeSkeletons(skeletons);
    } finally {
      isLoading = false;
      if (loader) loader.style.display = 'none';
    }
  }

  // ── Intersection Observer ─────────────────
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !isLoading) {
        loadPage(currentPage);
      }
    },
    { rootMargin: '200px' }
  );

  observer.observe(sentinel);

  // ── Recalculate masonry on resize ─────────
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const cards = grid.querySelectorAll('.gallery_card');
      cards.forEach((card) => {
        const id = card.dataset.imageId;
        const image = allImages.find((img) => img.id === id);
        if (image) {
          card.style.gridRowEnd = `span ${getSpan(image.width, image.height)}`;
        }
      });
    }, 200);
  });

  // Load first page immediately
  loadPage(currentPage);
})();
