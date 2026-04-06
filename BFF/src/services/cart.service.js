import axios from "axios";
import config from "../config/index.js";
import { AppError } from "../utils/appError.js";
import { getProductById } from "./product.service.js";

const logger = console;

const CART_URL = config.SERVICES.CART_URL;
const PRODUCT_URL = config.SERVICES.PRODUCT_URL;

const isMissingCartResponse = (error) => {
  const statusCode = error?.response?.status;
  const message = String(
    error?.response?.data?.message || error?.response?.data?.error || "",
  ).toLowerCase();

  if (statusCode === 404) {
    return true;
  }

  // cartService currently returns 500 for missing cart in some flows.
  return (
    statusCode === 500 &&
    (message.includes("cart not found") || message.includes("entitynotfound"))
  );
};

const buildEmptyCart = (cartId, user = {}) => {
  const numericCartId = Number(cartId);
  const numericUserId = Number(user?.userId || cartId);

  return {
    id: Number.isFinite(numericCartId) ? numericCartId : null,
    userId: Number.isFinite(numericUserId) ? numericUserId : null,
    items: [],
    cartItems: [],
  };
};

const buildHeaders = (user = {}) => {
  const headers = {};

  if (user.role) {
    headers["X-USER-ROLE"] = user.role;
  }

  if (user.userId) {
    headers["X-USER-ID"] = user.userId;
  }

  if (user.token) {
    headers.Authorization = `Bearer ${user.token}`;
  }

  return headers;
};

const normalizeProductPayload = (payload) =>
  payload?.data?.data || payload?.data || payload || {};

const normalizeCartPayload = (payload) =>
  payload?.data?.data || payload?.data || payload || {};

const extractItemProductId = (item = {}) => {
  const candidate = item.productId ?? item.productid;
  const numeric = Number(candidate);
  return Number.isFinite(numeric) ? numeric : null;
};

const enrichCartWithProductDetails = async (rawCart) => {
  const cart = normalizeCartPayload(rawCart);
  const items = cart?.items || cart?.cartItems;

  if (!Array.isArray(items) || items.length === 0) {
    return cart;
  }

  const uniqueProductIds = [
    ...new Set(items.map(extractItemProductId).filter(Boolean)),
  ];
  const productById = new Map();

  await Promise.all(
    uniqueProductIds.map(async (productId) => {
      try {
        const productPayload = await getProductById(productId);
        const product = normalizeProductPayload(productPayload);
        productById.set(productId, {
          name: product?.name || product?.productName || "Product",
          price: Number(product?.price || product?.unitPrice || 0),
        });
      } catch (error) {
        logger.warn(
          `CartService: Failed to hydrate product ${productId} for cart view.`,
          error?.message || error,
        );
      }
    }),
  );

  const enrichedItems = items.map((item) => {
    const productId = extractItemProductId(item);
    const product = productById.get(productId);

    if (!product) {
      return {
        ...item,
        name: item?.name || item?.productName || "Product",
        productName: item?.productName || item?.name || "Product",
        price: Number(item?.price || item?.unitPrice || 0),
        unitPrice: Number(item?.unitPrice || item?.price || 0),
      };
    }

    return {
      ...item,
      name: product.name,
      productName: product.name,
      price: product.price,
      unitPrice: product.price,
    };
  });

  return {
    ...cart,
    items: enrichedItems,
    cartItems: enrichedItems,
  };
};

const extractCartItems = (cart = {}) => {
  const items = cart?.items || cart?.cartItems || [];
  return Array.isArray(items) ? items : [];
};

export const getCartById = async (cartId, user) => {
  logger.info(`CartService: Attempting to retrieve cart with ID: ${cartId}`);
  try {
    const url = `${CART_URL}/api/v1/carts/${cartId}`;
    const response = await axios.get(url, {
      headers: buildHeaders(user),
      timeout: 10000,
    });

    const enrichedCart = await enrichCartWithProductDetails(response.data);

    logger.info(`CartService: Successfully retrieved cart with ID: ${cartId}`);
    return enrichedCart;
  } catch (error) {
    if (isMissingCartResponse(error)) {
      logger.info(
        `CartService: No existing cart for ID ${cartId}. Returning empty cart payload.`,
      );
      return buildEmptyCart(cartId, user);
    }

    logger.error(
      `CartService Error: Failed to retrieve cart with ID: ${cartId}.`,
      error,
    );
    const statusCode = error.response?.status || 400;
    throw new AppError(`Failed to fetch cart data ${statusCode}`, statusCode);
  }
};

export const clearCartById = async (cartId, user) => {
  logger.info(`CartService: Attempting to clear cart with ID: ${cartId}`);
  try {
    const url = `${CART_URL}/api/v1/carts/${cartId}`;
    await axios.delete(url, {
      headers: buildHeaders(user),
      timeout: 10000,
    });
    logger.info(`CartService: Successfully cleared cart with ID: ${cartId}`);
  } catch (error) {
    logger.error(
      `CartService Error: Failed to clear cart with ID: ${cartId}.`,
      error,
    );
    const statusCode = error.response?.status || 400;
    throw new AppError(`Failed to clear cart data ${statusCode}`, statusCode);
  }
};

