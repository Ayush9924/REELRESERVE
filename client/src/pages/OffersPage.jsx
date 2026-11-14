import React, { useState, useEffect } from 'react';
import { Tag, Copy, Check, Sparkles } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [copiedCode, setCopiedCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await api.get('/admin/offers');
        if (res.data?.success) {
          setOffers(res.data.data);
        } else {
          // Default fallback offers if none seeded yet
          setOffers([
            {
              code: 'REEL50',
              title: '50% Weekend Blockbuster Voucher',
              description: 'Save 50% on all IMAX and Gold Lounge tickets booked for this weekend.',
              discountType: 'percentage',
              discountValue: 50,
              minAmount: 500,
            },
            {
              code: 'WELCOME100',
              title: 'Flat ₹100 Off on First Reservation',
              description: 'New members enjoy a flat ₹100 discount on their very first ticket booking.',
              discountType: 'flat',
              discountValue: 100,
              minAmount: 300,
            },
            {
              code: 'POPCORN20',
              title: '20% Cinema Snack Combo Discount',
              description: 'Enjoy 20% savings on premier combo meals and luxury seating bookings.',
              discountType: 'percentage',
              discountValue: 20,
              minAmount: 400,
            },
          ]);
        }
      } catch (err) {
        setOffers([
          {
            code: 'REEL50',
            title: '50% Weekend Blockbuster Voucher',
            description: 'Save 50% on all IMAX and Gold Lounge tickets booked for this weekend.',
            discountType: 'percentage',
            discountValue: 50,
            minAmount: 500,
          },
          {
            code: 'WELCOME100',
            title: 'Flat ₹100 Off on First Reservation',
            description: 'New members enjoy a flat ₹100 discount on their very first ticket booking.',
            discountType: 'flat',
            discountValue: 100,
            minAmount: 300,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`);
    setTimeout(() => setCopiedCode(''), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
          Privileges & Promotional Offers
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Apply promotional codes during checkout to enjoy exclusive discounts on your reservations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div
            key={offer.code}
            className="bg-surface rounded-2xl border border-surface-border p-6 flex flex-col justify-between space-y-4 hover:border-burgundy-light/50 transition-all shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-xl bg-burgundy/20 text-accent border border-accent/20">
                  <Tag className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold text-accent px-2.5 py-1 bg-surface-light rounded-full border border-surface-border">
                  {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} FLAT OFF`}
                </span>
              </div>

              <h3 className="font-display text-lg font-bold text-text-primary">{offer.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{offer.description}</p>
            </div>

            <div className="pt-4 border-t border-surface-border flex items-center justify-between">
              <div>
                <span className="text-[10px] text-text-muted block uppercase tracking-wider">Coupon Code</span>
                <span className="font-mono text-sm font-bold text-accent tracking-wider">{offer.code}</span>
              </div>

              <button
                onClick={() => handleCopy(offer.code)}
                className="px-3 py-1.5 rounded-lg bg-surface-light hover:bg-surface-lighter text-text-primary text-xs font-semibold flex items-center gap-1.5 border border-surface-border transition-all"
              >
                {copiedCode === offer.code ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-success" />
                    <span className="text-success">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-text-muted" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OffersPage;

