package com.example.cartService.service;

import com.example.cartService.dto.CartDto;
import com.example.cartService.entity.Cart;
import com.example.cartService.entity.CartItem;
import com.example.cartService.exception.CartItemNotFoundException;
import com.example.cartService.exception.CartNotFoundException;
import com.example.cartService.exception.UnauthorizedException;
import com.example.cartService.repository.CartItemRepository;
import com.example.cartService.repository.CartRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
    }

    private Cart findCustomerCartByUserId(Integer userId) {
        if (userId == null) {
            throw new UnauthorizedException("Missing user identity");
        }

        return cartRepository.findByUserId(userId)
                .orElseThrow(CartNotFoundException::new);
    }

    public Cart getCartById(Integer cartId, Integer userId, String role) {
        if ("CUSTOMER".equals(role) && userId != null) {
            return findCustomerCartByUserId(userId);
        }

        return cartRepository.findById(cartId)
                .orElseThrow(CartNotFoundException::new);
    }

    public void deleteCartById(Integer cartId, Integer userId, String role) {
        if (!"CUSTOMER".equals(role)) {
            throw new UnauthorizedException("Only customer can delete cart");
        }

        Cart cart = findCustomerCartByUserId(userId);

        cartRepository.delete(cart);
    }

    @Transactional
    public Cart addItemToCart(Integer cartId, CartDto cartDto, String role, Integer userId) {
        if (!"CUSTOMER".equals(role)) {
            throw new UnauthorizedException("Only customer can add items to cart");
        }

        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUserId(userId);
                    return cartRepository.save(newCart);
                });

        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductId(
                cart.getId(),
                cartDto.getProductId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + cartDto.getQuantity());
            cartItemRepository.save(item);
        } else {
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setProductId(cartDto.getProductId());
            item.setQuantity(cartDto.getQuantity());
            cartItemRepository.save(item);
        }
        return cart;

    }

    public void updateCartItem(Integer cartId, Integer itemId, Integer quantity, String role, Integer userId) {
        if (!"CUSTOMER".equals(role)) {
            throw new UnauthorizedException("Only customers can update cart items");
        }

        Cart cart = findCustomerCartByUserId(userId);

        CartItem cartItem = cartItemRepository.findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() -> new CartItemNotFoundException("Cart item not found"));

        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);
    }

    public void deleteCartItem(Integer cartId, Integer itemId, String role, Integer userId) {
        if (!"CUSTOMER".equals(role)) {
            throw new UnauthorizedException("Only customers can delete cart items");
        }

        Cart cart = findCustomerCartByUserId(userId);

        CartItem cartItem = cartItemRepository.findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() -> new CartItemNotFoundException("Cart item not found"));

        cartItemRepository.delete(cartItem);
    }
}
