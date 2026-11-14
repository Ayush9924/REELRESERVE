import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Film, User, LogOut, Shield, Menu, X, Ticket, MapPin, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { selectedCity, setIsModalOpen } = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Movies', path: '/movies' },
    { name: 'Cinemas', path: '/cinemas' },
    { name: 'Offers', path: '/offers' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-surface-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-burgundy to-burgundy-dark border border-burgundy-light/40 flex items-center justify-center shadow-glow-burgundy group-hover:scale-105 transition-transform duration-300">
            <Film className="w-5 h-5 text-accent" />
          </div>
          <div>
            <span className="font-display text-xl font-extrabold tracking-widest text-text-primary block leading-none">
              REEL<span className="text-accent ml-1">RESERVE</span>
            </span>
            <span className="text-[10px] tracking-widest text-text-muted uppercase font-medium">
              Cinema Concierge
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors tracking-wide ${
                  isActive
                    ? 'text-accent border-b-2 border-accent pb-1'
                    : 'text-text-secondary hover:text-text-primary'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          {user && (
            <NavLink
              to="/my-bookings"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors tracking-wide flex items-center gap-1.5 ${
                  isActive
                    ? 'text-accent border-b-2 border-accent pb-1'
                    : 'text-text-secondary hover:text-text-primary'
                }`
              }
            >
              <Ticket className="w-4 h-4" />
              My Bookings
            </NavLink>
          )}

          {/* Location Selector Button (BookMyShow Style) */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-light hover:bg-surface-border text-xs font-semibold text-text-primary border border-surface-border transition-all hover:scale-105 shadow-sm"
          >
            <MapPin className="w-3.5 h-3.5 text-accent" />
            <span className="font-medium text-accent">{selectedCity}</span>
            <ChevronDown className="w-3 h-3 text-text-muted" />
          </button>
        </nav>

        {/* User Account / Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-3 py-1.5 rounded-md bg-burgundy/20 hover:bg-burgundy/40 text-accent border border-accent/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin Panel
                </Link>
              )}

              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-light border border-surface-border text-sm text-text-primary transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-burgundy/60 border border-accent/40 flex items-center justify-center text-xs font-bold text-accent">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="max-w-[120px] truncate text-xs font-medium">{user.name}</span>
              </Link>

              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 rounded-lg bg-surface hover:bg-danger/20 hover:text-danger text-text-secondary border border-surface-border transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-text-primary hover:text-accent transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-burgundy hover:bg-burgundy-hover text-white text-sm font-medium border border-burgundy-light/40 shadow-glow-burgundy transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface text-xs font-medium text-accent border border-surface-border"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="max-w-[80px] truncate">{selectedCity}</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-surface text-text-secondary hover:text-text-primary border border-surface-border"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-surface-border px-4 py-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `text-base font-medium py-1 ${
                    isActive ? 'text-accent' : 'text-text-secondary'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            {user && (
              <NavLink
                to="/my-bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium py-1 text-text-secondary flex items-center gap-2"
              >
                <Ticket className="w-4 h-4" /> My Bookings
              </NavLink>
            )}
          </div>

          <div className="pt-4 border-t border-surface-border flex flex-col gap-3">
            {user ? (
              <>
                <div className="flex items-center justify-between text-sm text-text-muted">
                  <span>Signed in as <b className="text-text-primary">{user.name}</b></span>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs text-accent underline"
                    >
                      Admin
                    </Link>
                  )}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 rounded-lg bg-danger/20 text-danger border border-danger/30 text-sm font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-lg bg-surface-light border border-surface-border text-sm font-medium text-text-primary"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-lg bg-burgundy border border-burgundy-light/40 text-sm font-medium text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

