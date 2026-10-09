"use client";

import { Eye, FileText } from "lucide-react";
import type { ReviewDocument } from "./types";
import { formatDate, formatLabel, getReviewStatus } from "./types";

type ReviewsTableProps = {
  documents: ReviewDocument[];
  onView: (document: ReviewDocument) => void;
};

const statusStyles = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
} as const;

export function ReviewsTable({ documents, onView }: ReviewsTableProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        {" "}
        <div className="rounded-full bg-gray-100 p-4">
          {" "}
          <FileText className="h-7 w-7 text-gray-400" />{" "}
        </div>
        <h3 className="mt-4 font-semibold text-gray-900">No documents found</h3>
        <p className="mt-1 max-w-sm text-sm text-gray-500">
          No submissions match your search and selected status.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {" "}
      <table className="w-full min-w-[950px] text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            {" "}
            <th className="px-5 py-3.5 font-medium">Student</th>{" "}
            <th className="px-5 py-3.5 font-medium">Clearance</th>{" "}
            <th className="px-5 py-3.5 font-medium">AI result</th>{" "}
            <th className="px-5 py-3.5 font-medium">Submitted</th>{" "}
            <th className="px-5 py-3.5 font-medium">Status</th>{" "}
            <th className="px-5 py-3.5 text-right font-medium">Action</th>{" "}
          </tr>{" "}
        </thead>
        <tbody className="divide-y divide-gray-100">
          {documents.map((document) => {
            const student = document.clearance.student;
            const status = getReviewStatus(document);

            return (
              <tr key={document.id} className="transition hover:bg-gray-50/70">
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-900">
                    {student.fullName}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{student.regNo}</p>
                </td>

                <td className="px-5 py-4">
                  <p className="font-medium text-gray-800">
                    {formatLabel(document.clearance.type)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatLabel(
                      document.detectedType || document.type || "Document",
                    )}
                  </p>
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      document.aiVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {document.aiVerified ? "Passed" : "Needs review"}
                    {document.aiScore !== null &&
                      ` · ${Math.round(document.aiScore)}%`}
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                  {formatDate(document.uploadedAt)}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}
                  >
                    {formatLabel(status)}
                  </span>
                </td>

                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onView(document)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-800"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
