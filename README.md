# Lab Notes

A daily journal site for [Outliers](https://far-horizons-co-op.itch.io/outliers), a single-person RPG. One entry per day, formatted as formal lab reports.

## Writing a new entry

Run `./new-entry.sh` to generate the next entry with a blank template:

```
./new-entry.sh
# Created entries/003.md
```

This auto-detects the next sequential number, creates the file with all frontmatter fields pre-filled, and opens at the `## Observations` section ready to write.

The site auto-discovers entries by loading `001.md`, `002.md`, `003.md`, etc. in order until one fails to load. No manifest or config to update.

### Entry format

```markdown
---
id: 003
day: 003
protocol: STANDARD
specimen: 0041
status: IN PROGRESS
incidents: 0
notableEvents: 0
budgetStart: $14,200.00
budgetEnd: $13,800.00
aceTokens: 0
aceSuit: "—"
rot: 0
title: Entry Title Here
addendum: Optional. Rendered as a side-note block. Remove this key to skip it.
researcher: "[ILLEGIBLE]"
reviewer: PENDING
---

## Observations

Your writing goes here. Use standard Markdown formatting.

Each paragraph is separated by a blank line.

## Another Section

Add as many `##` sections as you want. Name them whatever fits the narrative.
```

### Frontmatter fields

| Field | Description |
|-------|-------------|
| `id` | Sequential entry number, zero-padded to 3 digits |
| `day` | Day number, same as `id`. Used in the document number (e.g. `LN-2026-003`) and displayed in the index and metadata grid |
| `protocol` | Whatever fits the story |
| `specimen` | Whatever fits the story |
| `status` | Whatever fits the story |
| `incidents` | Incident count |
| `notableEvents` | Number of notable events for the day |
| `budgetStart` | Budget at start of the day |
| `budgetEnd` | Budget at end of the day |
| `aceTokens` | Number of ace tokens |
| `aceSuit` | Ace suit (e.g. Spades, Hearts, or `"—"` if none) |
| `rot` | Digital rot level (0–10). Higher values degrade the entry visually |
| `title` | Entry title shown in the index and header |
| `addendum` | Optional string, rendered as a callout block |
| `researcher` | Signature line for the researcher |
| `reviewer` | Signature line for the reviewer |

### Markdown in content

Section content uses standard Markdown. The built-in parser supports:

- `**bold**` — strong emphasis
- `*italic*` or `_italic_` — emphasis
- `- item` — unordered lists
- `1. item` — ordered lists
- `> text` — blockquotes
- Paragraphs separated by blank lines

Sections are defined by `## Heading` lines. Each heading starts a new section block in the rendered entry.

## Running locally

Any static file server works. For example:

```
cd lab-notes
python3 -m http.server 8090
```

Then open `http://localhost:8090`.

## Navigation

- Click entries in the index to open them
- **Left/Right arrow keys** to move between entries
- **Escape** to return to the index
- URL hash updates per entry (e.g. `#entry-002`) so links to specific entries work

## Design

Black and white. IBM Plex Mono. Respects system dark/light mode. Inspired by Dieter Rams and late-90s corporate documentation. Entries with higher `rot` values progressively degrade with visual glitches and distortion.
