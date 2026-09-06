# Flipbook Proof — independent verification 2

**Verdict: PASS**

- **Findings:** 0 (blocker 0, high 0, medium 0, low 0)
- **Untested public claims:** 0
- **Candidate reviewed:** `5caa3def7f78867b40210a9c22cca9aaff9b44f1`
- **Documentation reviewed:** `6f7765b4c6c2d63b6176f8a51bfcc3ef44038fa5`
- **Live URL:** <https://flipbook-proof.sociobot.in>
- **Verified:** 2026-09-06 UTC
- **Work order:** `flipbook-proof-verify-2`

## First screen

Before scrolling, fresh desktop (1280 × 720) and phone (390 × 844) contexts
both showed:

- **Job:** “Turn video into printable flipbook trace sheets.”
- **Audience:** illustrators and teachers checking frame order and binding
  margins before drawing.
- **First action:** **Try it with sample data**, which says it loads a
  12-page movement study.

The final fact ended at 718 px of 720 px on desktop and 841 px of 844 px on
phone. There was no initial scroll and no console or page error.

## Clean candidate checks

An isolated worktree detached at the implementation SHA was used. `npm ci`
completed with 60 packages and zero reported vulnerabilities.

| Check | Result |
| --- | --- |
| `npm test` | PASS — 4/4 |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS — `dist/` created |
| `npm run test:e2e` | PASS — 28/28 |
| Initial JS / CSS gzip | 12.52 KB / 6.22 KB |

All declared claim commands were invoked separately from that clean checkout.

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

This covers the 12-frame isolated sample, print contact sheet/trace-page order
and 22 mm margin, JSON transfer, local-only request behavior, offline reload,
refresh persistence, free/Plus page enforcement, and invalid-input recovery.
The public page, README, privacy page, and terms page were cross-checked
against `.factory/claims.json`; no unlisted material product claim was found.

## Live checks

- The live HTML, hashed JavaScript, and hashed CSS SHA-256 values exactly
  matched the fresh candidate build.
- The one-click sample loaded 12 realistic pendulum frames and a visible proof.
  The persistent banner said “Demo — sample data, nothing is saved.” Reset
  returned the original opacity of 24% after its asynchronous seed completed;
  Start for real removed the banner and showed an empty real workspace.
- A dedicated service-worker-controlled context reloaded `/demo` while offline
  and retained the banner and all 12 frames.
- `/privacy/`, `/terms/`, and `/404.html` returned 200 with their own titles,
  one H1, and a main landmark. An unknown URL deliberately returned a designed
  HTTP 404, which is expected behavior.
- `verify-url.sh` passed: HTTP 200, title, `lang=en`, one H1, main landmark,
  image alt coverage, named buttons, and zero console errors (674 ms load).
- Axe on live `/demo` returned zero violations. The full browser suite covers
  keyboard flow, visible focus, touch targets, invalid media, recovery,
  reduced motion, privacy requests, page limits, and print structure.
- The live CSP, Permissions-Policy, manifest MIME type, and immutable caching
  for hashed assets were present. No product backend exists; project data is
  browser-local IndexedDB, so tenant/restart/rate-limit checks do not apply.
- Lighthouse mobile, rerun after providing the preinstalled Chromium binary:
  Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s,
  LCP 1.3 s, TBT 30 ms, CLS 0.057.

## Earlier findings

All eight findings in `verification.md` are resolved and independently
rechecked: the claims contract and demo are present; the audience and action
are above the fold; the 60-page paid boundary blocks printing but keeps
inspection/export available; hidden input tab stops and the paid-gate focus
target are fixed; persistent targets meet the size requirement; CSP,
Permissions-Policy, immutable caching, and the manifest content type are live.

## Evidence and limitation

Evidence is in `/work/.evidence/`: desktop and phone cold/demo screenshots,
`verify-url-2/verify.json`, `lighthouse-verify-2.json`, and the clean-run
claim and E2E logs in `/tmp/flipbook-verify-2-claims.log` and
`/tmp/flipbook-verify-2-e2e.log`.

No physical printer hardware was available. Chromium verified invocation,
contact sheet, page count/order, print media structure, and the 22 mm binding
margin. This is a documented environmental limitation, not an untested public
claim.
