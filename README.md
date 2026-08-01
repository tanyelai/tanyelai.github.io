# tanyelai.github.io

Personal site. Plain HTML and one stylesheet, served by GitHub Pages. No build
step: edit the file, push, done.

```
index.html            home — profile, research, selected work, positions, notes
publications.html     complete publication list + Scholar figures
notes/                short pieces
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

The masthead trace is an ECG with one beat marked. Hover it, or tab to it, and
inside the mark the beat becomes the counterfactual: ST elevation off the J
point and a taller T, the change that would flip the decision. Nothing outside
the mark moves, which is the whole claim a counterfactual makes. It plays once
on load so the interaction announces itself.

Beside the third research theme is the same gesture one dimension up: a
mammogram field in patches, one patch marked. A band picks out an interval of a
recording; a patch picks out a region of an image.

The violet appears in those marks, in the tags, and on links under the cursor,
and nowhere else. It is the colour of the highlight bands in the ECG papers.

Light and dark follow the system unless the toggle in the nav says otherwise,
in which case the choice is kept in `localStorage`. A tiny inline script in each
`<head>` applies it before first paint so the page never flashes the wrong
theme.

## Editing

**A new note.** Copy any file in `notes/`, change the title, date and body, then
add it to the list in `notes/index.html` and to the Notes section of
`index.html`.

**A new paper.** Add an `<li class="pub">` to `publications.html`, and to
`index.html` if it belongs in the selected eight. Link `doi`, `arxiv` and `code`
where they exist; drop the ones that don't rather than pointing at a search
page. Work with no public link stays unlinked — the venue line carries it.

**Colour or type.** Everything is a custom property at the top of
`assets/style.css`: `:root` for light, a `prefers-color-scheme` block for the
system default, and `[data-theme]` blocks for an explicit choice. Change a value
once and both figures, the tags and the links follow.

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
