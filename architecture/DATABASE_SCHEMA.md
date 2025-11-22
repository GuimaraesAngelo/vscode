# Database Schema (Prisma)

We use a relational database to ensure ACID compliance for agent state. This is critical for "long-running" tasks and "handoffs".

## Schema Definition (`schema.prisma`)

```prisma
datasource db {
  provider = "postgresql" // or "sqlite" for local
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// --- AGENT DEFINITIONS ---

model Agent {
  id           String   @id @default(uuid())
  name         String   @unique
  role         String
  model        String   @default("gpt-4-turbo")
  instructions String   @db.Text
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  sessions     Session[]
  tools        AgentTool[]
}

model AgentTool {
  id        String @id @default(uuid())
  agentId   String
  toolName  String
  enabled   Boolean @default(true)

  agent     Agent @relation(fields: [agentId], references: [id])

  @@unique([agentId, toolName])
}

// --- EXECUTION STATE ---

model Session {
  id        String   @id @default(uuid())
  title     String?
  agentId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  agent     Agent     @relation(fields: [agentId], references: [id])
  messages  Message[]
  runs      Run[]
}

model Message {
  id        String   @id @default(uuid())
  sessionId String
  role      String   // "user", "assistant", "system", "tool"
  content   String   @db.Text
  createdAt DateTime @default(now())

  session   Session @relation(fields: [sessionId], references: [id])
}

model Run {
  id          String   @id @default(uuid())
  sessionId   String
  status      String   // "queued", "in_progress", "completed", "failed"
  startedAt   DateTime @default(now())
  completedAt DateTime?
  tokensUsed  Int      @default(0)
  cost        Float    @default(0.0)

  session     Session @relation(fields: [sessionId], references: [id])
  logs        RunLog[]
}

model RunLog {
  id        String   @id @default(uuid())
  runId     String
  level     String   // "info", "warn", "error"
  message   String
  metadata  Json?
  createdAt DateTime @default(now())

  run       Run @relation(fields: [runId], references: [id])
}

// --- SETTINGS ---

model Setting {
  key   String @id
  value String
}
```

## Persistence Strategy
1.  **Local Development**: Use SQLite file inside `.vscode/agents.db`.
2.  **Production/Team**: Use Dockerized PostgreSQL.
3.  **Sync**: The `AgentManager` initializes the DB on startup and ensures the schema is applied.
