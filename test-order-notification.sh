#!/bin/bash

echo "🧪 Testing Order Notification System"
echo "===================================="
echo ""

# Test 1: Create a new order
echo "📦 Test 1: Creating a new order..."
curl -X POST http://localhost:5000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer": "John Doe",
    "amount": 599.99,
    "status": "pending",
    "items": [
      {"name": "Product A", "quantity": 2, "price": 299.99}
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Dhaka"
    }
  }'

echo ""
echo ""
echo "⏳ Waiting 2 seconds..."
sleep 2

# Test 2: Fetch notifications
echo ""
echo "🔔 Test 2: Fetching notifications..."
curl http://localhost:5000/notifications

echo ""
echo ""
echo "✅ Test completed!"
echo ""
echo "📌 Next steps:"
echo "1. Open your browser to http://localhost:3000/dashboard"
echo "2. Look at the notification bell icon in the topbar"
echo "3. Click it to see the new order notification"
echo "4. Open browser console to see fetch logs"
echo ""
echo "🔄 Notifications refresh every 5 seconds automatically"
