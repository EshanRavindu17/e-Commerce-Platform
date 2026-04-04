import React from "react";
import styles from "./FormField.module.css";

const FormField = ({
  label,
  name,
  type,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required,
  options,
  icon,
}) => {
  const handleChange = (e) => {
    onChange({ name, value: e.target.value });
  };

  return (
    <div className={styles.fieldGroup}>
      <label htmlFor={name} className={styles.label}>
        {icon && <span className={styles.icon}>{icon}</span>}
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>

      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`${styles.input} ${styles.textarea} ${
            error ? styles.inputError : ""
          }`}
          rows={4}
        />
      ) : type === "select" ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          className={`${styles.input} ${styles.select} ${
            error ? styles.inputError : ""
          }`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options?.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`${styles.input} ${error ? styles.inputError : ""}`}
        />
      )}

      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};

export default FormField;
