# tanyelai.github.io

Personal site. Plain HTML and one stylesheet, served by GitHub Pages. No build
step: edit the file, push, done.

```
index.html            the front page: news, publications, awards, teaching
research.html         the four questions, with their figures
cv.pdf                the CV: education, positions, the full record
publications.pdf      the complete publication list
notes/                short pieces, each in English and Turkish; linked from the
                      hero, not listed on the front page
assets/style.css      the whole design system
assets/site.js        theme toggle, language toggle, figures that wait to be seen
assets/favicon.svg
assets/og.png         social card, regenerated from scripts/og.html
scripts/              Scholar refresher (see below)
data/scholar.json     last verified citation figures
```

## Design

The layout follows the academic-homepage convention that descends from
[jonbarron.github.io](https://github.com/jonbarron/jonbarron.github.io): an
800px measure, [Lato](https://fonts.google.com/specimen/Lato) at 15px,
`#1772d0` links turning `#f09228` on hover, and date-left / one-line-right
tables for everything that is a list of dated facts.

The convention is the point. A reader in the field knows where to look without
being taught, and the sections arrive in the order they are looked for: who and
where, then what is recent, then the publications, then everything else. So the
order of information is not a preference here and should not be rearranged
casually.

**Bold only.** Italics are reserved for the two places the field actually uses
them, a book title and a thesis title. Emphasis everywhere else is bold.

**One table shape.** News, awards, positions and teaching all use
`table.dated`, because they are all the same kind of fact: a date and a line.
The reader learns the shape once. Its first column is fixed at 112px and
wrapping, not `nowrap`. A long range like *Sep 2023 - Jan 2025* under `nowrap`
stretches the column and knocks every other section out of alignment with it.

**The portrait floats.** A grid column leaves a tall empty cell beside three
paragraphs of prose; a float lets the paragraphs close back over the full
measure once they clear the photo. That is why the photo comes first in source
order, which also gives the mobile stack the right order with no reordering
rule.

**Three departures from the convention.** A dark theme, because the toggle
predates the redesign; it is the same two hues lifted until they hold contrast
on a dark ground, not a second design. The four hand-drawn diagrams in
*Research*, which sit in the same shape a Barron page gives a paper thumbnail,
small square left and text right. And orange as the mark inside those diagrams,
for whatever carries the decision: the hub in a connectivity graph, the shortest
path across a decision boundary, the saliency peak beside the region a
radiologist marked, the channel everything funnels through. The figures draw
when scrolled into view.

Two toggles sit at the top right. **Light is the default**: dark is a choice,
not a system default. **English is the default**; the notes carry their Turkish
originals alongside the translations and `TR` swaps them. Both choices are kept
in `localStorage` and applied by an inline script in each `<head>` before first
paint, so the page never flashes the wrong one.

## Editing

**The CV PDF.** `cv.pdf` in the repo root, linked from two places in the hero:
the `seealso` line and the link row. Keep the filename `cv.pdf` when replacing
it, dated build names such as `TT_PhD_Academic_260903.pdf` rot every link that
points at them. The stylesheet still carries a `.pending` rule for an unlinked
placeholder; use it if a link ever has to name a document that is not up yet
rather than pointing at nowhere.

**A news item.** Add a `<tr>` at the top of `table.dated` under `News`. Use a
month only when you know it; a bare year is honest and reads fine next to one.
Keep it to a sentence.

**A new paper.** The front page carries five, not the whole record, and the
complete list lives in `publications.pdf`. So a new paper means updating that
PDF; it only joins the page if it displaces one of the five.

The six are chosen on venue, contribution and field. Currently four Q1 journal
articles, an ICML workshop oral, and a book chapter.

Three rules worth keeping. Prefer the journal version over the workshop version
of the same project; the breast-positioning work appears once for that reason,
as the Diagnostics article rather than the MICCAI workshop paper, even though
MICCAI is the better-known venue. Do not spend two slots on one line of work.
And keep at least one entry that says which research community this is aimed
at, even where he is not first author: the target is a CS PhD, four Q1 radiology
journals on their own read as a medical imaging researcher, and the ICML oral on
mechanistic interpretability is the entry that fixes that. It sits second rather
than last for the same reason, so the first two entries carry both the
first-author record and the current field.

An entry is three paragraphs: `.pub-title`, then `.authors` (his own name
wrapped in `<span class="me">`, venue in `<span class="venue">`, year), then
`.links`. Bind a `.tag` to the year before it with `&nbsp;` so a lone *Q1*
cannot be stranded on a line of its own. Link `doi`, `arXiv` and `code` where
they exist; drop the ones that don't rather than pointing at a search page.

**Numbers that grow.** Do not put a live head count on the page. It was
"roughly 60,000 people" for about a week before it was 63,000, and a figure the
reader can tell is stale costs more than no figure at all. Rounding up to a
number you have not reached yet is worse. Bands that stay true for a long time
work ("tens of thousands", "several hundred paying businesses"), and a date
never rots at all, which is why the Promake entry leans on February 2026 rather
than on a total. Fixed historical counts are fine as they are: the 400,000
mammograms and the 60,000 labelled will not change. The CV is the place for a
dated snapshot; the site is standing text.

**What does not go on the front page.** Education and employment history. No
page in this lineage carries them: jonbarron, phomarkon and Yuhui Zhang all put
the degrees and the career into the opening paragraph and leave the record to
the CV. Measured before the cut, those two sections were 31% of the page and
duplicated `cv.pdf` outright. The front page is 992 words now against 1937,
which sits beside phomarkon at 1125 and Yuhui Zhang at 1255; jonbarron and
Owens run to 5000 and 7000, but that is a hundred publications with a
description each, not prose about themselves.

The test to apply before adding anything: does it help a reader decide, in
thirty seconds, what this person is? If it is proof rather than identity, it
belongs in the CV.

**A new note.** Copy any file in `notes/` and replace the title, date and body.
Every piece of text that differs by language lives in a pair of elements marked
`data-lang="en"` and `data-lang="tr"`; keep both halves or the toggle will show
a gap. Then add it to `notes/index.html`. The front page does not list notes;
it links to `/notes/` from the hero and that is the only place to keep in step.

Careful with that attribute: the toggle sets `data-lang` on `<html>`, so the CSS
rules that hide the inactive language are descendant selectors. A bare
`[data-lang="tr"] { display: none }` matches the root element and blanks the
whole page.

**Colour or type.** Everything is a custom property at the top of
`assets/style.css`: `:root` for light, `:root[data-theme="dark"]` for dark.
Change a value once and every figure, tag and link follows.

**Bump `?v=` when the CSS changes structurally.** Every page loads
`/assets/style.css?v=N` and `/assets/site.js?v=N`. GitHub Pages serves assets
with `Cache-Control: max-age=600`, so for ten minutes after a deploy a returning
visitor can be handed the old stylesheet. A recolour survives that; a rename or
removal of class names does not, and the page renders as unstyled HTML until the
cache expires. So when class names change, bump `N` in all five HTML files at
once and the old copy can no longer be served. A tweak to values inside existing
rules needs no bump.

**The favicon.** `assets/favicon.svg` is a TT monogram drawn as four
rectangles rather than `<text>`, so no font has to resolve, on a solid blue
ground that holds against light and dark browser chrome alike. At a 16px tab
only two or three strokes survive, which rules out any of the page's diagrams.
Favicons are cached harder than anything else, so it carries the same `?v=`
query as the other assets.

**The social card.** `scripts/og.html` is a 1200×630 page; screenshot it at that
size and save the result as `assets/og.png`. Its ECG is the same idea as the
research figures one context over: the recording in grey, and the counterfactual
beat, ST elevation off the J point with a fuller T, marked in orange. The two
paths must agree at the clip edges or a seam shows.

## Scholar figures

`scripts/update_scholar.py` reads the citation, h-index and i10-index totals off
the public Scholar profile, writes them to `data/scholar.json`, and rewrites the
`data-scholar` spans in `index.html`. A daily GitHub Action runs it and commits
any change.

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
directly; the site uses root-absolute paths. Extensionless links such as
`/notes/following-distance` 404 under `http.server` but resolve on GitHub Pages;
add `.html` when checking one locally.

One URL did not survive the redesign: `/cv` used to serve `cv.html`, and the CV
is now `/cv.pdf`. GitHub Pages cannot redirect without a plugin, so an old
bookmark to `/cv` 404s.
