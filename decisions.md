# Implementation Decisions Log

## 1. Client-First Clonable as Base
**Decision:** Cloned Finsweet's official Client-First starter project instead of building from scratch.
**Why:** The task evaluates CMS modeling, JS quality, interaction polish, and reusability — not whether I can set up utility classes. Starting from the Client-First clonable let me skip the redundant scaffolding and focus entirely on the custom functionality, CMS structure, and UX that actually demonstrate my skills.
**Trade-off:** None — this is how professional Webflow teams work. You don't rebuild the framework, you build on it.

## 2. Hybrid Animation Approach (Hero Word Rotator)
**Decision:** Built the HTML structure in Webflow with Client-First classes, then used custom JS/CSS for the rotation logic.
**Why:** Shows fluency in both Webflow's visual builder AND front-end engineering. Pure Webflow IX2 would limit control over timing and accessibility. Pure JS would ignore Webflow's strengths. The hybrid approach is production-grade.
**Trade-off:** Requires the custom script to load, but we prevent layout shift by reserving dimensions in CSS.

## 3. JS-Powered Shared Popover (Logo Reel)
**Decision:** Used a single shared popover element positioned dynamically via JS, rather than per-item CSS popovers or Webflow interactions.
**Why:** Better edge detection (popover stays within viewport), more accessible (aria attributes, keyboard support), and more maintainable (one element vs. N duplicated elements in CMS items).
**Trade-off:** Requires JS, but the UX and accessibility gains are worth it.

## 4. External JS via GitHub + jsDelivr CDN
**Decision:** Hosted all custom JS in a public GitHub repo, bundled with bun, served via jsDelivr CDN.
**Why:** This is how professional Webflow teams manage custom code at scale. It's version-controlled, maintainable, and keeps Webflow's code embeds clean. Finsweet themselves use this exact pattern for their Attributes library.
**Trade-off:** Adds an external dependency, but jsDelivr is highly reliable and the fallback is simply pasting the code into Webflow directly.

## 5. Masonry Grid with JS Span Calculation
**Decision:** Used CSS Grid with `grid-auto-rows: 1px` and JS-calculated `grid-row-end` spans per card.
**Why:** The brief specifically asked for "Pexels-style layouts" that "preserve image aspect ratio." CSS columns would reorder content top-to-bottom. A uniform grid would crop images. This approach gives true masonry with left-to-right reading order.
**Trade-off:** Requires JS measurement, but it's a natural companion to the Intersection Observer code already running.

## 6. 4-Stage Loading UX (Gallery)
**Decision:** Implemented shimmer skeletons → blur-up thumbnails → staggered reveal → bottom loader.
**Why:** The gallery fetches from an external API, so loading states are the actual UX. Each stage serves a purpose: skeletons prevent layout shift, blur-up provides immediate visual content, staggered reveal adds polish, and the bottom loader signals more content is coming.
**Trade-off:** More code complexity, but each stage is independent and the combined effect is noticeably smoother than a simple spinner.

## 7. Accessibility Throughout
**Decision:** Added aria-live on word rotator, role="tooltip" on popovers, full focus trap + keyboard nav on modal, prefers-reduced-motion overrides.
**Why:** The brief mentions "accessibility basics" — going deeper signals senior-level thinking. Focus trap and reduced motion are the two things most candidates skip.
**Trade-off:** Minimal extra code for significant UX improvement.

## 8. Synthesia Design Tokens
**Decision:** Extracted actual color palette, typography, spacing, and border radius values from synthesia.io and applied them throughout.
**Why:** The brief says "design language matching the Synthesia aesthetic." Using their actual tokens shows attention to detail and makes the page feel like it belongs on their site.
**Trade-off:** None — it's more impressive than a generic design.

## 9. Selective Testing Strategy (Gallery Utils Only)
**Decision:** Extracted pure logic from the gallery module into `gallery-utils.js` and wrote unit tests only for that module — not for the word rotator, popover, or modal.
**Why:** Testing should target complexity, not checkboxes. The gallery module contains the most complex logic: masonry span calculation, image URL construction with aspect ratio preservation, responsive column breakpoints, and API URL building. The other modules (word rotator, popover, modal) are primarily DOM wiring with minimal branching logic — testing them would mean testing the DOM, not our code.
**Trade-off:** Less coverage surface, but the tests that exist are meaningful and fast (18 tests, 24ms). Pure functions with no DOM mocking — exactly the kind of tests that catch real regressions.

## 10. Progressive Enhancement for Word Rotator
**Decision:** The H1 is written as complete, meaningful static text in Webflow ("Turn text to video in minutes"). JS finds the placeholder word, injects the rotator structure, and starts cycling — rather than building empty containers in Webflow that depend on JS to display content.
**Why:** If JS fails to load, the user still sees a fully readable heading. This is a graceful degradation pattern — the page works without JS, and JS enhances it. It also keeps the Webflow structure clean (just a span with a class) instead of requiring complex nested divs inside an H1.
**Trade-off:** The animation only appears after JS loads, but that's imperceptible on a fast connection and the fallback is a perfectly good heading.

## 11. Two-Layer Color Variable System
**Decision:** Colors are managed in two synchronized layers: **Webflow Swatches** for the visual designer side, and **CSS custom properties** (`var(--color-primary)`, etc.) for custom code. Both reference the same hex values.
**Why:** Webflow's designer can't read CSS custom properties — you must pick colors visually. Hardcoding hex values everywhere means a rebrand requires finding and replacing every instance. Swatches solve this on the Webflow side (change once, updates everywhere), while CSS variables solve it on the custom code side. This is the standard Client-First approach to color management.
**Trade-off:** Two sources of truth for the same colors, but they're both defined in one place each (swatch panel + `:root` variables) and easy to keep in sync.
