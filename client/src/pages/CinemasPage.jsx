import React, { useState, useEffect } from 'react';
import { MapPin, Film, ScreenShare, Sparkles, Building2 } from 'lucide-react';
import api from '../api/axios';
import { useLocation } from '../context/LocationContext';

const CinemasPage = () => {
  const { selectedCity: globalCity, setIsModalOpen } = useLocation();
  const [cinemas, setCinemas] = useState([]);
  const [selectedCity, setSelectedCity] = useState(globalCity || 'All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (globalCity) {
      setSelectedCity(globalCity);
    }
  }, [globalCity]);

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const res = await api.get('/cinemas');
        if (res.data?.success) {
          setCinemas(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch cinemas:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCinemas();
  }, []);

  const cities = ['All', ...new Set(cinemas.map((c) => c.city))];
  const filteredCinemas = selectedCity === 'All' ? cinemas : cinemas.filter((c) => c.city === selectedCity);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
          Partner Cinemas
        </h1>
        <p className="text-sm text-text-muted mt-1">
          State-of-the-art cinematic venues equipped with laser projection, Dolby Atmos and luxury recliners.
        </p>
      </div>

      {/* City Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCity === city
                ? 'bg-burgundy text-white shadow-glow-burgundy'
                : 'bg-surface text-text-secondary border border-surface-border hover:text-text-primary'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Cinema Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-surface rounded-2xl border border-surface-border"></div>
          ))}
        </div>
      ) : filteredCinemas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCinemas.map((cinema) => (
            <div
              key={cinema._id}
              className="bg-surface rounded-2xl border border-surface-border p-6 space-y-4 hover:border-accent/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-surface-light rounded-xl border border-surface-border text-accent">
                    <Film className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-burgundy/20 text-accent rounded-full border border-accent/20">
                    {cinema.city}
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-text-primary">{cinema.name}</h3>
                <div className="flex items-start gap-1.5 text-xs text-text-muted">
                  <MapPin className="w-4 h-4 shrink-0 text-accent mt-0.5" />
                  <span>{cinema.address}</span>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-surface-border">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Available Screens</span>
                  <span className="font-semibold text-text-primary">{cinema.screensCount || 4} Screens</span>
                </div>

                {cinema.facilities && cinema.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cinema.facilities.map((fac, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] bg-surface-light text-text-secondary border border-surface-border"
                      >
                        {fac}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-surface rounded-2xl border border-surface-border text-text-muted">
          No cinemas found in this location.
        </div>
      )}
    </div>
  );
};

export default CinemasPage;

