# DinoRydeWeb

Marketing and App Store Connect support site for **DinoRyde**, a first-person
dinosaur riding game for iPhone, iPad and Mac ([DinoRyde](../DinoRyde)).

Vite + Vue 3. The page text is static HTML (crawlable, works without JS); Vue
mounts small interactive "islands" on top of it. No tracking, no cookies, no
third-party requests.

## Pages

| Path       | File           | Purpose                                                |
| ---------- | -------------- | ------------------------------------------------------ |
| `/`        | `index.html`   | Landing: playable ride, mounts, trails, skins, screens |
| `/support` | `support.html` | App Store Connect **Support URL** (FAQ + contact)      |
| `/privacy` | `privacy.html` | App Store Connect **Privacy Policy URL**               |
| any 404    | `404.html`     | Not-found page, served with a real 404 status          |

## Interactive islands (`src/components`)

| Island          | What it does                                                                 |
| --------------- | ---------------------------------------------------------------------------- |
| `RideDemo`      | Canvas pseudo-3D trail with the game's HUD. Gaits 1 N 2 3 4 5, breath, logs to hop. Autorides until touched. Keys: W/S, Q/E, Space |
| `MountPicker`   | The six mounts with the game's own stat bars; selecting one saddles it in the ride |
| `TrailPicker`   | Quiet Trail / Herd Country / Stampede with obstacle density and a running strip |
| `SkinPicker`    | Free, bright, custom (colour picker) and metallic skins on a scale swatch     |
| `ScreenGallery` | iPhone/Mac screenshots with a keyboard- and swipe-friendly lightbox          |

All motion respects `prefers-reduced-motion` (no autoride, no reveals, no drift).

## Design

Colours come straight from the game's `Assets/DinoRyde/Scripts/UI/Theme.cs`:
ink `#0e120b`, panel `#151b11`, bone `#f2e9d3`, fern `#9ccb5b` (the one
accent), earth `#c8925a`, leather `#3b2716`, danger `#e05a3a` (breath only).
Radii match the game (14 buttons, 16 cards). Mount stats are
`MountInfo.Stats`; mount, trail and gait names use the game's `Loc.cs` wording
in every language.

## Languages

English, Slovak, Czech. Strings live in `src/i18n/{en,sk,cs}.js`; static
markup uses `data-i18n` (or `data-i18n-html` when a string carries a link),
islands call `t()`. Titles and descriptions swap via `meta.<page>.*`. The
choice is stored in `localStorage` only.

```sh
npm run check   # every key in all three languages, every used key defined
```

## Develop

```sh
npm install
npm run dev       # Vite dev server, http://localhost:5173
npm run preview   # production build + local server mirroring netlify.toml (rewrites, 404, CSP)
```

## Address and hosting

The public URL is set once in `site.config.js` (default
`https://dinoryde.netlify.app`) or with a `SITE_URL` environment variable at
build time. Canonicals, Open Graph, JSON-LD, `robots.txt` and `sitemap.xml` are
all generated from it, so moving hosts is one change.

- **Netlify**: build `npm run build`, publish `dist` (already in `netlify.toml`
  with the clean-URL rewrites, 404 fallback and security headers).
- **Elsewhere** (Cloudflare Pages, Vercel, GitHub Pages): same build and output
  folder; recreate the `/support` and `/privacy` rewrites and the headers.

## App Store

Not live yet, so every CTA is a "Coming soon to the App Store" placeholder.
Once the listing exists, swap the placeholder spans (comment in `index.html`)
on all four pages, and add `downloadUrl` and `offers.url` to the JSON-LD.
Then paste into App Store Connect:

- Support URL: `<site>/support`
- Marketing URL: `<site>/`
- Privacy Policy URL: `<site>/privacy`

## Assets

- `public/assets/screenshots/` — from `~/Desktop/DinoRyde-AppStore`, scaled to
  ~1434 px wide JPEG (`sips -s format jpeg -s formatOptions 82 -Z 1434`).
- `icon.png`, `apple-touch-icon.png`, `favicon.png` — downscales of the game's
  `Assets/DinoRyde/Icons/AppIcon.png`.
- `og-image.jpg` — `python3 scripts/make-og.py` (needs Pillow).

## Branches

`main` is what deploys. Work happens on `develop` via `feature/*` branches
merged with `--no-ff`, matching the game repo.
