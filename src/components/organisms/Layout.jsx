import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "@/components/organisms/Sidebar";
import MobileSidebar from "@/components/organisms/MobileSidebar";
import Header from "@/components/organisms/Header";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

const getPageTitle = (pathname) => {
    switch (pathname) {
      case "/":
        return "Dashboard";
      case "/customers":
        return "Customers";
      case "/orders":
        return "Orders";
      case "/activities":
        return "Activities";
      case "/planning":
        return "Planning";
      default:
        if (pathname.includes("/customers/")) {
          return "Customer Details";
        }
        if (pathname.includes("/orders/")) {
          return "Order Details";
        }
        return "AgriFlow CRM";
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar />
      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden lg:ml-64">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          title={getPageTitle(location.pathname)}
        />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;