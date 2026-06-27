"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadButtonProps {
  certificate: {
    verificationCode: string;
    qrCodeUrl: string | null;
    issuedAt: Date;
    student: {
      fullName: string;
      regNo: string;
      department: string;
      level: string;
    };
  };
}

export default function DownloadButton({
  certificate,
}: DownloadButtonProps) {
  const downloadPDF = () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) return;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Clearance Certificate</title>

<style>
@page{
  size:A4 portrait;
  margin:20mm;
}

body{
  margin:0;
  background:#f5f5f5;
  font-family:Georgia, serif;
}

.certificate{
  position:relative;
  background:white;
  border:8px solid #166534;
  border-radius:12px;
  padding:50px;
  box-sizing:border-box;
  min-height:100vh;
}

.watermark{
  position:absolute;
  inset:0;
  display:flex;
  justify-content:center;
  align-items:center;
  font-size:120px;
  color:#166534;
  opacity:.05;
  font-weight:bold;
  pointer-events:none;
}

.header{
  text-align:center;
}

.logo{
  width:90px;
  margin-bottom:15px;
}

.university{
  font-size:26px;
  font-weight:bold;
  letter-spacing:1px;
}

.subtitle{
  font-size:18px;
  margin-top:6px;
}

.title{
  margin-top:40px;
  font-size:34px;
  font-weight:bold;
  color:#166534;
  letter-spacing:2px;
  text-transform:uppercase;
}

.certifies{
  margin-top:45px;
  text-align:center;
  font-size:18px;
}

.student-name{
  margin-top:20px;
  text-align:center;
  font-size:34px;
  font-weight:bold;
  text-transform:uppercase;
  border-bottom:2px solid #166534;
  display:inline-block;
  padding:0 30px 8px;
}

.student-wrapper{
  text-align:center;
}

.info{
  margin-top:45px;
  width:100%;
  border-collapse:collapse;
}

.info td{
  padding:10px 0;
  font-size:17px;
}

.label{
  width:220px;
  font-weight:bold;
}

.message{
  margin:45px auto;
  width:90%;
  text-align:center;
  line-height:1.9;
  font-size:18px;
}

.verify-box{
  margin:40px auto;
  width:300px;
  border:2px solid #166534;
  border-radius:10px;
  padding:25px;
  text-align:center;
}

.verify-title{
  font-weight:bold;
  font-size:16px;
  margin-bottom:12px;
}

.verify-code{
  font-size:20px;
  font-weight:bold;
  letter-spacing:4px;
  margin-bottom:18px;
}

.qr{
  width:180px;
  height:180px;
}

.scan{
  margin-top:10px;
  font-size:13px;
  color:#666;
}

.footer{
  margin-top:50px;
  text-align:center;
  font-size:13px;
  color:#555;
  line-height:1.7;
}

.generated{
  margin-top:35px;
  border-top:1px solid #ccc;
  padding-top:18px;
  text-align:center;
  font-size:12px;
  color:#777;
}

.print-btn{
  position:fixed;
  top:20px;
  right:20px;
  background:#166534;
  color:white;
  border:none;
  padding:12px 25px;
  cursor:pointer;
  border-radius:6px;
  font-size:15px;
}

@media print{

.print-btn{
display:none;
}

body{
background:white;
}

}
</style>

</head>

<body>

<button class="print-btn" onclick="window.print()">
Download PDF
</button>

<div class="certificate">

<div class="watermark">
SMARTCLEAR
</div>

<div class="header">

<img
class="logo"
src="/unnlogo.png"
/>

<div class="university">
UNIVERSITY OF NIGERIA, NSUKKA
</div>

<div class="subtitle">
Automated Clearance Management System
</div>

<div class="title">
Clearance Certificate
</div>

</div>

<div class="certifies">
This is to certify that
</div>

<div class="student-wrapper">
<div class="student-name">
${certificate.student.fullName}
</div>
</div>

<table class="info">

<tr>
<td class="label">Registration Number</td>
<td>${certificate.student.regNo}</td>
</tr>

<tr>
<td class="label">Department</td>
<td>${certificate.student.department}</td>
</tr>

<tr>
<td class="label">Level</td>
<td>${certificate.student.level}</td>
</tr>

<tr>
<td class="label">Issued Date</td>
<td>${new Date().toLocaleDateString()}</td>
</tr>

</table>

<div class="message">

 has successfully completed all required graduation clearance procedures of the University and has satisfied every administrative requirement necessary for graduation.

</div>

<div class="generated">

SmartClear • Automated Clearance Management System

</div>

</div>

</body>
</html>
`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Button
      onClick={downloadPDF}
      size="lg"
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Download Clearance Certificate
    </Button>
  );
}