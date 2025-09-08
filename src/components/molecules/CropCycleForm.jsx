import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import { CROP_TYPES, cropCycleService } from "@/services/api/planningService";
import { format } from "date-fns";

const CropCycleForm = ({ onSuccess, onCancel, initialDate, editingCycle = null }) => {
  const [formData, setFormData] = useState({
    cropType: editingCycle?.cropType || "",
    variety: editingCycle?.variety || "",
    fieldLocation: editingCycle?.fieldLocation || "",
    plantingDate: editingCycle?.plantingDate || (initialDate ? format(initialDate, 'yyyy-MM-dd') : ""),
    plannedHarvestDate: editingCycle?.plannedHarvestDate || "",
    acreage: editingCycle?.acreage || "",
    notes: editingCycle?.notes || ""
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const cropOptions = Object.keys(CROP_TYPES).map(crop => ({
    value: crop,
    label: `${crop} (${CROP_TYPES[crop]} days)`
  }));

  const fieldLocations = [
    "North Field A", "North Field B", "North Field C",
    "South Field A", "South Field B", "South Field C", 
    "East Field A", "East Field B", "East Field C",
    "West Field A", "West Field B", "West Field C",
    "Greenhouse 1", "Greenhouse 2", "Greenhouse 3"
  ];

  const fieldOptions = fieldLocations.map(field => ({
    value: field,
    label: field
  }));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.cropType) {
      newErrors.cropType = "Crop type is required";
    }
    
    if (!formData.fieldLocation) {
      newErrors.fieldLocation = "Field location is required";
    }
    
    if (!formData.plantingDate) {
      newErrors.plantingDate = "Planting date is required";
    }
    
    if (formData.acreage && (isNaN(formData.acreage) || parseFloat(formData.acreage) <= 0)) {
      newErrors.acreage = "Acreage must be a positive number";
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
        acreage: formData.acreage ? parseFloat(formData.acreage) : 0
      };

      if (editingCycle) {
        await cropCycleService.update(editingCycle.Id, submitData);
      } else {
        await cropCycleService.create(submitData);
      }
      
      onSuccess && onSuccess();
    } catch (error) {
      console.error('Failed to save crop cycle:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const predictedHarvestDate = formData.cropType && formData.plantingDate 
    ? (() => {
        const growingPeriod = CROP_TYPES[formData.cropType];
        const plantDate = new Date(formData.plantingDate);
        const harvestDate = new Date(plantDate);
        harvestDate.setDate(harvestDate.getDate() + growingPeriod);
        return format(harvestDate, 'MMM d, yyyy');
      })()
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ApperIcon name="Sprout" className="w-5 h-5" />
          <span>{editingCycle ? 'Edit Crop Cycle' : 'Add New Crop Cycle'}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Crop Type"
              name="cropType"
              type="select"
              value={formData.cropType}
              onChange={handleInputChange}
              options={cropOptions}
              placeholder="Select crop type..."
              required
              error={errors.cropType}
            />

            <FormField
              label="Variety"
              name="variety"
              value={formData.variety}
              onChange={handleInputChange}
              placeholder="e.g., Pioneer P1234"
              error={errors.variety}
            />

            <FormField
              label="Field Location"
              name="fieldLocation"
              type="select"
              value={formData.fieldLocation}
              onChange={handleInputChange}
              options={fieldOptions}
              placeholder="Select field location..."
              required
              error={errors.fieldLocation}
            />

            <FormField
              label="Acreage"
              name="acreage"
              type="number"
              value={formData.acreage}
              onChange={handleInputChange}
              placeholder="0.0"
              error={errors.acreage}
            />

            <FormField
              label="Planting Date"
              name="plantingDate"
              type="date"
              value={formData.plantingDate}
              onChange={handleInputChange}
              required
              error={errors.plantingDate}
            />

            <FormField
              label="Planned Harvest Date"
              name="plannedHarvestDate"
              type="date"
              value={formData.plannedHarvestDate}
              onChange={handleInputChange}
              error={errors.plannedHarvestDate}
            />
          </div>

          {predictedHarvestDate && (
            <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-accent-700">
                <ApperIcon name="Calendar" className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Predicted harvest date: {predictedHarvestDate}
                </span>
              </div>
              <p className="text-xs text-accent-600 mt-1">
                Based on typical {CROP_TYPES[formData.cropType]} day growing period for {formData.cropType}
              </p>
            </div>
          )}

          <FormField
            label="Notes"
            name="notes"
            type="textarea"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Additional notes about this crop cycle..."
            error={errors.notes}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <ApperIcon name={editingCycle ? "Save" : "Plus"} className="w-4 h-4" />
                  <span>{editingCycle ? 'Update' : 'Create'} Cycle</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CropCycleForm;