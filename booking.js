document.addEventListener('DOMContentLoaded', () => {
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    const dateError = document.getElementById('dateError');
    const form = document.getElementById('bookingForm');
    
    // Elements for dynamic text
    const hotelNameDisplay = document.getElementById('selected-hotel-name');
    const hotelLocDisplay = document.getElementById('selected-hotel-location');

    // --- 1. POPULATE HOTEL DETAILS FROM URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const hotelName = urlParams.get('name');
    const hotelLocation = urlParams.get('location');
    const hotelPrice = parseInt(urlParams.get('price')) || 0; 

    if (hotelName && hotelNameDisplay) {
        hotelNameDisplay.innerText = hotelName;
        
        // Grab the hidden input and set its value so Flask can read it
        const hiddenHotelInput = document.getElementById('hotelNameInput');
        if (hiddenHotelInput) {
            hiddenHotelInput.value = hotelName;
        }
    }
    
    if (hotelLocation && hotelLocDisplay) {
        hotelLocDisplay.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${hotelLocation}`;
    }

    // --- 2. DATE VALIDATION LOGIC ---
    
    // Set minimum date to today for check-in
    const today = new Date().toISOString().split('T')[0];
    checkinInput.setAttribute('min', today);

    function validateDates() {
        if (checkinInput.value && checkoutInput.value) {
            const checkinDate = new Date(checkinInput.value);
            const checkoutDate = new Date(checkoutInput.value);

            // 1. Check if dates are valid
            if (checkoutDate <= checkinDate) {
                dateError.style.display = 'block';
                checkoutInput.setCustomValidity('Invalid Date');
                document.getElementById('totalAmountDisplay').innerText = `₹0`;
                document.getElementById('nightCountDisplay').innerText = "Invalid dates selected";
            } else {
                dateError.style.display = 'none';
                checkoutInput.setCustomValidity('');
                
                // 2. NEW: Calculate number of nights and total price!
                const timeDifference = checkoutDate.getTime() - checkinDate.getTime();
                const nightCount = Math.ceil(timeDifference / (1000 * 3600 * 24)); // Convert milliseconds to days
                
                if (hotelPrice > 0) {
                    const total = nightCount * hotelPrice;
                    document.getElementById('totalAmountDisplay').innerText = `₹${total.toLocaleString()}`;
                    document.getElementById('nightCountDisplay').innerText = `${nightCount} Night${nightCount > 1 ? 's' : ''} at ₹${hotelPrice.toLocaleString()} / night`;
                }
            }
        }
    }

    checkinInput.addEventListener('change', () => {
        // Automatically set the minimum checkout date to the day after checkin
        if(checkinInput.value) {
            const nextDay = new Date(checkinInput.value);
            nextDay.setDate(nextDay.getDate() + 1);
            checkoutInput.setAttribute('min', nextDay.toISOString().split('T')[0]);
            
            // If checkout was already selected and is now invalid, clear it or re-validate
            validateDates();
        }
    });

    checkoutInput.addEventListener('change', validateDates);

   // --- 3. FORM SUBMISSION ---
   form.addEventListener('submit', (e) => {
    // Run validation one last time
    validateDates();
    
    if (!form.checkValidity()) {
        e.preventDefault();
        form.reportValidity();
    } else {
        e.preventDefault(); // Keep this to stop the default page reload
        
        // 1. Gather all the form data automatically
        const formData = new FormData(form);

        // 2. Send the data to your Flask backend
        fetch('https://staymitti.pythonanywhere.com/submit-booking', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                // 3. If the server says OK, show your custom alert and redirect
                const guestName = document.getElementById('fullName').value;
                const finalHotel = hotelName || "your stay";
                
                alert(`Thank you, ${guestName}!\nYour booking for ${finalHotel} is confirmed.\nA confirmation voucher will be sent to your email shortly.`);
                
                window.location.href = 'StayMitti.html';
            } else {
                alert("Oops! Something went wrong with the booking.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Network error. Please check your internet connection and try again.");
        });
    }
});
});