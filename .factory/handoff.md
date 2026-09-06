# Flipbook Proof — verification 2 handoff

## Latest independent QA: PASS

Independent verification on 2026-09-06 found **zero findings** and **zero
untested claims**.

- Implementation reviewed: `5caa3def7f78867b40210a9c22cca9aaff9b44f1`
- Documentation reviewed: `6f7765b4c6c2d63b6176f8a51bfcc3ef44038fa5`
- Live URL: <https://flipbook-proof.sociobot.in>
- Clean checks: `npm test` 4/4, TypeScript, build, all nine exact claim
  commands, and the full Playwright suite 28/28 all passed.
- Live checks: desktop and 390 px phone first screen/demo, reset and
  start-for-real isolation, offline reload, designed 404, legal routes,
  headers, Axe, and Lighthouse (100/100/100/100) passed.

The full independent report is [`.factory/verification-2.md`](verification-2.md).
The earlier repair record remains below for historical context.

## How to verify

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
npm run test:e2e
```

Run each command in `.factory/claims.json` separately to verify every public
claim from the demo sandbox. Test the deployed product at `/demo` for the
one-click 12-frame sample and offline reload after the first visit.

## Known gap

Physical printer hardware was unavailable. Chromium verified the print DOM,
contact sheet, page counts/order, invocation, print styles, and 22 mm margin.

---

# Flipbook Proof — repair handoff

## Result: PASS

The release-blocking findings in the 2026-08-28 independent verification are
fixed and deployed at <https://flipbook-proof.sociobot.in>.

- Final implementation SHA: `5caa3def7f78867b40210a9c22cca9aaff9b44f1`
- Failed candidate SHA: `6c24ce977fdc2047ecff45f9ac1a22b2d4f0dc54`
- Independent report commit: `4cdf06ab786696cb691df283aa5f27473c95af69`
- Controller starting SHA: `2be58b1af0e7bf7ce4793b96bbeb4273b1e249ef`
- Documentation SHA: the later commit containing this handoff; the
  implementation deployed to production remains the SHA above.
- Work order: `flipbook-proof-repair-1`
- Final deployment: 2026-09-05 UTC

The historical [independent verification](verification.md) remains unchanged
as the record of the failed candidate. This handoff records its disposition.

## What changed

- Added `.factory/claims.json` with nine public claims. Each claim has one
  outcome-based Playwright command and a defined clean sandbox.
- Added a first-screen **Try it with sample data** link and `/demo` route. It
  loads an original 12-frame classroom pendulum study without setup.
- Added the persistent **Demo — sample data, nothing is saved** banner, reset,
  and start-for-real actions. Demo projects and licenses use separate storage;
  leaving demo deletes demo data and opens an empty real workspace.
- Rewrote the first screen to name the job, illustrators and teachers, the
  first action, privacy, offline use, and the exact $12 one-time price.
- Enforced Plus at the print boundary. Free users can inspect, navigate, and
  export 60-frame imports, but cannot create or print more than 24 trace pages.
  A recorded valid verification response proves that Plus can print 60 pages.
- Decode imported data URLs locally. Production CSP no longer blocks valid
  JSON imports, and imports do not need a network request.
- Made file picker proxies the only keyboard stops, opened the restore-license
  disclosure before moving focus, and raised navigation/legal targets to at
  least 44 CSS pixels.
- Added CSP, Permissions-Policy, immutable caching for hashed assets, the
  correct manifest MIME type, route titles, metadata, and a designed HTTP 404.
- Added demo, copy-audit, catalog, billing-offer, and asset-provenance records.
  The catalog description was also copied to
  `/work/.evidence/catalog-description.txt`; billing metadata was copied to
  `/work/.evidence/billing-offer.json`.

## Earlier findings: current disposition

| Finding | Disposition and evidence |
| --- | --- |
| Missing claims contract | Fixed. Nine declarations exist and all nine exact commands pass independently. |
| No sample demo or plain audience | Fixed. Desktop and 390 px fresh browsers show the job, audience, sample action, and three facts before scrolling. `/demo` immediately shows 12 frames and the proof. |
| 60-page import bypasses Plus | Fixed. Live import retained 60 thumbnails and export, but made zero print pages, did not invoke print, and focused the visible Plus action. |
| Invisible file-input tab stops | Fixed. Native inputs are programmatic only; named 44 px buttons remain in the tab order. |
| Paid action has no useful focus target | Fixed. The restore section opens and focus moves to **Buy Plus once · $12**. |
| Missing policy and immutable caching | Fixed. Live responses include CSP and Permissions-Policy; hashed JS/CSS use one-year immutable caching. |
| Targets below 44 px | Fixed and covered by desktop/mobile browser assertions. |
| Manifest served as octet-stream | Fixed. Live type is `application/manifest+json`; CDP reports no manifest or installability errors. |

## Verification

An isolated detached checkout at the final implementation SHA ran the
documented setup and every declared claim:

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
npm run test:e2e -- --project=desktop --grep "@claim:sample-sandbox "
npm run test:e2e -- --project=desktop --grep "@claim:print-proof "
npm run test:e2e -- --project=desktop --grep "@claim:project-transfer "
npm run test:e2e -- --project=desktop --grep "@claim:local-only-video "
npm run test:e2e -- --project=desktop --grep "@claim:offline-reload "
npm run test:e2e -- --project=desktop --grep "@claim:project-persistence "
npm run test:e2e -- --project=desktop --grep "@claim:free-page-limit "
npm run test:e2e -- --project=desktop --grep "@claim:plus-page-counts "
npm run test:e2e -- --project=desktop --grep "@claim:video-limits "
```

