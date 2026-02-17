import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import StudyGroups from "./pages/StudyGroups";
import GroupDetails from "./pages/GroupDetails";

function App() {
  const [groups, setGroups] = useState([
    { id: 1, name: "Data Structures", description: "Master trees, graphs and algorithms.", students: 24, joined: false },
    { id: 2, name: "Operating Systems", description: "Learn processes, memory & scheduling.", students: 18, joined: false },
    { id: 3, name: "Database Management", description: "SQL, indexing, normalization & design.", students: 32, joined: false },
    { id: 4, name: "Computer Networks", description: "Protocols, routing and network layers.", students: 15, joined: false }
  ]);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/studygroups"
          element={<StudyGroups groups={groups} setGroups={setGroups} />}
        />
        <Route
          path="/studygroups/:id"
          element={<GroupDetails groups={groups} setGroups={setGroups} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
