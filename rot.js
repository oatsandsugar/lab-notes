/**
 * ROT ENGINE — Procedural Digital Decay
 *
 * Uses entry ID as seed, rot level (0-10) as intensity.
 * Two pages at the same rot level will decay differently.
 * Same page always decays the same way (deterministic).
 */

const ROT = (() => {

  // ── Seeded PRNG (mulberry32) ──

  function makeRng(seed) {
    let s = seed | 0;
    return () => {
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seedFromId(id) {
    let h = 0;
    const s = String(id);
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return h;
  }

  // ── Glitch character pools ──

  const GLITCH_LIGHT = '\u00b7\u00b6\u00a7\u00a4\u00ac\u00b1\u00d7';
  const GLITCH_MED = '\u2588\u2591\u2592\u2593\u2580\u2584\u258c\u2590\u2502\u2500';
  const GLITCH_HEAVY = '\u0489\u0300\u0301\u0302\u0303\u0304\u0305\u0306\u0307\u0308\u0309\u030a\u030b\u030c\u030d\u030e\u030f\u0310\u0311\u0312\u0313\u0314\u0315\u0316\u0317\u0318\u0319\u031a\u031b\u031c\u031d\u031e\u031f\u0320\u0321\u0322\u0323\u0324\u0325\u0326\u0327\u0328\u0329\u032a\u032b\u032c\u032d\u032e\u032f\u0330\u0331\u0332\u0333\u0334\u0335\u0336\u0337\u0338';
  const UNICODE_SUBS = {
    'a': '\u0430', 'e': '\u0435', 'o': '\u043e', 'p': '\u0440',
    'c': '\u0441', 'x': '\u0445', 'y': '\u0443', 'A': '\u0410',
    'B': '\u0412', 'E': '\u0415', 'H': '\u041d', 'K': '\u041a',
    'M': '\u041c', 'O': '\u041e', 'P': '\u0420', 'T': '\u0422',
    'X': '\u0425',
  };

  // ── Text corruption ──

  function corruptTextNodes(container, rng, intensity) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    for (const node of nodes) {
      if (!node.textContent.trim()) continue;
      // Skip nav buttons and counters
      if (node.parentElement.closest('.doc-nav, .doc-footer')) continue;

      let text = node.textContent;
      let chars = [...text];

      for (let i = 0; i < chars.length; i++) {
        const roll = rng();

        // Homoglyph substitution (subtle, starts early)
        if (intensity > 1 && roll < intensity * 0.008) {
          const sub = UNICODE_SUBS[chars[i]];
          if (sub) chars[i] = sub;
        }

        // Character replacement with light glitch chars
        if (intensity > 3 && roll < (intensity - 3) * 0.006) {
          chars[i] = GLITCH_LIGHT[Math.floor(rng() * GLITCH_LIGHT.length)];
        }

        // Block character insertion
        if (intensity > 5 && roll < (intensity - 5) * 0.005) {
          chars[i] = GLITCH_MED[Math.floor(rng() * GLITCH_MED.length)];
        }

        // Zalgo combining marks
        if (intensity > 7 && roll < (intensity - 7) * 0.008) {
          const numMarks = Math.floor(rng() * intensity * 0.4) + 1;
          for (let m = 0; m < numMarks; m++) {
            chars[i] += GLITCH_HEAVY[Math.floor(rng() * GLITCH_HEAVY.length)];
          }
        }

        // Total deletion
        if (intensity > 8 && roll < (intensity - 8) * 0.008) {
          chars[i] = '';
        }
      }

      node.textContent = chars.join('');
    }
  }

  // ── Layout displacement ──

  function displaceElements(container, rng, intensity) {
    const targets = container.querySelectorAll(
      '.section, .meta-grid__cell, .addendum, .title-block, .signature-block__field'
    );

    for (const el of targets) {
      if (rng() > intensity * 0.08) continue;

      const maxShift = intensity * 1.5;
      const dx = (rng() - 0.5) * maxShift;
      const dy = (rng() - 0.5) * maxShift * 0.5;
      const skew = (rng() - 0.5) * intensity * 0.15;

      el.style.transform = `translate(${dx}px, ${dy}px) skew(${skew}deg)`;

      // At high rot, sometimes duplicate-ghost an element
      if (intensity > 7 && rng() < (intensity - 7) * 0.06) {
        const ghost = el.cloneNode(true);
        ghost.style.position = 'absolute';
        ghost.style.opacity = String(0.04 + rng() * 0.08);
        ghost.style.transform = `translate(${(rng() - 0.5) * 20}px, ${(rng() - 0.5) * 10}px)`;
        ghost.style.pointerEvents = 'none';
        ghost.style.mixBlendMode = 'difference';
        ghost.classList.add('rot-ghost');
        el.style.position = 'relative';
        el.appendChild(ghost);
      }
    }
  }

  // ── Horizontal tear lines ──

  function addTearLines(container, rng, intensity) {
    if (intensity < 4) return;

    const numTears = Math.floor((intensity - 3) * rng() * 1.5);
    const containerRect = container.getBoundingClientRect();

    for (let i = 0; i < numTears; i++) {
      const tear = document.createElement('div');
      tear.className = 'rot-overlay rot-tear';
      const yPct = 10 + rng() * 80;
      const width = 20 + rng() * 80;
      const xStart = rng() * (100 - width);
      const height = 1 + rng() * (intensity * 0.3);

      tear.style.cssText = `
        position: absolute;
        top: ${yPct}%;
        left: ${xStart}%;
        width: ${width}%;
        height: ${height}px;
        background: var(--white);
        pointer-events: none;
        z-index: 100;
        opacity: ${0.3 + rng() * 0.7};
        mix-blend-mode: difference;
      `;
      container.appendChild(tear);
    }
  }

  // ── Data corruption in metadata ──

  function corruptMetadata(container, rng, intensity) {
    if (intensity < 2) return;

    const values = container.querySelectorAll('.meta-grid__value');
    for (const val of values) {
      if (val.classList.contains('meta-grid__value--redacted')) continue;
      if (rng() > intensity * 0.06) continue;

      // Glitch the value
      const text = val.textContent;
      if (rng() < 0.5) {
        // Numeric corruption
        val.textContent = text.replace(/\d/g, (d) =>
          rng() < intensity * 0.08 ? Math.floor(rng() * 10).toString() : d
        );
      } else {
        // Partial redaction
        val.style.background = `linear-gradient(90deg,
          transparent ${rng() * 40}%,
          var(--black) ${rng() * 40}%,
          var(--black) ${60 + rng() * 30}%,
          transparent ${60 + rng() * 40}%)`;
        val.style.backgroundClip = 'text';
        val.style.webkitBackgroundClip = 'text';
      }
    }
  }

  // ── Flicker animation injection ──

  function addFlickerEffects(container, rng, intensity) {
    if (intensity < 4) return;

    const sections = container.querySelectorAll('.section');
    for (const section of sections) {
      if (rng() > intensity * 0.07) continue;

      const duration = 0.05 + rng() * 0.15;
      const delay = rng() * 8;
      const flickerType = rng();

      if (flickerType < 0.5) {
        section.style.animation = `rotFlicker ${duration}s ${delay}s infinite`;
      } else {
        section.style.animation = `rotJitter ${0.1 + rng() * 0.3}s ${delay}s infinite`;
      }
    }
  }

  // ── Black bars / redaction strips ──

  function addBlackBars(container, rng, intensity) {
    if (intensity < 6) return;

    const paragraphs = container.querySelectorAll('.section__body p');
    for (const p of paragraphs) {
      if (rng() > (intensity - 5) * 0.08) continue;

      const bar = document.createElement('span');
      bar.className = 'rot-bar';
      const width = 15 + rng() * 40;
      bar.style.cssText = `
        display: inline-block;
        width: ${width}%;
        height: 1.1em;
        background: var(--black);
        vertical-align: middle;
        margin: 0 2px;
      `;

      // Insert at random position in text
      const textNodes = [];
      const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) textNodes.push(walker.currentNode);

      if (textNodes.length > 0) {
        const targetNode = textNodes[Math.floor(rng() * textNodes.length)];
        const splitPos = Math.floor(rng() * targetNode.textContent.length);
        const after = targetNode.splitText(splitPos);
        after.parentNode.insertBefore(bar, after);
      }
    }
  }

  // ── Page-level CSS distortion ──

  function applyPageDistortion(pageFrame, rng, intensity) {
    if (intensity < 1) {
      pageFrame.style.filter = '';
      pageFrame.style.textShadow = '';
      return;
    }

    const filters = [];

    if (intensity > 2) {
      filters.push(`contrast(${1 + (rng() - 0.5) * intensity * 0.03})`);
    }

    if (intensity > 4) {
      filters.push(`brightness(${1 + (rng() - 0.5) * intensity * 0.02})`);
    }

    if (intensity > 8) {
      filters.push(`blur(${(intensity - 8) * rng() * 0.3}px)`);
    }

    if (filters.length) {
      pageFrame.style.filter = filters.join(' ');
    }

    // Color channel shift
    if (intensity > 5) {
      const shift = (intensity - 5) * 0.4;
      const angle = rng() * 360;
      pageFrame.style.textShadow = `
        ${Math.cos(angle) * shift}px ${Math.sin(angle) * shift}px 0 rgba(255,0,0,${intensity * 0.015}),
        ${Math.cos(angle + 2) * shift}px ${Math.sin(angle + 2) * shift}px 0 rgba(0,0,255,${intensity * 0.015})
      `;
    }
  }

  // ── Master apply function ──

  function apply(entryId, rotLevel, pageFrame, opts = {}) {
    const { animate = true } = opts;
    // Clean previous rot
    clean(pageFrame);

    if (!rotLevel || rotLevel <= 0) return;

    const intensity = Math.min(Math.max(rotLevel, 0), 10);
    const rng = makeRng(seedFromId(entryId));

    // Set data attribute for CSS hooks
    pageFrame.dataset.rot = intensity;

    // Text-level corruption always applies (it's data rot, not animation)
    corruptMetadata(pageFrame, rng, intensity);
    corruptTextNodes(pageFrame, rng, intensity);

    // Visual/motion effects only when animations enabled
    if (animate) {
      applyPageDistortion(pageFrame, rng, intensity);
      displaceElements(pageFrame, rng, intensity);
      addTearLines(pageFrame, rng, intensity);
      addBlackBars(pageFrame, rng, intensity);
      addFlickerEffects(pageFrame, rng, intensity);
    }
  }

  function clean(pageFrame) {
    delete pageFrame.dataset.rot;
    pageFrame.style.filter = '';
    pageFrame.style.textShadow = '';
    pageFrame.querySelectorAll('.rot-overlay, .rot-ghost, .rot-bar').forEach(el => el.remove());
  }

  return { apply, clean };
})();
