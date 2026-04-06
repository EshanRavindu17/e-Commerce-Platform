package com.example.productService.dto;

import com.example.productService.entity.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProductDto {
    private String name;
    private Float price;
    private Integer categoryId;
    private ProductStatus status;
    private String description;
    private Integer quantity;
    private String imageurl;
}
