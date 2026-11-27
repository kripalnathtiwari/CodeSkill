-- Performance Latency Indexes (PostgreSQL / Supabase)
-- Run via `npx prisma migrate deploy` (using DIRECT_URL) or psql.
-- Note: For zero-downtime creation on large production tables in psql, run with CONCURRENTLY outside a transaction.

CREATE INDEX IF NOT EXISTS "User_createdAt_desc_idx"
  ON "User"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS "Enrollment_studentId_createdAt_desc_idx"
  ON "Enrollment"("studentId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "Enrollment_createdAt_desc_idx"
  ON "Enrollment"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS "Submission_userId_status_questionId_idx"
  ON "Submission"("userId", "status", "questionId");

CREATE INDEX IF NOT EXISTS "ProjectIdea_createdAt_desc_idx"
  ON "ProjectIdea"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS "Note_createdAt_desc_idx"
  ON "Note"("createdAt" DESC);

-- Covering index for GET /api/v1/questions/metadata/aggregates?type=INTERVIEW (enables Index-Only Scan)
CREATE INDEX IF NOT EXISTS "Question_type_covering_idx"
  ON "Question"("type") INCLUDE ("tags", "companies");
