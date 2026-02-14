import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../Auth.css";

function Login() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setMessage("Please enter both email and password.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Invalid email or password");
      } else {

        // ✅ Store user info
        localStorage.setItem("userId", data.id);
        localStorage.setItem("userEmail", data.email);

        // 🔥 Check profile completion
        const profileRes = await fetch(
          `http://localhost:8080/api/profile/${data.id}`
        );

        const profileData = await profileRes.json();

        // If important fields missing → go to profile page
        if (!profileData.location || !profileData.educationLevel) {
          navigate("/profile");   // First login
        } else {
          navigate("/dashboard"); // Profile already completed
        }
      }

    } catch (error) {
      setMessage("Server error. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2 className="auth-logo">📚 Study Group Finder</h2>

        <p className="auth-subtitle">
          Connect. Collaborate. Succeed.
        </p>

        <form onSubmit={handleSubmit}>

          <input
            className="auth-input"
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
          />

          <input
            className="auth-input"
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
          />

          <button className="auth-button" type="submit">
            Login
          </button>

        </form>

        {message && <p className="auth-error">{message}</p>}

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;