# Site content

Edit these files to change what the site says. No code changes needed.
A list section hides itself when its `items` list is empty.

Each language has its own folder: `en/` is English. The files below live inside it.

| File (in `en/`) | Where it shows | Item fields |
|---|---|---|
| `home.json` | The home page story: hero, chapters, organizers, finale | see the file |
| `partners.json` | Home: logo strip under the hero | `name`, `logo`, `url` |
| `testimonials.json` | Home: "In their words" cards | `quote`, `name`, `role`, `avatar` |
| `faq.json` | Home and Features: questions | `question`, `answer` |
| `navigation.json` | Navbar links (an item with `children` becomes a dropdown) | `label`, `to`, `children`, `description` |
| `features.json` | The /features page | see "Guide pages" below |
| `help.json` | The /help help center | see "Help center" below |
| `ui.json` | Small labels: footer links, "Download on", "Need a hand?", menu labels | — |
| `language.json` | The language's name in the navbar picker | `name` |

## Adding a language

1. Copy the `en` folder and name the copy with the language code, e.g. `fi` or `sv`.
2. Set the name people should see in `language.json`, e.g. `{ "name": "Suomi" }`.
3. Translate the text in the other files. Keep the keys, links (`to`) and photo names
   (`image`) as they are; only change the words.

The language then appears in the navbar picker automatically. You can translate
gradually: any file missing from the new folder falls back to English. Visitors'
choice is remembered, and first-time visitors get their browser's language if the
site has it.

Terms, Privacy and the app-link pages are English only; they are not part of this system.

## Guide pages

`features.json` has a `hero`, a list of `sections` and a closing `cta`. A hero with
an `image` shows the photo layout; without one it's a plain centered header. Sections appear in the order listed. Each has a `"type"`:

| type | Shows | Fields |
|---|---|---|
| `chapters` | Photo + text rows, zig-zagging, numbered 01, 02… (`"numbered": false` to hide numbers) | `items`: `label`, `title`, `text` (list), `image`, `imageAlt`, optional `id` (for #links), `badge`, `highlight` (dark card), `tags`, `link`, `screenshot`, `screenshotHint` |
| `features` | A grid of small cards | `items`: `title`, `text`, optional `icon`, `tag` (a small badge), `to` (makes the card a link) |
| `photo` | A full-width photo with a quote | `image`, `imageAlt`, `quote` (no title) |
| `featureGroups` | Feature cards in labelled groups, with an optional link | `groups`: `title`, `items` (`title`, `text`); optional `link` (`label`, `to`) |
| `faq` | Questions from `faq.json` (or its own `items`) | — |

Every section also takes `eyebrow`, `title` and optional `text` (list). All sections
share the same cream background and the same content width (`--content-width` in `App.css`). To make a new page, copy one of these files and add a route for it in
`src/App.js` (`<GuidePage page="your-file-name" />`).

## Help center

`help.json` has a `hero` ("How can we help?"), a list of `tabs` and a closing `cta`.

- Each tab has an `id`, a `label` (e.g. "Attending an event") and `groups`.
- A group has an optional `title` (e.g. "Single-location events") and `topics`.
- A topic has an `id`, an `icon` (see "Card icons"), a `title`, an optional one-line
  `text`, and `steps`.
- A step has a `title`, a `text`, and optionally a `screenshot` or `video` plus a
  `screenshotHint` (see "App screenshots and videos").

Topics open like FAQ questions. Links can pick a tab, `/help?tab=organizing`, or open
one topic, `/help#add-cohost` (the topic's `id`).

## Card icons

Any feature card can have an `"icon"`. Available names: `discover`, `people`, `create`,
`community`, `sparkle`, `location`, `chat`, `ticket`, `album`, `route`, `stamp`, `score`,
`invite`, `list`, `share`, `checkin`, `scan`, `star`, `pin`. Help topics use the same names. New ones are added in `src/layout/icons.js`.

## App screenshots and videos

Chapters and help center steps can show an app screenshot or a short video in a phone frame:

1. Save the screenshot in `public/screenshots/`, e.g. `public/screenshots/route-map.png`
   (a portrait phone screenshot, around 1170×2532, works best).
2. Set `"screenshot": "/screenshots/route-map.png"` on that chapter or step.
3. For a video, save a short silent MP4 (5–15 seconds, portrait) in `public/videos/`
   and set `"video": "/videos/route-map.mp4"`. It loops silently; the screenshot, if set,
   shows while it loads. Visitors who prefer reduced motion get play controls instead.

While `screenshot` is empty, `npm start` shows a dashed placeholder labelled with
`screenshotHint`, so you can see where each one goes. The live site shows the
chapter's `image` photo instead until the screenshot is added. In the help center, a
topic shows a plain numbered list on the live site until at least one of its steps has
a screenshot or video, then switches to the row of phone frames.

## Photos

`"image"` takes a photo name from `src/assets/photos/`:
`gathering`, `qr-ticket`, `tug-of-war`, `group-meetup`, `friends-phones`, `night-group`.
To add a new one, put the file in that folder and register it in
`src/assets/photos/index.js`. A path in `public/` (e.g. `"/images/new.jpg"`) also works.

## Logos and avatars

Put logos in `public/partners/` and photos of people in `public/testimonials/`,
then point to them from the JSON:

```json
{ "name": "Your Student Union", "logo": "/partners/student-union.png", "url": "https://example.com" }
```

- `logo`, `url` and `avatar` are optional. Without a logo the name is shown as text;
  without an avatar the person's initials are shown.
- Logos look best as transparent PNG or SVG, about 40px tall.
- With 6 or more partners the strip scrolls in an endless loop; with fewer it shows
  as a still, centred row so repeats aren't noticeable.

## Example entries

Items with `"example": true` are placeholders. They show when you run
`npm start`, but they are **left out of production builds**. When you add a real
entry, leave `example` out (or delete the sample entries).
