# Bonfiire website

Marketing and deep-link website for **Bonfiire**, an event organizing app.
React (Create React App) + React Router, deployed to Firebase Hosting.

The app hosts two kinds of events, and the site should present both:

- **Single-location events**: everything happens in one place (a party, a meetup, a game night).
- **Multi-location events ("Appro")**: a route of checkpoints that groups walk through, with
  hosts, games, points and stamps (e.g. "In nature", "Bar crawl", "City hopper").
  Each has its own page at `/appro/:slug` (content in `src/content/en/appro.json`, map chosen
  in `src/layout/approMaps.js`).

Students are the main audience, but keep wording open to other groups.

## Do not change unless explicitly asked

- **Deep links**: the `/events/...`, `/userprofile/...`, `/messages/...`, e-ticket and
  self-check-in routes in `src/App.js`, `EventDetailsPage.js` (fallback to `/download`),
  and `public/.well-known/*` (apple-app-site-association, assetlinks.json) plus the
  `build:*` scripts that copy them. Keep this logic working exactly as it is.
- **Download page** (`src/pages/Tester/DownloadAppPage.js`) and store links in `src/downloadData.js`.
- **Privacy** (`src/components/Privacy`) and **Terms** (`src/components/Terms`) text.
- Don't re-add a Download button to the navbar (removed on purpose).

## Design and theme

- Colors, radius, spacing and type sizes live as CSS variables on `:root` in `src/App.css`
  (`--primary-color`, `--primary-color1`, `--secondary-color`, `--accent-text-color`,
  `--text-*`, `--radius`, `--section-space`, `--content-width`). Keep the primary color and
  the other theme colors; always use these variables instead of hard-coded values, and add
  new tokens there if needed.
- Use the five-size type scale (`--text-page`, `--text-section`, `--text-item`, `--text-info`,
  `--text-chip`); don't invent new font sizes.
- **Responsive**: every page must work from ~320px phones to wide desktops, with no horizontal
  page scroll. Check phone, tablet and desktop widths after a layout change.
- **Avatars and illustrations are SVG** (inline React SVG components, like `BonfireScene.jsx`
  and the `Person` part in `eventMap.jsx`), not photos or raster images. Reuse existing
  SVG parts so people look the same across the site.
- Style rules from the owner: no shiny effects, selected pills/tabs are flat with no shadows,
  no uppercase labels, section titles left-aligned, cards only for clickable things.
- Never describe events as happening at "night"; events can be at any time of day.
- Keep existing text unless a change is needed; when rewriting copy, suggest wording first.

## Animation

- Use animation generously: cards, sections and layouts should animate in (reveal on scroll,
  hover/press feedback on cards, staggered lists), and page/route and tab/state changes
  should have **transitions**, not hard cuts.
- Existing helpers: `useReveal.js` with the `.reveal` / `.is-visible` classes in
  `src/layout/layout.css`. Extend these before adding new mechanisms.
- Prefer CSS transitions/animations on `transform` and `opacity` (GPU-friendly); avoid
  animating layout properties (width, height, top, left).
- Always respect `prefers-reduced-motion: reduce` (follow the existing blocks in
  `layout.css`): reduce or disable motion, but keep content visible.

## Event maps (SVG)

- Maps: `ParkEventMap.jsx`, `BarCrawlMap.jsx`, `CityHopperMap.jsx` (Appro), and
  `GatheringMap.jsx` (single-location: guests arrive, check in at the entrance and fill
  the venue; venues such as concert and house party are drawn in `gatheringVenues.jsx`
  and switched by `GatheringShowcase.jsx`), sharing the engine and parts in
  `src/layout/eventMap.jsx`
  (`createRelay`, `Person`, `Signposts`, `Walkers`, `Games`, `LiveFeed`, `MapFrame`).
  CSS uses the `.route-*` classes.
- These are already built. Change them **precisely**: touch only what the request is about,
  and don't alter other SVG props (coordinates, viewBox, transforms, ids), the relay/walker
  timing logic, or the other maps' shared parts as a side effect.
- The route map keeps its slanted (`rotateX`) tilt on phones too.
- Rejected before on the Appro park map, don't re-add there: route lines, swing,
  stage/chairs, cheer squad. (The single-location map has a stage on purpose.)

## Content

- Site text lives in `src/content/en/*.json` (see `src/content/README.md`); edit text there,
  not in components. Other languages go in sibling folders and fall back to English.

## Libraries

- When adding or upgrading a dependency, use the **latest stable version** (check npm, avoid
  beta/rc/canary) and make sure it is compatible with the rest of the stack. Suggest upgrades
  when an installed library is outdated. Ask before adding a large new dependency
  (e.g. an animation library) when CSS can do the job.

## Workflow

- Scripts: `npm start` (dev), `npm run build:dev | build:staging | build:prod`.
- Verify changes in the browser at phone and desktop widths before calling them done.
- Work on a branch; the owner commits themselves. Don't commit or push unless asked.
- The owner prefers a recommendation with options first, then small visual iterations.
