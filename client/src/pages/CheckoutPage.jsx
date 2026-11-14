import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CreditCard, QrCode, Building, ShieldCheck, Tag, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import api from '../api/axios';
import { useBooking } from '../context/BookingContext';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { resetBookingFlow } = useBooking();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/bookings/${bookingId}`);
        if (res.data?.success) {
          const b = res.data.data;
          setBooking(b);
          // Calculate remaining seconds
          if (b.holdExpiresAt) {
            const remaining = Math.max(0, Math.floor((new Date(b.holdExpiresAt) - new Date()) / 1000));
            setTimeLeft(remaining);
          }
        }
      } catch (err) {
        console.error('Failed to load booking:', err);
        toast.error('Could not locate reservation or hold expired.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  // Countdown timer for 10-minute hold window
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error('Seat hold reservation has expired! Please select seats again.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      setCouponLoading(true);
      const res = await api.post(`/bookings/${booking._id}/apply-offer`, {
        code: couponCode.trim(),
      });
      if (res.data?.success) {
        setBooking(res.data.data);
        toast.success(`Coupon ${res.data.data.offerCode} applied!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSimulatedPayment = async (simulateFailure = false) => {
    if (timeLeft <= 0) {
      toast.error('Reservation hold expired. Please reselect your seats.');
      return;
    }

    try {
      setProcessing(true);
      const res = await api.post('/bookings/confirm', {
        bookingId: booking.bookingId,
        paymentMethod,
        simulateFailure,
      });

      if (res.data?.success) {
        toast.success('Simulated payment successful! Digital ticket generated.');
        resetBookingFlow();
        navigate(`/booking/ticket/${booking.bookingId}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error(err.response?.data?.message || 'Simulated transaction failed.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="h-8 bg-surface rounded w-1/3 mx-auto mb-6"></div>
        <div className="h-64 bg-surface rounded-2xl"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-surface rounded-2xl border border-surface-border text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-danger mx-auto" />
        <h2 className="text-xl font-bold text-text-primary">Reservation Not Found</h2>
        <Link to="/movies" className="inline-block px-4 py-2 bg-burgundy rounded-lg text-white text-xs">
          Browse Movies
        </Link>
      </div>
    );
  }

  const showtime = booking.showtimeId;
  const movie = showtime?.movieId;
  const cinema = showtime?.cinemaId;
  const screen = showtime?.screenId;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Top Banner: Hold countdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface p-4 rounded-2xl border border-surface-border gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-accent animate-pulse" />
          <div>
            <span className="text-xs text-text-muted">Temporary Seat Hold Remaining:</span>
            <span className="font-mono text-base font-bold text-accent ml-2">{formatTimer(timeLeft)}</span>
          </div>
        </div>

        <div className="text-xs text-text-muted flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-success" />
          <span>Simulated Academic Sandbox • No Real Money Charged</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Simulated Payment Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-surface rounded-2xl border border-surface-border p-6 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-text-primary">Select Payment Method</h2>
              <p className="text-xs text-text-muted mt-0.5">Test end-to-end checkout with simulated payment channels</p>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'upi'
                    ? 'bg-burgundy/20 border-accent text-accent'
                    : 'bg-surface-light border-surface-border text-text-secondary hover:text-text-primary'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="text-xs font-semibold">UPI (Demo)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-burgundy/20 border-accent text-accent'
                    : 'bg-surface-light border-surface-border text-text-secondary hover:text-text-primary'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs font-semibold">Card (Demo)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  paymentMethod === 'netbanking'
                    ? 'bg-burgundy/20 border-accent text-accent'
                    : 'bg-surface-light border-surface-border text-text-secondary hover:text-text-primary'
                }`}
              >
                <Building className="w-5 h-5" />
                <span className="text-xs font-semibold">Net Banking</span>
              </button>
            </div>

            {/* Method Details (Simulated Inputs) */}
            <div className="p-4 bg-surface-light rounded-xl border border-surface-border space-y-3">
              {paymentMethod === 'upi' && (
                <div>
                  <label className="block text-xs text-text-muted mb-1 font-medium">Virtual Payment Address (VPA)</label>
                  <input
                    type="text"
                    disabled
                    value="customer@okreelreserve"
                    className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg text-xs font-mono text-text-primary"
                  />
                  <p className="text-[11px] text-text-muted mt-1.5">
                    Pre-filled with simulated UPI handle for testing.
                  </p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-text-muted mb-1 font-medium">Card Number (Simulated)</label>
                    <input
                      type="text"
                      disabled
                      value="•••• •••• •••• 4242"
                      className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg text-xs font-mono text-text-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      disabled
                      value="12/28"
                      className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg text-xs font-mono text-text-primary"
                    />
                    <input
                      type="text"
                      disabled
                      value="•••"
                      className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg text-xs font-mono text-text-primary"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div>
                  <label className="block text-xs text-text-muted mb-1 font-medium">Simulated Partner Bank</label>
                  <select
                    disabled
                    className="w-full px-3 py-2 bg-surface border border-surface-border rounded-lg text-xs text-text-primary"
                  >
                    <option>HDFC Bank (Sandbox)</option>
                    <option>ICICI Bank (Sandbox)</option>
                    <option>State Bank of India (Sandbox)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Action Buttons: Success and Failure simulation */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                disabled={processing || timeLeft <= 0}
                onClick={() => handleSimulatedPayment(false)}
                className="w-full py-3.5 rounded-xl bg-burgundy hover:bg-burgundy-hover text-white text-sm font-semibold shadow-glow-burgundy border border-burgundy-light/40 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <CheckCircle2 className="w-4 h-4 text-accent" />
                {processing ? 'Confirming Simulation...' : `Pay ₹${booking.totalAmount} (Simulate Success)`}
              </button>

              <button
                type="button"
                disabled={processing || timeLeft <= 0}
                onClick={() => handleSimulatedPayment(true)}
                className="w-full py-2.5 rounded-xl bg-surface-light hover:bg-danger/20 hover:text-danger text-text-muted text-xs font-semibold border border-surface-border transition-all flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                Simulate Payment Decline / Failure
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface rounded-2xl border border-surface-border p-6 space-y-5">
            <h3 className="font-display text-lg font-bold text-text-primary border-b border-surface-border pb-3">
              Booking Summary
            </h3>

            {/* Movie & Cinema info */}
            <div className="space-y-1">
              <h4 className="font-bold text-text-primary text-base">{movie?.title}</h4>
              <p className="text-xs text-text-muted">{cinema?.name} • {screen?.name}</p>
              <p className="text-xs text-accent font-semibold">{showtime?.date} at {showtime?.startTime}</p>
            </div>

            {/* Selected Seats */}
            <div className="pt-2 border-t border-surface-border space-y-2">
              <span className="text-xs text-text-muted uppercase tracking-wider block">Seats Reserved:</span>
              <div className="flex flex-wrap gap-1.5">
                {booking.seats.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-surface-light border border-surface-border text-xs text-text-primary font-mono font-semibold"
                  >
                    {s.row}{s.number} ({s.category})
                  </span>
                ))}
              </div>
            </div>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="pt-2 border-t border-surface-border space-y-2">
              <span className="text-xs text-text-muted uppercase tracking-wider block">Have a Coupon?</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. REEL50, WELCOME100"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 bg-surface-light border border-surface-border rounded-lg text-xs text-text-primary uppercase font-mono focus:outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={couponLoading || !couponCode}
                  className="px-3 py-2 bg-accent hover:bg-accent-hover text-background text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
              {booking.offerCode && (
                <div className="text-[11px] text-success flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>Coupon {booking.offerCode} applied successfully!</span>
                </div>
              )}
            </form>

            {/* Cost Breakdown */}
            <div className="pt-3 border-t border-surface-border space-y-2 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Tickets Subtotal</span>
                <span className="font-mono font-medium">₹{booking.subtotal}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Convenience Fee (8%)</span>
                <span className="font-mono font-medium">₹{booking.convenienceFee}</span>
              </div>
              {booking.discount > 0 && (
                <div className="flex justify-between text-success font-medium">
                  <span>Offer Discount</span>
                  <span className="font-mono">-₹{booking.discount}</span>
                </div>
              )}
              <div className="pt-3 border-t border-surface-border flex justify-between text-base font-bold text-text-primary">
                <span>Total Amount</span>
                <span className="font-mono text-accent">₹{booking.totalAmount}</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default CheckoutPage;

