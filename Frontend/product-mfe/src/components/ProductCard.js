import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product, onAddToCart = async () => {} }) {
  const [imageError, setImageError] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const safePrice = Number(product.price || 0);
  const safeOriginalPrice = Number(product.originalPrice || safePrice);
  const hasDiscount = safeOriginalPrice > safePrice && safeOriginalPrice > 0;

  const discount = hasDiscount
    ? Math.round(((safeOriginalPrice - safePrice) / safeOriginalPrice) * 100)
    : 0;

  const handleImageError = () => {
    setImageError(true);
  };

  const openQuickView = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const closeQuickView = () => {
    setIsQuickViewOpen(false);
  };

  const handleAddToCart = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      setIsAddingToCart(true);
      await onAddToCart(product);
    } finally {
      setIsAddingToCart(false);
    }
  };

  useEffect(() => {
    if (!isQuickViewOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeQuickView();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isQuickViewOpen]);

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
          <button
            className={styles.addToCartBtn}
            onClick={handleAddToCart}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </button>
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
          <span className={styles.currentPrice}>${safePrice.toFixed(2)}</span>
          {hasDiscount && (
            <>
              <span className={styles.originalPrice}>
                ${safeOriginalPrice.toFixed(2)}
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
          <button className={styles.quickViewBtn} onClick={openQuickView}>
            Quick View
          </button>
        </div>
      </div>

      {isQuickViewOpen && typeof document !== "undefined"
        ? createPortal(
            <div className={styles.quickViewBackdrop} onClick={closeQuickView}>
              <div
                className={styles.quickViewModal}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  className={styles.quickViewCloseBtn}
                  onClick={closeQuickView}
                  aria-label="Close quick view"
                >
                  x
                </button>

                <div className={styles.quickViewContent}>
                  <div className={styles.quickViewImageWrap}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className={styles.quickViewImage}
                    />
                  </div>

                  <div className={styles.quickViewInfo}>
                    <h4 className={styles.quickViewTitle}>{product.name}</h4>
                    <div className={styles.quickViewPriceRow}>
                      <span className={styles.currentPrice}>
                        ${safePrice.toFixed(2)}
                      </span>
                      {hasDiscount ? (
                        <span className={styles.originalPrice}>
                          ${safeOriginalPrice.toFixed(2)}
                        </span>
                      ) : null}
                      {hasDiscount ? (
                        <span className={styles.discount}>-{discount}%</span>
                      ) : null}
                    </div>
                    <p className={styles.quickViewDescription}>
                      {product.description ||
                        "No product description available."}
                    </p>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
