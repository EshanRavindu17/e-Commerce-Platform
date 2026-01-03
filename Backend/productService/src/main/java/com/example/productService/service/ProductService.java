package com.example.productService.service;

import com.example.productService.dto.ProductDTO;
import com.example.productService.entity.Category;
import com.example.productService.entity.Product;
import com.example.productService.entity.ProductStatus;
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
    }


    //POST /api/products
    public Product addProduct(ProductDTO productDTO, Integer supplierId) {
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
        return productRepository.findById(productId).get();
    }
}
