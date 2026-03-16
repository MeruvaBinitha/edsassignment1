import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cv1-image';
      } else if (!div.classList.contains('cards-card-highlight')) {
        div.className = 'cv1-body';
      }
    });

    ul.append(li);
  });

  // Optimize images
  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]),
    );
  });

  ul.querySelectorAll('li').forEach((li) => {
    const body = li.querySelector('.cv1-body');
    if (!body) return;

    const title = body.querySelector('h1,h2,h3,h4,h5,h6')?.textContent?.trim() || '';
    const desc = body.querySelector('p')?.textContent?.trim() || '';

    /* Overlay */
    const overlay = document.createElement('div');
    overlay.className = 'cv1-overlay';
    overlay.innerHTML = `
      <span class="cv1-icon"></span>
      <div class="cv1-text">
        <h3>${title}</h3>
        <p>${desc}</p>
      </div>
    `;

    /* CTA */
    const cta = document.createElement('a');
    cta.className = 'cv1-cta';
    cta.href = '#';
    cta.textContent = 'Read More';

    li.append(overlay, cta);

    // Hide original body visually
    body.classList.add('cv1-visually-hidden');
  });

  block.replaceChildren(ul);
  block.className = 'cardvariant1';
}
