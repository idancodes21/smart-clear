import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      where: {
        OR: [{ officerDecision: "PENDING" }, { officerDecision: null }],
      },
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
        uploadedAt: "asc",
      },
    });

    const [pendingCount, approvedCount, rejectedCount, totalCount] =
      await Promise.all([
        prisma.document.count({
          where: {
            OR: [{ officerDecision: "PENDING" }, { officerDecision: null }],
          },
        }),
        prisma.document.count({
          where: { officerDecision: "APPROVED" },
        }),
        prisma.document.count({
          where: { officerDecision: "REJECTED" },
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
