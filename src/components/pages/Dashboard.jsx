import React from "react";
import DashboardMetrics from "@/components/organisms/DashboardMetrics";
import ActivityFeed from "@/components/organisms/ActivityFeed";

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 font-display mb-2">
          Welcome to AgriFlow CRM
        </h1>
        <p className="text-gray-600">
          Manage your agricultural customer relationships and track business performance
        </p>
      </div>

      <DashboardMetrics />

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 font-display">Recent Activities</h2>
          <p className="text-sm text-gray-500">Last 10 activities</p>
        </div>
        <ActivityFeed limit={10} />
      </div>
    </div>
  );
};

export default Dashboard;