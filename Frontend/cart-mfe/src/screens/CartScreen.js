import React, { useEffect, useMemo, useState } from "react";
import styles from "./CartScreen.module.css";
import {
  clearCart,
  checkoutCart,
  fetchCart,
  resolveCurrentCartId,
  removeCartItem,
  updateCartItem,
} from "../services/bffCartApi";

const toUiItems = (cart) => {
  const items = cart?.items || cart?.cartItems || [];

  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => ({
    id: item.id || item.itemId || item.productId,
    name: item.productName || item.name || "Product",
    price: Number(item.price || item.unitPrice || 0),
    qty: Math.max(1, Number(item.quantity || item.qty || 1)),
  }));
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount) || 0);

const CartScreen = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loadError, setLoadError] = useState("");

  const refreshCart = async () => {
    const cartId = await resolveCurrentCartId();

    if (!cartId) {
      setCartItems([]);
      setLoadError("Please log in to view your cart.");
      return;
    }

    setLoadError("");
    const bffCart = await fetchCart(cartId);
    setCartItems(toUiItems(bffCart));
  };

  useEffect(() => {
    let mounted = true;

    const syncFromBff = async () => {
      try {
        setIsSyncing(true);
        await refreshCart();
      } catch (error) {
        if (mounted) {
          setLoadError(error.message || "Failed to sync cart from BFF.");
        }
      } finally {
        if (mounted) {
          setIsSyncing(false);
        }
      }
    };

    syncFromBff();

    const handleCartUpdated = () => {
      syncFromBff();
    };

    window.addEventListener("nexagrid:cart-updated", handleCartUpdated);

    return () => {
      mounted = false;
      window.removeEventListener("nexagrid:cart-updated", handleCartUpdated);
    };
  }, []);

  const handleQtyChange = async (id, value) => {
    const qty = Math.max(1, Number(value) || 1);

    try {
      await updateCartItem({
        cartId: await resolveCurrentCartId(),
        itemId: id,
        quantity: qty,
      });
      await refreshCart();
    } catch (error) {
      setLoadError(error.message || "Failed to update cart item.");
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeCartItem({
        cartId: await resolveCurrentCartId(),
        itemId: id,
      });
      await refreshCart();
    } catch (error) {
      setLoadError(error.message || "Failed to remove cart item.");
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart(await resolveCurrentCartId());
      await refreshCart();
    } catch (error) {
      setLoadError(error.message || "Failed to clear cart.");
    }
  };

  const handleCheckout = async () => {
    try {
      const cartId = await resolveCurrentCartId();
      await checkoutCart(cartId);
      await refreshCart();
      window.dispatchEvent(new Event("nexagrid:cart-updated"));
      setLoadError("");
    } catch (error) {
      setLoadError(error.message || "Failed to complete checkout.");
    }
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

      {isSyncing ? <p>Syncing cart with BFF...</p> : null}
      {loadError ? <p>{loadError}</p> : null}

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
                      <td>{formatCurrency(item.price)}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(event) =>
                            handleQtyChange(item.id, event.target.value)
                          }
                          className={styles.qtyInput}
                        />
                      </td>
                      <td>{formatCurrency(item.price * item.qty)}</td>
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
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClearCart}
            >
              Clear Cart
            </button>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Order Summary</h2>
            </div>

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <strong>{formatCurrency(shipping)}</strong>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <strong>{formatCurrency(finalTotal)}</strong>
            </div>

            <button
              type="button"
              className={styles.checkoutButton}
              onClick={handleCheckout}
            >
              Proceed To Checkout
            </button>
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
