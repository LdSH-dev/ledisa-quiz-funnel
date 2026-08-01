# ledisa-quiz-funnel

A performance-focused, plain HTML/CSS/JS quiz funnel for Ledisa. No frameworks, no build tools.

## Running locally

Copy the env template and fill in your real values:

```bash
cp .env.example .env
# edit .env with your real Klaviyo/GTM/Pixel IDs
```

Then either:

```bash
npm run dev            # generates js/config.local.js from .env, then serves via npx serve
```

Or run the two steps by hand:

```bash
npm run build:config   # regenerate js/config.local.js after editing .env
npx serve .
```

If you skip the config build, the site still renders — `window.CONFIG` just keeps the placeholder values from `js/config.js` and any request to Klaviyo will no-op with a console warning.

## Configuration

All third-party IDs and tunable values live in `.env` and are loaded via `scripts/build-config.js` → `js/config.local.js`, which overrides the placeholder defaults in `js/config.js` at runtime.

- `GTM_CONTAINER_ID` — Google Tag Manager container
- `FB_PIXEL_ID` — Meta/Facebook Pixel
- `KLAVIYO_PUBLIC_KEY` — Klaviyo public API key
- `KLAVIYO_LIST_ID` — Klaviyo list to subscribe leads to
- `REDIRECT_URL` — where to send users after they finish the funnel
- `TOTAL_STEPS` — total number of quiz steps

`.env` and `js/config.local.js` are both git-ignored so real keys never land in the repo.

## Design tokens

CSS custom properties live in `css/tokens.css`. Colors were pulled from the live Ledisa product page's computed styles.

| Token | Value | Source |
| --- | --- | --- |
| `--color-bg` | `#FFFAF4` | Ledisa product page background |
| `--color-text` | `#121212` | Ledisa product page body text |
| `--color-text-muted` | `rgba(18,18,18,0.75)` | Ledisa muted copy |
| `--color-button-bg` | `#121212` | Primary CTA background |
| `--color-button-text` | `#FFFFFF` | Primary CTA text |
| `--color-button-secondary-bg` | `#FFFAF4` | Secondary CTA background |
| `--color-button-secondary-text` | `#121212` | Secondary CTA text |
| `--color-border` | `rgba(18,18,18,0.12)` | Hairline borders |
| `--color-accent` | `#FFC074` | Ledisa warm accent |
| `--color-teal` | `#0DE6D3` | Ledisa teal accent |
| `--font-heading` | `'Fraunces', Georgia, serif` | Stand-in for Ledisa's licensed "Recoleta Alt Medium" |
| `--font-body` | system UI stack | Native system fonts |

## Performance decisions

- **Inlined critical CSS** — tokens + base layout + progress bar are inlined in `<head>` so first paint doesn't wait on a stylesheet request.
- **Static LCP heading** — the first step's `<h1>` is real HTML in the initial payload, not injected by JS.
- **Deferred scripts** — `config.js` and `utils.js` load with `defer` so they never block parsing.
- **Preloaded font with swap** — the Fraunces stylesheet is preloaded and swapped in on load so text renders immediately with the system fallback and upgrades when the web font arrives.
- **GPU-only step animations** — step transitions use only `opacity` and `transform` (no layout thrash).
- **`prefers-reduced-motion` support** — all transitions are disabled for users who request reduced motion.
