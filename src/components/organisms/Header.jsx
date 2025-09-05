import React, { useState } from "react";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import ApperIcon from "@/components/ApperIcon";

const Header = ({ onMenuClick, title = "Dashboard" }) => {
  const [searchValue, setSearchValue] = useState("");

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <ApperIcon name="Menu" className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 font-display">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:block w-64">
            <SearchBar
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search customers, orders..."
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-500 rounded-full flex items-center justify-center">
              <ApperIcon name="User" className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">Farm Manager</p>
              <p className="text-xs text-gray-500">AgriFlow CRM</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;