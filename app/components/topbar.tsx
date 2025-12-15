import { Bell, User } from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex justify-between items-center bg-white px-6 py-3 border-b shadow-sm">
      <h2 className="text-lg font-semibold text-gray-700">Dashboard</h2>
      <div className="flex items-center gap-4">
        <Bell className="text-gray-500 hover:text-brand-500 cursor-pointer" />
        <div className="flex items-center gap-2">
          <User className="text-brand-500" />
          <span className="text-sm font-medium">Admin</span>
        </div>
      </div>
    </header>
  );
}
