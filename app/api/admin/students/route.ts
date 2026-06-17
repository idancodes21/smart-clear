import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const student = await prisma.student.create({
      data: {
        fullName: body.fullName,
        regNo: body.regNo,
        department: body.department,
        level: body.level,
        email: body.email,
      },
    });

    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating student" },
      { status: 500 }
    );
  }
}