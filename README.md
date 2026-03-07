# Lab Notes

A daily journal site for [Outliers](https://far-horizons-co-op.itch.io/outliers), a single-person RPG. One entry per day, formatted as formal lab reports.

## Writing a new entry

Add a JSON file to `entries/` named with a zero-padded sequential number:

```
entries/003.json
```

The site auto-discovers entries by loading `001.json`, `002.json`, `003.json`, etc. in order until one fails to load. No manifest or config to update.

### Entry format

```json
{
  "id": "003",
  "date": "2026.03.08",
  "dayOfYear": "067",
  "protocol": "STANDARD",
  "specimen": "0041",
  "status": "IN PROGRESS",
  "title": "Entry Title Here",
  "sections": [
    {
      "heading": "Observations",
      "content": "<p>Your writing goes here. Use HTML tags for formatting.</p><p>Each paragraph in a &lt;p&gt; tag.</p>"
    },
    {
      "heading": "Another Section",
      "content": "<p>Add as many sections as you want. Name them whatever fits the narrative.</p>"
    }
  ],
  "addendum": "Optional. Rendered as a side-note block. Remove this key to skip it.",
  "signatures": {
    "researcher": "[ILLEGIBLE]",
    "reviewer": "PENDING"
  }
}
```

### Metadata fields

| Field | Description |
|-------|-------------|
| `id` | Sequential entry number, zero-padded to 3 digits |
| `date` | In-world date, format `YYYY.MM.DD` |
| `dayOfYear` | Day number (used in the document number, e.g. `LN-2026-067`) |
| `protocol` | Whatever fits the story |
| `specimen` | Whatever fits the story |
| `status` | Whatever fits the story |
| `title` | Entry title shown in the index and header |
| `sections` | Array of `{ heading, content }` — content is HTML |
| `addendum` | Optional string, rendered as a callout block |
| `signatures` | Optional `{ researcher, reviewer }` shown at the bottom |

### HTML in content

Section content uses raw HTML. Common patterns:

- `<p>Paragraph</p>` — paragraphs
- `<em>italic</em>` — emphasis
- `<strong>bold</strong>` — strong emphasis
- `<ul><li>item</li></ul>` — lists
- `<blockquote>text</blockquote>` — indented quote

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

Black and white. IBM Plex Mono. Respects system dark/light mode. Inspired by Dieter Rams and late-90s corporate documentation.
