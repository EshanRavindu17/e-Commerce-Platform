import React from "react";
import LoginForm from "./LoginForm";
import styles from "./Login.module.css";
import {
  getPostLoginPath,
  hydrateUserIdentity,
  login,
} from "../services/bffAuthApi";

const Login = () => {
  const handleLogin = async (formData) => {
    const token = await login(formData);
    await hydrateUserIdentity(token);
    const redirectPath = await getPostLoginPath(token);
    return {
      success: true,
      message: "Login successful!",
      redirectPath,
    };
  };

  const handleForgotPassword = () => {
    alert("Forgot password flow - To be implemented");
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Welcome to NexaGrid</h1>
          <p className={styles.subtitle}>Your trusted e-commerce platform</p>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.features}>
            <h2 className={styles.featuresTitle}>Why Login?</h2>
            <ul className={styles.featuresList}>
              <li className={styles.featureItem}>
                <span className={styles.featureIcon}>📦</span>
                <div>
                  <strong>Track Your Orders</strong>
                  <p>Real-time updates on all your purchases</p>
                </div>
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureIcon}>💾</span>
                <div>
                  <strong>Save Preferences</strong>
                  <p>Personalized shopping experience</p>
                </div>
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureIcon}>🔒</span>
                <div>
                  <strong>Secure Payments</strong>
                  <p>Protected transactions & saved methods</p>
                </div>
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureIcon}>⭐</span>
                <div>
                  <strong>Wishlist & Favorites</strong>
                  <p>Save items for later purchases</p>
                </div>
              </li>
              <li className={styles.featureItem}>
                <span className={styles.featureIcon}>🎁</span>
                <div>
                  <strong>Exclusive Rewards</strong>
                  <p>Earn points on every purchase</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.content}>
          <LoginForm
            onSubmit={handleLogin}
            onForgotPassword={handleForgotPassword}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
