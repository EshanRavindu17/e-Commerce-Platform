const BFF_BASE_URL =
  (typeof window !== "undefined" && window.__NEXAGRID_BFF_URL__) ||
  (typeof process !== "undefined" && process.env && process.env.BFF_BASE_URL) ||
  "http://localhost:3000";

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64Url = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64Url + "=".repeat((4 - (base64Url.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const normalizeRole = (value) => {
  const role = String(value || "")
    .trim()
    .toUpperCase();
  if (!role) return "";
  if (role === "SUPPLIER") return "SUPPLIER";
  if (role === "CUSTOMER") return "CUSTOMER";
  if (role === "STEWARD" || role === "DATASTEWARD") return "STEWARD";
  return role;
};

const getPathFromRole = (role) => {
  if (role === "SUPPLIER") return "/supplier";
  if (role === "STEWARD") return "/dashboard";
  if (role === "CUSTOMER") return "/customer";
  return "";
};

const getRoleFromTokenClaims = (token = {}) => {
  const idPayload = decodeJwtPayload(token.idToken);
  const accessPayload = decodeJwtPayload(token.accessToken);

  const claimCandidates = [
    idPayload?.["cognito:groups"]?.[0],
    accessPayload?.["cognito:groups"]?.[0],
    idPayload?.["custom:role"],
    accessPayload?.["custom:role"],
    idPayload?.role,
    accessPayload?.role,
    idPayload?.userType,
    accessPayload?.userType,
  ];

  for (const candidate of claimCandidates) {
    const normalized = normalizeRole(candidate);
    if (normalized) return normalized;
  }

  return "";
};

const getRoleFromProfilePayload = (payload) => {
  const roleCandidates = [
    payload?.data?.userProfile?.userType,
    payload?.data?.userProfile?.role,
    payload?.data?.data?.userType,
    payload?.data?.data?.role,
    payload?.data?.user?.userType,
    payload?.data?.user?.role,
    payload?.data?.userType,
    payload?.data?.role,
    payload?.userType,
    payload?.role,
  ];

  for (const candidate of roleCandidates) {
    const normalized = normalizeRole(candidate);
    if (normalized) return normalized;
  }

  return "";
};

const jsonRequest = async (path, options = {}) => {
  const response = await fetch(`${BFF_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Request failed");
  }

  return payload;
};

export const login = async ({ email, password }) => {
  const result = await jsonRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const token = result?.data?.token || {};
  if (typeof window !== "undefined") {
    window.localStorage.setItem(
      "nexagrid:auth:accessToken",
      token.accessToken || "",
    );
    window.localStorage.setItem("nexagrid:auth:idToken", token.idToken || "");
    window.localStorage.setItem(
      "nexagrid:auth:refreshToken",
      token.refreshToken || "",
    );
  }

  return token;
};

export const getPostLoginPath = async (token = {}) => {
  const roleFromToken = getRoleFromTokenClaims(token);
  const pathFromToken = getPathFromRole(roleFromToken);
  if (pathFromToken) {
    return pathFromToken;
  }

  if (token.accessToken) {
    try {
      const profilePayload = await jsonRequest("/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
        },
      });

      const roleFromProfile = getRoleFromProfilePayload(profilePayload);
      const pathFromProfile = getPathFromRole(roleFromProfile);
      if (pathFromProfile) {
        return pathFromProfile;
      }
    } catch {
      // Keep a safe customer default when role lookup fails.
    }
  }

  return "/customer";
};

export const hydrateUserIdentity = async (token = {}) => {
  if (typeof window === "undefined" || !token.accessToken) {
    return;
  }

  try {
    const profilePayload = await jsonRequest("/user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
      },
    });

    const userIdCandidates = [
      profilePayload?.data?.userProfile?.data?.id,
      profilePayload?.data?.userProfile?.id,
      profilePayload?.data?.id,
      profilePayload?.id,
    ];

    const resolvedUserId = userIdCandidates.find((candidate) => {
      const numeric = Number(candidate);
      return Number.isFinite(numeric) && numeric > 0;
    });

    if (resolvedUserId) {
      window.localStorage.setItem(
        "nexagrid:auth:userId",
        String(resolvedUserId),
      );
    }
  } catch {
    // Identity hydration is optional; cart modules can resolve later.
  }
};

export const register = async (formData) => {
  const result = await jsonRequest("/user/register", {
    method: "POST",
    body: JSON.stringify(formData),
  });

  return result;
};
