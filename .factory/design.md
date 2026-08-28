# Flipbook Proof — visual thesis

## Direction

**Art-deco transit poster, translated into a working print room.** A flipbook is
a tiny journey measured in pages. The interface borrows the crisp route lines,
ticket punches, stepped arches and restrained optimism of 1920s–30s transit
graphics, but keeps decoration subordinate to the frames being prepared. The
main workflow reads left-to-right like a route: load, crop, pace, proof, print.
Nothing resembles a generic dashboard or gradient landing page.

The product is explicitly single-mode: a warm, daylight drafting-table theme.
It matches paper proofing, makes transparent onion skins legible, and keeps the
printed output predictable. Print styles remove all color and chrome.

## Palette

| Token | Value | Role |
| --- | --- | --- |
| `paper` | `#F4EBD8` | canvas, aged proof paper |
| `paper-bright` | `#FFF9EC` | working surfaces |
| `ink` | `#172B2B` | primary text / midnight drafting ink |
| `ink-muted` | `#52615D` | secondary text (AA on paper) |
| `rail` | `#0D5C63` | primary action / route line |
| `rail-dark` | `#083E43` | hover, high-contrast outlines |
| `coral` | `#B84937` | onion skin, warning, ticket punch |
| `gold` | `#C58B22` | selected stops and proof accents |
| `success` | `#2E6B46` | completed steps |
| `danger` | `#9E332A` | actionable errors |

All normal text combinations meet WCAG AA. Coral/gold are never used alone to
convey state; icons and copy accompany them.

## Type and spacing

- Display: self-hosted **League Spartan**, 700, geometric capitals for poster
  headings and page numerals. OFL-licensed source; subset WOFF2 only.
- Utility/body: system humanist stack (`Avenir Next`, `Segoe UI`, sans-serif),
  chosen for clarity at small sizes and zero extra font cost.
- Scale: 0.8125rem utility, 1rem body, 1.25rem label, clamp(2rem–4.5rem) display.
  Body leading is 1.55 and reading measure is capped at 68 characters.
- Spacing follows a 4/8px rhythm: 4, 8, 12, 16, 24, 32, 48, 64. Corners are
  clipped or lightly rounded (2–10px), never bubbly.

## Interaction grammar and depth

- The five workflow stops sit on one route line. Active/completed stops use a
  filled medallion plus text, so state does not depend on color.
- Surfaces layer like paper on a light table: one hard offset shadow and thin
  keyline, with onion-skin frames using true opacity.
- Primary controls use strong rail-green fields; secondary controls resemble
  outlined ticket stubs. Every interactive target is at least 44px.
- Frame thumbnails act as a horizontal film strip with roving arrow-key
  selection. The proof canvas and the current frame stay visually dominant.
- Empty, decoding, error, ready, offline and update-ready states each have
  explicit language and a next action.

## Motion policy

UI changes take 180–240ms with ease-out. A newly extracted film strip reveals
once from its source preview, and the selected-frame indicator slides along the
route. Nothing loops. Under `prefers-reduced-motion: reduce`, transitions and
scroll animation become instant while hierarchy, borders and labels retain all
state information.

## Asset plan and provenance

- `hero-workbench.webp`: original generated editorial illustration used only
  in the landing/empty state. Scene: overhead artist's workbench where a short
  film becomes numbered flipbook pages, rendered as an art-deco transit poster.
  It explains the physical end product rather than implying AI drawing.
- App icon and interface symbols are original, hand-authored SVG geometry
  based on a punched ticket, page stack and route medallion.
- User video frames are always local content and are never uploaded.

### Prompt sheet

Use case: `illustration-story`. Asset type: PWA landing hero. Subject: an
overhead drafting table with a compact strip of sequential blank figure-motion
drawings flowing into a neatly bound thumb flipbook; a hand-operated page
punch, crop marks, registration corners and one curved transit route line.
World/materials: warm toothy paper, ink, brass ruler, block-print texture.
Style: sophisticated 1930s art-deco railway poster, flat screen-print shapes,
precise geometry, sparse composition, genuinely hand-made texture. Lighting:
warm studio daylight, shallow paper relief, no photorealism. Palette: parchment,
midnight teal, oxidized rail green, brick coral, restrained brass gold.
Composition: wide 3:2, visual interest centered/right with calm space, readable
at mobile crop. Negative list: no text, letters, numbers, logos, watermark,
brand marks, gradients, glowing UI, computers, cameras, photorealistic people,
extra fingers, copyrighted characters, or finished artistic imagery that could
misrepresent automatic rotoscoping.

Generation provenance: generated 2026-08-28 with the Param Factory Azure image
deployment via `/opt/fleet/lib/gen-image.sh`; original prompt is stored beside
the source image in `assets/src/hero-workbench.json`. The shipped derivative is
WebP and is disclosed in the footer as generated artwork.

