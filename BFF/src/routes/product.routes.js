import express from "express";
import * as productController from "../controller/product.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes (no auth required)
router.get("/", productController.getProducts);
router.get("/categories", productController.getProductCategories);

// Protected routes (auth required)
router.get("/review", authMiddleware, productController.getProducts);
router.post("/", authMiddleware, productController.addProduct);
router.post(
  "/images/presign",
  authMiddleware,
  productController.createProductImageUploadUrl,
);
router.get(
  "/suppliers/me",
  authMiddleware,
  productController.getMySupplierProducts,
);
router.patch("/:productId", authMiddleware, productController.updateProduct);
router.delete("/:productId", authMiddleware, productController.deleteProduct);
router.get(
  "/suppliers/:supplierId",
  authMiddleware,
  productController.getProductsBySupplier,
);

// Keep dynamic route last so it does not swallow static paths like /review.
router.get("/:productId", productController.getProductById);

export default router;
