import React from "react";

const ProfileCard = ({ user }) => {
  return (
    <div className="card">
      <h2>Profile Summary</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Department:</strong> {user.department}</p>
      <p><strong>Year:</strong> {user.year}</p>
    </div>
  );
};

export default ProfileCard;
