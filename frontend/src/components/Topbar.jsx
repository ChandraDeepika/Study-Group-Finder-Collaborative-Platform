import "../styles/topbar.css";
import ProfileDropdown from "./ProfileDropdown";

export default function Topbar() {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
        />

        <ProfileDropdown />
      </div>
    </div>
  );
}