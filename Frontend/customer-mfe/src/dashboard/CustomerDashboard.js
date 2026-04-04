import React, { useEffect, useMemo, useState } from "react";
import styles from "./CustomerDashboard.module.css";

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
      // Fall through and reset malformed cart state.
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

const user = {
  name: "Eshan",
  tier: "Gold Member",
  points: 2380,
  savedAddress: "Colombo 05, Sri Lanka",
};

const quickStats = [
  { label: "Orders This Month", value: "12" },
  { label: "Wishlist Items", value: "27" },
  { label: "Reward Points", value: user.points.toLocaleString() },
  { label: "Open Support Tickets", value: "1" },
];

const orders = [
  {
    id: "ORD-2095",
    total: "$184.00",
    status: "Shipped",
    eta: "Arrives Apr 05",
  },
  {
    id: "ORD-2088",
    total: "$76.50",
    status: "Processing",
    eta: "Preparing package",
  },
  {
    id: "ORD-2081",
    total: "$52.99",
    status: "Delivered",
    eta: "Delivered Apr 01",
  },
];

const recommended = [
  { name: "Cold Brew Coffee Kit", price: "$24.90", tag: "Trending" },
  { name: "Organic Honey Set", price: "$19.40", tag: "Top Rated" },
  { name: "Premium Travel Mug", price: "$29.10", tag: "New" },
];

const CustomerDashboard = () => {
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

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0),
    [cartItems],
  );

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

  return (
    <section className={styles.dashboardPage}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Customer Portal</p>
          <h1 className={styles.pageTitle}>Welcome back, {user.name}</h1>
          <p className={styles.pageSubtitle}>
            {user.tier} | Default delivery: {user.savedAddress}
          </p>
        </div>
        <button type="button" className={styles.primaryAction}>
          Continue Shopping
        </button>
      </header>

      <section className={styles.statsGrid}>
        {quickStats.map((stat) => (
          <article key={stat.label} className={styles.statCard}>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className={styles.mainGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Recent Orders</h2>
            <a href="/orders" className={styles.linkAction}>
              View All
            </a>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Tracking</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.total}</td>
                    <td>
                      <span className={styles[order.status.toLowerCase()]}>{order.status}</span>
                    </td>
                    <td>{order.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Quick Actions</h2>
          </div>
          <div className={styles.actionList}>
            <a href="/products" className={styles.actionButton}>
              Browse Products
            </a>
            <a href="/cart" className={styles.actionButton}>
              View Cart
            </a>
            <a href="/customer/profile" className={styles.actionButton}>
              Manage Profile
            </a>
            <a href="/customer/support" className={styles.actionButton}>
              Contact Support
            </a>
          </div>

          <div className={styles.rewardsBox}>
            <h3>Loyalty Rewards</h3>
            <p>You are 620 points away from Platinum perks.</p>
            <button type="button" className={styles.secondaryAction}>
              Redeem Points
            </button>
          </div>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Current Cart</h2>
          <span>{cartItems.length} items</span>
        </div>

        {cartItems.length === 0 ? (
          <p className={styles.emptyCart}>Your cart is currently empty.</p>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Item</th>
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
                          className={styles.qtyInput}
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(event) => handleQtyChange(item.id, event.target.value)}
                        />
                      </td>
                      <td>Rs. {item.price * item.qty}</td>
                      <td>
                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={() => handleRemove(item.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.cartFooter}>
              <p>
                Cart Total: <strong>Rs. {cartTotal}</strong>
              </p>
              <div className={styles.cartActions}>
                <button type="button" className={styles.clearButton} onClick={handleClearCart}>
                  Clear Cart
                </button>
                <a href="/cart" className={styles.checkoutButton}>
                  Go To Checkout
                </a>
              </div>
            </div>
          </>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Recommended For You</h2>
          <a href="/products" className={styles.linkAction}>
            Discover More
          </a>
        </div>
        <div className={styles.recommendGrid}>
          {recommended.map((item) => (
            <article key={item.name} className={styles.recommendCard}>
              <span className={styles.tag}>{item.tag}</span>
              <h3>{item.name}</h3>
              <p>{item.price}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
};

export default CustomerDashboard;