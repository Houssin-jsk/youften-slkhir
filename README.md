# Youften Slkhir

A minimal French coming-soon page built with the Next.js App Router, TypeScript, Tailwind CSS, and an original CSS/SVG honey animation. The page is statically prerendered and requires no API keys, database, or environment variables.

## Local development

Use Node.js 22 or newer (Node.js 24 LTS recommended).

```sh
npm ci
npm run dev
```

Open http://localhost:3000.

## Verification and production

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

## Vercel

Import this directory as a Next.js project, select Node.js 24.x, and use the default `npm run build` command and output settings. Commit the generated `package-lock.json` with the source for reproducible installs. Connect the official domain when ready. No deployment has been performed.

## Animation

The bee stays in a narrow corridor around the central logo and jar. Consecutive honey drops repeat at intervals of 6, 9, 12, and 8 seconds. Every interval includes the 1.35-second hover/drop window, approach, one complete logo orbit, and return. The shorter interval has a tighter, quicker orbit; the longest expands its radius by only 10 SVG-independent screen pixels and gives it more time. The clock carries elapsed time through cycle boundaries so hover and browser-frame rounding cannot accumulate timing drift. Hidden-tab suspension preserves the active timeline. Resizing blends to the new geometry without resetting the sequence. Flight and honey use cached refs rather than React renders per frame; observers, frames, and listeners are cleaned up on unmount.

Honey starts at 15% of the jar's 90-unit internal height and rises by 2.5 percentage points per landed drop, capped at 25%. It never drains or resets. Subsequent drops still produce a ripple. The wave and ripple stay below the maximum surface height. The decorative illustration represents no real progress; no percentage is displayed. Motion starts automatically independent of OS preferences. There are no animation controls, pause state, storage-based preferences, or OS reduced-motion conditionals. Animations start automatically without interaction. Hidden-tab suspension only avoids background CPU use and resumes automatically when visible.

Cormorant Garamond and DM Sans are self-hosted from Fontsource via `next/font/local`, with preloading and adjusted fallback metrics. Ambient green and gold radial gradients drift using only transforms and opacity. The logo, heading and illustration finish their staggered entrance within 1.2 seconds.

## Browser motion verification

With the production server running, use `npm run verify:motion`. Google Chrome must be installed. The script observes 80 seconds of playback on desktop (1280×800) and mobile (390×844), each with normal and reduced-motion preferences. It checks the dash-free subtitle, no controls, controlled central bounds, a full logo orbit during every interval, measured repeating 6/9/12/8-second intervals between both released and landed droplets, continuous movement, aligned drops and ripples, monotonic honey capped at 25%, post-cap deliveries, and layout stability. It also checks phone, tablet and landscape resizing. Screenshots and results are saved to the ignored `.verification/` directory. Playwright is a development dependency only.

The root `logo.png` is preserved unchanged; `public/logo.png` is an identical copy used for both the brand image and favicon.

ESLint 9 is pinned to match the peer requirements of Next.js's React, accessibility, and import plugins; these plugins do not yet declare ESLint 10 compatibility.


