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
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Login failed");
    }

    // ✅ READ TOKEN AS TEXT
    const token = await res.text();

    console.log("TOKEN:", token);

    // ✅ SAVE TOKEN
    localStorage.setItem("token", token.trim());

    // ✅ SUCCESS MESSAGE
    setMessage("Login successful!");

    // ✅ REDIRECT
    navigate("/dashboard");

  } catch (err) {
    console.error(err);
    setMessage("Login failed. Check credentials.");
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
            value={form.email}
            onChange={handleChange}
          />

          <input
            className="auth-input"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
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
