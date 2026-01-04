package com.example.productService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductDto {
    private String name;
    private float price;
    private String description;
    private Integer quantity;
    private Integer categoryId;
    private String imageurl;
}
