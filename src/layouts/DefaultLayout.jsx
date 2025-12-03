import { Outlet } from "react-router-dom";
import Navbar from "../components/NavBar.jsx";

export default function DefaultLayout() {
  return (
    <div className="min-h-screen bg-secondary-light text-text-black">
      <Navbar />
      <Outlet />
    </div>
  );
}
