# BulutWorks IPTV Player

Open-source IPTV player for LG webOS TVs. Supports M3U playlists and Xtream Codes APIs. Mediabunny pipeline.

## Features

- M3U / M3U8 playlist support
- Xtream Codes API support
- Full on-screen keyboard — no physical keyboard required
- TV-first UI: spatial navigation via `@noriginmedia/norigin-spatial-navigation`
- Single-file IPK output (all assets inlined into `index.html`)
- Dark UI tuned for 1920×1080
- English + Turkish UI (extensible via `src/i18n/`)

## Quick Start

### Prerequisites

- Node 20+
- pnpm (`npm i -g pnpm`)

### Install

```bash
cd ~/dev/bulutworks-webos-iptv
pnpm install
```

### Dev server

```bash
pnpm dev
# → http://localhost:5173
```

### Build (single-file)

```bash
pnpm build
# → dist/index.html  (fully inlined)
# → dist/appinfo.json + icon assets (copied from webos-meta/)
```

### Package IPK

Requires the [LG webOS SDK](https://webostv.developer.lge.com/sdk/installation/) (`ares-package` in PATH).

```bash
pnpm package:ipk
# → out/com.bulutworks.iptv_0.1.0_all.ipk
```

### Sideload via LG Dev Mode

1. Install the [Dev Mode app](https://webostv.developer.lge.com/develop/getting-started/testing-your-app) on your TV.
2. Enable Dev Mode and note the TV IP.
3. Register your device: `ares-setup-device`
4. Deploy: `ares-install out/com.bulutworks.iptv_0.1.0_all.ipk`

## Tech Stack

| Layer              | Library / Tool                              |
|--------------------|---------------------------------------------|
| UI                 | React 18 + TypeScript (strict)              |
| Bundler            | Vite 5 + vite-plugin-singlefile            |
| Navigation         | @noriginmedia/norigin-spatial-navigation    |
| State              | Zustand 5 (localStorage persist)            |
| Package manager    | pnpm                                        |

## Project Structure

```
src/
  App.tsx                  Norigin init + router shell
  router/                  Hash-based router + Route enum
  stores/                  Zustand settings store (source, locale, brand)
  screens/
    SplashScreen           Brand mark + 1500 ms min delay
    onboarding/
      SourceSelectScreen   M3U vs Xtream Codes card picker
      M3UEntryScreen       URL input with on-screen keyboard
      XtreamEntryScreen    Host / Username / Password entry
    HomePlaceholderScreen  Connected state placeholder (S3: live TV)
  components/
    OnScreenKeyboard       QWERTY + numeric row + special keys
    Button / TextField     Norigin-aware focus components
    BrandLogo              Placeholder mark (replace with SVG asset)
  i18n/                    en.ts, tr.ts, t() helper
  webos/                   luna.ts (Mac stub), keys.ts (key codes)
  styles/                  tokens.css (CSS vars), global.css
webos-meta/
  appinfo.json             webOS app manifest
  icon.png                 TODO — see below
  largeIcon.png            TODO — see below
scripts/
  copy-webos-meta.mjs      Post-build: copies webos-meta/ → dist/
```

## License

MIT — Copyright © 2024 Mehmet Bulut

---

## TODOs before S2 / first IPK install

| # | Item | Blocking? |
|---|------|-----------|
| 1 | **Brand icons** — `webos-meta/icon.png` (80×80 px) and `webos-meta/largeIcon.png` (130×130 px) are missing. `ares-package` will fail without them. Create PNG files and commit. | `package:ipk` only |
| 2 | **`ares-package` availability** — webOS SDK must be installed and in `PATH` for `pnpm package:ipk` to work. The dev build and Vite build both work without it. | `package:ipk` only |
| 3 | **BrandLogo SVG asset** — `BrandLogo.tsx` renders a text placeholder. Replace with an SVG logo file once brand assets are ready. | No |
| 4 | **Back-key handler** — webOS key 461 (Back) is defined in `src/webos/keys.ts` but not yet wired. Add a global `keydown` listener in `App.tsx` for S2. | No |
| 5 | **`pnpm-lock.yaml` must be committed** — CI uses `--frozen-lockfile`. Run `pnpm install` locally and commit `pnpm-lock.yaml` before pushing. | CI |
