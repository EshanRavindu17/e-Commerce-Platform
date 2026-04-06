import React, { useState } from "react";
import FormField from "./FormField";
import styles from "./LoginForm.module.css";

const LoginForm = ({ onSubmit, onForgotPassword }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateField = (name, value) => {
    if (name === "email") {
      if (!value?.trim()) {
        return "Email is required";
      }
      if (!validateEmail(value)) {
        return "Please enter a valid email address";
      }
      return "";
    }

    if (name === "password") {
      if (!value?.trim()) {
        return "Password is required";
      }
      if (value.length < 6) {
        return "Password must be at least 6 characters";
      }
      return "";
    }

    return "";
  };

  const handleFieldChange = ({ name, value }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleFieldBlur = (name) => {
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, formData[name]);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    let isValid = true;

    ["email", "password"].forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      const result = await onSubmit({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      const redirectPath = result?.redirectPath || "/customer";

      setSuccessMessage("Login successful! Redirecting...");
      setFormData({
        email: "",
        password: "",
        rememberMe: false,
      });
      setTouched({});

      setTimeout(() => {
        window.location.href = window.location.origin + redirectPath;
      }, 2000);
    } catch (error) {
      setErrors({
        submit: error.message || "Login failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.formHeader}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to your account</p>
      </div>

      {successMessage && (
        <div className={styles.successMessage}>{successMessage}</div>
      )}

      {errors.submit && (
        <div className={styles.errorMessage}>{errors.submit}</div>
      )}

      <div className={styles.fieldsContainer}>
        <FormField
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleFieldChange}
          onBlur={() => handleFieldBlur("email")}
          error={touched.email ? errors.email : ""}
          placeholder="hello@example.com"
          required
          icon="✉️"
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleFieldChange}
          onBlur={() => handleFieldBlur("password")}
          error={touched.password ? errors.password : ""}
          placeholder="••••••••"
          required
          icon="🔐"
        />
      </div>

      <div className={styles.options}>
        <div className={styles.rememberMe}>
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleCheckboxChange}
            className={styles.checkbox}
          />
          <label htmlFor="rememberMe" className={styles.checkboxLabel}>
            Remember me
          </label>
        </div>
        <button
          type="button"
          onClick={onForgotPassword}
          className={styles.forgotPassword}
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing In..." : "Sign In"}
      </button>

      <p className={styles.signupLink}>
        Don't have an account?{" "}
        <button
          type="button"
          className={styles.signupLinkText}
          onClick={() =>
            (window.location.href = window.location.origin + "/register")
          }
        >
          Create one
        </button>
      </p>
    </form>
  );
};

export default LoginForm;
