# Flipbook Proof — verification handoff

## Result: FAIL

Independent QA on 2026-08-28 tested candidate
`6c24ce977fdc2047ecff45f9ac1a22b2d4f0dc54` at
<https://flipbook-proof.sociobot.in>. The live deployment is byte-for-byte the
candidate for the app shell, hashed JS/CSS, service worker, manifest, privacy,
and terms resources.

Release is blocked because `.factory/claims.json` is missing and the cold first
screen has no one-click sample-data demo. It also does not plainly identify the
target users (illustrators and teachers). A High defect additionally permits a
free user to import 60 image frames and print all 60 pages, bypassing the Plus
page-count entitlement.

Full evidence and reproduction details are in
[`.factory/verification.md`](verification.md).

## Verification summary

- Clean checkout: `npm ci`, 4/4 unit tests, `npx tsc --noEmit`, exact production
  build, and 9 runnable E2E tests passed; one mobile core-flow test is skipped
  by the suite. No lint task exists.
- Independent live flow: valid/corrupt/invalid media, timeline and crop bounds,
  desktop and 390 px mobile 12-frame extraction, onion skin, keyboard filmstrip,
  13-sheet reverse/right-bound print construction, JSON export/import,
  persistence, and recovery all exercised.
- Accessibility: Axe serious/critical 0, Lighthouse accessibility 100, visible
  3 px focus ring, reduced motion and 200% text smoke passed. Hidden file inputs
  remain invisible duplicate tab stops, the paid redirect has no useful focus
  target, and several navigation/legal targets are shorter than 44 px.
- PWA: manifest/installability checks passed; offline reload restored 12 frames;
  a simulated second service-worker response produced the update toast and
  entered activation through Reload/`SKIP_WAITING`.
- Privacy: source video stayed local; no analytics/tracking or unexpected
  outbound requests were observed. Privacy and terms pages are present.
- Billing: checkout now returns 303 to hosted Dodo checkout; verify CORS works;
  returned invalid tokens reconcile and cache correctly. In a 120-request
  burst, 30 returned 200 and 90 returned 429 with `Retry-After: 4`.
- Live Lighthouse: Performance 99, Accessibility 100, Best Practices 100, SEO
  100; FCP 0.9 s, LCP 1.3 s, TBT 110 ms, CLS 0.06, 69 KiB transferred.
- Bundle: JS 31,363 B, CSS 20,310 B, font 12,860 B, mobile hero 38,738 B.

## Defects by severity

- **Blocker:** missing `.factory/claims.json`.
- **Blocker:** no one-click sample demo; intended audience not plain on first
  screen.
- **High:** 60-page JSON import/print bypasses the Plus entitlement.
- **Medium:** invisible duplicate file-input tab stops.
- **Medium:** locked page-count action focuses a field inside a closed
  disclosure, leaving no useful focused destination.
- **Medium:** hashed assets have only 30-second revalidation caching; CSP and
  Permissions-Policy are absent.
- **Medium:** persistent nav/legal targets below the supplied 44 px baseline.
- **Low:** web manifest is served as `application/octet-stream`.

## Re-run

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
npm run test:e2e
/opt/fleet/lib/verify-url.sh https://flipbook-proof.sociobot.in /tmp/flipbook-proof-evidence
```

No product code was modified during verification. Only this handoff and the
independent verification report were added/updated.
