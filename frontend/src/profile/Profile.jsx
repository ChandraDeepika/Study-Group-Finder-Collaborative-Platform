import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [form, setForm] = useState({
    name: "",
    location: "",
    educationLevel: "",
    field: "",
    skills: "",
    bio: "",
    profileImage: ""
  });

  const [image, setImage] = useState(null);

  // 🔹 Load existing profile
  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    fetch(`http://localhost:8080/api/profile/${userId}`)
      .then(res => res.json())
      .then(data => {
        setForm(data);
      })
      .catch(() => {
        console.log("Error fetching profile");
      });

  }, [userId, navigate]);

  // 🔹 Handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // 🔹 Submit profile update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("location", form.location);
    formData.append("educationLevel", form.educationLevel);
    formData.append("field", form.field);
    formData.append("skills", form.skills);
    formData.append("bio", form.bio);

    if (image) {
      formData.append("image", image);
    }

    try {
      const res = await fetch(`http://localhost:8080/api/profile/${userId}`, {
        method: "PUT",
        body: formData
      });

      if (res.ok) {
        alert("Profile updated successfully!");
        navigate("/dashboard");
      } else {
        alert("Failed to update profile.");
      }

    } catch (error) {
      alert("Server error.");
    }
  };

  return (
    <div className="profile-container">

      <div className="profile-header">
        <h1 className="profile-title">👤 My Profile</h1>
      </div>

      <div className="profile-card">
        <form className="profile-form" onSubmit={handleSubmit}>

          <input
            name="name"
            value={form.name || ""}
            onChange={handleChange}
            placeholder="Full Name"
          />

          <input
            name="location"
            value={form.location || ""}
            onChange={handleChange}
            placeholder="Location"
          />

          <input
            name="educationLevel"
            value={form.educationLevel || ""}
            onChange={handleChange}
            placeholder="Education Level"
          />

          <input
            name="field"
            value={form.field || ""}
            onChange={handleChange}
            placeholder="Field of Study"
          />

          <input
            className="full-width"
            name="skills"
            value={form.skills || ""}
            onChange={handleChange}
            placeholder="Skills (comma separated)"
          />

          <textarea
            className="full-width"
            name="bio"
            value={form.bio || ""}
            onChange={handleChange}
            placeholder="Short Bio"
          />

          <div className="profile-image-upload">
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
            />

            {form.profileImage && (
              <img
                src={`http://localhost:8080/uploads/${form.profileImage}`}
                alt="Profile"
                className="profile-image-preview"
              />
            )}
          </div>

          <button className="profile-button" type="submit">
            Save Profile
          </button>

        </form>
      </div>

    </div>
  );
}

export default Profile;