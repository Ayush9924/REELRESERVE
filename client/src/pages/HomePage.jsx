import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Ticket, ShieldCheck, Sparkles, ChevronRight, Star, Clapperboard, Award, Volume2 } from 'lucide-react';
import api from '../api/axios';
import MovieCard from '../components/MovieCard';
import { MovieGridSkeleton } from '../components/LoadingSkeleton';

const HomePage = () => {
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await api.get('/movies');
        if (res.data?.success && res.data.data) {
          const movies = res.data.data;
          const showing = movies.filter((m) => m.status === 'now_showing');
          const upcoming = movies.filter((m) => m.status === 'coming_soon');
          
          setNowShowing(showing);
          setComingSoon(upcoming);
          // Highlight first now_showing or top rated movie
          if (showing.length > 0) {
            setFeaturedMovie(showing[0]);
          } else if (movies.length > 0) {
            setFeaturedMovie(movies[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load homepage movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      
      {/* Cinematic Hero Section */}
      <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center justify-center overflow-hidden border-b border-surface-border">
        {featuredMovie ? (
          <>
            {/* Backdrop Image with Multi-Gradient Overlay */}
            <div className="absolute inset-0 z-0">
              <img
                src={featuredMovie.backdrop || featuredMovie.poster}
                alt={featuredMovie.title}
                className="w-full h-full object-cover object-center filter brightness-[0.45] scale-105 transform animate-fade-in"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
              <div className="max-w-2xl space-y-6">
                
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-burgundy/40 border border-accent/30 backdrop-blur-md text-accent text-xs font-semibold tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  Featured Premiering Tonight
                </div>

                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight leading-tight">
                  {featuredMovie.title}
                </h1>

                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  {featuredMovie.rating && (
                    <div className="flex items-center gap-1.5 text-accent font-semibold">
                      <Star className="w-4 h-4 fill-accent" />
                      <span>{featuredMovie.rating.toFixed(1)} / 10</span>
                    </div>
                  )}
                  <span>•</span>
                  <span>{featuredMovie.duration} Mins</span>
                  <span>•</span>
                  <span>{Array.isArray(featuredMovie.genre) ? featuredMovie.genre.join(', ') : featuredMovie.genre}</span>
                  {featuredMovie.certification && (
                    <>
                      <span>•</span>
                      <span className="border border-surface-border px-1.5 py-0.5 rounded text-xs text-text-primary">
                        {featuredMovie.certification}
                      </span>
                    </>
                  )}
                </div>

                <p className="text-text-secondary text-base leading-relaxed line-clamp-3">
                  {featuredMovie.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    to={`/movies/${featuredMovie._id}`}
                    className="px-6 py-3.5 rounded-xl bg-burgundy hover:bg-burgundy-hover text-white font-semibold text-sm flex items-center gap-2 shadow-glow-burgundy border border-burgundy-light/40 transition-all hover:scale-105"
                  >
                    <Ticket className="w-4 h-4 text-accent" />
                    Book Reserved Seats
                  </Link>

                  <Link
                    to={`/movies/${featuredMovie._id}`}
                    className="px-6 py-3.5 rounded-xl bg-surface/80 hover:bg-surface-light border border-surface-border text-text-primary font-semibold text-sm flex items-center gap-2 backdrop-blur-md transition-all"
                  >
                    <Play className="w-4 h-4 text-accent fill-accent" />
                    View Details
                  </Link>
                </div>

              </div>
            </div>
          </>
        ) : (
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-6">
            <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-text-primary">
              REEL <span className="text-accent">RESERVE</span>
            </h1>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              Your next movie night, perfectly booked. High fidelity sound, reserved luxury seating, and premier cinema discovery.
            </p>
            <div className="pt-4">
              <Link
                to="/movies"
                className="px-8 py-3.5 rounded-xl bg-burgundy hover:bg-burgundy-hover text-white font-semibold text-sm shadow-glow-burgundy transition-all"
              >
                Browse All Movies
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Main Highlights Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-surface p-6 rounded-2xl border border-surface-border">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-burgundy/20 text-accent border border-accent/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-text-primary text-sm">Guaranteed Reserved Seating</h4>
              <p className="text-xs text-text-muted mt-1">Live synchronized seat layout locking ensures zero double-booking.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-burgundy/20 text-accent border border-accent/20">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-text-primary text-sm">Acoustic & Laser Formats</h4>
              <p className="text-xs text-text-muted mt-1">Certified IMAX with Laser, 4DX and Dolby Atmos multi-channel auditoriums.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-burgundy/20 text-accent border border-accent/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-text-primary text-sm">Instant Digital Passports</h4>
              <p className="text-xs text-text-muted mt-1">Downloadable cinema passes with verifiable QR codes directly to your device.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Now Showing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-8 bg-burgundy rounded-sm"></div>
            <div>
              <h2 className="text-2xl font-display font-bold text-text-primary tracking-wide">Now Showing</h2>
              <p className="text-xs text-text-muted">Currently lighting up silver screens across premier cinemas</p>
            </div>
          </div>
          <Link
            to="/movies?status=now_showing"
            className="text-xs font-semibold text-accent hover:text-accent-hover flex items-center gap-1 transition-colors"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <MovieGridSkeleton count={4} />
        ) : nowShowing.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {nowShowing.slice(0, 8).map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-surface rounded-xl border border-surface-border text-text-muted">
            <Clapperboard className="w-10 h-10 mx-auto mb-3 text-text-muted opacity-50" />
            <p>No movies currently scheduled. Please check back shortly.</p>
          </div>
        )}
      </section>

      {/* Coming Soon Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-8 bg-accent rounded-sm"></div>
            <div>
              <h2 className="text-2xl font-display font-bold text-text-primary tracking-wide">Upcoming Premieres</h2>
              <p className="text-xs text-text-muted">Reserve your alerts for the most anticipated releases</p>
            </div>
          </div>
          <Link
            to="/movies?status=coming_soon"
            className="text-xs font-semibold text-accent hover:text-accent-hover flex items-center gap-1 transition-colors"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <MovieGridSkeleton count={4} />
        ) : comingSoon.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {comingSoon.slice(0, 4).map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-surface rounded-xl border border-surface-border text-text-muted">
            <Clapperboard className="w-10 h-10 mx-auto mb-3 text-text-muted opacity-50" />
            <p>Upcoming schedule being finalized with distributors.</p>
          </div>
        )}
      </section>

      {/* Special Offers Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-burgundy-dark via-surface to-surface p-8 sm:p-10 border border-burgundy-light/30">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Exclusive Privilege</span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
              Elevate Your Movie Evenings with REELPREMIUM
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Use code <span className="font-mono text-accent font-bold px-2 py-0.5 bg-background/60 rounded border border-accent/30">REEL50</span> at checkout to enjoy up to 50% discount on weekday IMAX and Gold lounge seats.
            </p>
            <div className="pt-2">
              <Link
                to="/offers"
                className="inline-block px-5 py-2.5 rounded-lg bg-accent text-background font-bold text-xs uppercase tracking-wider hover:bg-accent-hover transition-colors shadow-glow-gold"
              >
                View Available Offers
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;

