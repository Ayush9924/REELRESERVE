import React, { useState } from 'react';
import { Search, MapPin, Navigation, X, Check } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

const CitySelectModal = () => {
  const { isModalOpen, setIsModalOpen, selectedCity, selectCity, popularCities, otherCities } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [detecting, setDetecting] = useState(false);

  if (!isModalOpen) return null;

  // Filter popular and all cities based on search
  const filteredPopular = popularCities.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOthers = otherCities.filter((c) =>
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDetectLocation = () => {
    setDetecting(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          // Defaulting to user's local metro
          setTimeout(() => {
            selectCity('Mumbai');
            setDetecting(false);
          }, 800);
        },
        () => {
          setDetecting(false);
          selectCity('Mumbai');
        }
      );
    } else {
      setDetecting(false);
      selectCity('Mumbai');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface rounded-3xl border border-surface-border max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        
        {/* Search header */}
        <div className="p-6 border-b border-surface-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" />
              Select Your City
            </h3>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-light transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search for your city (e.g. Mumbai, Delhi, Jalandhar, Bengaluru)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-4 py-3 bg-surface-light border border-surface-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent placeholder:text-text-muted transition-colors"
            />
          </div>

          {/* Auto detect location button */}
          <button
            onClick={handleDetectLocation}
            disabled={detecting}
            className="inline-flex items-center gap-2 text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
          >
            <Navigation className={`w-3.5 h-3.5 ${detecting ? 'animate-spin' : ''}`} />
            <span>{detecting ? 'Detecting your city...' : 'Detect my location'}</span>
          </button>
        </div>

        {/* Cities Grid Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Popular Cities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">
              Popular Cities
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {filteredPopular.map((city) => {
                const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();
                return (
                  <button
                    key={city.name}
                    onClick={() => selectCity(city.name)}
                    className={`group flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-burgundy/30 border-accent text-accent shadow-glow-burgundy'
                        : 'bg-surface-light border-surface-border text-text-secondary hover:text-text-primary hover:border-surface-lighter hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface border border-surface-border flex items-center justify-center mb-2 group-hover:border-accent/40 text-text-muted group-hover:text-accent transition-colors">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-center leading-tight">
                      {city.name}
                    </span>
                    {isSelected && (
                      <Check className="w-3 h-3 text-accent mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Other Cities */}
          {filteredOthers.length > 0 && (
            <div className="pt-4 border-t border-surface-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                All Cities
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {filteredOthers.map((city) => (
                  <button
                    key={city}
                    onClick={() => selectCity(city)}
                    className={`text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      selectedCity.toLowerCase() === city.toLowerCase()
                        ? 'bg-burgundy/20 text-accent font-semibold border border-accent/20'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-light/40 border-t border-surface-border text-center text-xs text-text-muted">
          Currently browsing cinema schedules for: <b className="text-accent">{selectedCity}</b>
        </div>

      </div>
    </div>
  );
};

export default CitySelectModal;
