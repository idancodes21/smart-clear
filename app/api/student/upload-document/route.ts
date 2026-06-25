import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import streamifier from "streamifier";
import { verifyDocument } from "@/lib/verify-document";
import { handleApiError } from "@/lib/api-error";


export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const clearanceId = formData.get("clearanceId") as string;

    if (!file || !clearanceId) {
      return Response.json(
        { error: "Missing file or clearanceId" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise<any>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
            folder: "smart-clear",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(buffer).pipe(uploadStream);
      }
    );

    const document = await prisma.document.create({
      data: {
        clearanceId,
        type: file.type,
        fileUrl: uploadResult.secure_url,
      },
    });

    const clearance = await prisma.clearance.findUnique({
  where: {
    id: clearanceId,
  },
  include: {
    student: true,
  },
});

if (!clearance) {
  throw new Error("Clearance not found");
}

const result = await verifyDocument({
  clearanceType: clearance.type,

  expectedStudentName:
    clearance.student.fullName,

  expectedRegNo:
    clearance.student.regNo,

  expectedDepartment:
    clearance.student.department,
    
  file,
});

const updatedDocument =
  await prisma.document.update({
    where: {
      id: document.id,
    },
    data: {
      extractedText: result.extractedText,
      aiVerified: result.isValid,
      aiScore: result.score,
      aiComment: result.comment,
    },
  });

  await prisma.clearance.update({
  where: {
    id: clearanceId,
  },
  data: {
    status: result.isValid
      ? "COMPLETED"
      : "REJECTED",

    progress: result.isValid
      ? 100
      : 0,
  },
});

return Response.json({
  success: true,
  document: updatedDocument,
  verification: result,
});

  } catch (error) {
    console.error(error);

    return handleApiError(error);
  }
}