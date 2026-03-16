export default function decorate(block) {
  // 1. Grab the image and the text from the document
  const [imageRow, textRow] = block.children;
  
  // Extract the image URL
  const img = imageRow.querySelector('img');
  const bgUrl = img ? img.src : '';

  // Extract the text string
  const textContent = textRow.textContent.trim() + ' \u00A0\u00A0\u00A0\u00A0 '; // Adds trailing spaces

  // 2. Build the new HTML structure for the infinite slider
  const marqueeContainer = document.createElement('div');
  marqueeContainer.className = 'marquee-container';

  const track = document.createElement('div');
  track.className = 'marquee-track';

  // Inject the image URL into a CSS variable so our stylesheet can use it!
  track.style.setProperty('--text-bg', `url(${bgUrl})`);

  // 3. Duplicate the text twice to create the seamless looping illusion
  for (let i = 0; i < 2; i++) {
    const span = document.createElement('span');
    span.className = 'marquee-text';
    span.textContent = textContent;
    track.append(span);
  }

  // 4. Replace the old table with our new track
  marqueeContainer.append(track);
  block.textContent = '';
  block.append(marqueeContainer);
}
