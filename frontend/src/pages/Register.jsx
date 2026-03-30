import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Auth.css";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    location: "", educationLevel: "", field: "", skills: "", bio: ""
  });
  const [image,   setImage]   = useState(null);
  const [errors,  setErrors]  = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === "email" ? value.toLowerCase() : value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  // Client-side validation — format only, backend does the real email check
  const validate = () => {
    const e = {};
    if (!form.name.trim())           e.name = "Full name is required.";
    if (!form.email)                 e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                     e.email = "Enter a valid email address.";
    if (!form.password)              e.password = "Password is required.";
    else if (form.password.length < 6) e.password = "At least 6 characters.";
    else if (!/(?=.*[A-Z])/.test(form.password)) e.password = "Must contain at least 1 uppercase letter.";
    else if (!/(?=.*[0-9])/.test(form.password)) e.password = "Must contain at least 1 number.";
    if (!form.location.trim())       e.location = "Location is required.";
    if (!form.educationLevel.trim()) e.educationLevel = "Education level is required.";
    if (!form.field.trim())          e.field = "Field of study is required.";
    if (!form.skills.trim())         e.skills = "Skills are required.";
    if (!form.bio.trim())            e.bio = "Bio is required.";
    if (!image)                      e.image = "Profile image is required.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setMessage("");
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    formData.append("image", image);

    try {
      const res  = await fetch("http://localhost:8080/api/auth/register", { method: "POST", body: formData });
      const data = await res.text();
      if (res.ok && data.includes("User registered successfully")) {
        alert("Registration successful! Please login.");
        navigate("/login");
      } else {
        // Show backend error (includes real email validation message)
        setMessage(data || "Registration failed. Please try again.");
      }
    } catch {
      setMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
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
        <p className="auth-subtitle">Use a real email address — you'll receive notifications there</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-register-grid">
            <div className="auth-register-section">
              <h3>Basic info</h3>
              <input className="auth-input" type="text" name="name" placeholder="Full name *"
                value={form.name} onChange={handleChange} />
              {errors.name && <p className="auth-error">{errors.name}</p>}

              <input className="auth-input" type="email" name="email"
                placeholder="Real email * (Gmail, Outlook, Yahoo…)"
                value={form.email} onChange={handleChange}
                style={{ textTransform: "lowercase" }} />
              {errors.email && <p className="auth-error">{errors.email}</p>}

              <input className="auth-input" type="password" name="password"
                placeholder="Password * (6+ chars, 1 upper, 1 number)"
                value={form.password} onChange={handleChange} />
              {errors.password && <p className="auth-error">{errors.password}</p>}

              <input className="auth-input" type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={e => { setImage(e.target.files?.[0] ?? null); setErrors(p => ({ ...p, image: "" })); }} />
              {errors.image && <p className="auth-error">{errors.image}</p>}
            </div>

            <div className="auth-register-section">
              <h3>Profile details</h3>
              <input className="auth-input" type="text" name="location" placeholder="Location *"
                value={form.location} onChange={handleChange} />
              {errors.location && <p className="auth-error">{errors.location}</p>}

              <input className="auth-input" type="text" name="educationLevel" placeholder="Education level *"
                value={form.educationLevel} onChange={handleChange} />
              {errors.educationLevel && <p className="auth-error">{errors.educationLevel}</p>}

              <input className="auth-input" type="text" name="field" placeholder="Field of study *"
                value={form.field} onChange={handleChange} />
              {errors.field && <p className="auth-error">{errors.field}</p>}

              <input className="auth-input" type="text" name="skills" placeholder="Skills (comma separated) *"
                value={form.skills} onChange={handleChange} />
              {errors.skills && <p className="auth-error">{errors.skills}</p>}

              <textarea className="auth-input auth-textarea" name="bio" placeholder="Short bio *"
                value={form.bio} onChange={handleChange} />
              {errors.bio && <p className="auth-error">{errors.bio}</p>}
            </div>
          </div>

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Verifying email & creating account…" : "Create account"}
          </button>
        </form>

        {message && <p className="auth-error" style={{ marginTop: 12 }}>{message}</p>}

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
