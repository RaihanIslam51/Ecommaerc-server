# BDMart Server Architecture - MVC Pattern

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT                                   │
│                    (React Frontend)                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP Request
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS APP                                 │
│                    (src/app.js)                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐      │
│  │             MIDDLEWARE LAYER                          │      │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │      │
│  │  │   CORS   │→ │ Validate │→ │  Error Handler   │   │      │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │      │
│  └──────────────────────────────────────────────────────┘      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ROUTES LAYER                                │
│                   (src/routes/*.js)                              │
├─────────────────────────────────────────────────────────────────┤
│  /auth  /products  /orders  /users  /categories  /banners       │
│  /notifications  /messages  /analytics  /api                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CONTROLLER LAYER                               │
│                (src/controllers/*.js)                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │    Auth    │  │  Products  │  │   Orders   │                │
│  │ Controller │  │ Controller │  │ Controller │                │
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘                │
│         │               │               │                       │
│         │  Business     │  Business     │  Business             │
│         │  Logic        │  Logic        │  Logic                │
│         ▼               ▼               ▼                       │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MODEL LAYER                                  │
│                  (src/models/*.js)                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   User   │  │ Product  │  │  Order   │  │ Category │       │
│  │  Model   │  │  Model   │  │  Model   │  │  Model   │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │             │             │               │
│       │  Database   │  Database   │  Database   │  Database     │
│       │  Operations │  Operations │  Operations │  Operations   │
│       ▼             ▼             ▼             ▼               │
└─────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
│                   (MongoDB Atlas)                                │
├─────────────────────────────────────────────────────────────────┤
│  Collections:                                                    │
│  • users  • products  • orders  • categories                    │
│  • banners  • notifications  • messages                         │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow Example

### Example: Create New Order

```
1. CLIENT sends POST request
   ↓
2. EXPRESS receives at /orders
   ↓
3. MIDDLEWARE validates request data
   ↓
4. ROUTE forwards to orderController.createOrder()
   ↓
5. CONTROLLER processes business logic
   - Normalizes order data
   - Validates customer info
   ↓
6. MODEL (Order.create()) saves to database
   ↓
7. MODEL (Notification.create()) creates notification
   ↓
8. CONTROLLER sends success response
   ↓
9. CLIENT receives order confirmation
```

## 📁 File Organization

```
server/
│
├── src/
│   │
│   ├── config/              # Configuration
│   │   ├── database.js      # MongoDB connection
│   │   └── constants.js     # App constants
│   │
│   ├── models/              # Data Access Layer
│   │   ├── User.js          # User database operations
│   │   ├── Product.js       # Product database operations
│   │   ├── Order.js         # Order database operations
│   │   ├── Category.js      # Category database operations
│   │   ├── Banner.js        # Banner database operations
│   │   ├── Notification.js  # Notification database operations
│   │   └── Message.js       # Message database operations
│   │
│   ├── controllers/         # Business Logic Layer
│   │   ├── authController.js         # Authentication logic
│   │   ├── userController.js         # User management logic
│   │   ├── productController.js      # Product logic
│   │   ├── orderController.js        # Order processing logic
│   │   ├── categoryController.js     # Category logic
│   │   ├── bannerController.js       # Banner logic
│   │   ├── notificationController.js # Notification logic
│   │   ├── messageController.js      # Message logic
│   │   ├── analyticsController.js    # Analytics calculations
│   │   └── emailController.js        # Email sending logic
│   │
│   ├── routes/              # API Endpoints
│   │   ├── index.js         # Main router
│   │   ├── authRoutes.js    # /auth endpoints
│   │   ├── userRoutes.js    # /users endpoints
│   │   ├── productRoutes.js # /products endpoints
│   │   ├── orderRoutes.js   # /orders endpoints
│   │   └── ...              # Other route files
│   │
│   ├── middleware/          # Request Processing
│   │   ├── auth.js          # Authentication & authorization
│   │   ├── validate.js      # Input validation
│   │   └── errorHandler.js  # Error handling
│   │
│   ├── utils/               # Helper Functions
│   │   ├── response.js      # Response formatting
│   │   ├── validation.js    # Validation helpers
│   │   └── email.js         # Email utilities
│   │
│   ├── app.js               # Express app configuration
│   └── server.js            # Server startup
│
├── .env                     # Environment variables
├── package.json             # Dependencies
└── README.md                # Documentation
```

## 🎯 Design Principles

### 1. Separation of Concerns
- **Models**: Only handle database operations
- **Controllers**: Only contain business logic
- **Routes**: Only define endpoints
- **Middleware**: Only handle cross-cutting concerns

### 2. Single Responsibility
- Each file has one clear purpose
- Each function does one thing well
- Easy to test and modify

### 3. DRY (Don't Repeat Yourself)
- Reusable utility functions
- Shared middleware
- Common response formats

### 4. Dependency Injection
- Models injected into controllers
- Database passed to models
- Easy to mock for testing

## 🔐 Security Layers

```
Request → CORS → Validation → Auth → Controller → Model → Database
          ↓        ↓           ↓        ↓          ↓
        Allow    Sanitize   Verify   Process    Query
        Origin    Input     User     Logic      Data
```

## 📊 Data Flow

```
┌──────────┐
│ Database │
└────┬─────┘
     │ Raw Data
     ▼
┌──────────┐
│  Model   │ ← Queries & Operations
└────┬─────┘
     │ Clean Data
     ▼
┌──────────┐
│Controller│ ← Business Logic & Rules
└────┬─────┘
     │ Processed Data
     ▼
┌──────────┐
│  Route   │ ← HTTP Methods & Paths
└────┬─────┘
     │ JSON Response
     ▼
┌──────────┐
│  Client  │
└──────────┘
```

## ⚡ Performance Optimizations

1. **Database Connection Pooling**
   - Single connection reused
   - No connection overhead

2. **Async/Await**
   - Non-blocking operations
   - Better concurrency

3. **Middleware Chain**
   - Early validation
   - Fast failure

4. **Error Handling**
   - Centralized
   - No try-catch duplication

## 🧪 Testability

```
Unit Tests:
├── Models (Database operations)
├── Controllers (Business logic)
├── Middleware (Validation, Auth)
└── Utils (Helper functions)

Integration Tests:
├── Routes (API endpoints)
└── End-to-End (Full request flow)
```

## 🔄 Scalability Path

```
Current:
Single Server → MongoDB

Future Options:
├── Load Balancer → Multiple Servers → MongoDB
├── Add Redis Cache
├── Add Message Queue (RabbitMQ, Kafka)
├── Microservices Architecture
└── API Gateway
```

---

**This architecture makes your server:**
- ✅ Professional
- ✅ Maintainable
- ✅ Testable
- ✅ Scalable
- ✅ Secure
