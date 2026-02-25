import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProfileCard() {

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {

        const res = await fetch(
          "http://localhost:8080/api/profile/me",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        // 🔐 Token expired or invalid
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Profile not found");
        }

        const data = await res.json();
        setProfile(data);
      } catch (error) {
        console.log("Error fetching profile:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="profile-card">
        <h3>Loading profile...</h3>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-card">
        <h2>No Profile Found</h2>
        <p>Please complete your registration details.</p>
      </div>
    );
  }

  return (
    <div className="profile-card">

      <h2>Profile Summary</h2>

      <div className="profile-summary-image-wrap">
        {profile.profileImageBase64 ? (
          <img
            src={profile.profileImageBase64}
            alt="Profile"
            className="profile-summary-image"
          />
        ) : (
          <div className="profile-summary-image-placeholder">
            <span>{profile.name?.charAt(0)?.toUpperCase() || "?"}</span>
          </div>
        )}
      </div>

      <p><strong>Name:</strong> {profile.name || "Not set"}</p>
      <p><strong>Email:</strong> {profile.email || "Not set"}</p>
      <p><strong>Location:</strong> {profile.location || "Not set"}</p>
      <p><strong>Education:</strong> {profile.educationLevel || "Not set"}</p>
      <p><strong>Field:</strong> {profile.field || "Not set"}</p>
      <p><strong>Skills:</strong> {profile.skills || "Not set"}</p>
      <p><strong>Bio:</strong> {profile.bio || "Not set"}</p>

    </div>
  );
}

export default ProfileCard;