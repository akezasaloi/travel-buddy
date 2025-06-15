const cardsContainer = document.getElementById('country-cards');
const regionBtns = document.querySelectorAll('.region-btn');
const searchInput = document.getElementById('country-search');
const wishlistLink = document.getElementById('wishlist-link');
const wishlistModal = document.getElementById('wishlist-modal');
const closeModal = document.getElementById('close-modal');
const wishlistItems = document.getElementById('wishlist-items');

let countries = [];
let filteredCountries = [];
let selectedRegion = 'Africa';
let wishlist = JSON.parse(localStorage.getItem('countryWishlist') || '[]');


async function fetchCountries(){
  try {
    const response = await fetch(`https://restcountries.com/v3.1/region/${selectedRegion}`);
    if (!response.ok) throw new Error("API failed");
    const data = await response.json();
    countries = data
      .filter(c => c.name.common && c.cca2 && c.flags && c.flags.png)
      .map(c => ({
        name: c.name.common,
        region: c.region,
        flag: c.flags.png,
        code:c.cca2
        }));
    getCountries();
  } catch (err) {
    cardsContainer.innerHTML = '<div style="color:purple;font-size:1.2em">Failed to load countries.</div>';
  }
}

function getCountries() {
  const countrySearched = searchInput.value.trim().toLowerCase();
  filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearched)
  );
  showCountries();
}


function showCountries() {
  cardsContainer.innerHTML = '';
  if (!filteredCountries.length) {
    cardsContainer.innerHTML = '<div style="color:#b491c8;font-size:1.2em">No destinations found.</div>';

  }
  filteredCountries.forEach(country => {
    const card = document.createElement('div');
    card.className = 'country-card';

    card.innerHTML = `
     <img class="card-image" src="${country.flag}">
      <div class="country-name">${country.name}</div>
      <span class="wishlist-heart${wishlist.find(w => w.code === country.code) ? ' active' : ''}" data-code="${country.code}">&#9825;</span>
      <button class="explore-btn">Explore</button>
    `;
    cardsContainer.appendChild(card);
  });
}




regionBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    regionBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedRegion = btn.getAttribute('data-region');
    fetchCountries(); 
  });
});

searchInput.addEventListener('input', () => {
  getCountries();
});

cardsContainer.addEventListener('click', cardC => {
  if (cardC.target.classList.contains('wishlist-heart')) {
    const code = cardC.target.getAttribute('data-code');
    const country = countries.find(c => c.code === code);
    if (!country) return;
    const idx = wishlist.findIndex(w => w.code === code);
    if (idx === -1) {
      wishlist.push(country);
      cardC.target.classList.add('active');
    } else {
      wishlist.splice(idx, 1);
      cardC.target.classList.remove('active');
    }
    localStorage.setItem('countryWishlist', JSON.stringify(wishlist));
  }
});


wishlistLink.addEventListener('click', lists => {
  viewWishlistModal();
  wishlistModal.style.display = 'flex';
});

closeModal.onclick = () => wishlistModal.style.display = 'none';

window.onclick = function(mywish) {
  if (mywish.target == wishlistModal) wishlistModal.style.display = "none";
};

function viewWishlistModal() {
  wishlistItems.innerHTML = wishlist.length === 0
    ? '<li>Your wishlist is empty.</li>'
    : wishlist.map(item => `<li><img src="${item.flag}" alt="${item.name}"><span>${item.name}</span></li>`).join('');
}

fetchCountries();