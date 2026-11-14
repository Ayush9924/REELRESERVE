import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Clock, Film, X } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const AdminShowtimesPage = () => {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    movieId: '',
    cinemaId: '',
    screenId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '18:30',
    regularPrice: 280,
    goldPrice: 420,
    premiumPrice: 580,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [showsRes, moviesRes, cinemasRes] = await Promise.all([
        api.get('/showtimes'),
        api.get('/movies?status=now_showing'),
        api.get('/cinemas'),
      ]);

      if (showsRes.data?.success) setShowtimes(showsRes.data.data);
      if (moviesRes.data?.success) {
        setMovies(moviesRes.data.data);
        if (moviesRes.data.data.length > 0) {
          setFormData((prev) => ({ ...prev, movieId: moviesRes.data.data[0]._id }));
        }
      }
      if (cinemasRes.data?.success) {
        setCinemas(cinemasRes.data.data);
        if (cinemasRes.data.data.length > 0) {
          const firstCinema = cinemasRes.data.data[0];
          setFormData((prev) => ({ ...prev, cinemaId: firstCinema._id }));
          fetchCinemaScreens(firstCinema._id);
        }
      }
    } catch (err) {
      console.error('Failed to load initial showtime data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCinemaScreens = async (cinemaId) => {
    try {
      const res = await api.get(`/cinemas/${cinemaId}`);
      if (res.data?.success && res.data.data.screens) {
        setScreens(res.data.data.screens);
        if (res.data.data.screens.length > 0) {
          setFormData((prev) => ({ ...prev, screenId: res.data.data.screens[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch screens:', err);
    }
  };

  const handleCinemaChange = (e) => {
    const cinemaId = e.target.value;
    setFormData((prev) => ({ ...prev, cinemaId }));
    fetchCinemaScreens(cinemaId);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this scheduled screening?')) return;
    try {
      await api.delete(`/showtimes/${id}`);
      toast.success('Showtime cancelled');
      const showsRes = await api.get('/showtimes');
      if (showsRes.data?.success) setShowtimes(showsRes.data.data);
    } catch (err) {
      toast.error('Failed to cancel showtime');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        movieId: formData.movieId,
        cinemaId: formData.cinemaId,
        screenId: formData.screenId,
        date: formData.date,
        startTime: formData.startTime,
        pricing: {
          regular: Number(formData.regularPrice),
          gold: Number(formData.goldPrice),
          premium: Number(formData.premiumPrice),
        },
      };

      await api.post('/showtimes', payload);
      toast.success('Showtime scheduled successfully!');
      setModalOpen(false);
      const showsRes = await api.get('/showtimes');
      if (showsRes.data?.success) setShowtimes(showsRes.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Conflict scheduling showtime');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">Showtime Scheduler</h1>
          <p className="text-xs text-text-muted">Schedule movie screenings across screens and assign tiered pricing</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-hover text-white text-xs font-semibold shadow-glow-burgundy flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Schedule Showtime
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-surface-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-text-muted">Loading schedule...</div>
        ) : showtimes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-light text-text-muted uppercase border-b border-surface-border">
                <tr>
                  <th className="p-4">Movie</th>
                  <th className="p-4">Cinema & Screen</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Tier Pricing</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {showtimes.map((show) => (
                  <tr key={show._id} className="hover:bg-surface-light/30 transition-colors">
                    <td className="p-4 font-bold text-text-primary">{show.movieId?.title}</td>
                    <td className="p-4">
                      <span className="text-text-primary block font-medium">{show.cinemaId?.name}</span>
                      <span className="text-[10px] text-text-muted">{show.screenId?.name} ({show.screenId?.screenType})</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-semibold text-text-primary">
                        <Calendar className="w-3.5 h-3.5 text-accent" />
                        <span>{show.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-accent mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{show.startTime}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono">
                      <span className="text-[11px] text-text-muted">R: ₹{show.pricing?.regular} | G: ₹{show.pricing?.gold} | P: ₹{show.pricing?.premium}</span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(show._id)}
                        className="p-1.5 rounded-lg bg-surface-light hover:bg-danger/20 text-text-secondary hover:text-danger"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-text-muted">No showtimes scheduled.</div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-surface-border max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="font-display text-lg font-bold text-text-primary">Schedule New Showtime</h3>
              <button onClick={() => setModalOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-text-muted uppercase mb-1 font-semibold">Movie</label>
                <select
                  required
                  value={formData.movieId}
                  onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-lg text-text-primary"
                >
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-muted uppercase mb-1 font-semibold">Cinema</label>
                  <select
                    required
                    value={formData.cinemaId}
                    onChange={handleCinemaChange}
                    className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-lg text-text-primary"
                  >
                    {cinemas.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-text-muted uppercase mb-1 font-semibold">Screen</label>
                  <select
                    required
                    value={formData.screenId}
                    onChange={(e) => setFormData({ ...formData, screenId: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-lg text-text-primary"
                  >
                    {screens.map((s) => (
                      <option key={s._id} value={s._id}>{s.name} ({s.screenType})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-muted uppercase mb-1 font-semibold">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-lg text-text-primary"
                  />
                </div>

                <div>
                  <label className="block text-text-muted uppercase mb-1 font-semibold">Start Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 18:30 or 06:30 PM"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-lg text-text-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-text-muted uppercase mb-1 font-semibold">Regular (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.regularPrice}
                    onChange={(e) => setFormData({ ...formData, regularPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-lg text-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-text-muted uppercase mb-1 font-semibold">Gold (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.goldPrice}
                    onChange={(e) => setFormData({ ...formData, goldPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-lg text-text-primary"
                  />
                </div>
                <div>
                  <label className="block text-text-muted uppercase mb-1 font-semibold">Premium (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.premiumPrice}
                    onChange={(e) => setFormData({ ...formData, premiumPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-lg text-text-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-light text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-burgundy hover:bg-burgundy-hover text-white font-semibold"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminShowtimesPage;

