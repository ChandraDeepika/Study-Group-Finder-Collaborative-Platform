import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../services/api";
import "../styles/Groups.css";

export default function CreateGroup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", description: "", privacy: "PUBLIC" });
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/courses/my")
      .then(res => setCourses(res.data))
      .catch(err => console.error("Failed to fetch courses:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Group name is required");
    if (!courseId) return setError("Please select a course");

    try {
      setLoading(true);
      await api.post("/groups", {
        name: form.name,
        description: form.description,
        privacy: form.privacy,
        courseId: Number(courseId),
      });
      navigate("/groups");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="create-group-page">
        <div className="create-group-hero">
          <h1>Create a Study Group</h1>
          <p>Start a new group and invite students studying the same course</p>
        </div>

        <div className="create-group-card">
          <form onSubmit={handleSubmit} className="create-group-form">

            <div className="cg-field">
              <label>Group Name *</label>
              <input
                type="text"
                placeholder="e.g. CS101 Morning Study Squad"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="cg-input"
              />
            </div>

            <div className="cg-field">
              <label>Description</label>
              <textarea
                placeholder="What will your group focus on? When do you meet?"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="cg-input cg-textarea"
                rows={3}
              />
            </div>

            <div className="cg-row">
              <div className="cg-field">
                <label>Course *</label>
                <select
                  value={courseId}
                  onChange={e => setCourseId(e.target.value)}
                  className="cg-input"
                >
                  <option value="">Select a course...</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>{course.courseName}</option>
                  ))}
                </select>
              </div>

              <div className="cg-field">
                <label>Privacy</label>
                <select
                  value={form.privacy}
                  onChange={e => setForm({ ...form, privacy: e.target.value })}
                  className="cg-input"
                >
                  <option value="PUBLIC">🌐 Public — Anyone can join</option>
                  <option value="PRIVATE">🔒 Private — Approval required</option>
                </select>
              </div>
            </div>

            {error && <p className="cg-error">⚠️ {error}</p>}

            <div className="cg-actions">
              <button type="button" className="cg-btn-cancel" onClick={() => navigate("/groups")}>
                Cancel
              </button>
              <button type="submit" className="cg-btn-submit" disabled={loading}>
                {loading ? "Creating..." : "✨ Create Group"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
