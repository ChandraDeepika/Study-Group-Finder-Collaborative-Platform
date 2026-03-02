import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function GroupMembers() {
  const { groupId } = useParams();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/groups/${groupId}/members`);
      setMembers(res.data);
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Group Members</h2>

      {members.length === 0 ? (
        <p>No members found</p>
      ) : (
        members.map((member) => (
          <div key={member.id} style={{ marginBottom: "10px" }}>
            <h4>{member.name}</h4>
            <p>{member.email}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default GroupMembers;