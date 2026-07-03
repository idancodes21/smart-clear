"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EnrollStudentProps {
  onSuccess?: () => void;
}

export default function EnrollStudent({
  onSuccess,
}: EnrollStudentProps) {
  const [form, setForm] = useState({
    fullName: "",
    regNo: "",
    department: "",
    level: "",
    email: "",
    phoneNumber: "",
    stateOfOrigin: "",
    programme: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setForm({
      fullName: "",
      regNo: "",
      department: "",
      level: "",
      email: "",
      phoneNumber: "",
      stateOfOrigin: "",
      programme: "",
    });
  };

  const handleSubmit = async () => {
    setLoading(true);

    const loadingToast = toast.loading("Enrolling student...");

    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      toast.dismiss(loadingToast);

      if (!res.ok) {
        toast.error(data.message || "Failed to enroll student");
        return;
      }

      toast.success("Student enrolled successfully");

      resetForm();

      onSuccess?.();
    } catch (error) {
      console.error(error);

      toast.dismiss(loadingToast);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      <div className="grid gap-4 md:grid-cols-2">

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            name="fullName"
            placeholder="John Doe"
            value={form.fullName}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="regNo">Registration Number</Label>
          <Input
            id="regNo"
            name="regNo"
            placeholder="2019/123456"
            value={form.regNo}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            name="department"
            placeholder="Computer Science"
            value={form.department}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="programme">Programme</Label>
          <Input
            id="programme"
            name="programme"
            placeholder="B.Sc"
            value={form.programme}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Input
            id="level"
            name="level"
            placeholder="400"
            value={form.level}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stateOfOrigin">State of Origin</Label>
          <Input
            id="stateOfOrigin"
            name="stateOfOrigin"
            placeholder="Enugu"
            value={form.stateOfOrigin}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            placeholder="08012345678"
            value={form.phoneNumber}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="student@email.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>

      </div>

      <div className="flex justify-end gap-3">

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            resetForm();
            onSuccess?.();
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Enrolling..." : "Enroll Student"}
        </Button>

      </div>

    </div>
  );
}