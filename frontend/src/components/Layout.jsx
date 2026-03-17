import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import ChatWidget from "./ChatWidget";
import "../styles/layout.css";

export default function Layout({ children }) {
  const { pathname } = useLocation();
  const isChatPage = pathname.includes("/chat");
  return (
    <div className="layout">
      <Navbar />
      <div className="page-content">
        {children}
      </div>
      {!isChatPage && <ChatWidget />}
    </div>
  );
}
