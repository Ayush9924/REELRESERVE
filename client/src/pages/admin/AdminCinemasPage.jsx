import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, Film, X } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const AdminCinemasPage = () => {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    city: 'Mumbai',
    address: '',
    facilities: 'IMAX Laser, Dolby Atmos, Recliner Lounges',
    screensCount: 4,
  });

  useEffect(() => {
    fetchCinemas();
  }, []);

  const fetchCinemas = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cinemas');
      if (res.data?.success) {
        setCinemas(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load cinemas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete cinema "${name}" and its screens?`)) return;

    try {
      const res = await api.delete(`/cinemas/${id}`);
      if (res.data?.success) {
        toast.success('Cinema deleted');
        fetchCinemas();
      }
    } catch (err) {
      toast.error('Failed to delete cinema');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        facilities: formData.facilities.split(',').map((f) => f.trim()),
        screensCount: Number(formData.screensCount),
      };

      await api.post('/cinemas', payload);
      toast.success('Cinema added successfully');
      setModalOpen(false);
      fetchCinemas();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add cinema');
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">Cinema Venues & Screens</h1>
          <p className="text-xs text-text-muted">Manage partner locations, auditoriums, and facilities</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-hover text-white text-xs font-semibold shadow-glow-burgundy flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Cinema Venue
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="p-8 text-xs text-text-muted">Loading cinemas...</div>
        ) : cinemas.length > 0 ? (
          cinemas.map((cinema) => (
            <div
              key={cinema._id}
              className="bg-surface rounded-2xl border border-surface-border p-6 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-accent px-2.5 py-0.5 rounded-full bg-burgundy/20 border border-accent/20">
                    {cinema.city}
                  </span>
                  <button
                    onClick={() => handleDelete(cinema._id, cinema.name)}
                    className="p-1 rounded text-text-muted hover:text-danger hover:bg-danger/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-display text-lg font-bold text-text-primary">{cinema.name}</h3>
                <p className="text-xs text-text-muted flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-accent mt-0.5" />
                  <span>{cinema.address}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-surface-border space-y-2">
                <div className="text-xs text-text-muted flex justify-between">
                  <span>Capacity</span>
                  <span className="font-semibold text-text-primary">{cinema.screensCount || 4} Screens</span>
                </div>

                {cinema.facilities && (
                  <div className="flex flex-wrap gap-1">
                    {cinema.facilities.map((fac, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-surface-light rounded text-text-secondary border border-surface-border">
                        {fac}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-xs text-text-muted">No cinemas configured.</div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-surface-border max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="font-display text-lg font-bold text-text-primary">Add Partner Cinema</h3>
              <button onClick={() => setModalOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-text-muted uppercase mb-1 font-semibold">Cinema Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. REEL LUXE Mall of Asia"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-text-muted uppercase mb-1 font-semibold">City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-text-muted uppercase mb-1 font-semibold">Address</label>
                <input
                  type="text"
                  required
                  placeholder="Street and locality"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-text-muted uppercase mb-1 font-semibold">Facilities (Comma-separated)</label>
                <input
                  type="text"
                  value={formData.facilities}
                  onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
                />
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
                  Create Cinema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCinemasPage;

