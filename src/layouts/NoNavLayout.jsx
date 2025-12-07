import { Outlet } from "react-router-dom";

export default function NoNavLayout() {
  return (
    <div className="min-h-screen text-text-black">
      <Outlet />
    </div>
  );
}
