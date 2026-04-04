import React, { useEffect, useMemo, useState } from "react";
import styles from "./CartScreen.module.css";

const CART_STORAGE_KEY = "nexagrid:cart:v1";
const CART_EVENT_NAME = "nexagrid:cart:updated";

const seedCart = [
  { id: 1, name: "Product 1", price: 1000, qty: 1 },
  { id: 2, name: "Product 2", price: 2000, qty: 2 },
];

const buildCart = () => {
  if (typeof window === "undefined") {
    return seedCart;
  }

  const raw = window.localStorage.getItem(CART_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      // Fall through and reset malformed cart data.
    }
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(seedCart));
  return seedCart;
};

const persistCart = (nextCart) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(nextCart));
  window.dispatchEvent(new CustomEvent(CART_EVENT_NAME));
};

const CartScreen = () => {
  const [cartItems, setCartItems] = useState(buildCart);

  useEffect(() => {
    const syncCart = () => setCartItems(buildCart());

    const handleStorage = (event) => {
      if (event.key === CART_STORAGE_KEY) {
        syncCart();
      }
    };

    window.addEventListener(CART_EVENT_NAME, syncCart);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(CART_EVENT_NAME, syncCart);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleQtyChange = (id, value) => {
    const qty = Math.max(1, Number(value) || 1);
    const nextCart = cartItems.map((item) =>
      item.id === id ? { ...item, qty } : item,
    );
    setCartItems(nextCart);
    persistCart(nextCart);
  };

  const handleRemove = (id) => {
    const nextCart = cartItems.filter((item) => item.id !== id);
    setCartItems(nextCart);
    persistCart(nextCart);
  };

  const handleClearCart = () => {
    setCartItems([]);
    persistCart([]);
  };

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.qty, 0),
    [cartItems],
  );

  const shipping = cartItems.length > 0 ? 350 : 0;
  const finalTotal = subtotal + shipping;

  return (
    <section className={styles.cartPage}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Cart Management</p>
          <h1 className={styles.pageTitle}>Your Shopping Cart</h1>
          <p className={styles.pageSubtitle}>
            Review quantities, remove items, and proceed to secure checkout.
          </p>
        </div>
      </header>

      {cartItems.length === 0 ? (
        <article className={styles.emptyState}>
          <h2>Your cart is empty</h2>
          <p>Add products from the marketplace to continue.</p>
          <a href="/" className={styles.primaryAction}>
            Browse Products
          </a>
        </article>
      ) : (
        <div className={styles.mainGrid}>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Cart Items</h2>
              <span>{cartItems.length} items</span>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Unit Price</th>
                    <th>Qty</th>
                    <th>Line Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>Rs. {item.price}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(event) => handleQtyChange(item.id, event.target.value)}
                          className={styles.qtyInput}
                        />
                      </td>
                      <td>Rs. {item.price * item.qty}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          className={styles.removeButton}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className={styles.clearButton} onClick={handleClearCart}>
              Clear Cart
            </button>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Order Summary</h2>
            </div>

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <strong>Rs. {subtotal}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <strong>Rs. {shipping}</strong>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <strong>Rs. {finalTotal}</strong>
            </div>

            <a href="/checkout" className={styles.checkoutButton}>
              Proceed To Checkout
            </a>
            <a href="/customer" className={styles.continueLink}>
              Back to Customer Dashboard
            </a>
          </article>
        </div>
      )}
    </section>
  );
};

export default CartScreen;
