---
name: phone-mock
description: Draw an animated phone mockup of a Bonfiire app screen for the website (HTML/CSS in a phone frame, playing in a loop while in view), built from an app screenshot or a description of the app UI. Use when asked for a "phone mock", "mobile mockup", "app screen animation", or to show an app screen (event page, e-ticket, explore, chat, notifications, checkpoints...) as a moving picture on a page.
---

# Animated phone mockups of the Bonfiire app

The mock is not a screenshot: the screen is rebuilt in HTML and CSS and
drawn into the real phone picture, so it stays sharp, uses the site's theme
tokens and can animate part by part.

- **The phone:** always `PhoneFrame` (`src/layout/PhoneFrame.jsx`). It lays
  the blank phone picture (`src/assets/photos/app-screens/phone-frame.webp`,
  made from `blank-mock-up-portrait.png` with its screen cut out) over the
  screen, so the bezel, corners and camera island sit on top of your drawing.
  Tilted versions (`phone-frame-tilt-left.webp` from
  `blank-mock-up-tilt.png`, and `phone-frame-tilt-right.webp`, mirrored) are
  chosen with `tilt`. Don't draw your own phone or camera island.
- **Examples:** the three mocks in `src/layout/MoreFeatures.jsx` (home,
  "There's more to Bonfiire"): `Event` (an event's page that scrolls),
  `Chat` (an event's chat) and `Notify` (a dark lock screen with
  notifications). Read that file first and copy its pattern.

## 1. Look at the screen you are drawing

- App screenshots: `src/assets/photos/app-screens/*.webp` (explore,
  event-participating, e-ticket, checkpoints). To view one, convert it to the
  scratchpad first: `sips -s format png <file>.webp --out <scratchpad>/x.png`,
  then Read the PNG.
- If the user describes a screen or pastes a screenshot, use that.
- List the screen's parts top to bottom (status bar, top bar, title, tags,
  rows, map, people, buttons). Keep the real layout and order, but simplify:
  5 to 8 parts are enough. Drop tiny details that won't read at ~280px wide.

## 2. Content goes in JSON

All words, names, dates and avatars go in `src/content/en/*.json` (home page:
`home.json`, under the section's item as `card: { ... }`), never in the
component. Document the `card` shape in the component's header comment.

Content rules (from the owner):
- Same people as the rest of the site: avatars are the photos in
  `src/assets/photos/avatars/` via `image("avatar-<name>")` (e.g. Sara Laine is
  `bookshelf`, Leo Mäkinen is `denim-jacket`, Oskar Heino is `turtleneck`).
  Reuse a person's existing name and avatar together, never swap them.
- Never say an event happens at "night". No colons or dashes inside running
  text. Dates like `Sat 18 Oct 2026, 15.00` (Finnish time format with a dot).
- New wording: write it, then list it in your reply for the owner to confirm.

## 3. The component

One component per screen, placed beside `Event`, `Chat` and `Notify` and
added to `SCENES` (or in its own file when used elsewhere). Skeleton:

```jsx
// <What the screen shows, and what happens in its round, in plain words.>
const TICKET_ROUND = [
  [500, 1],   // [ms from the round's start, step]
  [900, 2],
  [2400, 3],
  [8000, 0],  // back to the start (hidden) before the round repeats
];
const Ticket = ({ card, active }) => {
  // useRound(active, steps, roundLength, stepShownWithReducedMotion)
  const step = useRound(active, TICKET_ROUND, 8600, 3);
  const at = (n) => (step >= n ? " is-in" : "");
  return (
    <div className="fx-stage fx-stage--phone">
      <PhoneFrame view="half" time={card.time} className="fx-app">
        <div className="fx-app-page">
          <div className={`fx-app-part${at(1)}`}>…</div>
          <div className={`fx-app-part${at(2)}`}>…</div>
        </div>
      </PhoneFrame>
    </div>
  );
};
```

- `useRound` is exported from `src/layout/CheckpointScenes.jsx`; it loops the
  steps while `active` (the row is in view), resets when out of view, and
  holds the last step with reduced motion.
- `active` comes from `useReveal({ watch: true })` in the row (`Feature`).
- `PhoneFrame` props:
  - `view`: `"full"` (the whole phone) or `"half"` (its top half, the screen
    ending at the cut; inside `.fx-stage--phone` it rises from the picture's
    bottom edge and fades out there).
  - `tilt`: left out (straight on), `"right"` (turned so the screen faces
    right) or `"left"` (faces left). Draw the screen exactly as for the straight phone: it is
    laid onto the tilted screen in perspective for you. In a row with words
    beside it, turn the screen towards the words (picture on the left:
    `"right"`; on the right: `"left"`), as `Feature` in MoreFeatures.jsx
    does from the row's index. Give a tilted phone more width where
    it's placed (see `.fx-stage--phone .phone-frame--tilt`), since its
    picture has room round the phone.
  - `tone`: `"light"` (the app's screen, `--building-top`) or `"dark"` (a
    lock screen, `--night-color`): the whole screen is filled with it.
  - `time`: the status bar's clock (left of the camera island, a battery
    on the right; it stays on top when the page scrolls). Leave it out for
    a lock screen.
  - `className`: your drawing's layout class on the screen
    (`fx-app` for app pages: padding at the sides).
  - The phone's width is set where it's placed (e.g.
    `.fx-stage--phone .phone-frame`); everything inside scales with it.
