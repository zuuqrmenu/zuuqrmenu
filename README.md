# ZuuLab QR - Dijital Menü Platformu

Modern, production-ready SaaS platform for restaurants and cafes to create, manage and publish digital QR menus.

## 🏗️ Project Structure

```
zuulab-qr/
├── client/                    # React Frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React Context (AuthContext)
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   ├── .env                 # Environment variables (create from .env.example)
│   └── package.json
├── server/                   # Express Backend
│   ├── src/
│   │   ├── config/          # Configuration (DB, JWT)
│   │   ├── models/          # Mongoose models
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   └── utils/           # Utility functions
│   ├── .env                 # Environment variables (create from .env.example)
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas connection)

### Installation

1. **Clone the repository**
   ```bash
   cd zuulab-qr
   ```

2. **Set up environment variables**

   **Server (.env):**
   ```bash
   cd server
   cp .env.example .env
   ```
   Edit `.env` with your actual values:
   ```
   PORT=5001
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/zuulab-qr
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h
   CLIENT_URL=http://localhost:5174
   COOKIE_SECRET=your-cookie-secret-change-this-in-production
   ```

   **Client (.env):**
   ```bash
   cd ../client
   cp .env.example .env
   ```
   Edit `.env`:
   ```
   VITE_API_URL=http://localhost:5001/api
   ```

3. **Install dependencies**

   ```bash
   # Server dependencies
   cd server
   npm install

   # Client dependencies
   cd ../client
   npm install
   ```

4. **Start MongoDB**

   Make sure MongoDB is running on your system or update `MONGODB_URI` in server/.env to use MongoDB Atlas.

   **Windows:**
   ```bash
   # If MongoDB is installed as a service
   net start MongoDB

   # Or start MongoDB manually
   "C:\Program Files\MongoDB\Server\X.X\bin\mongod.exe" --dbpath "C:\data\db"
   ```

   **Mac/Linux:**
   ```bash
   # If installed via brew
   brew services start mongodb-community

   # Or start manually
   mongod --dbpath /path/to/data
   ```

   **Alternative: Use MongoDB Atlas**
   - Create a free account at https://www.mongodb.com/cloud/atlas
   - Create a cluster
   - Get your connection string
   - Update `MONGODB_URI` in server/.env

6. **Create development accounts**

   After MongoDB is running, execute the idempotent seed command:
   ```bash
   cd server
   npm run seed
   ```

   This creates or updates the development admin and test restaurant accounts,
   including the restaurant, settings, and menu records.

7. **Run the application**

   **Terminal 1 - Server:**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 - Client:**
   ```bash
   cd client
   npm run dev
   ```

8. **Access the application**

   - Frontend: http://localhost:5174
   - Backend API: http://localhost:5001
   - API Health Check: http://localhost:5001/api/health

## 📊 Database Models

### User
- Email, password (hashed), name, phone
- Role: ADMIN or RESTAURANT_USER
- Restaurant ID reference
- Account status (active/inactive)

### Restaurant
- Name, unique slug, owner reference
- Status: PENDING, ACTIVE, SUSPENDED, REJECTED
- Business type, location info
- Menu status and view count

### RestaurantSettings
- Logo, cover image, branding colors
- Theme selection
- Opening hours
- SEO settings

### Menu
- Restaurant reference
- Menu name

### Category
- Restaurant and menu references
- Name, description, image
- Display order, active status
- Featured flag

### Product
- Restaurant and category references
- Name, description, price
- Image, dietary tags, allergens
- Availability status, display order
- Featured flag

### MenuView
- Restaurant reference
- View timestamp
- User agent and IP (for analytics)

## 🔐 Authentication

- JWT-based authentication with httpOnly cookies
- Password hashing with bcrypt
- Role-based authorization (ADMIN, RESTAURANT_USER)
- Protected routes with middleware
- Restaurant ownership validation on server-side

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new restaurant
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Admin Restaurant Management
- `GET /api/admin/stats` - Get restaurant status totals (admin only)
- `GET /api/admin/restaurants` - List restaurants (admin only)
- `GET /api/admin/restaurants/:id` - Get one restaurant (admin only)
- `PATCH /api/admin/restaurants/:id/approve` - Approve a pending restaurant
- `PATCH /api/admin/restaurants/:id/reject` - Reject a pending restaurant
- `PATCH /api/admin/restaurants/:id/suspend` - Suspend an active restaurant
- `PATCH /api/admin/restaurants/:id/activate` - Activate a suspended or rejected restaurant

### Public Menu
- `GET /api/public/menu/:slug` - Get an active restaurant's published public menu

### Cloudinary Product Images
1. Create a Cloudinary account.
2. Copy your cloud name, API key, and API secret.
3. Add them to `server/.env`:
   ```env
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```
4. Restart the backend.

Product image uploads use the `zuulab-qr/restaurants/{restaurantId}/products/` folder and never store image files or Cloudinary secrets in MongoDB or the frontend.

Product image endpoints:
- `POST /api/menu/products/:id/image` - Upload or replace a product image (restaurant owner only)
- `DELETE /api/menu/products/:id/image` - Remove a product image (restaurant owner only)

### Health Check
- `GET /api/health` - API health status

## 🎯 Phase 2 Status

✅ **Completed:**
- Project structure setup
- React + Vite + Tailwind CSS frontend
- Express + Node.js backend
- MongoDB + Mongoose connection configuration
- All database models (User, Restaurant, RestaurantSettings, Menu, Category, Product, MenuView)
- JWT authentication system
- httpOnly cookie-based session management
- Auth middleware (auth, adminAuth, restaurantAuth)
- Registration and login functionality
- Basic frontend auth flow (Login, Register, PendingApproval, Dashboard pages)
- Admin restaurant dashboard with live statistics and restaurant actions
- Server-side admin authorization and restaurant status transitions
- Restaurant dashboard route protection for non-active restaurants

⚠️ **Requirements for Testing:**
- MongoDB must be running locally or use MongoDB Atlas connection string
- Environment files must be created (.env files from .env.example)
- Both server and client must be running simultaneously

⏳ **Pending (Future Phases):**
- Restaurant dashboard with menu builder
- Category and product CRUD operations
- Image upload system
- Public menu display
- QR code generation
- Restaurant branding/themes

## 🔧 Technology Stack

**Frontend:**
- React 19
- Vite
- Tailwind CSS 4
- React Router
- Axios
- React Hook Form + Zod

**Backend:**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

**Security:**
- httpOnly cookies for JWT
- Password hashing
- Role-based access control
- CORS configuration
- Input validation

## 📝 Development Notes

- All restaurant-specific routes validate ownership on server-side
- JWT tokens stored in httpOnly cookies (not localStorage)
- Restaurant users can only access their own data
- Admin users have full access to all restaurants
- Public menu routes don't require authentication

## 🚨 Important Security Notes

- Never commit `.env` files to version control
- Change JWT_SECRET and COOKIE_SECRET in production
- Use strong passwords for MongoDB
- Enable HTTPS in production
- Implement rate limiting in production
- Validate all user inputs

## 📞 Support

For issues or questions, please refer to the project documentation or contact the development team.
