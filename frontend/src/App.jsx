import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Groups from "./pages/Groups";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/groups" element={<Groups />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;