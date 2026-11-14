import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const POPULAR_CITIES = [
  { name: 'Mumbai', state: 'Maharashtra', icon: 'Gateway' },
  { name: 'Delhi-NCR', state: 'National Capital Region', icon: 'IndiaGate' },
  { name: 'Bengaluru', state: 'Karnataka', icon: 'VidhanSoudha' },
  { name: 'Hyderabad', state: 'Telangana', icon: 'Charminar' },
  { name: 'Chandigarh', state: 'Punjab / Haryana', icon: 'OpenHand' },
  { name: 'Ahmedabad', state: 'Gujarat', icon: 'Toran' },
  { name: 'Pune', state: 'Maharashtra', icon: 'ShaniwarWada' },
  { name: 'Chennai', state: 'Tamil Nadu', icon: 'Temple' },
  { name: 'Kolkata', state: 'West Bengal', icon: 'Howrah' },
  { name: 'Kochi', state: 'Kerala', icon: 'Backwaters' },
  { name: 'Jalandhar', state: 'Punjab', icon: 'Fort' },
  { name: 'Jaipur', state: 'Rajasthan', icon: 'HawaMahal' },
];

export const OTHER_CITIES = [
  'Agra', 'Amritsar', 'Bhopal', 'Bhubaneswar', 'Coimbatore', 'Dehradun', 
  'Goa', 'Guwahati', 'Indore', 'Kanpur', 'Lucknow', 'Ludhiana', 
  'Madurai', 'Nagpur', 'Noida', 'Patna', 'Raipur', 'Surat', 'Vadodara', 'Varanasi', 'Visakhapatnam'
];

export const LocationProvider = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState(() => {
    return localStorage.getItem('reel_reserve_city') || 'Mumbai';
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('reel_reserve_city', selectedCity);
  }, [selectedCity]);

  const selectCity = (city) => {
    setSelectedCity(city);
    setIsModalOpen(false);
  };

  return (
    <LocationContext.Provider
      value={{
        selectedCity,
        selectCity,
        isModalOpen,
        setIsModalOpen,
        popularCities: POPULAR_CITIES,
        otherCities: OTHER_CITIES,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
