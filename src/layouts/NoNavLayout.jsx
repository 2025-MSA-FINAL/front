import { Outlet } from "react-router-dom";

export default function NoNavLayout() {
  return (
    <div className="min-h-screen  bg-paper-light text-text-black">
      <Outlet />
    </div>
  );
}
