# DevConnect

A social platform built for developers to connect, share knowledge, and collaborate. DevConnect provides a space where developers can share posts, engage in discussions, send direct messages, and build their professional network.

## 🚀 Features

- **User Authentication** - Secure JWT-based authentication with cookie support
- **Social Posts** - Create, share, and engage with developer content
- **Real-time Messaging** - Direct messaging between users 
- **User Profiles** - Customizable developer profiles with bio and avatar
- **Follow System** - Follow other developers and build your network
- **Comments & Likes** - Engage with posts through comments and likes
- **Responsive Design** - Modern UI built with Tailwind CSS and Radix UI

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with TypeScript
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Redux Toolkit** - State management (needs setup)
- **React Hook Form** - Form handling with validation
- **Zod** - Type-safe schema validation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - Document database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing

## 📋 Prerequisites

Before setting up DevConnect, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or cloud instance)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/abdo423/DevConnect.git
cd DevConnect
```

### 2. Environment Setup

Create environment files for both client and server:

#### Server Environment
Create `Server/.env`:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/devconnect
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRES_IN=7d
```

#### Server Configuration
Create `Server/config/development.json`:
```json
{
  "app": {
    "port": 3000
  },
  "db": {
    "connectionString": "mongodb://localhost:27017/devconnect"
  },
  "jwt": {
    "secret": "your-super-secure-jwt-secret",
    "expiresIn": "7d"
  }
}
```

### 3. Install Dependencies

#### Install Server Dependencies
```bash
cd Server
npm install
```

#### Install Client Dependencies
```bash
cd ../Client/devConnect
npm install react-router-dom react-redux @reduxjs/toolkit date-fns
npm install
```

### 4. Database Setup

Ensure MongoDB is running on your system:

#### Local MongoDB
```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu
sudo systemctl start mongod

# On Windows
net start MongoDB
```

#### MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get connection string and update your environment files

### 5. Run the Application

#### Start the Backend Server
```bash
cd Server
npm run dev
```
The server will run on `http://localhost:3000`

#### Start the Frontend Client
```bash
cd Client/devConnect
npm run dev
```
The client will run on `http://localhost:5173`

### 6. Access the Application

Open your browser and navigate to `http://localhost:5173` to start using DevConnect!

## 📚 Documentation

- [API Documentation](./docs/API.md) - Complete API reference
- [Architecture Guide](./docs/ARCHITECTURE.md) - System architecture overview
- [Development Guide](./docs/DEVELOPMENT.md) - Development setup and guidelines
- [Database Schema](./docs/DATABASE.md) - Database design and schema documentation
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment instructions

## 🧪 Testing

### Backend Tests
```bash
cd Server
npm test
```

### Frontend Tests
```bash
cd Client/devConnect
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **abdo423** - Initial work - [abdo423](https://github.com/abdo423)

## 🐛 Issues

Found a bug or have a suggestion? Please open an issue [here](https://github.com/abdo423/DevConnect/issues).

## 🙏 Acknowledgments

- Thanks to all the open-source libraries and frameworks that make this project possible
- Inspired by the developer community's need for better networking tools