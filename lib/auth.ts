import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function getStudentSession() {
 const cookieStore = await cookies();
 const studentId = cookieStore.get("student_session")?.value;

  if (!studentId) return null;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  return student;
}