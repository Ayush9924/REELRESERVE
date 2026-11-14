const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Payment = require('../models/Payment');
const Offer = require('../models/Offer');
const QRCode = require('qrcode');

// Generate unique human-readable booking ID
const generateBookingId = () => {
  const prefix = 'RR';
  const year = new Date().getFullYear();
  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${year}-${randomPart}${timestamp}`;
};

// @desc    Hold seats temporarily (10 mins) to prevent race-condition/double booking
// @route   POST /api/bookings/hold
// @access  Private
exports.holdSeats = async (req, res, next) => {
  try {
    const { showtimeId, seats } = req.body;
    const userId = req.user._id;

    if (!showtimeId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide showtime and at least one seat' });
    }

    const showtime = await Showtime.findById(showtimeId).populate('movieId screenId');
    if (!showtime) {
      return res.status(404).json({ success: false, message: 'Showtime not found' });
    }

    const now = new Date();

    // Check if ANY requested seat is already booked or currently actively held by someone else
    const activeBookings = await Booking.find({
      showtimeId,
      $or: [
        { bookingStatus: 'confirmed' },
        {
          bookingStatus: 'held',
          holdExpiresAt: { $gt: now },
          userId: { $ne: userId }, // allow current user to re-adjust their own cart
        },
      ],
    });

    const occupiedSeatKeys = new Set();
    activeBookings.forEach((b) => {
      b.seats.forEach((s) => {
        occupiedSeatKeys.add(`${s.row}-${s.number}`);
      });
    });

    const conflictingSeats = [];
    seats.forEach((seat) => {
      const key = `${seat.row}-${seat.number}`;
      if (occupiedSeatKeys.has(key)) {
        conflictingSeats.push(key);
      }
    });

    if (conflictingSeats.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Seats [${conflictingSeats.join(', ')}] are already reserved or held by another guest. Please select different seats.`,
        conflictingSeats,
      });
    }

    // Cancel any older non-confirmed holds for this user on this showtime
    await Booking.deleteMany({
      userId,
      showtimeId,
      bookingStatus: 'held',
    });

    // Calculate subtotal
    const subtotal = seats.reduce((acc, s) => acc + (s.price || 0), 0);
    const convenienceFee = Math.round(subtotal * 0.08); // 8% fee
    const totalAmount = subtotal + convenienceFee;

    // 10 minutes temporary lock
    const holdExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const bookingId = generateBookingId();

    const booking = await Booking.create({
      bookingId,
      userId,
      showtimeId,
      seats,
      subtotal,
      convenienceFee,
      discount: 0,
      totalAmount,
      bookingStatus: 'held',
      paymentStatus: 'pending',
      holdExpiresAt,
    });

    res.status(201).json({
      success: true,
      message: 'Seats held successfully for 10 minutes',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Apply coupon offer to held booking
// @route   POST /api/bookings/:id/apply-offer
// @access  Private
exports.applyOffer = async (req, res, next) => {
  try {
    const { code } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.bookingStatus !== 'held') {
      return res.status(400).json({ success: false, message: 'Cannot apply offer to finalized booking' });
    }

    const offer = await Offer.findOne({ code: code.toUpperCase(), isActive: true });
    if (!offer) {
      return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    if (booking.subtotal < (offer.minAmount || 0)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${offer.minAmount} required to apply this voucher.`,
      });
    }

    let discount = 0;
    if (offer.discountType === 'percentage') {
      discount = Math.round((booking.subtotal * offer.discountValue) / 100);
    } else {
      discount = offer.discountValue;
    }
    discount = Math.min(discount, booking.subtotal);

    const totalAmount = Math.max(0, booking.subtotal + booking.convenienceFee - discount);

    booking.offerCode = offer.code;
    booking.discount = discount;
    booking.totalAmount = totalAmount;
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Coupon ${offer.code} applied successfully!`,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Confirm simulated payment and finalize booking
// @route   POST /api/bookings/confirm
// @access  Private
exports.confirmBooking = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod, simulateFailure } = req.body;

    const booking = await Booking.findOne({ bookingId }).populate({
      path: 'showtimeId',
      populate: ['movieId', 'cinemaId', 'screenId'],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking record not found' });
    }

    // Verify hold has not expired
    if (booking.bookingStatus === 'expired' || (booking.bookingStatus === 'held' && new Date() > booking.holdExpiresAt)) {
      booking.bookingStatus = 'expired';
      await booking.save();
      return res.status(410).json({
        success: false,
        message: 'Your 10-minute seat reservation has expired. Please reselect your seats.',
      });
    }

    // Generate simulated transaction reference
    const txnRef = `TXN-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

    if (simulateFailure) {
      // Record simulated failure
      await Payment.create({
        bookingId: booking._id,
        amount: booking.totalAmount,
        method: paymentMethod || 'card',
        transactionReference: txnRef,
        status: 'failed',
      });

      return res.status(400).json({
        success: false,
        message: 'Simulated payment was declined by the issuing bank. Please retry.',
      });
    }

    // Simulated Success
    const payment = await Payment.create({
      bookingId: booking._id,
      amount: booking.totalAmount,
      method: paymentMethod || 'upi',
      transactionReference: txnRef,
      status: 'success',
    });

    // Generate Verifiable QR Code Data
    const qrPayload = JSON.stringify({
      bookingId: booking.bookingId,
      movie: booking.showtimeId.movieId.title,
      cinema: booking.showtimeId.cinemaId.name,
      screen: booking.showtimeId.screenId.name,
      date: booking.showtimeId.date,
      time: booking.showtimeId.startTime,
      seats: booking.seats.map((s) => `${s.row}${s.number}`),
      verified: true,
      issuer: 'REEL_RESERVE_ENGINE',
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      color: {
        dark: '#791D35',
        light: '#F6F2ED',
      },
      margin: 1,
      width: 250,
    });

    booking.bookingStatus = 'confirmed';
    booking.paymentStatus = 'completed';
    booking.qrCodeData = qrCodeDataUrl;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking successfully confirmed!',
      data: {
        booking,
        payment,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's personal booking history
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id, bookingStatus: { $ne: 'expired' } })
      .populate({
        path: 'showtimeId',
        populate: ['movieId', 'cinemaId', 'screenId'],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single booking details by booking ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId
      ? { $or: [{ _id: req.params.id }, { bookingId: req.params.id }] }
      : { bookingId: req.params.id };

    const booking = await Booking.findOne(query).populate({
      path: 'showtimeId',
      populate: ['movieId', 'cinemaId', 'screenId'],
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ensure customer only accesses their own booking (unless admin)
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied to this booking' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel booking (where permitted)
// @route   POST /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId
      ? { $or: [{ _id: req.params.id }, { bookingId: req.params.id }] }
      : { bookingId: req.params.id };

    const booking = await Booking.findOne(query);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = booking.paymentStatus === 'completed' ? 'refunded' : 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete/Remove booking from customer history
// @route   DELETE /api/bookings/:id
// @access  Private
exports.deleteBooking = async (req, res, next) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId
      ? { $or: [{ _id: req.params.id }, { bookingId: req.params.id }] }
      : { bookingId: req.params.id };

    const booking = await Booking.findOne(query);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to remove this booking' });
    }

    await Booking.deleteOne({ _id: booking._id });

    res.status(200).json({
      success: true,
      message: 'Booking removed from your history.',
    });
  } catch (err) {
    next(err);
  }
};

