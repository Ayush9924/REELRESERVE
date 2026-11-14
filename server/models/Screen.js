const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema(
  {
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true, // e.g. "Screen 1 - IMAX Laser"
    },
    screenType: {
      type: String,
      enum: ['IMAX Laser', 'Dolby Atmos', '4DX', 'Gold Lounge', 'Standard 4K'],
      default: 'Standard 4K',
    },
    capacity: {
      type: Number,
      default: 80,
    },
    layoutConfig: {
      // Defines rows and category layout
      rows: {
        type: [String],
        default: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      },
      seatsPerRow: {
        type: Number,
        default: 10,
      },
      categories: [
        {
          name: { type: String, enum: ['Premium', 'Gold', 'Regular'] },
          rows: [String], // e.g. ['A', 'B'] for Premium
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Screen', screenSchema);

