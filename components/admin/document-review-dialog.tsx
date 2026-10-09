
"use client";

import { Eye } from "lucide-react";
import type { ReviewDocument } from "./types";
import { formatDate, formatLabel } from "./types";

type DocumentReviewDialogProps = {
  document: ReviewDocument;
  onClose: () => void;
};

export function DocumentReviewDialog({
  document,
  onClose,
}: DocumentReviewDialogProps) {
  const student = document.clearance.student;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-dialog-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5 sm:p-6">
          <div>
            <p className="text-sm font-medium text-green-700">
              Document submission
            </p>
            <h2
              id="review-dialog-title"
              className="mt-1 text-xl font-bold text-gray-900"
            >
              Review details
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Submitted {formatDate(document.uploadedAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close review details"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            Close
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Detail label="Student name" value={student.fullName} />
            <Detail label="Registration number" value={student.regNo} />
            <Detail label="Department" value={student.department} />
            <Detail label="Level" value={student.level} />
            <Detail
              label="Clearance type"
              value={formatLabel(document.clearance.type)}
            />
            <Detail
              label="Document type"
              value={formatLabel(
                document.detectedType || document.type || "Unknown",
              )}
            />
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900">
              AI verification result
            </h3>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  document.aiVerified
                    ? "bg-green-100 text-green-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {document.aiVerified
                  ? "AI verification passed"
                  : "AI verification needs review"}
              </span>

              <span className="text-sm text-gray-600">
                Score:{" "}
                {document.aiScore === null
                  ? "Not available"
                  : `${Math.round(document.aiScore)}%`}
              </span>
            </div>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">
              {document.aiComment ||
                "No AI verification comments available."}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              Uploaded document
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Open the original document in a new tab to inspect it.
            </p>

            <a
              href={document.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
            >
              <Eye className="h-4 w-4" />
              Open document
            </a>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">Extracted text</h3>
            <div className="mt-2 max-h-48 overflow-y-auto rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-600">
              {document.extractedText ||
                "No text was extracted from this document."}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}