import config from "../config/index.js";
import * as productService from "../services/product.service.js";
import * as storageService from "../services/storage.service.js";
import { AppError } from "../utils/appError.js";

const logger = console;

export const getProducts = async (req, res, next) => {
  try {
    const {
      categoryId,
      category,
      name,
      page = 1,
      limit = 10,
      sortBy = "name",
      sortOrder = "asc",
    } = req.query;

    const resolvedCategoryId = categoryId ?? category;

    const prodcts = await productService.getProducts({
      filters: { categoryId: resolvedCategoryId, name },
      pagination: { page, limit },
      sorting: { sortBy, sortOrder },
      user: req.user || { role: "CUSTOMER" },
    });

    res.status(config.CONSTANTS.HTTP_STATUS.OK).json({
      status: true,
      data: prodcts,
    });
  } catch (error) {
    next(error);
  }
};

export const addProduct = async (req, res, next) => {
  try {
    if (req.user.role !== "SUPPLIER") {
      return next(
        new AppError(
          "Only suppliers can add products",
          config.CONSTANTS.HTTP_STATUS.FORBIDDEN,
        ),
      );
    }

    const productData = req.body;
    const newProduct = await productService.addProduct(productData, req.user);
    res.status(config.CONSTANTS.HTTP_STATUS.CREATED).json({
      status: true,
      data: newProduct,
    });
  } catch (error) {
    logger.error("Controller: Error adding new product", { error });
    next(error);
  }
};

export const getProductCategories = async (req, res, next) => {
  try {
    const categories = await productService.getProductCategories();

    res.status(config.CONSTANTS.HTTP_STATUS.OK).json({
      status: true,
      data: categories,
    });
  } catch (error) {
    logger.error("Controller: Error fetching product categories", { error });
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await productService.getProductById(productId);
    res.status(config.CONSTANTS.HTTP_STATUS.OK).json({
      status: true,
      data: product,
    });
  } catch (error) {
    logger.error("Controller: Error fetching product by ID", { error });
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const body = req.body;

    if (req.user.role === "CUSTOMER") {
      return next(
        new AppError(
          "Customers are not allowed to update products",
          config.CONSTANTS.HTTP_STATUS.FORBIDDEN,
        ),
      );
    }

    if (req.user.role === "STEWARD") {
      if (!body.status) {
        return next(
          new AppError(
            "Status is required for steward",
            config.CONSTANTS.HTTP_STATUS.BAD_REQUEST,
          ),
        );
      }

      const response = await productService.updateProduct(
        productId,
        { status: body.status },
        req.user,
      );

      return res.status(config.CONSTANTS.HTTP_STATUS.OK).json(response);
    }

    if (req.user.role === "SUPPLIER") {
      const allowFields = [
        "name",
        "categoryId",
        "price",
        "quantity",
        "description",
        "imageurl",
      ];

      const updatePayLoad = {};

      allowFields.forEach((field) => {
        if (body[field] !== undefined) {
          updatePayLoad[field] = body[field];
        }
      });

      if (body.imageUrl !== undefined && updatePayLoad.imageurl === undefined) {
        updatePayLoad.imageurl = body.imageUrl;
      }

      if (Object.keys(updatePayLoad).length === 0) {
        return next(
          new AppError(
            "No valid fields to update",
            config.CONSTANTS.HTTP_STATUS.BAD_REQUEST,
          ),
        );
      }

      const response = await productService.updateProduct(
        productId,
        updatePayLoad,
        req.user,
      );

      res.status(config.CONSTANTS.HTTP_STATUS.OK).json(response);
    }
  } catch (error) {
    logger.error("Controller: Error updating product details", { error });
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (req.user.role !== "SUPPLIER") {
      return next(
        new AppError(
          "Only suppliers can delete products",
          config.CONSTANTS.HTTP_STATUS.FORBIDDEN,
        ),
      );
    }

    const response = await productService.deleteProduct(productId, req.user);

    res.status(config.CONSTANTS.HTTP_STATUS.NO_CONTENT).send();
  } catch (error) {
    logger.error("Controller: Error deleting product", { error });
    next(error);
  }
};

export const getProductsBySupplier = async (req, res, next) => {
  try {
    const { supplierId } = req.params;

    if (req.user.role === "CUSTOMER") {
      return next(
        new AppError(
          "Customers are not allowed to view products by supplier",
          config.CONSTANTS.HTTP_STATUS.FORBIDDEN,
        ),
      );
    }

    const products = await productService.getProductsBySupplier(
      supplierId,
      req.user,
    );

    res.status(config.CONSTANTS.HTTP_STATUS.OK).json({
      status: true,
      data: products,
    });
  } catch (error) {
    logger.error("Controller: Error fetching products by supplier", { error });
    next(error);
  }
};

export const getMySupplierProducts = async (req, res, next) => {
  try {
    if (req.user.role !== "SUPPLIER") {
      return next(
        new AppError(
          "Only suppliers can view their own products",
          config.CONSTANTS.HTTP_STATUS.FORBIDDEN,
        ),
      );
    }

    const products = await productService.getProductsBySupplier(
      req.user.userId,
      req.user,
    );

    res.status(config.CONSTANTS.HTTP_STATUS.OK).json({
      status: true,
      data: products,
    });
  } catch (error) {
    logger.error("Controller: Error fetching current supplier products", {
      error,
    });
    next(error);
  }
};

export const createProductImageUploadUrl = async (req, res, next) => {
  try {
    if (req.user.role !== "SUPPLIER") {
      return next(
        new AppError(
          "Only suppliers can upload product images",
          config.CONSTANTS.HTTP_STATUS.FORBIDDEN,
        ),
      );
    }

    const { fileName, contentType } = req.body;
    const uploadData = await storageService.createProductImageUploadUrl({
      fileName,
      contentType,
      user: req.user,
    });

    res.status(config.CONSTANTS.HTTP_STATUS.OK).json({
      status: true,
      data: uploadData,
    });
  } catch (error) {
    logger.error("Controller: Error creating product image upload URL", {
      error,
    });
    next(error);
  }
};
