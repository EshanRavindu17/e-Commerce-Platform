import React from "react";
import styles from "./FooterQuickLinks.module.css";
import { QUICK_LINKS } from "./constants";

export default function FooterQuickLinks() {
  return (
    <div className={styles.column}>
      <h4 className={styles.columnTitle}>Quick Links</h4>
      <ul className={styles.linkList}>
        {QUICK_LINKS.map((link) => (
          <li key={link.href}>
            <a href={link.href} className={styles.footerLink}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
