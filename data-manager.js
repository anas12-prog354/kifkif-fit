// Shared Data Manager for Kifkif-Fit Website and Admin Panel
// This file handles all data persistence using localStorage

class DataManager {
  constructor() {
    this.storagePrefix = 'kifkif_';
    this.initializeDefaultData();
  }

  initializeDefaultData() {
        const products = this.getProducts();
        if (!products || products.length === 0) {
    this.setProducts([
        { id: 1, name: 'Performance Tank', price: 79.99, category: 'tops', size: 'XS-XL', color: '#667eea', emoji: '👕', description: 'Breathable performance tank top perfect for intense workouts', stock: 50 },
        { id: 2, name: 'Compression Shirt', price: 99.99, category: 'tops', size: 'XS-XL', color: '#764ba2', emoji: '👔', description: 'Moisture-wicking compression shirt for maximum support', stock: 30 },
        { id: 3, name: 'Yoga Leggings', price: 149.99, category: 'bottoms', size: 'XS-XL', color: '#f093fb', emoji: '🩳', description: 'High-waisted yoga leggings with pockets for all-day comfort', stock: 5 },
        { id: 4, name: 'Gym Shorts', price: 89.99, category: 'bottoms', size: 'XS-XL', color: '#4facfe', emoji: '⚽', description: 'Lightweight gym shorts with built-in compression', stock: 20 },
        { id: 5, name: 'Sports Bra', price: 119.99, category: 'tops', size: 'XS-XL', color: '#43e97b', emoji: '🎽', description: 'High-impact sports bra with excellent support and comfort', stock: 40 },
        { id: 6, name: 'Training Jacket', price: 199.99, category: 'tops', size: 'XS-XL', color: '#fa709a', emoji: '🧥', description: 'Water-resistant training jacket for outdoor activities', stock: 2 },
        { id: 7, name: 'Gym Socks', price: 34.99, category: 'accessories', size: 'One Size', color: '#fee140', emoji: '🧦', description: 'Cushioned gym socks with arch support', stock: 100 },
        { id: 8, name: 'Wrist Wraps', price: 39.99, category: 'accessories', size: 'One Size', color: '#30b0fe', emoji: '⏱️', description: 'Professional-grade wrist wraps for weightlifting', stock: 15 }
      ]);
    }
  }

  // Products Management
  getProducts() {
    return JSON.parse(localStorage.getItem(this.storagePrefix + 'products')) || [];
  }

  setProducts(products) {
    localStorage.setItem(this.storagePrefix + 'products', JSON.stringify(products));
  }

  updateProduct(id, updates) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updates };
      this.setProducts(products);
    }
  }

  addProduct(product) {
    const products = this.getProducts();
    product.id = Math.max(...products.map(p => p.id), 0) + 1;
    product.stock = 0;
    product.color = '#667eea';
    product.emoji = '👕';
    products.push(product);
    this.setProducts(products);
    return product;
  }

  deleteProduct(id) {
    const products = this.getProducts();
    this.setProducts(products.filter(p => p.id !== id));
  }

  // Orders Management
  getOrders() {
    return JSON.parse(localStorage.getItem(this.storagePrefix + 'orders')) || [];
  }

  addOrder(orderData) {
    const orders = this.getOrders();
    const order = {
      id: 'ORD' + String(orders.length + 1).padStart(3, '0'),
      ...orderData,
      status: 'pending',
      date: new Date().toLocaleDateString()
    };
    
    // Reduce stock for ordered items
    let products = this.getProducts();
    orderData.items.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
      }
    });
    this.setProducts(products);
    
    orders.push(order);
    localStorage.setItem(this.storagePrefix + 'orders', JSON.stringify(orders));
    
    this.updateCustomerData(order);
    return order;
  }

  updateOrderStatus(orderId, status) {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      localStorage.setItem(this.storagePrefix + 'orders', JSON.stringify(orders));
    }
  }

  // Customers Management
  getCustomers() {
    return JSON.parse(localStorage.getItem(this.storagePrefix + 'customers')) || [];
  }

  updateCustomerData(order) {
    const customers = this.getCustomers();
    let customer = customers.find(c => c.email === order.email);
    
    if (customer) {
      customer.orderCount++;
      customer.totalSpent += order.total;
      customer.lastOrder = order.date;
    } else {
      customer = {
        name: order.name,
        email: order.email,
        phone: order.phone,
        orderCount: 1,
        totalSpent: order.total,
        lastOrder: order.date
      };
      customers.push(customer);
    }
    
    localStorage.setItem(this.storagePrefix + 'customers', JSON.stringify(customers));
  }

  // Inventory Management
  getInventory() {
    const products = this.getProducts();
    return products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock
    }));
  }

  updateStock(productId, newStock) {
    this.updateProduct(productId, { stock: Math.max(0, newStock) });
  }

  getLowStockItems() {
    return this.getProducts().filter(p => p.stock < 10);
  }

  getTotalRevenue() {
    return this.getOrders()
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0);
  }

  clearAllData() {
    localStorage.removeItem(this.storagePrefix + 'products');
    localStorage.removeItem(this.storagePrefix + 'orders');
    localStorage.removeItem(this.storagePrefix + 'customers');
    this.initializeDefaultData();
  }
}

const dataManager = new DataManager();
