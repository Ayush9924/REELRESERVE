require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Screen = require('../models/Screen');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Offer = require('../models/Offer');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/reel_reserve';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clear existing collections
    await Promise.all([
      User.deleteMany(),
      Movie.deleteMany(),
      Cinema.deleteMany(),
      Screen.deleteMany(),
      Showtime.deleteMany(),
      Booking.deleteMany(),
      Payment.deleteMany(),
      Offer.deleteMany(),
    ]);
    console.log('[Seed] Cleared existing collections');

    // 1. Seed Users (Admin & Customer)
    const adminPassword = await bcrypt.hash('Admin@123456', 10);
    const customerPassword = await bcrypt.hash('Customer@123456', 10);

    const users = await User.insertMany([
      {
        name: 'Alexander Vance',
        email: 'admin@reelreserve.demo',
        password: adminPassword,
        phone: '+91 99887 76655',
        role: 'admin',
        isActive: true,
      },
      {
        name: 'Elena Rostova',
        email: 'customer@reelreserve.demo',
        password: customerPassword,
        phone: '+91 98765 43210',
        role: 'customer',
        isActive: true,
      },
    ]);
    console.log(`[Seed] Seeded ${users.length} verified users`);

    // 2. Rich Movie Catalog (Hollywood + Premier Bollywood / Indian Blockbusters)
    const moviesData = [
      // Bollywood Blockbusters
      {
        title: 'Jawan: Extended Cut',
        description: 'A high-octane emotional action thriller where a man is driven by a personal vendetta to rectify the evils in society, keeping a promise made years ago to fight against injustice.',
        poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=600&auto=format&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=1200&auto=format&fit=crop',
        genre: ['Action', 'Thriller', 'Drama'],
        language: 'Hindi',
        duration: 169,
        releaseDate: new Date('2023-09-07'),
        rating: 8.6,
        certification: 'UA',
        director: 'Atlee Kumar',
        cast: ['Shah Rukh Khan', 'Nayanthara', 'Vijay Sethupathi', 'Deepika Padukone'],
        status: 'now_showing',
      },
      {
        title: 'Stree 2: Sarkate Ka Aatank',
        description: 'The town of Chanderi is haunted once again, this time by a terrifying headless monster known as Sarkata. Vicky and his loyal friends team up with the enigmatic Stree to rescue the women of the village.',
        poster: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=600&auto=format&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
        genre: ['Comedy', 'Horror'],
        language: 'Hindi',
        duration: 147,
        releaseDate: new Date('2024-08-15'),
        rating: 8.4,
        certification: 'UA',
        director: 'Amar Kaushik',
        cast: ['Rajkummar Rao', 'Shraddha Kapoor', 'Pankaj Tripathi', 'Abhishek Banerjee'],
        status: 'now_showing',
      },
      {
        title: 'RRR (Rise Roar Revolt)',
        description: 'A fearless revolutionary and an officer in the British force, who once shared an unbreakable bond, decide to join forces and wage war against the British Raj in 1920s India.',
        poster: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=600&auto=format&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200&auto=format&fit=crop',
        genre: ['Action', 'Drama', 'History'],
        language: 'Telugu',
        duration: 187,
        releaseDate: new Date('2022-03-25'),
        rating: 8.9,
        certification: 'UA',
        director: 'S. S. Rajamouli',
        cast: ['N. T. Rama Rao Jr.', 'Ram Charan', 'Alia Bhatt', 'Ajay Devgn'],
        status: 'now_showing',
      },
      {
        title: 'Kalki 2898 AD',
        description: 'A modern avatar of Hindu god Vishnu, believed to have descended to the earth to protect the world from evil forces in a post-apocalyptic, technologically advanced world.',
        poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
        genre: ['Sci-Fi', 'Action', 'Adventure'],
        language: 'Hindi',
        duration: 181,
        releaseDate: new Date('2024-06-27'),
        rating: 8.5,
        certification: 'UA',
        director: 'Nag Ashwin',
        cast: ['Prabhas', 'Amitabh Bachchan', 'Kamal Haasan', 'Deepika Padukone'],
        status: 'now_showing',
      },
      {
        title: 'K.G.F: Chapter 2',
        description: 'In the blood-soaked Kolar Gold Fields, Rocky\'s name strikes fear into his foes. While his allies look up to him, the government sees him as a danger to law and order.',
        poster: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=600&auto=format&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
        genre: ['Action', 'Crime', 'Drama'],
        language: 'Kannada',
        duration: 168,
        releaseDate: new Date('2022-04-14'),
        rating: 8.7,
        certification: 'UA',
        director: 'Prashanth Neel',
        cast: ['Yash', 'Sanjay Dutt', 'Raveena Tandon', 'Srinidhi Shetty'],
        status: 'now_showing',
      },
      {
        title: 'War 2',
        description: 'Kabir and a formidable new adversary face off in an international game of espionage, loyalty, and high-velocity covert military strikes.',
        poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop',
        genre: ['Action', 'Thriller'],
        language: 'Hindi',
        duration: 155,
        releaseDate: new Date('2025-08-14'),
        rating: 8.8,
        certification: 'UA',
        director: 'Ayan Mukerji',
        cast: ['Hrithik Roshan', 'N. T. Rama Rao Jr.', 'Kiara Advani'],
        status: 'coming_soon',
      },

      // Hollywood Premieres & Masterpieces
      {
        title: 'Dune: Part Two (IMAX Laser)',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between love and the fate of the known universe.',
        poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
        genre: ['Sci-Fi', 'Adventure', 'Drama'],
        language: 'English',
        duration: 166,
        releaseDate: new Date('2024-03-01'),
        rating: 8.8,
        certification: 'UA',
        director: 'Denis Villeneuve',
        cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
        status: 'now_showing',
      },
      {
        title: 'Oppenheimer (70mm Laser Edition)',
        description: 'The monumental story of American theoretical physicist J. Robert Oppenheimer and his director role at the Manhattan Project\'s Los Alamos Laboratory.',
        poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600&auto=format&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop',
        genre: ['Biography', 'Drama', 'History'],
        language: 'English',
        duration: 180,
        releaseDate: new Date('2023-07-21'),
        rating: 8.9,
        certification: 'A',
        director: 'Christopher Nolan',
        cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
        status: 'now_showing',
      },
      {
        title: 'Interstellar: 10th Anniversary Laser',
        description: 'When Earth becomes uninhabitable, Joseph Cooper pilots an interstellar expedition through a newly formed wormhole near Saturn to ensure humanity\'s survival.',
        poster: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=600&auto=format&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop',
        genre: ['Sci-Fi', 'Adventure', 'Drama'],
        language: 'English',
        duration: 169,
        releaseDate: new Date('2024-11-05'),
        rating: 9.1,
        certification: 'UA',
        director: 'Christopher Nolan',
        cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
        status: 'now_showing',
      },
      {
        title: 'Gladiator II',
        description: 'Years after witnessing the death of the revered Maximus, Lucius must enter the Colosseum after his ancestral home is conquered by ruthless tyrannical emperors.',
        poster: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=600&auto=format&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200&auto=format&fit=crop',
        genre: ['Action', 'Drama', 'Adventure'],
        language: 'English',
        duration: 148,
        releaseDate: new Date('2024-11-22'),
        rating: 8.4,
        certification: 'A',
        director: 'Ridley Scott',
        cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
        status: 'coming_soon',
      },
      {
        title: 'Spider-Man: Beyond the Spider-Verse',
        description: 'Miles Morales traverses the boundless Multiverse, joining forces with Gwen Stacy and an elite taskforce of Spider-Heroes to save existence from collapse.',
        poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=600&auto=format&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1200&auto=format&fit=crop',
        genre: ['Animation', 'Action', 'Adventure'],
        language: 'English',
        duration: 140,
        releaseDate: new Date('2025-06-12'),
        rating: 8.7,
        certification: 'U',
        director: 'Joaquim Dos Santos',
        cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac'],
        status: 'coming_soon',
      },
      {
        title: 'Avatar: Fire and Ash',
        description: 'Jake Sully and Neytiri return with their family to encounter the fierce ash clan of Pandora in an unprecedented oceanic and volcanic visual odyssey.',
        poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop',
        genre: ['Sci-Fi', 'Action', 'Adventure'],
        language: 'English',
        duration: 192,
        releaseDate: new Date('2025-12-19'),
        rating: 8.9,
        certification: 'UA',
        director: 'James Cameron',
        cast: ['Sam Worthington', 'Zoe Saldaña', 'Sigourney Weaver', 'Stephen Lang'],
        status: 'coming_soon',
      },
    ];

    const movies = await Movie.insertMany(moviesData);
    console.log(`[Seed] Seeded ${movies.length} Bollywood & Hollywood films`);

    // 3. Seed Luxury Cinema Complexes & Auditoriums
    const cinemasData = [
      {
        name: 'REEL LUXE Palladium',
        city: 'Mumbai',
        address: 'High Street Phoenix, Senapati Bapat Marg, Lower Parel',
        facilities: ['IMAX with Laser', 'Dolby Atmos 7.1', 'Gourmet In-Seat Dining', 'Plush Recliners'],
        screensCount: 5,
      },
      {
        name: 'REEL OPUS Forum',
        city: 'Bengaluru',
        address: 'Forum South City Mall, Koramangala 7th Block, Hosur Main Road',
        facilities: ['4DX Dynamic Motion', 'Dolby Atmos', 'Private Luxury Suites', 'Valet Parking'],
        screensCount: 4,
      },
      {
        name: 'REEL REGAL Ambience',
        city: 'Delhi NCR',
        address: 'Ambience Island, NH 8, DLF Phase 3, Gurugram',
        facilities: ['Dual 4K Laser Projection', 'VIP Gold Lounge', 'Dolby Surround Sound', 'Patisserie'],
        screensCount: 6,
      },
    ];

    const cinemas = await Cinema.insertMany(cinemasData);
    console.log(`[Seed] Seeded ${cinemas.length} luxury cinema complexes`);

    // Create screens for each complex
    const screens = [];
    for (const cinema of cinemas) {
      const s1 = await Screen.create({
        cinemaId: cinema._id,
        name: 'Audi 1 - IMAX Laser',
        screenType: 'IMAX Laser',
        capacity: 80,
        layoutConfig: {
          rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
          seatsPerRow: 10,
          categories: [
            { name: 'Premium', rows: ['A', 'B'] },
            { name: 'Gold', rows: ['C', 'D', 'E'] },
            { name: 'Regular', rows: ['F', 'G', 'H'] },
          ],
        },
      });

      const s2 = await Screen.create({
        cinemaId: cinema._id,
        name: 'Audi 2 - Dolby Atmos 7.1',
        screenType: 'Dolby Atmos',
        capacity: 80,
        layoutConfig: {
          rows: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
          seatsPerRow: 10,
          categories: [
            { name: 'Premium', rows: ['A', 'B'] },
            { name: 'Gold', rows: ['C', 'D', 'E'] },
            { name: 'Regular', rows: ['F', 'G', 'H'] },
          ],
        },
      });

      screens.push(s1, s2);
    }
    console.log(`[Seed] Seeded ${screens.length} auditoriums`);

    // 4. Seed Multi-Date Showtimes
    const today = new Date();
    const dateStrings = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dateStrings.push(d.toISOString().split('T')[0]);
    }

    const showtimesToCreate = [];
    const nowShowingMovies = movies.filter((m) => m.status === 'now_showing');

    dateStrings.forEach((date) => {
      screens.forEach((screen, screenIdx) => {
        // Distribute both Bollywood & Hollywood now_showing across auditoriums
        const movie = nowShowingMovies[(screenIdx * 2) % nowShowingMovies.length];
        const times = screenIdx % 2 === 0
          ? ['11:00 AM', '02:30 PM', '06:00 PM', '09:30 PM']
          : ['12:15 PM', '03:45 PM', '07:15 PM', '10:45 PM'];

        times.forEach((time) => {
          showtimesToCreate.push({
            movieId: movie._id,
            cinemaId: screen.cinemaId,
            screenId: screen._id,
            date,
            startTime: time,
            pricing: {
              regular: 280,
              gold: 420,
              premium: 580,
            },
            status: 'scheduled',
          });
        });
      });
    });

    const showtimes = await Showtime.insertMany(showtimesToCreate);
    console.log(`[Seed] Seeded ${showtimes.length} scheduled showtimes`);

    // 5. Seed Promotional Vouchers
    const offers = await Offer.insertMany([
      {
        code: 'REEL50',
        title: '50% Weekend Blockbuster Voucher',
        description: 'Save 50% on all IMAX and Gold Lounge tickets booked for this weekend.',
        discountType: 'percentage',
        discountValue: 50,
        minAmount: 500,
        isActive: true,
      },
      {
        code: 'WELCOME100',
        title: 'Flat ₹100 Off on First Reservation',
        description: 'New members enjoy a flat ₹100 discount on their very first ticket booking.',
        discountType: 'flat',
        discountValue: 100,
        minAmount: 300,
        isActive: true,
      },
      {
        code: 'CINEMA20',
        title: '20% Midweek Special Voucher',
        description: 'Enjoy 20% off on all Tuesday and Wednesday screenings.',
        discountType: 'percentage',
        discountValue: 20,
        minAmount: 350,
        isActive: true,
      },
    ]);
    console.log(`[Seed] Seeded ${offers.length} discount vouchers`);

    // 6. Seed a sample confirmed booking for demo customer
    const sampleShow = showtimes[0];
    const customerUser = users[1];

    const sampleBooking = await Booking.create({
      bookingId: 'RR-2026-DEMO99',
      userId: customerUser._id,
      showtimeId: sampleShow._id,
      seats: [
        { row: 'C', number: 4, category: 'Gold', price: 420 },
        { row: 'C', number: 5, category: 'Gold', price: 420 },
      ],
      subtotal: 840,
      convenienceFee: 67,
      discount: 100,
      offerCode: 'WELCOME100',
      totalAmount: 807,
      bookingStatus: 'confirmed',
      paymentStatus: 'completed',
      qrCodeData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    });

    await Payment.create({
      bookingId: sampleBooking._id,
      amount: 807,
      method: 'upi',
      transactionReference: 'TXN-DEMO-998877',
      status: 'success',
      isSimulated: true,
    });
    console.log(`[Seed] Seeded sample confirmed booking (${sampleBooking.bookingId})`);

    console.log('[Seed] Database successfully populated!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
