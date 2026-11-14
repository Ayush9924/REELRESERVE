const Cinema = require('../models/Cinema');
const Screen = require('../models/Screen');

// @desc    Get all cinemas
// @route   GET /api/cinemas
// @access  Public
exports.getCinemas = async (req, res, next) => {
  try {
    const { city } = req.query;
    const query = city && city !== 'All' ? { city } : {};
    const cinemas = await Cinema.find(query).sort({ name: 1 });
    res.status(200).json({ success: true, count: cinemas.length, data: cinemas });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single cinema with its screens
// @route   GET /api/cinemas/:id
// @access  Public
exports.getCinemaById = async (req, res, next) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Cinema not found' });
    }
    const screens = await Screen.find({ cinemaId: cinema._id });
    res.status(200).json({
      success: true,
      data: {
        ...cinema.toObject(),
        screens,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create cinema (Admin)
// @route   POST /api/cinemas
// @access  Private/Admin
exports.createCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.create(req.body);
    // Automatically create a default Screen 1 if requested
    await Screen.create({
      cinemaId: cinema._id,
      name: 'Screen 1',
      screenType: 'IMAX Laser',
      capacity: 80,
    });
    res.status(201).json({ success: true, data: cinema });
  } catch (err) {
    next(err);
  }
};

// @desc    Update cinema (Admin)
// @route   PUT /api/cinemas/:id
// @access  Private/Admin
exports.updateCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Cinema not found' });
    }
    res.status(200).json({ success: true, data: cinema });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete cinema (Admin)
// @route   DELETE /api/cinemas/:id
// @access  Private/Admin
exports.deleteCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.findByIdAndDelete(req.params.id);
    if (!cinema) {
      return res.status(404).json({ success: false, message: 'Cinema not found' });
    }
    await Screen.deleteMany({ cinemaId: req.params.id });
    res.status(200).json({ success: true, message: 'Cinema and screens removed successfully' });
  } catch (err) {
    next(err);
  }
};

