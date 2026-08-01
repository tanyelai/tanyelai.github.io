# tanyelai.github.io

Personal site. Plain HTML and one stylesheet, served by GitHub Pages. No build
step: edit the file, push, done.

```
index.html            home — profile, research, selected work, positions, notes
publications.html     complete publication list + Scholar figures
notes/                short pieces
assets/style.css      the whole design system
assets/favicon.svg
scripts/              Scholar refresher (see below)
data/scholar.json     last verified citation figures
```

## Design

One column of prose with a mono apparatus in the left margin: section labels,
dates, venues and provenance markers live in the margin, the reading column
stays clean. Type is [Newsreader](https://fonts.google.com/specimen/Newsreader)
across optical sizes with [DM Mono](https://fonts.google.com/specimen/DM+Mono)
for the apparatus.

The masthead trace is a single-lead ECG with one beat marked. The violet
appears there and nowhere else that isn't a link: it is the colour of the
counterfactual highlight bands in the ECG papers, and on this site it only ever
marks the part of a signal that carries a decision.

Light and dark both follow the system setting.

## Editing

**A new note.** Copy any file in `notes/`, change the title, date and body, then
add it to the list in `notes/index.html` and to the Notes section of
`index.html`.

**A new paper.** Add an `<li class="pub">` to `publications.html`, and to
`index.html` if it belongs in the selected eight. Link `doi`, `arxiv` and `code`
where they exist; drop the ones that don't rather than pointing at a search
page. Work with no public link stays unlinked — the venue line carries it.

**Colour or type.** Everything is a custom property at the top of
`assets/style.css`: one `:root` block for light, one `prefers-color-scheme`
block for dark. There is no theme toggle — the site follows the system, which is
one less thing to maintain and one less script to load.

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
