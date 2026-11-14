import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Mail, Phone, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-surface border-t border-surface-border text-text-secondary mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-burgundy flex items-center justify-center text-accent">
                <Film className="w-5 h-5" />
              </div>
              <span className="font-display text-lg font-bold tracking-widest text-text-primary">
                REEL<span className="text-accent ml-1">RESERVE</span>
              </span>
            </Link>
            <p className="text-sm text-text-muted leading-relaxed">
              Your next movie night, perfectly booked. High-definition cinema discovery, reserved seating, and seamless digital access.
            </p>
            <p className="text-xs text-text-muted">
              Built for ALGIONS AI LABS Technical Assessment.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-text-primary text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/movies" className="hover:text-accent transition-colors">Now Showing</Link></li>
              <li><Link to="/movies?status=coming_soon" className="hover:text-accent transition-colors">Upcoming Premieres</Link></li>
              <li><Link to="/cinemas" className="hover:text-accent transition-colors">Partner Cinemas</Link></li>
              <li><Link to="/offers" className="hover:text-accent transition-colors">Promotions & Vouchers</Link></li>
            </ul>
          </div>

          {/* Experience & Formats */}
          <div className="space-y-3">
            <h4 className="font-semibold text-text-primary text-sm uppercase tracking-wider">Formats</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>IMAX 3D Laser</li>
              <li>Dolby Atmos Cinema</li>
              <li>4DX Dynamic Experience</li>
              <li>VIP Recliner Lounges</li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="font-semibold text-text-primary text-sm uppercase tracking-wider">Concierge</h4>
            <div className="space-y-2 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                <span>Film City Blvd, Mumbai / Bengaluru</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" />
                <span>support@reelreserve.demo</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent" />
                <span>+91 1800-CINEMA-00</span>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
          <p>© {new Date().getFullYear()} REEL RESERVE. All rights reserved. Simulated Cinema Experience.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-burgundy fill-burgundy" />
            <span>for Algions Engineering</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

