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

export default function Root() {
  const [store, setStore] = useState(buildStore);
  const [decisionNotes, setDecisionNotes] = useState({});

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

  const pendingRequests = useMemo(
    () =>
      store.requests
        .filter((request) => request.status === "Pending")
        .sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)),
    [store.requests],
  );

  const recentlyReviewed = useMemo(
    () =>
      store.requests
        .filter((request) => request.status !== "Pending")
        .sort((a, b) => new Date(b.reviewedAt || 0) - new Date(a.reviewedAt || 0))
        .slice(0, 6),
    [store.requests],
  );

  const summary = useMemo(() => {
    const lowStock = store.products.filter((product) => product.stock < 50).length;
    const approved = store.requests.filter((request) => request.status === "Approved").length;

    return {
      totalProducts: store.products.length,
      pending: pendingRequests.length,
      approved,
      lowStock,
    };
  }, [store.products, store.requests, pendingRequests.length]);

  const handleNoteChange = (requestId, value) => {
    setDecisionNotes((prev) => ({
      ...prev,
      [requestId]: value,
    }));
  };

  const applyDecision = (requestId, status) => {
    const nextRequests = store.requests.map((request) => {
      if (request.id !== requestId) {
        return request;
      }

      return {
        ...request,
        status,
        reviewedAt: new Date().toISOString(),
        reviewedBy: "Steward Team",
        stewardNote: decisionNotes[requestId]?.trim() || "Reviewed",
      };
    });

    const approvedRequest = nextRequests.find((request) => request.id === requestId);

    const nextProducts =
      status === "Approved"
        ? store.products.map((product) => {
            if (product.id !== approvedRequest.productId) {
              return product;
            }

            return {
              ...product,
              price: approvedRequest.proposedPrice,
              stock: approvedRequest.proposedStock,
              lastUpdated: new Date().toISOString(),
            };
          })
        : store.products;

    const nextStore = {
      products: nextProducts,
      requests: nextRequests,
    };

    persistStore(nextStore);
    setStore(nextStore);
  };

  return (
    <section className={styles.dashboardPage}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>NexaGrid Operations</p>
          <h1 className={styles.pageTitle}>Steward Command Center</h1>
          <p className={styles.pageSubtitle}>
            Approve supplier product updates and keep inventory healthy.
          </p>
        </div>
      </header>

      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <p>Products Tracked</p>
          <strong>{summary.totalProducts}</strong>
        </article>
        <article className={styles.statCard}>
          <p>Pending Requests</p>
          <strong>{summary.pending}</strong>
        </article>
        <article className={styles.statCard}>
          <p>Approved Updates</p>
          <strong>{summary.approved}</strong>
        </article>
        <article className={styles.statCard}>
          <p>Low Stock Alerts</p>
          <strong>{summary.lowStock}</strong>
        </article>
      </section>

      <section className={styles.mainGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Pending Supplier Requests</h2>
            <span>{pendingRequests.length} open</span>
          </div>

          {pendingRequests.length === 0 ? (
            <p className={styles.emptyState}>No pending supplier requests.</p>
          ) : (
            <div className={styles.requestList}>
              {pendingRequests.map((request) => (
                <div key={request.id} className={styles.requestCard}>
                  <div className={styles.requestHeader}>
                    <h3>{request.productName}</h3>
                    <span>{request.id}</span>
                  </div>
                  <p className={styles.requestMeta}>
                    Supplier: {request.supplier} | Requested: {formatDate(request.requestedAt)}
                  </p>
                  <p className={styles.requestReason}>{request.reason}</p>
                  <div className={styles.changeGrid}>
                    <p>
                      Price: {formatMoney(request.currentPrice)} to {formatMoney(request.proposedPrice)}
                    </p>
                    <p>
                      Stock: {request.currentStock} to {request.proposedStock}
                    </p>
                  </div>

                  <label htmlFor={`note-${request.id}`}>Steward Note</label>
                  <textarea
                    id={`note-${request.id}`}
                    rows="2"
                    value={decisionNotes[request.id] || ""}
                    onChange={(event) => handleNoteChange(request.id, event.target.value)}
                    placeholder="Decision note"
                  />

                  <div className={styles.actionRow}>
                    <button
                      type="button"
                      className={styles.approveButton}
                      onClick={() => applyDecision(request.id, "Approved")}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className={styles.rejectButton}
                      onClick={() => applyDecision(request.id, "Rejected")}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Current Product Stock</h2>
            <span>Auto-updated on approval</span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Supplier</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {store.products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.supplier}</td>
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
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Recently Reviewed Requests</h2>
          <span>Most recent 6</span>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Request</th>
                <th>Product</th>
                <th>Decision</th>
                <th>Steward</th>
                <th>Note</th>
                <th>Reviewed At</th>
              </tr>
            </thead>
            <tbody>
              {recentlyReviewed.length === 0 ? (
                <tr>
                  <td colSpan="6">No reviewed requests yet.</td>
                </tr>
              ) : (
                recentlyReviewed.map((request) => (
                  <tr key={request.id}>
                    <td>{request.id}</td>
                    <td>{request.productName}</td>
                    <td>
                      <span className={styles[request.status.toLowerCase()]}>{request.status}</span>
                    </td>
                    <td>{request.reviewedBy}</td>
                    <td>{request.stewardNote}</td>
                    <td>{formatDate(request.reviewedAt)}</td>
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
