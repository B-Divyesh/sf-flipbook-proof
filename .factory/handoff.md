# Flipbook Proof — build handoff

## What shipped

- A Vite + vanilla TypeScript PWA for the complete video-to-paper workflow:
  local clip loading, safe device-aware duration cap, timeline range, crop
  presets/fine controls, 12–60 evenly sampled frames, adjacent-frame onion
  skin, keyboard film strip, and a binding-aware print proof.
- Print output includes a contact sheet followed by numbered A4 or US Letter
  trace pages, 22 mm left/right no-draw margin, crop marks, optional prior-frame
  onion layer, and forward/reverse physical stack order.
- IndexedDB persistence for settings and extracted frame blobs, plus explicit
  JSON export/import. Source video is never uploaded or retained.
- Installable offline app shell with versioned caches, cached build assets,
  network-first navigation, cache-first assets, update toast, and a visible
  offline state.
- Honest one-time Plus unlock: production Sociobot checkout link, returned-token
  capture, daily verification cache, optimistic offline access, paste-to-restore,
  and device removal. Plus extends page counts; the complete 24-page workflow,
  print, export, privacy, and accessibility remain free.
- Original art-deco transit-poster visual system, generated hero illustration,
  original SVG/PNG app mark, self-hosted type, and responsive 390 px layout.
- Standalone privacy and terms pages, README, MIT license, robots and sitemap.

## Run and verify

```sh
npm install
npm test
npx tsc --noEmit
npm run build
npm run test:e2e
```

Static build output is `dist/`, with `dist/index.html` at its root.

Verification completed 2026-08-28:

- Unit: 4/4 passed.
- Playwright: 9 passed, 1 intentionally skipped (the heavy extraction case is
  desktop-only); desktop Chromium and 390 × 844 mobile semantic/console smoke,
  axe serious/critical scan, privacy/terms, keyboard skip/picker path, and true
  offline reload passed. The core test loads the included synthetic WebM,
  extracts 12 frames, navigates them by arrow key, builds a 13-page printable
  proof, and exports project JSON.
- Production bundle: 31.34 KB JS (10.68 KB gzip), 20.31 KB CSS (5.80 KB gzip),
  15 KB self-hosted font, 96 KB desktop hero / 40 KB mobile hero.
- Lighthouse mobile: Performance 98, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1.5 s, CLS 0.06, total blocking time 140 ms.
- Factory `verify-url.sh`: HTTP 200, title/lang/main present, one h1, zero
  missing image alternatives, zero console errors (713 ms local load).
- Manual visual review: 1440 × 1000 desktop and 390 × 844 mobile. Generated
  illustration checked for unwanted text, brands, malformed objects, and seams.

## Known gaps / operational notes

- Codec availability is controlled by the browser/OS. H.264 MP4 and WebM are
  the recommended inputs; unsupported MOV variants receive an actionable error.
- Browser print drivers can add headers or scale pages. The UI asks users to
  inspect the contact sheet and use the print preview; a native PDF generator
  is intentionally out of scope to keep media private and the bundle small.
- Checkout becomes transactable after the factory registers the product slug
  with the Sociobot billing service. No product ID or secret is hard-coded.
- iOS may evict IndexedDB under storage pressure, which is why project export is
  always available and prominent.

## Next steps

- Register `flipbook-proof` with Sociobot billing and smoke-test the production
  return URL and refund/revocation flow.
- Pilot with educators and illustrators, tracking only the stated outcome via
  voluntary feedback: whether a complete 24-page proof avoided page-order and
  binding-margin mistakes.
