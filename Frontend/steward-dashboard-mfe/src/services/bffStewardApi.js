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
  price: Number(product.price || 0),
  stock: Number(product.quantity || product.stock || 0),
  supplier: product.supplierName || "Supplier",
  status: String(product.status || "PENDING").toUpperCase(),
  description: product.description || "",
  lastUpdated:
    product.updatedAt || product.lastUpdated || new Date().toISOString(),
});

export const fetchStewardProducts = async () => {
  const response = await fetch(
    `${BFF_BASE_URL}/products/review?page=1&limit=200`,
    {
      headers: {
        ...authHeaders(),
      },
    },
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Failed to load products");
  }

  const products =
    payload?.data?.data?.content ||
    payload?.data?.content ||
    payload?.data?.data ||
    payload?.data ||
    [];
  if (!Array.isArray(products)) {
    return [];
  }

  return products.map(normalizeProduct);
};

export const updateProductStatus = async ({ productId, status }) => {
  const response = await fetch(`${BFF_BASE_URL}/products/${productId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ status }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Failed to update product status");
  }

  return payload;
};
