import React, { useMemo } from "react";
import ProductCard from "./ProductCard";
import { SAMPLE_PRODUCTS } from "./constants";
import styles from "./ProductGallery.module.css";

const PRODUCTS_PER_PAGE = 20;

const ProductGallery = ({
  filters = {
    activeCategory: "all",
    priceRanges: {},
    sortBy: "featured",
  },
  currentPage = 1,
  onPageChange = () => {},
}) => {
  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let products = [...SAMPLE_PRODUCTS];

    // Filter by category
    if (filters.activeCategory && filters.activeCategory !== "all") {
      products = products.filter(
        (p) =>
          p.category.toLowerCase() === filters.activeCategory.toLowerCase(),
      );
    }

    // Filter by search term
    const normalizedSearch = (filters.searchTerm || "").trim().toLowerCase();
    if (normalizedSearch) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(normalizedSearch) ||
          p.category.toLowerCase().includes(normalizedSearch),
      );
    }

    // Filter by price ranges
    const selectedPrices = Object.entries(filters.priceRanges || {})
      .filter(([_, selected]) => selected)
      .map(([range]) => range);

    if (selectedPrices.length > 0) {
      products = products.filter((p) => {
        return selectedPrices.some((range) => {
          if (range === "$0-50") return p.price <= 50;
          if (range === "$50-100") return p.price > 50 && p.price <= 100;
          if (range === "$100-500") return p.price > 100 && p.price <= 500;
          if (range === "$500+") return p.price > 500;
          return false;
        });
      });
    }

    // Sort products
    switch (filters.sortBy) {
      case "newest":
        products.sort((a, b) => (b.isNew ? 1 : -1));
        break;
      case "price-low":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        products.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        products.sort((a, b) => b.rating - a.rating);
        break;
      case "bestselling":
        products.sort((a, b) => b.reviews - a.reviews);
        break;
      case "featured":
      default:
        // Keep original order
        break;
    }

    return products;
  }, [filters]);

  if (filteredProducts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <svg
          className={styles.emptyIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className={styles.emptyTitle}>No Products Found</h3>
        <p className={styles.emptyText}>
          Try adjusting your filters to find what you're looking for
        </p>
      </div>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const productPage = filteredProducts.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className={styles.galleryContainer}>
      <div className={styles.header}>
        <p className={styles.resultCount}>
          Showing <strong>{productPage.length}</strong> of{" "}
          <strong>{filteredProducts.length}</strong> product
          {filteredProducts.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className={styles.grid}>
        {productPage.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationBtn}
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>

          <div className={styles.pageInfo}>
            <span>Page</span>
            <select
              value={currentPage}
              onChange={(e) => {
                onPageChange(Number(e.target.value));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={styles.pageSelect}
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <option key={page} value={page}>
                    {page} of {totalPages}
                  </option>
                ),
              )}
            </select>
          </div>

          <button
            className={styles.paginationBtn}
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
