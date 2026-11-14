const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Showtime',
      required: true,
      index: true,
    },
    seats: [
      {
        row: { type: String, required: true },
        number: { type: Number, required: true },
        category: { type: String, enum: ['Premium', 'Gold', 'Regular'], default: 'Regular' },
        price: { type: Number, required: true },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    convenienceFee: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    offerCode: {
      type: String,
      default: null,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: ['held', 'confirmed', 'cancelled', 'expired'],
      default: 'held',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    // Atomic temporary hold: holds seats for 10 minutes
    holdExpiresAt: {
      type: Date,
      index: true,
    },
    qrCodeData: {
      type: String, // verifiable JSON payload string or base64 data
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);

