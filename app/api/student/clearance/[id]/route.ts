import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const document = await prisma.document.findFirst({
    where: {
      clearanceId: id,
    },
    orderBy: {
      uploadedAt: "desc",
    },
  });

  return Response.json(document);
}

