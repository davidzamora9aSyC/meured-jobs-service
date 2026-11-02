CREATE SCHEMA IF NOT EXISTS "meured_jobs";

CREATE TYPE "meured_jobs"."MeuredJobPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'DELETED');
CREATE TYPE "meured_jobs"."MeuredJobApplicationStatus" AS ENUM ('SUBMITTED', 'WITHDRAWN', 'REVIEWING', 'REJECTED', 'ACCEPTED');

CREATE TABLE "meured_jobs"."MeuredJobPost" (
  "id" TEXT NOT NULL,
  "createdByAuthUserId" TEXT NOT NULL,
  "entityId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" "meured_jobs"."MeuredJobPostStatus" NOT NULL DEFAULT 'PUBLISHED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MeuredJobPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "meured_jobs"."MeuredJobApplication" (
  "id" TEXT NOT NULL,
  "jobPostId" TEXT NOT NULL,
  "applicantAuthUserId" TEXT NOT NULL,
  "coverLetter" TEXT,
  "status" "meured_jobs"."MeuredJobApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MeuredJobApplication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "meured_jobs"."MeuredJobBookmark" (
  "id" TEXT NOT NULL,
  "authUserId" TEXT NOT NULL,
  "jobPostId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MeuredJobBookmark_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MeuredJobPost_createdByAuthUserId_idx" ON "meured_jobs"."MeuredJobPost"("createdByAuthUserId");
CREATE INDEX "MeuredJobPost_entityId_idx" ON "meured_jobs"."MeuredJobPost"("entityId");
CREATE INDEX "MeuredJobPost_createdAt_idx" ON "meured_jobs"."MeuredJobPost"("createdAt");
CREATE INDEX "MeuredJobPost_status_idx" ON "meured_jobs"."MeuredJobPost"("status");

CREATE UNIQUE INDEX "MeuredJobApplication_jobPostId_applicantAuthUserId_key" ON "meured_jobs"."MeuredJobApplication"("jobPostId","applicantAuthUserId");
CREATE INDEX "MeuredJobApplication_applicantAuthUserId_idx" ON "meured_jobs"."MeuredJobApplication"("applicantAuthUserId");
CREATE INDEX "MeuredJobApplication_status_idx" ON "meured_jobs"."MeuredJobApplication"("status");

CREATE UNIQUE INDEX "MeuredJobBookmark_authUserId_jobPostId_key" ON "meured_jobs"."MeuredJobBookmark"("authUserId","jobPostId");
CREATE INDEX "MeuredJobBookmark_authUserId_idx" ON "meured_jobs"."MeuredJobBookmark"("authUserId");
CREATE INDEX "MeuredJobBookmark_jobPostId_idx" ON "meured_jobs"."MeuredJobBookmark"("jobPostId");

ALTER TABLE "meured_jobs"."MeuredJobApplication"
  ADD CONSTRAINT "MeuredJobApplication_jobPostId_fkey"
  FOREIGN KEY ("jobPostId") REFERENCES "meured_jobs"."MeuredJobPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "meured_jobs"."MeuredJobBookmark"
  ADD CONSTRAINT "MeuredJobBookmark_jobPostId_fkey"
  FOREIGN KEY ("jobPostId") REFERENCES "meured_jobs"."MeuredJobPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

