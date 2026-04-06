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

export const isAuthenticated = () => Boolean(readAccessToken());

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

const resolveCurrentCartId = async () => {
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

export const fetchCartItemCount = async () => {
  const cartId = await resolveCurrentCartId();
  if (!cartId) {
    return 0;
  }

  const response = await fetch(`${BFF_BASE_URL}/carts/${cartId}`, {
    headers: {
      ...authHeaders(),
    },
  });

  if (!response.ok) {
    return 0;
  }

  const payload = await response.json().catch(() => ({}));
  const cart = payload?.data?.data || payload?.data || payload || {};
  const items = cart?.items || cart?.cartItems || [];

  if (!Array.isArray(items)) {
    return 0;
  }

  return items.reduce((total, item) => {
    const qty = Number(item.quantity || item.qty || 1);
    return total + (Number.isFinite(qty) && qty > 0 ? qty : 1);
  }, 0);
};

export const logout = async () => {
  const accessToken = readAccessToken();

  if (!accessToken) {
    return;
  }

  await fetch(`${BFF_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ accessToken }),
  }).catch(() => null);

  if (typeof window !== "undefined") {
    window.localStorage.removeItem("nexagrid:auth:accessToken");
    window.localStorage.removeItem("nexagrid:auth:idToken");
    window.localStorage.removeItem("nexagrid:auth:refreshToken");
    window.localStorage.removeItem("nexagrid:auth:userId");
    window.localStorage.removeItem("accessToken");
  }
};
