import React from "react";
import Badge from "@/components/atoms/Badge";

const StatusBadge = ({ status, type = "order" }) => {
  const getVariant = (status, type) => {
    if (type === "customer") {
      switch (status?.toLowerCase()) {
        case "active":
          return "active";
        case "inactive":
          return "inactive";
        default:
          return "default";
      }
    }
    
    if (type === "order") {
      switch (status?.toLowerCase()) {
        case "delivered":
        case "completed":
          return "success";
        case "shipped":
        case "processing":
          return "info";
        case "confirmed":
          return "primary";
        case "quote":
          return "warning";
        case "cancelled":
        case "failed":
          return "danger";
        default:
          return "default";
      }
    }

    if (type === "payment") {
      switch (status?.toLowerCase()) {
        case "paid":
          return "success";
        case "pending":
          return "warning";
        case "overdue":
        case "failed":
          return "danger";
        case "not required":
          return "info";
        default:
          return "default";
      }
    }

    return "default";
  };

  return (
    <Badge variant={getVariant(status, type)}>
      {status}
    </Badge>
  );
};

export default StatusBadge;