import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./CustomerDashboard.module.css";
import {
  clearCustomerCart,
  fetchCustomerCart,
  fetchCustomerProfile,
  fetchRecommendedProducts,
  removeCustomerCartItem,
  updateCustomerCartItem,
} from "../services/bffCustomerApi";

const defaultProfile = {
  firstName: "Customer",
  userType: "Customer",
  address: "No address available",
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount) || 0);

const CustomerDashboard = () => {
  const [profile, setProfile] = useState(defaultProfile);
  const [cartItems, setCartItems] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setFeedback("");

    try {
      const [nextProfile, nextCartItems, nextRecommended] = await Promise.all([
        fetchCustomerProfile(),
        fetchCustomerCart(),
        fetchRecommendedProducts(),
      ]);

      setProfile({
        ...defaultProfile,
        ...nextProfile,
      });
      setCartItems(nextCartItems);
      setRecommended(nextRecommended);
    } catch (error) {
      setFeedback(
        error.message || "Unable to load customer dashboard from BFF.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const cartTotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.qty),
        0,
      ),
    [cartItems],
  );

  const quickStats = useMemo(
    () => [
      { label: "Products In Cart", value: String(cartItems.length) },
      {
        label: "Cart Subtotal",
        value: formatCurrency(cartTotal),
      },
      { label: "Recommended Items", value: String(recommended.length) },
      {
        label: "Account Type",
        value: String(profile.userType || "Customer"),
      },
    ],
    [cartItems.length, cartTotal, profile.userType, recommended.length],
  );

  const handleQtyChange = async (id, value) => {
    const qty = Math.max(1, Number(value) || 1);
    try {
      await updateCustomerCartItem({ itemId: id, quantity: qty });
      await loadDashboardData();
    } catch (error) {
      setFeedback(error.message || "Failed to update cart item.");
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeCustomerCartItem({ itemId: id });
      await loadDashboardData();
    } catch (error) {
      setFeedback(error.message || "Failed to remove cart item.");
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCustomerCart();
      await loadDashboardData();
    } catch (error) {
      setFeedback(error.message || "Failed to clear cart.");
    }
  };

  return (
    <section className={styles.dashboardPage}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Customer Portal</p>
          <h1 className={styles.pageTitle}>
            Welcome back, {profile.firstName || "Customer"}
          </h1>
          <p className={styles.pageSubtitle}>
            {profile.userType || "Customer"} | Default delivery:{" "}
            {profile.address || "N/A"}
          </p>
        </div>
        <button type="button" className={styles.primaryAction}>
          Continue Shopping
        </button>
      </header>

      {isLoading ? <p>Loading customer data from BFF...</p> : null}
      {feedback ? <p>{feedback}</p> : null}

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
          {/* 
          <div className={styles.rewardsBox}>
            <h3>Account Snapshot</h3>
            <p>Profile and cart data are now loaded directly from live BFF endpoints.</p>
          </div> */}
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
                      <td>{formatCurrency(item.price)}</td>
                      <td>
                        <input
                          className={styles.qtyInput}
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(event) =>
                            handleQtyChange(item.id, event.target.value)
                          }
                        />
                      </td>
                      <td>{formatCurrency(item.price * item.qty)}</td>
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
                Cart Total: <strong>{formatCurrency(cartTotal)}</strong>
              </p>
              <div className={styles.cartActions}>
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={handleClearCart}
                >
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
          {recommended.length === 0 ? (
            <p className={styles.emptyCart}>No recommendations available.</p>
          ) : (
            recommended.map((item) => (
              <article key={item.id} className={styles.recommendCard}>
                <span className={styles.tag}>{item.tag}</span>
                <h3>{item.name}</h3>
                <p>{item.price}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </section>
  );
};

export default CustomerDashboard;
