import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import ChatWidget from "./ChatWidget";
import "../styles/layout.css";

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-section">
        <Topbar />
        <div className="page-content">
          {children}
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}
