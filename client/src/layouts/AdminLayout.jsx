import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { Film, LayoutDashboard, Clapperboard, MapPin, Calendar, Users, Ticket, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Movies', path: '/admin/movies', icon: Clapperboard },
    { name: 'Cinemas & Screens', path: '/admin/cinemas', icon: MapPin },
    { name: 'Showtimes', path: '/admin/showtimes', icon: Calendar },
    { name: 'Bookings', path: '/admin/bookings', icon: Ticket },
    { name: 'Customers', path: '/admin/customers', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col md:flex-row">
      
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-surface border-r border-surface-border flex flex-col justify-between shrink-0">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-surface-border flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-burgundy flex items-center justify-center text-accent">
                <Film className="w-4 h-4" />
              </div>
              <span className="font-display text-base font-bold tracking-wider text-text-primary">
                REEL<span className="text-accent">ADMIN</span>
              </span>
            </Link>
          </div>

          {/* Nav links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-burgundy text-white shadow-glow-burgundy'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-surface-border space-y-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary px-3 py-2 rounded-lg hover:bg-surface-light transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Customer Storefront</span>
          </Link>

          <div className="pt-2 border-t border-surface-border flex items-center justify-between px-2">
            <div className="truncate">
              <p className="text-xs font-semibold text-text-primary truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-accent uppercase font-mono">Master Role</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};

export default AdminLayout;

