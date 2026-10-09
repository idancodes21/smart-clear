"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import type {
  ReviewDocument,
  ReviewResponse,
  ReviewStatus,
} from "@/components/admin/types";
import { ReviewStatCard } from "@/components/admin/review-stat-card";
import { ReviewsTable } from "@/components/admin/reviews-table";
import { DocumentReviewDialog } from "@/components/admin/document-review-dialog";

export default function ClearanceReviewsPage() {
  const [data, setData] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedDocument, setSelectedDocument] =
    useState<ReviewDocument | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/reviews", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load clearance reviews.");
      }

      const result = (await response.json()) as ReviewResponse;
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading reviews.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  const filteredDocuments = useMemo(() => {
    if (!data) return [];
    const query = search.trim().toLowerCase();

    return data.documents.filter((document) => {
      const student = document.clearance.student;

      const matchesSearch =
        !query ||
        student.fullName.toLowerCase().includes(query) ||
        student.regNo.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        (document.officerDecision ?? "PENDING") ===
          (statusFilter as ReviewStatus);

      return matchesSearch && matchesStatus;
    });
  }, [data, search, statusFilter]);

  const stats = data?.stats;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
      {" "}
      <div className="mx-auto max-w-7xl space-y-6">
        {" "}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {" "}
          <div>
            {" "}
            <p className="text-sm font-medium text-green-700">
              Administration{" "}
            </p>{" "}
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Clearance Reviews{" "}
            </h1>{" "}
            <p className="mt-2 text-sm text-gray-500">
              Review student documents and inspect AI verification results.{" "}
            </p>{" "}
          </div>
          <button
            type="button"
            onClick={() => void fetchReviews()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ReviewStatCard
            label="Pending Review"
            value={stats?.pendingCount ?? 0}
            icon={<Clock3 className="h-5 w-5" />}
            iconClass="bg-amber-100 text-amber-700"
          />
          <ReviewStatCard
            label="Approved"
            value={stats?.approvedCount ?? 0}
            icon={<CheckCircle2 className="h-5 w-5" />}
            iconClass="bg-green-100 text-green-700"
          />
          <ReviewStatCard
            label="Rejected"
            value={stats?.rejectedCount ?? 0}
            icon={<XCircle className="h-5 w-5" />}
            iconClass="bg-red-100 text-red-700"
          />
          <ReviewStatCard
            label="Total Documents"
            value={stats?.totalCount ?? 0}
            icon={<FileText className="h-5 w-5" />}
            iconClass="bg-blue-100 text-blue-700"
          />
        </div>
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <h2 className="font-semibold text-gray-900">
                Document submissions
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {filteredDocuments.length} submission
                {filteredDocuments.length === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search student or reg. no."
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 sm:w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              >
                <option value="ALL">All statuses</option>
                <option value="PENDING">Pending review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="m-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex-1">{error}</div>
              <button
                type="button"
                onClick={() => void fetchReviews()}
                className="font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {loading && !data ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-lg bg-gray-100"
                />
              ))}
            </div>
          ) : (
            !error && (
              <ReviewsTable
                documents={filteredDocuments}
                onView={setSelectedDocument}
              />
            )
          )}
        </section>
      </div>
      {selectedDocument && (
        <DocumentReviewDialog
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
}
