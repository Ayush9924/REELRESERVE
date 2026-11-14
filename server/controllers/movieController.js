const Movie = require('../models/Movie');

// @desc    Get all movies with filters & search
// @route   GET /api/movies
// @access  Public
exports.getMovies = async (req, res, next) => {
  try {
    const { status, genre, language, q, sort } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (genre && genre !== 'all') {
      query.genre = { $regex: new RegExp(genre, 'i') };
    }

    if (language && language !== 'all') {
      query.language = { $regex: new RegExp(language, 'i') };
    }

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { cast: { $elemMatch: { $regex: q, $options: 'i' } } },
      ];
    }

    let queryExec = Movie.find(query);

    // Sorting
    if (sort === 'rating') {
      queryExec = queryExec.sort({ rating: -1 });
    } else if (sort === 'releaseDate') {
      queryExec = queryExec.sort({ releaseDate: -1 });
    } else if (sort === 'title') {
      queryExec = queryExec.sort({ title: 1 });
    } else {
      queryExec = queryExec.sort({ createdAt: -1 });
    }

    const movies = await queryExec;
    res.status(200).json({ success: true, count: movies.length, data: movies });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
exports.getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.status(200).json({ success: true, data: movie });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new movie (Admin)
// @route   POST /api/movies
// @access  Private/Admin
exports.createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, data: movie });
  } catch (err) {
    next(err);
  }
};

// @desc    Update movie (Admin)
// @route   PUT /api/movies/:id
// @access  Private/Admin
exports.updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.status(200).json({ success: true, data: movie });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete movie (Admin)
// @route   DELETE /api/movies/:id
// @access  Private/Admin
exports.deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.status(200).json({ success: true, message: 'Movie removed successfully' });
  } catch (err) {
    next(err);
  }
};

