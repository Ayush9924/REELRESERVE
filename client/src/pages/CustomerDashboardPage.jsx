import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, Clock, MapPin, AlertCircle, Ban, CheckCircle2, User, ChevronRight, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CustomerDashboardPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/my-bookings');
      if (res.data?.success) {
        setBookings(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load my bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id, bookingId) => {
    if (!window.confirm(`Are you sure you want to cancel booking ${bookingId}?`)) {
      return;
    }

    try {
      setCancellingId(id);
      const res = await api.post(`/bookings/${id}/cancel`);
      if (res.data?.success) {
        toast.success('Booking cancelled successfully.');
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleDeleteBooking = async (id, bookingId) => {
    if (!window.confirm(`Remove ${bookingId} from your booking history?`)) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await api.delete(`/bookings/${id}`);
      if (res.data?.success) {
        toast.success('Removed from history');
        setBookings((prev) => prev.filter((b) => b._id !== id));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove reservation.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      
      {/* User Header Profile Card */}
      <div className="bg-surface rounded-2xl border border-surface-border p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-burgundy/40 border border-accent/40 flex items-center justify-center text-accent text-2xl font-bold font-display shadow-glow-burgundy">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{user?.name}</h1>
            <p className="text-xs text-text-muted mt-0.5">{user?.email} • {user?.phone || 'No mobile linked'}</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-surface-light border border-surface-border text-[10px] text-accent font-semibold mt-2">
              REEL RESERVE Member
            </span>
          </div>
        </div>

        <div className="flex gap-3 text-center sm:text-right">
          <div className="px-4 py-2 bg-surface-light rounded-xl border border-surface-border">
            <span className="text-xl font-bold font-mono text-accent">{bookings.length}</span>
            <span className="text-[10px] text-text-muted block uppercase">Total Reservations</span>
          </div>
        </div>
      </div>

      {/* Bookings List Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-text-primary flex items-center gap-2">
            <Ticket className="w-5 h-5 text-accent" />
            My Cinema Bookings
          </h2>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-surface rounded-2xl border border-surface-border"></div>
            ))}
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const show = booking.showtimeId;
              const movie = show?.movieId;
              const cinema = show?.cinemaId;
              const screen = show?.screenId;
              const isConfirmed = booking.bookingStatus === 'confirmed';
              const isCancelled = booking.bookingStatus === 'cancelled';

              return (
                <div
                  key={booking._id}
                  className="bg-surface rounded-2xl border border-surface-border p-6 hover:border-surface-lighter transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  {/* Left: Movie & Showtime info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={movie?.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop'}
                      alt={movie?.title}
                      className="w-16 h-24 rounded-lg object-cover border border-surface-border shrink-0"
                    />

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-accent">{booking.bookingId}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isConfirmed
                              ? 'bg-success/20 text-success border border-success/30'
                              : isCancelled
                              ? 'bg-danger/20 text-danger border border-danger/30'
                              : 'bg-surface-light text-text-muted'
                          }`}
                        >
                          {booking.bookingStatus}
                        </span>
                      </div>

                      <h3 className="font-bold text-text-primary text-base">{movie?.title || 'Unknown Title'}</h3>
                      <p className="text-xs text-text-muted">{cinema?.name} • {screen?.name}</p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary pt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-accent" />
                          <span>{show?.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-accent" />
                          <span>{show?.startTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Seats info */}
                  <div className="md:text-center space-y-1">
                    <span className="text-[10px] text-text-muted block uppercase tracking-wider">Reserved Seats</span>
                    <div className="flex flex-wrap md:justify-center gap-1">
                      {booking.seats.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-surface-light border border-surface-border text-xs font-mono font-bold text-text-primary"
                        >
                          {s.row}{s.number}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-mono font-bold text-accent block pt-1">
                      Total: ₹{booking.totalAmount}
                    </span>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex sm:flex-col items-center gap-2">
                    {isConfirmed ? (
                      <Link
                        to={`/booking/ticket/${booking.bookingId}`}
                        className="w-full text-center px-4 py-2 rounded-xl bg-burgundy hover:bg-burgundy-hover text-white text-xs font-semibold shadow-glow-burgundy transition-all"
                      >
                        View Ticket
                      </Link>
                    ) : booking.bookingStatus === 'held' ? (
                      <Link
                        to={`/booking/checkout/${booking.bookingId}`}
                        className="w-full text-center px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-background text-xs font-bold shadow-glow-gold transition-all"
                      >
                        Pay Now
                      </Link>
                    ) : (
                      <span className="text-xs text-danger/80 bg-danger/10 px-3 py-1 rounded-lg border border-danger/20 font-medium">
                        Cancelled
                      </span>
                    )}

                    {isConfirmed && (
                      <button
                        onClick={() => handleCancelBooking(booking._id, booking.bookingId)}
                        disabled={cancellingId === booking._id}
                        className="w-full text-center px-4 py-2 rounded-xl bg-surface-light hover:bg-danger/20 hover:text-danger text-text-muted text-xs font-medium border border-surface-border transition-colors disabled:opacity-50"
                      >
                        {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    )}

                    {/* Allow customer to remove/dismiss cancelled or uncompleted held reservations */}
                    {!isConfirmed && (
                      <button
                        onClick={() => handleDeleteBooking(booking._id, booking.bookingId)}
                        disabled={deletingId === booking._id}
                        title="Dismiss from history"
                        className="w-full text-center px-4 py-1.5 rounded-xl bg-surface-light hover:bg-surface-border text-text-muted hover:text-danger text-xs font-medium border border-surface-border transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{deletingId === booking._id ? 'Removing...' : 'Remove'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface rounded-2xl border border-surface-border space-y-3">
            <Ticket className="w-10 h-10 mx-auto text-text-muted opacity-40" />
            <h3 className="font-semibold text-text-primary text-base">No Bookings Yet</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto">
              You haven't reserved any cinema tickets yet. Explore our premier catalog to book your first experience.
            </p>
            <Link
              to="/movies"
              className="inline-block px-5 py-2.5 rounded-xl bg-burgundy text-white text-xs font-semibold shadow-glow-burgundy"
            >
              Discover Movies
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default CustomerDashboardPage;