export const addItemToCart = async (cartId, productId, quantity, user) => {
  logger.info(`CartService: Attempting to add item to cart with ID: ${cartId}`);
  try {
    const url = `${CART_URL}/api/v1/carts/${cartId}/items`;
    const payload = { productId, quantity };
    const response = await axios.post(url, payload, {
      headers: buildHeaders(user),
      timeout: 10000,
    });
    logger.info(
      `CartService: Successfully added item to cart with ID: ${cartId}`,
    );
    return response.data;
  } catch (error) {
    logger.error(
      `CartService Error: Failed to add item to cart with ID: ${cartId}.`,
      error,
    );
    const statusCode = error.response?.status || 400;
    throw new AppError(`Failed to add item to cart ${statusCode}`, statusCode);
  }
};

export const updateCartItem = async (cartId, itemId, quantity, user) => {
  logger.info(
    `CartService: Attempting to update item in cart with ID: ${cartId}`,
  );
  try {
    const url = `${CART_URL}/api/v1/carts/${cartId}/items/${itemId}`;
    const payload = { quantity };
    const response = await axios.patch(url, payload, {
      headers: buildHeaders(user),
      timeout: 10000,
    });
    logger.info(
      `CartService: Successfully updated item in cart with ID: ${cartId}`,
    );
    return response.data;
  } catch (error) {
    logger.error(
      `CartService Error: Failed to update item in cart with ID: ${cartId}.`,
      error,
    );
    const statusCode = error.response?.status || 400;
    throw new AppError(`Failed to update cart item ${statusCode}`, statusCode);
  }
};

export const removeItemFromCart = async (cartId, itemId, user) => {
  logger.info(
    `CartService: Attempting to remove item from cart with ID: ${cartId}`,
  );
  try {
    const url = `${CART_URL}/api/v1/carts/${cartId}/items/${itemId}`;
    await axios.delete(url, {
      headers: buildHeaders(user),
      timeout: 10000,
    });
    logger.info(
      `CartService: Successfully removed item from cart with ID: ${cartId}`,
    );
  } catch (error) {
    logger.error(
      `CartService Error: Failed to remove item from cart with ID: ${cartId}.`,
      error,
    );
    const statusCode = error.response?.status || 400;
    throw new AppError(`Failed to remove cart item ${statusCode}`, statusCode);
  }
};

export const checkoutCart = async (cartId, user) => {
  logger.info(`CartService: Attempting checkout for cart ID: ${cartId}`);

  if (String(user?.role || "").toUpperCase() !== "CUSTOMER") {
    throw new AppError("Only customers can checkout", 403);
  }

  const cartPayload = await getCartById(cartId, user);
  const cart = normalizeCartPayload(cartPayload);
  const items = extractCartItems(cart);

  if (items.length === 0) {
    return {
      cartId: Number(cartId),
      purchasedItems: 0,
      message: "Cart is empty",
    };
  }

  const itemPlans = await Promise.all(
    items.map(async (item) => {
      const rawProductId = item.productId ?? item.productid ?? item.id;
      const productId = Number(rawProductId);
      const purchaseQty = Math.max(1, Number(item.quantity || item.qty || 1));

      if (!Number.isFinite(productId)) {
        throw new AppError("Invalid product in cart", 400);
      }

      const productPayload = await getProductById(productId);
      const product = normalizeProductPayload(productPayload);
      const currentQty = Number(product.quantity || 0);

      if (!Number.isFinite(currentQty)) {
        throw new AppError(`Invalid stock for product ${productId}`, 400);
      }

      if (currentQty < purchaseQty) {
        throw new AppError(
          `Insufficient stock for product ${product.name || productId}`,
          400,
        );
      }

      const supplierId = Number(product.supplierId);
      if (!Number.isFinite(supplierId)) {
        throw new AppError(`Missing supplier for product ${productId}`, 400);
      }

      return {
        productId,
        supplierId,
        nextQuantity: currentQty - purchaseQty,
      };
    }),
  );

  await Promise.all(
    itemPlans.map((plan) =>
      axios.patch(
        `${PRODUCT_URL}/api/products/${plan.productId}`,
        { quantity: plan.nextQuantity },
        {
          headers: {
            "X-USER-ID": plan.supplierId,
            "X-USER-ROLE": "SUPPLIER",
          },
          timeout: 10000,
        },
      ),
    ),
  );

  await clearCartById(cartId, user);

  logger.info(`CartService: Checkout completed for cart ID: ${cartId}`);
  return {
    cartId: Number(cartId),
    purchasedItems: itemPlans.length,
    message: "Checkout completed",
  };
};
