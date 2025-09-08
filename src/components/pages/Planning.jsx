import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import MetricCard from "@/components/molecules/MetricCard";
import CalendarComponent from "@/components/organisms/CalendarComponent";
import CropCycleForm from "@/components/molecules/CropCycleForm";
import ReminderManager from "@/components/molecules/ReminderManager";
import StatusBadge from "@/components/molecules/StatusBadge";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { cropCycleService, reminderService } from "@/services/api/planningService";
import { format, isToday, isFuture, isPast } from "date-fns";

const Planning = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCropForm, setShowCropForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [selectedCropCycle, setSelectedCropCycle] = useState(null);
  const [cropCycles, setCropCycles] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [metrics, setMetrics] = useState({
    totalCrops: 0,
    activeCycles: 0,
    totalAcreage: 0,
    upcomingHarvests: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPlanningData();
  }, []);

  const loadPlanningData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [cropsData, remindersData] = await Promise.all([
        cropCycleService.getAll(),
        reminderService.getUpcoming(14) // Next 2 weeks
      ]);

      setCropCycles(cropsData);
      setUpcomingReminders(remindersData);

      // Calculate metrics
      const activeCycles = cropsData.filter(cycle => 
        cycle.status === "Growing" || cycle.status === "Planned"
      );
      
      const totalAcreage = cropsData.reduce((sum, cycle) => sum + (cycle.acreage || 0), 0);
      
      const upcomingHarvests = cropsData.filter(cycle => {
        const harvestDate = new Date(cycle.harvestDate);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return harvestDate <= thirtyDaysFromNow && cycle.status !== "Harvested";
      }).length;

      setMetrics({
        totalCrops: cropsData.length,
        activeCycles: activeCycles.length,
        totalAcreage: totalAcreage,
        upcomingHarvests: upcomingHarvests
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowCropForm(true);
  };

  const handleCropCycleClick = (cropCycle) => {
    setSelectedCropCycle(cropCycle);
  };

  const handleFormSuccess = async () => {
    setShowCropForm(false);
    setSelectedDate(null);
    setSelectedCropCycle(null);
    await loadPlanningData();
  };

  const handleFormCancel = () => {
    setShowCropForm(false);
    setSelectedDate(null);
    setSelectedCropCycle(null);
  };

  const handleReminderFormToggle = (show) => {
    setShowReminderForm(show);
  };

  const deleteCropCycle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this crop cycle?')) {
      return;
    }

    try {
      await cropCycleService.delete(id);
      await loadPlanningData();
      if (selectedCropCycle && selectedCropCycle.Id === id) {
        setSelectedCropCycle(null);
      }
    } catch (error) {
      console.error('Failed to delete crop cycle:', error);
    }
  };

  const updateCropStatus = async (id, status) => {
    try {
      await cropCycleService.updateStatus(id, status);
      await loadPlanningData();
      if (selectedCropCycle && selectedCropCycle.Id === id) {
        setSelectedCropCycle(prev => ({ ...prev, status }));
      }
    } catch (error) {
      console.error('Failed to update crop status:', error);
    }
  };

  if (loading) return <Loading type="cards" />;
  if (error) return <Error message={error} onRetry={loadPlanningData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">
            Crop Planning & Calendar
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your crop cycles, track harvest predictions, and set reminders
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowReminderForm(true)}
          >
            <ApperIcon name="Bell" className="w-4 h-4 mr-2" />
            Add Reminder
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowCropForm(true)}
          >
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Crop Cycle
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Crop Cycles"
          value={metrics.totalCrops}
          icon="Sprout"
          gradient="primary"
        />
        <MetricCard
          title="Active Cycles"
          value={metrics.activeCycles}
          icon="Activity"
          gradient="secondary"
        />
        <MetricCard
          title="Total Acreage"
          value={`${metrics.totalAcreage.toFixed(1)}`}
          icon="Maximize2"
          gradient="accent"
        />
        <MetricCard
          title="Upcoming Harvests"
          value={metrics.upcomingHarvests}
          icon="Scissors"
          gradient="success"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <CalendarComponent
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
            onCropCycleClick={handleCropCycleClick}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Crop Cycle Details */}
          {selectedCropCycle && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ApperIcon name="Sprout" className="w-5 h-5" />
                  <span>Crop Cycle Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {selectedCropCycle.cropType}
                    {selectedCropCycle.variety && ` - ${selectedCropCycle.variety}`}
                  </h4>
                  <div className="flex items-center space-x-2 mb-3">
                    <StatusBadge status={selectedCropCycle.status} type="crop" />
                    <span className="text-sm text-gray-500">
                      {selectedCropCycle.fieldLocation}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Planting Date:</span>
                    <span className="font-medium">
                      {format(new Date(selectedCropCycle.plantingDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Harvest Date:</span>
                    <span className="font-medium">
                      {format(new Date(selectedCropCycle.harvestDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {selectedCropCycle.acreage > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Acreage:</span>
                      <span className="font-medium">{selectedCropCycle.acreage} acres</span>
                    </div>
                  )}
                </div>

                {selectedCropCycle.notes && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Notes:</h5>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {selectedCropCycle.notes}
                    </p>
                  </div>
                )}

                <div className="flex flex-col space-y-2 pt-4">
                  {selectedCropCycle.status === "Planned" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => updateCropStatus(selectedCropCycle.Id, "Growing")}
                    >
                      <ApperIcon name="Play" className="w-4 h-4 mr-2" />
                      Mark as Growing
                    </Button>
                  )}
                  {selectedCropCycle.status === "Growing" && (
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => updateCropStatus(selectedCropCycle.Id, "Harvested")}
                    >
                      <ApperIcon name="Scissors" className="w-4 h-4 mr-2" />
                      Mark as Harvested
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCropCycle(selectedCropCycle);
                      setShowCropForm(true);
                    }}
                  >
                    <ApperIcon name="Edit" className="w-4 h-4 mr-2" />
                    Edit Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCropCycle(selectedCropCycle.Id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4 mr-2" />
                    Delete Cycle
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ApperIcon name="Bell" className="w-5 h-5" />
                <span>Upcoming Reminders</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingReminders.length === 0 ? (
                <div className="text-center py-4">
                  <ApperIcon name="Bell" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No upcoming reminders</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingReminders.slice(0, 5).map((reminder) => (
                    <div key={reminder.Id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        isToday(new Date(reminder.reminderDate)) ? 'bg-orange-500' :
                        isPast(new Date(reminder.reminderDate)) ? 'bg-red-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium text-gray-900 truncate">
                          {reminder.title}
                        </h5>
                        <p className="text-xs text-gray-600">
                          {format(new Date(reminder.reminderDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {upcomingReminders.length > 5 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{upcomingReminders.length - 5} more reminders
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Forms */}
      {showCropForm && (
        <CropCycleForm
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          initialDate={selectedDate}
          editingCycle={selectedCropCycle}
        />
      )}

      {showReminderForm && (
        <ReminderManager
          showAddForm={true}
          onToggleForm={handleReminderFormToggle}
        />
      )}

      {/* All Crop Cycles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ApperIcon name="List" className="w-5 h-5" />
              <span>All Crop Cycles</span>
            </div>
            <span className="text-sm text-gray-500">{cropCycles.length} total</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cropCycles.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="Sprout" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No crop cycles found.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowCropForm(true)}
              >
                <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                Create Your First Crop Cycle
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cropCycles.map((cycle) => (
                <div
                  key={cycle.Id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedCropCycle(cycle)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                      <ApperIcon name="Sprout" className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {cycle.cropType}
                        {cycle.variety && ` - ${cycle.variety}`}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{cycle.fieldLocation}</span>
                        <span>{cycle.acreage > 0 && `${cycle.acreage} acres`}</span>
                        <span>
                          {format(new Date(cycle.plantingDate), 'MMM d')} → {format(new Date(cycle.harvestDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={cycle.status} type="crop" />
                    <ApperIcon name="ChevronRight" className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Reminders Section */}
      <ReminderManager />
    </div>
  );
};

export default Planning;