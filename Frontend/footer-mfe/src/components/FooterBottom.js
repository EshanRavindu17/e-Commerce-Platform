import React from "react";
import styles from "./FooterBottom.module.css";
import { BOTTOM_LINKS } from "./constants";

export default function FooterBottom() {
  const currentYear = new Date().getFullYear();

  return (
    <div className={styles.bottomFooter}>
      <div className={styles.bottomContainer}>
        <p className={styles.copyright}>
          © {currentYear} NexaGrid. All rights reserved.
        </p>
        <div className={styles.bottomLinks}>
          {BOTTOM_LINKS.map((link, index) => (
            <React.Fragment key={link.href}>
              <a href={link.href} className={styles.bottomLink}>
                {link.label}
              </a>
              {index < BOTTOM_LINKS.length - 1 && (
                <span className={styles.divider}>·</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
