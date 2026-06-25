"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Clearance {
  id: string;
  type: string;
  status: string;
}

interface ClearanceModalProps {
  clearance: Clearance;
}

interface VerificationResult {
  detectedType: string;
  isValid: boolean;
  score: number;
  comment: string;
  fileUrl?: string;
}

function getInstructions(type: string) {
  switch (type) {
    case "FEE_CLEARANCE":
      return "Upload your school fee receipt.";

    case "APPLICATION_LETTER":
      return "Upload your application letter.";

    case "STATEMENT_OF_RESULT":
      return "Upload your statement of result.";

    case "SECURITY_CLEARANCE":
      return "Upload your security clearance document.";

    case "ACCOMMODATION_CLEARANCE":
      return "Upload your accommodation clearance document.";

    case "LIBRARY_CLEARANCE":
      return "Upload your library clearance document.";

    default:
      return "Upload the required document.";
  }
}

export default function ClearanceModal({ clearance }: ClearanceModalProps) {
  const [file, setFile] = useState<File | null>(null);

  const [status, setStatus] = useState<
    "pending" | "scanning" | "approved" | "declined" | "pending_review"
  >(
    clearance.status === "COMPLETED"
      ? "approved"
      : clearance.status === "REJECTED"
        ? "declined"
        : "pending",
  );

  const router = useRouter();
  const [result, setResult] = useState<VerificationResult | null>(null);

  async function handleUpload() {
    if (!file) {
      alert("Please select a file.");
      return;
    }

    try {
      setStatus("scanning");

      const formData = new FormData();

      formData.append("file", file);
      formData.append("clearanceId", clearance.id);

      const res = await fetch("/api/student/upload-document", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      console.log("UPLOAD RESPONSE:", data);

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      if (!data.verification) {
        throw new Error("Verification result missing");
      }

      setResult({
        ...data.verification,
        fileUrl: data.document.fileUrl,
      });

      if (data.verification.isValid) {
        setStatus("approved");
      } else {
        setStatus("declined");
      }
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error(error);

      setStatus("declined");

      alert(error instanceof Error ? error.message : "Upload failed");
    }
  }

  async function loadVerificationResult() {
    try {
      const res = await fetch(`/api/student/clearance/${clearance.id}`);

      const data = await res.json();

      if (!data) return;

      setResult({
        detectedType: clearance.type,
        isValid: data.aiVerified,
        score: data.aiScore,
        comment: data.aiComment,
        fileUrl: data.fileUrl,
      });

      setStatus(data.aiVerified ? "approved" : "declined");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open && clearance.status !== "NOT_STARTED") {
          loadVerificationResult();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          {clearance.status === "NOT_STARTED" ? "Submit Document" : "View"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{clearance.type.replaceAll("_", " ")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Instructions</p>

            <p className="mt-1">{getInstructions(clearance.type)}</p>
          </div>

          {clearance.status !== "COMPLETED" && (
            <div>
              <label className="block mb-2 text-sm font-medium">
                Upload Document
              </label>

              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="w-full border rounded-md p-2"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          )}

          {status === "scanning" && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
              <p className="text-blue-600 animate-pulse">
                🤖 AI is analyzing your document...
              </p>
            </div>
          )}

          {result && (
            <div className="rounded-md border p-4 bg-gray-50">
              <p className="font-semibold">
                {status === "approved" ? "✅ Approved" : "❌ Rejected"}
              </p>

              <p className="mt-2">
                <strong>Document Type:</strong> {result.detectedType}
              </p>

              <p>
                <strong>Confidence:</strong> {result.score}%
              </p>

              <p>
                <strong>Reason:</strong> {result.comment}
              </p>
            </div>
          )}

          {result?.fileUrl && (
            <div className="mt-4">
              <p className="font-medium mb-2">Uploaded Document</p>

              <Image
                src={result.fileUrl}
                alt="Uploaded document"
                width={100}
                height={100}
                className="rounded-md border"
              />
            </div>
          )}

          {clearance.status !== "COMPLETED" && (
            <Button
              onClick={handleUpload}
              disabled={status === "scanning"}
              className="w-full"
            >
              {status === "scanning" ? "Analyzing..." : "Submit Document"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
