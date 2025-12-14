// Class modal functions
function selectClassAndClose(classValue) {
    const radioInput = document.querySelector(`input[name="seatClass"][value="${classValue}"]`);
    if (radioInput) {
        radioInput.checked = true;
        
        // Trigger change event to update prices if the input is part of the current page's context
        const event = new Event('change', { bubbles: true });
        radioInput.dispatchEvent(event);
    }
}

// Mini search on index.html
document.addEventListener('DOMContentLoaded', () => {
    const miniSearchBtn = document.getElementById('miniSearchBtn');
    if (miniSearchBtn) {
        miniSearchBtn.addEventListener('click', () => {
            const origin = document.getElementById('miniOrigin').value;
            const destination = document.getElementById('miniDestination').value;
            const date = document.getElementById('miniDate').value;
            const passengers = document.getElementById('miniPassengers').value;
            if (origin && destination && date) {
                // Store search data in localStorage
                localStorage.setItem('searchData', JSON.stringify({ origin, destination, date, passengers }));
                window.location.href = 'flights.html';
            } else {
                alert('Please fill in origin, destination, and date.');
            }
        });
    }
});

// Close modals when clicking the X button or outside
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.modal .close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });
    
    window.addEventListener('click', (event) => {
        // Check if the clicked element is a modal and the click is outside its content
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });

    // --- Flight Search and Results Logic (for flights.html and booking.html) ---
    const flightSearchForm = document.getElementById('flightSearchForm');
    const searchButton = document.getElementById('searchFlightsButton');
    const resultsContainer = document.getElementById('searchResultsContainer');
    const flightList = resultsContainer ? resultsContainer.querySelector('.flight-list') : null;
    const sortBy = document.getElementById('sortBy');
    const priceRange = document.getElementById('priceRange');
    const priceLabel = document.getElementById('priceLabel');
    const filterDirect = document.getElementById('filterDirect');
    const passengerCountSelect = document.getElementById('passengerCount'); // Renamed to avoid conflict

    // Run this section if results container is present (for booking.html or flights.html)
    if (resultsContainer && flightList) {
        // Load search data from localStorage if available
        const searchData = localStorage.getItem('searchData');
        if (searchData) {
            const data = JSON.parse(searchData);
            // If on booking.html, directly generate flights
            if (window.location.pathname.includes('flights.html')) {
                currentFlights = generateMockFlights(data.origin, data.destination, data.passengers);
                filterAndSortFlights();
                if (resultsContainer) resultsContainer.style.display = 'block';
                localStorage.removeItem('searchData'); // Clear after use
            } else if (flightSearchForm) {
                // On flights.html, populate form and auto-search
                document.getElementById('originInput').value = data.origin;
                document.getElementById('destinationInput').value = data.destination;
                document.getElementById('dateInput').value = data.date;
                document.getElementById('passengerCount').value = data.passengers;
                localStorage.removeItem('searchData'); // Clear after use
                // Auto-search
                setTimeout(() => {
                    flightSearchForm.dispatchEvent(new Event('submit'));
                }, 100);
            }
        }

        let currentFlights = [];
        let selectedFlightForBooking = null; // Renamed to avoid conflict with booking modal's selectedFlight

        // Function to display messages
        function showMessage(text, isError = false) {
            const messageBox = document.getElementById('messageBox');
            const messageText = document.getElementById('messageText');
            if (!messageBox || !messageText) return; // Exit if message elements are not found

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
            // Function to determine realistic stops based on flight duration
            function calculateStops(duration) {
                if (duration <= 1) {
                    return 0; // Very short: direct
                } else if (duration <= 4) {
                    return Math.random() > 0.8 ? 0 : 1; // Short flights mostly direct
                } else if (duration <= 8) {
                    return Math.random() > 0.5 ? 1 : (Math.random() > 0.5 ? 0 : 2); // Medium flights, mix of stops
                } else {
                    return Math.random() > 0.6 ? 2 : 1; // Long flights mostly 1-2 stops
                }
            }
            
            const flights = [];
            const flightCount = Math.floor(Math.random() * 5) + 4; // 4-8 flights
            for (let i = 0; i < flightCount; i++) {
                const departureHour = Math.floor(Math.random() * 24);
                const departureMin = Math.random() > 0.5 ? 0 : 30;
                const duration = Math.floor(Math.random() * 15) + 1; // 1-15 hours
                
                const stops = calculateStops(duration);
                const arrivalHour = (departureHour + duration) % 24;
                const arrivalMin = departureMin;

                const basePrice = Math.random() * 800 + 200;
                // Example markups for different classes
                const economyPricePerPerson = basePrice;
                const businessPricePerPerson = basePrice * 1.8;
                const firstPricePerPerson = basePrice * 3.5;

                flights.push({
                    flightNumber: `SB${Math.floor(Math.random() * 900) + 100}`,
                    from: origin,
                    to: destination,
                    departureTime: `${String(departureHour).padStart(2, '0')}:${String(departureMin).padStart(2, '0')}`,
                    arrivalTime: `${String(arrivalHour).padStart(2, '0')}:${String(arrivalMin).padStart(2, '0')}`,
                    duration: duration,
                    stops: stops,
                    economyPrice: economyPricePerPerson.toFixed(1),
                    businessPrice: businessPricePerPerson.toFixed(2),
                    firstPrice: firstPricePerPerson.toFixed(2),
                    airline: 'Silverblue Airlines',
                    aircraft: ['Boeing 737', 'Airbus A320', 'Airbus A380'][Math.floor(Math.random() * 3)],
                    isDirect: stops === 0
                });
            }
            // Sort by default by price (economy)
            return flights.sort((a, b) => parseFloat(a.economyPrice) - parseFloat(b.economyPrice));
        }

        // Generate seat map (part of booking modal)
        function generateSeatMap() {
            const seatMap = document.getElementById('seatMap');
            if (!seatMap) return;
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

        // Generate passenger forms (part of booking modal)
        function generatePassengerForms(count) {
            const passengerForms = document.getElementById('passengerForms');
            if (!passengerForms) return;
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

        // Update price summary (part of booking modal)
        function updatePriceSummary() {
            if (!selectedFlightForBooking) return;
            
            const pCount = parseInt(document.getElementById('passengerCount').value);
            let basePrice = 0;
            const selectedClass = document.querySelector('input[name="seatClass"]:checked');
            
            if (selectedClass) {
                if (selectedClass.value === 'economy') {
                    basePrice = parseFloat(selectedFlightForBooking.economyPrice) * pCount;
                } else if (selectedClass.value === 'business') {
                    basePrice = parseFloat(selectedFlightForBooking.businessPrice) * pCount;
                } else if (selectedClass.value === 'first') {
                    basePrice = parseFloat(selectedFlightForBooking.firstPrice) * pCount;
                }
            }
            
            let addonsTotal = 0;
            document.querySelectorAll('.addon-options input[type="checkbox"]:checked').forEach(addon => {
                addonsTotal += parseInt(addon.value);
            });
            
            const basePriceEl = document.getElementById('basePrice');
            if(basePriceEl) basePriceEl.textContent = '$' + basePrice.toFixed(2);
            const addonsTotalEl = document.getElementById('addonsTotal');
            if(addonsTotalEl) addonsTotalEl.textContent = '$' + addonsTotal.toFixed(2);
            const totalPriceEl = document.getElementById('totalPrice');
            if(totalPriceEl) totalPriceEl.textContent = '$' + (basePrice + addonsTotal).toFixed(2);
        }

        // Filter flights
        function filterAndSortFlights() {
            let filtered = [...currentFlights];
            
            // Price filter
            const maxPrice = parseFloat(priceRange.value);
            // Get current selected class to filter by
            const selectedClass = document.querySelector('input[name="seatClass"]:checked')?.value || 'economy';
            filtered = filtered.filter(f => {
                let price = 0;
                if (selectedClass === 'economy') price = parseFloat(f.economyPrice);
                else if (selectedClass === 'business') price = parseFloat(f.businessPrice);
                else if (selectedClass === 'first') price = parseFloat(f.firstPrice);
                return price <= maxPrice;
            });
            
            // Direct flights filter
            if (filterDirect.checked) {
                filtered = filtered.filter(f => f.isDirect);
            }
            
            // Sort
            switch(sortBy.value) {
                case 'price-desc':
                    filtered.sort((a, b) => {
                        let priceA = 0, priceB = 0;
                        if (selectedClass === 'economy') { priceA = parseFloat(a.economyPrice); priceB = parseFloat(b.economyPrice); }
                        else if (selectedClass === 'business') { priceA = parseFloat(a.businessPrice); priceB = parseFloat(b.businessPrice); }
                        else if (selectedClass === 'first') { priceA = parseFloat(a.firstPrice); priceB = parseFloat(b.firstPrice); }
                        return priceB - priceA;
                    });
                    break;
                case 'departure':
                    filtered.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
                    break;
                case 'duration':
                    filtered.sort((a, b) => a.duration - b.duration);
                    break;
                default: // price-asc
                    filtered.sort((a, b) => {
                        let priceA = 0, priceB = 0;
                        if (selectedClass === 'economy') { priceA = parseFloat(a.economyPrice); priceB = parseFloat(b.economyPrice); }
                        else if (selectedClass === 'business') { priceA = parseFloat(a.businessPrice); priceB = parseFloat(b.businessPrice); }
                        else if (selectedClass === 'first') { priceA = parseFloat(a.firstPrice); priceB = parseFloat(b.firstPrice); }
                        return priceA - priceB;
                    });
            }
            
            renderFlights(filtered);
        }

        // Render flights
        function renderFlights(flights) {
            if (!flightList) return;
            flightList.innerHTML = '';
            
            if (flights.length === 0) {
                flightList.innerHTML = '<p style="text-align: center; padding: 20px;">No flights found matching your criteria.</p>';
                return;
            }
            
            const selectedClass = document.querySelector('input[name="seatClass"]:checked')?.value || 'economy';
            
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
            updateClassPrices(); // Update prices display for selected class
        }

        // Open booking modal
        function openBookingModal(flight) {
            selectedFlightForBooking = flight; // Use the renamed variable
            const pCount = parseInt(document.getElementById('passengerCount').value); // Use renamed select
            
            // Elements for selected flight info are in bookingModal
            const selectedFlightInfo = document.getElementById('selectedFlightInfo');
            if (selectedFlightInfo) {
                selectedFlightInfo.innerHTML = `
                    <p><strong>Flight:</strong> ${flight.flightNumber}</p>
                    <p><strong>Route:</strong> ${flight.from} → ${flight.to}</p>
                    <p><strong>Departure:</strong> ${flight.departureTime} | <strong>Arrival:</strong> ${flight.arrivalTime}</p>
                    <p><strong>Passengers:</strong> ${pCount}</p>
                `;
            }
            
            generatePassengerForms(pCount);
            generateSeatMap();
            updatePriceSummary();
            
            const bookingModal = document.getElementById('bookingModal');
            if (bookingModal) {
                bookingModal.style.display = 'block';
            }
        }

        // Close booking modal
        function closeModal() {
            const bookingModal = document.getElementById('bookingModal');
            if (bookingModal) {
                bookingModal.style.display = 'none';
            }
            selectedFlightForBooking = null; // Reset
        }

        const closeBookingModal = document.getElementById('closeBookingModal');
        const cancelBookingBtn = document.getElementById('cancelBookingBtn');
        if (closeBookingModal) closeBookingModal.addEventListener('click', closeModal);
        if (cancelBookingBtn) cancelBookingBtn.addEventListener('click', closeModal);
        
        // Close modal when clicking outside
        const bookingModalElement = document.getElementById('bookingModal');
        if (bookingModalElement) {
            window.addEventListener('click', (event) => {
                if (event.target === bookingModalElement) {
                    closeModal();
                }
            });
        }

        // Handle booking form submission (only for modal)
        const bookingForm = document.querySelector('#bookingModal #bookingForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Validation logic
                const pCount = parseInt(document.getElementById('passengerCount').value);
                let allPassengerDetailsFilled = true;
                for (let i = 1; i <= pCount; i++) {
                    const firstNameInput = document.getElementById(`firstName${i}`);
                    const lastNameInput = document.getElementById(`lastName${i}`);
                    if (!firstNameInput || !lastNameInput || !firstNameInput.value.trim() || !lastNameInput.value.trim()) {
                        allPassengerDetailsFilled = false;
                        break;
                    }
                }

                if (!allPassengerDetailsFilled) {
                    showMessage('Please fill in all passenger details', true);
                    return;
                }

                const emailInput = document.getElementById('contactEmail');
                const phoneInput = document.getElementById('contactPhone');
                if (!emailInput || !phoneInput || !emailInput.value.trim() || !phoneInput.value.trim()) {
                    showMessage('Please fill in contact information', true);
                    return;
                }

                const selectedSeats = document.querySelectorAll('.seat.selected');
                if (selectedSeats.length === 0) {
                    showMessage('Please select at least one seat', true);
                    return;
                }
                if (selectedSeats.length !== pCount) {
                    showMessage(`Please select seats for all ${pCount} passengers`, true);
                    return;
                }

                const agreeTermsInput = document.getElementById('agreeTerms');
                if (!agreeTermsInput || !agreeTermsInput.checked) {
                    showMessage('You must agree to the terms and conditions', true);
                    return;
                }

                // Process booking and redirect to confirmation page
                const bookingDetails = {
                    flightNumber: selectedFlightForBooking.flightNumber,
                    from: selectedFlightForBooking.from,
                    to: selectedFlightForBooking.to,
                    departureTime: selectedFlightForBooking.departureTime,
                    passengers: pCount,
                    totalPrice: document.getElementById('totalPrice').textContent,
                    bookingRef: 'SB' + Math.random().toString(36).substr(2, 9).toUpperCase()
                };

                // Store locally for now; could be sent to a server in a real app
                localStorage.setItem('lastBooking', JSON.stringify(bookingDetails));
                window.location.href = 'booking.html';
            });
        }

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
            
            const pCount = parseInt(document.getElementById('passengerCount').value);
            
            currentFlights.forEach(flight => {
                const economyPer = parseFloat(flight.economyPrice);
                const economyTotal = economyPer * pCount;
                const businessPer = parseFloat(flight.businessPrice);
                const businessTotal = businessPer * pCount;
                const firstPer = parseFloat(flight.firstPrice);
                const firstTotal = firstPer * pCount;
                
                const economyPriceEl = document.getElementById('economyPrice');
                if (economyPriceEl) economyPriceEl.textContent = '$' + economyPer.toFixed(2) + ' per person, $' + economyTotal.toFixed(2) + ' total';
                const businessPriceEl = document.getElementById('businessPrice');
                if (businessPriceEl) businessPriceEl.textContent = '$' + businessPer.toFixed(2) + ' per person, $' + businessTotal.toFixed(2) + ' total';
                const firstPriceEl = document.getElementById('firstPrice');
                if (firstPriceEl) firstPriceEl.textContent = '$' + firstPer.toFixed(2) + ' per person, $' + firstTotal.toFixed(2) + ' total';
            });
        }

        // Handle filters and sorting events
        if (sortBy) sortBy.addEventListener('change', filterAndSortFlights);
        if (priceRange) priceRange.addEventListener('input', () => {
            priceLabel.textContent = '$' + priceRange.value;
            filterAndSortFlights();
        });
        if (filterDirect) filterDirect.addEventListener('change', filterAndSortFlights);
        if (passengerCountSelect) passengerCountSelect.addEventListener('change', () => {
            const pCount = parseInt(passengerCountSelect.value);
            generatePassengerForms(pCount);
            updatePriceSummary(); // Recalculate prices based on new passenger count
            // Also re-render flights to show prices for new passenger count
            filterAndSortFlights(); 
        });
        
        // Re-render flights when seat class changes to show updated prices
        document.querySelectorAll('input[name="seatClass"]').forEach(radio => {
            radio.addEventListener('change', () => {
                if (currentFlights.length > 0) {
                    filterAndSortFlights();
                }
            });
        });

        // Handle flight search submission
        flightSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const origin = document.getElementById('originInput').value.trim();
            const destination = document.getElementById('destinationInput').value.trim();
            const date = document.getElementById('dateInput').value;
            const passengers = passengerCountSelect.value; // Use renamed select

            if (!origin || !destination || !date) {
                showMessage("Please fill in all required search fields.", true);
                return;
            }

            if (origin === destination) {
                showMessage("Origin and destination must be different.", true);
                return;
            }
            
            if (searchButton) {
                searchButton.textContent = 'Searching...';
                searchButton.disabled = true;
            }

            setTimeout(() => {
                if (searchButton) {
                    searchButton.textContent = 'Search Flights';
                    searchButton.disabled = false;
                }
                if (flightList) flightList.innerHTML = '';

                currentFlights = generateMockFlights(origin, destination, passengers);
                filterAndSortFlights();
                if (resultsContainer) resultsContainer.style.display = 'block';
                showMessage(`Found ${currentFlights.length} flights from ${origin} to ${destination}`);
            }, 1500);
        });
    }
    // --- End of Flight Search and Results Logic ---


    // --- Booking Confirmation Page Logic (for booking.html) ---
    // Check if we are on the booking confirmation page by looking for a specific element
    const bookingConfirmationDetails = document.getElementById('bookingConfirmationDetails');
    if (bookingConfirmationDetails) {
        // Logic to display booking details on booking.html
        const lastBooking = localStorage.getItem('lastBooking');
        if (lastBooking) {
            const bookingData = JSON.parse(lastBooking);
            // Display the booking data
            bookingConfirmationDetails.innerHTML = `
                <h3>Your Booking Reference: ${bookingData.bookingRef}</h3>
                <p><strong>Flight:</strong> ${bookingData.flightNumber}</p>
                <p><strong>Route:</strong> ${bookingData.from} → ${bookingData.to}</p>
                <p><strong>Departure Time:</strong> ${bookingData.departureTime}</p>
                <p><strong>Number of Passengers:</strong> ${bookingData.passengers}</p>
                <p><strong>Total Cost:</strong> ${bookingData.totalPrice}</p>
                <p>We have sent a confirmation email to your registered address.</p>
            `;
            // Clear the local storage item after displaying
            localStorage.removeItem('lastBooking');
        } else {
            // If no booking data is found, inform the user
            bookingConfirmationDetails.innerHTML = `
                <h3>No booking details found.</h3>
                <p>Please make a flight booking first.</p>
                <a href="flights.html" class="btn">Search Flights</a>
            `;
        }
        
        // Remove or hide elements that are not relevant to the confirmation page from booking.html
        // This ensures the booking.html only shows confirmation details.
        const elementsToRemove = [
            '#selectedFlightInfo', '#bookingForm', '#passengerForms', 
            '#seatMap', '.addon-options', '.price-summary', '.checkbox-group', 
            '.form-actions'
        ];
        elementsToRemove.forEach(selector => {
            const element = bookingConfirmationDetails.querySelector(selector);
            if (element) {
                element.remove();
            }
        });
    }
    // --- End of Booking Confirmation Page Logic ---
});