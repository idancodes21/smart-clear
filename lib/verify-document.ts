import { ClearanceType } from "@prisma/client";
import { ai } from "./gemini";
import { verificationRules } from "./verification-rules";

export type DocumentVerificationResult = {
  detectedType: string;
  studentName: string;
  registrationNumber: string;
  department: string;
  degree: string;
  level: string;
  nameMatches: boolean;
  registrationNumberMatches: boolean;
  departmentMatches: boolean;
  score: number;
  appearsAuthentic: boolean;
  documentReadable: boolean;
  comment: string;
  extractedText: string;
};

export async function verifyDocument({
  clearanceType,
  expectedStudentName,
  expectedRegNo,
  expectedDepartment,
  file,
}: {
  clearanceType: ClearanceType;
  expectedStudentName: string;
  expectedRegNo: string;
  expectedDepartment: string;
  file: File;
}): Promise<DocumentVerificationResult> {
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");

  const prompt = `
You are an AI document verification assistant for a university Automated Clearance Management System.

Expected Clearance Type:
${clearanceType}

Expected Student Information

Name:
${expectedStudentName}

Registration Number:
${expectedRegNo}

Department:
${expectedDepartment}

${verificationRules[clearanceType]}

GENERAL RULES

1. Extract every visible field.
2. Never invent missing information.
3. Ignore capitalization differences.
4. Ignore small OCR mistakes.
5. Compare the extracted student information with the expected student information.
6. Determine whether:
   - Name matches
   - Registration number matches
   - Department matches
7. Detect:
   - Official signatures
   - Official stamps
   - University logo
   - Signs of tampering
   - Blurry or unreadable images
8. Score the document from 0 to 100 based on the evidence of validity.
9. Return ONLY JSON.

{
  "detectedType": "",
  "studentName": "",
  "registrationNumber": "",
  "department": "",
  "degree": "",
  "level": "",
  "nameMatches": true,
  "registrationNumberMatches": true,
  "departmentMatches": true,
  "score": 0,
  "appearsAuthentic": true,
  "documentReadable": true,
  "comment": "",
  "extractedText": ""
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        inlineData: {
          mimeType: file.type,
          data: base64,
        },
      },
      {
        text: prompt,
      },
    ],
  });

  const text = response.text?.trim() ?? "";

  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const parsed: unknown = JSON.parse(cleaned);

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("AI returned an invalid document verification result.");
  }

  const result = parsed as Record<string, unknown>;

  if (
    typeof result !== "object" ||
    result === null ||
    !("score" in result) ||
    typeof result.score !== "number" ||
    !Number.isFinite(result.score) ||
    result.score < 0 ||
    result.score > 100
  ) {
    throw new Error("AI returned an invalid document verification result.");
  }

  const booleanFields = [
    "nameMatches",
    "registrationNumberMatches",
    "departmentMatches",
    "appearsAuthentic",
    "documentReadable",
  ] as const;

  for (const field of booleanFields) {
    if (!(field in result) || typeof result[field] !== "boolean") {
      throw new Error(`AI returned an invalid verification field: ${field}.`);
    }
  }

  const stringFields = [
    "detectedType",
    "studentName",
    "registrationNumber",
    "department",
    "degree",
    "level",
    "comment",
    "extractedText",
  ] as const;

  for (const field of stringFields) {
    const value = result[field];

    if (typeof value === "string") {
      continue;
    }

    if (value === null || value === undefined) {
      result[field] = "";
      continue;
    }

    throw new Error(`AI returned an invalid verification field: ${field}.`);
  }

  if (typeof result.studentName !== "string" || !result.studentName.trim()) {
    result.nameMatches = false;
  }

  if (
    typeof result.registrationNumber !== "string" ||
    !result.registrationNumber.trim()
  ) {
    result.registrationNumberMatches = false;
  }

  if (typeof result.department !== "string" || !result.department.trim()) {
    result.departmentMatches = false;
  }

  return result as DocumentVerificationResult;
}
