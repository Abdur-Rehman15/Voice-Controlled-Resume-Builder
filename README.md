# 🚀 AsaanCV - Full Stack Application

A modern full-stack application built with React (Vite), Express.js, and MongoDB.

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Axios** - HTTP client for API calls

### Backend
- **Express.js** - Node.js web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger

## 📁 Project Structure

```
AsaanCV/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── App.jsx          # Main app component
│   │   ├── App.css          # App styles
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Vite configuration
├── backend/                  # Express.js backend
│   ├── server.js            # Main server file
│   ├── package.json         # Backend dependencies
│   └── env.example          # Environment variables example
├── package.json             # Root package.json
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AsaanCV
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cd backend
   cp env.example .env
   # Edit .env with your MongoDB connection string
   ```

4. **Start MongoDB**
   - Local: Make sure MongoDB is running on `mongodb://localhost:27017`
   - Atlas: Use your MongoDB Atlas connection string in `.env`

5. **Run the application**
   ```bash
   # Run both frontend and backend
   npm run dev
   
   # Or run separately:
   npm run dev:frontend  # Frontend on http://localhost:3000
   npm run dev:backend   # Backend on http://localhost:5000
   ```

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🎨 Features

- **Modern UI** - Beautiful gradient design with glassmorphism effects
- **Real-time Status** - Live backend connection status
- **Responsive Design** - Works on all devices
- **API Integration** - Full CRUD operations
- **Error Handling** - Comprehensive error handling
- **Security** - Helmet middleware for security headers

## 🔧 Development

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development
```bash
cd backend
npm run dev          # Start with nodemon
npm start            # Start production server
```

### Database
The application uses MongoDB with Mongoose ODM. The User schema includes:
- `name` (required)
- `email` (required, unique)
- `createdAt` (auto-generated)

## 🌐 Production Deployment

1. **Build the frontend**
   ```bash
   npm run build:frontend
   ```

2. **Set environment variables**
   ```bash
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   ```

3. **Start the server**
   ```bash
   npm start
   ```

## 📝 Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/asaancv
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Ensure MongoDB is running
3. Verify environment variables are set correctly
4. Check network connectivity

---

**Happy Coding! 🎉** 