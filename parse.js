/**
 * PARSE — Markdown + YAML frontmatter parser
 * Lightweight, no dependencies.
 */

const PARSE = (() => {

  // ── YAML frontmatter (simple flat key:value + sections array) ──

  function parseFrontmatter(raw) {
    const meta = {};
    const lines = raw.split('\n');
    let currentKey = null;
    let inSections = false;
    let currentSection = null;

    for (const line of lines) {
      // Top-level key: value
      const kvMatch = line.match(/^(\w[\w\s]*?):\s*(.+)$/);
      if (kvMatch && !inSections) {
        const key = kvMatch[1].trim();
        const val = kvMatch[2].trim().replace(/^["']|["']$/g, '');
        meta[key] = val;
        currentKey = key;
        continue;
      }

      // Sections array start
      if (line.match(/^sections:\s*$/)) {
        meta.sections = [];
        inSections = true;
        continue;
      }

      if (inSections) {
        // New section item: - heading: "Observations"
        const sectionMatch = line.match(/^\s*-\s*heading:\s*["']?(.+?)["']?\s*$/);
        if (sectionMatch) {
          if (currentSection) meta.sections.push(currentSection);
          currentSection = { heading: sectionMatch[1], contentKey: null };
          continue;
        }
        // Section content key reference: content: observations
        const contentMatch = line.match(/^\s*content:\s*(\w+)\s*$/);
        if (contentMatch && currentSection) {
          currentSection.contentKey = contentMatch[1];
          continue;
        }
      }
    }

    if (currentSection) meta.sections.push(currentSection);
    return meta;
  }

  // ── Markdown to HTML (subset) ──

  function md(text) {
    let html = text;

    // Blockquotes (before paragraphs)
    html = html.replace(/^>\s*(.+)$/gm, '<blockquote>$1</blockquote>');
    // Merge adjacent blockquotes
    html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n');

    // Unordered lists
    html = html.replace(/(?:^[-*]\s+.+\n?)+/gm, (match) => {
      const items = match.trim().split('\n').map(
        line => `<li>${line.replace(/^[-*]\s+/, '')}</li>`
      ).join('');
      return `<ul>${items}</ul>`;
    });

    // Ordered lists
    html = html.replace(/(?:^\d+\.\s+.+\n?)+/gm, (match) => {
      const items = match.trim().split('\n').map(
        line => `<li>${line.replace(/^\d+\.\s+/, '')}</li>`
      ).join('');
      return `<ol>${items}</ol>`;
    });

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Paragraphs: split on double newlines
    html = html.split(/\n{2,}/).map(block => {
      block = block.trim();
      if (!block) return '';
      // Don't wrap blocks that already start with HTML tags
      if (/^<(ul|ol|blockquote|li|p|h[1-6]|div)/.test(block)) return block;
      return `<p>${block.replace(/\n/g, ' ')}</p>`;
    }).join('\n');

    return html;
  }

  // ── Parse a full .md entry file ──

  function parseEntry(raw) {
    // Split frontmatter from body
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!fmMatch) return null;

    const meta = parseFrontmatter(fmMatch[1]);
    const body = fmMatch[2];

    // Split body into named sections using ## headings
    const sections = [];
    const sectionRegex = /^##\s+(.+)$/gm;
    const headings = [];
    let match;
    while ((match = sectionRegex.exec(body)) !== null) {
      headings.push({ heading: match[1], index: match.index, len: match[0].length });
    }

    if (headings.length === 0) {
      // No headings — treat entire body as a single section
      sections.push({ heading: 'Notes', content: md(body.trim()) });
    } else {
      // Content before first heading (if any) becomes preamble
      const preContent = body.substring(0, headings[0].index).trim();
      if (preContent) {
        sections.push({ heading: 'Notes', content: md(preContent) });
      }

      for (let i = 0; i < headings.length; i++) {
        const start = headings[i].index + headings[i].len;
        const end = i + 1 < headings.length ? headings[i + 1].index : body.length;
        const content = body.substring(start, end).trim();
        sections.push({ heading: headings[i].heading, content: md(content) });
      }
    }

    return {
      id: meta.id || '000',
      day: meta.day || meta.id || '000',
      protocol: meta.protocol || 'STANDARD',
      specimen: meta.specimen || '----',
      status: meta.status || '',
      title: meta.title || 'Untitled',
      incidents: meta.incidents || '0',
      budgetStart: meta.budgetStart || meta.budget || '—',
      budgetEnd: meta.budgetEnd || '—',
      notableEvents: meta.notableEvents || '0',
      aceTokens: meta.aceTokens || '0',
      aceSuit: meta.aceSuit || '—',
      rot: parseFloat(meta.rot) || 0,
      addendum: meta.addendum || null,
      signatures: {
        researcher: meta.researcher || '',
        reviewer: meta.reviewer || 'PENDING',
      },
      sections,
    };
  }

  return { parseEntry, md };
})();
