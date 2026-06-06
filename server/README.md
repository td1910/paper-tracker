# Paper Tracker - Server

This is the backend API for the Paper Tracker system.

## Tech Stack
- **Node.js** with **Express**
- **TypeScript**
- **Prisma** (ORM) with **SQLite**
- **JWT** for Authentication

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file (one should already be present) with:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
PORT=4000
GEMINI_API_KEY="your-api-key"
```

### 3. Database Initialization
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run the Server
**Development (with auto-reload):**
```bash
npx nodemon src/index.ts
```

**Build & Run:**
```bash
npx tsc
node dist/src/index.js
```

## API Endpoints
- `GET /`: Hello World
- `POST /api/auth/register`: Register user
- `POST /api/auth/login`: Login user
- `GET /api/topics`: Manage user topics
- `GET /api/papers`: View tracked papers
