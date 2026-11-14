const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ['upi', 'card', 'netbanking'],
      required: true,
    },
    transactionReference: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      required: true,
    },
    isSimulated: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);

