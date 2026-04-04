import React from "react";
import styles from "./NavbarLinks.module.css";
import { NAV_LINKS } from "./constants";

export default function NavbarLinks({ activePath = "/" }) {
  return (
    <div className={styles.linksBar}>
      <div className={styles.inner}>
        {/* All Categories button */}
        {/* <button className={styles.categoriesBtn}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          All Categories
        </button> */}

        {/* Nav links */}
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`${styles.link} ${
              activePath === link.href ? styles.active : ""
            }`}
          >
            {link.label}
          </a>
        ))}

        <div className={styles.spacer} />
      </div>
    </div>
  );
}
