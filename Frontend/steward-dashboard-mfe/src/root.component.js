import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./root.component.module.css";
import {
  fetchStewardProducts,
  updateProductStatus,
} from "./services/bffStewardApi";

const formatMoney = (amount) => `$${Number(amount).toFixed(2)}`;

const formatDate = (dateString) =>
  new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function Root() {
  const [products, setProducts] = useState([]);
  const [decisionNotes, setDecisionNotes] = useState({});
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextProducts = await fetchStewardProducts();
      setProducts(nextProducts);
      setFeedback("");
    } catch (error) {
      setFeedback(error.message || "Unable to load products from BFF.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const pendingProducts = useMemo(
    () =>
      products
        .filter((product) => product.status === "PENDING")
        .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)),
    [products],
  );

  const recentlyReviewed = useMemo(
    () =>
      products
        .filter((product) => product.status !== "PENDING")
        .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
        .slice(0, 6),
    [products],
  );

  const summary = useMemo(() => {
    const lowStock = products.filter((product) => product.stock < 50).length;
    const approved = products.filter((product) => product.status === "APPROVED").length;

    return {
      totalProducts: products.length,
      pending: pendingProducts.length,
      approved,
      lowStock,
    };
  }, [products, pendingProducts.length]);

  const handleNoteChange = (productId, value) => {
    setDecisionNotes((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const applyDecision = async (productId, status) => {
    try {
      setFeedback("");
      await updateProductStatus({ productId, status });
      await loadProducts();
    } catch (error) {
      setFeedback(error.message || "Failed to update product status.");
    }
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

      {isLoading ? <p>Loading product approvals from BFF...</p> : null}
      {feedback ? <p>{feedback}</p> : null}

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
            <span>{pendingProducts.length} open</span>
          </div>

          {pendingProducts.length === 0 ? (
            <p className={styles.emptyState}>No pending supplier requests.</p>
          ) : (
            <div className={styles.requestList}>
              {pendingProducts.map((product) => (
                <div key={product.id} className={styles.requestCard}>
                  <div className={styles.requestHeader}>
                    <h3>{product.name}</h3>
                    <span>{product.id}</span>
                  </div>
                  <p className={styles.requestMeta}>
                    Supplier: {product.supplier} | Requested: {formatDate(product.lastUpdated)}
                  </p>
                  <p className={styles.requestReason}>
                    {product.description || "No supplier note provided."}
                  </p>
                  <div className={styles.changeGrid}>
                    <p>Price: {formatMoney(product.price)}</p>
                    <p>Stock: {product.stock}</p>
                  </div>

                  <label htmlFor={`note-${product.id}`}>Steward Note</label>
                  <textarea
                    id={`note-${product.id}`}
                    rows="2"
                    value={decisionNotes[product.id] || ""}
                    onChange={(event) => handleNoteChange(product.id, event.target.value)}
                    placeholder="Decision note"
                  />

                  <div className={styles.actionRow}>
                    <button
                      type="button"
                      className={styles.approveButton}
                      onClick={() => applyDecision(product.id, "APPROVED")}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className={styles.rejectButton}
                      onClick={() => applyDecision(product.id, "REJECTED")}
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
            <span>Live from BFF</span>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Supplier</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
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
                    <td>
                      <span className={styles[String(product.status || "pending").toLowerCase()]}>
                        {String(product.status || "PENDING").toLowerCase()}
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
                <th>Product</th>
                <th>Decision</th>
                <th>Supplier</th>
                <th>Steward Note</th>
                <th>Reviewed At</th>
              </tr>
            </thead>
            <tbody>
              {recentlyReviewed.length === 0 ? (
                <tr>
                  <td colSpan="5">No reviewed requests yet.</td>
                </tr>
              ) : (
                recentlyReviewed.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>
                      <span className={styles[String(product.status).toLowerCase()]}>
                        {String(product.status).toLowerCase()}
                      </span>
                    </td>
                    <td>{product.supplier}</td>
                    <td>{decisionNotes[product.id] || "Reviewed"}</td>
                    <td>{formatDate(product.lastUpdated)}</td>
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
