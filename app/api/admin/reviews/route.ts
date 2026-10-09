import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [documents, pendingCount, approvedCount, rejectedCount, totalCount] =
      await Promise.all([
        prisma.document.findMany({
          include: {
            clearance: {
              include: {
                student: {
                  select: {
                    id: true,
                    fullName: true,
                    regNo: true,
                    email: true,
                    department: true,
                    level: true,
                    programme: true,
                  },
                },
              },
            },
          },
          orderBy: {
            uploadedAt: "desc",
          },
        }),

        prisma.document.count({
          where: { status: "PENDING" },
        }),

        prisma.document.count({
          where: { status: "APPROVED" },
        }),

        prisma.document.count({
          where: { status: "REJECTED" },
        }),

        prisma.document.count(),
      ]);

    return NextResponse.json({
      stats: {
        pendingCount,
        approvedCount,
        rejectedCount,
        totalCount,
      },
      documents,
    });
  } catch (error) {
    console.error("Failed to fetch clearance reviews:", error);

    return NextResponse.json(
      { message: "Failed to load clearance reviews." },
      { status: 500 },
    );
  }
}
