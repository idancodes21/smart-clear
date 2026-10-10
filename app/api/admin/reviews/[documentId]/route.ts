
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/get-admin-session";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function PATCH(
  req: Request,
  { params }: RouteContext,
) {
  try {
    const officer = await getAdminSession();

    if (!officer) {
      return NextResponse.json(
        { message: "Unauthorized. Officer access is required." },
        { status: 401 },
      );
    }

    const { documentId } = await params;

    if (!documentId) {
      return NextResponse.json(
        { message: "Document ID is required." },
        { status: 400 },
      );
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON request body." },
        { status: 400 },
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400 },
      );
    }

    const { decision, comment } = body as {
      decision?: unknown;
      comment?: unknown;
    };

    if (
      decision !== "APPROVED" &&
      decision !== "REJECTED"
    ) {
      return NextResponse.json(
        {
          message: "Decision must be APPROVED or REJECTED.",
        },
        { status: 400 },
      );
    }

    if (
      comment !== undefined &&
      typeof comment !== "string"
    ) {
      return NextResponse.json(
        { message: "Comment must be a string." },
        { status: 400 },
      );
    }

    const officerComment =
      typeof comment === "string" ? comment.trim() : "";

    if (officerComment.length > 2000) {
      return NextResponse.json(
        {
          message: "Comment cannot exceed 2000 characters.",
        },
        { status: 400 },
      );
    }

    // A rejection should include a reason for the student.
    if (decision === "REJECTED" && !officerComment) {
      return NextResponse.json(
        {
          message: "Please provide a reason for rejecting the document.",
        },
        { status: 400 },
      );
    }

    const existingDocument =
      await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          clearance: {
            select: {
              id: true,
              studentId: true,
            },
          },
        },
      });

    if (!existingDocument) {
      return NextResponse.json(
        { message: "Document not found." },
        { status: 404 },
      );
    }

    // Save the decision and update the associated clearance together.
    const result = await prisma.$transaction(async (tx) => {
      const document = await tx.document.update({
        where: { id: documentId },
        data: {
          officerDecision: decision,
          officerComment: officerComment || null,
          reviewedAt: new Date(),
        },
      });

      const clearance = await tx.clearance.update({
        where: {
          id: existingDocument.clearance.id,
        },
        data:
          decision === "APPROVED"
            ? {
                status: "COMPLETED",
                progress: 100,
              }
            : {
                status: "REJECTED",
                progress: 0,
              },
      });

      return { document, clearance };
    });

    return NextResponse.json({
      success: true,
      message:
        decision === "APPROVED"
          ? "Document approved successfully."
          : "Document rejected successfully.",
      document: result.document,
      clearance: result.clearance,
    });
  } catch (error) {
    console.error("Failed to save officer decision:", error);

    return NextResponse.json(
      { message: "Failed to save the officer decision." },
      { status: 500 },
    );
  }
}