const mongoose = require('mongoose');

const cinemaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      index: true,
    },
    address: {
      type: String,
      required: true,
    },
    facilities: {
      type: [String],
      default: ['Dolby Atmos', '4K Laser', 'Recliner Lounges', 'Food Court'],
    },
    screensCount: {
      type: Number,
      default: 4,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cinema', cinemaSchema);

