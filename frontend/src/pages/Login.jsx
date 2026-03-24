import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Auth.css";

function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    let newErrors = {};

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(form.password)) {
      newErrors.password = "Password must contain letters and numbers";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

    setErrors({
      ...errors,
      [e.target.name]: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.text();

      if (!res.ok) {
        setMessage(data || "Login failed. Check credentials.");
        setIsSuccess(false);
        return;
      }

      const user = JSON.parse(data);

      localStorage.setItem("token", user.token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", String(user.id));

      setMessage("Login successful! Redirecting...");
      setIsSuccess(true);
      setTimeout(() => navigate("/dashboard"), 500);

    } catch (err) {
      console.error(err);
      setMessage(err.message || "Login failed. Check credentials.");
      setIsSuccess(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <h1 className="auth-header-logo">📚 StudyConnect</h1>
        <p className="auth-header-tagline">Connect. Collaborate. Succeed.</p>
      </div>

      <div className="auth-card">
        <h2>Welcome back</h2>
        <p className="auth-subtitle">Sign in to continue to your dashboard</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            className="auth-input"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
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

          <button className="auth-button" type="submit">
            Sign in
          </button>
        </form>

        {message && (
          <p className={isSuccess ? "auth-success" : "auth-error"} style={{ marginTop: "12px" }}>
            {message}
          </p>
        )}

        <p className="auth-link">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
