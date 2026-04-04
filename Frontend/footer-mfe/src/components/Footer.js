import React from "react";
import styles from "./Footer.module.css";
import FooterBrand from "./FooterBrand";
import FooterQuickLinks from "./FooterQuickLinks";
import FooterSupport from "./FooterSupport";
import FooterNewsletter from "./FooterNewsletter";
import FooterBottom from "./FooterBottom";

/**
 * NexaGrid Enterprise Footer
 *
 * Composed of:
 * - FooterBrand: Company branding, description, and social links
 * - FooterQuickLinks: Quick navigation links
 * - FooterSupport: Support and help links
 * - FooterNewsletter: Email subscription
 * - FooterBottom: Copyright and legal links
 */
export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Main Footer Content */}
      <div className={styles.mainFooter}>
        <div className={styles.container}>
          <FooterBrand />
          <FooterQuickLinks />
          <FooterSupport />
          <FooterNewsletter />
        </div>
      </div>

      {/* Bottom Footer */}
      <FooterBottom />
    </footer>
  );
}