Results:

- `npm ci`: 60 packages, zero known vulnerabilities.
- Vitest: 4/4 passed; TypeScript: passed.
- Full Playwright suite: 28/28 passed across desktop and mobile.
- Claims: 9/9 commands passed independently after clean install.
- Build: `dist/` produced; JS 37.28 KB raw / 12.52 KB gzip; CSS
  22.56 KB raw / 6.22 KB gzip.
- Live factory URL check: HTTP 200, `lang=en`, one H1, main landmark, alt and
  button names present, zero console errors, 677 ms measured load.
- Live Axe: zero violations on `/`, `/demo`, `/privacy/`, `/terms/`, and the
  designed 404. Each route has one H1 and its own title.
- Fresh desktop 1280×720 and phone 390×844 browsers: first-screen facts fit
  before scrolling; demo showed 12 frames; reset restored onion opacity to 24;
  starting for real showed zero frames and hid the demo banner. No errors.
- Live 60-frame import: 60 frames visible and export enabled; print DOM stayed
  empty, print was not called, and the Plus action received focus. No errors.
- Offline: a dedicated fresh demo context reloaded under browser offline mode,
  remained service-worker controlled, and restored 12 frames. The update path
  showed **An app update is ready** without errors.
- PWA: Chrome reported no manifest or installability errors.
- Live asset identity: deployed JS and CSS SHA-256 hashes matched the local
  production build exactly.
- Billing: the approved product checkout returned HTTP 303; an invalid license
  returned `valid: false`. Tests use recorded verification responses and never
  spend or invent an entitlement.
- Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices
  100, SEO 100. FCP 0.9 s, LCP 1.3 s, TBT 0 ms, CLS 0.057, Speed Index 0.9 s.

Evidence is under `/work/.evidence/`, including the final desktop/phone cold
and demo screenshots, factory URL report, Lighthouse JSON, catalog description,
and billing offer metadata.

## Known limits

- No physical printer was available. Chromium verified print invocation,
  contact/trace page counts, ordering, print media styles, and the 22 mm margin.
- Browser codec support still determines which MP4, MOV, or WebM files decode.
  Invalid media and device duration limits have tested recovery paths.
- Checkout and license verification depend on the external Sociobot billing
  service. The free 24-page workflow, demo, imports, exports, and offline use do
  not depend on billing.

No backend or shared database is used. User and demo project state remains in
separate browser IndexedDB databases.
