import axios from "axios";
import config from "../config/index.js";
import { AppError } from "../utils/appError.js";

const logger = console;

const USER_URL = config.SERVICES.USER_URL;
const CUSTOMER_URL = config.SERVICES.USER_URL; // or similar, depending on your service
const CART_URL = config.SERVICES.CART_URL;

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

export const resolveUserByCognitoId = async (cognitoId) => {
  logger.info("UserService: Resolving internal user by cognito ID.");
  try {
    const url = `${USER_URL}/api/v1/users/cognito/${encodeURIComponent(cognitoId)}`;
    const response = await axios.get(url, { timeout: 10000 });
    return response.data;
  } catch (error) {
    logger.error(
      "UserService Error: Failed to resolve internal user by cognito ID.",
      error,
    );
    const statusCode = error.response?.status || 503;
    throw new AppError(
      `Failed to resolve user by cognito ID. Downstream status: ${statusCode}`,
      statusCode,
    );
  }
};

// export const getCustomerData = async (userId) => {
//     logger.info(`AuthService: Attempting to retrieve customer data for user ID: ${userId}`);
//     try {
//         const url = `${CUSTOMER_URL}/customers/${userId}`;
//         const response = await axios.get(url);

//         logger.info(`AuthService: Successfully retrieved customer data for user ID: ${userId}`);
//         return response.data;
//     } catch (error) {
//         logger.error(`AuthService Error: Failed to retrieve customer data for user ${userId}.`, error);

//         const statusCode = error.response?.status || 503;
//         throw new AppError(`Failed to fetch customer data. Downstream status: ${statusCode}`, statusCode);
//     }
// };

// export const getCartData = async (userId) => {
//     logger.info(`AuthService: Attempting to retrieve cart data for user ID: ${userId}`);
//     try {
//         const url = `${CART_URL}/carts/${userId}`;
//         const response = await axios.get(url);

//         logger.info(`AuthService: Successfully retrieved cart data for user ID: ${userId}`);
//         return response.data;
//     } catch (error) {
//         logger.error(`AuthService Error: Failed to retrieve cart data for user ${userId}.`, error);

//         const statusCode = error.response?.status || 503;
//         throw new AppError(`Failed to fetch user cart data. Downstream status: ${statusCode}`, statusCode);
//     }
// };

export const createUser = async (userData) => {
  logger.info("UserService: Attempting to create new user.");
  try {
    const url = `${USER_URL}/api/v1/users`;
    const response = await axios.post(url, userData);

    logger.info("UserService: Successfully created new user.");
    return response.data;
  } catch (error) {
    logger.error("UserService Error: Failed to create new user.", error);

    const statusCode = error.response?.status || 503;
    throw new AppError(
      `Failed to create user. Downstream status: ${statusCode}`,
      statusCode,
    );
  }
};

export const getUserProfile = async (userId, user = {}) => {
  logger.info(
    `UserService: Attempting to retrieve user profile for user ID: ${userId}`,
  );
  try {
    const url = `${USER_URL}/api/v1/users/${userId}`;
    const response = await axios.get(url, {
      headers: buildHeaders(user),
      timeout: 10000,
    });
    logger.info(
      `UserService: Successfully retrieved user profile for user ID: ${userId}`,
    );
    return response.data;
  } catch (error) {
    logger.error(
      `UserService Error: Failed to retrieve user profile for user ${userId}.`,
      error,
    );
    const statusCode = error.response?.status || 503;
    throw new AppError(
      `Failed to fetch user profile. Downstream status: ${statusCode}`,
      statusCode,
    );
  }
};

export const updateUserProfile = async (userId, updateData, user = {}) => {
  logger.info(
    `UserService: Attempting to update user profile for user ID: ${userId}`,
  );
  try {
    const url = `${USER_URL}/api/v1/users/${userId}`;
    const response = await axios.patch(url, updateData, {
      headers: buildHeaders(user),
      timeout: 10000,
    });
    logger.info(
      `UserService: Successfully updated user profile for user ID: ${userId}`,
    );
    return response.data;
  } catch (error) {
    logger.error(
      `UserService Error: Failed to update user profile for user ${userId}.`,
      error,
    );
    const statusCode = error.response?.status || 503;
    throw new AppError(
      `Failed to update user profile. Downstream status: ${statusCode}`,
      statusCode,
    );
  }
};
