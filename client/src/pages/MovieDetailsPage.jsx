import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Clock, Calendar, Ticket, User, Clapperboard, MapPin, ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../api/axios';
import { useBooking } from '../context/BookingContext';
import { useLocation } from '../context/LocationContext';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setSelectedMovie, setSelectedCinema, setSelectedShowtime } = useBooking();
  const { selectedCity: globalCity, setIsModalOpen, popularCities } = useLocation();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCity, setSelectedCity] = useState(globalCity || 'All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync with global header city
  useEffect(() => {
    if (globalCity) {
      setSelectedCity(globalCity);
    }
  }, [globalCity]);

  useEffect(() => {
    const fetchMovieAndShows = async () => {
      try {
        setLoading(true);
        const [movieRes, showtimesRes] = await Promise.all([
          api.get(`/movies/${id}`),
          api.get(`/showtimes?movieId=${id}`),
        ]);

        if (movieRes.data?.success) {
          setMovie(movieRes.data.data);
          setSelectedMovie(movieRes.data.data);
        } else {
          setError('Movie not found');
        }

        if (showtimesRes.data?.success) {
          setShowtimes(showtimesRes.data.data || []);
          // Set initial date if available
          if (showtimesRes.data.data.length > 0) {
            setSelectedDate(showtimesRes.data.data[0].date);
          }
        }
      } catch (err) {
        console.error('Error fetching details:', err);
        setError('Failed to load movie information');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieAndShows();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="h-96 bg-surface-light rounded-3xl mb-8"></div>
        <div className="h-8 bg-surface-light rounded w-1/3 mx-auto mb-4"></div>
        <div className="h-4 bg-surface-light rounded w-1/2 mx-auto"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-surface rounded-2xl border border-surface-border text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-danger mx-auto" />
        <h2 className="text-xl font-bold text-text-primary">{error || 'Movie Not Found'}</h2>
        <p className="text-xs text-text-muted">The requested cinema screening may have ended or is temporarily unavailable.</p>
        <Link
          to="/movies"
          className="inline-block px-5 py-2.5 rounded-lg bg-burgundy text-white text-xs font-semibold"
        >
          Back to Movies
        </Link>
      </div>
    );
  }

  // Extract unique dates from showtimes
  const availableDates = Array.from(new Set(showtimes.map((s) => s.date))).sort();
  if (availableDates.length > 0 && !selectedDate) {
    setSelectedDate(availableDates[0]);
  }

  // Group showtimes by Cinema for the active date
  const filteredShows = showtimes.filter((s) => !selectedDate || s.date === selectedDate);
  const showsByCinema = filteredShows.reduce((acc, show) => {
    const cinemaId = show.cinemaId?._id || show.cinemaId;
    const cinemaName = show.cinemaId?.name || 'Grand Cinema';
    const cinemaCity = show.cinemaId?.city || 'Mumbai';
    const cinemaAddress = show.cinemaId?.address || 'Downtown Center';
    const facilities = show.cinemaId?.facilities || [];

    if (selectedCity !== 'All' && cinemaCity.toLowerCase() !== selectedCity.toLowerCase()) {
      return acc;
    }

    if (!acc[cinemaId]) {
      acc[cinemaId] = {
        id: cinemaId,
        name: cinemaName,
        city: cinemaCity,
        address: cinemaAddress,
        facilities,
        shows: [],
      };
    }
    acc[cinemaId].shows.push(show);
    return acc;
  }, {});

  const handleSelectShowtime = (show) => {
    setSelectedMovie(movie);
    setSelectedCinema(show.cinemaId);
    setSelectedShowtime(show);
    navigate(`/booking/seats/${show._id}`);
  };

  return (
    <div className="space-y-12 pb-20">
      
      {/* Movie Hero Banner */}
      <div className="relative min-h-[460px] flex items-end overflow-hidden border-b border-surface-border">
        {/* Backdrop */}
        <div className="absolute inset-0 z-0">
          <img
            src={movie.backdrop || movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover filter brightness-[0.35]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent"></div>
        </div>

        {/* Hero Details Card */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <Link
            to="/movies"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Movies
          </Link>

          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            {/* Poster thumbnail */}
            <div className="w-48 sm:w-56 shrink-0 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-surface-border bg-surface">
              <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
            </div>

            {/* Title & Metadata */}
            <div className="space-y-4 text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-2.5 py-1 rounded bg-burgundy/80 text-white text-xs font-semibold uppercase tracking-wider">
                  {movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
                </span>
                {movie.certification && (
                  <span className="px-2 py-0.5 rounded border border-surface-border bg-surface text-xs text-text-secondary font-medium">
                    {movie.certification}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded border border-surface-border bg-surface text-xs text-text-secondary font-medium">
                  {movie.language}
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-text-primary tracking-tight">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs sm:text-sm text-text-secondary">
                {movie.rating && (
                  <div className="flex items-center gap-1 text-accent font-bold">
                    <Star className="w-4 h-4 fill-accent" />
                    <span>{movie.rating.toFixed(1)} / 10</span>
                  </div>
                )}
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{movie.duration} Mins</span>
                </div>
                <span>•</span>
                <span>{Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}</span>
                {movie.releaseDate && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(movie.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Synopsis & Showtimes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Storyline & Cast info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface p-6 rounded-2xl border border-surface-border space-y-4">
            <h3 className="font-display text-lg font-bold text-text-primary">About the Movie</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {movie.description}
            </p>

            {movie.director && (
              <div className="pt-4 border-t border-surface-border">
                <span className="text-xs text-text-muted block uppercase tracking-wider">Director</span>
                <p className="text-sm font-semibold text-text-primary mt-0.5">{movie.director}</p>
              </div>
            )}

            {Array.isArray(movie.cast) && movie.cast.length > 0 && (
              <div className="pt-4 border-t border-surface-border">
                <span className="text-xs text-text-muted block uppercase tracking-wider mb-2">Leading Cast</span>
                <div className="flex flex-wrap gap-1.5">
                  {movie.cast.map((actor, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-surface-light border border-surface-border text-xs text-text-primary"
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Date Selection & Showtimes Grid */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section Heading */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-accent" />
              <h2 className="font-display text-xl font-bold text-text-primary">Select Cinema & Showtime</h2>
            </div>

            {/* City Selector */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-light border border-surface-border text-accent font-semibold transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{selectedCity === 'All' ? 'Select City' : selectedCity}</span>
              </button>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-surface py-1.5 px-3 rounded-lg border border-surface-border text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="All">All Cities</option>
                {popularCities.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Selector Pills */}
          {availableDates.length > 0 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {availableDates.map((dateStr) => {
                const dateObj = new Date(dateStr);
                const isSelected = selectedDate === dateStr;
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = dateObj.toLocaleDateString('en-US', { day: 'numeric' });
                const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`shrink-0 flex flex-col items-center justify-center w-16 py-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-burgundy border-burgundy-light shadow-glow-burgundy text-white'
                        : 'bg-surface border-surface-border text-text-secondary hover:text-text-primary hover:border-surface-lighter'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-semibold">{dayName}</span>
                    <span className="text-base font-bold my-0.5">{dayNum}</span>
                    <span className="text-[10px] uppercase">{monthName}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Cinemas & Shows List */}
          {Object.keys(showsByCinema).length > 0 ? (
            <div className="space-y-4">
              {Object.values(showsByCinema).map((cinema) => (
                <div
                  key={cinema.id}
                  className="bg-surface rounded-2xl p-6 border border-surface-border space-y-4 hover:border-surface-lighter transition-all"
                >
                  {/* Cinema Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-surface-border gap-2">
                    <div>
                      <h4 className="font-semibold text-text-primary text-base flex items-center gap-2">
                        {cinema.name}
                        <span className="text-xs text-text-muted font-normal">({cinema.city})</span>
                      </h4>
                      <p className="text-xs text-text-muted mt-0.5">{cinema.address}</p>
                    </div>

                    {cinema.facilities && cinema.facilities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {cinema.facilities.map((f, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-[10px] rounded bg-surface-light border border-surface-border text-accent"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Showtimes Pill Grid */}
                  <div className="flex flex-wrap gap-3 pt-1">
                    {cinema.shows.map((show) => (
                      <button
                        key={show._id}
                        onClick={() => handleSelectShowtime(show)}
                        className="group flex flex-col items-center px-4 py-2 rounded-xl bg-surface-light hover:bg-burgundy border border-surface-border hover:border-burgundy-light text-text-primary hover:text-white transition-all shadow-sm"
                      >
                        <span className="text-sm font-bold tracking-wide">{show.startTime}</span>
                        <span className="text-[10px] text-text-muted group-hover:text-accent font-medium mt-0.5">
                          {show.screenId?.screenType || '4K Laser'} • Screen {show.screenId?.name || '1'}
                        </span>
                        <span className="text-[10px] text-accent font-semibold mt-1">
                          From ₹{show.pricing?.regular || 250}
                        </span>
                      </button>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-surface rounded-2xl border border-surface-border space-y-3">
              <Clapperboard className="w-10 h-10 mx-auto text-text-muted opacity-40" />
              <h4 className="font-semibold text-text-primary text-base">No Shows Available For This Date</h4>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                No active showtimes match your current date or city filter. Please select another date or check back later.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default MovieDetailsPage;

