import { sendEmail } from "@/lib/email";

type CertificateEmailData = {
  studentName: string;
  studentEmail: string;
  registrationNumber: string;
  verificationCode: string;
};

export async function sendCertificateEmail({
  studentName,
  studentEmail,
  registrationNumber,
  verificationCode,
}: CertificateEmailData) {
  const appUrl = process.env.APP_URL;

  if (!appUrl) {
    throw new Error("APP_URL is not configured.");
  }

  const verifyUrl = `${appUrl.replace(/\/$/, "")}/verify/${encodeURIComponent(
    verificationCode,
  )}`;

  const safeName = studentName.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });

  const safeRegNo = registrationNumber.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });

  await sendEmail({
    to: studentEmail,
    subject: "SmartClear: Your clearance certificate is ready",
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #15803d;">SmartClear</h2>
        <p>Hello ${safeName},</p>
        <p>Congratulations! You have completed all required clearance requirements.</p>
        <p>Your clearance certificate has been generated successfully.</p>

        <div style="padding: 16px; background: #f9fafb; border-radius: 8px;">
          <p><strong>Registration number:</strong> ${safeRegNo}</p>
          <p><strong>Verification code:</strong> ${verificationCode}</p>
        </div>

        <p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 12px 20px; background: #15803d; color: #ffffff; text-decoration: none; border-radius: 6px;">
            Verify Certificate
          </a>
        </p>

        <p>You can use the verification page to confirm the authenticity of your certificate.</p>
        <p>Regards,<br />SmartClear Team</p>
      </div>
    `,
    text: [
      "SmartClear - Your Clearance Certificate Is Ready",
      "",
      `Hello ${studentName},`,
      "",
      "Congratulations! You have completed all required clearance requirements.",
      "Your clearance certificate has been generated successfully.",
      "",
      `Registration number: ${registrationNumber}`,
      `Verification code: ${verificationCode}`,
      "",
      `Verify your certificate: ${verifyUrl}`,
      "",
      "Regards,",
      "SmartClear Team",
    ].join("\n"),
  });
}