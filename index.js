// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB connection
const uri = process.env.Mongodb_URL;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log("✅ Successfully connected to MongoDB!");

    // Select the database and collections
    const db = client.db("bdmart");
    const usersCollection = db.collection("users");
    const productsCollection = db.collection("products");
    const ordersCollection = db.collection("orders");
    const notificationsCollection = db.collection("notifications");
    const messagesCollection = db.collection("messages");
    const categoriesCollection = db.collection("categories");
    const bannersCollection = db.collection("banners");

    // Initialize default categories if none exist
    const categoryCount = await categoriesCollection.countDocuments();
    if (categoryCount === 0) {
      const defaultCategories = [
        { name: "Electronics", icon: "💻", description: "Laptops, phones, and gadgets", productCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { name: "Clothing", icon: "👕", description: "Fashion and apparel", productCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { name: "Home & Kitchen", icon: "🏠", description: "Home essentials", productCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { name: "Sports", icon: "⚽", description: "Sports equipment", productCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { name: "Books", icon: "📚", description: "Books and literature", productCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { name: "Toys", icon: "🎮", description: "Toys and games", productCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { name: "Beauty", icon: "💄", description: "Beauty and cosmetics", productCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { name: "Health", icon: "🏥", description: "Health and wellness", productCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ];
      await categoriesCollection.insertMany(defaultCategories);
      console.log("✅ Default categories initialized");
    }


    // ============= HEALTH CHECK =============
    app.get("/", (req, res) => {
      res.status(200).send({
        success: true,
        message: "🚀 BDMart API Server is running!",
        timestamp: new Date().toISOString(),
        endpoints: {
          products: "/products",
          orders: "/orders",
          messages: "/messages",
          notifications: "/notifications"
        }
      });
    });

    // ============= PRODUCTS ROUTES =============
    
    // GET all products
    app.get("/products", async (req, res) => {
      try {
        const products = await productsCollection.find().toArray();
        res.status(200).send(products);
      } catch (error) {
        console.error("❌ Error fetching products:", error);
        res.status(500).send({
          success: false,
          message: "Failed to fetch products",
        });
      }
    });

    // SEARCH products by name, category, or brand
    app.get("/products/search/:query", async (req, res) => {
      try {
        const searchQuery = req.params.query;
        console.log('🔍 Searching for:', searchQuery);
        
        // Create regex pattern for case-insensitive search
        const searchRegex = new RegExp(searchQuery, 'i');
        
        // Search in name, category, brand, description, and tags
        const products = await productsCollection.find({
          $or: [
            { name: searchRegex },
            { category: searchRegex },
            { brand: searchRegex },
            { description: searchRegex },
            { tags: searchRegex }
          ]
        }).limit(20).toArray();
        
        console.log(`✅ Found ${products.length} products`);
        
        res.status(200).send({
          success: true,
          count: products.length,
          products: products
        });
      } catch (error) {
        console.error("❌ Error searching products:", error);
        res.status(500).send({
          success: false,
          message: "Failed to search products",
          products: []
        });
      }
    });

    // GET single product by ID
    app.get("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const product = await productsCollection.findOne(query);

        if (!product) {
          return res.status(404).send({
            success: false,
            message: "Product not found",
          });
        }

        res.status(200).send(product);
      } catch (error) {
        console.error("❌ Error fetching product:", error);
        res.status(500).send({
          success: false,
          message: "Failed to fetch product",
        });
      }
    });

    // POST - Create new product
    app.post("/products", async (req, res) => {
      try {
        const product = req.body;
        const result = await productsCollection.insertOne(product);

        res.status(201).send({
          success: true,
          message: "✅ Product added successfully",
          ...product,
          _id: result.insertedId,
        });
      } catch (error) {
        console.error("❌ Error inserting product:", error);
        res.status(500).send({
          success: false,
          message: "Failed to add product",
        });
      }
    });

    // PUT - Update product
    app.put("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const product = req.body;
        const query = { _id: new ObjectId(id) };
        
        // Remove _id from update data if it exists
        delete product._id;
        
        const updateDoc = {
          $set: product,
        };

        const result = await productsCollection.updateOne(query, updateDoc);

        if (result.matchedCount === 0) {
          return res.status(404).send({
            success: false,
            message: "Product not found",
          });
        }

        res.status(200).send({
          success: true,
          message: "✅ Product updated successfully",
          _id: id,
          ...product,
        });
      } catch (error) {
        console.error("❌ Error updating product:", error);
        res.status(500).send({
          success: false,
          message: "Failed to update product",
        });
      }
    });

    // DELETE - Delete product
    app.delete("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await productsCollection.deleteOne(query);

        if (result.deletedCount === 0) {
          return res.status(404).send({
            success: false,
            message: "Product not found",
          });
        }

        res.status(200).send({
          success: true,
          message: "✅ Product deleted successfully",
        });
      } catch (error) {
        console.error("❌ Error deleting product:", error);
        res.status(500).send({
          success: false,
          message: "Failed to delete product",
        });
      }
    });

    // ============= CATEGORIES ROUTES =============
    
    // GET all categories
    app.get("/categories", async (req, res) => {
      try {
        const categories = await categoriesCollection.find().sort({ name: 1 }).toArray();
        res.status(200).send({
          success: true,
          categories: categories
        });
      } catch (error) {
        console.error("❌ Error fetching categories:", error);
        res.status(500).send({
          success: false,
          message: "Failed to fetch categories"
        });
      }
    });

    // POST - Create new category
    app.post("/categories", async (req, res) => {
      try {
        const { name, description, image, icon } = req.body;
        
        // Check if category already exists
        const existingCategory = await categoriesCollection.findOne({ 
          name: { $regex: new RegExp(`^${name}$`, 'i') } 
        });
        
        if (existingCategory) {
          return res.status(400).send({
            success: false,
            message: "Category already exists"
          });
        }

        const newCategory = {
          name: name,
          description: description || "",
          image: image || "",
          icon: icon || "📦",
          productCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const result = await categoriesCollection.insertOne(newCategory);
        console.log(`✅ Category created: ${name}`);

        res.status(201).send({
          success: true,
          message: "Category created successfully",
          category: { ...newCategory, _id: result.insertedId }
        });
      } catch (error) {
        console.error("❌ Error creating category:", error);
        res.status(500).send({
          success: false,
          message: "Failed to create category"
        });
      }
    });

    // DELETE category
    app.delete("/categories/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await categoriesCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).send({
            success: false,
            message: "Category not found"
          });
        }

        res.status(200).send({
          success: true,
          message: "Category deleted successfully"
        });
      } catch (error) {
        console.error("❌ Error deleting category:", error);
        res.status(500).send({
          success: false,
          message: "Failed to delete category"
        });
      }
    });

    // ============= BANNERS ROUTES =============
    
    // GET all banners
    app.get("/banners", async (req, res) => {
      try {
        const banners = await bannersCollection.find().sort({ order: 1, createdAt: -1 }).toArray();
        res.status(200).send({
          success: true,
          banners: banners
        });
      } catch (error) {
        console.error("❌ Error fetching banners:", error);
        res.status(500).send({
          success: false,
          message: "Failed to fetch banners"
        });
      }
    });

    // POST create new banner
    app.post("/banners", async (req, res) => {
      try {
        console.log('📥 Received banner data:', req.body);
        
        const bannerData = {
          ...req.body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const result = await bannersCollection.insertOne(bannerData);
        
        console.log('✅ Banner created with ID:', result.insertedId);
        
        res.status(201).send({
          success: true,
          message: "Banner created successfully",
          bannerId: result.insertedId
        });
      } catch (error) {
        console.error("❌ Error creating banner:", error);
        res.status(500).send({
          success: false,
          message: "Failed to create banner"
        });
      }
    });

    // PUT update banner by ID
    app.put("/banners/:id", async (req, res) => {
      try {
        const id = req.params.id;
        
        // Check if it's a valid ObjectId
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({
            success: false,
            message: "Invalid banner ID"
          });
        }

        const updateData = {
          ...req.body,
          updatedAt: new Date().toISOString()
        };

        // Remove _id from update data if it exists
        delete updateData._id;

        const result = await bannersCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({
            success: false,
            message: "Banner not found"
          });
        }

        res.status(200).send({
          success: true,
          message: "Banner updated successfully"
        });
      } catch (error) {
        console.error("❌ Error updating banner:", error);
        res.status(500).send({
          success: false,
          message: "Failed to update banner"
        });
      }
    });

    // DELETE banner by ID
    app.delete("/banners/:id", async (req, res) => {
      try {
        const id = req.params.id;
        
        // Check if it's a valid ObjectId
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({
            success: false,
            message: "Invalid banner ID"
          });
        }

        const result = await bannersCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).send({
            success: false,
            message: "Banner not found"
          });
        }

        res.status(200).send({
          success: true,
          message: "Banner deleted successfully"
        });
      } catch (error) {
        console.error("❌ Error deleting banner:", error);
        res.status(500).send({
          success: false,
          message: "Failed to delete banner"
        });
      }
    });

    // GET banners by position (left or right) - MUST be after specific ID routes
    app.get("/banners/position/:position", async (req, res) => {
      try {
        const position = req.params.position;
        console.log('🔍 Fetching banners for position:', position);
        
        const banners = await bannersCollection
          .find({ position: position, isActive: true })
          .sort({ order: 1 })
          .toArray();
        
        console.log(`✅ Found ${banners.length} active ${position} banners`);
        
        res.status(200).send({
          success: true,
          banners: banners
        });
      } catch (error) {
        console.error("❌ Error fetching banners:", error);
        res.status(500).send({
          success: false,
          message: "Failed to fetch banners"
        });
      }
    });

    // ============= ORDERS ROUTES =============
    
    // GET all orders
    app.get("/orders", async (req, res) => {
      try {
        const orders = await ordersCollection.find().sort({ orderDate: -1 }).toArray();
        res.status(200).send(orders);
      } catch (error) {
        console.error("❌ Error fetching orders:", error);
        res.status(500).send({
          success: false,
          message: "Failed to fetch orders",
        });
      }
    });

    // GET single order by ID
    app.get("/orders/:id", async (req, res) => {
      try {
        const id = req.params.id;
        let query;
        
        // Check if it's a MongoDB ObjectId or custom order ID
        if (ObjectId.isValid(id) && id.length === 24) {
          query = { _id: new ObjectId(id) };
        } else {
          // Search by custom order ID (e.g., ORD-1761423326402)
          query = { id: id };
        }
        
        const order = await ordersCollection.findOne(query);

        if (!order) {
          return res.status(404).send({
            success: false,
            message: "Order not found",
          });
        }

        res.status(200).send({
          success: true,
          order: order
        });
      } catch (error) {
        console.error("❌ Error fetching order:", error);
        res.status(500).send({
          success: false,
          message: "Failed to fetch order",
        });
      }
    });

    // PUT - Update order status
    app.put("/orders/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updates = req.body;
        const query = { _id: new ObjectId(id) };
        
        const updateDoc = {
          $set: updates,
        };

        const result = await ordersCollection.updateOne(query, updateDoc);

        if (result.matchedCount === 0) {
          return res.status(404).send({
            success: false,
            message: "Order not found",
          });
        }

        res.status(200).send({
          success: true,
          message: "✅ Order updated successfully",
        });
      } catch (error) {
        console.error("❌ Error updating order:", error);
        res.status(500).send({
          success: false,
          message: "Failed to update order",
        });
      }
    });

    // PATCH - Update order status (for quick status changes)
    app.patch("/orders/:id/status", async (req, res) => {
      try {
        const id = req.params.id;
        const { status } = req.body;
        
        // Validate status
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
          return res.status(400).send({
            success: false,
            message: "Invalid status. Must be one of: " + validStatuses.join(', ')
          });
        }

        const query = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: { 
            status: status,
            updatedAt: new Date()
          }
        };

        const result = await ordersCollection.updateOne(query, updateDoc);

        if (result.matchedCount === 0) {
          return res.status(404).send({
            success: false,
            message: "Order not found"
          });
        }

        // Fetch updated order
        const updatedOrder = await ordersCollection.findOne(query);

        res.status(200).send({
          success: true,
          message: `Order status updated to ${status}`,
          order: updatedOrder
        });
      } catch (error) {
        console.error("❌ Error updating order status:", error);
        res.status(500).send({
          success: false,
          message: "Failed to update order status"
        });
      }
    });

    // DELETE - Delete order
    app.delete("/orders/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await ordersCollection.deleteOne(query);

        if (result.deletedCount === 0) {
          return res.status(404).send({
            success: false,
            message: "Order not found",
          });
        }

        res.status(200).send({
          success: true,
          message: "✅ Order deleted successfully",
        });
      } catch (error) {
        console.error("❌ Error deleting order:", error);
        res.status(500).send({
          success: false,
          message: "Failed to delete order",
        });
      }
    });

    // ============= USERS ROUTES =============
    app.get("/users", async (req, res) => {
      const users = await usersCollection.find().toArray();
      res.send(users);
    });

    // ============= DASHBOARD STATS ROUTE =============
    app.get("/dashboard/stats", async (req, res) => {
      try {
        // Get all data
        const orders = await ordersCollection.find().toArray();
        const products = await productsCollection.find().toArray();
        
        // Calculate total revenue
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        // Calculate today's data
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayOrders = orders.filter(order => new Date(order.orderDate) >= today);
        const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        // Calculate this month's data
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const thisMonthOrders = orders.filter(order => new Date(order.orderDate) >= thisMonthStart);
        const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        // Calculate last month's data for comparison
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        const lastMonthOrders = orders.filter(order => {
          const orderDate = new Date(order.orderDate);
          return orderDate >= lastMonthStart && orderDate <= lastMonthEnd;
        });
        const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        // Calculate percentage changes
        const revenueChange = lastMonthRevenue > 0 
          ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
          : 0;
        const ordersChange = lastMonthOrders.length > 0
          ? (((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100).toFixed(1)
          : 0;
        
        // Extract unique customers from orders
        const customerMap = new Map();
        orders.forEach(order => {
          if (order.customerInfo && order.customerInfo.email) {
            const email = order.customerInfo.email;
            if (!customerMap.has(email)) {
              customerMap.set(email, {
                email: email,
                name: order.customerInfo.name || 'N/A',
                joinedDate: order.orderDate
              });
            }
          }
        });
        const totalCustomers = customerMap.size;
        
        // Calculate new customers this month
        const newCustomersThisMonth = Array.from(customerMap.values()).filter(
          customer => new Date(customer.joinedDate) >= thisMonthStart
        ).length;
        
        // Calculate active products (in stock)
        const activeProducts = products.filter(p => p.stock > 0).length;
        const lowStockProducts = products.filter(p => p.stock > 0 && p.stock < 10).length;
        
        // Order status breakdown
        const ordersByStatus = {
          pending: orders.filter(o => o.status === 'pending').length,
          processing: orders.filter(o => o.status === 'processing').length,
          shipped: orders.filter(o => o.status === 'shipped').length,
          delivered: orders.filter(o => o.status === 'delivered').length,
          cancelled: orders.filter(o => o.status === 'cancelled').length,
        };
        
        // Recent orders (last 5)
        const recentOrders = orders
          .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
          .slice(0, 5)
          .map(order => ({
            id: order.orderId,
            customer: order.customerInfo?.name || 'N/A',
            product: order.items?.[0]?.productName || 'N/A',
            amount: order.totalAmount,
            status: order.status,
            date: order.orderDate,
            email: order.customerInfo?.email || ''
          }));
        
        // Top products by sales
        const productSales = {};
        orders.forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
              const productId = item.productId || item.productName;
              if (!productSales[productId]) {
                productSales[productId] = {
                  name: item.productName || 'Unknown',
                  sales: 0,
                  revenue: 0,
                  quantity: 0
                };
              }
              productSales[productId].sales += 1;
              productSales[productId].revenue += (item.price * item.quantity) || 0;
              productSales[productId].quantity += item.quantity || 0;
            });
          }
        });
        
        const topProducts = Object.values(productSales)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)
          .map(product => {
            const productData = products.find(p => p.productName === product.name);
            return {
              name: product.name,
              sales: product.quantity,
              revenue: product.revenue,
              stock: productData?.stock || 0,
              rating: productData?.rating || 4.5
            };
          });
        
        // Sales by category
        const categorySales = {};
        orders.forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
              const productData = products.find(p => p.productName === item.productName);
              const category = productData?.category || 'Other';
              if (!categorySales[category]) {
                categorySales[category] = 0;
              }
              categorySales[category] += (item.price * item.quantity) || 0;
            });
          }
        });
        
        const salesByCategory = Object.entries(categorySales)
          .map(([category, amount]) => ({
            category,
            amount,
            percentage: totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(0) : 0
          }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 4);
        
        res.status(200).send({
          success: true,
          stats: {
            totalRevenue,
            totalOrders: orders.length,
            totalCustomers,
            activeProducts,
            todayRevenue,
            todayOrders: todayOrders.length,
            thisMonthRevenue,
            thisMonthOrders: thisMonthOrders.length,
            revenueChange,
            ordersChange,
            newCustomersThisMonth,
            lowStockProducts,
            ordersByStatus,
            recentOrders,
            topProducts,
            salesByCategory
          }
        });
      } catch (error) {
        console.error("❌ Error fetching dashboard stats:", error);
        res.status(500).send({
          success: false,
          message: "Failed to fetch dashboard stats",
        });
      }
    });

    // ============= ANALYTICS ROUTE =============
    app.get("/analytics/stats", async (req, res) => {
      try {
        const orders = await ordersCollection.find().toArray();
        const products = await productsCollection.find().toArray();
        
        // Calculate date ranges
        const now = new Date();
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        // Filter orders by date ranges
        const ordersLast30Days = orders.filter(o => new Date(o.orderDate) >= last30Days);
        const ordersLast7Days = orders.filter(o => new Date(o.orderDate) >= last7Days);
        
        // Total stats
        const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const totalOrders = orders.length;
        
        // Extract unique customers
        const customerEmails = new Set(orders.map(o => o.customerInfo?.email).filter(Boolean));
        const totalCustomers = customerEmails.size;
        
        // Average order value
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        // Sales trend data (last 30 days, grouped by day)
        const salesTrendMap = new Map();
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dateKey = date.toISOString().split('T')[0];
          salesTrendMap.set(dateKey, { date: dateKey, sales: 0, orders: 0 });
        }
        
        ordersLast30Days.forEach(order => {
          const dateKey = new Date(order.orderDate).toISOString().split('T')[0];
          if (salesTrendMap.has(dateKey)) {
            const data = salesTrendMap.get(dateKey);
            data.sales += order.totalAmount || 0;
            data.orders += 1;
          }
        });
        
        const salesTrend = Array.from(salesTrendMap.values()).map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sales: Math.round(item.sales),
          orders: item.orders
        }));
        
        // Revenue trend (last 7 days)
        const revenueTrendMap = new Map();
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dateKey = date.toISOString().split('T')[0];
          revenueTrendMap.set(dateKey, { date: dateKey, revenue: 0 });
        }
        
        ordersLast7Days.forEach(order => {
          const dateKey = new Date(order.orderDate).toISOString().split('T')[0];
          if (revenueTrendMap.has(dateKey)) {
            revenueTrendMap.get(dateKey).revenue += order.totalAmount || 0;
          }
        });
        
        const revenueTrend = Array.from(revenueTrendMap.values()).map(item => ({
          day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: Math.round(item.revenue)
        }));
        
        // Category sales distribution
        const categorySalesMap = new Map();
        orders.forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
              const product = products.find(p => p.productName === item.productName);
              const category = product?.category || 'Other';
              const revenue = (item.price || 0) * (item.quantity || 0);
              categorySalesMap.set(category, (categorySalesMap.get(category) || 0) + revenue);
            });
          }
        });
        
        const categoryDistribution = Array.from(categorySalesMap.entries())
          .map(([name, value]) => ({
            name,
            value: Math.round(value)
          }))
          .sort((a, b) => b.value - a.value);
        
        // Order status distribution
        const orderStatusMap = new Map();
        orders.forEach(order => {
          const status = order.status || 'pending';
          orderStatusMap.set(status, (orderStatusMap.get(status) || 0) + 1);
        });
        
        const orderStatusDistribution = Array.from(orderStatusMap.entries())
          .map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value
          }));
        
        // Top products by revenue
        const productRevenueMap = new Map();
        orders.forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
              const productName = item.productName || 'Unknown';
              const revenue = (item.price || 0) * (item.quantity || 0);
              const quantity = item.quantity || 0;
              
              if (!productRevenueMap.has(productName)) {
                productRevenueMap.set(productName, { revenue: 0, quantity: 0 });
              }
              const data = productRevenueMap.get(productName);
              data.revenue += revenue;
              data.quantity += quantity;
            });
          }
        });
        
        const topProducts = Array.from(productRevenueMap.entries())
          .map(([name, data]) => ({
            name,
            revenue: Math.round(data.revenue),
            quantity: data.quantity
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);
        
        // Customer segments
        const customerOrderMap = new Map();
        orders.forEach(order => {
          const email = order.customerInfo?.email;
          if (email) {
            if (!customerOrderMap.has(email)) {
              customerOrderMap.set(email, { orders: 0, revenue: 0, name: order.customerInfo.name || 'Unknown' });
            }
            const data = customerOrderMap.get(email);
            data.orders += 1;
            data.revenue += order.totalAmount || 0;
          }
        });
        
        const vipCustomers = Array.from(customerOrderMap.values()).filter(c => c.revenue > 10000).length;
        const regularCustomers = Array.from(customerOrderMap.values()).filter(c => c.revenue <= 10000 && c.revenue > 1000).length;
        const newCustomers = Array.from(customerOrderMap.values()).filter(c => c.orders === 1).length;
        
        const customerSegments = [
          { name: 'VIP', value: vipCustomers },
          { name: 'Regular', value: regularCustomers },
          { name: 'New', value: newCustomers }
        ];
        
        // Recent activity
        const recentOrders = orders
          .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
          .slice(0, 10)
          .map(order => ({
            id: order.orderId,
            customer: order.customerInfo?.name || 'Unknown',
            amount: order.totalAmount || 0,
            status: order.status || 'pending',
            date: order.orderDate
          }));
        
        // Calculate trends (vs last month)
        const lastMonth = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        const ordersLastMonth = orders.filter(o => {
          const orderDate = new Date(o.orderDate);
          return orderDate >= lastMonth && orderDate < last30Days;
        });
        
        const revenueLastMonth = ordersLastMonth.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const revenueLast30Days = ordersLast30Days.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        
        const revenueTrendPercent = revenueLastMonth > 0 
          ? (((revenueLast30Days - revenueLastMonth) / revenueLastMonth) * 100).toFixed(1)
          : 0;
        
        const ordersTrendPercent = ordersLastMonth.length > 0
          ? (((ordersLast30Days.length - ordersLastMonth.length) / ordersLastMonth.length) * 100).toFixed(1)
          : 0;
        
        res.status(200).send({
          success: true,
          stats: {
            totalRevenue,
            totalOrders,
            totalCustomers,
            avgOrderValue,
            revenueTrend: revenueTrendPercent,
            ordersTrend: ordersTrendPercent,
            salesTrend,
            revenueChartData: revenueTrend,
            categoryDistribution,
            orderStatusDistribution,
            topProducts,
            customerSegments,
            recentOrders
          }
        });
      } catch (error) {
        console.error("❌ Error fetching analytics stats:", error);
        res.status(500).send({
          success: false,
          message: "Failed to fetch analytics stats",
        });
      }
    });

    // ============= NOTIFICATION ROUTES =============
    
    // GET all notifications
    app.get("/notifications", async (req, res) => {
      try {
        const notifications = await notificationsCollection
          .find()
          .sort({ createdAt: -1 })
          .limit(20)
          .toArray();
        
        res.status(200).send({
          success: true,
          notifications: notifications
        });
      } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).send({
          success: false,
          message: "Failed to fetch notifications"
        });
      }
    });

    // POST - Mark notification as read
    app.post("/notifications/:id/read", async (req, res) => {
      try {
        const { id } = req.params;
        const result = await notificationsCollection.updateOne(
          { id: id },
          { $set: { read: true } }
        );
        
        res.status(200).send({
          success: true,
          message: "Notification marked as read"
        });
      } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).send({
          success: false,
          message: "Failed to mark notification as read"
        });
      }
    });

    // POST - Mark all notifications as read
    app.post("/notifications/read-all", async (req, res) => {
      try {
        await notificationsCollection.updateMany(
          { read: false },
          { $set: { read: true } }
        );
        
        res.status(200).send({
          success: true,
          message: "All notifications marked as read"
        });
      } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).send({
          success: false,
          message: "Failed to mark all notifications as read"
        });
      }
    });

    // Helper function to create notification when new order is placed
    async function createOrderNotification(order) {
      try {
        const notification = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'new_order',
          title: 'New Order Received',
          message: `Order #${order.id} has been placed by ${order.customer || order.customerInfo?.name || 'Guest'}`,
          orderId: order.id,
          amount: order.amount || order.totalAmount || 0,
          read: false,
          createdAt: new Date().toISOString()
        };
        
        await notificationsCollection.insertOne(notification);
        console.log(`🔔 Notification created for order ${order.id}`);
      } catch (error) {
        console.error("❌ Error creating notification:", error);
      }
    }

    // POST - Create new order (Modified to include notification)
    app.post("/orders", async (req, res) => {
      try {
        console.log("📦 Received order data:", JSON.stringify(req.body, null, 2));
        
        // Support both old and new order format
        const newOrder = {
          id: `ORD-${Date.now()}`,
          // Customer info - handle both formats
          customer: req.body.customer || req.body.customerInfo?.name || "Guest",
          customerInfo: req.body.customerInfo || {
            name: req.body.customer || "Guest",
            email: req.body.customerInfo?.email || "",
            phone: req.body.customerInfo?.phone || "",
            address: req.body.customerInfo?.address || req.body.shippingAddress?.address || ""
          },
          // Amount - handle both formats
          amount: parseFloat(req.body.amount || req.body.totalAmount) || 0,
          totalAmount: parseFloat(req.body.totalAmount || req.body.amount) || 0,
          // Status
          status: req.body.status || "pending",
          // Date - handle both formats
          date: req.body.date || req.body.orderDate || new Date().toISOString(),
          orderDate: req.body.orderDate || req.body.date || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          // Product info - handle both single product and items array
          product: req.body.product || null,
          items: req.body.items || (req.body.product ? [{
            productId: req.body.product.productId,
            name: req.body.product.name,
            price: req.body.product.price,
            quantity: req.body.product.quantity,
            image: req.body.product.image
          }] : []),
          // Shipping
          shippingAddress: req.body.shippingAddress || {
            address: req.body.customerInfo?.address || ""
          },
          // Payment
          paymentMethod: req.body.paymentMethod || "cash"
        };

        console.log("💾 Saving order:", JSON.stringify(newOrder, null, 2));
        const result = await ordersCollection.insertOne(newOrder);
        console.log("✅ Order saved with ID:", result.insertedId);
        
        // Create notification for new order
        await createOrderNotification(newOrder);
        console.log("🔔 Notification created");

        res.status(201).send({
          success: true,
          message: "Order created successfully",
          order: newOrder
        });
      } catch (error) {
        console.error("❌ Error creating order:", error);
        res.status(500).send({
          success: false,
          message: "Failed to create order"
        });
      }
    });

    // ============= MESSAGE ROUTES =============
    
    // GET all messages
    app.get("/messages", async (req, res) => {
      try {
        const messages = await messagesCollection
          .find()
          .sort({ createdAt: -1 })
          .limit(20)
          .toArray();
        
        res.status(200).send({
          success: true,
          messages: messages
        });
      } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).send({
          success: false,
          message: "Failed to fetch messages"
        });
      }
    });

    // POST - Create new message (for customers to send messages)
    app.post("/messages", async (req, res) => {
      try {
        const newMessage = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          customerName: req.body.customerName || "Guest",
          phone: req.body.phone || "",
          email: req.body.email || "",
          message: req.body.message || "",
          type: req.body.type || "customer_message",
          read: false,
          createdAt: new Date().toISOString()
        };

        await messagesCollection.insertOne(newMessage);
        console.log(`New message from ${newMessage.customerName}`);

        res.status(201).send({
          success: true,
          message: "Message sent successfully",
          data: newMessage
        });
      } catch (error) {
        console.error("Error creating message:", error);
        res.status(500).send({
          success: false,
          message: "Failed to send message"
        });
      }
    });

    // POST - Mark message as read
    app.post("/messages/:id/read", async (req, res) => {
      try {
        const { id } = req.params;
        const result = await messagesCollection.updateOne(
          { id: id },
          { $set: { read: true } }
        );
        
        res.status(200).send({
          success: true,
          message: "Message marked as read"
        });
      } catch (error) {
        console.error("Error marking message as read:", error);
        res.status(500).send({
          success: false,
          message: "Failed to mark message as read"
        });
      }
    });

    // POST - Mark all messages as read
    app.post("/messages/read-all", async (req, res) => {
      try {
        await messagesCollection.updateMany(
          { read: false },
          { $set: { read: true } }
        );
        
        res.status(200).send({
          success: true,
          message: "All messages marked as read"
        });
      } catch (error) {
        console.error("Error marking all messages as read:", error);
        res.status(500).send({
          success: false,
          message: "Failed to mark all messages as read"
        });
      }
    });

    // DELETE - Delete a message
    app.delete("/messages/:id", async (req, res) => {
      try {
        const { id } = req.params;
        await messagesCollection.deleteOne({ id: id });
        
        res.status(200).send({
          success: true,
          message: "Message deleted successfully"
        });
      } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).send({
          success: false,
          message: "Failed to delete message"
        });
      }
    });

  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}
run().catch(console.dir);

// Default route
app.get("/", (req, res) => {
  res.send("🚀 Express server is running...");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
