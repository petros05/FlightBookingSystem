# Admin User Setup Guide

This guide explains how to create an admin user in the Flight Booking System when running with Docker.

## Method 1: Automatic Admin Creation (Recommended)

The system automatically creates an admin user on first startup if no admin exists.

### Default Admin Credentials

When the system starts for the first time, it creates an admin user with these default credentials:

- **Username**: `admin123456`
- **Password**: `admin123456`
- **Display Name**: `System Administrator`

### Customizing Admin Credentials

You can customize the admin credentials by setting environment variables in `docker-compose.yml`:

```yaml
user-service:
  environment:
    - ADMIN_USERNAME=myadmin
    - ADMIN_PASSWORD=SecurePassword123!
    - ADMIN_DISPLAY_NAME=My Admin Name
```

Then restart the service:

```bash
docker-compose restart user-service
```

**⚠️ Important**: Change the default password immediately after first login!

## Method 2: Create Admin via API Endpoint

You can create an admin user via the API endpoint:

```bash
curl -X POST http://localhost:3001/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "admin",
    "password": "your-secure-password",
    "displayName": "System Administrator"
  }'
```

**Note**: This endpoint works if no admin exists, or if called by an existing admin (in production, this should be protected).

## Method 3: Create Admin via Database (Advanced)

If you need to create an admin directly in the database:

1. **Connect to PostgreSQL container**:
   ```bash
   docker exec -it flightbooking-postgres psql -U postgres -d flightbooking_users
   ```

2. **Insert admin user** (replace values as needed):
   ```sql
   -- First, generate a password hash (you'll need to do this in Node.js or use bcrypt)
   -- For example, password "admin123" hashed with bcrypt
   
   INSERT INTO users (id, "userName", "passwordHash", role, "displayName", "createdAt", "updatedAt")
   VALUES (
     gen_random_uuid(),
     'admin',
     '$2a$10$YourBcryptHashHere',  -- Replace with actual bcrypt hash
     'Administrator',
     'System Administrator',
     NOW(),
     NOW()
   );
   ```

3. **Generate password hash** (using Node.js):
   ```javascript
   const bcrypt = require('bcryptjs');
   const hash = await bcrypt.hash('your-password', 10);
   console.log(hash);
   ```

## Method 4: Using Docker Exec to Run Script

You can also create a script and run it inside the container:

1. **Create a script** `create-admin.js`:
   ```javascript
   require('dotenv').config();
   const sequelize = require('./src/config/database');
   const User = require('./src/models/User');
   const bcrypt = require('bcryptjs');

   async function createAdmin() {
     await sequelize.authenticate();
     const passwordHash = await bcrypt.hash('admin123', 10);
     const admin = await User.create({
       userName: 'admin',
       passwordHash,
       role: 'Administrator',
       displayName: 'System Administrator'
     });
     console.log('Admin created:', admin.userName);
     process.exit(0);
   }

   createAdmin().catch(console.error);
   ```

2. **Copy script to container and run**:
   ```bash
   docker cp create-admin.js flightbooking-user-service:/app/
   docker exec flightbooking-user-service node create-admin.js
   ```

## Verify Admin User

To verify the admin user was created:

1. **Check via API**:
   ```bash
   curl http://localhost:3001/me \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **Check via Database**:
   ```bash
   docker exec -it flightbooking-postgres psql -U postgres -d flightbooking_users -c "SELECT \"userName\", role, \"displayName\" FROM users WHERE role = 'Administrator';"
   ```

## Login as Admin

1. **Via Frontend**: Go to http://localhost/login and use your admin credentials
2. **Via API**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "userName": "admin",
       "password": "admin123"
     }'
   ```

## Security Recommendations

1. **Change default password immediately** after first login
2. **Use strong passwords** (minimum 12 characters, mixed case, numbers, symbols)
3. **Set custom credentials** via environment variables in production
4. **Disable admin creation logging** in production by removing `LOG_ADMIN_CREATION=true`
5. **Protect the `/create-admin` endpoint** in production (add authentication middleware)

## Troubleshooting

### Admin not created automatically

- Check user-service logs: `docker-compose logs user-service`
- Verify database connection: `docker-compose ps postgres`
- Check if admin already exists: Query the database

### Can't login as admin

- Verify credentials match what was set
- Check JWT_SECRET is set correctly
- Verify user-service is running: `docker-compose ps user-service`

### Multiple admins needed

Use Method 2 (API endpoint) or Method 3 (database) to create additional admin users.
