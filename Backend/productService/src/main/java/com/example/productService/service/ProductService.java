package com.example.productService.service;

import com.example.productService.dto.ProductDto;
import com.example.productService.dto.UpdateProductDto;
import com.example.productService.entity.Category;
import com.example.productService.entity.Product;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ProductService {

    Page<Product> getProducts(
            Integer categoryId,
            String name,
            String status,
            int page,
            int limit,
            String sortBy,
            String sortOrder,
            String role
    );

    Product addProduct(ProductDto productDto, Integer supplierId, String role);

    List<Category> getCategories();

    Product getProductById(Integer productId);

    void deleteProduct(Integer productId, Integer supplierId, String role);

    Product updateProduct(
            Integer productId,
            Integer supplierId,
            String role,
            UpdateProductDto updateProduct
    );

    List<Product> getProductsBySupplier(Integer supplierId);
}
