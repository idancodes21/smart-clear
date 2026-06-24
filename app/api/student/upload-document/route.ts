import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import streamifier from "streamifier";

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

    return Response.json(document);
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}