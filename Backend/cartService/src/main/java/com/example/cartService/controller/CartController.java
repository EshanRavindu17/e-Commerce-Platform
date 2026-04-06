package com.example.cartService.controller;

import com.example.cartService.dto.CartDto;
import com.example.cartService.dto.CartItemDto;
import com.example.cartService.entity.Cart;
import com.example.cartService.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/carts")
public class CartController {
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/{cartId}")
    public ResponseEntity<Cart> getCartById(
            @PathVariable Integer cartId,
            @RequestHeader(value = "X-USER-ID", required = false) Integer userId,
            @RequestHeader(value = "X-USER-ROLE", required = false) String role) {
        return ResponseEntity.ok(cartService.getCartById(cartId, userId, role));
    }

    @DeleteMapping("/{cartId}")
    public ResponseEntity<Void> deleteCart(
            @PathVariable Integer cartId,
            @RequestHeader("X-USER-ID") Integer userId,
            @RequestHeader("X-USER-ROLE") String role) {
        cartService.deleteCartById(cartId, userId, role);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{cartId}/items")
    public ResponseEntity<Cart> addItemToCart(
            @PathVariable Integer cartId,
            @RequestBody CartDto cartDto,
            @RequestHeader("X-USER-ID") Integer userId,
            @RequestHeader("X-USER-ROLE") String role) {
        Cart cart = cartService.addItemToCart(cartId, cartDto, role, userId);
        return ResponseEntity.ok(cart);
    }

    @PatchMapping("/{cartId}/items/{itemId}")
    public ResponseEntity<Void> updateCartItemQuantity(
            @PathVariable Integer cartId,
            @PathVariable Integer itemId,
            @RequestBody CartItemDto cartItemDto,
            @RequestHeader("X-USER-ROLE") String role,
            @RequestHeader(value = "X-USER-ID", required = false) Integer userId) {
        cartService.updateCartItem(cartId, itemId, cartItemDto.getQuantity(), role, userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{cartId}/items/{itemId}")
    public ResponseEntity<Void> deleteCartItem(
            @PathVariable Integer cartId,
            @PathVariable Integer itemId,
            @RequestHeader("X-USER-ROLE") String role,
            @RequestHeader(value = "X-USER-ID", required = false) Integer userId) {
        cartService.deleteCartItem(cartId, itemId, role, userId);
        return ResponseEntity.noContent().build();
    }
}
