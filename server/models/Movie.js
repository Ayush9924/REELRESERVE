const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide movie title'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide description'],
    },
    poster: {
      type: String,
      required: [true, 'Please provide poster image URL'],
    },
    backdrop: {
      type: String,
      default: '',
    },
    genre: {
      type: [String],
      required: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
      default: 'English',
      index: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 8.0,
    },
    certification: {
      type: String,
      enum: ['U', 'UA', 'A', 'PG-13', 'R'],
      default: 'UA',
    },
    director: {
      type: String,
      default: '',
    },
    cast: {
      type: [String],
      default: [],
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon'],
      default: 'now_showing',
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);

