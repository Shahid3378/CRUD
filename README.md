
# CRUD – User & Profile Management Microservices

A JavaScript-based microservices application for managing users and profiles. This project uses **Express.js** and **Fastify** to provide separate services for user and profile management, with integrations for MongoDB, Redis, RabbitMQ, Cloudinary, and email delivery.

## 🚀 Features

- **User Management:** Create, read, update, and delete user records.
- **Profile Management:** Dedicated APIs for managing user profiles.
- **Authentication & Security:**
  - JWT-based authentication.
  - Password hashing using bcrypt.
  - Request validation using Joi.
- **Caching & Sessions:**
  - Redis-backed session management.
  - NodeCache for in-memory caching.
- **Database:** MongoDB integration for persistent data storage.
- **Message Queue:** RabbitMQ integration for asynchronous communication.
- **File Uploads:** Cloudinary integration for media storage.
- **Email Service:** SMTP-based email delivery support.
- **Scheduled Tasks:** Cron jobs for scheduled user-data refresh operations.
- **Data Management:**
  - CSV parsing and export utilities.
  - CSV and JSON data seeding utilities.
- **Testing:** Basic API testing and validation scripts.

## 🏗️ Project Architecture

The repository follows a microservices architecture with two independent services:

| Service | Framework | Description | Port |
|---|---|---|---|
| User Service | Express.js | User operations, authentication, sessions, email, and scheduled jobs | 3000 |
| Profile Service | Fastify | Profile management APIs and supporting business logic | Configurable |

## 📁 Repository Structure

```text
CRUD/
│
├── user-service/
│   ├── app.js
│   ├── connections/
│   │   └── Database, Redis, and external connections
│   ├── model/
│   │   └── MongoDB models
│   ├── public/
│   │   └── Public assets
│   ├── src/
│   │   ├── controller/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── validation/
│   ├── test/
│   │   └── Test files
│   ├── utils/
│   │   └── Cron jobs and helper utilities
│   ├── seedUsers.js
│   └── testJoi.js
│
└── profile-service/
    ├── package.json
    ├── package-lock.json
    └── src/
        ├── app.js
        ├── fastify.js
        ├── config/
        ├── controllers/
        ├── middleware/
        ├── routes/
        ├── services/
        └── validation/
```

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| JavaScript / Node.js | Backend development |
| Express.js | User service framework |
| Fastify | Profile service framework |
| MongoDB | Database |
| Redis | Session management and caching |
| NodeCache | In-memory caching |
| RabbitMQ | Message queue integration |
| JWT | Authentication |
| bcrypt | Password hashing |
| Joi | Request validation |
| Cloudinary | File and image storage |
| Nodemailer / SMTP | Email delivery |
| Node-Cron | Scheduled background tasks |

## 📋 Prerequisites

Make sure the following tools and services are installed or configured:

- Node.js 18 or newer
- npm
- MongoDB
- Redis
- RabbitMQ (optional, for queue-related functionality)
- Cloudinary account (for file uploads)
- SMTP or email provider credentials

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Shahid3378/CRUD.git

cd CRUD
```

### 2. Install User Service Dependencies

```bash
cd user-service

npm install
```

### 3. Install Profile Service Dependencies

```bash
cd ../profile-service

npm install
```

## 🔐 Environment Configuration

Create a `.env` file inside the appropriate service directory.

### User Service Environment Variables

```env
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/crud
MONGODB_URI_2=mongodb://localhost:27017/crud-secondary

# Redis
REDIS_URL=redis://localhost:6379

# Authentication & Sessions
SESSION_SECRET=your-secure-session-secret
JWT_SECRET=your-secure-jwt-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# RabbitMQ
RABBITMQ_URL=amqp://localhost

# Email Configuration
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your-email@example.com
MAIL_PASSWORD=your-email-password
```

**Important:** These environment variables are examples. Check the source code of each service to confirm the exact variable names required by your implementation. Add profile-service-specific environment variables if needed.

Never commit your `.env` files or expose production credentials.

## ▶️ Running the Application

Both services run independently.

### Start User Service

```bash
cd user-service

node app.js
```

The User Service starts on:

```text
http://localhost:3000
```

It also initializes the configured database connections and scheduled jobs.

### Start Profile Service

```bash
cd profile-service

nodemon src/app.js
```

Make sure Nodemon is installed globally or available through your development dependencies.

## 🌐 API Access

Once the User Service is running, verify the application using:

```bash
curl http://localhost:3000/
```

**Example Response:**

```json
{
  "message": "Hello World"
}
```

For available API endpoints, explore:

- `user-service/src/routes/` – User, template, and mail routes.
- `profile-service/src/routes/` – Profile management routes.

Refer to the corresponding controllers and validation files for request parameters and response structures.

## 🧪 Testing

The User Service includes basic testing and validation utilities.

### Run Joi Validation Test

```bash
cd user-service

node testJoi.js
```

### Seed User Data

```bash
node seedUsers.js
```

### Run Service Tests

```bash
cd user-service/test
```

Run the individual test scripts available in this directory.

Ensure MongoDB and any other required infrastructure services are running before executing integration tests.

## 🔄 Development Workflow

For a smoother development experience:

- Use Nodemon to automatically restart services when files change.
- Keep environment variables separate for each service.
- Maintain independent dependencies for each microservice.
- Use Redis for caching and session management.
- Configure RabbitMQ when asynchronous messaging is required.
- Use Cloudinary for media upload and storage.
- Keep validation and business logic separated from route handlers.

## 🔒 Security & Best Practices

- Replace all default or hard-coded secrets with secure environment variables.
- Never commit API keys, database credentials, or `.env` files.
- Use strong JWT and session secrets.
- Validate incoming requests using Joi.
- Hash passwords using bcrypt before storing them.
- Configure appropriate CORS policies and authentication middleware.
- Use secure database credentials in production.
- Configure production-ready error handling and logging.

## 🚧 Future Improvements

- Add Docker and Docker Compose support.
- Implement centralized logging and monitoring.
- Add automated integration and unit tests.
- Introduce API documentation using Swagger / OpenAPI.
- Add service-to-service authentication.
- Implement CI/CD pipelines.
- Add health-check endpoints for both services.

## 📄 License

No license is currently specified for this repository.

---

**Developed by [Shahid3378](https://github.com/Shahid3378)**

**Repository:** [CRUD – GitHub](https://github.com/Shahid3378/CRUD)
