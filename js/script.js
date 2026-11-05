// Find the controls and content areas on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const getImagesButton = document.getElementById('getImagesButton');
const gallery = document.getElementById('gallery');
const spaceFact = document.getElementById('spaceFact');
const imageModal = document.getElementById('imageModal');
const closeModalButton = document.getElementById('closeModal');
const modalImage = document.getElementById('modalImage');
const modalDate = document.getElementById('modalDate');
const modalTitle = document.getElementById('modalTitle');
const modalExplanation = document.getElementById('modalExplanation');

// Set up the date pickers with NASA's valid APOD date range.
setupDateInputs(startInput, endInput);

const NASA_API_URL = 'https://api.nasa.gov/planetary/apod';
const NASA_API_KEY = 'DEMO_KEY';
let imageEntries = [];

const spaceFacts = [
  'A day on Venus is longer than a year on Venus.',
  'There are more stars in the universe than grains of sand on Earth.',
  'The footprints left on the Moon could last for millions of years.',
  'Neutron stars are so dense that a teaspoon of one would weigh billions of tons.',
  'Olympus Mons on Mars is the tallest volcano in the solar system.'
];

// Show one new fact each time the page loads.
spaceFact.textContent = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];

// Request APOD entries for the selected date range.
async function getSpaceImages() {
  gallery.innerHTML = '<div class="loading" role="status">🔄 Loading space photos...</div>';
  getImagesButton.disabled = true;

  try {
    const requestUrl = `${NASA_API_URL}?api_key=${NASA_API_KEY}&start_date=${startInput.value}&end_date=${endInput.value}`;
    const response = await fetch(requestUrl);

    if (!response.ok) {
      throw new Error('NASA could not provide photos for this date range.');
    }

    const responseData = await response.json();
    imageEntries = Array.isArray(responseData) ? responseData : [responseData];
    renderGallery(imageEntries);
  } catch (error) {
    gallery.innerHTML = `<div class="message error-message" role="alert">${error.message} Please try again.</div>`;
  } finally {
    getImagesButton.disabled = false;
  }
}

// Create a card for every APOD entry returned by NASA.
function renderGallery(apodEntries) {
  if (apodEntries.length === 0) {
    gallery.innerHTML = '<div class="message">No space photos were found for those dates.</div>';
    return;
  }

  gallery.innerHTML = apodEntries.map((entry, index) => {
    if (entry.media_type === 'video') {
      return `
        <article class="gallery-item video-item">
          <div class="video-placeholder">▶</div>
          <div class="gallery-text">
            <p class="item-date">${entry.date}</p>
            <h2>${entry.title}</h2>
            <a class="video-link" href="${entry.url}" target="_blank" rel="noopener noreferrer">
              Watch this NASA video
            </a>
          </div>
        </article>
      `;
    }

    return `
      <button class="gallery-item image-item" type="button" data-entry-index="${index}">
        <img src="${entry.url}" alt="${entry.title}" />
        <span class="gallery-text">
          <span class="item-date">${entry.date}</span>
          <span class="item-title">${entry.title}</span>
        </span>
      </button>
    `;
  }).join('');

  document.querySelectorAll('.image-item').forEach((item) => {
    item.addEventListener('click', () => openModal(imageEntries[item.dataset.entryIndex]));
  });
}

// Fill the modal with the selected photo and show it.
function openModal(entry) {
  modalImage.src = entry.hdurl || entry.url;
  modalImage.alt = entry.title;
  modalDate.textContent = entry.date;
  modalTitle.textContent = entry.title;
  modalExplanation.textContent = entry.explanation;
  imageModal.classList.add('is-open');
  imageModal.setAttribute('aria-hidden', 'false');
  closeModalButton.focus();
}

// Close the modal when the close button, backdrop, or Escape key is used.
function closeModal() {
  imageModal.classList.remove('is-open');
  imageModal.setAttribute('aria-hidden', 'true');
}

getImagesButton.addEventListener('click', getSpaceImages);
closeModalButton.addEventListener('click', closeModal);
imageModal.addEventListener('click', (event) => {
  if (event.target === imageModal) {
    closeModal();
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && imageModal.classList.contains('is-open')) {
    closeModal();
  }
});

// Load the default nine-day range as soon as the app opens.
getSpaceImages();
