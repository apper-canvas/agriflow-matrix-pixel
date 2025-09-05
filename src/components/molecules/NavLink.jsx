import React from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const NavLink = ({ to, icon, children, className }) => {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center px-4 py-3 text-gray-700 rounded-lg transition-all duration-200 group",
          "hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 hover:text-primary-700",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
          isActive && "bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 font-medium shadow-sm",
          className
        )
      }
    >
      {icon && (
        <ApperIcon 
          name={icon} 
          className="w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-110" 
        />
      )}
      <span className="font-medium">{children}</span>
    </RouterNavLink>
  );
};

export default NavLink;