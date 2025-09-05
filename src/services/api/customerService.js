import customersData from '../mockData/customers.json';

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let customers = [...customersData];

export const customerService = {
  async getAll() {
    await delay(300);
    return [...customers];
  },

  async getById(id) {
    await delay(200);
    const customer = customers.find(c => c.Id === parseInt(id));
    if (!customer) {
      throw new Error(`Customer with ID ${id} not found`);
    }
    return { ...customer };
  },

  async create(customerData) {
    await delay(400);
    const newCustomer = {
      ...customerData,
      Id: Math.max(...customers.map(c => c.Id)) + 1,
      customerSince: new Date().toISOString().split('T')[0],
      status: "Active"
    };
    customers.push(newCustomer);
    return { ...newCustomer };
  },

  async update(id, customerData) {
    await delay(350);
    const index = customers.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Customer with ID ${id} not found`);
    }
    customers[index] = { ...customers[index], ...customerData };
    return { ...customers[index] };
  },

  async delete(id) {
    await delay(250);
    const index = customers.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Customer with ID ${id} not found`);
    }
    customers.splice(index, 1);
    return true;
  },

  async search(query) {
    await delay(200);
    if (!query || query.trim() === '') {
      return [...customers];
    }
    
    const searchTerm = query.toLowerCase();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm) ||
      customer.farmName.toLowerCase().includes(searchTerm) ||
      customer.contactEmail.toLowerCase().includes(searchTerm) ||
      customer.location.city.toLowerCase().includes(searchTerm) ||
      customer.primaryCrops.some(crop => crop.toLowerCase().includes(searchTerm))
    );
  }
};