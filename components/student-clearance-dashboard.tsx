"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  FileText,
} from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import ClearanceModal from "@/components/clearance-modal";

interface Student {
  id: string;
  fullName: string;
  regNo: string;
  email: string | null;
  department: string;
  level: string;
}

interface Clearance {
  id: string;
  type:
    | "FEE_CLEARANCE"
    | "APPLICATION_LETTER"
    | "STATEMENT_OF_RESULT"
    | "SECURITY_CLEARANCE"
    | "ACCOMMODATION_CLEARANCE"
    | "LIBRARY_CLEARANCE";
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";
  progress: number;
}

interface Props {
  student: Student;
  clearances: Clearance[];
}

export default function StudentDashboard({ student, clearances }: Props) {
  const [loading, setLoading] = useState(false);

  const completed = clearances.filter(
    (clearance) => clearance.status === "COMPLETED",
  ).length;
  const total = clearances.length;
  const progress = total ? (completed / total) * 100 : 0;
  const pending = clearances.filter((c) => c.status === "IN_PROGRESS").length;
  const rejected = clearances.filter(
    (clearance) => clearance.status === "REJECTED",
  ).length;

  const refresh = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "REJECTED":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-orange-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="secondary">In Progress</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">SmartClear</h1>
                <p className="text-sm text-gray-600">Student Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="bg-white">
                <RefreshCw className={`h-4 w-4 mr-2}`} />
                Refresh
              </Button>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Student Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium">{student.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reg Number</p>
                  <p className="font-medium">{student.regNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-medium text-sm">{student.department}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Level</p>
                  <p className="font-medium">{student.level} Level</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-sm">{student.email}</p>
                </div>
              </div>
              <div className="space-y-3"></div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Clearance Progress</h3>
              <Badge variant="outline" className="text-sm">
                {completed}/{total} Completed
              </Badge>
            </div>
            <Progress value={progress} className="h-3 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completed}</div>
                <div className="text-gray-600">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {pending}
                </div>
                <div className="text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {rejected}
                </div>
                <div className="text-gray-600">Rejected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{total}</div>
                <div className="text-gray-600">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clearance List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clearances.map((clearance) => (
            <Card key={clearance.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  {getStatusIcon(clearance.status)}
                  {clearance.type.replaceAll("_", " ")}
                </CardTitle>

                {getStatusBadge(clearance.status)}
              </CardHeader>

              <CardContent>
                <div className="mt-4 flex justify-end">
                  <ClearanceModal clearance={clearance} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
