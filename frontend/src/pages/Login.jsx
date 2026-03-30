import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import "../Auth.css";

function Login() {
  const navigate = useNavigate();
  const { refreshNotifications } = useNotifications();

  const [form,      setForm]      = useState({ email: "", password: "" });
  const [errors,    setErrors]    = useState({});
  const [message,   setMessage]   = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading,   setLoading]   = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: "" }));
    setMessage("");
  };

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                        e.email    = "Enter a valid email address.";
    if (!form.password) e.password = "Password is required.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res  = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.toLowerCase().trim(), password: form.password }),
      });
      const data = await res.text();
      if (!res.ok) {
        setMessage(data || "Login failed. Check your credentials.");
        setIsSuccess(false);
        return;
      }
      const user = JSON.parse(data);
      localStorage.setItem("token",  user.token);
      localStorage.setItem("user",   JSON.stringify(user));
      localStorage.setItem("userId", String(user.id));

      // Re-initialise notifications for the newly logged-in user
      refreshNotifications();

      setMessage("Login successful! Redirecting…");
      setIsSuccess(true);
      setTimeout(() => navigate("/dashboard"), 500);
    } catch {
      setMessage("Server error. Please try again.");
      setIsSuccess(false);
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

      <div className="auth-card">
        <h2>Welcome back</h2>
        <p className="auth-subtitle">Sign in to continue to your dashboard</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input className="auth-input" type="email" name="email"
            placeholder="Email" value={form.email} onChange={handleChange} />
          {errors.email && <p className="auth-error">{errors.email}</p>}

          <input className="auth-input" type="password" name="password"
            placeholder="Password" value={form.password} onChange={handleChange} />
          {errors.password && <p className="auth-error">{errors.password}</p>}

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {message && (
          <p className={isSuccess ? "auth-success" : "auth-error"} style={{ marginTop: 12 }}>
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
