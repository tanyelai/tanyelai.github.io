# tanyelai.github.io

Personal site. Plain HTML and one stylesheet, served by GitHub Pages. No build
step: edit the file, push, done.

```
index.html            the front page: who, the bio, the latest news
research.html         the research map, then the papers grouped by area
publications.html     every paper, newest first, filterable; links the PDF
path.html             study, research and industry in lanes; news; mentoring and teaching
cv.pdf                the CV: education, positions, the full record
publications.pdf      the complete publication list as a document
notes/                short pieces, each in English and Turkish
assets/style.css      the whole design system
assets/site.js        toggles, the map's lines and previews, the publication filters
assets/og.png         social card, regenerated from scripts/og.html
scripts/              Scholar refresher, social card source, local preview server
data/scholar.json     last verified citation figures
```

## Design

**One calm column.** The front page says who this is, in the bio, and what is
new, in five news lines, and stops. Everything else is one click away in the
header: Research, Publications, Path, Notes, CV. The bio is never shortened.

**The research map** is the one real figure on the site. One rule groups the
papers, on the map and in the headings under it: a paper's area is what its
models work on, *Language* or *Medicine*, with a grey *Other work* for the two
projects outside both. Topics are the methods and ideas the papers use, read
from the full texts, and a topic is there only if it groups something: one that
links the same papers as another goes. Three topics are used in both areas and
sit where their outlines overlap: *Counterfactuals*, *Evaluation* (whether a
measure or an explanation shows what it claims) and *Data augmentation*. Every
paper sits inside its own area and nowhere else.

The outlines are drawn by `site.js` from the rendered boxes: each area is a soft
field around its own topics, its own papers and the topics it shares, pushed
back by everything that is not its own, so no other area's paper falls inside
it, nothing of another area reshapes it, and two areas overlap only around a
topic they share. Each line bows the way its paper's `data-bends` says, chosen
so that no line passes under a topic it does not join. The map scales to the
height of the screen, so it is seen in one look. Hovering a paper lights its
lines and topics and previews it; hovering a topic lights its papers; clicking a
paper opens it in the full list. The dashed *Causal abstraction* pill names the
current direction as a field and says nothing about the work. Below the map,
each area has a heading, one sentence, its papers, and its longer notes folded.

**Publications is the full list**, all papers newest first, filterable by
type, with the PDF a button away. The Scholar figures live here.

**Path has three lanes on one time axis**, newest at the top, because study,
research and industry ran side by side and a single list hides that. Every
block is a role and a place with its years, nothing more; ongoing ones are
orange. Under it, the news back to 2020, in one list. News is activity:
positions, launches, awards, schools. A paper appears there only when it is
top tier (NeurIPS, ICML); every other paper lives on the publications page,
where listing them belongs. Each line is short, with its month where the month
is known and only the year where it is not. Mentoring and teaching are roles,
not events, so they keep their own list.

