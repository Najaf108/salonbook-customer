// src/constants/categories.js
export const CATEGORIES = [
  { id: 'ALL', label: 'All', emoji: '✨' },
  { id: 'HAIR', label: 'Hair', emoji: '✂️' },
  { id: 'SKIN', label: 'Skin', emoji: '🧴' },
  { id: 'NAILS', label: 'Nails', emoji: '💅' },
  { id: 'MAKEUP', label: 'Makeup', emoji: '💄' },
  { id: 'BEARD', label: 'Beard', emoji: '🪒' },
  { id: 'SPA', label: 'Spa', emoji: '🧖' },
  { id: 'THREADING', label: 'Threading', emoji: '🧵' },
];

export const BOOKING_STATUS_LABELS = {
  PENDING: { label: 'Pending', color: '#F59E0B', bg: '#FFFBEB' },
  CONFIRMED: { label: 'Confirmed', color: '#10B981', bg: '#ECFDF5' },
  COMPLETED: { label: 'Completed', color: '#6B7280', bg: '#F3F4F6' },
  CANCELLED: { label: 'Cancelled', color: '#EF4444', bg: '#FEF2F2' },
  NO_SHOW: { label: 'No Show', color: '#EF4444', bg: '#FEF2F2' },
};

export const PAYMENT_METHODS = [
  { id: 'JAZZCASH', label: 'JazzCash', icon: '📱', color: '#E8194B' },
  { id: 'EASYPAISA', label: 'EasyPaisa', icon: '💚', color: '#007A3D' },
  { id: 'CASH_ON_ARRIVAL', label: 'Cash on Arrival', icon: '💵', color: '#6B7280' },
];
