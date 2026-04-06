const normalizeBaseUrl = (value) => {
  if (!value) {
    return "";
  }

  const normalized = String(value).trim();
  if (!normalized || normalized === "undefined" || normalized === "null") {
    return "";
  }

  return normalized.replace(/\/+$/, "");
};

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

const resolveCurrentCartId = async () => {
  const cachedUserId = readCachedUserId();
  if (cachedUserId) {
    return cachedUserId;
  }

  const token = readAccessToken();
  if (!token) {
    return "";
  }

  const response = await fetch(`${getCandidateBffBaseUrls()[0]}/user`, {
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

const getCandidateBffBaseUrls = () => {
  const candidates = [
    normalizeBaseUrl(
      typeof window !== "undefined" ? window.__NEXAGRID_BFF_URL__ : "",
    ),
    normalizeBaseUrl(
      typeof process !== "undefined" && process.env
        ? process.env.BFF_BASE_URL
        : "",
    ),
  ];

  if (typeof window !== "undefined" && window.location?.hostname) {
    const inferred = `${window.location.protocol}//${window.location.hostname}:3000`;
    candidates.push(normalizeBaseUrl(inferred));
  }

  candidates.push("http://localhost:3000");

  return [...new Set(candidates.filter(Boolean))];
};

const fetchFromBff = async (path) => {
  const errors = [];

  for (const baseUrl of getCandidateBffBaseUrls()) {
    try {
      const response = await fetch(`${baseUrl}${path}`);
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload.message || `Request failed with status ${response.status}`,
        );
      }

      return payload;
    } catch (error) {
      errors.push(`${baseUrl}: ${error.message}`);
    }
  }

  throw new Error(errors.join(" | ") || "Failed to contact BFF");
};

const toSlug = (value = "") =>
  String(value).trim().toLowerCase().replace(/\s+/g, "-");

const mapSortToBackend = (sortBy = "featured") => {
  switch (sortBy) {
    case "price-low":
      return { sortBy: "price", sortOrder: "asc" };
    case "price-high":
      return { sortBy: "price", sortOrder: "desc" };
    case "newest":
      return { sortBy: "id", sortOrder: "desc" };
    case "featured":
    case "rating":
    case "bestselling":
    default:
      return { sortBy: "name", sortOrder: "asc" };
  }
};

const normalizeProduct = (product = {}, index = 0) => {
  const price = Number(product.price || 0);
  const image =
    product.imageUrl ||
    product.imageurl ||
    product.image ||
    "https://via.placeholder.com/280x280";

  return {
    id: product.id || `prd-${index}`,
    name: product.name || "Unnamed Product",
    description: product.description || "",
    categoryId: Number(product.categoryId || 0),
    category: String(product.categoryId || "general"),
    price,
    originalPrice: Number(product.originalPrice || price),
    rating: Number(product.rating || 4.4),
    reviews: Number(product.reviews || 0),
    image,
    badge: product.badge || null,
    isNew: Boolean(product.isNew),
  };
};

export const fetchProducts = async (filters = {}) => {
  const params = new URLSearchParams();

  const selectedCategoryId = Number(filters.activeCategory);
  if (
    filters.activeCategory &&
    filters.activeCategory !== "all" &&
    Number.isFinite(selectedCategoryId)
  ) {
    params.set("categoryId", String(selectedCategoryId));
  }

  if (filters.searchTerm) {
    params.set("name", filters.searchTerm.trim());
  }

  const backendSort = mapSortToBackend(filters.sortBy);
  params.set("sortBy", backendSort.sortBy);
  params.set("sortOrder", backendSort.sortOrder);

  params.set("page", "1");
  params.set("limit", "100");

  const payload = await fetchFromBff(`/products?${params.toString()}`);

  const rawList =
    payload?.data?.data?.content ||
    payload?.data?.content ||
    payload?.data?.data ||
    payload?.data ||
    [];
  if (!Array.isArray(rawList)) {
    return [];
  }

  return rawList.map(normalizeProduct);
};

export const fetchProductCategories = async () => {
  const payload = await fetchFromBff("/products/categories");

  const rawCategories = payload?.data?.data || payload?.data || [];

  if (!Array.isArray(rawCategories)) {
    return [];
  }

  return rawCategories
    .map((category) => {
      if (typeof category === "string") {
        return null;
      }

      const categoryId = Number(category?.id);
      const label =
        category?.name || category?.label || category?.category || "";
      if (!label || !Number.isFinite(categoryId)) {
        return null;
      }

      return {
        id: String(categoryId),
        slug: toSlug(label),
        label,
        backendValue: categoryId,
      };
    })
    .filter(Boolean);
};

export const addProductToCart = async ({ productId, quantity = 1 }) => {
  const cartId = await resolveCurrentCartId();

  if (!cartId) {
    throw new Error("Authentication required to add products to cart");
  }

  const normalizedQuantity = Math.max(1, Number(quantity) || 1);
  const numericProductId = Number(productId);
  const normalizedProductId = Number.isFinite(numericProductId)
    ? numericProductId
    : productId;

  const response = await fetch(
    `${getCandidateBffBaseUrls()[0]}/carts/${cartId}/items`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({
        productId: normalizedProductId,
        quantity: normalizedQuantity,
      }),
    },
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || "Failed to add product to cart");
  }

  return payload?.data || payload;
};
