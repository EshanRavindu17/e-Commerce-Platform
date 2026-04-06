const BFF_BASE_URL =
  (typeof window !== "undefined" && window.__NEXAGRID_BFF_URL__) ||
  (typeof process !== "undefined" && process.env && process.env.BFF_BASE_URL) ||
  "http://localhost:3000";

const readAccessToken = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    window.localStorage.getItem("nexagrid:auth:accessToken") ||
    window.localStorage.getItem("accessToken") ||
    ""
  );
};

const authHeaders = () => {
  const token = readAccessToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

const normalizeProduct = (product = {}, index = 0) => ({
  id: String(product.id || `prd-${index}`),
  name: product.name || "Unnamed Product",
  category: product.category || "General",
  categoryId: String(product.categoryId || ""),
  price: Number(product.price || 0),
  stock: Number(product.quantity || product.stock || 0),
  supplier: product.supplierName || "Current Supplier",
  imageUrl: product.imageUrl || product.imageurl || "",
  status: String(product.status || "PENDING").toUpperCase(),
  description: product.description || "",
  lastUpdated:
    product.updatedAt || product.lastUpdated || new Date().toISOString(),
});

export const fetchSupplierProducts = async () => {
  const response = await fetch(`${BFF_BASE_URL}/products/suppliers/me`, {
    headers: {
      ...authHeaders(),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Failed to load products");
  }

  const products = payload?.data || [];
  if (!Array.isArray(products)) {
    return [];
  }

  return products.map(normalizeProduct);
};

const normalizeCategory = (category = {}, index = 0) => ({
  id: String(category.id || category.categoryId || `cat-${index}`),
  name: String(category.name || category.categoryName || "Unnamed Category"),
});

export const fetchProductCategories = async () => {
  const response = await fetch(`${BFF_BASE_URL}/products/categories`, {
    headers: {
      ...authHeaders(),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Failed to load categories");
  }

  const categories = payload?.data?.data || payload?.data || [];
  if (!Array.isArray(categories)) {
    return [];
  }

  return categories.map(normalizeCategory);
};

export const getProductImageUploadUrl = async (file) => {
  const response = await fetch(`${BFF_BASE_URL}/products/images/presign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Failed to create upload URL");
  }

  return payload?.data;
};

export const uploadImageToS3 = async ({ uploadUrl, file }) => {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }
};

export const submitProductUpdate = async ({ productId, updatePayload }) => {
  const response = await fetch(`${BFF_BASE_URL}/products/${productId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(updatePayload),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Failed to update product");
  }

  return payload;
};

export const submitNewProduct = async ({ createPayload }) => {
  const response = await fetch(`${BFF_BASE_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(createPayload),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Failed to create product");
  }

  return payload;
};
