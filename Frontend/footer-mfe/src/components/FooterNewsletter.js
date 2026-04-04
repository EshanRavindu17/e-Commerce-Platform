import React, { useState } from "react";
import styles from "./FooterNewsletter.module.css";

export default function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <div className={styles.column}>
      <h4 className={styles.columnTitle}>Stay Updated</h4>
      <p className={styles.newsletterDesc}>
        Subscribe to get special offers and updates
      </p>
      <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.emailInput}
          required
        />
        <button type="submit" className={styles.subscribeBtn}>
          Subscribe
        </button>
      </form>
      {subscribed && (
        <p className={styles.successMessage}>✓ Thanks for subscribing!</p>
      )}
    </div>
  );
}
