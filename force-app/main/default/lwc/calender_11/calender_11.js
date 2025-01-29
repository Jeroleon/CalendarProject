import { LightningElement, track } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import flatpickrJs from '@salesforce/resourceUrl/flatpickrJs';
import flatpickrCss from '@salesforce/resourceUrl/flatpickrCss';
// import saveBooking from '@salesforce/apex/BookingController.saveBooking'; // Apex method to save booking
import getBookings from '@salesforce/apex/BookingController.getBookings'; // Apex method to fetch bookings
import saveBookingDetails from '@salesforce/apex/BookingController.saveBookingDetails'; // Apex method to save booking details

export default class CalendarBooking extends LightningElement {
    @track selectedDate = '';
    @track timeSlots = [
        { id: '1', time: '8:10 AM', isSelected: false, isBooked: false },
        { id: '2', time: '9:30 AM', isSelected: false, isBooked: false },
        { id: '3', time: '12:30 PM', isSelected: false, isBooked: false },
        { id: '4', time: '5:00 PM', isSelected: false, isBooked: false },
        { id: '5', time: '9:00 PM', isSelected: false, isBooked: false },
        { id: '6', time: '10:30 PM', isSelected: false, isBooked: false }
    ];

    flatpickrInitialized = false;

    // Fetch bookings on component load
    connectedCallback() {
        this.fetchBookings();
    }

    // Initialize Flatpickr
    renderedCallback() {
        if (!this.flatpickrInitialized) {
            this.flatpickrInitialized = true;
            Promise.all([
                loadScript(this, flatpickrJs),
                loadStyle(this, flatpickrCss)
            ])
                .then(() => {
                    this.initializeFlatpickr();
                })
                .catch((error) => {
                    console.error('Error loading Flatpickr:', error);
                });
        }
    }

    initializeFlatpickr() {
        const input = this.template.querySelector('.flatpickr-input');
        flatpickr(input, {
            dateFormat: 'Y-m-d',
            minDate: 'today',
            onChange: this.handleDateChange.bind(this)
        });
    }

    handleDateChange(selectedDates) {
        if (selectedDates.length > 0) {
            const date = selectedDates[0];
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            this.selectedDate = `${year}-${month}-${day}`;
        } else {
            this.selectedDate = '';
        }
        this.resetSlots();
    }

    handleSlotClick(event) {
        const selectedId = event.target.dataset.id; // Get the ID of the clicked slot
        this.timeSlots = this.timeSlots.map((slot) => {
            // Toggle `isSelected` only for the clicked slot, and ensure others are deselected
            if (slot.id === selectedId && !slot.isBooked) {
                return { ...slot, isSelected: !slot.isSelected };
            }
            return { ...slot, isSelected: false }; // Deselect other slots
        });
    }
    get isSlotSelected() {
        return this.timeSlots.some((slot) => slot.isSelected);

        

    }

    get isBookNowDisabled() {
    // Check if any slot is selected
    return !this.timeSlots.some((slot) => slot.isSelected);
}


    handleBookNow() {
        if (!this.selectedDate) {
            alert('Please select a date before booking a slot.');
            return;
        }
        console.log('Selected Date:', this.selectedDate);
        console.log('timeslot:', this.timeSlots);

        

        const selectedSlot = this.timeSlots.find((slot) => slot.isSelected && !slot.isBooked);
        if (!selectedSlot) {
            alert('Please select a valid time slot.');
            return;
        }
        console.log('Selected Slot:', selectedSlot);

        // Save the booking in Salesforce                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
        const bookingData = {
            Date__c: this.selectedDate,
            Time__c: selectedSlot.time,
            Slot_Id__c: selectedSlot.id
        };

        saveBookingDetails({ booking: bookingData })
            .then(() => {
                alert(`Booking Confirmed!\nDate: ${this.selectedDate}\nTime: ${selectedSlot.time}`);
                selectedSlot.isBooked = true;
                this.timeSlots = this.timeSlots.map((slot) =>
                    slot.id === selectedSlot.id ? { ...slot, isBooked: true, isSelected: false } : slot
                );
            })
            .catch((error) => {
                console.error('Error saving booking:', error);
                alert('Failed to book the slot. Please try again.');
            });
    }

    resetSlots() {
        this.timeSlots = this.timeSlots.map((slot) => ({ ...slot, isSelected: false }));
    }

    fetchBookings() {
        getBookings()
            .then((bookings) => {
                const bookedSlots = bookings.map((booking) => booking.Slot_Id__c);
                this.timeSlots = this.timeSlots.map((slot) => ({
                    ...slot,
                    isBooked: bookedSlots.includes(slot.id)
                }));
            })
            .catch((error) => {
                console.error('Error fetching bookings:', error);
            });
    }
}
