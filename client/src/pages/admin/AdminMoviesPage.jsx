import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Clapperboard, Star, Clock, X } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const AdminMoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    poster: '',
    backdrop: '',
    genre: 'Action, Sci-Fi',
    language: 'English',
    duration: 120,
    releaseDate: new Date().toISOString().split('T')[0],
    rating: 8.0,
    certification: 'UA',
    director: '',
    cast: 'Actor One, Actor Two',
    status: 'now_showing',
  });

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await api.get('/movies');
      if (res.data?.success) {
        setMovies(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load movies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (movie = null) => {
    if (movie) {
      setEditingMovie(movie);
      setFormData({
        title: movie.title,
        description: movie.description,
        poster: movie.poster,
        backdrop: movie.backdrop || '',
        genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre,
        language: movie.language,
        duration: movie.duration,
        releaseDate: movie.releaseDate ? movie.releaseDate.split('T')[0] : '',
        rating: movie.rating || 8.0,
        certification: movie.certification || 'UA',
        director: movie.director || '',
        cast: Array.isArray(movie.cast) ? movie.cast.join(', ') : '',
        status: movie.status,
      });
    } else {
      setEditingMovie(null);
      setFormData({
        title: '',
        description: '',
        poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop',
        genre: 'Sci-Fi, Adventure',
        language: 'English',
        duration: 135,
        releaseDate: new Date().toISOString().split('T')[0],
        rating: 8.5,
        certification: 'UA',
        director: 'Christopher Nolan',
        cast: 'Lead Actor, Supporting Cast',
        status: 'now_showing',
      });
    }
    setModalOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}"?`)) return;

    try {
      const res = await api.delete(`/movies/${id}`);
      if (res.data?.success) {
        toast.success('Movie deleted successfully');
        fetchMovies();
      }
    } catch (err) {
      toast.error('Failed to delete movie');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        genre: formData.genre.split(',').map((s) => s.trim()),
        cast: formData.cast.split(',').map((s) => s.trim()),
        duration: Number(formData.duration),
        rating: Number(formData.rating),
      };

      if (editingMovie) {
        await api.put(`/movies/${editingMovie._id}`, payload);
        toast.success('Movie updated successfully');
      } else {
        await api.post('/movies', payload);
        toast.success('Movie added to catalog');
      }
      setModalOpen(false);
      fetchMovies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">Movie Catalog Management</h1>
          <p className="text-xs text-text-muted">Add, update, or retire films currently showing and upcoming</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-hover text-white text-xs font-semibold shadow-glow-burgundy flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Movie
        </button>
      </div>

      {/* Movies Table / List */}
      <div className="bg-surface rounded-2xl border border-surface-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-text-muted">Loading movies...</div>
        ) : movies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-light text-text-muted uppercase border-b border-surface-border">
                <tr>
                  <th className="p-4">Movie</th>
                  <th className="p-4">Genre & Language</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {movies.map((movie) => (
                  <tr key={movie._id} className="hover:bg-surface-light/30 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-10 h-14 object-cover rounded-md border border-surface-border"
                      />
                      <div>
                        <span className="font-bold text-text-primary block">{movie.title}</span>
                        <span className="text-[10px] text-text-muted">{movie.director}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-text-primary block">
                        {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}
                      </span>
                      <span className="text-[10px] text-text-muted">{movie.language}</span>
                    </td>
                    <td className="p-4 text-text-muted">{movie.duration} Mins</td>
                    <td className="p-4">
                      <span className="font-bold text-accent">{movie.rating} / 10</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          movie.status === 'now_showing'
                            ? 'bg-success/20 text-success'
                            : 'bg-burgundy/30 text-accent'
                        }`}
                      >
                        {movie.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(movie)}
                        className="p-1.5 rounded-lg bg-surface-light hover:bg-surface-border text-text-secondary hover:text-text-primary"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(movie._id, movie.title)}
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
          <div className="p-12 text-center text-xs text-text-muted">No movies in catalog.</div>
        )}
      </div>

      {/* Add / Edit Movie Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-surface-border max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h3 className="font-display text-lg font-bold text-text-primary">
                {editingMovie ? 'Edit Movie Details' : 'Add New Movie'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-text-muted uppercase mb-1 font-semibold">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-text-muted uppercase mb-1 font-semibold">Description / Synopsis</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-text-muted uppercase mb-1 font-semibold">Poster Image URL</label>
                  <input
                    type="url"
                    required
                    value={formData.poster}
                    onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-text-muted uppercase mb-1 font-semibold">Backdrop Image URL</label>
                  <input
                    type="url"
                    value={formData.backdrop}
                    onChange={(e) => setFormData({ ...formData, backdrop: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-text-muted uppercase mb-1 font-semibold">Genre (Comma separated)</label>
                  <input
                    type="text"
                    required
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-text-muted uppercase mb-1 font-semibold">Language</label>
                  <input
                    type="text"
                    required
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-text-muted uppercase mb-1 font-semibold">Duration (Minutes)</label>
                  <input
                    type="number"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-text-muted uppercase mb-1 font-semibold">Release Date</label>
                  <input
                    type="date"
                    required
                    value={formData.releaseDate}
                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-text-muted uppercase mb-1 font-semibold">Rating (0 - 10)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-text-muted uppercase mb-1 font-semibold">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-light border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-accent"
                  >
                    <option value="now_showing">Now Showing</option>
                    <option value="coming_soon">Coming Soon</option>
                  </select>
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
                  Save Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminMoviesPage;

