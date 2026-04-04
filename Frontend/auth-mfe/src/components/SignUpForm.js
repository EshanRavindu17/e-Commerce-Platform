import React, { useState } from "react";
import FormField from "./FormField";
import { SIGNUP_FIELDS, INITIAL_SIGNUP_STATE } from "./constants";
import styles from "./SignUpForm.module.css";

const SignUpForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState(INITIAL_SIGNUP_STATE);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [step, setStep] = useState(1);

  const totalSteps = 2;

  const validateField = (name, value) => {
    const field = SIGNUP_FIELDS.find((f) => f.name === name);
    if (!field) return "";

    if (field.required && !value?.trim()) {
      return `${field.label} is required`;
    }

    if (name === "confirmPassword") {
      if (value !== formData.password) {
        return "Passwords do not match";
      }
      return "";
    }

    if (
      field.validation?.pattern &&
      value &&
      !field.validation.pattern.test(value)
    ) {
      return field.validation.message;
    }

    if (
      field.validation?.minLength &&
      value?.length < field.validation.minLength
    ) {
      return `${field.label} must be at least ${field.validation.minLength} characters`;
    }

    if (
      field.validation?.maxLength &&
      value?.length > field.validation.maxLength
    ) {
      return `${field.label} must not exceed ${field.validation.maxLength} characters`;
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

  const getFieldsForStep = () => {
    if (step === 1) {
      return ["firstName", "lastName", "email", "password", "confirmPassword"];
    }
    return ["userType", "address", "phone"];
  };

  const validateStep = () => {
    const fieldsToValidate = getFieldsForStep();
    const newErrors = {};
    let isValid = true;

    fieldsToValidate.forEach((fieldName) => {
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
      setTouched((prev) => ({
        ...prev,
        [fieldName]: true,
      }));
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      setSuccessMessage("Account created successfully!");
      setFormData(INITIAL_SIGNUP_STATE);
      setTouched({});
      setStep(1);

      setTimeout(() => {
        window.location.href = window.location.origin + "/login";
      }, 2000);
    } catch (error) {
      setErrors({
        submit: error.message || "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldsForCurrentStep = getFieldsForStep();
  const fieldsToRender = SIGNUP_FIELDS.filter((f) =>
    fieldsForCurrentStep.includes(f.name),
  );

  const getIconForField = (fieldName) => {
    const icons = {
      firstName: "👤",
      lastName: "👤",
      email: "✉️",
      password: "🔐",
      confirmPassword: "🔐",
      userType: "🏪",
      address: "📍",
      phone: "📱",
    };
    return icons[fieldName] || "";
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.formHeader}>
        <h1 className={styles.title}>Create Your Account</h1>
        <p className={styles.subtitle}>
          {step === 1 ? "Personal Information" : "Account Details"}
        </p>
        <div className={styles.progressBar}>
          <div
            className={styles.progress}
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {successMessage && (
        <div className={styles.successMessage}>{successMessage}</div>
      )}

      {errors.submit && (
        <div className={styles.errorMessage}>{errors.submit}</div>
      )}

      <div className={styles.fieldsContainer}>
        {fieldsToRender.map((field) => (
          <FormField
            key={field.name}
            {...field}
            value={formData[field.name]}
            onChange={handleFieldChange}
            onBlur={() => handleFieldBlur(field.name)}
            error={touched[field.name] ? errors[field.name] : ""}
            icon={getIconForField(field.name)}
          />
        ))}
      </div>

      {Object.keys(errors).some(
        (key) => key !== "submit" && errors[key] && touched[key],
      ) && (
        <div className={styles.validationMessage}>
          Please correct the errors above
        </div>
      )}

      <div className={styles.buttonGroup}>
        {step === 2 && (
          <button
            type="button"
            onClick={handleBack}
            className={styles.backBtn}
            disabled={isSubmitting}
          >
            Back
          </button>
        )}
        {step === 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className={styles.nextBtn}
            disabled={isSubmitting}
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </button>
        )}
      </div>

      <p className={styles.loginLink}>
        Already have an account?{" "}
        <button
          type="button"
          className={styles.loginLinkText}
          onClick={() =>
            (window.location.href = window.location.origin + "/login")
          }
        >
          Sign in here
        </button>
      </p>
    </form>
  );
};

export default SignUpForm;