- **Sizes inside the phone are in `em`.** The screen's 1em is a share of the
  phone's width (`font-size: 3.8cqw` on `.phone-frame-screen`), so use `em`
  for every font size, gap, padding, radius and avatar, never `px` or
  `rem`. About 1em is body text, 1.3em a title, 0.86 to 0.93em small labels.
  Lists inside the screen are reset from the site's `li` style already.
- Pieces to reuse (all in `layout.css`, the `.phone-frame` and `.fx-*`
  blocks):
  - light app screen: `.fx-app`, `.fx-app-bar` (back, share, menu icons),
    `.fx-app-page` (+ `.is-scrolled` to scroll it up)
  - parts: `.fx-app-part` (rises in on `.is-in`), `.fx-app-title`,
    `.fx-app-heading`, `.fx-app-text`, `.fx-app-tag` / `--yes`,
    `.fx-app-link`, `.fx-app-people` + `.fx-app-face` (pop in),
    `.fx-app-organizer`, `.fx-app-ticket` (dark pill rising at the bottom)
  - map panel: `.fx-app-place` with an `<svg viewBox>` over `APPRO_MAP`
    (`src/layout/gatheringVenues.jsx`, 1200 × 600 units) and a dropping
    `.fx-app-pin`
  - dark lock screen: `.fx-lock`, `.fx-phone-date`, `.fx-phone-time`,
    `.fx-note`
  - chat: `.fx-message`, `.fx-bubble`, `.fx-typing`
- Icons: `react-icons/fi` (Feather) for UI icons, as the rest of the site.
- Prefix new classes `fx-app-…` and add them next to the existing ones, with a
  short comment saying what the part is, matching the file's comment style.

## 4. Styling rules

- Only theme tokens from `src/App.css` `:root`, no hard-coded colours. Add a
  token there if a new colour is truly needed.
- Light boxes are `var(--building-top)`; things inside a light box (fields,
  panels, chips) are the cream `var(--primary-color)`. The light app screen
  uses `--building-top`; dark screens use `--night-color` and
  `--night-text-color`. Green for "going / checked in / hosting":
  `--yes-color` (text) and `--yes-color-light` (pill).
- The app's own text colours (from the app's theme, the owner is trying
  them out): `--app-dark` (#333333, pureDark) and `--app-mid` (#5F5F5F,
  midDark). Use `--app-mid` for the softer app text and icons, such as the
  Explore chips under the search bar (`.fx-explore-chip`); `--app-dark` for
  strong app text. In the home page's "Made for every get-together" row
  (AppHighlights) every screen uses them: `.hl-stage .phone-frame-screen`
  points `--secondary-color` and `--primary-text-color` at `--app-dark` and
  `--secondary-text-color` at `--app-mid` (the oranges, greens and reds stay;
  its map markers keep the site's brown). Other mocks (MoreFeatures, the
  Appro steps) still use the site's browns until the owner says otherwise.
- Lists inside a light box: no row backgrounds, thin `1.5px` dividers in
  `--primary-color` if needed. Rank numbers plain.
- No shadows or shine on pills, tabs or the phone.
- Text inside the phone is a picture, so it doesn't follow the site's type
  scale; keep to the `em` sizes the existing mocks use.
- Map pins must stand on a real place of their kind in the map picture (a
  park pin on a park, never on water). Check by cropping the map image with
  `sips -c <h> <w> --cropOffset <y> <x>` at three times the map units.

## 5. Animation rules

- Animate `transform` and `opacity` only; use transitions toggled by
  `.is-in` and keyframes only for loops (typing dots).
- A good round: parts come in one by one (300 to 500ms apart), one "moment"
  (a pin drops, people pop in, a button rises, the page scrolls), a hold of
  3 to 4 seconds, then reset. Total 8 to 10 seconds.
- Add every new animated class to the `prefers-reduced-motion: reduce` block
  of the `.fx-*` section (opacity 1, no transform, no transition).

## 6. Check it in the browser

Run the dev server (`npm start`, port 3000) if it isn't running. Screenshot
the mock at two moments of its round at 1440, 820, 360 and 320px widths
with Playwright (install `playwright-core` in the scratchpad and launch the
system Chrome via `executablePath`). Check:
- `document.documentElement.scrollWidth` equals the viewport width (no
  sideways page scroll);
- nothing in the phone wraps badly or overflows at 320px (use `nowrap` and
  `flex-wrap` as in `.fx-app-when`);
- on a tilted phone, the drawing follows the screen's edges and nothing
  shows outside the bezel;
- the camera island shows on top of the drawing (nothing inside the screen
  may sit above `.phone-frame-glass`);
- the parts read clearly and the key moment is not inside the faded bottom
  edge of a half phone (move it up, like `.fx-app-ticket` at `bottom: 30%`);
- no console errors.

Look at the screenshots yourself before reporting, then tell the owner what
the mock shows, what its round does, and any new wording to confirm.
