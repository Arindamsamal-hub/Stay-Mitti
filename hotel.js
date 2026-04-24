let hotels = []; 

document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('detail-title')) return; 

    const urlParams = new URLSearchParams(window.location.search);
    const hotelId = urlParams.get('id');

    // Fetch from the local static file instead of the Flask API
    fetch('https://staymitti.pythonanywhere.com/api/resorts')
        .then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then(data => {
            hotels = data;
            populateDetails(hotelId);
        })
        .catch(error => {
            console.error("Error loading details:", error);
            document.getElementById('detail-title').innerText = "Error loading hotel details. Check if resorts.json exists!";
        });
});

function populateDetails(hotelId) {
    if (hotelId !== null && hotels[hotelId]) {
        const selectedHotel = hotels[hotelId];

        document.getElementById('detail-title').innerText = selectedHotel.name;
        document.getElementById('detail-location').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${selectedHotel.location}`;
        document.getElementById('detail-price').innerText = `₹${selectedHotel.price.toLocaleString()}`;
        document.getElementById('detail-description').innerText = selectedHotel.description;
        document.getElementById('detail-airport').innerHTML = `<i class="fas fa-plane"></i> <strong>Nearest Airport:</strong> ${selectedHotel.airport}`;
        document.getElementById('detail-railway').innerHTML = `<i class="fas fa-train"></i> <strong>Nearest Railway:</strong> ${selectedHotel.railway}`;

        // Set the map
        const mapFrame = document.getElementById('detail-map');
        if (mapFrame) mapFrame.src = selectedHotel.mapUrl;

        // --- SMART AMENITIES LOGIC ---
        const amenitiesContainer = document.getElementById('detail-amenities');
        if (amenitiesContainer && selectedHotel.amenities) {
            amenitiesContainer.innerHTML = ''; 
            selectedHotel.amenities.forEach(amenity => {
                // If you didn't type an icon in the Admin Panel, automatically add a checkmark!
                let formattedAmenity = amenity;
                if (!amenity.includes('<i')) {
                    formattedAmenity = `<i class="fas fa-check-circle" style="color: var(--primary-color);"></i> ${amenity}`;
                }
                amenitiesContainer.innerHTML += `<li>${formattedAmenity}</li>`;
            });
        }

        // --- DYNAMIC IMAGE SLIDER LOGIC ---
        const sliderContainer = document.querySelector('.slider');
        if (sliderContainer && selectedHotel.images && selectedHotel.images.length > 0) {
            sliderContainer.innerHTML = ''; // Clear the old blank slides
            
            // Generate exact number of slides needed
            selectedHotel.images.forEach((imgUrl, index) => {
                const img = document.createElement('img');
                img.src = imgUrl;
                img.className = index === 0 ? 'slide active' : 'slide'; // Make first image visible
                img.id = `slide-${index + 1}`;
                sliderContainer.appendChild(img);
            });
        } else {
            // Fallback if no images were provided
            sliderContainer.innerHTML = '<div style="padding: 100px; text-align:center; background:#eee;">No images available</div>';
        }

        // --- 💰 UPDATED BOOKING BUTTON LOGIC 💰 ---
        const bookBtn = document.querySelector('.book-btn');
        if (bookBtn) {
            // We now pass the PRICE in the URL so booking.html can calculate the total
            bookBtn.href = `booking.html?name=${encodeURIComponent(selectedHotel.name)}&location=${encodeURIComponent(selectedHotel.location)}&price=${selectedHotel.price}`;
        }
        
        // Initialize the slider buttons after images are added
        initSlider();

    } else {
        document.getElementById('detail-title').innerText = "Hotel Not Found";
    }
}

// IMAGE SLIDER BUTTON LOGIC 
function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    let currentSlide = 0;

    // Safety check so it doesn't crash if buttons are missing
    if (!prevBtn || !nextBtn) return;

    // Remove old listeners by cloning (prevents clicking issues if re-run)
    const newPrevBtn = prevBtn.cloneNode(true);
    const newNextBtn = nextBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);

    if(slides.length > 1) { // Only enable buttons if there's more than 1 image
        function updateSlide(direction) {
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + direction + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
        }

        newPrevBtn.addEventListener('click', () => updateSlide(-1));
        newNextBtn.addEventListener('click', () => updateSlide(1));
    } else {
        // Hide arrows if there is only 1 image
        newPrevBtn.style.display = 'none';
        newNextBtn.style.display = 'none';
    }
}