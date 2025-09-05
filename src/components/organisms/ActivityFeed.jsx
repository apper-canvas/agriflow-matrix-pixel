import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { activityService } from "@/services/api/activityService";
import { customerService } from "@/services/api/customerService";
import { format } from "date-fns";

const ActivityFeed = ({ limit = null, customerId = null }) => {
  const [activities, setActivities] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      let activitiesData;
      
      if (customerId) {
        activitiesData = await activityService.getByCustomerId(customerId);
      } else if (limit) {
        activitiesData = await activityService.getRecent(limit);
      } else {
        activitiesData = await activityService.getAll();
      }
      
      const customersData = await customerService.getAll();
      
      setActivities(activitiesData);
      setCustomers(customersData);
      setFilteredActivities(activitiesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [customerId, limit]);

  useEffect(() => {
    if (!typeFilter) {
      setFilteredActivities(activities);
      return;
    }

    const filtered = activities.filter(activity => 
      activity.type.toLowerCase() === typeFilter.toLowerCase()
    );
    setFilteredActivities(filtered);
  }, [typeFilter, activities]);

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.Id.toString() === customerId);
    return customer ? customer.name : "Unknown Customer";
  };

  const getActivityIcon = (type) => {
    switch (type.toLowerCase()) {
      case "phone call":
        return "Phone";
      case "email":
        return "Mail";
      case "meeting":
        return "Users";
      case "site visit":
        return "MapPin";
      case "order delivery":
        return "Truck";
      case "order shipped":
        return "Package";
      case "quote sent":
        return "FileText";
      case "payment received":
        return "CreditCard";
      case "account review":
        return "Eye";
      default:
        return "Activity";
    }
  };

  const getActivityColor = (type) => {
    switch (type.toLowerCase()) {
      case "phone call":
        return "from-blue-500 to-blue-600";
      case "email":
        return "from-purple-500 to-purple-600";
      case "meeting":
        return "from-green-500 to-green-600";
      case "site visit":
        return "from-orange-500 to-orange-600";
      case "order delivery":
      case "order shipped":
        return "from-indigo-500 to-indigo-600";
      case "quote sent":
        return "from-yellow-500 to-yellow-600";
      case "payment received":
        return "from-emerald-500 to-emerald-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  if (loading) return <Loading type={limit ? "cards" : "table"} />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "Phone Call", label: "Phone Call" },
    { value: "Email", label: "Email" },
    { value: "Meeting", label: "Meeting" },
    { value: "Site Visit", label: "Site Visit" },
    { value: "Order Delivery", label: "Order Delivery" },
    { value: "Order Shipped", label: "Order Shipped" },
    { value: "Quote Sent", label: "Quote Sent" },
    { value: "Payment Received", label: "Payment Received" }
  ];

  return (
    <div className="space-y-6">
      {!limit && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-display">Activity Timeline</h2>
            <p className="text-gray-600">Track all customer interactions and updates</p>
          </div>
          <Button>
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Log Activity
          </Button>
        </div>
      )}

      {!limit && !customerId && (
        <div className="w-full max-w-xs">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      )}

      {filteredActivities.length === 0 ? (
        <Empty 
          title="No activities found"
          message={typeFilter ? "No activities match the selected type filter." : "No activities have been logged yet."}
          icon="Activity"
          actionLabel={!typeFilter ? "Log Activity" : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
            <Card key={activity.Id} className="hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 bg-gradient-to-r ${getActivityColor(activity.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <ApperIcon name={getActivityIcon(activity.type)} className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-semibold text-gray-900">{activity.type}</h4>
                        <span className="px-2 py-1 bg-gradient-to-r from-primary-100 to-primary-50 text-primary-700 rounded-full text-xs font-medium">
                          {activity.createdBy}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(activity.date), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                    </div>
                    {!customerId && (
                      <p className="text-gray-600 font-medium mb-2">
                        Customer: {getCustomerName(activity.customerId)}
                      </p>
                    )}
                    <p className="text-gray-700 leading-relaxed">{activity.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;