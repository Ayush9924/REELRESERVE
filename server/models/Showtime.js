const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: true,
      index: true,
    },
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: true,
      index: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD for easy querying
      required: true,
      index: true,
    },
    startTime: {
      type: String, // e.g. "18:30" or "06:30 PM"
      required: true,
    },
    endTime: {
      type: String, // e.g. "21:15"
    },
    pricing: {
      regular: { type: Number, default: 250 },
      gold: { type: Number, default: 380 },
      premium: { type: Number, default: 520 },
    },
    status: {
      type: String,
      enum: ['scheduled', 'cancelled', 'completed'],
      default: 'scheduled',
    },
  },
  { timestamps: true }
);

// Compound index to help avoid overlapping screen schedules
showtimeSchema.index({ screenId: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('Showtime', showtimeSchema);

