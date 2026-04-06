import config from "../config/index.js";
import * as cartService from "../services/cart.service.js";

// Mock logger - replace with actual logger if available
const logger = console;

export const getCart = async (req, res, next) => {
  try {
    const cartId = req.params.cartId;
    const cart = await cartService.getCartById(cartId, req.user);

    res.status(config.CONSTANTS.HTTP_STATUS.OK).json({
      status: true,
      data: cart,
    });
  } catch (error) {
    logger.error("Controller: Error fetching cart", { error });
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cartId = req.params.cartId;
    await cartService.clearCartById(cartId, req.user);

    res.status(config.CONSTANTS.HTTP_STATUS.NO_CONTENT).json({
      status: true,
      data: null,
    });
  } catch (error) {
    logger.error("Controller: Error clearing cart", { error });
    next(error);
  }
};

export const addItemToCart = async (req, res, next) => {
  try {
    const cartId = req.params.cartId;
    const { productId, quantity } = req.body;
    const updatedCart = await cartService.addItemToCart(
      cartId,
      productId,
      quantity,
      req.user,
    );
    res.status(config.CONSTANTS.HTTP_STATUS.OK).json({
      status: true,
      data: updatedCart,
    });
  } catch (error) {
    logger.error("Controller: Error adding item to cart", { error });
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { cartId, itemId } = req.params;
    const { quantity } = req.body;

    const cart = await cartService.updateCartItem(
      cartId,
      itemId,
      quantity,
      req.user,
    );
    res.status(config.CONSTANTS.HTTP_STATUS.OK).json({
      status: true,
      data: cart,
    });
  } catch (error) {
    logger.error("Controller: Error updating cart item", { error });
    next(error);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const { cartId, itemId } = req.params;
    const updatedCart = await cartService.removeItemFromCart(
      cartId,
      itemId,
      req.user,
    );
    res.status(config.CONSTANTS.HTTP_STATUS.OK).json({
      status: true,
      data: updatedCart,
    });
  } catch (error) {
    logger.error("Controller: Error removing item from cart", { error });
    next(error);
  }
};

export const checkoutCart = async (req, res, next) => {
  try {
    const cartId = req.params.cartId;
    const result = await cartService.checkoutCart(cartId, req.user);

    res.status(config.CONSTANTS.HTTP_STATUS.OK).json({
      status: true,
      data: result,
    });
  } catch (error) {
    logger.error("Controller: Error checking out cart", { error });
    next(error);
  }
};
