import "../styles/topbar.css";
import defaultAvatar from "../assets/react.svg";

export default function Topbar() {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
        />

        <div className="user-info">
          <img
            src={defaultAvatar}
            alt="profile"
            className="avatar"
          />
          <span className="username">John Doe</span>
        </div>
      </div>
    </div>
  );
}