import React from "react";
import NavLink from "@/components/molecules/NavLink";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = () => {
  const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Customers", href: "/customers", icon: "Users" },
    { name: "Orders", href: "/orders", icon: "ShoppingCart" },
    { name: "Activities", href: "/activities", icon: "Activity" }
  ];

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto shadow-lg">
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg flex items-center justify-center mr-3">
            <ApperIcon name="Sprout" className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              AgriFlow
            </h1>
            <p className="text-xs text-gray-500">CRM System</p>
          </div>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              icon={item.icon}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;