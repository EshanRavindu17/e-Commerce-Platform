package com.example.productService.controller;

import com.example.productService.dto.ProductDTO;
import com.example.productService.entity.Category;
import com.example.productService.entity.Product;
import com.example.productService.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
//@Tag(name = "Product Service")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    //If you want to send your own status code then we want return data as well as status.To do that we use reponse entity
    // we can write the the same method using response entity

//    @GetMapping
//    public ResponseEntity<List<Product>> getAllApprovedProducts() {
//        return new ResponseEntity<>(productService.getApprovedProducts(), HttpStatus.OK);
//    }

    //GET /api/products
    @GetMapping
    public List<Product> getAllApprovedProducts() {
        return productService.getApprovedProducts();
    }


    //POST /api/products
    @PostMapping
    // Later, replace supplierId and role header with: Cognito JWT extraction
    public ResponseEntity<Product> addProduct(
            @RequestBody ProductDTO productDTO,
            @RequestHeader("USER-ID") Integer supplierId,
            @RequestHeader("USER-ROLE") String role
    ) {
        if ("SUPPLIER".equals(role)) {
            Product saveProduct =  productService.addProduct(productDTO, supplierId);
            return new ResponseEntity<>(saveProduct, HttpStatus.CREATED);
        }
        else{
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

    }

    @GetMapping("/categories")
    public List<Category> getAllCategories() {
        return productService.getCategories();
    }

    @GetMapping("/{productId}")
    public Product getProductById(@PathVariable Integer productId) {
        return productService.getProductById(productId);
    }
}
