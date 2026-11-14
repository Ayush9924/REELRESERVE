import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, ShieldCheck, Ticket, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SeatSelectionPage = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    selectedMovie,
    selectedCinema,
    selectedShowtime,
    setSelectedShowtime,
    setSelectedMovie,
    setSelectedCinema,
    selectedSeats,
    setSelectedSeats,
    setActiveBooking,
  } = useBooking();

  const [loading, setLoading] = useState(true);
  const [showData, setShowData] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]); // [{ row, number, status: 'booked' | 'held' }]
  const [holding, setHolding] = useState(false);

  // Rows and seat columns config
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 10;

  // Row category mapping
  const getCategory = (row) => {
    if (['A', 'B'].includes(row)) return 'Premium';
    if (['C', 'D', 'E'].includes(row)) return 'Gold';
    return 'Regular';
  };

  const getPrice = (category, pricing) => {
    if (!pricing) return 250;
    if (category === 'Premium') return pricing.premium || 580;
    if (category === 'Gold') return pricing.gold || 420;
    return pricing.regular || 280;
  };

  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/showtimes/${showtimeId}`);
        if (res.data?.success) {
          const { showtime, occupiedSeats } = res.data.data;
          setShowData(showtime);
          setSelectedShowtime(showtime);
          if (showtime.movieId) setSelectedMovie(showtime.movieId);
          if (showtime.cinemaId) setSelectedCinema(showtime.cinemaId);
          setOccupiedSeats(occupiedSeats || []);
        }
      } catch (err) {
        console.error('Failed to load showtime:', err);
        toast.error('Failed to load seating map');
      } finally {
        setLoading(false);
      }
    };

    fetchShowDetails();
  }, [showtimeId]);

  const isSeatOccupied = (row, number) => {
    return occupiedSeats.some((s) => s.row === row && s.number === number);
  };

  const isSeatSelected = (row, number) => {
    return selectedSeats.some((s) => s.row === row && s.number === number);
  };

  const toggleSeat = (row, number) => {
    if (isSeatOccupied(row, number)) return;

    const exists = isSeatSelected(row, number);
    if (exists) {
      setSelectedSeats(selectedSeats.filter((s) => !(s.row === row && s.number === number)));
    } else {
      if (selectedSeats.length >= 8) {
        toast.error('Maximum 8 tickets allowed per reservation');
        return;
      }
      const category = getCategory(row);
      const price = getPrice(category, showData?.pricing);
      setSelectedSeats([...selectedSeats, { row, number, category, price }]);
    }
  };

  const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const handleProceedToCheckout = async () => {
    if (!user) {
      toast('Please sign in to hold seats and checkout', { icon: '🔒' });
      navigate('/login', { state: { from: { pathname: `/booking/seats/${showtimeId}` } } });
      return;
    }

    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    try {
      setHolding(true);
      // Call server-side hold API to lock seats atomically for 10 minutes
      const res = await api.post('/bookings/hold', {
        showtimeId,
        seats: selectedSeats,
      });

      if (res.data?.success) {
        setActiveBooking(res.data.data);
        toast.success('Seats held for 10 minutes. Proceeding to checkout...');
        navigate(`/booking/checkout/${res.data.data.bookingId}`);
      }
    } catch (err) {
      console.error('Hold seats failed:', err);
      const message = err.response?.data?.message || 'Selected seats are no longer available.';
      toast.error(message);
      // Refresh occupied seats
      const refreshRes = await api.get(`/showtimes/${showtimeId}`);
      if (refreshRes.data?.success) {
        setOccupiedSeats(refreshRes.data.data.occupiedSeats || []);
        // Remove conflicted seats from selection
        const conflicted = err.response?.data?.conflictingSeats || [];
        if (conflicted.length > 0) {
          setSelectedSeats(
            selectedSeats.filter((s) => !conflicted.includes(`${s.row}-${s.number}`))
          );
        }
      }
    } finally {
      setHolding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-pulse space-y-6">
        <div className="h-10 bg-surface rounded-xl w-1/3 mx-auto"></div>
        <div className="h-64 bg-surface rounded-2xl"></div>
      </div>
    );
  }

  if (!showData) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-surface rounded-2xl border border-surface-border text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-danger mx-auto" />
        <h2 className="text-xl font-bold text-text-primary">Showtime Unavailable</h2>
        <Link to="/movies" className="inline-block px-4 py-2 bg-burgundy rounded-lg text-white text-xs">
          Browse Movies
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-border gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Change Showtime
          </button>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            {showData.movieId?.title}
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            {showData.cinemaId?.name} • {showData.screenId?.name || 'Screen 1'} •{' '}
            <span className="text-accent font-semibold">{showData.date} at {showData.startTime}</span>
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs bg-surface p-3 rounded-xl border border-surface-border">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-t-md bg-surface-light border border-surface-border"></div>
            <span className="text-text-muted">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-t-md bg-accent text-background border border-accent"></div>
            <span className="text-text-primary font-semibold">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-t-md bg-surface-border border border-surface-border opacity-50"></div>
            <span className="text-text-muted">Booked</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Auditorium Seat Layout */}
      <div className="bg-surface rounded-3xl p-6 sm:p-10 border border-surface-border space-y-10">
        
        {/* Cinema Curved Screen Visualizer */}
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <div className="w-full h-2.5 bg-gradient-to-r from-transparent via-accent to-transparent rounded-full opacity-80 cinema-screen-curve"></div>
          <p className="text-[11px] uppercase tracking-widest text-text-muted font-semibold">
            All Eyes Here • Cinema Screen
          </p>
        </div>

        {/* Seat Grid by Category */}
        <div className="space-y-8 overflow-x-auto pb-4">
          {['Premium', 'Gold', 'Regular'].map((categoryName) => {
            const catRows = rows.filter((r) => getCategory(r) === categoryName);
            const price = getPrice(categoryName, showData.pricing);

            return (
              <div key={categoryName} className="space-y-3 min-w-[560px]">
                {/* Category Header */}
                <div className="flex items-center justify-between text-xs text-text-muted border-b border-surface-border/60 pb-1 px-4">
                  <span className="font-semibold text-text-secondary tracking-wider uppercase">
                    {categoryName} Lounge
                  </span>
                  <span className="text-accent font-mono font-bold">₹{price}</span>
                </div>

                {/* Rows in this tier */}
                <div className="space-y-2">
                  {catRows.map((row) => (
                    <div key={row} className="flex items-center justify-center gap-2">
                      <span className="w-5 text-xs font-bold text-text-muted text-center">{row}</span>

                      <div className="flex items-center gap-2">
                        {Array.from({ length: seatsPerRow }, (_, i) => i + 1).map((seatNum) => {
                          const occupied = isSeatOccupied(row, seatNum);
                          const selected = isSeatSelected(row, seatNum);

                          // Visual aisle gap after seat 5
                          const isAisleGap = seatNum === 5;

                          return (
                            <React.Fragment key={seatNum}>
                              <button
                                type="button"
                                disabled={occupied}
                                onClick={() => toggleSeat(row, seatNum)}
                                title={`${categoryName} ${row}${seatNum} - ₹${price}`}
                                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-t-lg text-xs font-semibold flex items-center justify-center transition-all ${
                                  occupied
                                    ? 'bg-surface-lighter text-text-muted/30 cursor-not-allowed opacity-35'
                                    : selected
                                    ? 'bg-accent text-background font-bold shadow-glow-gold scale-105 border border-accent-hover'
                                    : 'bg-surface-light hover:bg-surface-lighter text-text-secondary hover:text-text-primary border border-surface-border hover:border-accent/40'
                                }`}
                              >
                                {seatNum}
                              </button>
                              {isAisleGap && <div className="w-4 sm:w-6"></div>}
                            </React.Fragment>
                          );
                        })}
                      </div>

                      <span className="w-5 text-xs font-bold text-text-muted text-center">{row}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Floating Bottom Booking Summary Bar */}
      <div className="sticky bottom-4 z-40 bg-surface/95 backdrop-blur-md border border-surface-border rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-text-muted">Selected Seats:</div>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {selectedSeats.length > 0 ? (
              selectedSeats.map((s) => (
                <span
                  key={`${s.row}-${s.number}`}
                  className="px-2 py-0.5 rounded bg-surface-light border border-accent/40 text-accent text-xs font-bold font-mono"
                >
                  {s.row}{s.number}
                </span>
              ))
            ) : (
              <span className="text-xs text-text-muted italic">No seats chosen yet</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-6">
          <div>
            <span className="text-[11px] text-text-muted block uppercase tracking-wider">Estimated Total</span>
            <span className="text-xl font-bold font-mono text-accent">₹{subtotal}</span>
          </div>

          <button
            onClick={handleProceedToCheckout}
            disabled={selectedSeats.length === 0 || holding}
            className="px-6 py-3 rounded-xl bg-burgundy hover:bg-burgundy-hover text-white text-sm font-semibold shadow-glow-burgundy border border-burgundy-light/40 transition-all flex items-center gap-2 disabled:opacity-40"
          >
            <Ticket className="w-4 h-4 text-accent" />
            {holding ? 'Locking Seats...' : `Hold Seats & Pay (${selectedSeats.length})`}
          </button>
        </div>
      </div>

    </div>
  );
};

export default SeatSelectionPage;

