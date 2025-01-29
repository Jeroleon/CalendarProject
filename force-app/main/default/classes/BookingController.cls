public with sharing class BookingController {
    
    @AuraEnabled
    public static void saveBookingDetails(String selectedDate, String selectedTime, String slotId) {
        try {
            Book_Apt__c booking = new Book_Apt__c();
            booking.Date__c = Date.valueOf(selectedDate); // Date handling remains the same
            booking.Time__c = selectedTime; // Time is treated as a string (if it's in text format like '9:00 AM')
            booking.Slot_Id__c = slotId; // Assuming Slot_Id__c is a custom field
            insert booking;
        } catch (Exception e) {
            throw new AuraHandledException('Error saving booking: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static List<Book_Apt__c> getBookings() {
        return [SELECT Date__c, Time__c, Slot_Id__c FROM Book_Apt__c];
    }
}
