# Turn video into printable flipbook trace sheets — review 1

**Verdict: PASS**

- **Findings:** 0 (blocker 0, high 0, medium 0, low 0)
- **Untested public claims:** 0
- **Implementation reviewed:** `5caa3def7f78867b40210a9c22cca9aaff9b44f1`
- **Documentation base reviewed:** `464455f7e94318e803d6b7901ade7c54cb34aaf9`
- **Live URL:** <https://flipbook-proof.sociobot.in>
- **Reviewed:** 2026-09-06 UTC
- **Work order:** `flipbook-proof-review-1`

The implementation and live deployment match. The later documentation and
Graphify changes do not alter the reviewed product artifact.

## First screen

Fresh desktop (1280 × 720) and phone (390 × 844) browsers were opened before
scrolling.

- **Job:** “Turn video into printable flipbook trace sheets.”
- **Audience:** illustrators and teachers checking frame order and binding
  margins before drawing.
- **First action:** **Try it with sample data**, which loads a 12-page movement
  study.

The desktop final fact ended at 718.36 px in a 720 px viewport. The phone final
fact ended at 840.70 px in an 844 px viewport. Both began at scroll position
zero and produced no console or page errors.

## Claims and clean candidate checks

An isolated worktree at the implementation SHA was used. `npm ci` installed 60
packages with zero reported vulnerabilities. Every declared command in
`.factory/claims.json` was run separately from that checkout.

| Check | Result |
| --- | --- |
| `npm test` | PASS — 4/4 Vitest tests |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS — `dist/` produced |
| `npm run test:e2e` | PASS — 28/28 Playwright tests |
| Initial JS / CSS gzip | 12.52 KB / 6.22 KB |

| Claim | Result |
| --- | --- |
| `sample-sandbox` | PASS |
| `print-proof` | PASS |
| `project-transfer` | PASS |
| `local-only-video` | PASS |
| `offline-reload` | PASS |
| `project-persistence` | PASS |
| `free-page-limit` | PASS |
| `plus-page-counts` | PASS |
| `video-limits` | PASS |

The public landing page, README, privacy page, and terms page were compared
with the claims contract. No material public claim is missing a corresponding
tested claim. The product has local video import/export and the needed print
proof workflow; the researched brief does not imply an additional AI or sync
feature.

## Live product checks

Fresh live desktop and phone contexts entered the sample with one click. Each
showed 12 original pendulum frames, a populated proof, and the persistent
label “Demo — sample data, nothing is saved.” **Reset demo** restored 12 frames
and 24% onion opacity. **Start for real** removed the label and returned to an
empty real workspace with zero frames. The browser suite additionally proves
the separate demo IndexedDB namespace and that the real project is not read or
written during demo use.

The normal, invalid, boundary, and recovery paths passed in the full suite:
local 12-frame extraction; contact sheet and ordered numbered print pages with
a 22 mm binding margin; JSON transfer and refresh persistence; invalid JSON
and non-video rejection; a 60.11-second duration rejection; recovery with a
valid short WebM; free 24-page printing; and a blocked but still inspectable
and exportable 60-page free project. A recorded valid license response enabled
60-page printing; an invalid response remained locked. Chromium verified print
structure and invocation. Physical printer hardware was not available.

A dedicated, service-worker-controlled live `/demo` context reloaded while
offline and retained the offline notice, demo label, and all 12 frames. The
full suite also covers reduced motion, keyboard filmstrip navigation, skip
link/focus behavior, 200% text, mobile layout, and visible controls.

## Accessibility, routes, privacy, and deployment

- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, title, `lang=en`, one H1,
  main landmark, image alternatives, named buttons, and zero console errors
  (773 ms measured load).
- Axe found zero violations on `/`, `/demo`, `/privacy/`, `/terms/`, and
  `/404.html`; each route has its own title, one H1, and a main landmark.
- All internal links discovered across those routes returned HTTP 200. An
  unknown route returned the intended, designed HTTP 404 with a way home; that
  deliberate 404 is expected behavior.
- Live HTML, hashed JS, hashed CSS, and `sw.js` SHA-256 values exactly matched
  the fresh candidate build.
- The live CSP, Permissions-Policy, HSTS, referrer policy, `nosniff` header,
  manifest MIME type, and one-year immutable cache policy for hashed JS/CSS
  are present. The local-video claim test observed no third-party video or
  analytics request.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; FCP 0.9 s, LCP 1.2 s, TBT 0 ms, CLS 0.057.

No product backend exists. Project state is browser-local IndexedDB, so tenant
isolation, backend restart persistence, health endpoints, and 429 allowances
do not apply.

## Earlier findings

All eight findings in [the earlier verification](verification.md) are resolved
and were rechecked:

| Earlier finding | Current disposition |
| --- | --- |
| Missing claims contract | Nine declared outcome tests exist; all passed independently. |
| No sample or named audience | The first screen names the job and audience and offers the one-click sample. |
| 60-page import bypassed Plus | Free users can inspect/export 60 frames but cannot print them; a valid license can. |
| Invisible file-input stops | Native inputs are removed from sequential tab order; visible controls remain usable. |
| Locked-page focus was lost | The restore area opens and focus moves to the visible Plus purchase action. |
| Missing policy and immutable caching | CSP, Permissions-Policy, and immutable hashed-asset caching are live. |
| Persistent targets below 44 px | Browser assertions passed for header and footer controls. |
| Generic manifest MIME type | Live type is `application/manifest+json`. |

## Evidence

Evidence is stored in `/work/.evidence/`, including fresh desktop and phone
screenshots, live first-screen/demo JSON, offline JSON, route Axe JSON,
`review-1-verify/verify.json`, and `review-1-lighthouse.json`.

**Final verdict: PASS.** There are zero findings and zero untested public
claims.
