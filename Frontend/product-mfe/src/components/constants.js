export const PRICE_RANGES = [
  { id: "0-50", label: "Under $50", min: 0, max: 50 },
  { id: "50-100", label: "$50 - $100", min: 50, max: 100 },
  { id: "100-500", label: "$100 - $500", min: 100, max: 500 },
  { id: "500+", label: "$500+", min: 500, max: Infinity },
];

export const SORT_OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "rating", label: "Top Rated" },
  { id: "bestselling", label: "Bestselling" },
];
