import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import StatusBadge from "@/components/molecules/StatusBadge";
import ActivityFeed from "@/components/organisms/ActivityFeed";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { customerService } from "@/services/api/customerService";
import { orderService } from "@/services/api/orderService";
import { format } from "date-fns";

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      setError("");
      const [customerData, ordersData] = await Promise.all([
        customerService.getById(id),
        orderService.getByCustomerId(id)
      ]);
      setCustomer(customerData);
      setOrders(ordersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadCustomerData} />;
  if (!customer) return <Error message="Customer not found" />;

  const totalOrderValue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const paidOrders = orders.filter(order => order.paymentStatus === "Paid");
  const totalPaidValue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/customers")}
          >
            <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
            Back to Customers
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-display">{customer.name}</h1>
            <p className="text-gray-600">{customer.farmName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <StatusBadge status={customer.status} type="customer" />
          <Button onClick={() => navigate(`/customers/${customer.Id}/edit`)}>
            <ApperIcon name="Edit" className="w-4 h-4 mr-2" />
            Edit Customer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Contact Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <ApperIcon name="Phone" className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{customer.contactPhone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <ApperIcon name="Mail" className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{customer.contactEmail}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <ApperIcon name="MapPin" className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{customer.location.address}<br />
                    {customer.location.city}, {customer.location.state} {customer.location.zipCode}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Farm Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <ApperIcon name="Sprout" className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{customer.farmSize} acres</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <ApperIcon name="Calendar" className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Customer since {format(new Date(customer.customerSince), "MMMM yyyy")}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <h5 className="font-medium text-gray-700 mb-2">Primary Crops</h5>
                  <div className="flex flex-wrap gap-2">
                    {customer.primaryCrops.map((crop, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-secondary-100 to-secondary-50 text-secondary-700 rounded-full text-sm font-medium"
                      >
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {customer.notes && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
                  {customer.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                  {orders.length}
                </div>
                <div className="text-sm text-primary-600">Total Orders</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-accent-50 to-accent-100 rounded-lg">
                <div className="text-2xl font-bold bg-gradient-to-r from-accent-600 to-accent-500 bg-clip-text text-transparent">
                  ${totalOrderValue.toLocaleString()}
                </div>
                <div className="text-sm text-accent-600">Total Order Value</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                  ${totalPaidValue.toLocaleString()}
                </div>
                <div className="text-sm text-green-600">Total Paid</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => navigate("/orders/new")}>
                <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                Create New Order
              </Button>
              <Button variant="outline" className="w-full">
                <ApperIcon name="Phone" className="w-4 h-4 mr-2" />
                Log Phone Call
              </Button>
              <Button variant="outline" className="w-full">
                <ApperIcon name="MapPin" className="w-4 h-4 mr-2" />
                Schedule Visit
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="ShoppingCart" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No orders found for this customer.</p>
              <Button className="mt-4" onClick={() => navigate("/orders/new")}>
                Create First Order
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
                <div key={order.Id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-gray-900">Order #{order.Id}</h4>
                      <StatusBadge status={order.status} type="order" />
                    </div>
                    <p className="text-sm text-gray-600">
                      {format(new Date(order.orderDate), "MMM d, yyyy")} • ${order.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/orders/${order.Id}`)}
                  >
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityFeed customerId={id.toString()} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDetail;