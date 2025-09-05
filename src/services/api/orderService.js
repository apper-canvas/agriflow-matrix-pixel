import ordersData from '../mockData/orders.json';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let orders = [...ordersData];

export const orderService = {
  async getAll() {
    await delay(300);
    return [...orders];
  },

  async getById(id) {
    await delay(200);
    const order = orders.find(o => o.Id === parseInt(id));
    if (!order) {
      throw new Error(`Order with ID ${id} not found`);
    }
    return { ...order };
  },

  async getByCustomerId(customerId) {
    await delay(250);
    return orders.filter(o => o.customerId === customerId.toString());
  },

  async create(orderData) {
    await delay(400);
    const newOrder = {
      ...orderData,
      Id: Math.max(...orders.map(o => o.Id)) + 1,
      orderDate: new Date().toISOString().split('T')[0],
      status: "Confirmed",
      paymentStatus: "Pending"
    };
    orders.push(newOrder);
    return { ...newOrder };
  },

  async update(id, orderData) {
    await delay(350);
    const index = orders.findIndex(o => o.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Order with ID ${id} not found`);
    }
    orders[index] = { ...orders[index], ...orderData };
    return { ...orders[index] };
  },

  async updateStatus(id, status) {
    await delay(300);
    const index = orders.findIndex(o => o.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Order with ID ${id} not found`);
    }
    orders[index] = { ...orders[index], status };
    return { ...orders[index] };
  },

  async delete(id) {
    await delay(250);
    const index = orders.findIndex(o => o.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Order with ID ${id} not found`);
    }
    orders.splice(index, 1);
    return true;
  }
};