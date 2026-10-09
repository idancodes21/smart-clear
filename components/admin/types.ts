export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ReviewDocument = {
id: string;
type: string;
fileUrl: string;
detectedType: string | null;
extractedText: string | null;
status: "PENDING" | "APPROVED" | "REJECTED";
aiVerified: boolean;
aiScore: number | null;
aiComment: string | null;
officerDecision: ReviewStatus | null;
officerComment: string | null;
reviewedAt: string | null;
uploadedAt: string;
clearance: {
id: string;
type: string;
status: string;
student: {
id: string;
fullName: string;
regNo: string;
email: string | null;
department: string;
level: string;
programme: string | null;
};
};
};

export type ReviewResponse = {
stats: {
pendingCount: number;
approvedCount: number;
rejectedCount: number;
totalCount: number;
};
documents: ReviewDocument[];
};

export function formatLabel(value: string) {
return value
.toLowerCase()
.split("_")
.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
.join(" ");
}

export function formatDate(value: string) {
return new Date(value).toLocaleDateString(undefined, {
day: "numeric",
month: "short",
year: "numeric",
});
}

export function getReviewStatus(document: ReviewDocument): ReviewStatus {
if (document.officerDecision === "APPROVED") return "APPROVED";
if (document.officerDecision === "REJECTED") return "REJECTED";
return "PENDING";
}
