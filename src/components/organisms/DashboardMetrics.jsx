import React, { useState, useEffect } from "react";
import MetricCard from "@/components/molecules/MetricCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { customerService } from "@/services/api/customerService";
import { orderService } from "@/services/api/orderService";
import { activityService } from "@/services/api/activityService";

const DashboardMetrics = () => {
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    recentActivities: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [customers, orders, activities] = await Promise.all([
        customerService.getAll(),
        orderService.getAll(),
        activityService.getRecent(30)
      ]);

      const activeCustomers = customers.filter(c => c.status === "Active").length;
      const pendingOrders = orders.filter(o => ["Quote", "Confirmed", "Processing"].includes(o.status)).length;
      const totalRevenue = orders
        .filter(o => o.status === "Delivered" && o.paymentStatus === "Paid")
        .reduce((sum, order) => sum + order.totalAmount, 0);

      setMetrics({
        totalCustomers: customers.length,
        activeCustomers,
        totalOrders: orders.length,
        pendingOrders,
        totalRevenue,
        recentActivities: activities.length
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  if (loading) return <Loading type="cards" />;
  if (error) return <Error message={error} onRetry={loadMetrics} />;

  const metricsData = [
    {
      title: "Total Customers",
      value: metrics.totalCustomers,
      icon: "Users",
      trend: "+12% from last month",
      trendDirection: "up",
      gradient: "primary"
    },
    {
      title: "Active Customers", 
      value: metrics.activeCustomers,
      icon: "UserCheck",
      trend: `${Math.round((metrics.activeCustomers / metrics.totalCustomers) * 100)}% of total`,
      trendDirection: "up",
      gradient: "success"
    },
    {
      title: "Total Orders",
      value: metrics.totalOrders,
      icon: "ShoppingCart",
      trend: "+8% from last month",
      trendDirection: "up",
      gradient: "info"
    },
    {
      title: "Pending Orders",
      value: metrics.pendingOrders,
      icon: "Clock",
      trend: "Need attention",
      trendDirection: "neutral",
      gradient: "warning"
    },
    {
      title: "Revenue (Collected)",
      value: `$${metrics.totalRevenue.toLocaleString()}`,
      icon: "DollarSign",
      trend: "+15% from last month",
      trendDirection: "up",
      gradient: "accent"
    },
    {
      title: "Recent Activities",
      value: metrics.recentActivities,
      icon: "Activity",
      trend: "Last 30 days",
      trendDirection: "neutral",
      gradient: "secondary"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metricsData.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          trend={metric.trend}
          trendDirection={metric.trendDirection}
          gradient={metric.gradient}
        />
      ))}
    </div>
  );
};

export default DashboardMetrics;