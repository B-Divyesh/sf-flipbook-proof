# Flipbook Proof

Flipbook Proof turns a short, local video into a printable frame plan for a
physical flipbook. It is for illustrators and teachers checking frame order,
onion-skin movement, and binding margins before drawing every page.

- Product: <https://flipbook-proof.sociobot.in>
- One-click sample: <https://flipbook-proof.sociobot.in/demo>

## What it does

- Reads a browser-supported MP4, WebM, or MOV without uploading the clip.
- Samples 12 or 24 frames on the free plan.
- Uses adjacent frames as an adjustable onion skin.
- Prints a contact sheet and numbered A4 or US Letter trace pages.
- Adds a 22 mm left or right binding margin and selected page order.
- Saves extracted frames and settings in IndexedDB.
- Exports and imports project JSON for backup or transfer.
- Works offline after the first visit.

Flipbook Proof Plus costs $12 once. A verified license adds 36, 48, and
60-page proof printing. Import, export, and accessibility remain free.

## Try the sample

Open `/demo` or select **Try it with sample data**. The demo loads an original
12-frame classroom pendulum study. Its IndexedDB and license keys use a
`demo:` namespace, separate from real projects.

The demo banner stays visible. **Reset demo** restores the sample. **Start for
real** deletes demo data and opens an empty real workspace.

## Run locally

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

For service-worker and offline checks, use the production preview:

```sh
npm run build
npm run preview
```

## Verify

```sh
npm ci
npm test
npx tsc --noEmit
npm run build
npm run test:e2e
```

`.factory/claims.json` lists the command and sandbox for every public claim.
Each claim test starts from the sample entry point. The browser suite also
checks desktop, 390 px mobile, keyboard use, serious or critical Axe findings,
reduced motion, privacy requests, invalid input, paid gating, and offline
reload.

The synthetic WebM fixture and pendulum sample are original repository assets.
They contain no third-party footage.

## Deploy

Deploy `dist/` as one static site. `staticwebapp.config.json` provides the
`/demo` rewrite, designed 404 response, security headers, manifest MIME type,
and immutable asset caching. The factory registers billing separately. The
repository contains no payment-provider key.

## Privacy and limits

Video processing and project storage are browser-local. Only a pasted or
returned Plus token is sent to the Sociobot verification API. Browser codec
support and printer scaling vary, so inspect one test page first.

Read [privacy](https://flipbook-proof.sociobot.in/privacy/) and
[terms](https://flipbook-proof.sociobot.in/terms/).

The researched scope is in [`.factory/brief.json`](.factory/brief.json). The
visual system and asset provenance are in [`.factory/design.md`](.factory/design.md).

## License

MIT. See [LICENSE](LICENSE).
