// controllers/analyticsController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { successResponse, errorResponse } from "../utils/response.js";

/**
 * Get dashboard stats
 */
export const getDashboardStats = async (req, res) => {
  try {
    const orders = await Order.findAll();
    const products = await Product.findAll();

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

    // Extract unique customers
    const customerMap = new Map();
    orders.forEach(order => {
      if (order.customerInfo && order.customerInfo.email) {
        const email = order.customerInfo.email;
        if (!customerMap.has(email)) {
          customerMap.set(email, {
            email,
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

    // Calculate active products
    const activeProducts = products.filter(p => p.stock > 0).length;
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock < 10).length;

    // Order status breakdown
    const ordersByStatus = await Order.countByStatus();

    // Recent orders
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

    return successResponse(res, {
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
    }, "Dashboard stats fetched successfully");
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error);
    return errorResponse(res, "Failed to fetch dashboard stats", 500);
  }
};

/**
 * Get analytics stats
 */
export const getAnalyticsStats = async (req, res) => {
  try {
    const orders = await Order.findAll();
    const products = await Product.findAll();

    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const ordersLast30Days = orders.filter(o => new Date(o.orderDate) >= last30Days);
    const ordersLast7Days = orders.filter(o => new Date(o.orderDate) >= last7Days);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;

    const customerEmails = new Set(orders.map(o => o.customerInfo?.email).filter(Boolean));
    const totalCustomers = customerEmails.size;

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Sales trend (last 30 days)
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

    // Category distribution
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
      .map(([name, value]) => ({ name, value: Math.round(value) }))
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

    // Top products
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

    // Calculate trends
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

    return successResponse(res, {
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
    }, "Analytics stats fetched successfully");
  } catch (error) {
    console.error("❌ Error fetching analytics stats:", error);
    return errorResponse(res, "Failed to fetch analytics stats", 500);
  }
};

export default {
  getDashboardStats,
  getAnalyticsStats
};
