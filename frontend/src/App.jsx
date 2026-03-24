import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ExploreCourses from "./pages/ExploreCourses";
import MyCourses from "./pages/MyCourses";
import LandingPage from "./pages/LandingPage";
import Groups from "./pages/Groups";
import GroupMembers from "./pages/GroupMembers";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateGroup from "./pages/CreateGroup";
import GroupDetail from "./pages/GroupDetail";
import AdminRequests from "./pages/AdminRequests";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
     <Route path="/explore-courses" element={<ExploreCourses />} />
     
     <Route path="/my-courses" element={<MyCourses />} />
      <Route path="/groups" element={<Groups />} />
      <Route path="/groups/:groupId/members" element={<GroupMembers />} />
      <Route path="/groups/:id" element={<GroupDetail />} />
      <Route path="/create-group" element={<CreateGroup />} />
      <Route path="/admin/requests" element={<AdminRequests />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/groups/:groupId/chat" element={<ChatPage />} />
    </Routes>
  );
}

export default App; 
