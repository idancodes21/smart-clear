import { ai } from "./gemini";

export async function verifyDocument(
  clearanceType: string,
  file: File
) {
  const bytes = await file.arrayBuffer();

  const base64 = Buffer.from(bytes).toString("base64");

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
        text: `
You are an AI document verifier for a university clearance system.

Expected Clearance Type:
${clearanceType}

Analyze the uploaded document carefully.

Return ONLY valid JSON.

{
  "detectedType": "",
  "isValid": true,
  "score": 0,
  "comment": "",
  "studentName": "",
  "registrationNumber": "",
  "extractedText": ""
}

Rules:
- score must be between 0 and 100
- extractedText should contain visible text found in the document
- comment should explain why it was approved/rejected
- detectedType should identify the document
- Return JSON only
`,
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