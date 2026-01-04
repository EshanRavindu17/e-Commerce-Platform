package com.example.productService.service;

import com.example.productService.dto.ProductDto;
import com.example.productService.dto.UpdateProductDto;
import com.example.productService.entity.Category;
import com.example.productService.entity.Product;
import com.example.productService.entity.ProductStatus;
import com.example.productService.exception.ProductNotFoundException;
import com.example.productService.exception.UnauthorizedException;
import com.example.productService.repository.CategoryRepository;
import com.example.productService.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    //GET /api/products
    public List<Product> getApprovedProducts() {
        return productRepository.findByStatus(ProductStatus.APPROVED);
//        return productRepository.findByStatus(ProductStatus.PENDING);
    }


    //POST /api/products
    public Product addProduct(ProductDto productDTO, Integer supplierId, String role) {
        if (!"SUPPLIER".equals(role)) {
            throw new UnauthorizedException("Only supplier can add products");
        }
        Product product = new Product();
        product.setName(productDTO.getName());
        product.setPrice(productDTO.getPrice());
        product.setDescription(productDTO.getDescription());
        product.setQuantity(productDTO.getQuantity());
        product.setCategoryId(productDTO.getCategoryId());
        product.setImageurl(productDTO.getImageurl());

        product.setSupplierId(supplierId);
        product.setStatus(ProductStatus.PENDING);

        return productRepository.save(product);
    }

    public List<Category> getCategories() {
        return categoryRepository.findAll();
    }

    public Product getProductById(Integer productId) {
        return productRepository.findById(productId)
                .orElseThrow(ProductNotFoundException::new);
    }

    public void deleteProduct(Integer productId, Integer supplierId, String role) {

        Product product = productRepository.findById(productId)
                .orElseThrow(ProductNotFoundException::new);

        if (!"SUPPLIER".equals(role)) {
            throw new UnauthorizedException("Only supplier can delete the product");
        }

        if (!product.getSupplierId().equals(supplierId)) {
            throw new RuntimeException("Not product owner");
        }

        productRepository.deleteById(productId);
    }

    public Product updateProduct(Integer productId, Integer supplierId, String role, UpdateProductDto updateProduct) {
        if (!"SUPPLIER".equals(role)) {
            throw new UnauthorizedException("Only supplier can update product");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(ProductNotFoundException::new);

        if (!product.getSupplierId().equals(supplierId)) {
            throw new UnauthorizedException("Not product owner");
        }

        // Update allowed fields only
        if (updateProduct.getDescription() != null)
            product.setDescription(updateProduct.getDescription());

        if (updateProduct.getImageurl() != null)
            product.setImageurl(updateProduct.getImageurl());


        if (updateProduct.getQuantity() != null)
            product.setQuantity(updateProduct.getQuantity());

        return productRepository.save(product);
    }

    public List<Product> getProductsBySupplier(Integer supplierId) {
        return productRepository.findBySupplierId(supplierId);
    }
}
