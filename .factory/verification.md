# Flipbook Proof — independent product verification

**Verdict: FAIL**  
**Candidate:** `6c24ce977fdc2047ecff45f9ac1a22b2d4f0dc54`  
**Live URL:** <https://flipbook-proof.sociobot.in>  
**Verified:** 2026-08-28 UTC  
**Work order:** `flipbook-proof-verify-1`

The deployed product is the candidate and the core local video-to-print workflow
works well. Release is nevertheless blocked by two mandatory acceptance gates:
the candidate has no `.factory/claims.json`, and the cold first screen has no
one-click sample-data demo (and does not plainly name teachers or illustrators).
A separate high-severity test also found that importing a 60-frame JSON project
bypasses the paid page-count entitlement.

## Mandatory gates

### Claims gate — BLOCKER

The exact candidate checkout does not contain `.factory/claims.json`. Therefore
there were no factory claim tests to execute through a demo entry point. Per the
work order, a missing claims file is release-blocking. The repository's normal
unit and Playwright tests were still run separately and are reported below.

### Cold first-read gate — BLOCKER

Tested in fresh Chromium contexts at 1440 × 900 and 390 × 844 with no stored
state. The first viewport says:

- What it does: turns a short video into numbered, onion-skinned,
  binding-safe trace sheets.
- What to click: **Choose your video**.
- For whom: not stated in plain words. The target groups, illustrators and
  teachers, are not named on the first screen.
- Sample path: none. There is no “try sample,” demo, or other one-click path
  that exercises the product without supplying a local video.

The absent sample action is independently sufficient to fail the explicit
first-read acceptance gate.

## Findings

### Blocker

1. **Missing required claims contract.** `.factory/claims.json` is absent at
   the candidate commit, so the mandated claim suite cannot exist or pass.
2. **No one-click sample-data demo, and audience is not plainly identified on
   the first screen.** A cold visitor must already have a compatible video.
   Teachers and illustrators are not named in the hero.

### High

3. **Plus page-count entitlement can be bypassed through project import.** In
   a fresh context showing `Free plan · up to 24 pages`, importing a valid
   version-1 project with 60 `data:image/png` frames produced 60 thumbnails,
   displayed `Imported 60 frames`, enabled Print, and constructed 61 print
   pages (one contact sheet plus pages 1–60). No license token or verification
   request was involved. Import/export itself should remain free, but paid
   36/48/60-page proof generation/printing is not enforced.

### Medium

4. **Hidden file inputs create invisible duplicate keyboard stops.** Tab order
   reaches the designed `Choose video` label and then the clipped 1 × 1 px
   `#videoFile`; the same pattern exists for project import. The focused hidden
   input has no perceivable focus indicator because it is clipped. Remove it
   from sequential focus when the proxy label is used, while retaining
   programmatic/native picker access.
5. **The locked-page action does not move focus to a visible control.** Choosing
   60 pages and activating `Unlock 60 pages` changes the hash to `#unlock`, but
   its attempt to focus `#licenseToken` fails because the containing disclosure
   is closed (`document.activeElement` had no useful target). Open the restore
   disclosure or focus the visible Buy/restore control.
6. **Production response policy/caching is incomplete.** HTML, hashed JS/CSS,
   service worker, and manifest all use `Cache-Control: public,
   must-revalidate, max-age=30`; hashed assets are not long-lived immutable as
   required by the performance contract. Responses have HSTS,
   `X-Content-Type-Options: nosniff`, and a strict-origin referrer policy, but
   no Content-Security-Policy or Permissions-Policy.
7. **Several visible interactive targets are below the supplied 44 px
   baseline.** Desktop header navigation links measured about 24.8 px high,
   the brand link 34 px high, and footer links about 24.8 px high. Axe does not
   flag these, but they do not meet the attached touch-target contract.

### Low

8. **Manifest MIME type is generic.** `/manifest.webmanifest` is served as
   `application/octet-stream` instead of `application/manifest+json`.
   Chromium still parsed it with zero manifest/installability errors.

## Clean-checkout quality gates

A separate clean clone was detached at the exact candidate SHA before running
the repository checks.

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 58 packages, 0 vulnerabilities |
| `npm test` | PASS; 4/4 Vitest tests |
| `npx tsc --noEmit` | PASS |
| Lint | Not available; no lint script/config is provided |
| `npm run build` | PASS; Vite 7.3.6 produced `dist/` |
| `npm run test:e2e` | PASS for runnable tests; 9 passed, 1 skipped |

The skipped test is the complete mobile extraction workflow. Independent live
testing filled that gap: the supplied WebM extracted all 12 frames and exposed
the proof and print panels at 390 × 844 without horizontal overflow or errors.

Production artifact sizes:

| Artifact | Raw size | Budget |
| --- | ---: | ---: |
| Initial JS | 31,363 B | ≤ 200 KB |
| CSS | 20,310 B | ≤ 50 KB |
| Self-hosted font | 12,860 B | ≤ 120 KB |
| Mobile hero | 38,738 B | ≤ 300 KB |
| Desktop hero | 96,912 B | n/a |

## End-to-end product evidence

Using the original synthetic `tests/fixtures/motion.webm` on the live site:

- Rejected a text file with an actionable MP4/MOV/WebM message, then recovered
  by loading the valid clip.
- Rejected a corrupt `.webm`, then recovered with the valid clip.
- Loaded metadata as `motion · 0:01 · 320 × 240`.
- Enforced a minimum 0.25-second selection when Start was moved to End.
- Normalized an extreme crop (`x=80`, requested width 100) to width 20.
- Extracted 12 local frames on desktop and mobile.
- Showed previous/next/both onion layers; at frame 2, Both rendered three
  layers and exposed the text alternative `Frame 2 of 12 with both onion skin`.
