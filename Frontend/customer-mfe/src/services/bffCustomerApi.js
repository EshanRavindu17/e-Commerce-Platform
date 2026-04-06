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

const readCachedUserId = () => {
  if (typeof window === "undefined") {
    return "";
  }

  const raw = window.localStorage.getItem("nexagrid:auth:userId") || "";
  const numeric = Number(raw);
  return Number.isFinite(numeric) && numeric > 0 ? String(numeric) : "";
};

const cacheUserId = (userId) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem("nexagrid:auth:userId", String(userId));
};

export const getCurrentUserId = () => readCachedUserId();

const authHeaders = () => {
  const token = readAccessToken();
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

const resolveCurrentUserId = async () => {
  const cachedUserId = readCachedUserId();
  if (cachedUserId) {
    return cachedUserId;
  }

  const token = readAccessToken();
  if (!token) {
    return "";
  }

  const response = await fetch(`${BFF_BASE_URL}/user`, {
    headers: {
      ...authHeaders(),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return "";
  }

  const userIdCandidates = [
    payload?.data?.userProfile?.data?.id,
    payload?.data?.userProfile?.id,
    payload?.data?.id,
    payload?.id,
  ];

  const resolvedUserId = userIdCandidates.find((candidate) => {
    const numeric = Number(candidate);
    return Number.isFinite(numeric) && numeric > 0;
  });

  if (!resolvedUserId) {
    return "";
  }

  cacheUserId(resolvedUserId);
  return String(resolvedUserId);
};

export const fetchCustomerProfile = async () => {
  const response = await fetch(`${BFF_BASE_URL}/user`, {
    headers: {
      ...authHeaders(),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Failed to load customer profile");
  }

  return (
    payload?.data?.userProfile?.data ||
    payload?.data?.userProfile ||
    payload?.data ||
    {}
  );
};

const normalizeCartItems = (cart) => {
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

export const fetchCustomerCart = async () => {
  const userId = await resolveCurrentUserId();
  if (!userId) {
    throw new Error("Authentication required to load cart");
  }

  const response = await fetch(`${BFF_BASE_URL}/carts/${userId}`, {
    headers: {
      ...authHeaders(),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Failed to load customer cart");
  }

  const cart = payload?.data?.data || payload?.data || payload || {};
  return normalizeCartItems(cart);
};

export const updateCustomerCartItem = async ({ itemId, quantity }) => {
  const userId = await resolveCurrentUserId();
  if (!userId) {
    throw new Error("Authentication required to update cart");
  }

  const response = await fetch(
    `${BFF_BASE_URL}/carts/${userId}/items/${itemId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ quantity }),
    },
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Failed to update cart item");
  }
};

export const removeCustomerCartItem = async ({ itemId }) => {
  const userId = await resolveCurrentUserId();
  if (!userId) {
    throw new Error("Authentication required to update cart");
  }

  const response = await fetch(
    `${BFF_BASE_URL}/carts/${userId}/items/${itemId}`,
    {
      method: "DELETE",
      headers: {
        ...authHeaders(),
      },
    },
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Failed to remove cart item");
  }
};

export const clearCustomerCart = async () => {
  const userId = await resolveCurrentUserId();
  if (!userId) {
    throw new Error("Authentication required to clear cart");
  }

  const response = await fetch(`${BFF_BASE_URL}/carts/${userId}`, {
    method: "DELETE",
    headers: {
      ...authHeaders(),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Failed to clear cart");
  }
};

export const fetchRecommendedProducts = async () => {
  const response = await fetch(`${BFF_BASE_URL}/products?page=1&limit=6`, {
    headers: {
      ...authHeaders(),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Failed to load products");
  }

  const products = payload?.data?.data || payload?.data || [];
  if (!Array.isArray(products)) {
    return [];
  }

  return products.slice(0, 3).map((product, index) => ({
    id: String(product.id || `prd-${index}`),
    name: product.name || "Product",
    price: `$${Number(product.price || 0).toFixed(2)}`,
    tag: String(product.category || "recommended"),
  }));
};
