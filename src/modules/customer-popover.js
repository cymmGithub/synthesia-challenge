/* ── Customer Reel & Popover ── */
(() => {
  // ── Marquee duplication (mobile only) ─────────
  // Clone all CMS items so the list is doubled.
  // CSS translateX(-50%) scrolls through the first
  // set, then the cloned set takes over seamlessly.
  // Only needed on mobile where the marquee animation runs.
  const list = document.querySelector('.customers_list');
  const isTabletOrBelow = window.matchMedia('(max-width: 991px)').matches;
  if (list && isTabletOrBelow) {
    const originals = [...list.children];
    originals.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true'); // avoid duplicate a11y
      list.appendChild(clone);
    });
  }

  // ── Popover ──────────────────────────────────
  // Select the popover outside the CMS list (inside .logos_component).
  // Webflow duplicates a bare popover into each .customers_item, but only
  // the one outside the list has the full attribution markup.
  const popover = document.querySelector('.logos_component > .customers_popover');
  if (!popover) return;

  // Move popover to <body> so position:fixed works correctly.
  // The parent .logos_component or .customers_item may have backdrop-filter,
  // which creates a containing block that breaks fixed positioning.
  document.body.appendChild(popover);

  const logoEl = popover.querySelector('.customers_popover-logo');
  const quoteEl = popover.querySelector('.customers_popover-quote');
  const photoEl = popover.querySelector('.customers_popover-photo');
  const nameEl = popover.querySelector('.customers_popover-name');
  const titleEl = popover.querySelector('.customers_popover-title');

  // Query AFTER duplication so clones are included
  const items = document.querySelectorAll('.customers_item');
  if (items.length === 0) return;

  let hideTimeout = null;

  function show(item) {
    clearTimeout(hideTimeout);

    const quote = item.dataset.quote;
    const person = item.dataset.person;
    const title = item.dataset.title;

    if (!quote) return;

    // Populate logo from hovered item's image
    const logoImg = item.querySelector('.customers_logo');
    if (logoEl && logoImg) {
      logoEl.src = logoImg.src;
      logoEl.alt = logoImg.alt || '';
    }

    // Populate person photo from hidden image
    const personPhoto = item.querySelector('.customers_person-photo');
    if (photoEl && personPhoto) {
      photoEl.src = personPhoto.src;
      photoEl.alt = person || '';
    }

    quoteEl.textContent = quote;
    if (nameEl) nameEl.textContent = person || '';
    if (titleEl) titleEl.textContent = title || '';

    // Position above the logo image
    const logoRect = logoImg ? logoImg.getBoundingClientRect() : item.getBoundingClientRect();
    const popoverWidth = 300;

    let left = logoRect.left + logoRect.width / 2 - popoverWidth / 2;

    // Edge detection — keep within viewport
    const margin = 16;
    if (left < margin) left = margin;
    if (left + popoverWidth > window.innerWidth - margin) {
      left = window.innerWidth - margin - popoverWidth;
    }

    // Batch DOM reads: measure popover height while off-screen
    popover.style.left = '-9999px';
    popover.style.width = `${popoverWidth}px`;
    popover.style.top = '0';
    popover.classList.add('is-visible');
    const popoverHeight = popover.offsetHeight;

    // Batch DOM writes: position in one pass
    const topPos = logoRect.top - popoverHeight - 12;
    if (topPos < margin) {
      popover.style.top = `${logoRect.bottom + 12}px`;
    } else {
      popover.style.top = `${topPos}px`;
    }
    popover.style.left = `${left}px`;
  }

  let activeItem = null;

  function hide() {
    hideTimeout = setTimeout(() => {
      popover.classList.remove('is-visible');
      activeItem = null;
      resetOpacity();
    }, 150);
  }

  const isDesktop = window.matchMedia('(min-width: 992px)').matches;

  function dimSiblings(item) {
    if (!isDesktop) return;
    items.forEach((el) => {
      el.style.opacity = el === item ? '1' : '0.4';
    });
  }

  function resetOpacity() {
    if (!isDesktop) return;
    items.forEach((el) => {
      el.style.opacity = '';
    });
  }

  // Keep popover alive when mouse moves onto it
  popover.addEventListener('mouseenter', () => {
    clearTimeout(hideTimeout);
  });
  popover.addEventListener('mouseleave', () => {
    hide();
  });

  // Event delegation on container instead of per-item listeners
  const container = list || document.querySelector('.logos_component');
  if (container) {
    container.addEventListener('mouseenter', (e) => {
      const logo = e.target.closest('.customers_logo');
      if (!logo) return;
      const item = logo.closest('.customers_item');
      if (!item) return;
      activeItem = item;
      show(item);
      dimSiblings(item);
    }, true);

    container.addEventListener('mouseleave', (e) => {
      if (!e.target.closest('.customers_logo')) return;
      hide();
    }, true);

    container.addEventListener('focusin', (e) => {
      const logo = e.target.closest('.customers_logo');
      if (!logo) return;
      const item = logo.closest('.customers_item');
      if (item) show(item);
    });

    container.addEventListener('focusout', (e) => {
      if (e.target.closest('.customers_logo')) hide();
    });
  }
})();
