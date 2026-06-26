"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function AdminStudentsPage() {
  const [form, setForm] = useState({
    fullName: "",
    regNo: "",
    department: "",
    level: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);

     const loadingToast = toast.loading(
  "Creating student..."
);

    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        toast.dismiss(loadingToast);
        const err = await res.json();

        toast.error(err.message || "Failed to create student");

        return;
      }

      toast.success("Student created successfully");

      setForm({
        fullName: "",
        regNo: "",
        department: "",
        level: "",
        email: "",
      });
    } catch (error) {
      console.error(error);

      toast.dismiss(loadingToast);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Enroll Student</h1>

      <input
        name="fullName"
        placeholder="Full Name"
        value={form.fullName}
        onChange={handleChange}
        className="border p-2 w-full"
      />

      <input
        name="regNo"
        placeholder="Reg Number"
        value={form.regNo}
        onChange={handleChange}
        className="border p-2 w-full"
      />

      <input
        name="department"
        placeholder="Department"
        value={form.department}
        onChange={handleChange}
        className="border p-2 w-full"
      />

      <input
        name="level"
        placeholder="Level"
        value={form.level}
        onChange={handleChange}
        className="border p-2 w-full"
      />

      <input
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className="border p-2 w-full"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2"
      >
        {loading ? "Creating..." : "Create Student"}
      </button>
    </div>
  );
}
