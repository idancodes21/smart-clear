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
        phoneNumber: body.phoneNumber,
        stateOfOrigin: body.stateOfOrigin,
        programme: body.programme
      },
    });

    await prisma.clearance.createMany({
      data: [
        {
          studentId: student.id,
          type: "FEE_CLEARANCE",
        },
        {
          studentId: student.id,
          type: "APPLICATION_LETTER",
        },
        {
          studentId: student.id,
          type: "STATEMENT_OF_RESULT",
        },
        {
          studentId: student.id,
          type: "SECURITY_CLEARANCE",
        },
        {
          studentId: student.id,
          type: "ACCOMMODATION_CLEARANCE",
        },
        {
          studentId: student.id,
          type: "LIBRARY_CLEARANCE",
        },
      ],
    });

    return NextResponse.json(student);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Error creating student" },
      { status: 500 }
    );
  }
}