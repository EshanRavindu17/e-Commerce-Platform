package com.example.productService.mapper;

import com.example.productService.dto.ProductDto;
import com.example.productService.dto.UpdateProductDto;
import com.example.productService.entity.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public Product toEntity(ProductDto productDto) {
        Product product = new Product();
        product.setName(productDto.getName());
        product.setPrice(productDto.getPrice());
        product.setDescription(productDto.getDescription());
        product.setQuantity(productDto.getQuantity());
        product.setCategoryId(productDto.getCategoryId());
        product.setImageurl(productDto.getImageurl());
        return product;
    }

    public void updateEntity(UpdateProductDto productDto, Product product) {
        if (productDto.getName() != null) {
            product.setName(productDto.getName());
        }
        if (productDto.getPrice() != null) {
            product.setPrice(productDto.getPrice());
        }
        if (productDto.getCategoryId() != null) {
            product.setCategoryId(productDto.getCategoryId());
        }
        if (productDto.getStatus() != null) {
            product.setStatus(productDto.getStatus());
        }
        if (productDto.getDescription() != null) {
            product.setDescription(productDto.getDescription());
        }
        if (productDto.getQuantity() != null) {
            product.setQuantity(productDto.getQuantity());
        }
        if (productDto.getImageurl() != null) {
            product.setImageurl(productDto.getImageurl());
        }

    }
}
