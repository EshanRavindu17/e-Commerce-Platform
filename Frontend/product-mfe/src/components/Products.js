import React, { useState, useCallback } from "react";
import ProductFilter from "./ProductFilter";
import ProductGallery from "./ProductGallery";
import styles from "./Products.module.css";

const Products = () => {
  const [filters, setFilters] = useState({
    activeCategory: "all",
    priceRanges: {},
    sortBy: "featured",
    searchTerm: "",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setFilters({
      activeCategory: "all",
      priceRanges: {},
      sortBy: "featured",
      searchTerm: "",
    });
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((event) => {
    const value = event.target.value;
    setFilters((prev) => ({
      ...prev,
      searchTerm: value,
    }));
    setCurrentPage(1);
  }, []);

  return (
    <div className={styles.productsPage}>
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>Discover our premium collection</p>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={filters.searchTerm || ""}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
            <span className={styles.searchHint}>Results update as you type</span>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <ProductFilter
            onFilterChange={handleFilterChange}
            onReset={handleReset}
            filters={filters}
          />
        </aside>

        <main className={styles.content}>
          <ProductGallery
            filters={filters}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </main>
      </div>
    </div>
  );
};

export default Products;
