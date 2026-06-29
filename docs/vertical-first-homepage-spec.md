# Vertical First Homepage Spec

Source mockup: `/Users/alex/.codex/generated_images/019ef520-e907-78a2-8572-f593f19f364e/ig_0fdddf266851d451016a428a5be83c8191a9827f33277f38b5.png`

Mockup canvas: `1672 x 941`.

## Direction

The homepage is a mobile/social-first news surface, not a classic blog feed.

- Primary visual unit: strict `9:16` story card.
- Card image fills the whole card.
- Text is HTML overlay over the image, not baked into the image.
- One media asset should work for both languages; text overlay changes by locale.
- Main page keeps a compact `Trending` panel and `Latest updates` strip for scanning.

## Measured Desktop Layout

Coordinates are measured from the mockup and should be treated as layout ratios, not hard-coded pixels.

| Element | x | y | w | h | Notes |
|---|---:|---:|---:|---:|---|
| Header | 0 | 0 | 1672 | 58 | Sticky, translucent black |
| Burger | 17 | 17 | 28 | 28 | Left edge action |
| Header nav | 58 | 18 | 250 | 26 | `Home`, `Archive`, `AI Models` |
| Brand | 782 | 17 | 138 | 28 | Centered, avatar + lowercase text |
| Search | 1330 | 14 | 150 | 31 | Right controls group |
| Language | 1495 | 14 | 42 | 31 | `EN` / `RU` toggle |
| Theme | 1547 | 14 | 42 | 31 | Icon button |
| Page content | 72 | 86 | 1528 | 810 | Max-width container |
| Story grid | 72 | 86 | 1120 | 610 | Three strict `9:16` cards |
| Story card 1 | 72 | 86 | 350 | 622 | `aspect-ratio: 9 / 16` |
| Story card 2 | 438 | 86 | 350 | 622 | `aspect-ratio: 9 / 16` |
| Story card 3 | 804 | 86 | 350 | 622 | `aspect-ratio: 9 / 16` |
| Card overlay | card x | card y+400 | card w | 220 | Bottom gradient, text lives here |
| Trending panel | 1220 | 86 | 380 | 610 | Right sidebar, compact text links |
| Latest updates | 72 | 742 | 1528 | 135 | Horizontal strip below first viewport cards |

## Responsive Rules

- `>= 1180px`: three `9:16` story cards + right `Trending` panel.
- `820px - 1179px`: two story cards per row, `Trending` below or as compact panel.
- `< 820px`: one story card per row, card width `min(100%, 430px)`, centered.
- Mobile cards stay `9:16`; do not collapse them into horizontal rows.
- `Latest updates` becomes a vertical compact list on mobile.

## Card Rules

- Border radius: `8px`.
- Border: `1px solid var(--border)`.
- Image: `width: 100%`, `height: 100%`, `object-fit: cover`.
- Overlay: bottom gradient from transparent to near-black.
- Text stack:
  - category pill;
  - relative time;
  - headline, max 4 lines;
  - excerpt, max 2 lines.
- If there is no image, use a dark digital placeholder with the category label.

## Media Contract

Target article cover direction: vertical-first.

- Preferred cover: `9:16`, `1080x1920`.
- Text should not be baked into generated images.
- The same visual cover should be reused for RU and EN.
- Existing horizontal media can be shown through `object-fit: cover` until the posting pipeline starts producing vertical covers.
- Long-term: posting pipeline should validate/normalize cover aspect ratio.
