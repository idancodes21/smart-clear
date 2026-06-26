import { prisma } from "@/lib/prisma";
import { generateCertificate } from "@/lib/generate-certificate";

export async function POST() {
  const student = await prisma.student.findFirst({
    where: {
      regNo: "2022/249751",
    },
  });

  if (!student) {
    return Response.json(
      { error: "Student not found" },
      { status: 404 }
    );
  }

  const certificate = await generateCertificate(student.id);

  return Response.json(certificate);
}