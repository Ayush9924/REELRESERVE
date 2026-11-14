import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Calendar, Ticket } from 'lucide-react';

const MovieCard = ({ movie }) => {
  if (!movie) return null;

  const isComingSoon = movie.status === 'coming_soon';

  return (
    <div className="group relative bg-surface rounded-xl overflow-hidden border border-surface-border hover:border-burgundy-light/60 transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-card">
      
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-light">
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // Elegant fallback if external link drops
            e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop';
          }}
        />

        {/* Rating / Status Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          {movie.rating ? (
            <div className="bg-background/80 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-semibold text-accent flex items-center gap-1 border border-accent/20">
              <Star className="w-3.5 h-3.5 fill-accent text-accent" />
              <span>{movie.rating.toFixed(1)}</span>
            </div>
          ) : null}

          {movie.certification && (
            <div className="bg-surface/85 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-text-secondary border border-surface-border">
              {movie.certification}
            </div>
          )}
        </div>

        {/* Release Status Badge */}
        {isComingSoon && (
          <div className="absolute top-3 right-3 bg-burgundy/90 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md tracking-wider uppercase border border-burgundy-light/40">
            Coming Soon
          </div>
        )}

        {/* Hover Quick Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <Link
            to={`/movies/${movie._id}`}
            className="w-full py-2.5 rounded-lg bg-burgundy hover:bg-burgundy-hover text-white text-xs font-semibold text-center shadow-glow-burgundy flex items-center justify-center gap-1.5 transition-all"
          >
            <Ticket className="w-3.5 h-3.5" />
            {isComingSoon ? 'View Details' : 'Book Tickets'}
          </Link>
        </div>
      </div>

      {/* Movie Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1.5 flex-wrap">
            <span>{movie.language || 'English'}</span>
            <span>•</span>
            <span>{Array.isArray(movie.genre) ? movie.genre.slice(0, 2).join(', ') : movie.genre}</span>
          </div>

          <Link to={`/movies/${movie._id}`}>
            <h3 className="font-semibold text-text-primary text-base line-clamp-1 group-hover:text-accent transition-colors">
              {movie.title}
            </h3>
          </Link>
        </div>

        <div className="mt-3 pt-3 border-t border-surface-border flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{movie.duration}m</span>
          </div>
          {movie.releaseDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(movie.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default MovieCard;

