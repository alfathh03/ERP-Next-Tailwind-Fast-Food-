"use client";
import { useState } from "react";
import { Home, ShoppingCart, Users, FileText, Layers } from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
  const [active, setActive] = useState("dashboard");

  const menus = [
    { name: "Dashboard", icon: <Home size={18} />, path: "/" },
    { name: "Purchase", icon: <ShoppingCart size={18} />, path: "/purchase" },
    { name: "Vendor", icon: <Users size={18} />, path: "/vendor" },
    { name: "RFQ", icon: <FileText size={18} />, path: "/rfq" },
    { name: "BOM", icon: <Layers size={18} />, path: "/bom" },
  ];

  return (
    <aside className="w-64 bg-brand-500 text-white flex flex-col p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-6">🍔 ERP Resto</h1>
      <nav className="flex flex-col gap-2">
        {menus.map((m) => (
          <Link
            key={m.name}
            href={m.path}
            onClick={() => setActive(m.name)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brand-700 transition ${
              active === m.name ? "bg-brand-700" : ""
            }`}
          >
            {m.icon}
            <span>{m.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
