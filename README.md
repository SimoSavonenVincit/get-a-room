# 🏢 Get-A-Room API

> A simple, elegant meeting room booking API built with **Fastify** and **TypeScript**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-4.26-black?logo=fastify)](https://www.fastify.io/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/Tests-Vitest-yellow?logo=vitest)](https://vitest.dev/)

---

## ✨ Features

- 🚀 **Fast & Modern** - Built with Fastify for high performance
- 📝 **Interactive API Docs** - Swagger UI automatically generated
- 🔐 **Simple Authentication** - API key-based security
- ✅ **Business Rules** - Prevents past bookings, overlaps, and invalid time ranges
- 🧪 **Comprehensive Tests** - Full test coverage with Vitest
- 💾 **In-Memory Storage** - Quick setup with hardcoded room data
- 🎯 **TypeScript** - Full type safety throughout

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Available Rooms](#-available-rooms)
- [API Endpoints](#-api-endpoints)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Business Rules](#-business-rules)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ installed
- npm or yarn

### Installation

```powershell
# Install dependencies
npm install

# Start the development server
npm run dev
```

The server will start at `http://localhost:3000` 🎉

### First Request

Open your browser or use curl:

```powershell
# Health check (no auth required)
curl http://localhost:3000/health

# List all rooms (requires API key)
curl -H "X-API-Key: dev-secret-key-12345" http://localhost:3000/rooms
```

---

## 🏨 Available Rooms

The API comes with 4 pre-configured meeting rooms:

| Room ID | Name | Capacity | Amenities |
|---------|------|----------|-----------|
| `room-001` | Conference Room A | 10 | Projector, Whiteboard, Video Conferencing, TV Display |
| `room-002` | Meeting Room B | 6 | Whiteboard, TV Display |
| `room-003` | Small Room C | 4 | Whiteboard |
| `room-004` | Executive Boardroom | 12 | Projector, Whiteboard, Video Conferencing, TV Display, Coffee Machine |

---

## 🛣️ API Endpoints

All endpoints except `/health` require authentication via `X-API-Key` header.

### Rooms

#### `GET /rooms`
Get all rooms with their current status (available/occupied).

**Response:**
```json
{
  "rooms": [
    {
      "id": "room-001",
      "name": "Conference Room A",
      "capacity": 10,
      "amenities": ["Projector", "Whiteboard", "Video Conferencing", "TV Display"],
      "currentStatus": "available"
    }
  ]
}
```

#### `GET /rooms/:roomId/bookings`
Get all bookings for a specific room.

**Response:**
```json
{
  "roomId": "room-001",
  "roomName": "Conference Room A",
  "bookings": [
    {
      "id": "abc-123",
      "title": "Team Standup",
      "startTime": "2025-12-05T09:00:00.000Z",
      "endTime": "2025-12-05T09:30:00.000Z",
      "organizerEmail": "john@example.com",
      "createdAt": "2025-12-04T10:00:00.000Z"
    }
  ]
}
```

### Bookings

#### `POST /bookings`
Create a new booking.

**Request Body:**
```json
{
  "roomId": "room-001",
  "title": "Team Standup",
  "startTime": "2025-12-05T09:00:00.000Z",
  "endTime": "2025-12-05T09:30:00.000Z",
  "organizerEmail": "john@example.com"
}
```

**Response:**
```json
{
  "message": "Booking created successfully",
  "booking": {
    "id": "abc-123",
    "roomId": "room-001",
    "title": "Team Standup",
    "startTime": "2025-12-05T09:00:00.000Z",
    "endTime": "2025-12-05T09:30:00.000Z",
    "organizerEmail": "john@example.com",
    "createdAt": "2025-12-04T10:00:00.000Z"
  }
}
```

#### `DELETE /bookings/:bookingId`
Cancel an existing booking.

**Response:**
```json
{
  "message": "Booking cancelled successfully"
}
```

---

## 📚 API Documentation

Once the server is running, visit the **interactive Swagger UI**:

### 🌐 [http://localhost:3000/docs](http://localhost:3000/docs)

Here you can:
- ✅ Explore all endpoints
- ✅ Try requests directly from your browser
- ✅ See request/response schemas
- ✅ Test authentication

**To use the Swagger UI:**
1. Click the **Authorize** button (🔒)
2. Enter the API key: `dev-secret-key-12345`
3. Click **Authorize**
4. Now you can test all endpoints!

---

## 🧪 Testing

Run the comprehensive test suite:

```powershell
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

The test suite covers:
- ✅ All business logic validation
- ✅ Booking time validation (no past bookings, start < end)
- ✅ Room availability checking (overlap detection)
- ✅ CRUD operations for bookings
- ✅ Room status calculation
- ✅ In-memory data store operations

---

## 📁 Project Structure

```
get-a-room/
├── src/
│   ├── config/              # Configuration files
│   ├── middleware/
│   │   └── auth.ts          # API key authentication
│   ├── models/
│   │   └── dataStore.ts     # In-memory storage with hardcoded rooms
│   ├── routes/
│   │   ├── bookingRoutes.ts # Booking endpoints
│   │   └── roomRoutes.ts    # Room endpoints
│   ├── services/
│   │   ├── bookingService.ts # Booking business logic
│   │   └── roomService.ts    # Room business logic
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   └── server.ts            # Application entry point
├── tests/
│   ├── bookingService.test.ts
│   ├── dataStore.test.ts
│   └── roomService.test.ts
├── .env                     # Environment variables (not in git)
├── .env.example             # Example environment configuration
├── .gitignore
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Server Configuration
PORT=3000
HOST=0.0.0.0

# Authentication
API_KEY=your-secret-api-key-here

# Environment
NODE_ENV=development
```

### Available Scripts

```powershell
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Run production build
npm test             # Run tests once
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run lint         # Lint code with ESLint
npm run format       # Format code with Prettier
```

---

## 📖 Business Rules

The API enforces the following booking rules:

### ⏰ Time Validation
- ❌ **No Past Bookings** - Start time must be in the future
- ❌ **Start Before End** - Start time must be before end time
- ✅ **Back-to-Back Bookings** - Bookings can start exactly when another ends

### 🔒 Availability Rules
- ❌ **No Overlaps** - Room cannot be double-booked
- ✅ **Real-time Status** - Room status shows current occupancy
- ✅ **Concurrent Bookings** - Different rooms can be booked simultaneously

### 🔐 Security
- 🔑 **API Key Required** - All endpoints (except `/health`) require authentication
- 🔒 **Header-Based Auth** - Pass API key via `X-API-Key` header

---

## 🏗️ Architecture

### Clean Architecture Principles

```
┌─────────────────────────────────────┐
│         Routes (HTTP Layer)         │  ← Handle requests/responses
├─────────────────────────────────────┤
│      Services (Business Logic)      │  ← Validation & business rules
├─────────────────────────────────────┤
│     Models (Data Access Layer)      │  ← In-memory storage operations
└─────────────────────────────────────┘
```

- **Routes**: Handle HTTP requests, call services, return responses
- **Services**: Implement business logic and validation rules
- **Models**: Manage data persistence (in-memory storage)
- **Middleware**: Cross-cutting concerns (authentication)
- **Types**: TypeScript interfaces for type safety

---

## 🎯 Example Usage

### Booking a Room

```powershell
# 1. Check available rooms
curl -H "X-API-Key: dev-secret-key-12345" http://localhost:3000/rooms

# 2. Create a booking
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-secret-key-12345" \
  -d '{
    "roomId": "room-001",
    "title": "Project Planning",
    "startTime": "2025-12-10T14:00:00.000Z",
    "endTime": "2025-12-10T15:00:00.000Z",
    "organizerEmail": "alice@example.com"
  }'

# 3. View room bookings
curl -H "X-API-Key: dev-secret-key-12345" http://localhost:3000/rooms/room-001/bookings

# 4. Cancel booking (use the ID from step 2)
curl -X DELETE http://localhost:3000/bookings/abc-123 \
  -H "X-API-Key: dev-secret-key-12345"
```

---

## 🤝 Contributing

This is a learning project. Feel free to:
- 🐛 Report bugs
- 💡 Suggest features
- 🔧 Submit pull requests

---

## 📝 License

ISC

---

## 🙏 Acknowledgments

Built with:
- [Fastify](https://www.fastify.io/) - Fast and low overhead web framework
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Vitest](https://vitest.dev/) - Blazing fast unit test framework
- [Swagger](https://swagger.io/) - API documentation

---

<div align="center">

Made with ☕ and 💻

**Happy Booking! 🎉**

</div>

A simple API for reserving rooms
