"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function GenerateCertificateButton() {
  const handleGenerateCertificate = async () => {
    const loadingToast = toast.loading("Generating certificate...");

    try {
      const res = await fetch("/api/dev/generate-certificate", {
        method: "POST",
      });

      const data = await res.json();

      toast.dismiss(loadingToast);

      if (!res.ok) {
        toast.error(data.error || "Failed to generate certificate");
        return;
      }

      toast.success("Certificate generated successfully!");
      console.log(data);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Something went wrong");
      console.error(error);
    }
  };

  return (
    <Button onClick={handleGenerateCertificate}>
      Generate Certificate
    </Button>
  );
}