import { LightningElement, track } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import flatpickrJs from '@salesforce/resourceUrl/flatpickrJs';
import flatpickrCss from '@salesforce/resourceUrl/flatpickrCss';

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
    isSlotSelected=false;

    get isSlotSelected() {
        return this.timeSlots.some((slot) => slot.isSelected && !slot.isBooked);
    }

    renderedCallback() {
        if (!this.flatpickrInitialized) {
            this.flatpickrInitialized = true;

            // Load Flatpickr JS and CSS
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
            dateFormat: 'Y-m-d', // Format: Year-Month-Day
            minDate: 'today', // Disable past dates
            onChange: this.handleDateChange.bind(this)
        });
    }

    handleDateChange(selectedDates) {
        if (selectedDates.length > 0) {
            const date = selectedDates[0];
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
            const day = String(date.getDate()).padStart(2, '0');
            this.selectedDate = `${year}-${month}-${day}`;
        } else {
            this.selectedDate = '';
        }
        this.resetSlots();
    }

    handleSlotClick(event) {
        console.log('event',event);
        console.log('event.target.dataset.id',event.target.dataset.id);
        const selectedId = event.target.dataset.id;
        this.timeSlots = this.timeSlots.map((slot) => ({
            ...slot,
            isSelected: slot.id === selectedId && !slot.isBooked ? !slot.isSelected : true
        }));
    }

    handleBookNow() {

        if (!this.selectedDate) {
            alert('Please select a date before booking a slot.');
            return; // Prevent further execution if date is not selected
        }
        
        const selectedSlot = this.timeSlots.find((slot) => slot.isSelected && !slot.isBooked);
        if (selectedSlot) {
            selectedSlot.isBooked = true; // Mark as booked
            selectedSlot.isSelected = false; // Deselect the slot
            this.timeSlots = this.timeSlots.filter((slot) => !slot.isBooked); // Remove booked slots from the array
            alert(`Booking Confirmed!\nDate: ${this.selectedDate}\nTime: ${selectedSlot.time}`);
        }
    }
    

    resetSlots() {
        this.timeSlots = this.timeSlots.map((slot) => ({ ...slot, isSelected: false }));
    }
}