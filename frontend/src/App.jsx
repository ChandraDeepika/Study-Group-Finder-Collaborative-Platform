import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Groups from "./pages/Groups";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateGroup from "./pages/CreateGroup";
import GroupDetail from "./pages/GroupDetail";

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/groups" element={<Groups />} />
      <Route path="/groups/:id" element={<GroupDetail />} />
      <Route path="/create-group" element={<CreateGroup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;