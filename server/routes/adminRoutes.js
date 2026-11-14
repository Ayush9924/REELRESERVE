const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllBookings,
  getAllCustomers,
  toggleCustomerStatus,
  getOffers,
  createOffer,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// Public offers endpoint
router.get('/offers', getOffers);

// Admin-protected routes
router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/bookings', getAllBookings);
router.get('/customers', getAllCustomers);
router.put('/customers/:id/toggle-status', toggleCustomerStatus);
router.post('/offers', createOffer);

module.exports = router;

