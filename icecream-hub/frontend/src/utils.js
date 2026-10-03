export const formatPrice = (n) => `₹${Number(n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export const formatDate = (iso) =>
  new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

const CATEGORY_EMOJI = {
  cone: '🍦', cup: '🍨', tub: '🪣', kulfi: '🍡', sundae: '🍨', gelato: '🍧', stick: '🍭',
};

export const iceCreamEmoji = (category) => CATEGORY_EMOJI[category?.toLowerCase()] || '🍦';

const GRADIENTS = [
  ['#ffd3e0', '#ff8fab'], ['#ffe5b4', '#ffb347'], ['#d4f1f4', '#75e6da'], ['#e0c3fc', '#8ec5fc'],
  ['#fbc2eb', '#a6c1ee'], ['#fdfcfb', '#e2d1c3'], ['#c1f0c1', '#7bd389'], ['#ffecd2', '#fcb69f'],
];

export const supplierGradient = (id) => {
  const [a, b] = GRADIENTS[(id ?? 0) % GRADIENTS.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
};

const SUPPLIER_EMOJI = ['🍦', '🍨', '🍧', '🍡', '🥥', '🍫', '🍓', '🥭'];
export const supplierEmoji = (s) => {
  const tags = (s.tags || []).join(' ').toLowerCase();
  if (tags.includes('kulfi')) return '🍡';
  if (tags.includes('chocolate')) return '🍫';
  if (tags.includes('fruit')) return '🥭';
  if (tags.includes('vegan')) return '🥥';
  if (tags.includes('gelato')) return '🍧';
  if (tags.includes('sundae')) return '🍨';
  return SUPPLIER_EMOJI[(s.id ?? 0) % SUPPLIER_EMOJI.length];
};

export const ORDER_STEPS = ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export const statusLabel = (s) =>
  ({
    PLACED: 'Order placed',
    CONFIRMED: 'Confirmed',
    PREPARING: 'Preparing',
    OUT_FOR_DELIVERY: 'Out for delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  })[s] || s;
