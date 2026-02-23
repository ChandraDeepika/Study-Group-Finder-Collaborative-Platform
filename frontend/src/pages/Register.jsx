import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Auth.css";

function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    educationLevel: "",
    field: "",
    skills: "",
    bio: ""
  });

  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  // ✅ Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: name === "email" ? value.toLowerCase() : value
    });

    setErrors({
      ...errors,
      [name]: ""
    });
  };

  // ✅ Validation
  const validate = () => {
    let newErrors = {};

    if (!form.name.trim()) newErrors.name = "Full name is required.";

    if (!form.email)
      newErrors.email = "Email is required.";
    else if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(form.email))
      newErrors.email = "Enter a valid lowercase email.";

    if (!form.password)
      newErrors.password = "Password is required.";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    else if (!/(?=.*[A-Z])/.test(form.password))
      newErrors.password = "Password must contain 1 uppercase letter.";
    else if (!/(?=.*[0-9])/.test(form.password))
      newErrors.password = "Password must contain 1 number.";

    return newErrors;
  };

  // ✅ Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const formData = new FormData();

    Object.keys(form).forEach(key => {
      formData.append(key, form[key]);
    });

    if (image) {
      formData.append("image", image);
    }

    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        body: formData
      });

      const data = await res.text();

      if (!res.ok) {
        setMessage(data);
      } else {
        alert("Registration successful! Please login.");
        navigate("/login");
      }

    } catch {
      setMessage("Server error. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ width: "600px" }}>

        <h2 className="auth-logo">📚 Study Group Finder</h2>

        <form onSubmit={handleSubmit}>

          {/* Basic Info */}
          <input
            className="auth-input"
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
          />
          {errors.name && <p className="auth-error">{errors.name}</p>}

          <input
            className="auth-input"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            style={{ textTransform: "lowercase" }}
          />
          {errors.email && <p className="auth-error">{errors.email}</p>}

          <input
            className="auth-input"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
          {errors.password && <p className="auth-error">{errors.password}</p>}

          {/* Profile Fields */}
          <input
            className="auth-input"
            type="text"
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
          />

          <input
            className="auth-input"
            type="text"
            name="educationLevel"
            placeholder="Education Level"
            value={form.educationLevel}
            onChange={handleChange}
          />

          <input
            className="auth-input"
            type="text"
            name="field"
            placeholder="Field of Study"
            value={form.field}
            onChange={handleChange}
          />

          <input
            className="auth-input"
            type="text"
            name="skills"
            placeholder="Skills (comma separated)"
            value={form.skills}
            onChange={handleChange}
          />

          <textarea
            className="auth-input"
            name="bio"
            placeholder="Short Bio"
            value={form.bio}
            onChange={handleChange}
          />

          {/* Image Upload */}
          <input
            className="auth-input"
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          />

          <button className="auth-button" type="submit">
            Register
          </button>

        </form>

        {message && <p className="auth-error">{message}</p>}

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;