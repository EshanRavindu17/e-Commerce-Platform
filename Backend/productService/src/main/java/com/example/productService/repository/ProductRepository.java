package com.example.productService.repository;

import com.example.productService.entity.Product;
import com.example.productService.entity.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

// first param is the class that we are working with and the second param is primary key in this case Integer
//because product entity has an id which type is integer.

public interface ProductRepository extends JpaRepository<Product, Integer> {
    @Query("""
        SELECT p FROM Product p 
        WHERE (:categoryId IS NULL OR p.categoryId = :categoryId) 
        AND (:name IS NULL OR :name = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')))
    """)
    Page<Product> findProducts(
            @Param("categoryId") Integer categoryId,
            @Param("name") String name,
            Pageable pageable);

    @Query("""
        SELECT p FROM Product p 
        WHERE (:categoryId IS NULL OR p.categoryId = :categoryId) 
        AND (:name IS NULL OR :name = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%')))
        AND p.status IN :statuses
    """)
    Page<Product> findProductsWithStatus(
            @Param("categoryId") Integer categoryId,
            @Param("name") String name,
            @Param("statuses") List<ProductStatus> statuses,
            Pageable pageable
    );

    List<Product> findBySupplierId(Integer supplierId);
}
