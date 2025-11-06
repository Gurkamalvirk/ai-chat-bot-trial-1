# Backend

## Setup

- npm install
- Environment variables (example):
  - PORT=4000
  - NODE_ENV=development
  - MONGODB_URI=mongodb://localhost:27017/ai_chat
  - JWT_SECRET=change_me
  - CORS_ORIGIN=http://localhost:5173
  - RATE_LIMIT_WINDOW_MS=60000
  - RATE_LIMIT_MAX=120
  - PROVIDER_DEFAULT=openai
  - OPENAI_API_KEY=your_key
  - GEMINI_API_KEY=your_key

## Run

- npm run dev

## Seed

- npm run seed

## Test

- Ensure MongoDB is available at MONGODB_URI
- npm test
