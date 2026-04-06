import axios from "axios";
import { AppError } from "../utils/appError.js";
import config from "../config/index.js";

const logger = console;

const PRODUCT_URL = config.SERVICES.PRODUCT_URL;

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

const getAllowedStatus = (role) => {
  switch (role) {
    case "STEWARD":
      return ["APPROVED", "REJECTED", "PENDING"];
    case "SUPPLIER":
      return ["APPROVED", "REJECTED", "PENDING"];
    default:
      return ["APPROVED"];
  }
};

export const getProducts = async ({ filters, pagination, sorting, user }) => {
  const statuses = getAllowedStatus(user.role);
  const resolvedRole = user.role || "CUSTOMER";
  const params = {
    status: statuses.join(","),
    categoryId: filters.categoryId,
    name: filters.name,
    page: pagination.page,
    limit: pagination.limit,
    sortBy: sorting.sortBy,
    sortOrder: sorting.sortOrder,
    "X-USER-ROLE": resolvedRole,
  };

  const response = await axios.get(`${PRODUCT_URL}/api/products`, {
    headers: buildHeaders(user),
    params,
  });

  logger.info(
    "ProductService: Successfully fetched products from product service.",
  );
  return response.data;
};

export const addProduct = async (productData, user) => {
  logger.info("ProductService: Attempting to add a new product.");
  try {
    const url = `${PRODUCT_URL}/api/products`;
    const response = await axios.post(url, productData, {
      headers: {
        ...buildHeaders(user),
      },
      timeout: 10000,
    });
    logger.info("ProductService: Successfully added a new product.");
    return response.data;
  } catch (error) {
    logger.error("ProductService Error: Failed to add a new product.", error);
    const statusCode = error.response?.status || 400;
    throw new AppError(`Failed to add new product ${statusCode}`, statusCode);
  }
};

export const getProductCategories = async () => {
  logger.info("ProductService: Attempting to fetch product categories.");
  try {
    const url = `${PRODUCT_URL}/api/products/categories`;
    const response = await axios.get(url);
    logger.info("ProductService: Successfully fetched product categories.");
    return response.data;
  } catch (error) {
    logger.error(
      "ProductService Error: Failed to fetch product categories.",
      error,
    );
    const statusCode = error.response?.status || 400;
    throw new AppError(
      `Failed to fetch product categories ${statusCode}`,
      statusCode,
    );
  }
};

export const getProductById = async (productId) => {
  logger.info("ProductService: Attempting to fetch product details by ID.");
  try {
    const url = `${PRODUCT_URL}/api/products/${productId}`;
    const response = await axios.get(url);
    logger.info("ProductService: Successfully fetched product details by ID.");
    return response.data;
  } catch (error) {
    logger.error(
      "ProductService Error: Failed to fetch product details by ID.",
      error,
    );
    const statusCode = error.response?.status || 400;
    throw new AppError(
      `Failed to fetch product details ${statusCode}`,
      statusCode,
    );
  }
};

export const updateProduct = async (productId, payLoad, user) => {
  logger.info("ProductService: Attempting to update the product details.");
  try {
    const url = `${PRODUCT_URL}/api/products/${productId}`;
    const response = await axios.patch(url, payLoad, {
      headers: buildHeaders(user),
      timeout: 10000,
    });

    logger.info("ProductService: Successfully updated the product details.");
    return response.data;
  } catch (error) {
    logger.error("ProductService Error: Failed to create new user.", error);

    const statusCode = error.response?.status || 400;
    throw new AppError(
      `Failed to update the product details ${statusCode}`,
      statusCode,
    );
  }
};

export const deleteProduct = async (productId, user) => {
  logger.info("ProductService: Attempting to delete the product.");
  try {
    const url = `${PRODUCT_URL}/api/products/${productId}`;
    const response = await axios.delete(url, {
      headers: buildHeaders(user),
      timeout: 10000,
    });
    logger.info("ProductService: Successfully deleted the product.");
    return response.data;
  } catch (error) {
    logger.error("ProductService Error: Failed to delete the product.", error);

    const statusCode = error.response?.status || 400;
    throw new AppError(
      `Failed to delete the product ${statusCode}`,
      statusCode,
    );
  }
};

export const getProductsBySupplier = async (supplierId, user) => {
  logger.info("ProductService: Attempting to fetch products by supplier ID.");
  try {
    const url = `${PRODUCT_URL}/api/products/supplier/${supplierId}`;
    const response = await axios.get(url, {
      headers: buildHeaders(user),
      timeout: 10000,
    });
    logger.info(
      "ProductService: Successfully fetched products by supplier ID.",
    );
    return response.data;
  } catch (error) {
    logger.error(
      "ProductService Error: Failed to fetch products by supplier ID.",
      error,
    );
    const statusCode = error.response?.status || 400;
    throw new AppError(
      `Failed to fetch products by supplier ${statusCode}`,
      statusCode,
    );
  }
};
