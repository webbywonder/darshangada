# dr5hn OS — a playable résumé

A terminal-themed, interactive résumé for **Darshan Gada** (`dr5hn`) — AI Engineer, technical innovation leader, and open-source maintainer. Open it and explore: type a command, tap a chip, or just play.

🔗 **Live:** [darshangada.com](https://darshangada.com)

> Built as a CRT-style terminal you actually *use*. A discovery meter fills as you explore sections, there's a hidden ASCII Snake, synthesized sound effects, and a scripted assistant — all with **no frameworks, no backend, and no build step**.

---

## Highlights

- **Zero dependencies** — hand-written vanilla HTML, CSS, and JavaScript. Nothing to `npm install`.
- **No backend** — everything runs in the browser. The `csc` dashboard pulls *live* numbers from the public [Country-State-City API](https://countrystatecity.in) and the GitHub API, with baked-in fallbacks.
- **Single source of truth for content** — all résumé data lives in [`data.js`](data.js). Edit a metric once and it updates everywhere it's shown.
- **CRT aesthetic** — scanlines, vignette, and flicker overlays in pure CSS.
- **Synthesized audio** — sound effects are generated with the Web Audio API at runtime; there are no audio files. Muted by default, enabled on first user gesture.
- **Playable** — a self-contained ASCII Snake where you collect cities from the CSC dataset.

---

## Commands

Type these into the prompt (or tap a suggestion chip). Tab completes, ↑/↓ walks history.

| Command            | Aliases                  | What it does                                                        |
| ------------------ | ------------------------ | ------------------------------------------------------------------- |
| `help`             | `?`, `h`                 | List everything you can do                                          |
| `whoami`           | `about`, `info`, `who`   | Intro and short bio                                                 |
| `work`             | `experience`, `jobs`, `career` | Work history                                                  |
| `projects`         | `ls`, `proj`             | Selected projects                                                   |
| `open <id>`        | —                        | Open a project's link (e.g. `open csc-api`)                         |
| `csc`              | —                        | Live Country-State-City dashboard (CSC API + GitHub stats)          |
| `skills`           | `stack`                  | Tech skills grid                                                    |
| `education`        | —                        | Education                                                           |
| `contact`          | `hire`                   | Links and what Darshan is open to                                   |
| `resume`           | —                        | Just-the-facts résumé view                                          |
| `ask <question>`   | —                        | Ask the scripted assistant (e.g. `ask are you open to work?`)       |
| `neofetch`         | —                        | neofetch-style "system specs" for a person                          |
| `theme <name>`     | —                        | Switch the colour theme                                             |
| `play snake`       | —                        | Play ASCII Snake                                                    |
| `clear`            | `cls`                    | Clear the screen                                                    |

---

## Project structure

```
darshangada/
├── index.html     # Markup, meta/OG tags, and script load order
├── terminal.css   # All styling — terminal chrome + CRT overlays
├── data.js        # Content layer: résumé data + metrics (single source of truth)
├── engine.js      # Terminal engine: command registry, boot sequence, discovery meter
├── ask.js         # Scripted assistant — curated knowledge base + fuzzy matching
├── sfx.js         # Web Audio synthesized sound effects (no audio files)
├── snake.js       # Self-contained ASCII Snake mini-game
├── favicon.svg    # Favicon / apple-touch-icon
└── og-image.png   # Open Graph / Twitter share image (1200×630)
```

Scripts load in dependency order in `index.html`: `data.js` → `ask.js` → `sfx.js` → `snake.js` → `engine.js`.

---

## Running locally

It's a static site, so any static server works. Because the `csc` command fetches external APIs, serve over HTTP rather than opening `index.html` via `file://` (avoids CORS quirks):

```bash
# Option A — Node (no install needed)
npx serve .

# Option B — Python
python3 -m http.server 8000
```

Then open the printed URL (e.g. `http://localhost:8000`).

---

## Editing content

All copy and numbers live in [`data.js`](data.js):

- The `M` constant near the top holds every headline metric. Change it once; it propagates to the bio, `neofetch`, achievements, and the `csc` grid fallbacks.
- `identity`, `work`, `projects`, `skills`, `education`, and `availability` are plain objects/arrays — add or edit entries and they render automatically.
- The `csc` dashboard overrides several numbers with live API data at runtime, so those never need manual updates.

No build or restart is needed — just refresh.

---

## Deployment

Hosted on **Cloudflare Pages** as a static site:

- **Framework preset:** None
- **Build command:** *(none)*
- **Build output directory:** `/` (repository root)

Pushing to `main` triggers an automatic deploy via the Cloudflare ↔ GitHub integration.

---

## Links

- GitHub — [github.com/dr5hn](https://github.com/dr5hn/)
- LinkedIn — [linkedin.com/in/dr5hn](https://www.linkedin.com/in/dr5hn/)
- X / Twitter — [@dr5hn](https://twitter.com/dr5hn/)
- Country-State-City — [countrystatecity.in](https://countrystatecity.in)
