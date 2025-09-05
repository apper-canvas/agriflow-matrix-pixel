import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Card, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import StatusBadge from "@/components/molecules/StatusBadge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { orderService } from "@/services/api/orderService";
import { customerService } from "@/services/api/customerService";
import { format } from "date-fns";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [ordersData, customersData] = await Promise.all([
        orderService.getAll(),
        customerService.getAll()
      ]);
      setOrders(ordersData);
      setCustomers(customersData);
      setFilteredOrders(ordersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!statusFilter) {
      setFilteredOrders(orders);
      return;
    }

    const filtered = orders.filter(order => 
      order.status.toLowerCase() === statusFilter.toLowerCase()
    );
    setFilteredOrders(filtered);
  }, [statusFilter, orders]);

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.Id.toString() === customerId);
    return customer ? customer.name : "Unknown Customer";
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      const updatedOrders = orders.map(order =>
        order.Id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      toast.success("Order status updated successfully");
    } catch (err) {
      toast.error("Failed to update order status");
    }
  };

  if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "Quote", label: "Quote" },
    { value: "Confirmed", label: "Confirmed" },
    { value: "Processing", label: "Processing" },
    { value: "Shipped", label: "Shipped" },
    { value: "Delivered", label: "Delivered" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-display">Order Management</h2>
          <p className="text-gray-600">Track and manage customer orders</p>
        </div>
        <Button 
          onClick={() => navigate("/orders/new")}
          className="flex items-center"
        >
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Create Order
        </Button>
      </div>

      <div className="w-full max-w-xs">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {filteredOrders.length === 0 ? (
        <Empty 
          title="No orders found"
          message={statusFilter ? "No orders match the selected status filter." : "Start by creating your first order."}
          icon="ShoppingCart"
          actionLabel={!statusFilter ? "Create Order" : undefined}
          onAction={!statusFilter ? () => navigate("/orders/new") : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.Id} className="hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.Id}
                        </h3>
                        <p className="text-gray-600 font-medium">
                          {getCustomerName(order.customerId)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={order.status} type="order" />
                        <StatusBadge status={order.paymentStatus} type="payment" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <ApperIcon name="Calendar" className="w-4 h-4 mr-2" />
                        Order: {format(new Date(order.orderDate), "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <ApperIcon name="Truck" className="w-4 h-4 mr-2" />
                        Delivery: {format(new Date(order.deliveryDate), "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <ApperIcon name="CreditCard" className="w-4 h-4 mr-2" />
                        {order.paymentMethod}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                      <div className="space-y-2">
                        {order.items.slice(0, 2).map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.product} ({item.quantity} {item.unit})</span>
                            <span className="font-medium">${(item.quantity * item.unitPrice).toLocaleString()}</span>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-sm text-gray-500">
                            +{order.items.length - 2} more items
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                        ${order.totalAmount.toLocaleString()}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.Id, e.target.value)}
                          className="text-sm"
                        >
                          <option value="Quote">Quote</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </Select>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/orders/${order.Id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
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

export default OrderList;