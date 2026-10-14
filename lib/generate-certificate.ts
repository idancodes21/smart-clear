import { ClearanceStatus, ClearanceType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import QRCode from "qrcode";

const REQUIRED_CLEARANCES = Object.values(ClearanceType);

export async function generateCertificate(studentId: string) {
  const clearances = await prisma.clearance.findMany({
    where: { studentId },
    select: {
      type: true,
      status: true,
    },
  });

  const completedTypes = new Set(
    clearances
      .filter((clearance) => clearance.status === ClearanceStatus.COMPLETED)
      .map((clearance) => clearance.type),
  );

  const allClearancesCompleted = REQUIRED_CLEARANCES.every((type) =>
    completedTypes.has(type),
  );

  if (!allClearancesCompleted) {
    throw new Error(
      "Cannot generate a certificate until all required clearances are completed.",
    );
  }

  const existing = await prisma.clearanceCertificate.findUnique({
    where: { studentId },
  });

  if (existing) return existing;

  const verificationCode = `SC-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;

  const appUrl = process.env.APP_URL;

if (!appUrl) {
  throw new Error("APP_URL is not configured.");
}

const verifyUrl = `${appUrl.replace(/\/$/, "")}/verify/${verificationCode}`;
const qrCodeUrl = await QRCode.toDataURL(verifyUrl);

  try {
    return await prisma.clearanceCertificate.create({
      data: {
        studentId,
        verificationCode,
        qrCodeUrl,
      },
    });
  } catch (error) {
    // A concurrent request may have created the certificate first.
    const certificate = await prisma.clearanceCertificate.findUnique({
      where: { studentId },
    });

    if (certificate) return certificate;

    throw error;
  }
}
