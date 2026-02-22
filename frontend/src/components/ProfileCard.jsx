import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ProfileCard() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/profile/${userId}`
        );

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
  }, [userId]);

  if (loading) {
    return <div className="profile-card">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="profile-card">
        <h2>No Profile Found</h2>
        <button
          className="edit-profile-btn"
          onClick={() => navigate("/profile")}
        >
          Create Profile
        </button>
      </div>
    );
  }

  return (
    <div className="profile-card">
      <h2>Profile Summary</h2>

      {profile?.profileImage && (
        <img
          src={`http://localhost:8080/uploads/${profile.profileImage}`}
          alt="Profile"
          className="profile-summary-image"
        />
      )}

      <p><strong>Name:</strong> {profile?.name || "Not set"}</p>
      <p><strong>Location:</strong> {profile?.location || "Not set"}</p>
      <p><strong>Education:</strong> {profile?.educationLevel || "Not set"}</p>
      <p><strong>Field:</strong> {profile?.field || "Not set"}</p>
      <p><strong>Skills:</strong> {profile?.skills || "Not set"}</p>
      <p><strong>Bio:</strong> {profile?.bio || "Not set"}</p>

      <button
        className="edit-profile-btn"
        onClick={() => navigate("/profile")}
      >
        Edit Profile
      </button>
    </div>
  );
}

export default ProfileCard;
