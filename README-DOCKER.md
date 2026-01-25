# Docker Setup for Flight Booking System

This guide explains how to run the Flight Booking System using Docker and Docker Compose.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- At least 4GB of available RAM
- Ports 80, 3000, 3001, 3002, 3003, 3004, 5432, 27017 available

## Quick Start

1. **Clone the repository** (if not already done)
   ```bash
   git clone <repository-url>
   cd FlightBookingWebjs
   ```

2. **Start all services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost
   - API Gateway: http://localhost:3000

4. **View logs** (optional)
   ```bash
   docker-compose logs -f
   ```

5. **Stop all services**
   ```bash
   docker-compose down
   ```

## Services

The Docker Compose setup includes:

- **postgres**: PostgreSQL database for user service (port 5432)
- **mongo**: MongoDB database for flight and booking services (port 27017)
- **user-service**: User authentication and management (port 3001)
- **flight-service**: Flight management service (port 3002)
- **booking-service**: Booking and order management (port 3003)
- **admin-service**: Admin operations service (port 3004)
- **api-gateway**: API Gateway routing requests (port 3000)
- **frontend**: React frontend application (port 80)

## Environment Variables

Default environment variables are set in `docker-compose.yml`. For production, you should:

1. Create a `.env` file in the root directory
2. Override sensitive values like `JWT_SECRET` and database passwords
3. Update the frontend API URL if needed

Example `.env` file:
```env
JWT_SECRET=your-very-secure-secret-key-here
POSTGRES_PASSWORD=secure-password
DB_PASSWORD=secure-password
```

## Building Individual Services

To rebuild a specific service:

```bash
docker-compose build <service-name>
docker-compose up -d <service-name>
```

Example:
```bash
docker-compose build frontend
docker-compose up -d frontend
```

## Troubleshooting

### Services won't start
- Check if ports are already in use: `netstat -an | grep <port>`
- View service logs: `docker-compose logs <service-name>`
- Check Docker resources: Ensure Docker has enough memory allocated

### Database connection issues
- Wait for databases to be healthy: `docker-compose ps`
- Check database logs: `docker-compose logs postgres` or `docker-compose logs mongo`

### Frontend can't connect to API
- Ensure API Gateway is running: `docker-compose ps api-gateway`
- Check API Gateway logs: `docker-compose logs api-gateway`
- Verify the API URL in the frontend build (default: http://localhost:3000)

### Reset everything
```bash
docker-compose down -v  # Removes volumes too
docker-compose up -d --build  # Rebuilds and starts
```

## Production Considerations

1. **Change default passwords** in `docker-compose.yml`
2. **Set a strong JWT_SECRET**
3. **Use environment files** for sensitive data
4. **Configure proper CORS** in production
5. **Set up SSL/TLS** for the frontend and API Gateway
6. **Use Docker secrets** for sensitive data in production
7. **Configure resource limits** for each service
8. **Set up monitoring and logging**

## Development vs Production

- **Development**: Services use `nodemon` for hot-reloading (not in Docker)
- **Production**: Docker containers use `node` directly for better performance
- **Database**: Auto-initialization happens on first startup
- **Frontend**: Built and served via Nginx in production mode

## Network

All services run on the same Docker network (`flightbooking-network`) and can communicate using service names as hostnames.

Example: `http://user-service:3001` from within the Docker network.
