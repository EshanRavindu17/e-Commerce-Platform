import express from "express";
import * as cartController from "../controller/cart.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:cartId", authMiddleware, cartController.getCart);
router.delete("/:cartId", authMiddleware, cartController.clearCart);
router.post("/:cartId/checkout", authMiddleware, cartController.checkoutCart);
router.post("/:cartId/items", authMiddleware, cartController.addItemToCart);
router.patch(
  "/:cartId/items/:itemId",
  authMiddleware,
  cartController.updateCartItem,
);
router.delete(
  "/:cartId/items/:itemId",
  authMiddleware,
  cartController.removeCartItem,
);

export default router;
