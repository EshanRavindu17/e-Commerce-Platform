import React, { useState } from "react";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  const [imageError, setImageError] = useState(false);

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={styles.card}>
      {/* Badge */}
      {product.badge && (
        <span className={styles.badge} data-badge={product.badge.toLowerCase()}>
          {product.badge}
        </span>
      )}

      {/* Image Container */}
      <div className={styles.imageContainer}>
        {imageError ? (
          <div className={styles.placeholderImage}>
            <span className={styles.placeholderText}>
              {product.name.substring(0, 3).toUpperCase()}
            </span>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            className={styles.image}
            onError={handleImageError}
          />
        )}
        <div className={styles.overlay}>
          <button className={styles.addToCartBtn}>Add to Cart</button>
        </div>
      </div>

      {/* Product Info */}
      <div className={styles.info}>
        <h3 className={styles.name}>{product.name}</h3>

        {/* Rating */}
        <div className={styles.rating}>
          <div className={styles.stars}>
            {"★".repeat(Math.floor(product.rating))}
            {product.rating % 1 !== 0 && "½"}
          </div>
          <span className={styles.reviews}>({product.reviews})</span>
        </div>

        {/* Price */}
        <div className={styles.price}>
          <span className={styles.currentPrice}>
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice > product.price && (
            <>
              <span className={styles.originalPrice}>
                ${product.originalPrice.toFixed(2)}
              </span>
              <span className={styles.discount}>-{discount}%</span>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.wishlistBtn} aria-label="Add to Wishlist">
            ♡
          </button>
          <button className={styles.quickViewBtn}>Quick View</button>
        </div>
      </div>
    </div>
  );
}
