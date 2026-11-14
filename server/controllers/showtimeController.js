const Showtime = require('../models/Showtime');
const Screen = require('../models/Screen');
const Booking = require('../models/Booking');

// @desc    Get showtimes with filters
// @route   GET /api/showtimes
// @access  Public
exports.getShowtimes = async (req, res, next) => {
  try {
    const { movieId, cinemaId, date } = req.query;
    const query = { status: 'scheduled' };

    if (movieId) query.movieId = movieId;
    if (cinemaId) query.cinemaId = cinemaId;
    if (date) query.date = date;

    const showtimes = await Showtime.find(query)
      .populate('movieId', 'title duration rating poster certification')
      .populate('cinemaId', 'name city address facilities')
      .populate('screenId', 'name screenType capacity')
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({ success: true, count: showtimes.length, data: showtimes });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single showtime with screen layout and booked/held seats
// @route   GET /api/showtimes/:id
// @access  Public
exports.getShowtimeById = async (req, res, next) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movieId')
      .populate('cinemaId')
      .populate('screenId');

    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found' });
    }

    // Find all active bookings or holds for this showtime
    // Active holds: bookingStatus is 'confirmed' OR (bookingStatus is 'held' AND holdExpiresAt > Date.now())
    const now = new Date();
    const activeBookings = await Booking.find({
      showtimeId: showtime._id,
      $or: [
        { bookingStatus: 'confirmed' },
        { bookingStatus: 'held', holdExpiresAt: { $gt: now } },
      ],
    }).select('seats bookingStatus holdExpiresAt');

    // Compile list of unavailable seats
    const occupiedSeats = [];
    activeBookings.forEach((b) => {
      b.seats.forEach((seat) => {
        occupiedSeats.push({
          row: seat.row,
          number: seat.number,
          status: b.bookingStatus === 'confirmed' ? 'booked' : 'held',
        });
      });
    });

    res.status(200).json({
      success: true,
      data: {
        showtime,
        occupiedSeats,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create showtime (Admin)
// @route   POST /api/showtimes
// @access  Private/Admin
exports.createShowtime = async (req, res, next) => {
  try {
    const { movieId, cinemaId, screenId, date, startTime, pricing } = req.body;

    // Check for overlapping showtime on the same screen
    const conflict = await Showtime.findOne({
      screenId,
      date,
      startTime,
      status: 'scheduled',
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: 'A screening is already scheduled on this screen at the specified date and time',
      });
    }

    const showtime = await Showtime.create({
      movieId,
      cinemaId,
      screenId,
      date,
      startTime,
      pricing: pricing || { regular: 250, gold: 380, premium: 520 },
      status: 'scheduled',
    });

    res.status(201).json({ success: true, data: showtime });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete/Cancel showtime (Admin)
// @route   DELETE /api/showtimes/:id
// @access  Private/Admin
exports.deleteShowtime = async (req, res, next) => {
  try {
    const showtime = await Showtime.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found' });
    }
    res.status(200).json({ success: true, message: 'Showtime cancelled successfully' });
  } catch (err) {
    next(err);
  }
};

