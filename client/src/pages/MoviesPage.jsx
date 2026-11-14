import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Clapperboard, X } from 'lucide-react';
import api from '../api/axios';
import MovieCard from '../components/MovieCard';
import { MovieGridSkeleton } from '../components/LoadingSkeleton';

const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || 'all');
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('language') || 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [sortBy, setSortBy] = useState('popularity');

  const genres = ['Action', 'Sci-Fi', 'Drama', 'Adventure', 'Thriller', 'Animation', 'Crime'];
  const languages = ['English', 'Hindi', 'Tamil', 'Telugu'];

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await api.get('/movies');
        if (res.data?.success && res.data.data) {
          setMovies(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Update URL params when filters change
  useEffect(() => {
    const params = {};
    if (searchQuery) params.q = searchQuery;
    if (selectedGenre !== 'all') params.genre = selectedGenre;
    if (selectedLanguage !== 'all') params.language = selectedLanguage;
    if (statusFilter !== 'all') params.status = statusFilter;
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedGenre, selectedLanguage, statusFilter]);

  // Filtering & Sorting logic
  useEffect(() => {
    let result = [...movies];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q) ||
          (Array.isArray(m.cast) && m.cast.some((c) => c.toLowerCase().includes(q)))
      );
    }

    // Genre filter
    if (selectedGenre !== 'all') {
      result = result.filter((m) =>
        Array.isArray(m.genre)
          ? m.genre.some((g) => g.toLowerCase() === selectedGenre.toLowerCase())
          : m.genre?.toLowerCase() === selectedGenre.toLowerCase()
      );
    }

    // Language filter
    if (selectedLanguage !== 'all') {
      result = result.filter((m) => m.language?.toLowerCase() === selectedLanguage.toLowerCase());
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((m) => m.status === statusFilter);
    }

    // Sorting
    if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'releaseDate') {
      result.sort((a, b) => new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0));
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredMovies(result);
  }, [movies, searchQuery, selectedGenre, selectedLanguage, statusFilter, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGenre('all');
    setSelectedLanguage('all');
    setStatusFilter('all');
    setSortBy('popularity');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
          Explore Movies
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Discover now showing spectacles, upcoming blockbusters, and indie masterpieces.
        </p>
      </div>

      {/* Control Bar: Search & Quick Filters */}
      <div className="bg-surface p-4 sm:p-6 rounded-2xl border border-surface-border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by title, actor, or synopsis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-light border border-surface-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent transition-colors placeholder:text-text-muted"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="md:col-span-4 flex items-center bg-surface-light rounded-xl p-1 border border-surface-border">
            <button
              onClick={() => setStatusFilter('all')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === 'all' ? 'bg-burgundy text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('now_showing')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === 'now_showing' ? 'bg-burgundy text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Now Showing
            </button>
            <button
              onClick={() => setStatusFilter('coming_soon')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === 'coming_soon' ? 'bg-burgundy text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Coming Soon
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2.5 px-3 bg-surface-light border border-surface-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-accent"
            >
              <option value="popularity">Sort: Most Popular</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="releaseDate">Sort: Release Date</option>
              <option value="title">Sort: Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Pills: Genre & Language */}
        <div className="pt-2 border-t border-surface-border flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Genre:
            </span>
            <button
              onClick={() => setSelectedGenre('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedGenre === 'all'
                  ? 'bg-accent text-background font-semibold'
                  : 'bg-surface-light text-text-secondary hover:text-text-primary border border-surface-border'
              }`}
            >
              All Genres
            </button>
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedGenre === genre
                    ? 'bg-accent text-background font-semibold'
                    : 'bg-surface-light text-text-secondary hover:text-text-primary border border-surface-border'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {(selectedGenre !== 'all' || selectedLanguage !== 'all' || searchQuery || statusFilter !== 'all') && (
            <button
              onClick={resetFilters}
              className="text-xs text-danger hover:underline font-medium"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Movie Results Grid */}
      {loading ? (
        <MovieGridSkeleton count={8} />
      ) : filteredMovies.length > 0 ? (
        <div className="space-y-4">
          <p className="text-xs text-text-muted">
            Showing <span className="text-text-primary font-semibold">{filteredMovies.length}</span> titles matching your criteria
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-surface rounded-2xl border border-surface-border space-y-4">
          <Clapperboard className="w-12 h-12 mx-auto text-text-muted opacity-40" />
          <h3 className="text-lg font-semibold text-text-primary">No Movies Found</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            We couldn't find any movies matching your current search or filters. Try adjusting your query or reset the filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-lg bg-burgundy hover:bg-burgundy-hover text-white text-xs font-semibold shadow-glow-burgundy transition-all"
          >
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
};

export default MoviesPage;

