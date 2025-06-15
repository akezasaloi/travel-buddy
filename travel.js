const unsplashAccessKey = 'MW0CzH3Up_xNTmu9vmry_M482LANvCglHXo9o7RtAss'; // Replace with your Unsplash API key
const countriesAPI = 'https://restcountries.com/v3.1/all';

const carousel = document.getElementById('destinations-carousel');
const wishlistLink = document.getElementById('wishlist-link');
const wishlistModal = document.getElementById('wishlist-modal');
const closeModal = document.getElementById('close-modal');
const wishlistItems = document.getElementById('wishlist-items');
const wishlistCount = document.getElementById('wishlist-count');

let destinations = [];
let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');

// --- 1. Fetch countries and Unsplash images ---
async function fetchDestinations() {
  // Pick 8 random countries for demo
  const res = await fetch(countriesAPI);
  const countries = await res.json();
  const randomCountries = countries
    .filter(c => c.capital && c.flags && c.name && c.name.common)
    .sort(() => 0.5 - Math.random())
    .slice(0, 8);

  // For each country, fetch Unsplash image
  const promises = randomCountries.map(async country => {
    const countryName = country.name.common;
    let img = country.flags && country.flags.png;
    // Try Unsplash
    try {
      const unsplashRes = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(countryName)}&per_page=1&client_id=${unsplashAccessKey}`);
      const data = await unsplashRes.json();
      if (data.results && data.results[0]) {
        img = data.results[0].urls.regular;
      }
    } catch {}
    return {
      name: countryName,
      capital: country.capital ? country.capital[0] : "",
      image: img,
      code: country.cca2
    }
  });
  destinations = await Promise.all(promises);
  renderDestinations();
}
fetchDestinations();

// --- 2. Render Destinations to Carousel ---
function renderDestinations() {
  carousel.innerHTML = '';
  destinations.forEach(destination => {
    const card = document.createElement('div');
    card.className = 'destination-card';
    card.innerHTML = `
      <img class="destination-img" src="${destination.image}" alt="${destination.name}">
      <div class="destination-info">
        <div class="destination-country">${destination.name}</div>
        <div class="destination-capital">${destination.capital ? "Capital: " + destination.capital : ""}</div>
      </div>
      <span class="wishlist-heart${wishlist.find(w => w.name === destination.name) ? ' active' : ''}" data-name="${destination.name}" title="Add to Wishlist">&#9829;</span>
    `;
    carousel.appendChild(card);
  });
  updateWishlistCount();
}

// --- 3. Wishlist Logic ---
carousel.addEventListener('click', e => {
  if (e.target.classList.contains('wishlist-heart')) {
    const name = e.target.getAttribute('data-name');
    const dest = destinations.find(d => d.name === name);
    if (!dest) return;
    const idx = wishlist.findIndex(w => w.name === name);
    if (idx === -1) {
      wishlist.push(dest);
      e.target.classList.add('active');
    } else {
      wishlist.splice(idx, 1);
      e.target.classList.remove('active');
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
  }
});

function updateWishlistCount() {
  wishlistCount.textContent = wishlist.length;
}

// --- 4. Wishlist Modal ---
wishlistLink.addEventListener('click', e => {
  e.preventDefault();
  renderWishlistModal();
  wishlistModal.style.display = 'flex';
});
closeModal.onclick = () => wishlistModal.style.display = 'none';
window.onclick = function(event) {
  if (event.target == wishlistModal) wishlistModal.style.display = "none";
};

function renderWishlistModal() {
  wishlistItems.innerHTML = wishlist.length === 0
    ? '<li>Your wishlist is empty.</li>'
    : wishlist.map(item => `<li><img src="${item.image}" alt="${item.name}"><span>${item.name}</span></li>`).join('');
}

// --- 5. Carousel scroll (basic) ---
document.getElementById('carousel-next').onclick = () => {
  carousel.scrollBy({left: 270, behavior: 'smooth'});
}

// --- 6. Comments (add comment) ---
document.getElementById('comment-form').onsubmit = function(e) {
  e.preventDefault();
  const text = document.getElementById('comment-input').value.trim();
  if (!text) return;
  const comment = document.createElement('div');
  comment.className = 'comment';
  comment.innerHTML = `
    <div class="avatar"></div>
    <div class="comment-content">
      <strong>You</strong>
      <div class="comment-text">${text}</div>
    </div>
  `;
  document.getElementById('comments-list').appendChild(comment);
  document.getElementById('comment-input').value = '';
}