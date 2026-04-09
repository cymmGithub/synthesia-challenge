// src/index.js
document.addEventListener("DOMContentLoaded", () => {
  (() => {
    const navbar = document.querySelector(".nav_component");
    if (!navbar)
      return;
    const onScroll = () => {
      navbar.classList.toggle("is-scrolled", window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();
});

// src/word-rotator.js
(() => {
  const INTERVAL = 2500;
  const WORDS = ["text", "slides", "PDFs", "links"];
  const placeholder = document.querySelector(".hero_rotator-word");
  if (!placeholder)
    return;
  const rotator = document.createElement("span");
  rotator.className = "hero_rotator";
  rotator.setAttribute("aria-live", "polite");
  const track = document.createElement("span");
  track.className = "hero_rotator-track";
  const wordEls = WORDS.map((text) => {
    const word = document.createElement("span");
    word.className = "hero_rotator-word";
    word.textContent = text;
    track.appendChild(word);
    return word;
  });
  rotator.appendChild(track);
  placeholder.parentNode.replaceChild(rotator, placeholder);
  const wordHeight = wordEls[0].offsetHeight;
  let maxWidth = 0;
  wordEls.forEach((word) => {
    const w = word.offsetWidth;
    if (w > maxWidth)
      maxWidth = w;
  });
  rotator.style.height = `${wordHeight}px`;
  rotator.style.width = `${maxWidth}px`;
  wordEls.forEach((word) => {
    word.style.height = `${wordHeight}px`;
  });
  let currentIndex = 0;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion)
    return;
  function rotateWord() {
    currentIndex = (currentIndex + 1) % WORDS.length;
    track.style.transform = `translateY(-${currentIndex * wordHeight}px)`;
  }
  setInterval(rotateWord, INTERVAL);
})();

// src/logo-popover.js
(() => {
  const popover = document.querySelector(".logos_popover");
  if (!popover)
    return;
  const quoteEl = popover.querySelector(".logos_popover-quote");
  const authorEl = popover.querySelector(".logos_popover-author");
  const items = document.querySelectorAll(".logos_item");
  if (items.length === 0)
    return;
  let hideTimeout = null;
  function show(item) {
    clearTimeout(hideTimeout);
    const quote = item.dataset.quote;
    const person = item.dataset.person;
    const title = item.dataset.title;
    if (!quote)
      return;
    quoteEl.textContent = quote;
    authorEl.textContent = title ? `${person}, ${title}` : person;
    const rect = item.getBoundingClientRect();
    const popoverWidth = 300;
    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    const top = rect.top - 12;
    const margin = 16;
    if (left < margin)
      left = margin;
    if (left + popoverWidth > window.innerWidth - margin) {
      left = window.innerWidth - margin - popoverWidth;
    }
    popover.style.left = `${left}px`;
    popover.style.bottom = `${window.innerHeight - top}px`;
    popover.style.width = `${popoverWidth}px`;
    popover.classList.add("is-visible");
  }
  function hide() {
    hideTimeout = setTimeout(() => {
      popover.classList.remove("is-visible");
    }, 100);
  }
  items.forEach((item) => {
    item.addEventListener("mouseenter", () => show(item));
    item.addEventListener("mouseleave", hide);
    item.addEventListener("focusin", () => show(item));
    item.addEventListener("focusout", hide);
  });
})();

// src/gallery-utils.js
var DEFAULTS = {
  API_BASE: "https://picsum.photos/v2/list",
  PER_PAGE: 12,
  THUMB_WIDTH: 20,
  FULL_WIDTH: 600,
  GAP: 16
};
function getColumnCount(viewportWidth) {
  if (viewportWidth > 991)
    return 4;
  if (viewportWidth > 767)
    return 3;
  return 2;
}
function calculateSpan(imageWidth, imageHeight, gridWidth, columns, gap = DEFAULTS.GAP) {
  const columnWidth = (gridWidth - gap * (columns - 1)) / columns;
  const aspectRatio = imageHeight / imageWidth;
  const itemHeight = columnWidth * aspectRatio;
  return Math.ceil(itemHeight) + gap;
}
function buildImageUrl(id, originalWidth, originalHeight, targetWidth) {
  const aspect = originalHeight / originalWidth;
  const targetHeight = Math.round(targetWidth * aspect);
  return `https://picsum.photos/id/${id}/${targetWidth}/${targetHeight}`;
}
function buildApiUrl(page, limit = DEFAULTS.PER_PAGE, base = DEFAULTS.API_BASE) {
  return `${base}?page=${page}&limit=${limit}`;
}
function getSkeletonHeights(count) {
  const pool = [200, 280, 240, 320, 180, 260, 300, 220, 350, 190, 270, 230];
  return Array.from({ length: count }, (_, i) => pool[i % pool.length]);
}

// src/gallery.js
(() => {
  const grid = document.getElementById("gallery-grid");
  const loader = document.getElementById("gallery-loader");
  const sentinel = document.getElementById("gallery-sentinel");
  if (!grid || !sentinel)
    return;
  let currentPage = 1;
  let isLoading = false;
  let allImages = [];
  function getSpan(imageWidth, imageHeight) {
    const columns = getColumnCount(window.innerWidth);
    return calculateSpan(imageWidth, imageHeight, grid.offsetWidth, columns);
  }
  function createSkeletons(count) {
    const skeletons = [];
    const heights = getSkeletonHeights(count);
    for (let i = 0;i < count; i++) {
      const skeleton = document.createElement("div");
      skeleton.className = "gallery_skeleton";
      skeleton.style.gridRowEnd = `span ${heights[i]}`;
      const inner = document.createElement("div");
      inner.className = "gallery_skeleton-inner";
      skeleton.appendChild(inner);
      grid.appendChild(skeleton);
      skeletons.push(skeleton);
    }
    return skeletons;
  }
  function removeSkeletons(skeletons) {
    skeletons.forEach((s) => {
      if (s.parentNode)
        s.parentNode.removeChild(s);
    });
  }
  function createCard(image) {
    const card = document.createElement("div");
    card.className = "gallery_card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Photo by ${image.author}`);
    card.dataset.imageId = image.id;
    const span = getSpan(image.width, image.height);
    card.style.gridRowEnd = `span ${span}`;
    const wrapper = document.createElement("div");
    wrapper.className = "gallery_card-image-wrapper";
    const thumbSrc = buildImageUrl(image.id, image.width, image.height, DEFAULTS.THUMB_WIDTH);
    const thumb = document.createElement("img");
    thumb.className = "gallery_card-image is-thumb";
    thumb.src = thumbSrc;
    thumb.alt = `Photo by ${image.author}`;
    thumb.loading = "lazy";
    wrapper.appendChild(thumb);
    const fullSrc = buildImageUrl(image.id, image.width, image.height, DEFAULTS.FULL_WIDTH);
    const fullImg = new Image;
    fullImg.src = fullSrc;
    fullImg.onload = () => {
      thumb.src = fullImg.src;
      thumb.classList.remove("is-thumb");
      thumb.classList.add("is-loaded");
      requestAnimationFrame(() => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      });
    };
    const overlay = document.createElement("div");
    overlay.className = "gallery_card-overlay";
    const icon = document.createElement("span");
    icon.className = "gallery_card-icon";
    icon.innerHTML = "&#x2922;";
    overlay.appendChild(icon);
    const author = document.createElement("span");
    author.className = "gallery_card-author";
    author.textContent = image.author;
    overlay.appendChild(author);
    card.appendChild(wrapper);
    card.appendChild(overlay);
    card.style.opacity = "0";
    card.style.transform = "translateY(8px)";
    card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
    card.addEventListener("click", () => {
      const index = allImages.findIndex((img) => img.id === image.id);
      window.dispatchEvent(new CustomEvent("gallery:open-modal", {
        detail: { index, images: allImages }
      }));
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
    return card;
  }
  async function loadPage(page) {
    if (isLoading)
      return;
    isLoading = true;
    if (loader)
      loader.style.display = "flex";
    const skeletons = createSkeletons(DEFAULTS.PER_PAGE);
    try {
      const res = await fetch(buildApiUrl(page));
      if (!res.ok)
        throw new Error(`API error: ${res.status}`);
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
      console.error("Gallery fetch error:", err);
      removeSkeletons(skeletons);
    } finally {
      isLoading = false;
      if (loader)
        loader.style.display = "none";
    }
  }
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLoading) {
      loadPage(currentPage);
    }
  }, { rootMargin: "200px" });
  observer.observe(sentinel);
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const cards = grid.querySelectorAll(".gallery_card");
      cards.forEach((card) => {
        const id = card.dataset.imageId;
        const image = allImages.find((img) => img.id === id);
        if (image) {
          card.style.gridRowEnd = `span ${getSpan(image.width, image.height)}`;
        }
      });
    }, 200);
  });
  loadPage(currentPage);
})();

