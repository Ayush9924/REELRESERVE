const express = require('express');
const router = express.Router();
const {
  holdSeats,
  applyOffer,
  confirmBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  deleteBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.post('/hold', protect, holdSeats);
router.post('/confirm', protect, confirmBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.post('/:id/apply-offer', protect, applyOffer);
router.post('/:id/cancel', protect, cancelBooking);
router.delete('/:id', protect, deleteBooking);

module.exports = router;

