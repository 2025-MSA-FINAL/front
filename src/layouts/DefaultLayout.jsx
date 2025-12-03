import { Outlet } from "react-router-dom";
import Navbar from "../components/NavBar.jsx";

export default function DefaultLayout() {
  return (
    <div className="min-h-screen bg-secondary-light text-text-black">
      <Navbar />
      <Outlet /> {/* 여기에 MainPage / MyPage 등 페이지가 렌더링됨 */}
    </div>
  );
}
