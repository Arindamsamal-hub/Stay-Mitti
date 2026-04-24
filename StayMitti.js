let hotels = []; // Start empty! Will be filled by the database.

// Initialize functions when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('hotel-grid-container')) {
        fetchResorts(); // Fetch from Database first!
    }
});

function fetchResorts() {
    fetch('https://staymitti.pythonanywhere.com/api/resorts')
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(data => {
            hotels = data; 
            generateHotelCards(); 
            setupSearch();
        })
        .catch(error => {
            console.error('Error fetching resorts:', error);
            document.getElementById('hotel-grid-container').innerHTML = '<h3 style="text-align:center; color:red;">Failed to load hotels. Check if resorts.json exists!</h3>';
        });
}
function generateHotelCards() {
    const container = document.getElementById('hotel-grid-container');
    if (!container) return;
    container.innerHTML = '';

    hotels.forEach((hotel, index) => {
        // Grab the first image from the JSON array
        const imageSrc = hotel.images && hotel.images.length > 0 ? hotel.images[0] : "";
        
        const cardHTML = `
            <div class="hotel-card" 
                 data-name="${hotel.name.toLowerCase()}" 
                 data-location="${hotel.location.toLowerCase()}" 
                 data-tag="${hotel.tag.toLowerCase()}">
                <img src="${imageSrc}" alt="${hotel.name}" class="card-image" loading="lazy">
                
                <div class="card-content">
                    <div class="hotel-name">${hotel.name}</div>
                    <div class="hotel-location"><i class="fas fa-map-marker-alt"></i> ${hotel.location}</div>
                    
                    <div class="rating" style="margin: 0.3rem 0;">
                        ${generateStars(hotel.rating)}
                    </div>
                    
                    <div style="font-size: 1.1rem; font-weight: bold; color: var(--primary-color); margin-top: 0.5rem;">
                        ₹${hotel.price.toLocaleString()} <span style="font-size: 0.85rem; color: #777; font-weight: normal;">/ night</span>
                    </div>

                    <a href="Hotel.html?id=${index}" class="view-details-btn">
                        View Details <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const noResultsMsg = document.getElementById('no-results');
    if (!searchInput) return;

    searchInput.addEventListener('keyup', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.hotel-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const name = card.getAttribute('data-name');
            const location = card.getAttribute('data-location');
            const tag = card.getAttribute('data-tag');
            
            if (name.includes(term) || location.includes(term) || tag.includes(term)) {
                card.style.display = "block";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        if (noResultsMsg) noResultsMsg.style.display = visibleCount === 0 ? "block" : "none";
    });
}

function filterByTag(tag) {
    if (event) event.preventDefault(); 
    const cards = document.querySelectorAll('.hotel-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
        const cardTag = card.getAttribute('data-tag');
        if (tag === 'All' || cardTag === tag.toLowerCase()) {
            card.style.display = "block";
            visibleCount++;
        } else {
            card.style.display = "none";
        }
    });
    
    const noResultsMsg = document.getElementById('no-results');
    if (noResultsMsg) noResultsMsg.style.display = visibleCount === 0 ? "block" : "none";

    const hotelsSection = document.getElementById('hotels');
    if (hotelsSection) hotelsSection.scrollIntoView({ behavior: 'smooth' });
}

function generateStars(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) starsHTML += '<i class="fas fa-star"></i>';
        else if (i === Math.ceil(rating)) starsHTML += '<i class="fas fa-star-half-alt"></i>';
        else starsHTML += '<i class="far fa-star"></i>';
    }
    return starsHTML;
}

window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (nav) {
        nav.style.boxShadow = window.scrollY > 50 ? "var(--shadow-hover)" : "var(--shadow-soft)";
    }
});