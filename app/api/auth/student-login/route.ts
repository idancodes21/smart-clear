import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { regNo } = await req.json();

    if (!regNo) {
      return Response.json(
        { error: "Reg Number is required" },
        { status: 400 },
      );
    }

    const student = await prisma.student.findUnique({
      where: { regNo },
    });

    if (!student) {
      return Response.json({ error: "Invalid Reg Number" }, { status: 404 });
    }

    const cookieStore = await cookies();

    cookieStore.set("student_session", student.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return Response.json({
      message: "Login successful",
      student,
    });
  } catch (error) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
