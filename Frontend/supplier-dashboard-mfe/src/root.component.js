import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./root.component.module.css";
import {
  fetchProductCategories,
  fetchSupplierProducts,
  getProductImageUploadUrl,
  submitNewProduct,
  submitProductUpdate,
  uploadImageToS3,
} from "./services/bffSupplierApi";

const formatMoney = (amount) => `$${Number(amount).toFixed(2)}`;

const formatDate = (dateString) =>
  new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const initialCreateFormState = {
  productName: "",
  categoryId: "",
  proposedPrice: "",
  proposedStock: "",
  description: "",
  productImageFile: null,
};

export default function Root() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [createFormData, setCreateFormData] = useState(initialCreateFormState);
  const [rowStockInputs, setRowStockInputs] = useState({});
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [activeStockUpdateId, setActiveStockUpdateId] = useState("");

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextProducts = await fetchSupplierProducts();
      setProducts(nextProducts);
      setFeedback("");
    } catch (error) {
      setFeedback(
        error.message || "Unable to load supplier products from BFF.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const nextCategories = await fetchProductCategories();
        setCategories(nextCategories);
      } catch (error) {
        setFeedback(error.message || "Unable to load categories from BFF.");
      }
    };

    loadCategories();
  }, []);

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products],
  );

  const statusHistory = useMemo(
    () =>
      [...products]
        .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
        .slice(0, 20),
    [products],
  );

  const summary = useMemo(() => {
    const pending = products.filter(
      (product) => product.status === "PENDING",
    ).length;
    const lowStock = products.filter((product) => product.stock < 50).length;
    const totalStock = products.reduce(
      (sum, product) => sum + product.stock,
      0,
    );

    return {
      pending,
      lowStock,
      totalStock,
    };
  }, [products]);

  const handleCreateFieldChange = (event) => {
    const { name, value } = event.target;
    setCreateFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInlineStockInputChange = (productId, value) => {
    setRowStockInputs((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const handleImageChange = (event) => {
    const [file] = event.target.files || [];

    if (!file) {
      setCreateFormData((prev) => ({
        ...prev,
        productImageFile: null,
      }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFeedback("Please upload a valid image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFeedback("Image size must be 2MB or less.");
      return;
    }

    setFeedback("");
    setCreateFormData((prev) => ({
      ...prev,
      productImageFile: file,
    }));
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    setFeedback("");

    const {
      productName,
      categoryId,
      proposedPrice,
      proposedStock,
      description,
      productImageFile,
    } = createFormData;

    if (
      !productName.trim() ||
      !categoryId ||
      !proposedPrice ||
      !proposedStock ||
      !description.trim()
    ) {
      setFeedback("Fill in all fields before submitting.");
      return;
    }

    const existingProduct = products.find(
      (product) =>
        String(product.name || "")
          .trim()
          .toLowerCase() === productName.trim().toLowerCase(),
    );

    if (existingProduct) {
      setFeedback(
        "Product already exists. Use the row stock update action in Current Stock.",
      );
      return;
    }

    try {
      setIsCreating(true);
      let uploadedImageUrl = "";

      if (productImageFile) {
        const uploadData = await getProductImageUploadUrl(productImageFile);
        await uploadImageToS3({
          uploadUrl: uploadData.uploadUrl,
          file: productImageFile,
        });
        uploadedImageUrl = uploadData.fileUrl;
      }

      await submitNewProduct({
        createPayload: {
          name: productName.trim(),
          categoryId: Number(categoryId),
          price: Number(proposedPrice),
          quantity: Number(proposedStock),
          description: description.trim(),
          imageurl: uploadedImageUrl,
          imageUrl: uploadedImageUrl,
        },
      });

      setCreateFormData(initialCreateFormState);
      setFeedback("New product added successfully through BFF.");
      await loadProducts();
    } catch (error) {
      setFeedback(error.message || "Failed to add new product.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleInlineStockUpdate = async (product) => {
    setFeedback("");

    if (product.status !== "APPROVED") {
      setFeedback("Only approved products can have stock updates.");
      return;
    }

    const inputValue = rowStockInputs[product.id];
    const proposedStock = inputValue ?? String(product.stock);

    if (proposedStock === "") {
      setFeedback("Enter stock quantity before updating.");
      return;
    }

    try {
      setActiveStockUpdateId(String(product.id));
      await submitProductUpdate({
        productId: product.id,
        updatePayload: {
          quantity: Number(proposedStock),
        },
      });

      setRowStockInputs((prev) => ({
        ...prev,
        [product.id]: "",
      }));
      setFeedback("Approved product stock updated successfully through BFF.");
      await loadProducts();
    } catch (error) {
      setFeedback(error.message || "Failed to update approved product stock.");
    } finally {
      setActiveStockUpdateId("");
    }
  };

  const getRowStockInputValue = (product) => {
    const inputValue = rowStockInputs[product.id];
    return inputValue !== undefined ? inputValue : String(product.stock);
  };

  return (
    <section className={styles.dashboardPage}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Supplier Operations</p>
          <h1 className={styles.pageTitle}>Supplier Control Center</h1>
          <p className={styles.pageSubtitle}>
            Manage product inventory through the BFF orchestration layer.
          </p>
        </div>
      </header>

      <section className={styles.statsGrid}>
        <article className={styles.statCard}>
          <p>Products Listed</p>
          <strong>{products.length}</strong>
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
            <span>{isLoading ? "Syncing from BFF..." : "Live from BFF"}</span>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Update Stock</th>
                </tr>
              </thead>
              <tbody>
                {sortedProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7">No products available.</td>
                  </tr>
                ) : (
                  sortedProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{formatMoney(product.price)}</td>
                      <td>
                        <span
                          className={
                            product.stock < 50
                              ? styles.lowStockPill
                              : styles.stockPill
                          }
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            styles[
                              String(product.status || "pending").toLowerCase()
                            ]
                          }
                        >
                          {String(product.status || "PENDING").toLowerCase()}
                        </span>
                      </td>
                      <td>{formatDate(product.lastUpdated)}</td>
                      <td>
                        <div className={styles.inlineStockAction}>
                          <input
                            className={styles.inlineStockInput}
                            type="number"
                            min="0"
                            step="1"
                            value={getRowStockInputValue(product)}
                            onChange={(event) =>
                              handleInlineStockInputChange(
                                product.id,
                                event.target.value,
                              )
                            }
                          />
                          <button
                            type="button"
                            className={styles.inlineStockButton}
                            disabled={
                              product.status !== "APPROVED" ||
                              activeStockUpdateId === String(product.id)
                            }
                            onClick={() => handleInlineStockUpdate(product)}
                          >
                            {activeStockUpdateId === String(product.id)
                              ? "Updating..."
                              : "Update"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Add New Product</h2>
          </div>

          <div className={styles.formSection}>
            <form className={styles.form} onSubmit={handleCreateSubmit}>
              <label htmlFor="productName">Product Name</label>
              <input
                id="productName"
                name="productName"
                type="text"
                value={createFormData.productName}
                onChange={handleCreateFieldChange}
                placeholder="Type product name"
              />

              <label htmlFor="categoryId">Category</label>
              <select
                id="categoryId"
                name="categoryId"
                value={createFormData.categoryId}
                onChange={handleCreateFieldChange}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <label htmlFor="proposedPrice">Price (USD)</label>
              <input
                id="proposedPrice"
                name="proposedPrice"
                type="number"
                min="0"
                step="0.01"
                value={createFormData.proposedPrice}
                onChange={handleCreateFieldChange}
                placeholder="18.50"
              />

              <label htmlFor="proposedStock">Initial Stock</label>
              <input
                id="proposedStock"
                name="proposedStock"
                type="number"
                min="0"
                step="1"
                value={createFormData.proposedStock}
                onChange={handleCreateFieldChange}
                placeholder="150"
              />

              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={createFormData.description}
                onChange={handleCreateFieldChange}
                placeholder="Describe this product for review and catalog visibility"
              />

              <label htmlFor="productImage">Product Image</label>
              <input
                id="productImage"
                name="productImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />

              <button type="submit" disabled={isCreating}>
                {isCreating ? "Submitting..." : "Send New Product For Approval"}
              </button>
            </form>
          </div>

          {feedback && <p className={styles.feedback}>{feedback}</p>}
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Latest Product Update Status</h2>
          <span>Newest first</span>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Price</th>
                <th>Current Stock</th>
                <th>Status</th>
                <th>Updated At</th>
              </tr>
            </thead>
            <tbody>
              {statusHistory.length === 0 ? (
                <tr>
                  <td colSpan="5">No product updates found.</td>
                </tr>
              ) : (
                statusHistory.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{formatMoney(product.price)}</td>
                    <td>{product.stock}</td>
                    <td>
                      <span
                        className={
                          styles[
                            String(product.status || "pending").toLowerCase()
                          ]
                        }
                      >
                        {String(product.status || "PENDING").toLowerCase()}
                      </span>
                    </td>
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
