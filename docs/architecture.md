# Architecture Decisions

## Tech Stack
- **Frontend**: Next.js (React) with Tailwind CSS.
- **Backend**: Express.js (Node.js) with TypeScript.
- **Database**: SQLite (managed via Prisma ORM).
- **Authentication**: JWT (JSON Web Tokens) with bcryptjs for password hashing.
- **AI Integration**: Google Gemini API (planned for summarization).

## Rationale
- **SQLite**: Chosen for its zero-configuration setup, making it ideal for the initial development phase in a WSL2 environment.
- **Next.js/Express**: Provides a clear separation between the client and server while maintaining a modern, type-safe development experience.
- **Prisma**: Allows for easy schema management and the flexibility to migrate to a more robust database like PostgreSQL if needed in the future.
