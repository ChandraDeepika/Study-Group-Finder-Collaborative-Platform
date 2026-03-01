import { useState } from "react";
import api from "../services/api";

export default function CreateGroup() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    privacy: "PUBLIC",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      return setError("Group name is required");
    }

    try {
      setLoading(true);

      await api.post("/groups", {
        name: form.name,
        description: form.description,
        privacy: form.privacy,
      });

      alert("Group created successfully!");

      setForm({
        name: "",
        description: "",
        privacy: "PUBLIC",
      });

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to create group"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Create Study Group</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Group Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
          style={styles.input}
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          style={styles.input}
        />

        <select
          value={form.privacy}
          onChange={(e) =>
            setForm({ ...form, privacy: e.target.value })
          }
          style={styles.input}
        >
          <option value="PUBLIC">Public</option>
          <option value="PRIVATE">Private</option>
        </select>

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Creating..." : "Create Group"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "40px auto",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    background: "white",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "12px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer",
  },
};