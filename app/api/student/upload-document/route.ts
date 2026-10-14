import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import streamifier from "streamifier";
import { verifyDocument } from "@/lib/verify-document";
import { handleApiError } from "@/lib/api-error";
import type { UploadApiResponse } from "cloudinary";
import { issueCertificateIfEligible } from "@/lib/issue-certificate-if-eligible";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const fileEntry = formData.get("file");
    const clearanceId = formData.get("clearanceId");

    if (
      !(fileEntry instanceof File) ||
      typeof clearanceId !== "string" ||
      !clearanceId
    ) {
      return Response.json(
        { error: "Missing file or clearanceId" },
        { status: 400 },
      );
    }

    const file = fileEntry;

    const clearance = await prisma.clearance.findUnique({
      where: { id: clearanceId },
      include: { student: true },
    });

    if (!clearance) {
      return Response.json(
        { error: "Clearance not found" },
        { status: 404 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
            folder: "smart-clear",
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            if (!result) {
              reject(new Error("Cloudinary upload failed."));
              return;
            }

            resolve(result);
          },
        );

        streamifier.createReadStream(buffer).pipe(uploadStream);
      },
    );

    const result = await verifyDocument({
      clearanceType: clearance.type,
      expectedStudentName: clearance.student.fullName,
      expectedRegNo: clearance.student.regNo,
      expectedDepartment: clearance.student.department,
      file,
    });

    // Preserve the existing AI approval thresholds.
    const decision =
      result.score < 50
        ? "REJECTED"
        : result.score > 85
          ? "APPROVED"
          : "PENDING";

    const document = await prisma.document.create({
      data: {
        clearanceId,
        type: file.type,
        fileUrl: uploadResult.secure_url,
        extractedText: result.extractedText,
        aiVerified:
          result.nameMatches &&
          result.registrationNumberMatches &&
          result.departmentMatches &&
          result.appearsAuthentic &&
          result.documentReadable,
        aiScore: result.score,
        aiComment: result.comment,
        status: decision,
        officerDecision: decision === "PENDING" ? "PENDING" : null,
      },
    });

    // Update clearance status based on the AI decision.
    await prisma.clearance.update({
      where: { id: clearanceId },
      data: {
        status:
          decision === "REJECTED"
            ? "REJECTED"
            : decision === "PENDING"
              ? "PENDING_REVIEW"
              : "COMPLETED",
        progress: decision === "APPROVED" ? 100 : 0,
      },
    });

    let certificateIssued = false;

    if (decision === "APPROVED") {
      try {
        const certificate = await issueCertificateIfEligible(
          clearance.studentId,
        );

        certificateIssued = certificate !== null;
      } catch (error) {
        console.error("Certificate generation failed:", error);
      }
    }

    return Response.json({
      success: true,
      message:
        decision === "APPROVED"
          ? "Document automatically approved."
          : decision === "REJECTED"
            ? "Document automatically rejected."
            : "Document submitted for officer review.",
      document,
      verification: result,
      decision,
      officerReviewRequired: decision === "PENDING",
      certificateIssued,
    });
  } catch (error) {
    console.error(error);
    return handleApiError(error);
  }
}