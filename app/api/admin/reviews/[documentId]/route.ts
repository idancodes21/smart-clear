import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/get-admin-session";
import { sendEmail } from "@/lib/email";
import { issueCertificateIfEligible } from "@/lib/issue-certificate-if-eligible";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };

  return value.replace(/[&<>"']/g, (character) => {
    return entities[character];
  });
}

export async function PATCH(req: Request, { params }: RouteContext) {
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

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400 },
      );
    }

    const { decision, comment } = body as {
      decision?: unknown;
      comment?: unknown;
    };

    if (decision !== "APPROVED" && decision !== "REJECTED") {
      return NextResponse.json(
        {
          message: "Decision must be APPROVED or REJECTED.",
        },
        { status: 400 },
      );
    }

    if (comment !== undefined && typeof comment !== "string") {
      return NextResponse.json(
        { message: "Comment must be a string." },
        { status: 400 },
      );
    }

    const officerComment = typeof comment === "string" ? comment.trim() : "";

    if (officerComment.length > 2000) {
      return NextResponse.json(
        {
          message: "Comment cannot exceed 2000 characters.",
        },
        { status: 400 },
      );
    }

    if (decision === "REJECTED" && !officerComment) {
      return NextResponse.json(
        {
          message: "Please provide a reason for rejecting the document.",
        },
        { status: 400 },
      );
    }

    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        clearance: {
          select: {
            id: true,
            studentId: true,
            type: true,
            student: {
              select: {
                fullName: true,
                regNo: true,
                email: true,
              },
            },
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

    // Save the officer's decision before attempting email delivery.
    const result = await prisma.$transaction(async (tx) => {
      const document = await tx.document.update({
        where: { id: documentId },
        data: {
          status: decision,
          officerDecision: decision,
          officerComment: comment,
          reviewedAt: new Date(),
        },
      });

      const clearance = await tx.clearance.update({
        where: { id: document.clearanceId },
        data: {
          status: decision === "APPROVED" ? "COMPLETED" : "REJECTED",
          progress: decision === "APPROVED" ? 100 : 0,
        },
      });

      return { document, clearance };
    });

    let notificationSent = false;

    const student = existingDocument.clearance.student;
    const clearanceType = existingDocument.clearance.type;
    const approved = decision === "APPROVED";

    let certificateIssued = false;

    if (decision === "APPROVED") {
      try {
        const certificate = await issueCertificateIfEligible(
          existingDocument.clearance.studentId,
        );

        certificateIssued = certificate !== null;
      } catch (error) {
        console.error("Certificate generation failed:", error);
      }
    }

    let notificationMessage: string;

    if (!student.email) {
      notificationMessage =
        "The decision was saved, but the student has no email address on record.";
    } else {
      const studentName = escapeHtml(student.fullName);
      const registrationNumber = escapeHtml(student.regNo);
      const formattedClearance = escapeHtml(clearanceType.replace(/_/g, " "));
      const safeComment = escapeHtml(
        officerComment || "No additional comment was provided.",
      );

      const subject = approved
        ? `SmartClear: ${formattedClearance} approved`
        : `SmartClear: ${formattedClearance} requires correction`;

      const nextStep = approved
        ? "Your document has been approved, and this clearance has been marked as completed."
        : "Please review the officer's comment, correct the document as needed, and follow the clearance process to submit it again.";

      const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #15803d;">SmartClear</h2>
      <p>Hello ${studentName},</p>
      <p>Your clearance document has been reviewed by an officer.</p>

      <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
        <p><strong>Registration number:</strong> ${registrationNumber}</p>
        <p><strong>Clearance:</strong> ${formattedClearance}</p>
        <p><strong>Decision:</strong> ${decision}</p>
        <p><strong>Officer's comment:</strong></p>
        <p style="white-space: pre-wrap;">${safeComment}</p>
      </div>

      <p>${nextStep}</p>
      <p>Please sign in to SmartClear to view your clearance status.</p>
      <p>Regards,<br />SmartClear Team</p>
    </div>
  `;

      const text = [
        "SmartClear - Clearance Review Update",
        "",
        `Hello ${student.fullName},`,
        "",
        `Registration number: ${student.regNo}`,
        `Clearance: ${clearanceType.replace(/_/g, " ")}`,
        `Decision: ${decision}`,
        `Officer's comment: ${officerComment || "No additional comment was provided."}`,
        "",
        nextStep,
        "",
        "Please sign in to SmartClear to view your clearance status.",
        "",
        "Regards,",
        "SmartClear Team",
      ].join("\n");

      try {
        await sendEmail({
          to: student.email,
          subject,
          html,
          text,
        });

        notificationSent = true;
        notificationMessage =
          "The decision was saved and the notification was accepted by Resend.";
      } catch (emailError) {
        console.error(
          "Officer decision saved, but student email failed:",
          emailError,
        );

        notificationMessage =
          "The decision was saved, but the email could not be sent. Please try sending the notification again later.";
      }
    }

    return NextResponse.json({
      success: true,
      notificationSent,
      certificateIssued,
      message: approved
        ? "Document approved successfully."
        : "Document rejected successfully.",
      notificationMessage,
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