// src/modal.js
(() => {
  const modal = document.getElementById("gallery-modal");
  if (!modal)
    return;
  const backdrop = modal.querySelector(".gallery_modal-backdrop");
  const content = modal.querySelector(".gallery_modal-content");
  const image = modal.querySelector(".gallery_modal-image");
  const authorEl = modal.querySelector(".gallery_modal-author");
  const closeBtn = modal.querySelector(".gallery_modal-close");
  const prevBtn = modal.querySelector(".gallery_modal-nav-button.is-prev");
  const nextBtn = modal.querySelector(".gallery_modal-nav-button.is-next");
  let images = [];
  let currentIndex = 0;
  let triggerElement = null;
  const FULL_WIDTH = 1200;
  function getFocusable() {
    return modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  }
  function showImage(index) {
    const img = images[index];
    if (!img)
      return;
    currentIndex = index;
    const aspect = img.height / img.width;
    const fullH = Math.round(FULL_WIDTH * aspect);
    image.src = `https://picsum.photos/id/${img.id}/${FULL_WIDTH}/${fullH}`;
    image.alt = `Photo by ${img.author}`;
    authorEl.textContent = img.author;
    prevBtn.style.display = index > 0 ? "flex" : "none";
    nextBtn.style.display = index < images.length - 1 ? "flex" : "none";
  }
  function open(index, imageList) {
    images = imageList;
    triggerElement = document.activeElement;
    showImage(index);
    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => closeBtn.focus());
  }
  function close() {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    if (triggerElement) {
      triggerElement.focus();
      triggerElement = null;
    }
  }
  function prev() {
    if (currentIndex > 0)
      showImage(currentIndex - 1);
  }
  function next() {
    if (currentIndex < images.length - 1)
      showImage(currentIndex + 1);
  }
  window.addEventListener("gallery:open-modal", (e) => {
    open(e.detail.index, e.detail.images);
  });
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close);
  prevBtn.addEventListener("click", prev);
  nextBtn.addEventListener("click", next);
  modal.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("is-open"))
      return;
    switch (e.key) {
      case "Escape":
        close();
        break;
      case "ArrowLeft":
        e.preventDefault();
        prev();
        break;
      case "ArrowRight":
        e.preventDefault();
        next();
        break;
      case "Tab": {
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
