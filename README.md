# tanyelai.github.io

Personal site. Plain HTML and one stylesheet, served by GitHub Pages. No build
step: edit the file, push, done.

```
index.html            home — profile, research, selected work, positions, notes
cv.html               the full record: education, positions, awards, teaching
publications.html     complete publication list + Scholar figures
notes/                short pieces, each in English and Turkish
assets/style.css      the whole design system
assets/site.js        theme toggle, and figures that wait to be seen
assets/favicon.svg
assets/og.png         social card, regenerated from scripts/og.html
scripts/              Scholar refresher (see below)
data/scholar.json     last verified citation figures
```

## Design

One column of prose with a mono apparatus in the left margin: section labels,
dates, venues and provenance markers live in the margin, the reading column
stays clean. Type is [Newsreader](https://fonts.google.com/specimen/Newsreader)
across optical sizes with [DM Mono](https://fonts.google.com/specimen/DM+Mono)
for the apparatus.

The masthead is an ECG with one beat marked. The page draws the recording, lights
the mark, and settles on the counterfactual: ST elevation off the J point and a
fuller T, the change that would flip the decision. The switch under the mark puts
the original recording back. The counterfactual is clipped to the mark, so nothing
outside it can move, which is the whole claim the method makes.

The switch is a hidden checkbox with a styled label, not a scripted button, so it
works with no JavaScript, on touch, and from the keyboard. The question beside it
(*what would have had to be different?*) is there so a reader who has never met
the word can still tell what they are looking at.

Each research theme carries a marginal figure doing the same thing one context
over: the shortest path across a decision boundary, the hub in a connectivity
graph, the marked region in a mediolateral oblique mammogram. They draw when
scrolled into view.

The violet appears in those marks, in the tags, and on links under the cursor,
and nowhere else. It is the colour of the highlight bands in the ECG papers.

Two toggles sit at the end of the nav. **Light is the default** — dark is a
choice, not a system default. **English is the default**; the notes carry their
Turkish originals alongside the translations and `TR` swaps them. Both choices
are kept in `localStorage` and applied by an inline script in each `<head>`
before first paint, so the page never flashes the wrong one.

## Editing

**A new note.** Copy any file in `notes/` and replace the title, date and body.
Every piece of text that differs by language lives in a pair of elements marked
`data-lang="en"` and `data-lang="tr"`; keep both halves or the toggle will show a
gap. Then add it to `notes/index.html` and to the Notes section of `index.html`,
in both languages there too.

Careful with that attribute: the toggle sets `data-lang` on `<html>`, so the CSS
rules that hide the inactive language are descendant selectors. A bare
`[data-lang="tr"] { display: none }` matches the root element and blanks the
whole page.

**A new paper.** Add an `<li class="pub">` to `publications.html`, and to
`index.html` if it belongs in the selected eight. Link `doi`, `arxiv` and `code`
where they exist; drop the ones that don't rather than pointing at a search
page. Work with no public link stays unlinked — the venue line carries it.

**A new position or award.** `cv.html` holds the full record; `index.html` shows
a compact grouped list and links to it. Keep the compact list to one line an
entry — the detail belongs on the CV page.

**Colour or type.** Everything is a custom property at the top of
`assets/style.css`: `:root` for light, `:root[data-theme="dark"]` for dark.
Change a value once and every figure, tag and link follows.

**The ECG paths.** They are generated, not drawn: a sum of Gaussians for P, Q,
R, S and T, with the counterfactual adding a smooth plateau off the J point and
a larger T. The two paths must agree at the clip edges or a seam shows. The
generator is not kept in the repo — the paths are static data now — but the
morphology is described above if it ever needs redoing.

## Scholar figures

`scripts/update_scholar.py` reads the citation, h-index and i10-index totals off
the public Scholar profile, writes them to `data/scholar.json`, and rewrites the
`data-scholar` spans in the HTML. A daily GitHub Action runs it and commits any
change.

Scholar has no API and rate-limits datacentre IPs, so runs will fail sometimes.
That is handled rather than fought: on a blocked fetch, or on numbers that look
implausible (a non-positive value, or citations dropping more than 15%), the
script leaves the committed figures alone and exits 0. The page always shows the
last verified numbers next to the date they were verified.

To make it succeed more often, add a [SerpApi](https://serpapi.com) key as the
`SERPAPI_KEY` repository secret; the script uses it as a fallback. Without it
the script still works, just less reliably.

Run it by hand any time:

```sh
python3 scripts/update_scholar.py
```

## Local preview

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Use a server rather than opening the file
directly — the site uses root-absolute paths.
