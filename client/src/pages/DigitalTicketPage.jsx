import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Ticket, Calendar, Clock, MapPin, Printer, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const DigitalTicketPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/bookings/${id}`);
        if (res.data?.success) {
          setBooking(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load ticket:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center animate-pulse space-y-4">
        <div className="h-6 bg-surface rounded w-1/3 mx-auto"></div>
        <div className="h-96 bg-surface rounded-3xl"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-surface rounded-2xl border border-surface-border text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-danger mx-auto" />
        <h2 className="text-xl font-bold text-text-primary">Ticket Not Found</h2>
        <Link to="/my-bookings" className="inline-block px-4 py-2 bg-burgundy rounded-lg text-white text-xs">
          View My Bookings
        </Link>
      </div>
    );
  }

  // If the booking is still in 'held' state (payment was not completed yet)
  if (booking.bookingStatus === 'held') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-surface rounded-2xl border border-surface-border text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-accent mx-auto" />
        <h2 className="text-xl font-bold text-text-primary">Payment Pending</h2>
        <p className="text-xs text-text-muted">
          Your seats ({booking.seats?.map(s => `${s.row}${s.number}`).join(', ')}) are currently held, but payment has not been completed.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Link
            to={`/booking/checkout/${booking.bookingId}`}
            className="w-full py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-hover text-white text-xs font-semibold shadow-glow-burgundy"
          >
            Complete Payment & Generate Ticket
          </Link>
          <Link
            to="/my-bookings"
            className="w-full py-2 rounded-xl bg-surface-light border border-surface-border text-text-muted text-xs hover:text-text-primary"
          >
            Go to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  const showtime = booking.showtimeId;
  const movie = showtime?.movieId;
  const cinema = showtime?.cinemaId;
  const screen = showtime?.screenId;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      
      {/* Action Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/my-bookings"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Bookings
        </Link>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-light border border-surface-border text-text-primary text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <Printer className="w-4 h-4 text-accent" />
          Print / Save PDF
        </button>
      </div>

      {/* Confirmation Success Header */}
      {booking.bookingStatus === 'confirmed' && (
        <div className="p-4 bg-success/15 border border-success/30 rounded-2xl flex items-center gap-3 text-success text-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-bold">Reservation Confirmed!</span>
            <p className="text-text-secondary mt-0.5">Show this digital passport or QR code at the cinema entry turnstile.</p>
          </div>
        </div>
      )}

      {/* Premium Digital Boarding Pass / Cinema Passport */}
      <div className="bg-surface rounded-3xl border border-surface-border overflow-hidden shadow-2xl">
        
        {/* Pass Top Banner */}
        <div className="bg-gradient-to-r from-burgundy-dark via-burgundy to-burgundy-dark p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-burgundy-light/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-accent uppercase bg-background/50 px-2 py-0.5 rounded">
                Official Cinema Pass
              </span>
              <span className="text-xs text-text-primary/70">REEL RESERVE</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {movie?.title}
            </h1>
            <p className="text-xs text-text-primary/80 mt-1">
              {movie?.language} • {movie?.certification} • {movie?.duration} Mins
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-text-primary/70 block uppercase tracking-wider">Booking Ref</span>
            <span className="font-mono text-base font-bold text-accent tracking-widest">{booking.bookingId}</span>
          </div>
        </div>

        {/* Pass Body */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Details */}
          <div className="md:col-span-8 space-y-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-text-muted uppercase tracking-wider block">Cinema Venue</span>
                <p className="text-sm font-bold text-text-primary mt-0.5">{cinema?.name}</p>
                <p className="text-xs text-text-muted">{cinema?.city}</p>
              </div>

              <div>
                <span className="text-[10px] text-text-muted uppercase tracking-wider block">Auditorium</span>
                <p className="text-sm font-bold text-accent mt-0.5">{screen?.name || 'Screen 1'}</p>
                <p className="text-xs text-text-muted">{screen?.screenType || 'IMAX Laser'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-surface-border">
              <div>
                <span className="text-[10px] text-text-muted uppercase tracking-wider block">Date & Time</span>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-text-primary font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-accent" />
                  <span>{showtime?.date}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-accent font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{showtime?.startTime}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-text-muted uppercase tracking-wider block">Seats ({booking.seats.length})</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {booking.seats.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-surface-light rounded-md text-xs font-mono font-bold text-text-primary border border-surface-border"
                    >
                      {s.row}{s.number}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-border flex items-center justify-between text-xs">
              <div>
                <span className="text-text-muted block text-[10px] uppercase">Payment Status</span>
                <span className="font-semibold text-success uppercase">{booking.paymentStatus}</span>
              </div>
              <div className="text-right">
                <span className="text-text-muted block text-[10px] uppercase">Amount Paid</span>
                <span className="font-mono text-base font-bold text-accent">₹{booking.totalAmount}</span>
              </div>
            </div>

          </div>

          {/* QR Code Container */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-surface-light rounded-2xl border border-surface-border text-center space-y-2">
            {booking.qrCodeData ? (
              <img
                src={booking.qrCodeData}
                alt="Ticket QR Code"
                className="w-40 h-40 rounded-xl border border-accent/30 shadow-md bg-white p-1"
              />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center bg-surface border border-surface-border rounded-xl">
                <Ticket className="w-10 h-10 text-text-muted" />
              </div>
            )}
            <span className="text-[10px] font-mono text-text-muted tracking-wider uppercase">
              Scan at Entrance
            </span>
          </div>

        </div>

        {/* Perforated aesthetic divider */}
        <div className="relative border-t-2 border-dashed border-surface-border px-8 py-3 bg-surface-light/40 flex items-center justify-between text-[11px] text-text-muted">
          <span>Simulation Pass • Academic Project Evaluation</span>
          <span>Terms & Conditions Apply</span>
        </div>

      </div>

    </div>
  );
};

export default DigitalTicketPage;

