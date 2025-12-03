// Class modal functions
function selectClassAndClose(classValue) {
    document.querySelector(`input[name="seatClass"][value="${classValue}"]`).checked = true;
    
    // Close the modal
    document.getElementById('economyModal').style.display = 'none';
    document.getElementById('businessModal').style.display = 'none';
    document.getElementById('firstModal').style.display = 'none';
    
    // Trigger change event to update prices
    const event = new Event('change', { bubbles: true });
    document.querySelector(`input[name="seatClass"][value="${classValue}"]`).dispatchEvent(event);
}

// Close modals when clicking the X button
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.modal .close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('flightSearchForm');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const searchButton = document.getElementById('searchFlightsButton');
    const resultsContainer = document.getElementById('searchResultsContainer');
    const flightList = resultsContainer.querySelector('.flight-list');
    const bookingModal = document.getElementById('bookingModal');
    const closeBookingModal = document.getElementById('closeBookingModal');
    const cancelBookingBtn = document.getElementById('cancelBookingBtn');
    const bookingForm = document.getElementById('bookingForm');
    const sortBy = document.getElementById('sortBy');
    const priceRange = document.getElementById('priceRange');
    const priceLabel = document.getElementById('priceLabel');
    const filterDirect = document.getElementById('filterDirect');
    const passengerCount = document.getElementById('passengerCount');
    
    let currentFlights = [];
    let selectedFlight = null;
    let bookedFlights = [];

    // Function to display messages
    function showMessage(text, isError = false) {
        messageText.textContent = text;
        messageBox.style.backgroundColor = isError ? '#dc3545' : '#28a745';
        messageBox.style.display = 'block';
        setTimeout(() => {
            messageBox.style.opacity = '1';
        }, 10);

        setTimeout(() => {
            messageBox.style.opacity = '0';
            setTimeout(() => {
                messageBox.style.display = 'none';
            }, 300);
        }, 3000);
    }
    
    // Generate mock flights with more realistic data
    function generateMockFlights(origin, destination, passengerCount) {
        const flights = [];
        const flightCount = Math.floor(Math.random() * 5) + 4; // 4-8 flights
        for (let i = 0; i < flightCount; i++) {
            const departureHour = Math.floor(Math.random() * 18) + 6; // 6 AM to 12 AM
            const departureMin = Math.random() > 0.5 ? 0 : 30;
            const duration = Math.floor(Math.random() * 10) + 2; // 2-12 hours
            
            // More realistic stops based on duration
            let stops = 0;
            if (duration <= 4) {
                stops = Math.random() > 0.7 ? 0 : 1; // Short flights mostly direct
            } else if (duration <= 8) {
                stops = Math.random() > 0.5 ? 1 : Math.random() > 0.5 ? 0 : 2; // Medium flights, some with 1-2 stops
            } else {
                stops = Math.random() > 0.6 ? 2 : 1; // Long flights mostly 1-2 stops
            }
            
            const arrivalHour = (departureHour + duration) % 24;
            const arrivalMin = departureMin;

            const basePrice = Math.random() * 800 + 200;
            const pricePerPassenger = basePrice + (passengerCount - 1) * (basePrice * 0.8);

            flights.push({
                flightNumber: `SB${Math.floor(Math.random() * 900) + 100}`,
                from: origin,
                to: destination,
                departureTime: `${String(departureHour).padStart(2, '0')}:${String(departureMin).padStart(2, '0')}`,
                arrivalTime: `${String(arrivalHour).padStart(2, '0')}:${String(arrivalMin).padStart(2, '0')}`,
                duration: duration,
                stops: stops,
                economyPrice: pricePerPassenger.toFixed(1),
                businessPrice: (pricePerPassenger * 2).toFixed(2),
                firstPrice: (pricePerPassenger * 4).toFixed(2),
                price: pricePerPassenger.toFixed(2), // Default to economy
                airline: 'Silverblue Airlines',
                aircraft: ['Boeing 737', 'Airbus A320', 'Airbus A380'][Math.floor(Math.random() * 3)],
                isDirect: stops === 0
            });
        }
        return flights.sort((a, b) => a.price - b.price);
    }

    // Generate seat map
    function generateSeatMap() {
        const seatMap = document.getElementById('seatMap');
        seatMap.innerHTML = '';
        const rows = 12;
        const cols = 6;
        
        for (let i = 1; i <= rows * cols; i++) {
            const seat = document.createElement('button');
            seat.type = 'button';
            seat.className = 'seat';
            seat.textContent = String.fromCharCode(64 + Math.ceil(i / cols)) + (i % cols === 0 ? cols : i % cols);
            
            // Randomly make some seats unavailable
            if (Math.random() > 0.8) {
                seat.classList.add('unavailable');
                seat.disabled = true;
            }
            
            seat.addEventListener('click', (e) => {
                e.preventDefault();
                if (!seat.classList.contains('unavailable')) {
                    seat.classList.toggle('selected');
                }
            });
            
            seatMap.appendChild(seat);
        }
    }

    // Generate passenger forms
    function generatePassengerForms(count) {
        const passengerForms = document.getElementById('passengerForms');
        passengerForms.innerHTML = '';
        
        for (let i = 1; i <= parseInt(count); i++) {
            const passengerForm = document.createElement('div');
            passengerForm.className = 'passenger-form';
            passengerForm.innerHTML = `
                <h4>Passenger ${i}</h4>
                <div class="form-group">
                    <label for="firstName${i}">First Name</label>
                    <input type="text" id="firstName${i}" placeholder="First Name" required>
                </div>
                <div class="form-group">
                    <label for="lastName${i}">Last Name</label>
                    <input type="text" id="lastName${i}" placeholder="Last Name" required>
                </div>
                <div class="form-group">
                    <label for="dateOfBirth${i}">Date of Birth</label>
                    <input type="date" id="dateOfBirth${i}" required>
                </div>
                <div class="form-group">
                    <label for="passport${i}">Passport Number</label>
                    <input type="text" id="passport${i}" placeholder="Passport Number">
                </div>
            `;
            passengerForms.appendChild(passengerForm);
        }
    }

    // Update price summary
    function updatePriceSummary() {
        if (!selectedFlight) return;
        
        const passengerCount = parseInt(document.getElementById('passengerCount').value);
        const basePrice = parseFloat(selectedFlight.price) * passengerCount;
        
        let addonsTotal = 0;
        document.querySelectorAll('.addon-options input[type="checkbox"]:checked').forEach(addon => {
            addonsTotal += parseInt(addon.value);
        });
        
        document.getElementById('basePrice').textContent = '$' + basePrice.toFixed(2);
        document.getElementById('addonsTotal').textContent = '$' + addonsTotal.toFixed(2);
        document.getElementById('totalPrice').textContent = '$' + (basePrice + addonsTotal).toFixed(2);
    }

    // Filter flights
    function filterAndSortFlights() {
        let filtered = [...currentFlights];
        
        // Price filter
        const maxPrice = parseFloat(priceRange.value);
        filtered = filtered.filter(f => parseFloat(f.price) <= maxPrice);
        
        // Direct flights filter
        if (filterDirect.checked) {
            filtered = filtered.filter(f => f.isDirect);
        }
        
        // Sort
        switch(sortBy.value) {
            case 'price-desc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'departure':
                filtered.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
                break;
            case 'duration':
                filtered.sort((a, b) => a.duration - b.duration);
                break;
            default: // price-asc
                filtered.sort((a, b) => a.price - b.price);
        }
        
        renderFlights(filtered);
    }

    // Render flights
    function renderFlights(flights) {
        flightList.innerHTML = '';
        
        if (flights.length === 0) {
            flightList.innerHTML = '<p style="text-align: center; padding: 20px;">No flights found matching your criteria.</p>';
            return;
        }
        
        const selectedClass = document.querySelector('input[name="seatClass"]:checked').value;
        
        flights.forEach(flight => {
            const flightCard = document.createElement('div');
            flightCard.className = 'flight-card';
            
            let displayPrice = flight.economyPrice;
            if (selectedClass === 'business') {
                displayPrice = flight.businessPrice;
            } else if (selectedClass === 'first') {
                displayPrice = flight.firstPrice;
            }
            
            flightCard.innerHTML = `
                <div class="flight-details">
                    <p><strong>${flight.flightNumber}</strong> - ${flight.airline}</p>
                    <p><strong>${flight.from}</strong> → <strong>${flight.to}</strong></p>
                    <p><strong>Departure:</strong> ${flight.departureTime} | <strong>Arrival:</strong> ${flight.arrivalTime}</p>
                    <p><strong>Duration:</strong> ${flight.duration}h | <strong>Stops:</strong> ${flight.stops === 0 ? 'Direct' : flight.stops}</p>
                    <p><strong>Aircraft:</strong> ${flight.aircraft}</p>
                </div>
                <div class="flight-price">
                    <p><strong>$${displayPrice}</strong> per person (${selectedClass})</p>
                    <button type="button" class="btn btn-book">Book Now</button>
                </div>
            `;
            flightList.appendChild(flightCard);

            flightCard.querySelector('.btn-book').addEventListener('click', (e) => {
                e.preventDefault();
                openBookingModal(flight);
            });
        });
        updateClassPrices();
    }

    // Open booking modal
    function openBookingModal(flight) {
        selectedFlight = flight;
        const passengerCount = document.getElementById('passengerCount').value;
        
        document.getElementById('selectedFlightInfo').innerHTML = `
            <p><strong>Flight:</strong> ${flight.flightNumber}</p>
            <p><strong>Route:</strong> ${flight.from} → ${flight.to}</p>
            <p><strong>Departure:</strong> ${flight.departureTime} | <strong>Arrival:</strong> ${flight.arrivalTime}</p>
            <p><strong>Passengers:</strong> ${passengerCount}</p>
        `;
        
        generatePassengerForms(passengerCount);
        generateSeatMap();
        updatePriceSummary();
        bookingModal.style.display = 'block';
    }

    // Close booking modal
    function closeModal() {
        bookingModal.style.display = 'none';
        selectedFlight = null;
    }

    closeBookingModal.addEventListener('click', closeModal);
    cancelBookingBtn.addEventListener('click', closeModal);

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === bookingModal) {
            closeModal();
        }
    });

    // Handle booking form submission
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validate all passenger forms are filled
        const passengerCount = parseInt(document.getElementById('passengerCount').value);
        for (let i = 1; i <= passengerCount; i++) {
            const firstName = document.getElementById(`firstName${i}`).value;
            const lastName = document.getElementById(`lastName${i}`).value;
            if (!firstName || !lastName) {
                showMessage('Please fill in all passenger details', true);
                return;
            }
        }

        // Validate contact info
        const email = document.getElementById('contactEmail').value;
        const phone = document.getElementById('contactPhone').value;
        if (!email || !phone) {
            showMessage('Please fill in contact information', true);
            return;
        }

        // Validate seat selection
        const selectedSeats = document.querySelectorAll('.seat.selected');
        if (selectedSeats.length === 0) {
            showMessage('Please select at least one seat', true);
            return;
        }

        if (selectedSeats.length !== passengerCount) {
            showMessage(`Please select seats for all ${passengerCount} passengers`, true);
            return;
        }

        // Validate terms
        if (!document.getElementById('agreeTerms').checked) {
            showMessage('You must agree to the terms and conditions', true);
            return;
        }

        // Process booking
        const bookingDetails = {
            flightNumber: selectedFlight.flightNumber,
            from: selectedFlight.from,
            to: selectedFlight.to,
            departureTime: selectedFlight.departureTime,
            passengers: passengerCount,
            totalPrice: document.getElementById('totalPrice').textContent,
            bookingRef: 'SB' + Math.random().toString(36).substr(2, 9).toUpperCase()
        };

        bookedFlights.push(bookingDetails);
        closeModal();
        showMessage(`Booking confirmed! Reference: ${bookingDetails.bookingRef}`);
    });

    // Update price summary when addons change
    document.addEventListener('change', (e) => {
        if (e.target.matches('.addon-options input[type="checkbox"]')) {
            updatePriceSummary();
        }
        // Update class prices when class is selected
        if (e.target.matches('input[name="seatClass"]')) {
            updateClassPrices();
        }
    });

    // Update class prices display
    function updateClassPrices() {
        if (!currentFlights || currentFlights.length === 0) return;
        
        const passengerCount = parseInt(document.getElementById('passengerCount').value);
        
        currentFlights.forEach(flight => {
            const economyPer = parseFloat(flight.economyPrice);
            const economyTotal = economyPer * passengerCount;
            const businessPer = parseFloat(flight.businessPrice);
            const businessTotal = businessPer * passengerCount;
            const firstPer = parseFloat(flight.firstPrice);
            const firstTotal = firstPer * passengerCount;
            
            document.getElementById('economyPrice').textContent = '$' + economyPer.toFixed(2) + ' per person, $' + economyTotal.toFixed(2) + ' total';
            document.getElementById('businessPrice').textContent = '$' + businessPer.toFixed(2) + ' per person, $' + businessTotal.toFixed(2) + ' total';
            document.getElementById('firstPrice').textContent = '$' + firstPer.toFixed(2) + ' per person, $' + firstTotal.toFixed(2) + ' total';
        });
    }

    // Handle filters and sorting
    sortBy.addEventListener('change', filterAndSortFlights);
    priceRange.addEventListener('input', () => {
        priceLabel.textContent = '$' + priceRange.value;
        filterAndSortFlights();
    });
    filterDirect.addEventListener('change', filterAndSortFlights);
    passengerCount.addEventListener('change', updatePriceSummary);
    
    // Re-render flights when seat class changes to show updated prices
    document.querySelectorAll('input[name="seatClass"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (currentFlights.length > 0) {
                filterAndSortFlights();
            }
        });
    });

    // Handle flight search
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const origin = document.getElementById('originInput').value.trim();
        const destination = document.getElementById('destinationInput').value.trim();
        const date = document.getElementById('dateInput').value;
        const passengers = document.getElementById('passengerCount').value;

        if (!origin || !destination || !date) {
            showMessage("Please fill in all required search fields.", true);
            return;
        }

        if (origin === destination) {
            showMessage("Origin and destination must be different.", true);
            return;
        }
        
        searchButton.textContent = 'Searching...';
        searchButton.disabled = true;

        setTimeout(() => {
            searchButton.textContent = 'Search Flights';
            searchButton.disabled = false;
            flightList.innerHTML = '';

            currentFlights = generateMockFlights(origin, destination, passengers);
            filterAndSortFlights();
            resultsContainer.style.display = 'block';
            showMessage(`Found ${currentFlights.length} flights from ${origin} to ${destination}`);
        }, 1500);
    });
});