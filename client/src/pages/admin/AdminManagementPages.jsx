import React, { useState, useEffect } from 'react';
import { Search, Ticket, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/bookings?status=${statusFilter}&q=${search}`);
      if (res.data?.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleCancelBooking = async (id, bookingId) => {
    if (!window.confirm(`Cancel reservation ${bookingId}?`)) return;
    try {
      await api.post(`/bookings/${id}/cancel`);
      toast.success('Booking marked as cancelled.');
      fetchBookings();
    } catch (err) {
      toast.error('Failed to cancel booking');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary">All Customer Reservations</h1>
        <p className="text-xs text-text-muted">Supervise all bookings, payment status, and audit records</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-surface p-4 rounded-2xl border border-surface-border">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by Booking ID (e.g. RR-2026-DEMO99)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-light border border-surface-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface-light border border-surface-border rounded-xl px-3 py-2 text-xs text-text-primary"
        >
          <option value="all">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="held">Held / Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl border border-surface-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-text-muted">Loading reservations...</div>
        ) : bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-light text-text-muted uppercase border-b border-surface-border">
                <tr>
                  <th className="p-4">Booking Ref</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Movie & Showtime</th>
                  <th className="p-4">Seats</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-surface-light/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-accent">{b.bookingId}</td>
                    <td className="p-4">
                      <span className="font-semibold text-text-primary block">{b.userId?.name || 'Customer'}</span>
                      <span className="text-[10px] text-text-muted">{b.userId?.email}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-text-primary block">{b.showtimeId?.movieId?.title}</span>
                      <span className="text-[10px] text-text-muted">
                        {b.showtimeId?.cinemaId?.name} • {b.showtimeId?.date} ({b.showtimeId?.startTime})
                      </span>
                    </td>
                    <td className="p-4 font-mono">
                      {b.seats?.map((s) => `${s.row}${s.number}`).join(', ')}
                    </td>
                    <td className="p-4 font-mono font-bold text-accent">₹{b.totalAmount}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          b.bookingStatus === 'confirmed'
                            ? 'bg-success/20 text-success'
                            : b.bookingStatus === 'cancelled'
                            ? 'bg-danger/20 text-danger'
                            : 'bg-surface-light text-text-muted'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {b.bookingStatus === 'confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(b._id, b.bookingId)}
                          className="px-2.5 py-1 rounded-lg bg-surface-light hover:bg-danger/20 text-danger border border-surface-border text-[11px]"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-text-muted">No reservations found.</div>
        )}
      </div>

    </div>
  );
};

export const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/customers?q=${search}`);
      if (res.data?.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.put(`/admin/customers/${id}/toggle-status`);
      if (res.data?.success) {
        toast.success('Customer account status updated');
        fetchCustomers();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary">Registered Customer Directory</h1>
        <p className="text-xs text-text-muted">Customer profiles, contact details and active account permissions</p>
      </div>

      <div className="bg-surface rounded-2xl border border-surface-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-text-muted">Loading customer records...</div>
        ) : customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-light text-text-muted uppercase border-b border-surface-border">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Member Since</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-surface-light/30 transition-colors">
                    <td className="p-4 font-bold text-text-primary flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-burgundy/40 text-accent flex items-center justify-center font-mono">
                        {c.name.charAt(0)}
                      </div>
                      <span>{c.name}</span>
                    </td>
                    <td className="p-4 text-text-secondary">{c.email}</td>
                    <td className="p-4 text-text-muted font-mono">{c.phone || 'N/A'}</td>
                    <td className="p-4 text-text-muted">
                      {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.isActive ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(c._id)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold border ${
                          c.isActive
                            ? 'bg-danger/10 text-danger border-danger/30 hover:bg-danger/20'
                            : 'bg-success/10 text-success border-success/30 hover:bg-success/20'
                        }`}
                      >
                        {c.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-text-muted">No customer records found.</div>
        )}
      </div>

    </div>
  );
};

