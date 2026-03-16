import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cardvariant1 – hero-style cards grid
 * - Card #1 shows a centered CTA pill if a highlight link is present
 * - Cards #2..n show overlay (badge + title + description) by default
 *
 * Authoring (2 columns):
 * | cardvariant1 |                  |
 * |--------------|------------------|
 * | image        | ## Title\nParagraph description |
 *
 * Optional third cell (if your authoring generates it):
 * <div class="cards-card-highlight"><a href="#">Read More</a></div>
 * The script will pick this link to render the centered CTA pill.
 */

function extractTitleAndDesc(body) {
  // Prefer semantic heading, else <strong>/<b>, else <p><strong>..</strong></p>
  let headingEl =
    body.querySelector('h1, h2, h3, h4, h5, h6') ||
    body.querySelector('strong, b');

  if (!headingEl) {
    const pOnlyStrong = [...body.querySelectorAll('p')].find((p) => {
      const first = p.firstElementChild;
      const onlyStrong = p.children.length === 1 && first && (first.matches('strong, b'));
      const noOtherText = p.textContent.trim() === first?.textContent.trim();
      return onlyStrong && noOtherText;
    });
    if (pOnlyStrong) headingEl = pOnlyStrong.querySelector('strong, b');
  }

  let title = headingEl ? headingEl.textContent.trim() : '';

  // Description: first meaningful paragraph after the title paragraph (if any)
  const allParas = [...body.querySelectorAll('p')];

  const isJustStrong = (p) => {
    const first = p.firstElementChild;
    const onlyStrong = p.children.length === 1 && first?.matches('strong, b');
    const noOtherText = p.textContent.trim() === first?.textContent.trim();
    return onlyStrong && noOtherText;
  };

  let descEl = null;
  const headingP = headingEl?.closest?.('p') || null;
  if (headingP) {
    const after = allParas.slice(allParas.indexOf(headingP) + 1);
    descEl = after.find((p) => !isJustStrong(p) && p.textContent.trim().length > 0);
  }
  if (!descEl) {
    descEl = allParas.find((p) => {
      const txt = p.textContent.trim();
      return txt.length > 0 && !isJustStrong(p) && txt !== title;
    });
  }

  const desc = descEl ? descEl.textContent.trim() : '';

  if (!title && desc) {
    title = (desc.split('.').shift() || desc).trim().slice(0, 80);
  } else if (!title) {
    title = 'Card Title';
  }
  return { title, desc };
}

function buildOverlay({ title, desc }) {
  const overlay = document.createElement('div');
  overlay.className = 'cv1-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  const badge = document.createElement('span');
  badge.className = 'cv1-badge';
  badge.innerHTML = `
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a5 5 0 00-5 5v2H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2h-2V7a5 5 0 00-5-5zm-3 7V7a3 3 0 116 0v2H9z"></path>
    </svg>
  `;

  const text = document.createElement('div');
  text.className = 'cv1-text';
  text.innerHTML = `
    <h3>${title}</h3>
    ${desc ? `<p>${desc}</p>` : ''}
  `;

  overlay.append(badge, text);
  return overlay;
}

function buildCtaFromHighlight(li) {
  const highlight = li.querySelector('.cards-card-highlight');
  if (!highlight) return null;
  const a = highlight.querySelector('a[href]');
  if (!a) return null;

  const cta = document.createElement('a');
  cta.className = 'cv1-cta';
  cta.href = a.getAttribute('href') || '#';
  if (a.target) cta.target = a.target;
  if (a.rel) cta.rel = a.rel;
  cta.textContent = a.textContent?.trim() || 'Read More';
  return cta;
}

export default function decorate(block) {
  // 1) Turn block rows into <ul><li>
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');

    while (row.firstElementChild) li.append(row.firstElementChild);

    // Mark cells
    [...li.children].forEach((div) => {
      const onlyPic = div.children.length === 1 && div.querySelector('picture');
      // Keep any pre-existing class (e.g., cards-card-highlight from authoring)
      if (onlyPic) {
        div.classList.add('cv1-card-image');
      } else if (!div.classList.contains('cards-card-highlight')) {
        div.classList.add('cv1-card-body');
      }
    });

    ul.append(li);
  });

  // 2) Optimize images (responsive picture)
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimized);
  });

  // 3) Compose overlays and CTA pills
  const items = [...ul.querySelectorAll(':scope > li')];
  items.forEach((li, idx) => {
    li.classList.add('cv1-item');

    const body = li.querySelector('.cv1-card-body');
    const image = li.querySelector('.cv1-card-image');
    if (!image) return;

    // Extract content
    const { title, desc } = body ? extractTitleAndDesc(body) : { title: '', desc: '' };

    // Overlay (title + description + badge)
    if (title || desc) {
      li.append(buildOverlay({ title, desc }));
    }

    // CTA pill from highlight link (if present)
    const cta = buildCtaFromHighlight(li);
    if (cta) {
      li.append(cta);
      li.classList.add('cv1-has-cta');
    }

    // Accessibility
    const hasFocusable = li.querySelector('a, button, [tabindex]');
    if (!hasFocusable) li.setAttribute('tabindex', '0');
    li.setAttribute('role', 'group');

    // Variants per card index
    if (idx === 0 && cta) {
      li.classList.add('cv1-cta-only');  // first card: CTA only
    } else {
      li.classList.add('cv1-show-overlay'); // others: overlay visible
    }
  });

  // 4) Replace block DOM
  block.replaceChildren(ul);

  // Rename the block root class to the variant name for scoping
  block.classList.remove('cards'); // in case authored as "cards"
  block.classList.add('cardvariant1');
}
``
