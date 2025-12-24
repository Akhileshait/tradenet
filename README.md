

## Real-Time Trading Platform (Testnet)

## Tech Stack Requirements

**Backend:**
- Node.js with Express.js
- Redis (for message bus)
- PostgreSQL 
- JWT authentication
- Binance Testnet API

**Frontend:**
- Next.js 
- TypeScript
- lightweight-charts (TradingView) 
- WebSocket client
- Tailwind CSS (for styling)

**Repository Structure:**
- Monorepo architecture (both backend and frontend in same repository)

**Deployment:**
- Deploy both backend and frontend
- Provide GitHub repo + live URLs

## System Architecture Overview

Your system must follow this architecture pattern:

```
Frontend → API Gateway (JWT auth) → Redis (command bus) → Order Execution
                                                              ↓
Frontend ← WebSocket ← Event Service (subscribes to Redis) ← Order Events
```

**Key principles:**
1. API Gateway does not execute orders directly
2. Orders are published to Redis as commands
3. A separate service consumes Redis events and executes orders
4. Order events flow back through Redis → Event Service → Frontend
5. All order commands and events are logged to a database

