import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import StatusBadge from "@/components/molecules/StatusBadge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { orderService } from "@/services/api/orderService";
import { customerService } from "@/services/api/customerService";
import { format } from "date-fns";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrderData = async () => {
    try {
      setLoading(true);
      setError("");
      const orderData = await orderService.getById(id);
      const customerData = await customerService.getById(orderData.customerId);
      setOrder(orderData);
      setCustomer(customerData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadOrderData} />;
  if (!order) return <Error message="Order not found" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/orders")}
          >
            <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-display">Order #{order.Id}</h1>
            {customer && <p className="text-gray-600">{customer.name} • {customer.farmName}</p>}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <StatusBadge status={order.status} type="order" />
          <StatusBadge status={order.paymentStatus} type="payment" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Order Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <ApperIcon name="Calendar" className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Order Date: {format(new Date(order.orderDate), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <ApperIcon name="Truck" className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Delivery Date: {format(new Date(order.deliveryDate), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <ApperIcon name="CreditCard" className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Payment Method: {order.paymentMethod}</span>
                  </div>
                </div>
              </div>
              {customer && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <ApperIcon name="User" className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{customer.name}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <ApperIcon name="Building" className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{customer.farmName}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <ApperIcon name="Phone" className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{customer.contactPhone}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">Order Items</h4>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{item.product}</h5>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>Quantity: {item.quantity} {item.unit}</span>
                        <span>Unit Price: ${item.unitPrice.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        ${(item.quantity * item.unitPrice).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-primary-700">Total Amount:</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                    ${order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                <StatusBadge status={order.status} type="order" />
                <div className="text-sm text-blue-600 mt-2">Current Status</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <StatusBadge status={order.paymentStatus} type="payment" />
                <div className="text-sm text-green-600 mt-2">Payment Status</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">
                <ApperIcon name="Edit" className="w-4 h-4 mr-2" />
                Update Status
              </Button>
              <Button variant="outline" className="w-full">
                <ApperIcon name="FileText" className="w-4 h-4 mr-2" />
                Generate Invoice
              </Button>
              <Button variant="outline" className="w-full">
                <ApperIcon name="Truck" className="w-4 h-4 mr-2" />
                Track Delivery
              </Button>
              <Button variant="outline" className="w-full">
                <ApperIcon name="Mail" className="w-4 h-4 mr-2" />
                Send Update
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;