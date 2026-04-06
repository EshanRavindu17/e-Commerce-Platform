package com.example.productService.service;

import com.example.productService.dto.ProductDto;
import com.example.productService.dto.UpdateProductDto;
import com.example.productService.entity.Category;
import com.example.productService.entity.Product;
import com.example.productService.entity.ProductStatus;
import com.example.productService.exception.ProductNotFoundException;
import com.example.productService.exception.UnauthorizedException;
import com.example.productService.mapper.ProductMapper;
import com.example.productService.repository.CategoryRepository;
import com.example.productService.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductServiceImpl.class);

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    public ProductServiceImpl(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.productMapper = productMapper;
    }

    @Override
    public Page<Product> getProducts(
            Integer categoryId,
            String name,
            String status,
            int page,
            int limit,
            String sortBy,
            String sortOrder,
            String role) {
        logger.info("Fetching products...");

        Sort sort = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page - 1, limit, sort);

        List<ProductStatus> statusList = null;

        if (status != null && !status.isBlank()) {
            statusList = Arrays.stream(status.split(","))
                    .map(String::trim)
                    .map(String::toUpperCase)
                    .filter(s -> {
                        try {
                            ProductStatus.valueOf(s);
                            return true;
                        } catch (Exception e) {
                            logger.warn("Invalid status: {}", s);
                            return false;
                        }
                    })
                    .map(ProductStatus::valueOf)
                    .toList();
        }

        if (statusList == null && "CUSTOMER".equals(role)) {
            statusList = List.of(ProductStatus.APPROVED);
        }

        Page<Product> result;

        if (statusList != null && !statusList.isEmpty()) {
            result = productRepository.findProductsWithStatus(
                    categoryId,
                    name,
                    statusList,
                    pageable);
        } else {
            result = productRepository.findProducts(
                    categoryId,
                    name,
                    pageable);
        }

        logger.info("Fetched {} products", result.getTotalElements());
        return result;
    }

    @Override
    public Product addProduct(ProductDto productDto, Integer supplierId, String role) {
        if (!"SUPPLIER".equals(role)) {
            throw new UnauthorizedException("Only supplier can add products");
        }

        Product product = productMapper.toEntity(productDto);
        product.setSupplierId(supplierId);
        product.setStatus(ProductStatus.PENDING);

        return productRepository.save(product);
    }

    @Override
    public List<Category> getCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public Product getProductById(Integer productId) {
        return productRepository.findById(productId)
                .orElseThrow(ProductNotFoundException::new);
    }

    @Override
    public void deleteProduct(Integer productId, Integer supplierId, String role) {
        Product product = productRepository.findById(productId)
                .orElseThrow(ProductNotFoundException::new);

        if (!"SUPPLIER".equals(role)) {
            throw new UnauthorizedException("Only supplier can delete the product");
        }

        if (!product.getSupplierId().equals(supplierId)) {
            throw new UnauthorizedException("Not product owner");
        }

        productRepository.deleteById(productId);
    }

    @Override
    public Product updateProduct(
            Integer productId,
            Integer supplierId,
            String role,
            UpdateProductDto updateProduct) {
        String normalizedRole = role == null ? "" : role.trim().toUpperCase();

        Product product = productRepository.findById(productId)
                .orElseThrow(ProductNotFoundException::new);

        if ("STEWARD".equals(normalizedRole) || "DATASTEWARD".equals(normalizedRole)) {
            if (updateProduct == null || updateProduct.getStatus() == null) {
                throw new UnauthorizedException("Steward can only update product status");
            }

            product.setStatus(updateProduct.getStatus());
            return productRepository.save(product);
        }

        if (!"SUPPLIER".equals(normalizedRole)) {
            throw new UnauthorizedException("Only supplier can update the product");
        }

        if (!product.getSupplierId().equals(supplierId)) {
            throw new UnauthorizedException("Not product owner");
        }

        productMapper.updateEntity(updateProduct, product);
        return productRepository.save(product);
    }

    @Override
    public List<Product> getProductsBySupplier(Integer supplierId) {
        return productRepository.findBySupplierId(supplierId);
    }
}