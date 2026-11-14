const express = require('express');
const router = express.Router();
const {
  getCinemas,
  getCinemaById,
  createCinema,
  updateCinema,
  deleteCinema,
} = require('../controllers/cinemaController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/')
  .get(getCinemas)
  .post(protect, adminOnly, createCinema);

router.route('/:id')
  .get(getCinemaById)
  .put(protect, adminOnly, updateCinema)
  .delete(protect, adminOnly, deleteCinema);

module.exports = router;

