import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]); // [{ row, number, category, price }]
  const [activeBooking, setActiveBooking] = useState(null); // active held booking details
  const [selectedOffer, setSelectedOffer] = useState(null);

  const calculateSubtotal = () => {
    return selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);
  };

  const calculateConvenienceFee = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 0 ? Math.round(subtotal * 0.08) : 0; // 8% fee
  };

  const calculateDiscount = () => {
    if (!selectedOffer) return 0;
    const subtotal = calculateSubtotal();
    if (selectedOffer.discountType === 'percentage') {
      return Math.round((subtotal * selectedOffer.discountValue) / 100);
    }
    return Math.min(selectedOffer.discountValue, subtotal);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const fee = calculateConvenienceFee();
    const discount = calculateDiscount();
    return Math.max(0, subtotal + fee - discount);
  };

  const resetBookingFlow = () => {
    setSelectedMovie(null);
    setSelectedCinema(null);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setActiveBooking(null);
    setSelectedOffer(null);
  };

  return (
    <BookingContext.Provider
      value={{
        selectedMovie,
        setSelectedMovie,
        selectedCinema,
        setSelectedCinema,
        selectedShowtime,
        setSelectedShowtime,
        selectedSeats,
        setSelectedSeats,
        activeBooking,
        setActiveBooking,
        selectedOffer,
        setSelectedOffer,
        calculateSubtotal,
        calculateConvenienceFee,
        calculateDiscount,
        calculateTotal,
        resetBookingFlow,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);

