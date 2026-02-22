# Flight Booking System

A full-stack microservices-based web application for booking flights, managing users, and handling orders. Built with Node.js/Express backend services and a React/Vite frontend.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Docker Setup (Recommended)](#docker-setup-recommended)
  - [Local Development Setup](#local-development-setup)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Security](#security)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Flight Booking System is a microservices-based application that allows users to:
- Browse and search for available flights
- Book flights with seat selection
- Manage their bookings and orders
- Administrators can manage flights, orders, and passengers

The system is built using a microservices architecture with separate services for user management, flight management, booking operations, and admin functions, all orchestrated through an API Gateway.

## Architecture

The application follows a **microservices architecture** with the following services:

### Services

1. **API Gateway** (Port 3000)
   - Single entry point for all client requests
   - Handles authentication and authorization
   - Routes requests to appropriate microservices
   - Manages CORS and request proxying

2. **User Service** (Port 3001)
   - User authentication and authorization
   - User registration and profile management
   - JWT token generation and validation
   - Database: PostgreSQL

3. **Flight Service** (Port 3002)
   - Flight CRUD operations
   - Flight search and filtering
   - Flight publishing/unpublishing
   - Database: MongoDB

4. **Booking Service** (Port 3003)
   - Order creation and management
   - Seat availability management
   - Payment and cancellation handling
   - Database: MongoDB

5. **Admin Service** (Port 3004)
   - Administrative operations
   - Booking flights for passengers
   - Aggregating data from other services

6. **Frontend** (Port 80 in Docker, 5173 in development)
   - React-based user interface
   - Served via Nginx in production

### Databases

- **PostgreSQL**: Stores user data (authentication, profiles)
- **MongoDB**: Stores flight and booking data

## Features

### User Features
- ✅ User registration and authentication
- ✅ Browse available flights
- ✅ Search flights by city, flight number, or date
- ✅ Book flights with seat selection
- ✅ View and manage personal orders
- ✅ Cancel paid orders
- ✅ Pay for unpaid orders

### Admin Features
- ✅ Create, update, and delete flights
- ✅ Publish/unpublish flights
- ✅ View all orders
- ✅ View all passengers
- ✅ Book flights on behalf of passengers
- ✅ Register new passengers

### System Features
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin/Passenger)
- ✅ Microservices architecture
- ✅ Docker containerization
- ✅ API Gateway for unified access
- ✅ Automatic admin user creation
- ✅ Seat availability tracking

## Tech Stack

### Backend
- **Node.js** (v18+)
- **Express.js** - Web framework
- **PostgreSQL** - User data storage (via Sequelize ORM)
- **MongoDB** - Flight and booking data (via Mongoose ODM)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Axios** - Inter-service communication
- **http-proxy-middleware** - API Gateway routing
- **express-validator** - Input validation

### Frontend
- **React** (v19)
- **Vite** - Build tool and dev server
- **React Router** (v7) - Client-side routing
- **Axios** - HTTP client
- **CSS** - Styling

### DevOps
- **Docker** & **Docker Compose** - Containerization
- **Nginx** - Frontend web server (production)

## 📁 Project Structure

```
FlightBookingWebjs/
├── .dockerignore              # Docker ignore patterns
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore patterns
├── docker-compose.yml         # Docker Compose configuration
├── README.md                  # This file
├── README-DOCKER.md           # Docker-specific documentation
├── ADMIN-SETUP.md             # Admin user setup guide
│
├── FlightBookingWebApp/       # Frontend React Application
│   ├── .dockerignore
│   ├── .gitignore
│   ├── Dockerfile             # Frontend Docker image
│   ├── nginx.conf             # Nginx configuration
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx            # Main app component with routes
│       ├── main.jsx           # Entry point
│       ├── App.css
│       ├── index.css
│       ├── components/
│       │   └── Layout.jsx     # Main layout component
│       ├── context/
│       │   └── AuthContext.jsx  # Authentication context
│       ├── templates/         # Page components
│       │   ├── index.jsx      # Home page
│       │   ├── login.jsx      # Login page
│       │   ├── register.jsx   # Registration page
│       │   ├── availableFlights.jsx  # Flight listing
│       │   ├── admin/         # Admin pages
│       │   │   ├── adminsHome.jsx
│       │   │   ├── flights.jsx
│       │   │   ├── orders.jsx
│       │   │   └── passengers.jsx
│       │   └── passenger/     # Passenger pages
│       │       ├── index.jsx
│       │       ├── flights/
│       │       │   └── book.jsx
│       │       └── orders/
│       │           └── list.jsx
│       └── utils/
│           └── axios.js       # API client configuration
│
└── services/                  # Backend Microservices
    ├── .gitignore
    │
    ├── api-gateway/           # API Gateway Service
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── server.js          # Gateway server
    │   └── middleware/
    │       └── auth.js         # Authentication middleware
    │
    ├── user-service/          # User Management Service
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── server.js
    │   ├── create-db.js       # Database initialization script
    │   └── src/
    │       ├── config/
    │       │   └── database.js    # Sequelize configuration
    │       ├── models/
    │       │   └── User.js        # User model
    │       ├── routes/            # API routes
    │       │   ├── login.js
    │       │   ├── register.js
    │       │   ├── me.js
    │       │   ├── getAllUsers.js
    │       │   ├── findByIdentityCard.js
    │       │   ├── registerByAdmin.js
    │       │   ├── createAdmin.js
    │       │   └── forgetPassword.js
    │       ├── middleware/
    │       │   └── auth.js        # Auth middleware
    │       └── utils/
    │           ├── db-init.js     # Database initialization
    │           └── init-admin.js  # Admin user creation
    │
    ├── flight-service/        # Flight Management Service
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── server.js
    │   └── src/
    │       ├── models/
    │       │   ├── Flight.js      # Flight model
    │       │   └── Order.js       # Order reference model
    │       └── routes/
    │           ├── flights.js    # Route definitions
    │           ├── search.js     # Flight search
    │           ├── getFlight.js
    │           ├── getAllFlights.js
    │           ├── createFlight.js
    │           ├── updateFlight.js
    │           ├── deleteFlight.js
    │           └── publishFlight.js
    │
    ├── booking-service/       # Booking Management Service
    │   ├── Dockerfile
    │   ├── package.json
    │   ├── server.js
    │   └── src/
    │       ├── models/
    │       │   └── Order.js      # Order model
    │       ├── routes/
    │       │   ├── orders.js      # Route definitions
    │       │   ├── createOrder.js
    │       │   ├── getOrder.js
    │       │   ├── getPassengerOrders.js
    │       │   ├── getAllOrders.js
    │       │   ├── getAvailableSeats.js
    │       │   ├── payOrder.js
    │       │   └── cancelOrder.js
    │       └── utils/
    │           └── flightService.js  # Flight service client
    │
    └── admin-service/         # Admin Operations Service
        ├── Dockerfile
        ├── package.json
        ├── server.js
        └── src/
            └── routes/
                ├── admin.js        # Route definitions
                ├── getFlights.js
                ├── getOrders.js
                ├── getPassengers.js
                └── bookFlight.js   # Book for passenger
```

## Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- **Docker** and **Docker Compose** (for containerized deployment)
- **PostgreSQL** (for local development without Docker)
- **MongoDB** (for local development without Docker)

## Installation

### Docker Setup (Recommended)

The easiest way to run the application is using Docker Compose.

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd FlightBookingWebjs
   ```

2. **Create environment file** (optional, defaults are provided):
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start all services**:
   ```bash
   docker-compose up -d
   ```

4. **Access the application**:
   - Frontend: http://localhost
   - API Gateway: http://localhost:3000

5. **Check service status**:
   ```bash
   docker-compose ps
   ```

6. **View logs**:
   ```bash
   docker-compose logs -f [service-name]
   ```

7. **Stop services**:
   ```bash
   docker-compose down
   ```

For detailed Docker documentation, see [README-DOCKER.md](./README-DOCKER.md).

### Local Development Setup

#### 1. Backend Services Setup

**User Service**:
```bash
cd services/user-service
npm install
# Create .env file with database credentials
npm run dev  # Runs on port 3001
```

**Flight Service**:
```bash
cd services/flight-service
npm install
# Create .env file with MongoDB URI
npm run dev  # Runs on port 3002
```

**Booking Service**:
```bash
cd services/booking-service
npm install
# Create .env file with MongoDB URI and FLIGHT_SERVICE_URL
npm run dev  # Runs on port 3003
```

**Admin Service**:
```bash
cd services/admin-service
npm install
# Create .env file with service URLs
npm run dev  # Runs on port 3004
```

**API Gateway**:
```bash
cd services/api-gateway
npm install
# Create .env file with service URLs
npm run dev  # Runs on port 3000
```

#### 2. Frontend Setup

```bash
cd FlightBookingWebApp
npm install
npm run dev  # Runs on http://localhost:5173
```

#### 3. Database Setup

**PostgreSQL** (for User Service):
```bash
# Create database
createdb flightbooking_users

# Or using psql
psql -U postgres
CREATE DATABASE flightbooking_users;
```

**MongoDB** (for Flight and Booking Services):
```bash
# MongoDB should be running on localhost:27017
# Database will be created automatically
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flightbooking_users
DB_USER=postgres
DB_PASSWORD=your_password

MONGO_URI=mongodb://localhost:27017/flightbooking

# JWT Secret (IMPORTANT: Change in production!)
JWT_SECRET=your_strong_secret_key_here

# Admin User (created on first startup)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_DISPLAY_NAME=System Administrator

# Service URLs (for Docker, use service names)
USER_SERVICE_URL=http://localhost:3001
FLIGHT_SERVICE_URL=http://localhost:3002
BOOKING_SERVICE_URL=http://localhost:3003
ADMIN_SERVICE_URL=http://localhost:3004

# Frontend
VITE_API_URL=http://localhost:3000
```

### Docker Environment Variables

In `docker-compose.yml`, you can override environment variables. For production:
- Change all default passwords
- Set a strong JWT_SECRET
- Update admin credentials
- Configure proper CORS origins

## API Documentation

### Base URL
- **Development**: `http://localhost:3000`
- **Docker**: `http://localhost:3000`

All API requests go through the API Gateway.

### Authentication

Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Endpoints

#### Authentication (`/api/auth/*`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

#### Flights (`/api/flights/*`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/flights/search` | Search flights (query: city, flightNumber, date) | No |
| GET | `/api/flights/:id` | Get flight by ID | No |
| GET | `/api/flights/admin/all` | Get all flights (including unpublished) | Admin |
| POST | `/api/flights` | Create new flight | Admin |
| PUT | `/api/flights/:id` | Update flight | Admin |
| PATCH | `/api/flights/:id` | Publish/unpublish flight | Admin |
| DELETE | `/api/flights/:id` | Delete flight | Admin |

#### Orders (`/api/orders/*`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/orders/flight/:flightId/seats` | Get available seats | No |
| GET | `/api/orders/passenger` | Get user's orders | Yes |
| GET | `/api/orders/:id` | Get order by ID | Yes |
| POST | `/api/orders` | Create new order (book flight) | Yes |
| PATCH | `/api/orders/:orderId/pay` | Pay for order | Yes |
| PATCH | `/api/orders/:orderId/cancel` | Cancel order | Yes |

#### Admin (`/api/admin/*`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/flights` | Get all flights | Admin |
| GET | `/api/admin/orders` | Get all orders | Admin |
| GET | `/api/admin/passengers` | Get all passengers | Admin |
| POST | `/api/admin/book-flight` | Book flight for passenger | Admin |

#### User Service Direct (`/api/auth/*`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/create-admin` | Create admin user | No* |
| GET | `/api/auth/find-by-identity/:identityCardNumber` | Find user by ID card | Yes |
| POST | `/api/auth/register-by-admin` | Register passenger (admin) | Admin |

*Only works if no admin exists, or if called by existing admin

### Request/Response Examples

**Login**:
```bash
POST /api/auth/login
Content-Type: application/json

{
  "userName": "admin",
  "password": "admin123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "userName": "admin",
    "role": "Administrator",
    "displayName": "System Administrator"
  }
}
```

**Search Flights**:
```bash
GET /api/flights/search?city=New York&date=2026-01-25

Response:
[
  {
    "id": "uuid",
    "flightNumber": "AS792",
    "origin": "Denver, Colorado",
    "destination": "Alaska",
    "departureTime": "2026-01-24T22:47:00Z",
    "arrivalTime": "2026-01-27T20:47:00Z",
    "price": 30.00,
    "capacity": 100,
    "remainingSeats": 80
  }
]
```

**Book Flight**:
```bash
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "flightId": "uuid",
  "seat": 5
}

Response:
{
  "id": "order-uuid",
  "message": "Order created successfully"
}
```

## Usage Guide

### For Passengers

1. **Register/Login**: Create an account or log in with existing credentials
2. **Browse Flights**: Visit the flights page to see available flights
3. **Search**: Use filters to find flights by city, flight number, or date
4. **Book Flight**: Click "Book" on a flight, select a seat, and confirm
5. **View Orders**: Check your bookings in the passenger dashboard
6. **Pay Order**: Pay for unpaid orders
7. **Cancel Order**: Cancel paid orders (if allowed)

### For Administrators

1. **Login**: Use admin credentials (default: `admin123456` / `admin123456`)
2. **Manage Flights**:
   - Create new flights
   - Edit existing flights
   - Publish/unpublish flights
   - Delete flights
3. **View Orders**: See all bookings across all passengers
4. **Manage Passengers**: View all registered passengers
5. **Book for Passenger**: Book flights on behalf of passengers

## Security

### Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token authentication
- Role-based access control
- Input validation with express-validator
- CORS configuration
- Environment variable protection
- SQL injection prevention (Sequelize ORM)
- NoSQL injection prevention (Mongoose ODM)

### Security Best Practices

1. **Change Default Credentials**:
   - Change admin password immediately
   - Use strong JWT_SECRET (generate with `openssl rand -base64 32`)
   - Use strong database passwords

2. **Environment Variables**:
   - Never commit `.env` files
   - Use `.env.example` as template
   - Rotate secrets regularly

3. **Production Deployment**:
   - Use HTTPS
   - Configure proper CORS origins
   - Set up rate limiting
   - Use environment-specific configurations
   - Enable logging and monitoring
   - Regular security updates

4. **Database Security**:
   - Use strong passwords
   - Limit database access
   - Regular backups
   - Encrypt sensitive data

## Development

### Running in Development Mode

1. Start all backend services (each in separate terminal):
   ```bash
   # Terminal 1 - User Service
   cd services/user-service && npm run dev
   
   # Terminal 2 - Flight Service
   cd services/flight-service && npm run dev
   
   # Terminal 3 - Booking Service
   cd services/booking-service && npm run dev
   
   # Terminal 4 - Admin Service
   cd services/admin-service && npm run dev
   
   # Terminal 5 - API Gateway
   cd services/api-gateway && npm run dev
   ```

2. Start frontend:
   ```bash
   cd FlightBookingWebApp && npm run dev
   ```

### Code Structure

- **Services**: Each microservice is independent with its own routes, models, and logic
- **API Gateway**: Routes requests and handles authentication
- **Frontend**: React SPA with context for state management
- **Models**: Sequelize for PostgreSQL, Mongoose for MongoDB

### Adding New Features

1. **New API Endpoint**:
   - Add route in appropriate service
   - Add route definition in service's route file
   - Update API Gateway if needed
   - Update frontend to use new endpoint

2. **New Frontend Page**:
   - Create component in `templates/`
   - Add route in `App.jsx`
   - Update navigation if needed

### Testing

Currently, the project doesn't include automated tests. For production:
- Add unit tests for services
- Add integration tests for API endpoints
- Add E2E tests for critical user flows

## Troubleshooting

### Common Issues

**Services won't start**:
- Check if ports are available
- Verify database connections
- Check environment variables
- Review service logs

**Database connection errors**:
- Verify database is running
- Check connection strings
- Verify credentials
- Check network connectivity (Docker)

**Authentication issues**:
- Verify JWT_SECRET is set
- Check token expiration
- Verify user exists in database
- Check API Gateway logs

**Frontend can't connect to API**:
- Verify API Gateway is running
- Check CORS configuration
- Verify VITE_API_URL is correct
- Check browser console for errors

**Docker issues**:
- Check `docker-compose ps` for service status
- Review logs: `docker-compose logs [service]`
- Rebuild images: `docker-compose up -d --build`
- Check Docker resources (memory, disk)

### Getting Help

1. Check service logs
2. Review error messages
3. Verify configuration
4. Check [README-DOCKER.md](./README-DOCKER.md) for Docker-specific issues
5. Check [ADMIN-SETUP.md](./ADMIN-SETUP.md) for admin setup issues

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Commit changes: `git commit -m 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Open a pull request

### Code Style

- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic
- Keep functions focused and small

## License

This project is licensed under the MIT License.

## Contact

For questions or issues, contact:
- **Email**: petrosdawit00@gmail.com

## Additional Documentation

- [Docker Setup Guide](./README-DOCKER.md) - Detailed Docker deployment instructions
- [Admin Setup Guide](./ADMIN-SETUP.md) - How to create and manage admin users

---

**Note**: This is a production-ready application. Make sure to:
- Change all default passwords
- Set strong JWT secrets
- Configure proper CORS origins
- Use HTTPS in production
- Set up monitoring and logging
- Regular security updates
