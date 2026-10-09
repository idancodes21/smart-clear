"use client";

import { useState } from "react";
import { Eye, CheckCircle2, XCircle, LoaderCircle } from "lucide-react";
import type { ReviewDocument, ReviewStatus } from "./types";
import { formatDate, formatLabel, getReviewStatus } from "./types";

type DocumentReviewDialogProps = {
  document: ReviewDocument;
  onClose: () => void;
  onDecision: (
    documentId: string,
    decision: Extract<ReviewStatus, "APPROVED" | "REJECTED">,
    comment: string,
  ) => Promise<void>;
};

export function DocumentReviewDialog({
  document,
  onClose,
  onDecision,
}: DocumentReviewDialogProps) {
  const student = document.clearance.student;
  const status = getReviewStatus(document);

  const [comment, setComment] = useState(document.officerComment ?? "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleDecision(
    decision: Extract<ReviewStatus, "APPROVED" | "REJECTED">,
  ) {
    setError("");
    setIsSubmitting(true);

    try {
      await onDecision(document.id, decision, comment.trim());
    } catch {
      setError("Failed to save the decision. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
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
            disabled={isSubmitting}
            aria-label="Close review details"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
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
                  ? "Verification checks passed"
                  : "Verification checks failed"}
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

          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold text-gray-900">
                Officer decision
              </h3>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                Current status: {formatLabel(status)}
              </span>
            </div>

            <label
              htmlFor="officer-comment"
              className="mt-4 block text-sm font-medium text-gray-700"
            >
              Review comment
            </label>
            <textarea
              id="officer-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Add a reason or comment for your decision..."
              disabled={isSubmitting}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-gray-50"
            />

            {error && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleDecision("APPROVED")}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Approve document
              </button>

              <button
                type="button"
                onClick={() => handleDecision("REJECTED")}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Reject document
              </button>
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