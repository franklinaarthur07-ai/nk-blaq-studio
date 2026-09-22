const bookings = [];

function addBooking(booking) {
  bookings.push(booking);
  return booking;
}

function getAllBookings() {
  return bookings;
}

module.exports = { addBooking, getAllBookings };