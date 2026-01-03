package com.example.productService.repository;

import com.example.productService.entity.Product;
import com.example.productService.entity.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// first param is the class that we are working with and the second param is primary key in this case Integer
//because product entity has an id which type is integer.

public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findByStatus(ProductStatus status);
}
