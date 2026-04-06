package com.example.productService.controller;

import com.example.productService.dto.ProductDto;
import com.example.productService.dto.UpdateProductDto;
import com.example.productService.entity.Category;
import com.example.productService.entity.Product;
import com.example.productService.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
// @Tag(name = "Product Service")
public class ProductController extends AbstractController {

    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // GET /api/products
    @GetMapping
    public ResponseEntity<Object> getAllProducts(
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder,
            @RequestHeader(value = "X-USER-ROLE", required = false, defaultValue = "CUSTOMER") String role) {
        logger.info("[GET /api/products] request received | role={} page={} limit={} sortBy={} sortOrder={}",
                role, page, limit, sortBy, sortOrder);
        logger.debug("[GET /api/products] filters | categoryId={} name={} status={}", categoryId, name, status);

        try {
            Object response = productService.getProducts(
                    categoryId,
                    name,
                    status,
                    page,
                    limit,
                    sortBy,
                    sortOrder,
                    role);
            logger.info("[GET /api/products] request completed successfully | role={} page={} limit={}",
                    role, page, limit);
            logger.debug("[GET /api/products] response metadata | responseType={}",
                    response != null ? response.getClass().getSimpleName() : "null");
            return sendSuccessResponse(response);
        } catch (RuntimeException ex) {
            logger.error("[GET /api/products] request failed | role={} categoryId={} page={} limit={}",
                    role, categoryId, page, limit, ex);
            throw ex;
        }
    }

    // POST /api/products
    @PostMapping
    // Later, replace supplierId and role header with: Cognito JWT extraction
    public ResponseEntity<Product> addProduct(
            @RequestBody ProductDto productDTO,
            @RequestHeader("X-USER-ID") Integer supplierId,
            @RequestHeader("X-USER-ROLE") String role) {
        logger.info("[POST /api/products] create product request received | supplierId={} role={}", supplierId, role);
        logger.debug("[POST /api/products] payload metadata | hasBody={}", productDTO != null);

        try {
            Product savedProduct = productService.addProduct(productDTO, supplierId, role);
            logger.info("[POST /api/products] product created successfully | productId={} supplierId={}",
                    savedProduct != null ? savedProduct.getId() : null, supplierId);
            return sendCreatedResponse(savedProduct);
        } catch (RuntimeException ex) {
            logger.error("[POST /api/products] create product failed | supplierId={} role={}", supplierId, role, ex);
            throw ex;
        }
    }

    @GetMapping("/categories")
    public List<Category> getAllCategories() {
        logger.info("[GET /api/products/categories] request received");
        try {
            List<Category> categories = productService.getCategories();
            logger.info("[GET /api/products/categories] request completed successfully | categoryCount={}",
                    categories != null ? categories.size() : 0);
            return categories;
        } catch (RuntimeException ex) {
            logger.error("[GET /api/products/categories] request failed", ex);
            throw ex;
        }
    }

    @GetMapping("/{productId}")
    public ResponseEntity<Product> getProductById(@PathVariable Integer productId) {
        logger.info("[GET /api/products/{}] request received", productId);
        try {
            Product product = productService.getProductById(productId);
            if (product == null) {
                logger.info("[GET /api/products/{}] product not found", productId);
                return sendNotFoundResponse();
            }
            logger.info("[GET /api/products/{}] request completed successfully", productId);
            logger.debug("[GET /api/products/{}] product metadata | supplierId={} categoryId={}",
                    productId, product.getSupplierId(), product.getCategoryId());
            return sendSuccessResponse(product);
        } catch (RuntimeException ex) {
            logger.error("[GET /api/products/{}] request failed", productId, ex);
            throw ex;
        }
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<String> deleteProductById(
            @PathVariable Integer productId,
            @RequestHeader("X-USER-ID") Integer supplierId,
            @RequestHeader("X-USER-ROLE") String role) {
        logger.info("[DELETE /api/products/{}] delete request received | supplierId={} role={}",
                productId, supplierId, role);
        try {
            productService.deleteProduct(productId, supplierId, role);
            logger.info("[DELETE /api/products/{}] delete completed", productId);
            return sendNotFoundResponse();
        } catch (RuntimeException ex) {
            logger.error("[DELETE /api/products/{}] delete failed | supplierId={} role={}",
                    productId, supplierId, role, ex);
            throw ex;
        }
    }

    @PatchMapping("/{productId}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Integer productId,
            @RequestBody UpdateProductDto updateProduct,
            @RequestHeader("X-USER-ID") Integer supplierId,
            @RequestHeader("X-USER-ROLE") String role) {
        logger.info("[PATCH /api/products/{}] update request received | supplierId={} role={}",
                productId, supplierId, role);
        logger.debug("[PATCH /api/products/{}] payload metadata | hasBody={}", productId, updateProduct != null);
        try {
            Product updated = productService.updateProduct(productId, supplierId, role, updateProduct);
            logger.info("[PATCH /api/products/{}] update completed successfully", productId);
            logger.debug("[PATCH /api/products/{}] updated product metadata | supplierId={} categoryId={}",
                    productId,
                    updated != null ? updated.getSupplierId() : null,
                    updated != null ? updated.getCategoryId() : null);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException ex) {
            logger.error("[PATCH /api/products/{}] update failed | supplierId={} role={}",
                    productId, supplierId, role, ex);
            throw ex;
        }
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<Product>> getSupplierProducts(
            @PathVariable Integer supplierId) {
        logger.info("[GET /api/products/supplier/{}] request received", supplierId);
        try {
            List<Product> products = productService.getProductsBySupplier(supplierId);
            logger.info("[GET /api/products/supplier/{}] request completed successfully | productCount={}",
                    supplierId, products != null ? products.size() : 0);
            return ResponseEntity.ok(products);
        } catch (RuntimeException ex) {
            logger.error("[GET /api/products/supplier/{}] request failed", supplierId, ex);
            throw ex;
        }

    }
}
