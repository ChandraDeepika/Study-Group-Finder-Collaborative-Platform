import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Login failed");
      }

      let token = await res.text();
      token = token.replace(/"/g, "").trim();

      localStorage.setItem("token", token);

      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.sub;
      localStorage.setItem("userId", userId);

      setMessage("Login successful!");

      setTimeout(() => navigate("/dashboard"), 500);

    } catch (err) {
      console.error(err);
      setMessage("Login failed. Check credentials.");
    }
  };

  return (

    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(to right,#5f9cff,#6ec6ff)"
    }}>

      <div style={{
        width: "420px",
        background: "white",
        padding: "40px",
        borderRadius: "14px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        textAlign: "center"
      }}>

        <h2 style={{marginBottom:"6px"}}>📚 Study Group Finder</h2>
        <p style={{marginBottom:"25px",color:"#666"}}>
          Connect. Collaborate. Succeed.
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            style={{
              width:"100%",
              padding:"12px",
              marginBottom:"15px",
              borderRadius:"8px",
              border:"1px solid #ccc"
            }}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            style={{
              width:"100%",
              padding:"12px",
              marginBottom:"20px",
              borderRadius:"8px",
              border:"1px solid #ccc"
            }}
          />

          <button type="submit" style={{
            width:"100%",
            padding:"12px",
            border:"none",
            borderRadius:"8px",
            background:"linear-gradient(to right,#2b8cff,#3db7ff)",
            color:"white",
            fontWeight:"bold",
            cursor:"pointer"
          }}>
            Login
          </button>

        </form>

        {message && <p style={{marginTop:"15px"}}>{message}</p>}

        <p style={{marginTop:"18px"}}>
          Don’t have an account?{" "}
          <span
            style={{color:"#2b8cff",cursor:"pointer"}}
            onClick={()=>navigate("/register")}
          >
            Register
          </span>
        </p>

      </div>
    </div>
  );
}

export default Login;
