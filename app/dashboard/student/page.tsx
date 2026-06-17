import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth";
import StudentDashboard from "@/components/student-clearance-dashboard";
import { prisma } from "@/lib/prisma";

export default async function Page() {
  const student = await getStudentSession();

  if (!student) {
    redirect("/");
  }

  const clearances = await prisma.clearance.findMany({
    where: { studentId: student.id },
  });

  return <StudentDashboard student={student} clearances={clearances} />;
}
