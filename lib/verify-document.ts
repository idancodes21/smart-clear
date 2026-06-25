import { ClearanceType } from "@prisma/client";
import { ai } from "./gemini";
import { verificationRules } from "./verification-rules";

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
}) {
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
8. Return ONLY JSON.

{
  "detectedType":"",
  "studentName":"",
  "registrationNumber":"",
  "department":"",
  "degree":"",
  "level":"",
  "nameMatches":true,
  "registrationNumberMatches":true,
  "departmentMatches":true,
  "score":0,
  "appearsAuthentic":true,
  "documentReadable":true,
  "comment":"",
  "extractedText":""
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
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}