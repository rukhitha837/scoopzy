import { createContext, useContext, useEffect, useState } from 'react';

const CART_KEY = 'scoopzy_cart';
const CartContext = createContext(null);

const emptyCart = { supplier: null, items: [] };

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || emptyCart;
  } catch {
    return emptyCart;
  }
}

/**
 * Like Zomato, a cart holds items from a single supplier at a time.
 * cart = { supplier: {id, name, deliveryFee, minOrderAmount}, items: [{ id, name, price, category, quantity }] }
 */
export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const add = (supplier, item) => {
    setCart((c) => {
      const base = c.supplier?.id === supplier.id ? c : { ...emptyCart, supplier: pickSupplier(supplier) };
      const existing = base.items.find((i) => i.id === item.id);
      const items = existing
        ? base.items.map((i) => (i.id === item.id ? { ...i, quantity: Math.min(i.quantity + 1, 50) } : i))
        : [...base.items, { id: item.id, name: item.name, price: Number(item.price), category: item.category, imageUrl: item.imageUrl, quantity: 1 }];
      return { ...base, items };
    });
  };

  const decrement = (itemId) => {
    setCart((c) => {
      const items = c.items
        .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0);
      return items.length ? { ...c, items } : emptyCart;
    });
  };

  const clear = () => setCart(emptyCart);

  const quantityOf = (itemId) => cart.items.find((i) => i.id === itemId)?.quantity || 0;
  const count = cart.items.reduce((n, i) => n + i.quantity, 0);
  const itemsTotal = cart.items.reduce((n, i) => n + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, add, decrement, clear, quantityOf, count, itemsTotal }}>
      {children}
    </CartContext.Provider>
  );
}

function pickSupplier(s) {
  return {
    id: s.id,
    name: s.name,
    deliveryFee: Number(s.deliveryFee),
    minOrderAmount: Number(s.minOrderAmount),
  };
}

export const useCart = () => useContext(CartContext);
