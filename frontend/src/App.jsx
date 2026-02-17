import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./profile/Profile";

function App() {

  const isLoggedIn = localStorage.getItem("userId");

  return (
    <Routes>

      <Route
        path="/"
        element={
          isLoggedIn
            ? <Navigate to="/dashboard" />
            : <Navigate to="/login" />
        }
      />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          isLoggedIn
            ? <Dashboard />
            : <Navigate to="/login" />
        }
      />

      <Route
        path="/courses"
        element={
          isLoggedIn
            ? <Courses />
            : <Navigate to="/login" />
        }
      />

      <Route
        path="/profile"
        element={
          isLoggedIn
            ? <Profile />
            : <Navigate to="/login" />
        }
      />

    </Routes>
  );
}

export default App;
