-- Proposed Migration: BullMQ Job Tracking & Exam Grading Columns
-- Apply via `npx prisma migrate deploy` (using DIRECT_URL) or `npx prisma db push`

-- AlterTable: CompilerJob retry diagnostics
ALTER TABLE "CompilerJob"
ADD COLUMN IF NOT EXISTS "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "lastError" TEXT;

-- AlterTable: TestAttempt exam grading & result publishing state
ALTER TABLE "TestAttempt"
ADD COLUMN IF NOT EXISTS "maxScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "mcqScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "codingScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "mcqAnswers" JSONB,
ADD COLUMN IF NOT EXISTS "resultBreakdown" JSONB,
ADD COLUMN IF NOT EXISTS "gradingError" TEXT,
ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);

-- CreateTable: BackgroundJob (PostgreSQL source of truth for file/report jobs)
CREATE TABLE IF NOT EXISTS "BackgroundJob" (
    "id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "processedItems" INTEGER NOT NULL DEFAULT 0,
    "failedItems" INTEGER NOT NULL DEFAULT 0,
    "inputKey" TEXT,
    "outputKey" TEXT,
    "errorReport" JSONB,
    "metadata" JSONB,
    "createdById" UUID,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BackgroundJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BackgroundJob_type_status_idx" ON "BackgroundJob"("type", "status");
CREATE INDEX IF NOT EXISTS "BackgroundJob_createdById_idx" ON "BackgroundJob"("createdById");
CREATE INDEX IF NOT EXISTS "BackgroundJob_createdAt_idx" ON "BackgroundJob"("createdAt");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "BackgroundJob"
  ADD CONSTRAINT "BackgroundJob_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
