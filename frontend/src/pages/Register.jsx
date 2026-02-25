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
      newErrors.password = "Password must contain at least 1 uppercase letter.";
    else if (!/(?=.*[0-9])/.test(form.password))
      newErrors.password = "Password must contain at least 1 number.";
    else if (!/(?=.*[a-z])/.test(form.password))
      newErrors.password = "Password must contain at least 1 lowercase letter.";
    if (!form.location.trim()) newErrors.location = "Location is required.";
    if (!form.educationLevel.trim()) newErrors.educationLevel = "Education level is required.";
    if (!form.field.trim()) newErrors.field = "Field of study is required.";
    if (!form.skills.trim()) newErrors.skills = "Skills are required.";
    if (!form.bio.trim()) newErrors.bio = "Bio is required.";
    if (!image) newErrors.image = "Profile image is required.";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("location", form.location);
    formData.append("educationLevel", form.educationLevel);
    formData.append("field", form.field);
    formData.append("skills", form.skills);
    formData.append("bio", form.bio);
    formData.append("image", image);

    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        body: formData
      });

      const data = await res.text();

      if (res.ok && data.includes("User registered successfully")) {
        alert("Registration successful! Please login.");
        navigate("/login");
      } else {
        setMessage(data || "Registration failed.");
      }
    } catch {
      setMessage("Server error. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <h1 className="auth-header-logo">📚 StudyConnect</h1>
        <p className="auth-header-tagline">Connect. Collaborate. Succeed.</p>
      </div>

      <div className="auth-card auth-card-register">
        <h2>Create your account</h2>
        <p className="auth-subtitle">Join StudyConnect and find your study group</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-register-grid">
            <div className="auth-register-section">
              <h3>Basic info</h3>
              <input
                className="auth-input"
                type="text"
                name="name"
                placeholder="Full name *"
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <p className="auth-error">{errors.name}</p>}

              <input
                className="auth-input"
                type="email"
                name="email"
                placeholder="Email *"
                value={form.email}
                onChange={handleChange}
                style={{ textTransform: "lowercase" }}
              />
              {errors.email && <p className="auth-error">{errors.email}</p>}

              <input
                className="auth-input"
                type="password"
                name="password"
                placeholder="Password * (6+ chars, 1 upper, 1 lower, 1 number)"
                value={form.password}
                onChange={handleChange}
              />
              {errors.password && <p className="auth-error">{errors.password}</p>}

              <input
                className="auth-input"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(e) => {
                  setImage(e.target.files?.[0] ?? null);
                  setErrors((prev) => ({ ...prev, image: "" }));
                }}
              />
              {errors.image && <p className="auth-error">{errors.image}</p>}
            </div>

            <div className="auth-register-section">
              <h3>Profile details</h3>
              <input
                className="auth-input"
                type="text"
                name="location"
                placeholder="Location *"
                value={form.location}
                onChange={handleChange}
              />
              {errors.location && <p className="auth-error">{errors.location}</p>}

              <input
                className="auth-input"
                type="text"
                name="educationLevel"
                placeholder="Education level *"
                value={form.educationLevel}
                onChange={handleChange}
              />
              {errors.educationLevel && <p className="auth-error">{errors.educationLevel}</p>}

              <input
                className="auth-input"
                type="text"
                name="field"
                placeholder="Field of study *"
                value={form.field}
                onChange={handleChange}
              />
              {errors.field && <p className="auth-error">{errors.field}</p>}

              <input
                className="auth-input"
                type="text"
                name="skills"
                placeholder="Skills (comma separated) *"
                value={form.skills}
                onChange={handleChange}
              />
              {errors.skills && <p className="auth-error">{errors.skills}</p>}

              <textarea
                className="auth-input auth-textarea"
                name="bio"
                placeholder="Short bio *"
                value={form.bio}
                onChange={handleChange}
              />
              {errors.bio && <p className="auth-error">{errors.bio}</p>}
            </div>
          </div>

          <button className="auth-button" type="submit">
            Create account
          </button>
        </form>

        {message && <p className="auth-error">{message}</p>}

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
