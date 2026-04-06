package com.example.productService.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity // if you want to get the table then u need to this entity annotation
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private Float price;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer quantity;

    @Column(name = "categoryid")
    private Integer categoryId;

    @Column(name = "supplierid")
    private Integer supplierId;

    @Enumerated(EnumType.STRING)
    private ProductStatus status;

    @Column(name = "imageurl")
    private String imageurl;

}
