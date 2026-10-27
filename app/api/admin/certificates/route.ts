
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/get-admin-session";

export async function GET(request: NextRequest) {
  try {
    const officer = await getAdminSession();

    if (!officer) {
      return NextResponse.json(
        { message: "Unauthorized. Officer access is required." },
        { status: 401 },
      );
    }

    const search =
      request.nextUrl.searchParams.get("search")?.trim() ?? "";

    const certificates = await prisma.clearanceCertificate.findMany({
      where: search
        ? {
            OR: [
              {
                verificationCode: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                student: {
                  fullName: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
              {
                student: {
                  regNo: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            ],
          }
        : undefined,
      select: {
        id: true,
        verificationCode: true,
        qrCodeUrl: true,
        issuedAt: true,
        student: {
          select: {
            id: true,
            fullName: true,
            regNo: true,
            email: true,
            department: true,
            level: true,
            programme: true,
            phoneNumber: true,
            stateOfOrigin: true,
          },
        },
      },
      orderBy: {
        issuedAt: "desc",
      },
    });

    const totalIssued = await prisma.clearanceCertificate.count();

    const now = new Date();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    );

    const issuedThisMonth = await prisma.clearanceCertificate.count({
      where: {
        issuedAt: {
          gte: startOfMonth,
        },
      },
    });

    return NextResponse.json({
      certificates,
      totalIssued,
      issuedThisMonth,
      filteredTotal: certificates.length,
    });
  } catch (error) {
    console.error("Failed to fetch certificates:", error);

    return NextResponse.json(
      { message: "Failed to fetch certificates." },
      { status: 500 },
    );
  }
}
