# 🚀 Quick Start Guide - BDMart MVC Server

## Start the Server

```bash
cd server
npm start
```

## Verify It's Working

Open your browser or use curl:
```bash
curl http://localhost:5000/
```

You should see:
```json
{
  "success": true,
  "message": "🚀 BDMart API Server is running!",
  "version": "2.0.0"
}
```

## Test an API Endpoint

### Get All Products
```bash
curl http://localhost:5000/products
```

### Get All Orders
```bash
curl http://localhost:5000/orders
```

### Get Dashboard Stats
```bash
curl http://localhost:5000/analytics/dashboard/stats
```

## Development Mode (Auto-reload)

```bash
npm run dev
```

## Project Structure Overview

```
src/
├── config/       → Database & settings
├── models/       → Database operations
├── controllers/  → Business logic
├── routes/       → API endpoints
├── middleware/   → Auth, validation, errors
├── utils/        → Helper functions
├── app.js        → Express setup
└── server.js     → Start server
```

## Common Tasks

### Add a New Product (Admin)
```bash
curl -X POST http://localhost:5000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Product",
    "price": 999,
    "category": "Electronics",
    "stock": 10
  }'
```

### Create an Order
```bash
curl -X POST http://localhost:5000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerInfo": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "01234567890"
    },
    "items": [
      {
        "productName": "Product 1",
        "price": 100,
        "quantity": 2
      }
    ],
    "totalAmount": 200
  }'
```

## Environment Variables

Make sure `.env` file has:
```env
PORT=5000
Mongodb_URL=your_mongodb_connection_string
NODE_ENV=development
```

## Need Help?

1. Check `README.md` for full documentation
2. Check `MVC_MIGRATION_SUMMARY.md` for architecture details
3. All original features work the same way!

## What Changed?

✅ Code is now organized (MVC pattern)
✅ Better error handling
✅ Input validation
✅ Same API endpoints
✅ Same functionality
✅ More professional!

**Everything works exactly the same, just better organized! 🎉**
