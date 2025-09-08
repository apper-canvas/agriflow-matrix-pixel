import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import StatusBadge from "@/components/molecules/StatusBadge";
import ApperIcon from "@/components/ApperIcon";
import { reminderService } from "@/services/api/planningService";
import { format, isToday, isPast, isFuture } from "date-fns";
import { cn } from "@/utils/cn";

const ReminderManager = ({ cropCycleId = null, showAddForm = false, onToggleForm }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(showAddForm);
  const [editingReminder, setEditingReminder] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reminderDate: "",
    reminderType: "Task",
    priority: "Medium"
  });
  const [errors, setErrors] = useState({});

  const reminderTypes = [
    { value: "Task", label: "General Task" },
    { value: "Fertilizer", label: "Fertilizer Application" },
    { value: "Pest Control", label: "Pest Control" },
    { value: "Irrigation", label: "Irrigation" },
    { value: "Harvest", label: "Harvest" },
    { value: "Soil Management", label: "Soil Management" },
    { value: "Equipment", label: "Equipment Maintenance" },
    { value: "Supply Management", label: "Supply Management" },
    { value: "Field Preparation", label: "Field Preparation" }
  ];

  const priorities = [
    { value: "Low", label: "Low Priority" },
    { value: "Medium", label: "Medium Priority" },
    { value: "High", label: "High Priority" }
  ];

  useEffect(() => {
    loadReminders();
  }, [cropCycleId]);

  useEffect(() => {
    setShowForm(showAddForm);
  }, [showAddForm]);

  const loadReminders = async () => {
    try {
      setLoading(true);
      let reminderData;
      
      if (cropCycleId) {
        reminderData = await reminderService.getByCropCycleId(cropCycleId);
      } else {
        reminderData = await reminderService.getAll();
      }
      
      // Sort by reminder date, then by priority
      reminderData.sort((a, b) => {
        const dateCompare = new Date(a.reminderDate) - new Date(b.reminderDate);
        if (dateCompare !== 0) return dateCompare;
        
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
      
      setReminders(reminderData);
    } catch (error) {
      console.error('Failed to load reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.reminderDate) {
      newErrors.reminderDate = "Reminder date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        cropCycleId: cropCycleId || null
      };

      if (editingReminder) {
        await reminderService.update(editingReminder.Id, submitData);
        setEditingReminder(null);
      } else {
        await reminderService.create(submitData);
      }
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        reminderDate: "",
        reminderType: "Task",
        priority: "Medium"
      });
      
      setShowForm(false);
      onToggleForm && onToggleForm(false);
      await loadReminders();
    } catch (error) {
      console.error('Failed to save reminder:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      description: reminder.description,
      reminderDate: reminder.reminderDate,
      reminderType: reminder.reminderType,
      priority: reminder.priority
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) {
      return;
    }

    try {
      await reminderService.delete(id);
      await loadReminders();
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  const handleMarkCompleted = async (id) => {
    try {
      await reminderService.markCompleted(id);
      await loadReminders();
    } catch (error) {
      console.error('Failed to mark reminder as completed:', error);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingReminder(null);
    setFormData({
      title: "",
      description: "",
      reminderDate: "",
      reminderType: "Task",
      priority: "Medium"
    });
    setErrors({});
    onToggleForm && onToggleForm(false);
  };

  const getReminderStatusColor = (reminder) => {
    if (reminder.completed) return "text-green-600 bg-green-50 border-green-200";
    if (isPast(new Date(reminder.reminderDate))) return "text-red-600 bg-red-50 border-red-200";
    if (isToday(new Date(reminder.reminderDate))) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-blue-600 bg-blue-50 border-blue-200";
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "High": return "AlertTriangle";
      case "Medium": return "Clock";
      case "Low": return "Info";
      default: return "Clock";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "text-red-600";
      case "Medium": return "text-yellow-600";
      case "Low": return "text-gray-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {cropCycleId ? 'Crop Cycle Reminders' : 'All Reminders'}
        </h3>
        {!showForm && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowForm(true)}
          >
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            Add Reminder
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ApperIcon name="Bell" className="w-5 h-5" />
              <span>{editingReminder ? 'Edit Reminder' : 'Add New Reminder'}</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {errors.submit}
                </div>
              )}

              <FormField
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Apply fertilizer to corn field"
                required
                error={errors.title}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Reminder Date"
                  name="reminderDate"
                  type="date"
                  value={formData.reminderDate}
                  onChange={handleInputChange}
                  required
                  error={errors.reminderDate}
                />

                <FormField
                  label="Type"
                  name="reminderType"
                  type="select"
                  value={formData.reminderType}
                  onChange={handleInputChange}
                  options={reminderTypes}
                />

                <FormField
                  label="Priority"
                  name="priority"
                  type="select"
                  value={formData.priority}
                  onChange={handleInputChange}
                  options={priorities}
                />
              </div>

              <FormField
                label="Description"
                name="description"
                type="textarea"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Additional details about this reminder..."
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={cancelForm}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <ApperIcon name={editingReminder ? "Save" : "Plus"} className="w-4 h-4" />
                      <span>{editingReminder ? 'Update' : 'Create'}</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reminders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Reminders ({reminders.length})</span>
            {reminders.length > 0 && (
              <div className="text-sm text-gray-500">
                {reminders.filter(r => !r.completed).length} active, {reminders.filter(r => r.completed).length} completed
              </div>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading reminders...</p>
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="Bell" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No reminders found.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setShowForm(true)}
              >
                <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                Create Your First Reminder
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder) => (
                <div
                  key={reminder.Id}
                  className={cn(
                    "border rounded-lg p-4 transition-all hover:shadow-md",
                    getReminderStatusColor(reminder)
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className={cn(
                          "font-medium",
                          reminder.completed && "line-through text-gray-500"
                        )}>
                          {reminder.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <ApperIcon 
                            name={getPriorityIcon(reminder.priority)} 
                            className={cn("w-4 h-4", getPriorityColor(reminder.priority))}
                          />
                          <StatusBadge 
                            status={reminder.reminderType} 
                            type="reminder" 
                            className="text-xs"
                          />
                        </div>
                      </div>
                      
                      {reminder.description && (
                        <p className={cn(
                          "text-sm text-gray-600 mb-2",
                          reminder.completed && "line-through"
                        )}>
                          {reminder.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="Calendar" className="w-3 h-3" />
                          <span>{format(new Date(reminder.reminderDate), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="Flag" className="w-3 h-3" />
                          <span>{reminder.priority} Priority</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {!reminder.completed ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkCompleted(reminder.Id)}
                            title="Mark as completed"
                          >
                            <ApperIcon name="Check" className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(reminder)}
                            title="Edit reminder"
                          >
                            <ApperIcon name="Edit" className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center space-x-1 text-green-600">
                          <ApperIcon name="CheckCircle" className="w-4 h-4" />
                          <span className="text-xs">Completed</span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(reminder.Id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete reminder"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReminderManager;