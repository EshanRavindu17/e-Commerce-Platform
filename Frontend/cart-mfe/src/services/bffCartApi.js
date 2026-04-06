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

const authHeaders = () => {
  const token = readAccessToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

export const getCurrentCartId = () => readCachedUserId();

export const resolveCurrentCartId = async () => {
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

export const fetchCart = async (cartId) => {
  if (!cartId) {
    throw new Error("Authentication required to load cart");
  }

  const response = await fetch(`${BFF_BASE_URL}/carts/${cartId}`, {
    headers: {
      ...authHeaders(),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Failed to fetch cart");
  }

  return payload?.data?.data || payload?.data || payload || [];
};

export const updateCartItem = async ({ cartId, itemId, quantity }) => {
  if (!cartId) {
    throw new Error("Authentication required to update cart");
  }

  const response = await fetch(
    `${BFF_BASE_URL}/carts/${cartId}/items/${itemId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ quantity }),
    },
  );

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || "Failed to update cart item");
  }
};

export const removeCartItem = async ({ cartId, itemId }) => {
  if (!cartId) {
    throw new Error("Authentication required to update cart");
  }

  const response = await fetch(
    `${BFF_BASE_URL}/carts/${cartId}/items/${itemId}`,
    {
      method: "DELETE",
      headers: {
        ...authHeaders(),
      },
    },
  );

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || "Failed to remove cart item");
  }
};

export const clearCart = async (cartId) => {
  if (!cartId) {
    throw new Error("Authentication required to clear cart");
  }

  const response = await fetch(`${BFF_BASE_URL}/carts/${cartId}`, {
    method: "DELETE",
    headers: {
      ...authHeaders(),
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || "Failed to clear cart");
  }
};

export const checkoutCart = async (cartId) => {
  if (!cartId) {
    throw new Error("Authentication required to checkout");
  }

  const response = await fetch(`${BFF_BASE_URL}/carts/${cartId}/checkout`, {
    method: "POST",
    headers: {
      ...authHeaders(),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Failed to complete checkout");
  }

  return payload?.data || payload;
};