- Filmstrip End moved to frame 12; arrow-key behavior also passed the shipped
  E2E suite.
- Right-bound, reverse-order US Letter proof contained 13 DOM pages with trace
  numbers 12 through 01. The existing E2E test confirmed `window.print()` is
  invoked.
- Exported `motion.flipbook-proof.json` (52,537 bytes, 12 frames), restored the
  project from IndexedDB after reload, rejected malformed JSON with an
  actionable message, and re-imported the valid export.
- The mobile duration cap accepted an exact 30.0-second metadata boundary and
  rejected 30.11 and 31 seconds with trim guidance. Duration was overridden at
  the media-property boundary for these deterministic checks; real decoder
  validation was separately exercised with valid and corrupt WebM data.
- Start-over uses a native confirmation that names the local deletion and
  advises export first (source inspection plus existing browser behavior).

No real printer hardware was available. Print DOM, print styles, ordering,
binding side, page count, and print invocation were verified in Chromium.

## Accessibility and responsive behavior

- Factory `/opt/fleet/lib/verify-url.sh`: PASS; HTTP 200, title, `lang=en`, one
  H1, main landmark, alt coverage, and zero console errors; measured load 949
  ms.
- Playwright Axe on the cold page and completed workflow: zero serious or
  critical violations (in fact, zero Axe violations returned).
- Lighthouse Accessibility: 100.
- Keyboard smoke: skip link works and receives a designed 3 px focus ring;
  primary navigation, picker proxy, workflow controls, frame strip, print,
  export, and import proxy are operable. Findings 4 and 5 remain.
- 390 × 844: no document-level horizontal overflow before or after extraction.
- 200% root text sizing: no horizontal overflow and Print remained reachable.
- Reduced motion: computed transition/animation durations became 0.001 ms and
  scroll behavior became `auto`.
- The visual thesis explicitly chooses one warm daylight mode; no unadvertised
  dark theme was expected. Axe/Lighthouse found no contrast failure.
- No console errors or uncaught page errors occurred in cold, completed,
  mobile, or offline runs.

## PWA and local-first behavior

- Manifest has 192 px, 512 px, and 512 px maskable PNGs with correct intrinsic
  dimensions, standalone display, themed colors, and a versioned start URL.
- Chrome DevTools Protocol reported zero manifest errors and zero
  installability errors.
- The service worker installed and controlled the page. After saving a
  12-frame proof, browser offline mode plus reload showed `Offline · local
  tools ready` and restored all 12 IndexedDB frames.
- A local in-memory second service-worker response (no repository edits)
  exercised the update lifecycle: a worker reached `waiting`, the app displayed
  `An updated proof room is ready`, and Reload sent `SKIP_WAITING` and began
  activation without console errors.
- Cold and normal local-video workflows requested only same-origin app assets.
  No source-video upload request was observed. No analytics, tracking scripts,
  or third-party fonts were loaded.

## Billing and API behavior

- Sign-in is not used, so the Entra authority requirement is not applicable.
- Checkout returned HTTP 303 to a hosted
  `checkout.dodopayments.com/session/...` URL through the approved Sociobot API.
- Invalid verification returned HTTP 200 with
  `{"valid":false,"reason":"invalid","expires_at":null}` and the expected
  live-origin CORS header.
- `?license=...` was stored at `sb_license:flipbook-proof`, removed from the
  URL, reconciled to `License no longer active`, and cached; reload made no
  second verification request.
- Rate-limit burst: 120 simultaneous invalid-token GET requests completed in
  1.086 seconds. 30 returned 200 and 90 returned 429; every 429 carried
  `Retry-After: 4`. Because requests were concurrent, completion/request index
  is nondeterministic; the observed allowance was 30 responses in this burst.

## Deployment identity, privacy, and response checks

The live bytes exactly matched the candidate build for `/`, the hashed JS and
CSS, `/sw.js`, `/manifest.webmanifest`, `/privacy/`, and `/terms/` by SHA-256.
The key live asset hashes were:

- HTML: `538ad39bfc24792eb391d416ef8478eea22090be58cfeafb38ce730e200f513e`
- JS: `1d5ad86bb87fd006cd4f3fa6f496bd7bb935eac826506a0554a6a4985b09f1e2`
- CSS: `4d9bb928d6ab81169d10c920cfff2a8e7e789bdb8151b4124fc8b4dc5a567271`
- Service worker: `67024272b82b57f1553a835523467ee514cabef77fc2d29a23d6731487d8d4d6`

The privacy and terms pages are present and accurately describe IndexedDB,
localStorage license data, local media processing, exports, and billing.

## Performance

Lighthouse 12.8.2 mobile against the live URL (fresh run):

- Performance 99, Accessibility 100, Best Practices 100, SEO 100.
- FCP 0.9 s, LCP 1.3 s, Speed Index 0.9 s, TBT 110 ms, CLS 0.06.
- Initial transferred size 69 KiB.

INP is a field metric and was not available in this lab run; TBT was within the
interactive-response proxy budget. One initial all-category Lighthouse attempt
crashed its headless tab; the successful performance and quality category runs
were then executed separately with the same Lighthouse version.

## Required release actions

1. Add `.factory/claims.json` and make every listed test pass through the
   product's demo entry point.
2. Put a one-click sample-data path on the first screen and name the intended
   audience in plain words.
3. Enforce the Plus entitlement for imported projects above 24 frames while
   keeping import/export and accessibility available.
4. Remove clipped file inputs from sequential keyboard focus, fix the paid-gate
   focus destination, and raise persistent navigation/legal targets to 44 px.
5. Configure immutable caching for content-hashed assets and add appropriate
   CSP/Permissions-Policy headers; serve the manifest with its specific MIME.
