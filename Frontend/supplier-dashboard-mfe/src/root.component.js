import { useEffect, useMemo, useState } from "react";
import styles from "./root.component.module.css";

const STORAGE_KEY = "nexagrid:supply-ops:v1";
const EVENT_NAME = "nexagrid:supply-ops:updated";

const seedData = {
  products: [
    {
      id: "PRD-1001",
      name: "Premium Ceylon Tea",
      category: "Beverages",
      price: 18.5,
      stock: 210,
      supplier: "Lanka Fresh Exports",
      lastUpdated: "2026-04-01T08:00:00.000Z",
    },
    {
      id: "PRD-1002",
      name: "Organic Coconut Oil",
      category: "Groceries",
      price: 24.0,
      stock: 84,
      supplier: "Lanka Fresh Exports",
      lastUpdated: "2026-04-02T09:15:00.000Z",
    },
    {
      id: "PRD-1003",
      name: "Spice Combo Pack",
      category: "Groceries",
      price: 32.75,
      stock: 42,
      supplier: "Lanka Fresh Exports",
      lastUpdated: "2026-04-02T12:30:00.000Z",
    },
  ],
  requests: [],
};

const buildStore = () => {
  if (typeof window === "undefined") {
    return seedData;
  }

  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      if (parsed?.products && parsed?.requests) {
        return parsed;
      }
    } catch (error) {
      // Fall through to reset malformed storage.
    }
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
  return seedData;
};

const persistStore = (nextStore) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
};

const formatMoney = (amount) => `$${Number(amount).toFixed(2)}`;

const formatDate = (dateString) =>
  new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const initialFormState = {
  productId: "",
  proposedPrice: "",
  proposedStock: "",
  reason: "",
};

export default function Root() {
  const [store, setStore] = useState(buildStore);
  const [formData, setFormData] = useState(initialFormState);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const syncStore = () => setStore(buildStore());

    window.addEventListener(EVENT_NAME, syncStore);
    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_KEY) {
        syncStore();
      }
    });

    return () => {
      window.removeEventListener(EVENT_NAME, syncStore);
      window.removeEventListener("storage", syncStore);
    };
  }, []);

  const sortedProducts = useMemo(
    () => [...store.products].sort((a, b) => a.name.localeCompare(b.name)),
    [store.products],
  );

  const requestsByLatest = useMemo(
    () =>
      [...store.requests].sort(
        (a, b) => new Date(b.requestedAt) - new Date(a.requestedAt),
      ),
    [store.requests],
  );

  const summary = useMemo(() => {
    const pending = store.requests.filter((request) => request.status === "Pending").length;
    const lowStock = store.products.filter((product) => product.stock < 50).length;
    const totalStock = store.products.reduce((sum, product) => sum + product.stock, 0);

    return {
      pending,
      lowStock,
      totalStock,
    };
  }, [store.products, store.requests]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFeedback("");

    const { productId, proposedPrice, proposedStock, reason } = formData;
    if (!productId || !proposedPrice || !proposedStock || !reason.trim()) {
      setFeedback("Fill in all fields before submitting the update request.");
      return;
    }

    const matchedProduct = store.products.find((product) => product.id === productId);
    if (!matchedProduct) {
      setFeedback("Selected product was not found.");
      return;
    }

    const nextRequest = {
      id: `REQ-${Date.now()}`,
      productId,
      productName: matchedProduct.name,
      supplier: matchedProduct.supplier,
      currentPrice: matchedProduct.price,
      proposedPrice: Number(proposedPrice),
      currentStock: matchedProduct.stock,
      proposedStock: Number(proposedStock),
      reason: reason.trim(),
      status: "Pending",
      requestedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      stewardNote: "",
    };

    const nextStore = {
      ...store,
      requests: [nextRequest, ...store.requests],
    };

    persistStore(nextStore);
    setStore(nextStore);
    setFormData(initialFormState);
    setFeedback("Update request sent to steward for approval.");
  };

  return (
    <section className={styles.dashboardPage}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Supplier Operations</p>
          <h1 className={styles.pageTitle}>Supplier Control Center</h1>
          <p className={styles.pageSubtitle}>
            Manage product inventory and submit updates for steward approval.
          </p>
        </div>
      </header>

      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <p>Products Listed</p>
          <strong>{store.products.length}</strong>
        </article>
        <article className={styles.statCard}>
          <p>Total Stock Units</p>
          <strong>{summary.totalStock}</strong>
        </article>
        <article className={styles.statCard}>
          <p>Low Stock Alerts</p>
          <strong>{summary.lowStock}</strong>
        </article>
        <article className={styles.statCard}>
          <p>Pending Approvals</p>
          <strong>{summary.pending}</strong>
        </article>
      </section>

      <section className={styles.mainGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Current Stock</h2>
            <span>Live from shared supply data</span>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{formatMoney(product.price)}</td>
                    <td>
                      <span
                        className={
                          product.stock < 50 ? styles.lowStockPill : styles.stockPill
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td>{formatDate(product.lastUpdated)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Submit Product Update</h2>
            <span>Requires steward approval</span>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label htmlFor="productId">Product</label>
            <select
              id="productId"
              name="productId"
              value={formData.productId}
              onChange={handleFieldChange}
            >
              <option value="">Select a product</option>
              {sortedProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>

            <label htmlFor="proposedPrice">Proposed Price (USD)</label>
            <input
              id="proposedPrice"
              name="proposedPrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.proposedPrice}
              onChange={handleFieldChange}
              placeholder="18.50"
            />

            <label htmlFor="proposedStock">Proposed Stock</label>
            <input
              id="proposedStock"
              name="proposedStock"
              type="number"
              min="0"
              step="1"
              value={formData.proposedStock}
              onChange={handleFieldChange}
              placeholder="150"
            />

            <label htmlFor="reason">Reason for Update</label>
            <textarea
              id="reason"
              name="reason"
              rows="4"
              value={formData.reason}
              onChange={handleFieldChange}
              placeholder="Explain why this update is needed"
            />

            <button type="submit">Send For Approval</button>
            {feedback && <p className={styles.feedback}>{feedback}</p>}
          </form>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Request History</h2>
          <span>Newest first</span>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Request</th>
                <th>Product</th>
                <th>Price Change</th>
                <th>Stock Change</th>
                <th>Status</th>
                <th>Requested At</th>
              </tr>
            </thead>
            <tbody>
              {requestsByLatest.length === 0 ? (
                <tr>
                  <td colSpan="6">No update requests yet.</td>
                </tr>
              ) : (
                requestsByLatest.map((request) => (
                  <tr key={request.id}>
                    <td>{request.id}</td>
                    <td>{request.productName}</td>
                    <td>
                      {formatMoney(request.currentPrice)} to {formatMoney(request.proposedPrice)}
                    </td>
                    <td>
                      {request.currentStock} to {request.proposedStock}
                    </td>
                    <td>
                      <span className={styles[request.status.toLowerCase()]}>{request.status}</span>
                    </td>
                    <td>{formatDate(request.requestedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
