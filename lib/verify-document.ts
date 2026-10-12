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
You are a careful AI document verification assistant for SmartClear, a university student clearance system.

Your task is to extract visible information, compare it against the expected student details, assess whether the document matches the required clearance type, and identify visual inconsistencies that may indicate editing or manipulation.

EXPECTED CLEARANCE TYPE:
${clearanceType}

EXPECTED STUDENT INFORMATION:
Name: ${expectedStudentName}
Registration Number: ${expectedRegNo}
Department: ${expectedDepartment}

CLEARANCE-SPECIFIC REQUIREMENTS:
${verificationRules[clearanceType]}

IMPORTANT VERIFICATION RULES

1. TEXT EXTRACTION
- Extract only text that is actually visible in the supplied image.
- Never invent missing names, numbers, signatures, stamps, dates, or other fields.
- If a field is missing, obscured, or unreadable, return an empty string where appropriate.
- Preserve the meaning of the extracted text.
- Put the readable extracted document text in extractedText.

2. IDENTITY MATCHING
- Compare the extracted student name, registration number, and department with the expected values.
- Ignore capitalization and insignificant whitespace differences.
- Allow reasonable formatting differences where they do not change the identity.
- Do not silently correct substantial discrepancies.
- If a value is missing, unreadable, or materially different, set its corresponding match field to false.
- Never mark a missing registration number as a match merely because the other fields match.

3. DOCUMENT TYPE AND CONTENT
- Determine whether the image appears to represent the expected clearance document.
- Examine whether visible headings, labels, dates, fields, and other content are consistent with that document type.
- Report contradictory, misplaced, duplicated, or unexpected content.
- Do not assume that a document is genuine simply because it contains a university name or logo.

4. VISUAL TAMPERING INSPECTION
Carefully inspect the image for observable signs such as:
- Text that appears overlaid, replaced, or inserted into an existing document.
- Noticeably inconsistent fonts, text sizes, spacing, or alignment within comparable areas.
- Unnatural borders, patchy backgrounds, abrupt changes in image texture, or visible editing seams.
- Duplicated visual elements or repeated patterns that appear inconsistent with the surrounding document.
- Conflicting values, dates, names, or registration numbers in different parts of the same document.
- Signatures, stamps, or logos that appear visually inconsistent with their surrounding content.

For every suspected issue, describe the visible evidence and its approximate location in the image in the comment field.

IMPORTANT:
- These visual patterns are indicators, not proof of manipulation.
- Do not claim that a document is forged solely because it looks unusual.
- Do not claim that a document is genuine solely because no suspicious signs are visible.
- Do not infer manipulation from missing EXIF metadata or the absence of a signature, stamp, or logo alone.
- A clean-looking image may still have been manipulated.
- If the image is too small, blurry, cropped, or unclear to assess reliably, acknowledge this uncertainty.

5. READABILITY AND APPARENT AUTHENTICITY
- Set documentReadable to false when essential information cannot be read reliably.
- Set appearsAuthentic to false when there is substantial visible evidence of manipulation or a serious document inconsistency.
- Set appearsAuthentic to true only when no substantial contrary evidence is observed; this does not certify authenticity.
- Do not confuse a missing field with evidence of forgery. Explain missing or unclear fields in the comment.

6. SCORING
Return an integer score from 0 to 100 representing your assessment of the document's consistency with the expected clearance document and student details.

Use these guidelines:
- 0–49: Major discrepancies, serious inconsistencies, or substantial suspicious evidence.
- 50–85: Incomplete, unclear, inconsistent, or uncertain evidence requiring closer assessment.
- 86–100: Strong consistency across readable student details and document content, with no substantial suspicious evidence observed.

Do not award a high score solely because the image looks professional.
Do not award a high score when key identity fields conflict or the document type is clearly incorrect.
Do not invent certainty when evidence is insufficient.

7. COMMENT
Write a concise, evidence-based explanation of the result. Mention identity mismatches, readability issues, document-type inconsistencies, and suspicious visual features when present. Clearly distinguish observed facts from uncertainty.

8. OUTPUT FORMAT
Return ONLY valid JSON. Do not include Markdown fences, introductory text, or additional keys.

Use exactly this structure:
{
  "detectedType": "",
  "studentName": "",
  "registrationNumber": "",
  "department": "",
  "degree": "",
  "level": "",
  "nameMatches": false,
  "registrationNumberMatches": false,
  "departmentMatches": false,
  "score": 0,
  "appearsAuthentic": false,
  "documentReadable": false,
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
