import config from "../config/index.js";
import { AppError } from "../utils/appError.js";
import * as cognitoService from "../services/cognito.service.js";
import * as userService from "../services/user.service.js";

const logger = console;

export const registerUser = async (req, res, next) => {
  const { firstName, lastName, email, phone, password, address, userType } =
    req.body;

  const normalizedUserType =
    String(userType || "").toUpperCase() === "STEWARD"
      ? "DATASTEWARD"
      : userType;

  logger.info("Controller: Register request received");

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !password ||
    !address ||
    !userType
  ) {
    logger.warn("Controller: Register request failed due to missing fields.");
    return next(
      new AppError(
        "All fields (firstName, lastName, email, phone, password, address, userType) are required.",
        config.CONSTANTS.HTTP_STATUS.BAD_REQUEST,
      ),
    );
  }

  try {
    const cognitoSub = await cognitoService.createCognitoUser({
      email,
      password,
      firstName,
      lastName,
    });
    const newUser = await userService.createUser({
      firstName,
      lastName,
      email,
      phone,
      address,
      userType: normalizedUserType,
      cognitoSub,
    });

    logger.info("Controller: User registered successfully.", {
      userId: newUser.id,
    });

    res.status(config.CONSTANTS.HTTP_STATUS.CREATED).json({
      status: "success",
      message: "User registered successfully!",
      data: { user: newUser },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    logger.info("Controller: Get user profile request received", { userId });
    const userProfile = await userService.getUserProfile(userId, req.user);

    logger.info("Controller: User profile retrieved successfully", { userId });
    res.status(config.CONSTANTS.HTTP_STATUS.OK).json({
      status: "success",
      data: { userProfile },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;

    logger.info("Controller: Update user profile request received", { userId });
    const updatedProfile = await userService.updateUserProfile(
      userId,
      updateData,
      req.user,
    );

    logger.info("Controller: User profile updated successfully", { userId });
    res.status(config.CONSTANTS.HTTP_STATUS.OK).json({
      status: "success",
      message: "User profile updated successfully!",
      data: { updatedProfile },
    });
  } catch (error) {
    logger.error("Controller: Error updating user profile", { error });
    next(error);
  }
};
