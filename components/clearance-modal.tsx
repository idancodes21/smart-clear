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

interface Clearance {
  id: string;
  type: string;
  status: string;
}

interface ClearanceModalProps {
  clearance: Clearance;
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

async function handleUpload() {
  if (!file) return;

  const formData = new FormData();

  formData.append("file", file);
  formData.append("clearanceId", clearance.id);

  const res = await fetch(
    "/api/student/upload-document",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();

  console.log(data);
}
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          {clearance.status === "COMPLETED" ? "View" : "Start Clearance"}
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

          <Button
          onClick={handleUpload}
          className="w-full">Submit Document</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
