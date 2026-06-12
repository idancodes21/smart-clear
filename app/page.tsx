"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Users,
  CheckCircle,
  Clock,
  Camera,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const [studentToken, setStudentToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStudentAccess = async () => {
    if (!studentToken.trim()) {
      alert("Please enter your clearance token");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push(`/student/${studentToken.trim()}`);
  };

  const stats = {
    totalStudents: 1247,
    completedClearances: 892,
    pendingApprovals: 355,
    activeDepartments: 5,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  SmartClear
                </h1>
                <p className="text-xs text-muted-foreground">
                  Automated Clearance System
                </p>
              </div>
            </div>
            <div className="text-right hidden sm:flex gap-2">
             <div className="block">
               <p className="text-sm font-medium text-foreground">
                Unniversity Of Nigeria Nsukka
              </p>
              <p className="text-xs text-muted-foreground">
                Student Clearance System
              </p>
             </div>
              <div className="">
                <Image src="/unnlogo.png" width={45} height={45} alt="Unn logo" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Automated Student Clearance System
            </h2>
            <p className="text-lg text-muted-foreground mb-8 text-balance">
              Automated Student Clearance System An AI-powered workflow that
              streamlines student clearance processing across departments with
              real-time tracking, document verification, and intelligent
              approval suggestions.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-card border border-border rounded-lg p-5 text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                {stats.totalStudents}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">
                Total Students
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-5 text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                {stats.completedClearances}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">
                Completed
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-5 text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                {stats.pendingApprovals}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">
                Pending
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-5 text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                {stats.activeDepartments}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">
                Departments
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-5 mb-16">
          {/* Student Access */}
          <Card className="border border-border hover:border-primary/30 transition-colors w-full max-w-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-foreground">
                <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                Student Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Access your clearance status and track progress
              </p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="studentToken" className="text-xs text-muted-foreground font-medium">
                    Reg Number
                  </Label>
                  <Input
                    id="studentToken"
                    placeholder="Enter your Reg Number"
                    value={studentToken}
                    onChange={(e) => setStudentToken(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleStudentAccess()
                    }
                    className="mt-1.5"
                  />
                </div>
                <Button
                  onClick={handleStudentAccess}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isLoading}
                >
                  {isLoading ? "Accessing..." : "Access Clearance"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Digital Signatures
            </h3>
            <p className="text-sm text-muted-foreground">
              Secure e-signatures with full audit trail
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              PDF Documents
            </h3>
            <p className="text-sm text-muted-foreground">
              Download official clearance documents
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Real-time Tracking
            </h3>
            <p className="text-sm text-muted-foreground">
              Track progress with instant notifications
            </p>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto border border-border mb-16">
          <CardHeader>
            <CardTitle className="text-center text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">
                  System Online
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">
                  All Services Active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">
                  Database Connected
                </span>
              </div>
            </div>
            <div className="text-center mt-4">
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <footer className="text-center pt-8 border-t border-border">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-semibold text-foreground">
              SmartClear
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            Unniversity Of Nigeria Nsukka
          </p>
          <p className="text-xs text-muted-foreground">
            © 2026 Idancodes. All rights reserved. 
          </p>
        </footer>
      </div>
    </div>
  );
}
