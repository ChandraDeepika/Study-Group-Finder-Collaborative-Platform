import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AvailableGroups() {
  const navigate = useNavigate();
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyGroups();
  }, []);

  const fetchMyGroups = async () => {
    try {
      const res = await api.get("/groups/my-groups");
      setMyGroups(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="dash-empty">Loading groups...</p>;

  return (
    <div className="dash-list">
      {myGroups.length === 0 ? (
        <p className="dash-empty">No groups joined yet.</p>
      ) : (
        myGroups.map((group) => (
          <div
            className="dash-list-item clickable"
            key={group.id}
            onClick={() => navigate(`/groups/${group.id}`)}
          >
            <div className="dash-list-left">
              <div className="dash-list-icon group-bg">👥</div>
              <div>
                <p className="dash-list-title">{group.name}</p>
                <p className="dash-list-sub">{group.adminEmail}</p>
              </div>
            </div>
            <span className={`dash-pill ${group.privacy === "PRIVATE" ? "private-pill" : "public-pill"}`}>
              {group.privacy}
            </span>
          </div>
        ))
      )}

      <button className="dash-browse-btn" onClick={() => navigate("/groups")}>
        Browse All Groups →
      </button>
    </div>
  );
}

export default AvailableGroups;