# BDMart Server - Professional MVC Architecture

A professional Node.js/Express backend API for BDMart e-commerce platform, built with MVC (Model-View-Controller) architecture pattern.

## 📁 Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # MongoDB connection & initialization
│   │   └── constants.js # Application constants
│   ├── models/          # Data models (Database layer)
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Category.js
│   │   ├── Banner.js
│   │   ├── Notification.js
│   │   └── Message.js
│   ├── controllers/     # Business logic (Controller layer)
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── categoryController.js
│   │   ├── bannerController.js
│   │   ├── notificationController.js
│   │   ├── messageController.js
│   │   ├── analyticsController.js
│   │   └── emailController.js
│   ├── routes/          # API routes (View layer)
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── bannerRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── emailRoutes.js
│   │   └── index.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js      # Authentication & authorization
│   │   ├── validate.js  # Request validation
│   │   └── errorHandler.js  # Error handling
│   ├── utils/           # Utility functions
│   │   ├── response.js  # Response helpers
│   │   ├── validation.js  # Validation helpers
│   │   └── email.js     # Email utilities
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── .env                 # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Features

### Architecture Benefits
- **Separation of Concerns**: Clear separation between Models, Controllers, and Routes
- **Maintainability**: Easy to update and extend functionality
- **Scalability**: Modular structure supports growth
- **Testability**: Components can be tested independently
- **Code Reusability**: DRY principle throughout the codebase

### Core Features
- ✅ User Authentication & Authorization
- ✅ Product Management (CRUD)
- ✅ Order Processing & Tracking
- ✅ Category & Banner Management
- ✅ Real-time Notifications
- ✅ Customer Message System
- ✅ Analytics & Dashboard Stats
- ✅ Email Service Integration
- ✅ Error Handling & Validation
- ✅ MongoDB Integration

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🔧 Installation

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Setup environment variables:**
   Create a `.env` file in the server directory:
   ```env
   PORT=5000
   NODE_ENV=development
   Mongodb_URL=your_mongodb_connection_string
   
   # Email Configuration (Optional - for email features)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

## 🏃 Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication (`/auth`)
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile/:userId` - Get user profile
- `PUT /auth/profile/:userId` - Update user profile
- `POST /auth/change-password` - Change password
- `POST /auth/reset-password` - Reset password (Admin)

### Users (`/users`)
- `GET /users` - Get all users (with pagination & search)
- `PUT /users/:id/role` - Update user role (Admin)
- `DELETE /users/:id` - Delete user (Admin)

### Products (`/products`)
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `GET /products/search/:query` - Search products
- `POST /products` - Create product (Admin)
- `PUT /products/:id` - Update product (Admin)
- `DELETE /products/:id` - Delete product (Admin)

### Orders (`/orders`)
- `GET /orders` - Get all orders
- `GET /orders/:id` - Get order by ID
- `POST /orders` - Create new order
- `PUT /orders/:id` - Update order (Admin)
- `PATCH /orders/:id/status` - Update order status (Admin)
- `DELETE /orders/:id` - Delete order (Admin)

### Categories (`/categories`)
- `GET /categories` - Get all categories
- `GET /categories/:id` - Get category by ID
- `POST /categories` - Create category (Admin)
- `PUT /categories/:id` - Update category (Admin)
- `DELETE /categories/:id` - Delete category (Admin)

### Banners (`/banners`)
- `GET /banners` - Get all banners
- `GET /banners/position/:position` - Get banners by position
- `GET /banners/:id` - Get banner by ID
- `POST /banners` - Create banner (Admin)
- `PUT /banners/:id` - Update banner (Admin)
- `DELETE /banners/:id` - Delete banner (Admin)

### Notifications (`/notifications`)
- `GET /notifications` - Get all notifications
- `GET /notifications/unread` - Get unread notifications
- `POST /notifications/:id/read` - Mark as read
- `POST /notifications/read-all` - Mark all as read
- `DELETE /notifications/:id` - Delete notification

### Messages (`/messages`)
- `GET /messages` - Get all messages
- `GET /messages/unread` - Get unread messages
- `POST /messages` - Create message
- `POST /messages/:id/read` - Mark as read
- `POST /messages/read-all` - Mark all as read
- `DELETE /messages/:id` - Delete message

### Analytics (`/analytics`)
- `GET /analytics/dashboard/stats` - Get dashboard statistics
- `GET /analytics/stats` - Get analytics statistics

### Email (`/api`)
- `POST /api/send-email` - Send bulk email

## 🔐 Authentication & Authorization

The API uses middleware-based authentication:

- **verifyAuth**: Validates user authentication
- **verifyAdmin**: Validates admin role
- **optionalAuth**: Optional authentication (doesn't fail if no auth)

Example protected route:
```javascript
router.put("/:id/role", validateIdParam, verifyAdmin, asyncHandler(userController.updateUserRole));
```

## ✅ Validation

Request validation is handled by middleware before reaching controllers:

- Email format validation
- Password strength validation
- Required fields validation
- ObjectId format validation
- Custom business logic validation

## 🛡️ Error Handling

Centralized error handling with:
- Custom error responses
- HTTP status codes
- Detailed error messages
- Stack trace (development mode)
- Async error wrapper

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "details": "Additional error details"
}
```

## 🔄 Migration from Old Code

The old `index.js` has been preserved as `index.js.backup`. The new MVC structure provides:

1. **Better Organization**: Code is organized by responsibility
2. **Easier Maintenance**: Changes are isolated to specific files
3. **Improved Testing**: Each component can be tested independently
4. **Better Scalability**: Easy to add new features
5. **Professional Standards**: Follows industry best practices

## 📝 Development Guidelines

### Adding New Features

1. **Create Model** (if needed): `src/models/NewModel.js`
2. **Create Controller**: `src/controllers/newController.js`
3. **Create Routes**: `src/routes/newRoutes.js`
4. **Add Validation** (if needed): Update `src/middleware/validate.js`
5. **Register Routes**: Add to `src/routes/index.js`

### Code Style
- Use async/await for asynchronous operations
- Always wrap async route handlers with `asyncHandler`
- Use response helper functions from `utils/response.js`
- Validate input before processing
- Log important operations
- Handle errors gracefully

## 🐛 Debugging

Enable detailed logging:
```env
NODE_ENV=development
```

Check MongoDB connection:
```javascript
// The database.js file includes connection logging
```

## 📦 Dependencies

- **express**: Web framework
- **mongodb**: MongoDB driver
- **bcryptjs**: Password hashing
- **nodemailer**: Email service
- **cors**: CORS middleware
- **dotenv**: Environment variables
- **nodemon**: Development auto-reload

## 🤝 Contributing

1. Follow the MVC pattern
2. Add proper validation
3. Include error handling
4. Write descriptive commit messages
5. Test your changes

## 📄 License

ISC

## 👨‍💻 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ for BDMart**
