package com.example.cartService.exception;

public class CartNotFoundException extends RuntimeException {
    public CartNotFoundException() {
        super("Cart Not Found");
    }
}
