import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import streamifier from "streamifier";
import { verifyDocument } from "@/lib/verify-document";
import { handleApiError } from "@/lib/api-error";
import type { UploadApiResponse } from "cloudinary";

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

const document = await prisma.document.create({
  data: {
    clearanceId,
    type: file.type,
    fileUrl: uploadResult.secure_url,
    extractedText: result.extractedText,
    aiVerified: result.isValid,
    aiScore: result.score,
    aiComment: result.comment,
    officerDecision: "PENDING",
  },
});

await prisma.clearance.update({
  where: { id: clearanceId },
  data: {
    status: "PENDING_REVIEW",
    progress: 0,
  },
});

return Response.json({
  success: true,
  message: "Document verified by AI and submitted for officer review.",
  document,
  verification: result,
  officerReviewRequired: true,
});

} catch (error) {
console.error(error);
return handleApiError(error);
}
}
