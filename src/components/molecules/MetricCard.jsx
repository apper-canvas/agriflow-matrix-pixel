import React from "react";
import { Card, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const MetricCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendDirection = "up", 
  className,
  gradient = "primary"
}) => {
  const gradients = {
    primary: "from-primary-500 to-primary-600",
    secondary: "from-secondary-500 to-secondary-600", 
    accent: "from-accent-500 to-accent-600",
    success: "from-green-500 to-green-600",
    warning: "from-yellow-500 to-yellow-600",
    info: "from-blue-500 to-blue-600"
  };

  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-600"
  };

  return (
    <Card className={cn("overflow-hidden transform hover:scale-105 transition-all duration-300", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className={cn("text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent", gradients[gradient])}>
              {value}
            </p>
            {trend && (
              <div className={cn("flex items-center mt-2 text-sm", trendColors[trendDirection])}>
                <ApperIcon 
                  name={trendDirection === "up" ? "TrendingUp" : trendDirection === "down" ? "TrendingDown" : "Minus"} 
                  className="w-4 h-4 mr-1" 
                />
                <span>{trend}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className={cn("p-3 rounded-full bg-gradient-to-r shadow-lg", gradients[gradient])}>
              <ApperIcon name={icon} className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;