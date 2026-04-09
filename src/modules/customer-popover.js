/* ── Customer Reel & Popover ───────────────────
   1. Duplicates CMS logo items for seamless marquee loop
   2. Positions a shared popover above hovered logos

   HTML contract (built in Webflow):
   Each CMS customer item:
   <div class="customers_item"
        data-quote="..."
        data-person="..."
        data-title="..."
        aria-describedby="customers-popover">
     <img class="customers_logo" ... />
   </div>

   Shared popover (outside the CMS list):
   <div class="customers_popover" id="customers-popover" role="tooltip">
     <div class="customers_popover-quote"></div>
     <div class="customers_popover-author"></div>
   </div>
   ──────────────────────────────────────────── */
(() => {
  // ── Marquee duplication (mobile only) ─────────
  // Clone all CMS items so the list is doubled.
  // CSS translateX(-50%) scrolls through the first
  // set, then the cloned set takes over seamlessly.
  // Only needed on mobile where the marquee animation runs.
  const list = document.querySelector('.customers_list');
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  if (list && isMobile) {
    const originals = [...list.children];
    originals.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true'); // avoid duplicate a11y
      list.appendChild(clone);
    });
  }

  // ── Popover ──────────────────────────────────
  const popover = document.querySelector('.customers_popover');
  if (!popover) return;

  const quoteEl = popover.querySelector('.customers_popover-quote');
  const authorEl = popover.querySelector('.customers_popover-author');

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

    quoteEl.textContent = quote;
    authorEl.textContent = title ? `${person}, ${title}` : person;

    // Position above the logo
    const rect = item.getBoundingClientRect();
    const popoverWidth = 300;

    let left = rect.left + rect.width / 2 - popoverWidth / 2;
    const top = rect.top - 12;

    // Edge detection — keep within viewport
    const margin = 16;
    if (left < margin) left = margin;
    if (left + popoverWidth > window.innerWidth - margin) {
      left = window.innerWidth - margin - popoverWidth;
    }

    popover.style.left = `${left}px`;
    popover.style.bottom = `${window.innerHeight - top}px`;
    popover.style.width = `${popoverWidth}px`;
    popover.classList.add('is-visible');
  }

  function hide() {
    hideTimeout = setTimeout(() => {
      popover.classList.remove('is-visible');
    }, 100);
  }

  items.forEach((item) => {
    item.addEventListener('mouseenter', () => show(item));
    item.addEventListener('mouseleave', hide);
    item.addEventListener('focusin', () => show(item));
    item.addEventListener('focusout', hide);
  });
})();
