/* ── Customer Reel & Popover ── */
(() => {
  const POPOVER_WIDTH = 300;
  const POPOVER_GAP = 12;
  const VIEWPORT_MARGIN = 16;
  const HIDE_DELAY = 150;
  const DIM_OPACITY = '0.4';

  // Clone CMS items for seamless marquee — CSS translateX(-50%)
  // scrolls through originals, then clones take over.
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

  // Use the popover outside the CMS list — Webflow duplicates a bare
  // one into each .customers_item, but only this one has full markup.
  const popover = document.querySelector('.logos_component > .customers_popover');
  if (!popover) return;

  // Move to <body> — parent's backdrop-filter creates a containing
  // block that breaks position:fixed.
  document.body.appendChild(popover);

  const logoEl = popover.querySelector('.customers_popover-logo');
  const quoteEl = popover.querySelector('.customers_popover-quote');
  const photoEl = popover.querySelector('.customers_popover-photo');
  const nameEl = popover.querySelector('.customers_popover-name');
  const titleEl = popover.querySelector('.customers_popover-title');

  const items = document.querySelectorAll('.customers_item');
  if (items.length === 0) return;

  let hideTimeout = null;

  function show(item) {
    clearTimeout(hideTimeout);

    const quote = item.dataset.quote;
    const person = item.dataset.person;
    const title = item.dataset.title;

    if (!quote) return;

    const logoImg = item.querySelector('.customers_logo');
    if (logoEl && logoImg) {
      logoEl.src = logoImg.src;
      logoEl.alt = logoImg.alt || '';
    }

    const personPhoto = item.querySelector('.customers_person-photo');
    if (photoEl && personPhoto) {
      photoEl.src = personPhoto.src;
      photoEl.alt = person || '';
    }

    quoteEl.textContent = quote;
    if (nameEl) nameEl.textContent = person || '';
    if (titleEl) titleEl.textContent = title || '';

    const logoRect = logoImg ? logoImg.getBoundingClientRect() : item.getBoundingClientRect();

    let left = logoRect.left + logoRect.width / 2 - POPOVER_WIDTH / 2;

    if (left < VIEWPORT_MARGIN) left = VIEWPORT_MARGIN;
    if (left + POPOVER_WIDTH > window.innerWidth - VIEWPORT_MARGIN) {
      left = window.innerWidth - VIEWPORT_MARGIN - POPOVER_WIDTH;
    }

    popover.style.left = '-9999px';
    popover.style.width = `${POPOVER_WIDTH}px`;
    popover.style.top = '0';
    popover.classList.add('is-visible');
    const popoverHeight = popover.offsetHeight;

    const topPos = logoRect.top - popoverHeight - POPOVER_GAP;
    if (topPos < VIEWPORT_MARGIN) {
      popover.style.top = `${logoRect.bottom + POPOVER_GAP}px`;
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
    }, HIDE_DELAY);
  }

  const isDesktop = window.matchMedia('(min-width: 992px)').matches;

  function dimSiblings(item) {
    if (!isDesktop) return;
    items.forEach((el) => {
      el.style.opacity = el === item ? '1' : DIM_OPACITY;
    });
  }

  function resetOpacity() {
    if (!isDesktop) return;
    items.forEach((el) => {
      el.style.opacity = '';
    });
  }

  popover.addEventListener('mouseenter', () => {
    clearTimeout(hideTimeout);
  });
  popover.addEventListener('mouseleave', () => {
    hide();
  });

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
