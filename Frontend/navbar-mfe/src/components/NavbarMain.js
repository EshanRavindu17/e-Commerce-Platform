import React from "react";
import styles from "./NavbarMain.module.css";
import logo from "../../../images/nexagrid-logo.png";

export default function NavbarMain({ cartCount = 0 }) {
  return (
    <div className={styles.mainBar}>
      <div className={styles.inner}>
        {/* Logo */}
        <a href="/" className={styles.logoLink}>
          <img src={logo} alt="NexaGrid" className={styles.logoImg} />
        </a>

        {/* Icons */}
        <div className={styles.iconGroup}>
          {/* Wishlist */}
          <button className={styles.iconBtn} aria-label="Wishlist">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              />
            </svg>
          </button>

          {/* Cart */}
          <a href="/cart" className={styles.iconBtn} aria-label="Cart">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm6 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
              />
            </svg>
            {cartCount > 0 && (
              <span className={styles.badge}>{cartCount}</span>
            )}
          </a>

          {/* Auth Links */}
          <a href="/login" className={styles.authLink}>
            Login
          </a>
          <a href="/register" className={styles.authLinkPrimary}>
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}