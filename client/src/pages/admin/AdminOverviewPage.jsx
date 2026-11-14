import React, { useState, useEffect } from 'react';
import { DollarSign, Ticket, Users, Clapperboard, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import api from '../../api/axios';

const AdminOverviewPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-surface rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-surface rounded-2xl"></div>
          ))}
        </div>
        <div className="h-80 bg-surface rounded-2xl"></div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const revenueChart = data?.revenueChart || [];
  const statusDistribution = data?.statusDistribution || [];
  const recentBookings = data?.recentBookings || [];

  const COLORS = ['#2EAD75', '#D94A55', '#D6A85F'];

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          Executive Cinema Dashboard
        </h1>
        <p className="text-xs text-text-muted mt-0.5">
          Real-time ticketing performance, auditorium occupancy, and revenue stream analytics.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-surface rounded-2xl border border-surface-border p-5 space-y-2">
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-bold font-mono text-text-primary">₹{kpis.totalRevenue?.toLocaleString() || 0}</div>
          <span className="text-[10px] text-success font-medium">Verified ticket sales</span>
        </div>

        <div className="bg-surface rounded-2xl border border-surface-border p-5 space-y-2">
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>Total Bookings</span>
            <Ticket className="w-4 h-4 text-burgundy-light" />
          </div>
          <div className="text-2xl font-bold font-mono text-text-primary">{kpis.totalBookings || 0}</div>
          <span className="text-[10px] text-accent font-medium">Completed reservations</span>
        </div>

        <div className="bg-surface rounded-2xl border border-surface-border p-5 space-y-2">
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>Registered Customers</span>
            <Users className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-bold font-mono text-text-primary">{kpis.totalCustomers || 0}</div>
          <span className="text-[10px] text-text-muted font-medium">Verified accounts</span>
        </div>

        <div className="bg-surface rounded-2xl border border-surface-border p-5 space-y-2">
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>Catalog Titles</span>
            <Clapperboard className="w-4 h-4 text-burgundy-light" />
          </div>
          <div className="text-2xl font-bold font-mono text-text-primary">{kpis.totalMovies || 0}</div>
          <span className="text-[10px] text-text-muted font-medium">Across {kpis.totalCinemas || 0} partner cinemas</span>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Daily Revenue Area Chart */}
        <div className="lg:col-span-8 bg-surface rounded-2xl border border-surface-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-text-primary text-sm">7-Day Revenue Trends</h3>
              <p className="text-[11px] text-text-muted">Simulated daily booking intake (₹ INR)</p>
            </div>
            <TrendingUp className="w-4 h-4 text-accent" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChart}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#791D35" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#791D35" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#6C6868" fontSize={11} tickLine={false} />
                <YAxis stroke="#6C6868" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181F', borderColor: '#282834', borderRadius: '8px' }}
                  labelStyle={{ color: '#F6F2ED', fontSize: '11px' }}
                  itemStyle={{ color: '#D6A85F', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#D6A85F" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Pie Chart */}
        <div className="lg:col-span-4 bg-surface rounded-2xl border border-surface-border p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-text-primary text-sm">Booking Status Ratio</h3>
            <p className="text-[11px] text-text-muted">Confirmed vs Cancelled vs Pending</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181F', borderColor: '#282834', borderRadius: '8px' }}
                  itemStyle={{ color: '#F6F2ED', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-around text-xs pt-1 border-t border-surface-border">
            {statusDistribution.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                <span className="text-text-muted">{entry.name}: <b className="text-text-primary">{entry.value}</b></span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Bookings Table */}
      <div className="bg-surface rounded-2xl border border-surface-border p-6 space-y-4">
        <h3 className="font-semibold text-text-primary text-sm">Recent Reservations</h3>
        
        {recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-text-muted uppercase border-b border-surface-border">
                <tr>
                  <th className="pb-3">Ref ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Movie & Venue</th>
                  <th className="pb-3">Seats</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/60">
                {recentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-surface-light/40 transition-colors">
                    <td className="py-3 font-mono font-bold text-accent">{b.bookingId}</td>
                    <td className="py-3 text-text-primary">{b.userId?.name || 'Guest'}</td>
                    <td className="py-3">
                      <span className="font-medium text-text-primary block">{b.showtimeId?.movieId?.title}</span>
                      <span className="text-[10px] text-text-muted">{b.showtimeId?.cinemaId?.name}</span>
                    </td>
                    <td className="py-3 font-mono">{b.seats?.map((s) => `${s.row}${s.number}`).join(', ')}</td>
                    <td className="py-3 font-mono font-semibold text-accent">₹{b.totalAmount}</td>
                    <td className="py-3">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-text-muted">No recent reservations recorded.</div>
        )}
      </div>

    </div>
  );
};

export default AdminOverviewPage;
