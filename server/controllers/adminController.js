const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Showtime = require('../models/Showtime');
const User = require('../models/User');
const Offer = require('../models/Offer');

// @desc    Get Admin Dashboard KPI metrics and charts
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalMovies,
      totalCinemas,
      totalCustomers,
      confirmedBookings,
      recentBookings,
    ] = await Promise.all([
      Movie.countDocuments(),
      Cinema.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Booking.find({ bookingStatus: 'confirmed' }),
      Booking.find()
        .populate('userId', 'name email')
        .populate({
          path: 'showtimeId',
          populate: ['movieId', 'cinemaId'],
        })
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalBookingsCount = confirmedBookings.length;

    // Daily revenue analytics for chart (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      last7Days.push(dateStr);
    }

    const revenueByDay = last7Days.map((day) => {
      const dayTotal = confirmedBookings
        .filter((b) => b.createdAt && b.createdAt.toISOString().split('T')[0] === day)
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      return {
        date: day.slice(5), // MM-DD
        revenue: dayTotal,
      };
    });

    // Booking status distribution
    const allBookings = await Booking.find();
    const statusCounts = {
      confirmed: 0,
      cancelled: 0,
      held: 0,
    };
    allBookings.forEach((b) => {
      if (statusCounts[b.bookingStatus] !== undefined) {
        statusCounts[b.bookingStatus]++;
      }
    });

    const statusDistribution = [
      { name: 'Confirmed', value: statusCounts.confirmed },
      { name: 'Cancelled', value: statusCounts.cancelled },
      { name: 'Held/Pending', value: statusCounts.held },
    ];

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalRevenue,
          totalBookings: totalBookingsCount,
          totalCustomers,
          totalMovies,
          totalCinemas,
        },
        revenueChart: revenueByDay,
        statusDistribution,
        recentBookings,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, q } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.bookingStatus = status;
    }
    if (q) {
      query.bookingId = { $regex: q, $options: 'i' };
    }

    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone')
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

// @desc    Get all registered customers (Admin)
// @route   GET /api/admin/customers
// @access  Private/Admin
exports.getAllCustomers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const query = { role: 'customer' };
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const customers = await User.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: customers.length, data: customers });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle Customer Active Status
// @route   PUT /api/admin/customers/:id/toggle-status
// @access  Private/Admin
exports.toggleCustomerStatus = async (req, res, next) => {
  try {
    const customer = await User.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    customer.isActive = !customer.isActive;
    await customer.save();
    res.status(200).json({ success: true, data: customer });
  } catch (err) {
    next(err);
  }
};

// @desc    Offers endpoints (Admin & Public)
exports.getOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: offers });
  } catch (err) {
    next(err);
  }
};

exports.createOffer = async (req, res, next) => {
  try {
    const offer = await Offer.create(req.body);
    res.status(201).json({ success: true, data: offer });
  } catch (err) {
    next(err);
  }
};

