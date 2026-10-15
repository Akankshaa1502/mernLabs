import { useState } from "react";

const FIELDS = [
  { name: "fullName", label: "Full Name", placeholder: "Aarav Sharma", autoComplete: "name" },
  { name: "phone", label: "Phone Number", placeholder: "9876543210", autoComplete: "tel", type: "tel", maxLength: 10 },
  { name: "addressLine1", label: "Address", placeholder: "22 MG Road", autoComplete: "address-line1" },
  { name: "city", label: "City", placeholder: "Bengaluru", autoComplete: "address-level2" },
  { name: "state", label: "State", placeholder: "Karnataka", autoComplete: "address-level1" },
  { name: "pincode", label: "Pincode", placeholder: "560001", autoComplete: "postal-code", inputMode: "numeric", maxLength: 6 },
];

const validate = (form) => {
  const errors = {};

  // .trim() makes whitespace-only input count as empty
  for (const { name, label } of FIELDS) {
    if (!form[name].trim()) errors[name] = `${label} is required`;
  }

  if (!errors.phone && !/^[0-9]{10}$/.test(form.phone.trim())) {
    errors.phone = "Phone number must be exactly 10 digits";
  }
  if (!errors.pincode && !/^[0-9]{6}$/.test(form.pincode.trim())) {
    errors.pincode = "Pincode must contain 6 digits";
  }

  return errors;
};

// The form state lives here: no other component needs it, so it does not
// belong in global state. The parent only receives the final, valid address.
function CheckoutForm({ id, initialValues, onSubmit, disabled }) {
  const [form, setForm] = useState(() =>
    Object.fromEntries(FIELDS.map(({ name }) => [name, initialValues[name] || ""]))
  );
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    // Don't call the backend if basic validation fails
    if (Object.keys(validationErrors).length > 0) return;

    onSubmit(Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()])));
  };

  return (
    <form id={id} className="checkout-form" onSubmit={handleSubmit} noValidate>
      <fieldset disabled={disabled}>
        {FIELDS.map(({ name, label, ...inputProps }) => (
          <div
            key={name}
            className={`form-group ${name === "addressLine1" ? "form-group-wide" : ""}`}
          >
            <label htmlFor={name}>{label}</label>
            <input
              id={name}
              name={name}
              type="text"
              value={form[name]}
              onChange={handleChange}
              className={errors[name] ? "input-error" : ""}
              {...inputProps}
            />
            {errors[name] && <p className="field-error">{errors[name]}</p>}
          </div>
        ))}
      </fieldset>
    </form>
  );
}

export default CheckoutForm;
