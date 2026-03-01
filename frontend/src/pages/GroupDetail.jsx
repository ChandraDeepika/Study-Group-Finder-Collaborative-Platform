import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function GroupDetail() {
  const { id } = useParams();

  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const groupRes = await api.get(`/groups/${id}`);
      const membersRes = await api.get(`/groups/${id}/members`);

      setGroup(groupRes.data);
      setMembers(membersRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!group) return <div>Loading...</div>;

  return (
    <div style={{ padding: "40px" }}>
      <h2>{group.name}</h2>
      <p>{group.description}</p>

      <h3>Members</h3>
      <ul>
        {members.map((member) => (
          <li key={member.userId}>{member.userName}</li>
        ))}
      </ul>
    </div>
  );
}

export default GroupDetail;