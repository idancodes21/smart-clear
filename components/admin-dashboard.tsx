"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  Filter,
  Eye,
  Users,
  FileText,
  Clock,
  CheckCircle,
  Plus,
  Edit,
} from "lucide-react";
import EnrollStudent from "./enroll-student";

interface Student {
  id: string;
  fullName: string;
  regNo: string;
  email: string | null;
  department: string;
  level: string;
  phoneNumber: string;
  stateOfOrigin: string;
  programme: string;
}

export function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [openEnroll, setOpenEnroll] = useState(false);

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClearanceRequests: 0,
    completedClearances: 0,
    pendingClearances: 0,
    rejectedClearances: 0,
    certificatesGenerated: 0,
  });


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>;

      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;

      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;

      default:
        return <Badge>Unknown</Badge>;
    }
  };


const fetchDashboard = async () => {
  try {
    setLoading(true);

    const res = await fetch("/api/admin/dashboard");

    if (!res.ok) {
      throw new Error("Failed to fetch dashboard");
    }

    const data = await res.json();

    setStudents(data.students);
    setStats(data.stats);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  const filteredStudents = students.filter((student) => {
    return (
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);

        const res = await fetch("/api/admin/dashboard");

        const data = await res.json();

        setStudents(data.students);

        setStats(data.stats);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Management Center
          </h1>
          <p className="text-gray-600">Unniversity of Nigeria Nsukka</p>
        </div>
        <div className="flex gap-3">
            <Button onClick={() => setOpenEnroll(true)}>
    <Plus className="mr-2 h-4 w-4" />
    Enroll Student
</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalStudents}
                </p>
              </div>
              <Users className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.pendingClearances}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Clearance
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalClearanceRequests}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.completedClearances}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Generated certificates
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.certificatesGenerated}
                </p>
              </div>
              <Edit className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, student ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="signed">E-Signed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Students</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Registration No.</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Programme</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{student.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.email}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>{student.regNo}</TableCell>

                  <TableCell>{student.department}</TableCell>

                  <TableCell>{student.programme}</TableCell>

                  <TableCell>{student.level}</TableCell>

                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedStudent && (
        <Dialog
          open={!!selectedStudent}
          onOpenChange={() => setSelectedStudent(null)}
        >
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label>Full Name</Label>
                <p className="font-medium">{selectedStudent.fullName}</p>
              </div>

              <div>
                <Label>Registration Number</Label>
                <p className="font-medium">{selectedStudent.regNo}</p>
              </div>

              <div>
                <Label>Email</Label>
                <p className="font-medium">{selectedStudent.email}</p>
              </div>

              <div>
                <Label>Phone Number</Label>
                <p className="font-medium">{selectedStudent.phoneNumber}</p>
              </div>

              <div>
                <Label>Department</Label>
                <p className="font-medium">{selectedStudent.department}</p>
              </div>

              <div>
                <Label>Programme</Label>
                <p className="font-medium">{selectedStudent.programme}</p>
              </div>

              <div>
                <Label>Level</Label>
                <p className="font-medium">{selectedStudent.level}</p>
              </div>

              <div>
                <Label>State of Origin</Label>
                <p className="font-medium">{selectedStudent.stateOfOrigin}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}


      <Dialog open={openEnroll} onOpenChange={setOpenEnroll}>
  <DialogContent className="sm:max-w-2xl">
    <DialogHeader>
      <DialogTitle>Enroll Student</DialogTitle>
      <DialogDescription>
        Register a new student into the clearance system.
      </DialogDescription>
    </DialogHeader>

    <EnrollStudent
      onSuccess={() => {
        setOpenEnroll(false);
        fetchDashboard(); // Refresh your students/stats
      }}
    />
  </DialogContent>
</Dialog>
    </div>
  );
}
