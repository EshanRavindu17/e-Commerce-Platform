import React from "react";
import styles from "./FooterSupport.module.css";
import { SUPPORT_LINKS } from "./constants";

export default function FooterSupport() {
  return (
    <div className={styles.column}>
      <h4 className={styles.columnTitle}>Support</h4>
      <ul className={styles.linkList}>
        {SUPPORT_LINKS.map((link) => (
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
