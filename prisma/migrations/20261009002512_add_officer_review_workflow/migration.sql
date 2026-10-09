-- CreateEnum
CREATE TYPE "OfficerDecision" AS ENUM ('APPROVED', 'REJECTED', 'PENDING');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "officerComment" TEXT,
ADD COLUMN     "officerDecision" "OfficerDecision",
ADD COLUMN     "reviewedAt" TIMESTAMP(3);
