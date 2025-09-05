import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Card, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import StatusBadge from "@/components/molecules/StatusBadge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { customerService } from "@/services/api/customerService";
import { format } from "date-fns";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await customerService.getAll();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter(customer => 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.contactEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.primaryCrops.some(crop => crop.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredCustomers(filtered);
  }, [searchQuery, customers]);

  if (loading) return <Loading type="table" />;
  if (error) return <Error message={error} onRetry={loadCustomers} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-display">Customer Management</h2>
          <p className="text-gray-600">Manage your agricultural customer relationships</p>
        </div>
        <Button 
          onClick={() => navigate("/customers/new")}
          className="flex items-center"
        >
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      <div className="w-full max-w-md">
        <SearchBar
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search customers..."
        />
      </div>

      {filteredCustomers.length === 0 ? (
        <Empty 
          title="No customers found"
          message={searchQuery ? "No customers match your search criteria." : "Start by adding your first customer."}
          icon="Users"
          actionLabel={!searchQuery ? "Add Customer" : undefined}
          onAction={!searchQuery ? () => navigate("/customers/new") : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filteredCustomers.map((customer) => (
            <Card key={customer.Id} className="hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      <ApperIcon name="User" className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                        <StatusBadge status={customer.status} type="customer" />
                      </div>
                      <p className="text-gray-600 font-medium">{customer.farmName}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <ApperIcon name="MapPin" className="w-4 h-4 mr-1" />
                          {customer.location.city}, {customer.location.state}
                        </span>
                        <span className="flex items-center">
                          <ApperIcon name="Sprout" className="w-4 h-4 mr-1" />
                          {customer.farmSize} acres
                        </span>
                        <span className="flex items-center">
                          <ApperIcon name="Calendar" className="w-4 h-4 mr-1" />
                          Customer since {format(new Date(customer.customerSince), "MMM yyyy")}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {customer.primaryCrops.map((crop, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gradient-to-r from-secondary-100 to-secondary-50 text-secondary-700 rounded-full text-xs font-medium"
                          >
                            {crop}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/customers/${customer.Id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/customers/${customer.Id}/edit`)}
                    >
                      <ApperIcon name="Edit" className="w-4 h-4" />
                    </Button>
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

export default CustomerList;