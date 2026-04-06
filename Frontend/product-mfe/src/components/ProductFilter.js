import React, { useEffect, useState } from "react";
import styles from "./ProductFilter.module.css";
import { PRICE_RANGES, SORT_OPTIONS } from "./constants";
import { fetchProductCategories } from "../services/bffProductApi";

export default function ProductFilter({ onFilterChange, filters = {} }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [priceRanges, setPriceRanges] = useState({});
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([
    { id: "all", label: "All Products", backendValue: "all" },
  ]);
  const [categoryError, setCategoryError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        const remoteCategories = await fetchProductCategories();
        if (!mounted) {
          return;
        }

        setCategoryError("");

        setCategories([
          { id: "all", label: "All Products", backendValue: "all" },
          ...remoteCategories,
        ]);
      } catch (error) {
        if (mounted) {
          console.error("Product categories fetch failed:", error);
          setCategoryError(error.message || "Failed to load categories.");
          setCategories([
            { id: "all", label: "All Products", backendValue: "all" },
          ]);
        }
      }
    };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setActiveCategory(filters.activeCategory || "all");
    setPriceRanges(filters.priceRanges || {});
    setSortBy(filters.sortBy || "featured");
  }, [filters.activeCategory, filters.priceRanges, filters.sortBy]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    onFilterChange?.({ activeCategory: categoryId, sortBy });
  };

  const handlePriceChange = (rangeId) => {
    const newRanges = { ...priceRanges, [rangeId]: !priceRanges[rangeId] };
    setPriceRanges(newRanges);
    onFilterChange?.({ activeCategory, priceRanges: newRanges, sortBy });
  };

  const handleSortChange = (sortId) => {
    setSortBy(sortId);
    onFilterChange?.({ activeCategory, sortBy: sortId, priceRanges });
  };

  return (
    <aside className={styles.filterContainer}>
      {/* Mobile Toggle */}
      <button
        className={styles.mobileToggle}
        onClick={() => setShowFilters(!showFilters)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M3 6h18M3 12h18M3 18h18"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
        Filters
      </button>

      {/* Filters Panel */}
      <div className={`${styles.filters} ${showFilters ? styles.active : ""}`}>
        {/* Sort */}
        <div className={styles.filterSection}>
          <h4 className={styles.filterTitle}>Sort By</h4>
          <div className={styles.sortOptions}>
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.id}
                className={`${styles.sortOption} ${
                  sortBy === option.id ? styles.active : ""
                }`}
                onClick={() => handleSortChange(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className={styles.filterSection}>
          <h4 className={styles.filterTitle}>Categories</h4>
          <div className={styles.categoryList}>
            {categories.map((category) => (
              <label key={category.id} className={styles.categoryItem}>
                <input
                  type="radio"
                  name="category"
                  value={category.id}
                  checked={activeCategory === category.id}
                  onChange={() => handleCategoryChange(category.id)}
                  className={styles.radio}
                />
                <span className={styles.categoryLabel}>{category.label}</span>
              </label>
            ))}
          </div>
          {categoryError ? (
            <p className={styles.emptyText}>{categoryError}</p>
          ) : null}
        </div>

        {/* Price Range */}
        <div className={styles.filterSection}>
          <h4 className={styles.filterTitle}>Price Range</h4>
          <div className={styles.priceList}>
            {PRICE_RANGES.map((range) => (
              <label key={range.id} className={styles.priceItem}>
                <input
                  type="checkbox"
                  checked={priceRanges[range.id] || false}
                  onChange={() => handlePriceChange(range.id)}
                  className={styles.checkbox}
                />
                <span className={styles.priceLabel}>{range.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <button
          className={styles.resetBtn}
          onClick={() => {
            setActiveCategory("all");
            setPriceRanges({});
            setSortBy("featured");
            onFilterChange?.({
              activeCategory: "all",
              sortBy: "featured",
              priceRanges: {},
            });
          }}
        >
          Reset Filters
        </button>
      </div>
    </aside>
  );
}
