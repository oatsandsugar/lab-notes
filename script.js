/**
 * LAB NOTES — Document Navigation System
 * Version 2.0.0
 * Classification: INTERNAL
 */

const LAB = (() => {
  let entries = [];
  let currentIndex = 0;
  let isIndex = true;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let animationsEnabled = localStorage.getItem('lab-notes-animations')
    ? localStorage.getItem('lab-notes-animations') !== 'off'
    : !prefersReducedMotion;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function padId(n) {
    return String(n).padStart(3, '0');
  }

  function formatDocNum(entry) {
    return `LN-2026-${entry.day}`;
  }

  async function loadManifest() {
    entries = [];
    let id = 1;
    while (true) {
      try {
        const resp = await fetch(`entries/${padId(id)}.md`);
        if (!resp.ok) break;
        const raw = await resp.text();
        const entry = PARSE.parseEntry(raw);
        if (!entry) break;
        entries.push(entry);
        id++;
      } catch {
        break;
      }
    }
    return entries;
  }

  function renderIndex() {
    isIndex = true;
    const pageFrame = $('.page-frame');
    const content = $('#content');

    // Clean rot from previous entry
    ROT.clean(pageFrame);

    const listItems = entries.map((entry, i) => `
      <li class="index-list__item" data-index="${i}" role="button" tabindex="0">
        <span class="index-list__num">${padId(entry.id)}</span>
        <span class="index-list__title">${entry.title}</span>
        <span class="index-list__date">Day ${entry.day}</span>
      </li>
    `).join('');

    content.innerHTML = `
      <div class="doc-header">
        <div class="doc-header__org">
          Research Division<br>
          Documentation Archive
        </div>
        <div class="doc-header__classification">Internal</div>
      </div>

      <div class="title-block">
        <h1 class="title-block__title">Lab Notes</h1>
        <div class="title-block__subtitle">Chronological Index — ${entries.length} ${entries.length === 1 ? 'Entry' : 'Entries'} Filed</div>
      </div>

      <hr class="ruler--heavy">

      ${entries.length > 0 ? `
        <ul class="index-list">
          ${listItems}
        </ul>
      ` : `
        <div class="empty-state">
          <div class="empty-state__icon">&#9744;</div>
          <div class="empty-state__text">No entries filed</div>
        </div>
      `}

      <div class="doc-footer">
        <span>(c) <a href="https://github.com/oatsandsugar" target="_blank" rel="noopener">@oatsandsugar</a> ${new Date().getFullYear()} — <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a></span>
        <span><a href="https://far-horizons-co-op.itch.io/outliers" target="_blank" rel="noopener">Outliers</a> by Far Horizons Co-op</span>
      </div>
    `;

    $$('.index-list__item').forEach(item => {
      const handler = () => {
        const idx = parseInt(item.dataset.index);
        renderEntry(idx);
      };
      item.addEventListener('click', handler);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handler();
        }
      });
    });

    window.scrollTo(0, 0);
    updateURL(null);
  }

  function renderEntry(index) {
    isIndex = false;
    currentIndex = index;
    const entry = entries[index];
    const pageFrame = $('.page-frame');
    const content = $('#content');

    // Clean previous rot
    ROT.clean(pageFrame);

    const sectionsHTML = entry.sections.map(section => `
      <div class="section">
        <h2 class="section__heading">${section.heading}</h2>
        <div class="section__body">${section.content}</div>
      </div>
    `).join('');

    const hasPrev = index > 0;
    const hasNext = index < entries.length - 1;

    content.innerHTML = `
      <div class="doc-header">
        <a href="#" class="doc-header__org" data-action="index">
          Research Division<br>
          Document No. ${formatDocNum(entry)}
        </a>
        <div class="doc-header__classification">Internal</div>
      </div>

      <div class="title-block">
        <h1 class="title-block__title">${entry.title}</h1>
        <div class="title-block__subtitle">Lab Note ${padId(entry.id)}</div>
      </div>

      <div class="meta-grid">
        <div class="meta-grid__cell">
          <span class="meta-grid__label">Day</span>
          <span class="meta-grid__value">${entry.day}</span>
        </div>
        <div class="meta-grid__cell">
          <span class="meta-grid__label">Specimen</span>
          <span class="meta-grid__value">${entry.specimen}</span>
        </div>
        <div class="meta-grid__cell">
          <span class="meta-grid__label">Protocol</span>
          <span class="meta-grid__value">${entry.protocol}</span>
        </div>
        <div class="meta-grid__cell">
          <span class="meta-grid__label">Status</span>
          <span class="meta-grid__value">${entry.status}</span>
        </div>
        <div class="meta-grid__cell">
          <span class="meta-grid__label">Budget Remaining</span>
          <span class="meta-grid__value">${entry.budgetEnd}</span>
        </div>
        <div class="meta-grid__cell">
          <span class="meta-grid__label">Researcher</span>
          <span class="meta-grid__value meta-grid__value--redacted">REDACTED</span>
        </div>
      </div>

      <div class="entry-content">
        ${sectionsHTML}
      </div>

      ${entry.addendum ? `
        <div class="addendum">
          <span class="addendum__label">Addendum</span>
          ${entry.addendum}
        </div>
      ` : ''}

      <div class="signature-block">
        <div class="signature-block__field">
          <span class="signature-block__label">Researcher</span>
          <div class="signature-block__line">${entry.signatures?.researcher || ''}</div>
        </div>
        <div class="signature-block__field">
          <span class="signature-block__label">Reviewed By</span>
          <div class="signature-block__line">${entry.signatures?.reviewer || ''}</div>
        </div>
      </div>

      <nav class="doc-nav">
        <div class="doc-nav__controls">
          <button class="doc-nav__btn ${!hasPrev ? 'doc-nav__btn--disabled' : ''}"
                  ${!hasPrev ? 'disabled' : ''} data-action="prev">&#9664;</button>
          <button class="doc-nav__btn" data-action="index">&#9633;</button>
          <button class="doc-nav__btn ${!hasNext ? 'doc-nav__btn--disabled' : ''}"
                  ${!hasNext ? 'disabled' : ''} data-action="next">&#9654;</button>
        </div>
      </nav>

      <div class="doc-footer">
        <span>(c) <a href="https://github.com/oatsandsugar" target="_blank" rel="noopener">@oatsandsugar</a> ${new Date().getFullYear()} — <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a></span>
        <span><a href="https://far-horizons-co-op.itch.io/outliers" target="_blank" rel="noopener">Outliers</a> by Far Horizons Co-op</span>
      </div>
    `;

    // Bind nav
    $$('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = btn.dataset.action;
        if (action === 'prev' && hasPrev) renderEntry(index - 1);
        if (action === 'next' && hasNext) renderEntry(index + 1);
        if (action === 'index') renderIndex();
      });
    });

    // Apply digital rot AFTER DOM is built
    if (entry.rot > 0) {
      ROT.apply(entry.id, entry.rot, pageFrame, { animate: animationsEnabled });
    }

    window.scrollTo(0, 0);
    updateURL(entry.id);
  }

  function updateURL(entryId) {
    const url = entryId ? `#entry-${entryId}` : '#';
    history.replaceState(null, '', entryId ? url : window.location.pathname);
  }

  function handleHash() {
    const hash = window.location.hash;
    if (hash.startsWith('#entry-')) {
      const id = hash.replace('#entry-', '');
      const idx = entries.findIndex(e => e.id === id);
      if (idx !== -1) {
        renderEntry(idx);
        return true;
      }
    }
    return false;
  }

  document.addEventListener('keydown', (e) => {
    if (isIndex) return;
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      renderEntry(currentIndex - 1);
    } else if (e.key === 'ArrowRight' && currentIndex < entries.length - 1) {
      renderEntry(currentIndex + 1);
    } else if (e.key === 'Escape') {
      renderIndex();
    }
  });

  function renderSplash(onContinue) {
    const content = $('#content');
    content.innerHTML = `
      <div class="splash">
        <div class="doc-header">
          <div class="doc-header__org">
            Research Division<br>
            Documentation Archive
          </div>
          <div class="doc-header__classification">Internal</div>
        </div>

        <div class="splash__body">
          <h1 class="title-block__title">Lab Notes</h1>
          <div class="title-block__subtitle" style="margin-bottom: 32px;">Horizon Labs — Research Documentation</div>

          <hr class="ruler--heavy">

          <div class="section" style="margin-top: 32px;">
            <div class="section__body">
              <p>This is <a href="https://github.com/oatsandsugar" style="color:var(--black);font-weight:600;">@oatsandsugar</a>'s playthrough of <a href="https://far-horizons-co-op.itch.io/outliers" style="color:var(--black);font-weight:600;">Outliers</a> by Far Horizons Co-op.</p>
              <p><strong>Spoiler warning.</strong> These notes document an ongoing game. If you intend to play Outliers yourself, reading further may affect your experience.</p>
              <p>This project contains animations and flashing effects that may be uncomfortable for some viewers.</p>
            </div>
          </div>

          <div class="splash__controls">
            <label class="splash__toggle">
              <input type="checkbox" id="splash-animations" ${animationsEnabled ? 'checked' : ''}>
              <span class="splash__toggle-label">Enable animations &amp; effects</span>
            </label>
          </div>

          <button class="doc-nav__btn splash__enter" id="splash-enter">
            Enter Archive
          </button>
        </div>

        <div class="splash__license">
          <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>
        </div>

        <div class="doc-footer">
          <span>Lab Notes Archive</span>
          <span>${new Date().getFullYear()}</span>
        </div>
      </div>
    `;

    $('#splash-animations').addEventListener('change', (e) => {
      animationsEnabled = e.target.checked;
      localStorage.setItem('lab-notes-animations', animationsEnabled ? 'on' : 'off');
      document.documentElement.classList.toggle('no-animations', !animationsEnabled);
    });

    $('#splash-enter').addEventListener('click', () => {
      localStorage.setItem('lab-notes-seen', '1');
      onContinue();
    });
  }

  function proceed() {
    if (!handleHash()) {
      if (entries.length === 1) {
        renderEntry(0);
      } else {
        renderIndex();
      }
    }
  }

  async function init() {
    // Apply animation preference immediately
    if (!animationsEnabled) {
      document.documentElement.classList.add('no-animations');
    }

    await loadManifest();

    const seen = localStorage.getItem('lab-notes-seen');
    if (!seen) {
      renderSplash(proceed);
    } else {
      proceed();
    }
  }

  window.addEventListener('hashchange', () => {
    if (!handleHash()) renderIndex();
  });

  return { init };
})();

document.addEventListener('DOMContentLoaded', LAB.init);
