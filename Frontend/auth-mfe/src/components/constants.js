export const USER_TYPES = [
  { id: "customer", label: "Customer" },
  { id: "supplier", label: "Supplier" },
];

export const SIGNUP_FIELDS = [
  {
    name: "firstName",
    label: "First Name",
    type: "text",
    placeholder: "Enter your first name",
    required: true,
    validation: {
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s'-]+$/,
      message: "First name should only contain letters",
    },
  },
  {
    name: "lastName",
    label: "Last Name",
    type: "text",
    placeholder: "Enter your last name",
    required: true,
    validation: {
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s'-]+$/,
      message: "Last name should only contain letters",
    },
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "hello@example.com",
    required: true,
    validation: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address",
    },
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Create a strong password",
    required: true,
    validation: {
      minLength: 8,
      maxLength: 128,
      pattern:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      message:
        "Password must have uppercase, lowercase, number, and special character",
    },
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    type: "password",
    placeholder: "Confirm your password",
    required: true,
  },
  {
    name: "userType",
    label: "Account Type",
    type: "select",
    placeholder: "Select account type",
    required: true,
    options: USER_TYPES,
  },
  {
    name: "address",
    label: "Address",
    type: "textarea",
    placeholder: "Enter your full address",
    required: true,
    validation: {
      minLength: 10,
      maxLength: 255,
      message: "Address should be between 10 and 255 characters",
    },
  },
  {
    name: "phone",
    label: "Phone Number",
    type: "tel",
    placeholder: "+1 (555) 000-0000",
    required: true,
    validation: {
      pattern: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
      message: "Please enter a valid phone number",
    },
  },
];

export const INITIAL_SIGNUP_STATE = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  userType: "customer",
  address: "",
  phone: "",
};
