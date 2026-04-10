# Implementation Decisions Log

## 1. Client-First Clonable as Base
**Decision:** Cloned Finsweet's Client-First starter instead of building from scratch.
**Why:** The task evaluates CMS modeling, JS quality, and interaction polish — not utility class scaffolding

## 2. Hybrid Animation Approach (Hero Word Rotator)
**Decision:** Webflow structure with Client-First classes + custom JS/CSS for rotation logic.
**Why:** Pure IX2 limits timing/accessibility control; pure JS ignores Webflow's strengths.
**Trade-off:** Requires custom script, but layout shift is prevented by reserving dimensions in CSS.

## 3. JS-Powered Shared Popover (Logo Reel)
**Decision:** Single shared popover positioned dynamically via JS, rather than per-item popovers or IX2.
**Why:** Better viewport edge detection, more accessible (aria attributes, keyboard support), more maintainable (one element vs. N duplicates).
**Trade-off:** Requires JS, but UX and accessibility gains justify it.

## 4. External JS via GitHub + jsDelivr CDN
**Decision:** Custom JS hosted in a public GitHub repo, bundled with Bun, served via jsDelivr.
**Why:** Version-controlled (commit hash), maintainable, keeps Webflow code embeds clean.
**Trade-off:** External dependency, but jsDelivr is reliable and fallback is pasting code into Webflow directly.

## 5. Masonry Grid with JS Span Calculation
**Decision:** CSS Grid with `grid-auto-rows: 1px` and JS-calculated `grid-row-end` spans.
**Why:** Brief asked for "Pexels-style layouts" preserving aspect ratio. CSS columns reorder content; uniform grids crop images. This gives true masonry with left-to-right reading order.
**Trade-off:** Requires JS measurement, but pairs naturally with the Intersection Observer already in use.

## 6. 4-Stage Loading UX (Gallery)
**Decision:** Shimmer skeletons → blur-up thumbnails → staggered reveal.
**Why:** Gallery fetches from an external API, so loading states *are* the UX. Each stage serves a distinct purpose: layout stability, immediate visual content, polish, and pagination signaling.
**Trade-off:** More code, but each stage is independent and the combined effect is noticeably smoother than a spinner.


## 7. Selective Testing Strategy (Gallery Utils Only)
**Decision:** Unit tests only for `gallery-utils.js` — not word rotator, popover, or modal.
**Why:** Gallery has the most complex logic (masonry spans, image URL construction, responsive breakpoints). Other modules are primarily DOM wiring with minimal branching.
