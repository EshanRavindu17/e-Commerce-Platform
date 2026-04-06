import React from "react";
import SignUpForm from "./SignUpForm";
import styles from "./SignUp.module.css";
import { register } from "../services/bffAuthApi";

const SignUp = () => {
  console.log("[Auth MFE] SignUp component rendering");

  const handleSignUp = async (formData) => {
    const payload = {
      ...formData,
      userType: String(formData.userType || "customer").toUpperCase(),
    };

    await register(payload);
    return { success: true, message: "Account created successfully!" };
  };

  return (
    <div className={styles.signupPage}>
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Join NexaGrid Today</h1>
          <p className={styles.subtitle}>
            Become part of our growing community
          </p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.benefits}>
            <h2 className={styles.benefitsTitle}>Why Join Us?</h2>
            <ul className={styles.benefitsList}>
              <li className={styles.benefitItem}>
                <span className={styles.benefitIcon}>🛍️</span>
                <div>
                  <strong>Shop Premium Products</strong>
                  <p>Access curated items from trusted sellers</p>
                </div>
              </li>
              <li className={styles.benefitItem}>
                <span className={styles.benefitIcon}>🔒</span>
                <div>
                  <strong>Secure & Safe</strong>
                  <p>Encrypted transactions with buyer protection</p>
                </div>
              </li>
              <li className={styles.benefitItem}>
                <span className={styles.benefitIcon}>🚀</span>
                <div>
                  <strong>Grow Your Business</strong>
                  <p>Become a supplier and reach new customers</p>
                </div>
              </li>
              <li className={styles.benefitItem}>
                <span className={styles.benefitIcon}>💰</span>
                <div>
                  <strong>Best Prices</strong>
                  <p>Competitive rates with regular promotions</p>
                </div>
              </li>
              <li className={styles.benefitItem}>
                <span className={styles.benefitIcon}>📞</span>
                <div>
                  <strong>24/7 Support</strong>
                  <p>Expert help whenever you need it</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.content}>
          <SignUpForm onSubmit={handleSignUp} />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
