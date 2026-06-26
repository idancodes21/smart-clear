-- CreateTable
CREATE TABLE "ClearanceCertificate" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "qrCodeUrl" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClearanceCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClearanceCertificate_studentId_key" ON "ClearanceCertificate"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "ClearanceCertificate_verificationCode_key" ON "ClearanceCertificate"("verificationCode");

-- AddForeignKey
ALTER TABLE "ClearanceCertificate" ADD CONSTRAINT "ClearanceCertificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
