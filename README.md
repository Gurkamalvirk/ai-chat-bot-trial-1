# AI Powered Chat Bot (MERN)

Provider-agnostic chat application with streaming SSE, session memory in MongoDB, JWT auth, basic safety guardrails, and a modern React UI.

## Quickstart

Prereqs: Node 20+, MongoDB

1. Backend
   - cd backend
   - npm install
   - Create `.env` file with environment variables (see backend/README.md for details)
   - npm run seed
   - npm run dev

2. Frontend
   - cd frontend
   - npm install
   - npm run dev

Backend runs on :4000, frontend on :5173.

## Environment

See `backend/README.md` for environment variables. Do not hardcode API keys. Set `OPENAI_API_KEY` or Dialogflow credentials accordingly.

To use Gemini, set up a provider adapter similarly to OpenAI (not included by default). Do not commit keys. The user-provided key should be placed in environment variables during runtime only.

## Features
- Provider abstraction: OpenAI, Dialogflow (placeholder), Mock
- Streaming via SSE on `/api/chat/send`
- MongoDB persistence: users, sessions, messages, prompts
- JWT auth with httpOnly cookies
- Rate limiting, CORS, CSRF token endpoint
- Safety input validation
- Export sessions

## Tests
- `npm test` in backend runs unit tests with the Mock provider

## Notes
- TTL indexes can be added on `Session.lastActiveAt` per requirements; wire via migrations or at startup.
- Summarization, advanced moderation, budgets, and observability hooks are ready to extend in the codebase.
