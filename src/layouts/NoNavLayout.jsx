import { Outlet } from "react-router-dom";

export default function NoNavLayout() {
  return (
    <div className="min-h-screen bg-secondary-light text-text-black">
      <Outlet />
    </div>
  );
}
