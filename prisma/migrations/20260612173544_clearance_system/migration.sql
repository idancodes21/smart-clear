/*
  Warnings:

  - Added the required column `level` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'OFFICER');

-- CreateEnum
CREATE TYPE "ClearanceType" AS ENUM ('FEE_CLEARANCE', 'APPLICATION_LETTER', 'STATEMENT_OF_RESULT', 'SECURITY_CLEARANCE', 'ACCOMMODATION_CLEARANCE', 'LIBRARY_CLEARANCE');

-- CreateEnum
CREATE TYPE "ClearanceStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "StepStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "email" TEXT,
ADD COLUMN     "level" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Clearance" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" "ClearanceType" NOT NULL,
    "status" "ClearanceStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clearance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClearanceStep" (
    "id" TEXT NOT NULL,
    "clearanceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "StepStatus" NOT NULL DEFAULT 'PENDING',
    "aiVerified" BOOLEAN NOT NULL DEFAULT false,
    "aiScore" DOUBLE PRECISION,
    "aiComment" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "ClearanceStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "clearanceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "aiVerified" BOOLEAN NOT NULL DEFAULT false,
    "aiScore" DOUBLE PRECISION,
    "aiComment" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Clearance_studentId_type_key" ON "Clearance"("studentId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Clearance" ADD CONSTRAINT "Clearance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearanceStep" ADD CONSTRAINT "ClearanceStep_clearanceId_fkey" FOREIGN KEY ("clearanceId") REFERENCES "Clearance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_clearanceId_fkey" FOREIGN KEY ("clearanceId") REFERENCES "Clearance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
