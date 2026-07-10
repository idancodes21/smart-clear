import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import QRCode from "qrcode";

export async function generateCertificate(studentId: string) {
  const existing = await prisma.clearanceCertificate.findUnique({
    where: {
      studentId,
    },
  });

  if (existing) return existing;

  const verificationCode =
    "SC-" +
    crypto.randomBytes(4).toString("hex").toUpperCase();

  const verifyUrl =
    `${process.env.APP_URL}/verify/${verificationCode}`;

  const qrCode = await QRCode.toDataURL(verifyUrl);

  return prisma.clearanceCertificate.create({
    data: {
      studentId,
      verificationCode,
      qrCodeUrl: qrCode,
    },
  });
}