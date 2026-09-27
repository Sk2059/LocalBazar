import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";

import {
  AUTH_CHANGE_EVENT,
  isAuthenticated,
} from "../api/auth";
import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../features/buyer/cart/data/api";
import { toCartItem } from "../features/buyer/cart/data/adaptCartItem";
import {
  getProductUnitPrice,
  type Product,
} from "../features/buyer/marketplace/data/products";

export interface CartItem {
  product: Product;
  quantity: number;

  /** Primary key of the cart item on the server (absent for guest carts). */
  itemId?: number;
}

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product, qty?: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQty: (productId: number, qty: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
  loading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextValue | null>(null);

const GUEST_CART_KEY = "koshi_guest_cart";

function loadGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item): item is CartItem =>
          Boolean(item?.product?.id) && item.product.stock > 0,
      )
      .map((item) => ({
        ...item,
        // A persisted guest line can exceed the current stock snapshot, and
        // an over-stock quantity is rejected by the server on login, so keep
        // every line within what can actually be purchased.
        quantity: Math.min(
          Math.max(item.quantity, 1),
          item.product.stock,
        ),
      }));
  } catch {
    return [];
  }
}

function saveGuestCart(items: CartItem[]): void {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {
    /* Storage may be unavailable; the cart just won't persist. */
  }
}

function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (data && typeof data === "object") {
      const detail = (data as { detail?: unknown }).detail;

      if (typeof detail === "string") return detail;

      const firstValue = Object.values(data)[0];

      if (Array.isArray(firstValue) && firstValue[0]) {
        return String(firstValue[0]);
      }

      if (typeof firstValue === "string") return firstValue;
    }

    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lets the async callbacks read the latest items without stale closures.
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Guards against overlapping syncs (e.g. React StrictMode double effects).
  const syncingRef = useRef(false);

  const loadRemoteCart = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const cart = await getCart();

      // `toCartItem` reports 0 for products that went out of stock, so drop
      // those lines instead of offering something that can never be bought.
      setItems(
        cart.items
          .map(toCartItem)
          .filter((item) => item.quantity > 0),
      );
    } catch (requestError) {
      setError(extractErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Uses the server cart when authenticated, otherwise the local guest cart.
   * Items collected while logged out are merged into the server cart on
   * login so nothing is lost.
   */
  const syncCart = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;

    try {
      if (!isAuthenticated()) {
        setItems(loadGuestCart());
        return;
      }

      const guestItems = loadGuestCart();

      if (guestItems.length) {
        try {
          await Promise.all(
            guestItems.map((item) =>
              addCartItem(item.product.id, item.quantity),
            ),
          );

          localStorage.removeItem(GUEST_CART_KEY);
        } catch (mergeError) {
          // The merge is rejected when stock changed while the buyer was
          // logged out. Keep the guest basket in view (and in storage)
          // instead of silently replacing it with the server cart, so the
          // buyer can adjust the quantities and retry.
          setError(extractErrorMessage(mergeError));
          setItems(guestItems);
          return;
        }
      }

      await loadRemoteCart();
    } finally {
      syncingRef.current = false;
    }
  }, [loadRemoteCart]);

  useEffect(() => {
    void syncCart();
  }, [syncCart]);

  useEffect(() => {
    const handler = () => {
      void syncCart();
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handler);
    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, [syncCart]);

  const addToCart = useCallback(async (product: Product, qty = 1) => {
    setError(null);

    // A non-positive quantity would persist as a phantom line that prices
    // at zero, so always add at least one unit.
    const addQuantity = Math.max(1, qty);

    if (!isAuthenticated()) {
      if (product.stock <= 0) {
        setError("This product is currently out of stock.");
        return;
      }

      const existing = itemsRef.current.find(
        (item) => item.product.id === product.id,
      );

      const mergedQuantity = Math.min(
        (existing?.quantity ?? 0) + addQuantity,
        product.stock,
      );

      const next = existing
        ? itemsRef.current.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: mergedQuantity }
              : item,
          )
        : [...itemsRef.current, { product, quantity: mergedQuantity }];

      setItems(next);
      saveGuestCart(next);
      return;
    }

    try {
      const apiItem = await addCartItem(product.id, addQuantity);
      const added = toCartItem(apiItem);

      setItems((prev) => {
        const index = prev.findIndex(
          (item) => item.product.id === added.product.id,
        );

        if (index === -1) return [...prev, added];

        const next = [...prev];
        next[index] = added;
        return next;
      });
    } catch (requestError) {
      setError(extractErrorMessage(requestError));
    }
  }, []);

  const updateQty = useCallback(
    async (productId: number, qty: number) => {
      setError(null);

      const existing = itemsRef.current.find(
        (item) => item.product.id === productId,
      );

      if (!existing) return;

      if (!isAuthenticated()) {
        const next =
          qty <= 0
            ? itemsRef.current.filter((item) => item.product.id !== productId)
            : itemsRef.current.map((item) =>
                item.product.id === productId
                  ? {
                      ...item,
                      quantity: Math.min(
                        Math.max(qty, 1),
                        Math.max(item.product.stock, 1),
                      ),
                    }
                  : item,
              );

        setItems(next);
        saveGuestCart(next);
        return;
      }

      if (existing.itemId === undefined) return;

      try {
        if (qty <= 0) {
          await removeCartItem(existing.itemId);

          setItems((prev) =>
            prev.filter((item) => item.product.id !== productId),
          );
        } else {
          const updated = await updateCartItem(existing.itemId, qty);
          const adapted = toCartItem(updated);

          setItems((prev) =>
            prev.map((item) =>
              item.product.id === productId ? adapted : item,
            ),
          );
        }
      } catch (requestError) {
        setError(extractErrorMessage(requestError));
        await loadRemoteCart();
      }
    },
    [loadRemoteCart],
  );

  const removeFromCart = useCallback(
    async (productId: number) => {
      setError(null);

      const existing = itemsRef.current.find(
        (item) => item.product.id === productId,
      );

      if (!existing) return;

      if (!isAuthenticated()) {
        const next = itemsRef.current.filter(
          (item) => item.product.id !== productId,
        );

        setItems(next);
        saveGuestCart(next);
        return;
      }

      if (existing.itemId === undefined) return;

      try {
        await removeCartItem(existing.itemId);

        setItems((prev) =>
          prev.filter((item) => item.product.id !== productId),
        );
      } catch (requestError) {
        setError(extractErrorMessage(requestError));
        await loadRemoteCart();
      }
    },
    [loadRemoteCart],
  );

  const clearCart = useCallback(async () => {
    setError(null);

    if (!isAuthenticated()) {
      setItems([]);
      saveGuestCart([]);
      return;
    }

    try {
      const current = itemsRef.current;

      await Promise.all(
        current
          .filter((item) => item.itemId !== undefined)
          .map((item) => removeCartItem(item.itemId as number)),
      );

      setItems([]);
    } catch (requestError) {
      setError(extractErrorMessage(requestError));
      await loadRemoteCart();
    }
  }, [loadRemoteCart]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce(
    (sum, item) =>
      sum + getProductUnitPrice(item.product, item.quantity) * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        totalItems,
        subtotal,
        loading,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// The provider and hook intentionally share this module as the cart API.
// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