**Type and colour.** [Newsreader](https://fonts.google.com/specimen/Newsreader)
for names, headings and the notes; [Inter](https://fonts.google.com/specimen/Inter)
for everything else. Orange is the mark for whatever carries the decision,
never a link colour: links are ink, underlined, and turn orange only on hover.
No medical figure appears anywhere, and no decorative one.

**What is private stays off.** Fields are named at the top level only. Work that
is not public yet gets no description, no question and no section.

Two toggles sit at the top right. **Light is the default**: dark is a choice,
not a system default. **English is the default**; the notes carry their Turkish
originals alongside the translations and `TR` swaps them. Both choices are kept
in `localStorage` and applied by an inline script in each `<head>` before first
paint, so the page never flashes the wrong one.

**No build step**, so the header, icon sprite and footer are written out in
each HTML file. When the header changes, change it in all eight.

## Editing

**The CV PDF.** `cv.pdf` in the repo root, linked from the header of every page.
Keep the filename `cv.pdf` when replacing it; dated build names such as
`TT_CV_260903.pdf` rot every link that points at them.

**A news item.** Add an `<li>` to the news on `path.html`, newest first, with
the date in `.when` (`Sep 2026`, or `2026` when only the year is known) and one
short sentence in `.text`. A paper earns a news line only at a top-tier venue.
If the item is one of the five newest, add it at the top of the news on
`index.html` as well and drop the last one there.

**A new paper** goes in three places, and `publications.pdf` as well.

1. `publications.html`: an `<li class="pub" id="p-NAME" data-type="TYPE">` under
   its year, newest first. `TYPE` is `conf`, `journal`, `chapter` or `preprint`;
   update the counts on the filter buttons. The entry is `.pub-title` (with the
   †, * or ◇ mark), `.pub-authors` (the site owner's name in `<span class="me">`),
   and `.pub-meta` with the venue in `<span class="venue">`, the year, an orange
   `.tag` for *oral*, *main track*, *book chapter* or *abstract*, and the links
   that exist.
2. `research.html`, the list under its area's heading: one `<li>` linking to
   `/publications#p-NAME`.
3. `research.html`, the map: one `<a class="ls-node ls-paper ls-paper--AREA">`
   with `href="/publications#p-NAME"`, `data-id`, `data-area` (`lang`, `med` or
   `other`, the same as the class), `data-topics` (space-separated topic ids),
   `data-bends` (one bow per topic, `0.1`, `-0.1` or `0`), `data-title`,
   `data-meta`, and its position as `left` and `top` percentages. Put it beside
   its topics on its own area's side, well clear of the shared topics (the other
   area's outline wraps them), with its label running into its own area: add
   `ls-left` for a label on the left. `site.js` draws its lines and redraws
   every outline around it; there is nothing else to draw. Then look: the paper
   must sit inside its own outline only, and no line may pass under a topic it
   does not join (flip that line's bow if one does). A topic has `data-home`
   (its area), or, when both areas use it, `data-regions="lang med"`.

No quartile tags: a quartile depends on the index and the year, and in JCR 2025
two of the journals here were Q2, so the tag said less than it seemed to.

**A new stop on the path.** A `.block` in the `.lanes` grid in `path.html`, in
column 2 (study), 3 (research) or 4 (industry). Its rows are counted in months
down from the top, which is October 2026: the grid row of month *m* of year *y*
is `(2026 * 12 + 10) - (12 * y + m) + 2`. A block runs from the row of its last
month to one past the row of its first. Ongoing blocks start at row 2 and carry
the class `now`. When the top needs to move forward, add the months to
`--months` and shift every row by the same amount.

**Numbers that grow.** Do not put a live head count on the page. It was
"roughly 60,000 people" for about a week before it was 63,000, and a figure the
reader can tell is stale costs more than no figure at all. Bands that stay true
for a long time work ("tens of thousands"), and a date never rots. Paper counts
are fine because they change only when a paper is added, and then they are
updated with it.

**A new note.** Copy any file in `notes/` and replace the title, date and body.
Every piece of text that differs by language lives in a pair of elements marked
`data-lang="en"` and `data-lang="tr"`; keep both halves or the toggle will show
a gap. Then add it to `notes/index.html`.

Careful with that attribute: the toggle sets `data-lang` on `<html>`, so the CSS
rules that hide the inactive language are descendant selectors. A bare
`[data-lang="tr"] { display: none }` matches the root element and blanks the
whole page.

**Colour or type.** Everything is a custom property at the top of
`assets/style.css`: `:root` for light, `:root[data-theme="dark"]` for dark,
including the three map regions. `--accent-ink` is the orange used as text; it
is darker than `--accent` so it holds 4.5:1 on paper.

**Bump `?v=` when the CSS or JS changes structurally.** Every page loads
`/assets/style.css?v=N` and `/assets/site.js?v=N`. GitHub Pages serves assets
with `Cache-Control: max-age=600`, so for ten minutes after a deploy a returning
visitor can be handed the old files. When class names change, bump `N` in all
eight HTML files at once.

**The social card.** `scripts/og.html` is a 1200×630 page: the name, the fields
and the affiliation. Screenshot it at that size and save it as `assets/og.png`.

## Scholar figures

`scripts/update_scholar.py` reads the citation, h-index and i10-index totals off
the public Scholar profile, writes them to `data/scholar.json`, and rewrites the
`data-scholar` spans in `publications.html`. A daily GitHub Action runs it and
commits any change.

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
python3 scripts/serve.py
```

Then open <http://localhost:8000>. It is the plain Python file server plus the
one rule GitHub Pages applies: `/research` serves `research.html`. Without it,
every extensionless link (`/research`, `/path`, `/notes/following-distance`)
404s locally while working fine on the live site. Use a server rather than
opening the file directly; the site uses root-absolute paths.

One URL did not survive the redesign: `/cv` used to serve `cv.html`, and the CV
is now `/cv.pdf`. GitHub Pages cannot redirect without a plugin, so an old
bookmark to `/cv` 404s.
