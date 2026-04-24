document.getElementById('addResortForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Stop page from refreshing

    // Grab comma-separated strings and turn them into neat Arrays
    const rawImages = document.getElementById('images').value;
    const imagesArray = rawImages.split(',').map(img => img.trim()).filter(img => img !== "");

    const rawAmenities = document.getElementById('amenities').value;
    const amenitiesArray = rawAmenities.split(',').map(item => item.trim()).filter(item => item !== "");

    // Package the data exactly how our Flask backend expects it
    const newResort = {
        name: document.getElementById('name').value,
        location: document.getElementById('location').value,
        price: parseInt(document.getElementById('price').value),
        rating: parseFloat(document.getElementById('rating').value),
        tag: document.getElementById('tag').value,
        description: document.getElementById('description').value,
        images: imagesArray,
        amenities: amenitiesArray,
        airport: document.getElementById('airport').value,
        railway: document.getElementById('railway').value,
        mapUrl: document.getElementById('mapUrl').value
    };

    // Send the data to the Flask API
    fetch('https://staymitti.pythonanywhere.com/api/resorts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newResort)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert(data.message + "\n\nCheck your homepage, the new resort is live!");
            document.getElementById('addResortForm').reset(); // Clear the form
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Failed to connect to the server. Is your Flask app running?");
    });
});