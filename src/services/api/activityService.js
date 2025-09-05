import activitiesData from '../mockData/activities.json';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let activities = [...activitiesData];

export const activityService = {
  async getAll() {
    await delay(300);
    return [...activities].sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async getById(id) {
    await delay(200);
    const activity = activities.find(a => a.Id === parseInt(id));
    if (!activity) {
      throw new Error(`Activity with ID ${id} not found`);
    }
    return { ...activity };
  },

  async getByCustomerId(customerId) {
    await delay(250);
    return activities
      .filter(a => a.customerId === customerId.toString())
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async create(activityData) {
    await delay(400);
    const newActivity = {
      ...activityData,
      Id: Math.max(...activities.map(a => a.Id)) + 1,
      date: new Date().toISOString().split('T')[0],
      createdBy: "System User"
    };
    activities.push(newActivity);
    return { ...newActivity };
  },

  async update(id, activityData) {
    await delay(350);
    const index = activities.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Activity with ID ${id} not found`);
    }
    activities[index] = { ...activities[index], ...activityData };
    return { ...activities[index] };
  },

  async delete(id) {
    await delay(250);
    const index = activities.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Activity with ID ${id} not found`);
    }
    activities.splice(index, 1);
    return true;
  },

  async getRecent(limit = 10) {
    await delay(200);
    return [...activities]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }
};