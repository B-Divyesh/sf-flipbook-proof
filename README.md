# Flipbook Proof

Flipbook Proof turns a short, local video into a printable plan for a physical
flipbook. It is for illustrators and teachers who want to settle framing,
exposure, page order, and binding margins before drawing every sheet.

Live product: <https://flipbook-proof.sociobot.in>

## What it does

- Reads MP4, WebM, and MOV clips supported by the browser without uploading
  them.
- Samples 12 or 24 frames on the free plan; a one-time Plus license unlocks
  36, 48, and 60-frame plans.
- Crops a consistent drawing window and previews previous/next frames as an
  adjustable onion skin.
- Prints an A4 or US Letter contact sheet plus numbered trace pages with a
  22 mm left- or right-binding margin and selectable stack order.
- Saves extracted frames and settings in IndexedDB. Project JSON export/import
  lets the user make backups or move devices.
- Installs as an offline PWA. The source clip itself is never retained.

## Run locally

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

Open the local URL shown by Vite. For the installable/offline path, use a
production preview:

```sh
npm run build
npm run preview
```

## Verify

```sh
npm test          # unit tests
npm run build     # reproducible static output in ./dist
npm run test:e2e  # Chromium desktop + 390 px mobile, axe and offline checks
```

The end-to-end suite uses a tiny original synthetic test clip in
`tests/fixtures/`; it contains no third-party footage. Playwright 1.58.2 is
pinned as required by the build environment.

## Deploy

Deploy the contents of `dist/` as a static site with SPA fallback to
`index.html`. `/privacy/` and `/terms/` are emitted as standalone pages. The
factory registers the Sociobot product separately; this repository contains no
payment-provider keys or product IDs.

## Privacy and limitations

Video processing and frame persistence are browser-local. Only a pasted or
returned Plus token is sent to the Sociobot verification API. Browser codec
support varies—H.264 MP4 and WebM are the most reliable choices. Read the full
[privacy policy](https://flipbook-proof.sociobot.in/privacy/) and
[terms](https://flipbook-proof.sociobot.in/terms/).

The researched scope is in [`.factory/brief.json`](.factory/brief.json) and the
original visual system and image provenance are in
[`.factory/design.md`](.factory/design.md).

## License

MIT. See [LICENSE](LICENSE).
