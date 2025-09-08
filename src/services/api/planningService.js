import mockCropCycles from "@/services/mockData/cropCycles.json";
import mockReminders from "@/services/mockData/reminders.json";
import { toast } from "react-toastify";

// Crop Types with growing periods (in days)
const CROP_TYPES = {
  "Corn": 120,
  "Soybeans": 100,
  "Wheat": 90,
  "Cotton": 180,
  "Rice": 130,
  "Tomatoes": 85,
  "Potatoes": 70,
  "Lettuce": 45,
  "Carrots": 75,
  "Onions": 110
};

// In-memory storage
let cropCycles = [...mockCropCycles];
let reminders = [...mockReminders];
let nextCropId = Math.max(...cropCycles.map(c => c.Id), 0) + 1;
let nextReminderId = Math.max(...reminders.map(r => r.Id), 0) + 1;

// Utility functions
const calculateHarvestDate = (plantingDate, cropType) => {
  const growingPeriod = CROP_TYPES[cropType] || 90;
  const harvest = new Date(plantingDate);
  harvest.setDate(harvest.getDate() + growingPeriod);
  return harvest.toISOString().split('T')[0];
};

const addBusinessDays = (date, days) => {
  const result = new Date(date);
  let count = 0;
  while (count < days) {
    result.setDate(result.getDate() + 1);
    if (result.getDay() % 6 !== 0) { // Skip weekends
      count++;
    }
  }
  return result;
};

// Crop Cycle Services
export const cropCycleService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...cropCycles];
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const cropCycle = cropCycles.find(c => c.Id === parseInt(id));
    if (!cropCycle) {
      throw new Error(`Crop cycle with ID ${id} not found`);
    }
    return { ...cropCycle };
  },

  async getByDateRange(startDate, endDate) {
    await new Promise(resolve => setTimeout(resolve, 250));
    return cropCycles.filter(cycle => {
      const plantDate = new Date(cycle.plantingDate);
      const harvestDate = new Date(cycle.harvestDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      return (plantDate >= start && plantDate <= end) ||
             (harvestDate >= start && harvestDate <= end) ||
             (plantDate <= start && harvestDate >= end);
    });
  },

  async create(cropCycleData) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    if (!cropCycleData.cropType || !cropCycleData.plantingDate || !cropCycleData.fieldLocation) {
      throw new Error("Crop type, planting date, and field location are required");
    }

    const harvestDate = calculateHarvestDate(cropCycleData.plantingDate, cropCycleData.cropType);
    
    const newCropCycle = {
      Id: nextCropId++,
      cropType: cropCycleData.cropType,
      variety: cropCycleData.variety || "",
      fieldLocation: cropCycleData.fieldLocation,
      plantingDate: cropCycleData.plantingDate,
      harvestDate: harvestDate,
      plannedHarvestDate: cropCycleData.plannedHarvestDate || harvestDate,
      acreage: cropCycleData.acreage || 0,
      status: "Planned",
      notes: cropCycleData.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    cropCycles.unshift(newCropCycle);
    toast.success(`${cropCycleData.cropType} crop cycle created successfully`);
    return { ...newCropCycle };
  },

  async update(id, cropCycleData) {
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const index = cropCycles.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Crop cycle with ID ${id} not found`);
    }

    // Recalculate harvest date if planting date or crop type changed
    let harvestDate = cropCycles[index].harvestDate;
    if (cropCycleData.plantingDate && cropCycleData.plantingDate !== cropCycles[index].plantingDate ||
        cropCycleData.cropType && cropCycleData.cropType !== cropCycles[index].cropType) {
      harvestDate = calculateHarvestDate(
        cropCycleData.plantingDate || cropCycles[index].plantingDate,
        cropCycleData.cropType || cropCycles[index].cropType
      );
    }

    const updatedCropCycle = {
      ...cropCycles[index],
      ...cropCycleData,
      harvestDate: cropCycleData.harvestDate || harvestDate,
      updatedAt: new Date().toISOString()
    };

    cropCycles[index] = updatedCropCycle;
    toast.success(`${updatedCropCycle.cropType} crop cycle updated successfully`);
    return { ...updatedCropCycle };
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = cropCycles.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Crop cycle with ID ${id} not found`);
    }

    const deletedCropCycle = cropCycles[index];
    cropCycles.splice(index, 1);
    
    // Also delete related reminders
    reminders = reminders.filter(r => r.cropCycleId !== parseInt(id));
    
    toast.success(`${deletedCropCycle.cropType} crop cycle deleted successfully`);
    return { ...deletedCropCycle };
  },

  async updateStatus(id, status) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = cropCycles.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Crop cycle with ID ${id} not found`);
    }

    cropCycles[index] = {
      ...cropCycles[index],
      status,
      updatedAt: new Date().toISOString()
    };

    toast.success(`Crop cycle status updated to ${status}`);
    return { ...cropCycles[index] };
  }
};

// Reminder Services
export const reminderService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 250));
    return [...reminders];
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const reminder = reminders.find(r => r.Id === parseInt(id));
    if (!reminder) {
      throw new Error(`Reminder with ID ${id} not found`);
    }
    return { ...reminder };
  },

  async getByCropCycleId(cropCycleId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return reminders.filter(r => r.cropCycleId === parseInt(cropCycleId));
  },

  async getUpcoming(days = 7) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    return reminders.filter(reminder => {
      const reminderDate = new Date(reminder.reminderDate);
      return reminderDate >= today && reminderDate <= futureDate && !reminder.completed;
    }).sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate));
  },

  async create(reminderData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!reminderData.title || !reminderData.reminderDate) {
      throw new Error("Title and reminder date are required");
    }

    const newReminder = {
      Id: nextReminderId++,
      title: reminderData.title,
      description: reminderData.description || "",
      reminderDate: reminderData.reminderDate,
      reminderType: reminderData.reminderType || "Task",
      cropCycleId: reminderData.cropCycleId || null,
      priority: reminderData.priority || "Medium",
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    reminders.unshift(newReminder);
    toast.success(`Reminder "${reminderData.title}" created successfully`);
    return { ...newReminder };
  },

  async update(id, reminderData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = reminders.findIndex(r => r.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Reminder with ID ${id} not found`);
    }

    const updatedReminder = {
      ...reminders[index],
      ...reminderData,
      updatedAt: new Date().toISOString()
    };

    reminders[index] = updatedReminder;
    toast.success(`Reminder "${updatedReminder.title}" updated successfully`);
    return { ...updatedReminder };
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = reminders.findIndex(r => r.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Reminder with ID ${id} not found`);
    }

    const deletedReminder = reminders[index];
    reminders.splice(index, 1);
    toast.success(`Reminder "${deletedReminder.title}" deleted successfully`);
    return { ...deletedReminder };
  },

  async markCompleted(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const index = reminders.findIndex(r => r.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Reminder with ID ${id} not found`);
    }

    reminders[index] = {
      ...reminders[index],
      completed: true,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    toast.success(`Reminder "${reminders[index].title}" marked as completed`);
    return { ...reminders[index] };
  }
};

// Utility exports
export { CROP_TYPES };