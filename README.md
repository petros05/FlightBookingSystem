# Flight Booking System

A full-stack web application for booking flights, managing users, and handling orders. Built with a Node.js/Express backend and a React/Vite frontend.

## Features

- **User Authentication**: Register, login, and manage user accounts.
- **Flight Management**: View available flights, search, and book tickets.
- **Order Management**: Track and manage flight bookings.
- **Admin Panel**: Manage flights, orders, and passengers (admin access required).
- **Responsive Design**: Works on desktop and mobile devices.

## Tech Stack

### Backend
- **Node.js** with **Express.js** for the server.
- **MongoDB** with **Mongoose** for database.
- **JWT** for authentication.
- **bcrypt** for password hashing.
- **CORS** for cross-origin requests.

### Frontend
- **React** with **Vite** for fast development.
- **React Router** for navigation.
- **Axios** for API calls.
- **CSS** for styling.

## Project Structure

```
FlightBookingWebjs/
├── FlightBookingBackend/          # Backend application
│   ├── config/                    # Configuration files
│   ├── middleware/                # Authentication middleware
│   ├── models/                    # MongoDB models (Flight, Order, User)
│   ├── routes/                    # API routes (auth, flights, orders, etc.)
│   ├── server.js                  # Main server file
│   ├── package.json               # Backend dependencies
│   └── .gitignore                 # Backend ignore file
├── FlightBookingWebApp/           # Frontend application
│   ├── public/                    # Static assets
│   ├── src/                       # React source code
│   │   ├── components/            # Reusable components
│   │   ├── context/               # React context (Auth)
│   │   ├── templates/             # Page templates
│   │   └── utils/                 # Utility functions
│   ├── vite.config.js             # Vite configuration
│   ├── package.json               # Frontend dependencies
│   └── .gitignore                 # Frontend ignore file
└── README.md                      # This file
```

## Installation and Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance)
- **npm** or **yarn**

### Backend Setup
1. Navigate to the backend folder:
   ```
   cd FlightBookingBackend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in `FlightBookingBackend/` with:
   ```
   MONGO_URI=mongodb://localhost:27017/flightbooking  # Or your MongoDB URI
   JWT_SECRET=your_secret_key_here
   PORT=5000
   ```
4. Start the server:
   ```
   npm start
   ```
   Or for development with auto-reload:
   ```
   npm run dev
   ```
   Server runs on `http://localhost:5000`.

### Frontend Setup
1. Navigate to the frontend folder:
   ```
   cd FlightBookingWebApp
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
   App runs on `http://localhost:5173` (default Vite port).

### Running the Full App
- Start the backend first.
- Start the frontend.
- Open `http://localhost:5173` in your browser.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user.
- `POST /api/auth/login` - Login user.
- `GET /api/auth/profile` - Get user profile (requires auth).

### Flights
- `GET /api/flights` - Get all flights.
- `POST /api/flights` - Add a new flight (admin only).
- `PUT /api/flights/:id` - Update flight (admin only).
- `DELETE /api/flights/:id` - Delete flight (admin only).

### Orders
- `GET /api/orders` - Get user orders (requires auth).
- `POST /api/orders` - Create a new order (requires auth).
- `PUT /api/orders/:id` - Update order (requires auth).

### Admin
- `GET /api/admin/flights` - Manage flights (admin only).
- `GET /api/admin/orders` - Manage orders (admin only).
- `GET /api/admin/passengers` - Manage passengers (admin only).

## Usage

1. **Register/Login**: Create an account or log in.
2. **Browse Flights**: View available flights on the home page.
3. **Book a Flight**: Select a flight and book it (creates an order).
4. **Manage Orders**: View your bookings in the passenger dashboard.
5. **Admin Access**: Log in as admin to manage flights, orders, and users.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`.
3. Commit changes: `git commit -m 'Add feature'`.
4. Push to branch: `git push origin feature-name`.
5. Open a pull request.

## License

This project is licensed under the MIT License. See LICENSE for details.

## Contact

For questions or issues, contact Petros Abraha at [petrosdawit00@gmail.com].