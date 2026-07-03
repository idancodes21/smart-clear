import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      students,
      totalStudents,
      totalClearanceRequests,
      completedClearances,
      pendingClearances,
      rejectedClearances,
      certificatesGenerated,
    ] = await Promise.all([
      prisma.student.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          clearances: true,
          certificate: true,
        },
      }),

      prisma.student.count(),

      prisma.clearance.count(),

      prisma.clearance.count({
        where: {
          status: "COMPLETED",
        },
      }),

      prisma.clearance.count({
        where: {
          status: "IN_PROGRESS",
        },
      }),

      prisma.clearance.count({
        where: {
          status: "REJECTED",
        },
      }),

      prisma.clearanceCertificate.count(),
    ]);

    return NextResponse.json({
      stats: {
        totalStudents,
        totalClearanceRequests,
        completedClearances,
        pendingClearances,
        rejectedClearances,
        certificatesGenerated,
      },

      students,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to load dashboard data.",
      },
      {
        status: 500,
      }
    );
  }
}