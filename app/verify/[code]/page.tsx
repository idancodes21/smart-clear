import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import DownloadButton from "./DownloadButton";

interface VerifyPageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { code } = await params;

  const certificate = await prisma.clearanceCertificate.findUnique({
    where: {
      verificationCode: code,
    },
    include: {
      student: true,
    },
  });

  if (!certificate) {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-col gap-10 items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full">
        <div className="text-center mb-6">
           <h1 className="text-3xl font-bold text-green-600">
            ✅ Clearance Verified
          </h1>

          <p className="text-gray-500 mt-2">
            This student has completed all the neccesary clearance
          </p>
        </div>

        <div className="space-y-3 grid grid-cols-2">
          <div>
            <p className="text-gray-500 text-sm">Student Name</p>

            <p className="font-semibold">{certificate.student.fullName}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Registration Number</p>

            <p className="font-semibold">{certificate.student.regNo}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Department</p>

            <p className="font-semibold">{certificate.student.department}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Level</p>

            <p className="font-semibold">{certificate.student.level}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Verification Code</p>

            <p className="font-semibold">{certificate.verificationCode}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Issued On</p>

            <p className="font-semibold">
              {certificate.issuedAt.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      <DownloadButton certificate={certificate} />
    </main>
  );
}
