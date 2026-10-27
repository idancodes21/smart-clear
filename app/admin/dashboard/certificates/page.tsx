
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Award,
  CalendarDays,
  Search,
  RefreshCw,
  Eye,
  X,
  CheckCircle2,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  BookOpen,
} from "lucide-react";

type Certificate = {
  id: string;
  verificationCode: string;
  qrCodeUrl: string | null;
  issuedAt: string;
  student: {
    id: string;
    fullName: string;
    regNo: string;
    email: string | null;
    department: string;
    level: string;
    programme: string | null;
    phoneNumber: string | null;
    stateOfOrigin: string | null;
  };
};

type CertificateResponse = {
  certificates: Certificate[];
  totalIssued: number;
  issuedThisMonth: number;
  filteredTotal: number;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getVerificationUrl(code: string) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/verify/${encodeURIComponent(code)}`;
}

export default function CertificatesPage() {
  const [data, setData] = useState<CertificateResponse>({
    certificates: [],
    totalIssued: 0,
    issuedThisMonth: 0,
    filteredTotal: 0,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Certificate | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchCertificates = useCallback(async (query: string) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (query.trim()) params.set("search", query.trim());

      const response = await fetch(
        `/api/admin/certificates?${params.toString()}`,
        { cache: "no-store" },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load certificates.");
      }

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchCertificates(search);
    }, 250);

    return () => clearTimeout(timer);
  }, [search, fetchCertificates]);

  async function copyVerificationLink(code: string) {
    try {
      await navigator.clipboard.writeText(getVerificationUrl(code));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy the link. Please copy it from the details.");
    }
  }

  return (
    <div className="min-h-screen space-y-8 bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-green-700">
            Management / Certificates
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            Certificates
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            View issued student clearance certificates and verify their details.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchCertificates(search)}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryCard
          icon={<Award className="h-5 w-5" />}
          label="Total Certificates Issued"
          value={data.totalIssued}
          description="All issued clearance certificates"
        />
        <SummaryCard
          icon={<CalendarDays className="h-5 w-5" />}
          label="Issued This Month"
          value={data.issuedThisMonth}
          description="Certificates issued since the start of this month"
        />
      </div>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="font-semibold text-gray-900">
              Issued Certificates
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {data.filteredTotal}{" "}
              {data.filteredTotal === 1 ? "certificate" : "certificates"} found
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, reg. number, or code"
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Student</th>
                <th className="px-5 py-4 font-semibold">Department</th>
                <th className="px-5 py-4 font-semibold">Verification Code</th>
                <th className="px-5 py-4 font-semibold">Date Issued</th>
                <th className="px-5 py-4 text-right font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center text-gray-500">
                    <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin text-green-700" />
                    Loading certificates...
                  </td>
                </tr>
              ) : data.certificates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <Award className="mx-auto mb-3 h-8 w-8 text-gray-300" />
                    <p className="font-medium text-gray-700">
                      No certificates found
                    </p>
                    <p className="mt-1 text-gray-500">
                      {search
                        ? "Try another search term."
                        : "Certificates will appear here when they are issued."}
                    </p>
                  </td>
                </tr>
              ) : (
                data.certificates.map((certificate) => (
                  <tr
                    key={certificate.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-800">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {certificate.student.fullName}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {certificate.student.regNo}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-gray-700">
                        {certificate.student.department}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Level {certificate.student.level}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <code className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700">
                        {certificate.verificationCode}
                      </code>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                      {formatDate(certificate.issuedAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(certificate);
                          setCopied(false);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-green-200 px-3 py-2 font-medium text-green-800 transition hover:bg-green-50"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="certificate-dialog-title"
            className="my-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-gray-100 p-5 sm:p-6">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">
                  <CheckCircle2 className="h-4 w-4" />
                  Certificate Issued
                </div>
                <h2
                  id="certificate-dialog-title"
                  className="text-xl font-bold text-gray-900"
                >
                  Certificate Details
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Issued {formatDate(selected.issuedAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close certificate details"
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem label="Full Name" value={selected.student.fullName} />
                <DetailItem label="Registration Number" value={selected.student.regNo} />
                <DetailItem label="Department" value={selected.student.department} />
                <DetailItem label="Level" value={selected.student.level} />
                <DetailItem label="Programme" value={selected.student.programme} />
                <DetailItem label="Email" value={selected.student.email} icon={<Mail className="h-4 w-4" />} />
                <DetailItem label="Phone Number" value={selected.student.phoneNumber} icon={<Phone className="h-4 w-4" />} />
                <DetailItem label="State of Origin" value={selected.student.stateOfOrigin} icon={<MapPin className="h-4 w-4" />} />
              </div>
              {selected.qrCodeUrl ? (
                <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <p className="mb-3 text-sm font-semibold text-gray-800">
                    Certificate QR Code
                  </p>
                  <img
                    src={selected.qrCodeUrl}
                    alt={`QR code for ${selected.student.fullName}'s certificate`}
                    className="h-44 w-44 rounded-lg border border-gray-200 bg-white p-2"
                  />
                  <p className="mt-3 max-w-sm text-center text-xs text-gray-500">
                    Scan to open the public certificate verification page.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                  No QR code is stored for this certificate. Use the verification link above.
                </div>
              )}

              <div className="rounded-lg bg-green-50 p-4 text-sm text-green-900">
                This certificate is recorded in SmartClear. The public verification page can be used to confirm the student details.
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-100 p-5">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            {value.toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-gray-500">{description}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-800">
          {icon}
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | null;
  icon?: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <div className="mt-1 flex items-start gap-2 text-sm font-medium text-gray-800">
        {icon && <span className="mt-0.5 shrink-0 text-gray-400">{icon}</span>}
        <span className="break-words">{value || "Not provided"}</span>
      </div>
    </div>
  );
}
