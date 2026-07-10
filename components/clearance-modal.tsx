"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  UploadCloud,
  FileCheck2,
  Loader2,
  Sparkles,
  ShieldCheck,
  ShieldX,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

const SCAN_MESSAGES = [
  "Detecting document...",
  "Extracting text with OCR...",
  "Matching student information...",
  "Checking department...",
  "Running AI verification...",
  "Finalizing result...",
];

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
  const [preview, setPreview] = useState("");
  const [scanStep, setScanStep] = useState(0);

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
      toast.warning("Please select a file.");
      return;
    }

    try {
      setStatus("scanning");
      setScanStep(0);

      const interval = setInterval(() => {
        setScanStep((prev) => {
          if (prev >= SCAN_MESSAGES.length - 1) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 900);

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
        setScanStep(SCAN_MESSAGES.length);
        throw new Error(data.error || "Upload failed");
      }

      if (!data.verification) {
        setScanStep(SCAN_MESSAGES.length);
        throw new Error("Verification result missing");
      }

      setResult({
        ...data.verification,
        fileUrl: data.document.fileUrl,
      });

      setStatus(data.verification.isValid ? "approved" : "declined");

      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error(error);
      setStatus("declined");
      toast.error(error instanceof Error ? error.message : "Upload failed");
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

      <DialogContent className="sm:max-w-2xl h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{clearance.type.replaceAll("_", " ")}</DialogTitle>
        </DialogHeader>

        <div className="h-full overflow-y-auto px-6 pb-6">
          <div className="space-y-5">
            <div>
              <p className="text-sm text-gray-500">Instructions</p>
              <p className="mt-1">{getInstructions(clearance.type)}</p>
            </div>

            {clearance.status !== "COMPLETED" && (
              <div className="space-y-4">
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  className="hidden"
                  id="document-upload"
                  onChange={(e) => {
                    const selected = e.target.files?.[0];
                    if (!selected) return;
                    setFile(selected);
                    setPreview(URL.createObjectURL(selected));
                  }}
                />
               <label htmlFor="document-upload">
  <div
    className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition ${
      file
        ? "border-green-500 bg-green-50"
        : "border-gray-300 hover:border-green-500"
    }`}
  >
    {file ? (
      <>
        <FileCheck2 className="mx-auto h-10 w-10 text-green-600" />
        <p className="mt-3 font-medium text-green-700">{file.name}</p>
        <p className="text-sm text-gray-500">
          {(file.size / 1024 / 1024).toFixed(2)} MB · Click to change
        </p>
      </>
    ) : (
      <>
        <UploadCloud className="mx-auto h-10 w-10 text-green-600" />
        <p className="mt-3 font-medium">Click to upload document</p>
        <p className="text-sm text-gray-500">JPG, PNG or PDF</p>
      </>
    )}
  </div>
</label>

                {status === "scanning" && (
                  <div className="rounded-xl border bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 animate-pulse text-green-600" />
                      <h3 className="font-semibold">SmartClear AI</h3>
                    </div>

                    <div className="space-y-3">
                      {SCAN_MESSAGES.map((message, index) => (
                        <div key={message} className="flex items-center gap-3">
                          {index <= scanStep ? (
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                          ) : (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                          )}
                          <p
                            className={
                              index <= scanStep
                                ? "text-sm text-green-700"
                                : "text-sm text-gray-500"
                            }
                          >
                            {message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {result && (
              <div className="space-y-5 rounded-xl border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  {status === "approved" ? (
                    <ShieldCheck className="h-8 w-8 text-green-600" />
                  ) : (
                    <ShieldX className="h-8 w-8 text-red-600" />
                  )}
                  <div>
                    <h2 className="text-lg font-semibold">
                      {status === "approved"
                        ? "Verification Successful"
                        : "Verification Failed"}
                    </h2>
                    <p className="text-sm text-gray-500">AI analysis completed</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">Confidence</p>
                    <p className="text-2xl font-bold">{result.score}%</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">Document</p>
                    <p className="font-medium">
                      {result.detectedType.replaceAll("_", " ")}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm text-gray-500">AI Reasoning</p>
                  <div className="rounded-lg bg-gray-50 p-4">{result.comment}</div>
                </div>
              </div>
            )}

            {clearance.status !== "COMPLETED" && (
              <Button
                onClick={handleUpload}
                disabled={status === "scanning"}
                className="w-full"
              >
                Upload Document
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}