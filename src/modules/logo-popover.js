/* ── Logo Popover ──────────────────────────────
   Positions a single shared popover above the
   hovered logo, populated from data-* attributes.

   HTML contract (built in Webflow):
   Each CMS logo item:
   <div class="logos_item"
        data-quote="..."
        data-person="..."
        data-title="..."
        aria-describedby="logos-popover">
     <img class="logos_image" ... />
   </div>

   Shared popover (outside the CMS list):
   <div class="logos_popover" id="logos-popover" role="tooltip">
     <div class="logos_popover-quote"></div>
     <div class="logos_popover-author"></div>
   </div>
   ──────────────────────────────────────────── */
(() => {
  const popover = document.querySelector('.logos_popover');
  if (!popover) return;

  const quoteEl = popover.querySelector('.logos_popover-quote');
  const authorEl = popover.querySelector('.logos_popover-author');
  const items = document.querySelectorAll('.logos_item');

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
