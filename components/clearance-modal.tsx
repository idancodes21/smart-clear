"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

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

export default function ClearanceModal({
  clearance,
}: ClearanceModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          {clearance.status === "COMPLETED"
            ? "View"
            : "Start Clearance"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {clearance.type.replaceAll("_", " ")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">
              Status
            </p>

            <p className="font-medium">
              {clearance.status}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Instructions
            </p>

            <p className="mt-1">
              {getInstructions(clearance.type)}
            </p>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">
              Upload Document
            </label>

            <input
              type="file"
              className="w-full border rounded-md p-2"
            />
          </div>

          <Button className="w-full">
            Submit Document
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}