import React from "react";
import styles from "./FooterBrand.module.css";
import logo from "../../../images/nexagrid-logo.png";
import { SOCIAL_LINKS } from "./constants";

export default function FooterBrand() {
  return (
    <div className={styles.column}>
      <a href="/" className={styles.brandLogo}>
        <img src={logo} alt="NexaGrid" className={styles.logoImg} />
      </a>
      <p className={styles.description}>
        Your trusted e-commerce platform for premium products and exceptional
        service.
      </p>
      <div className={styles.socialLinks}>
        {SOCIAL_LINKS.map((social) => (
          <a
            key={social.name}
            href={social.href}
            className={styles.socialLink}
            aria-label={social.name}
            title={social.name}
          >
            {social.icon}
          </a>
        ))}
      </div>
    </div>
  );
}
