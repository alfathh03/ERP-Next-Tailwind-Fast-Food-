"use client";

import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
// Menambahkan icon baru: Factory, Truck, Receipt, TrendingUp, UserCircle
import { 
  Home, 
  ShoppingCart, 
  Users, 
  FileText, 
  Layers, 
  Factory, 
  Truck, 
  Receipt, 
  TrendingUp, 
  UserCircle 
} from "lucide-react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/", icon: Home },
    
    // --- Modul Sales (Penjualan) ---
    { name: "Sales", href: "/sales", icon: TrendingUp },
    { name: "Customer", href: "/customer", icon: UserCircle },
    { name: "Invoice", href: "/invoice", icon: Receipt },
    // Di dalam menuItems layout.tsx
{ name: "Master Menu", href: "/products", icon: Layers }, // Ganti BOM atau tambah baru
    // --- Modul Purchase (Pembelian) ---
    { name: "Purchase", href: "/purchase", icon: ShoppingCart },
    { name: "Vendor", href: "/vendor", icon: Users },
    { name: "RFQ", href: "/rfq", icon: FileText },
    
    // --- Modul Manufacturing (Dapur/Produksi) ---
    { name: "Manufacturing", href: "/manufacturing", icon: Factory },
    { name: "BOM", href: "/bom", icon: Layers },
    
    // --- Modul Inventory/Logistik ---
    { name: "Delivery", href: "/delivery", icon: Truck },
  ];

  return (
    <html lang="en">
      <body className="flex bg-gray-100 text-gray-800">
        {/* Sidebar */}
        <aside className="w-64 h-screen bg-gradient-to-b from-indigo-700 to-purple-700 text-white flex flex-col shadow-lg fixed left-0 top-0 overflow-y-auto">
          <div className="p-5 text-2xl font-bold border-b border-white/20 sticky top-0 bg-indigo-700 z-10">
            🍔 Fast Food 
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-white text-indigo-700 font-semibold shadow-inner"
                      : "hover:bg-white/20"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-indigo-700" : "text-white"
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 text-sm text-white/80 border-t border-white/20">
            ERP System © 2025
          </div>
        </aside>

        {/* Main content - Ditambahkan margin-left agar tidak tertutup sidebar fixed */}
        <main className="flex-1 p-8 ml-64 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}