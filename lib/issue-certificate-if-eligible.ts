
import { ClearanceStatus, ClearanceType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateCertificate } from "@/lib/generate-certificate";
import { sendCertificateEmail } from "@/lib/send-certificate-email";

export async function issueCertificateIfEligible(studentId: string) {
  const clearances = await prisma.clearance.findMany({
    where: { studentId },
    select: {
      type: true,
      status: true,
    },
  });

  const completedTypes = new Set(
    clearances
      .filter(
        (clearance) => clearance.status === ClearanceStatus.COMPLETED,
      )
      .map((clearance) => clearance.type),
  );

  const allClearancesCompleted = Object.values(ClearanceType).every(
    (type) => completedTypes.has(type),
  );

  if (!allClearancesCompleted) {
    return null;
  }

  // Return an existing certificate without sending another email.
  const existingCertificate =
    await prisma.clearanceCertificate.findUnique({
      where: { studentId },
    });

  if (existingCertificate) {
    return existingCertificate;
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      fullName: true,
      regNo: true,
      email: true,
    },
  });

  if (!student) {
    throw new Error("Student not found.");
  }

  // Generate the certificate only after eligibility is confirmed.
  const certificate = await generateCertificate(studentId);

  // Certificate issuance should succeed even if email delivery fails.
  if (student.email) {
    try {
      await sendCertificateEmail({
        studentName: student.fullName,
        studentEmail: student.email,
        registrationNumber: student.regNo,
        verificationCode: certificate.verificationCode,
      });
    } catch (error) {
      console.error(
        "Certificate generated, but certificate email failed:",
        error,
      );
    }
  } else {
    console.warn(
      `Certificate generated for ${student.regNo}, but no email address is recorded.`,
    );
  }

  return certificate;
}
