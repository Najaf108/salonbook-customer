// src/stores/useBookingStore.js
import { create } from 'zustand';

export const useBookingStore = create((set, get) => ({
  // Selected salon
  salon: null,
  // Selected services (array)
  selectedServices: [],
  // Selected staff member (optional)
  selectedStaff: null,
  // Selected date string e.g. '2026-04-15'
  selectedDate: null,
  // Selected time string e.g. '14:30'
  selectedTime: null,
  // Payment method
  paymentMethod: 'CASH_ON_ARRIVAL',
  // Notes for salon
  notes: '',
  // Applied deal
  appliedDeal: null,    // { id, title, discountAmount, dealType }
  // Package booking
  packageId: null,      // if booking a package
  selectedPackage: null, // the full package object

  setSalon: (salon) => set({
    salon,
    selectedServices: [],
    selectedStaff: null,
    selectedDate: null,
    selectedTime: null,
    appliedDeal: null,
    packageId: null,
    selectedPackage: null
  }),

  toggleService: (service) => {
    const current = get().selectedServices;
    const exists = current.find(s => s.id === service.id);
    // If we were booking a package, toggle off package mode if services are modified
    set({
      selectedServices: exists
        ? current.filter(s => s.id !== service.id)
        : [...current, service],
      packageId: null,
      selectedPackage: null
    });
  },

  setStaff: (staff) => set({ selectedStaff: staff }),

  setDateTime: (date, time) => set({ selectedDate: date, selectedTime: time }),

  setPaymentMethod: (method) => set({ paymentMethod: method }),

  setNotes: (notes) => set({ notes }),

  // Deal actions
  setAppliedDeal: (deal) => set({ appliedDeal: deal }),
  clearAppliedDeal: () => set({ appliedDeal: null }),

  // Package action — also pre-fills services from package items
  setPackage: (pkg) => set({
    packageId: pkg?.id ?? null,
    selectedPackage: pkg ?? null,
    selectedServices: pkg?.items?.map(i => i.service).filter(Boolean) ?? [],
    appliedDeal: null,
  }),

  // Computed helpers
  getTotalPrice: () => {
    const { selectedPackage, selectedServices, appliedDeal } = get();
    const subtotal = selectedPackage
      ? selectedPackage.packagePrice
      : selectedServices.reduce((sum, s) => sum + s.price, 0);
    const discount = appliedDeal?.discountAmount ?? 0;
    return Math.max(0, subtotal - discount);
  },

  getSubtotal: () => {
    const { selectedPackage, selectedServices } = get();
    if (selectedPackage) return selectedPackage.packagePrice;
    return selectedServices.reduce((sum, s) => sum + s.price, 0);
  },

  getTotalDuration: () => {
    const { selectedPackage, selectedServices } = get();
    if (selectedPackage) return selectedPackage.estimatedDuration;
    return selectedServices.reduce((sum, s) => sum + s.duration, 0);
  },

  getServiceIds: () => get().selectedServices.map(s => s.id),

  getScheduledAt: () => {
    const { selectedDate, selectedTime } = get();
    if (!selectedDate || !selectedTime) return null;

    const [year, month, day] = selectedDate.split('-').map(Number);
    const [hour, minute] = selectedTime.split(':').map(Number);

    // Convert Pakistan Local Time to UTC (Subtract 5 hours)
    const date = new Date(Date.UTC(year, month - 1, day, hour - 5, minute));
    return date.toISOString();
  },

  reset: () => set({
    salon: null, selectedServices: [], selectedStaff: null,
    selectedDate: null, selectedTime: null,
    paymentMethod: 'CASH_ON_ARRIVAL', notes: '',
    appliedDeal: null, packageId: null, selectedPackage: null,
  }),
}));