import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Check,
  X,
  Search,
  User,
  Briefcase,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navbar from "./shared/Navbar";
import {
  ADMIN_API_END_POINT,
  RECRUITER_API_END_POINT,
  STUDENT_API_END_POINT,
} from "@/utils/constant";

const Admin = () => {
  // ... (keep all existing state and logic)

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            Manage students, recruiters, and pending requests
          </p>
        </div>

        {/* Students Section */}
        <Card className="mb-8 border-gray-800 bg-gray-900/50">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="w-5 h-5 text-blue-400" />
                Students
              </CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  className="pl-10 bg-gray-800 border-gray-700 focus:ring-2 focus:ring-blue-500"
                  value={studentSearchTerm}
                  onChange={(e) => {
                    setStudentSearchTerm(e.target.value);
                    setCurrentStudentPage(1);
                  }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading.students ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Clock className="h-8 w-8 text-blue-400 animate-spin mb-4" />
                <p className="text-gray-400">Loading students...</p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-gray-800 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-800/50">
                      <TableRow>
                        <TableHead className="text-gray-300">Profile</TableHead>
                        <TableHead className="text-gray-300">Name</TableHead>
                        <TableHead className="text-gray-300">Email</TableHead>
                        <TableHead className="text-gray-300">Phone</TableHead>
                        <TableHead className="text-gray-300">Skills</TableHead>
                        <TableHead className="text-gray-300">Joined</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentStudents.length > 0 ? (
                        currentStudents.map((student) => (
                          <TableRow
                            key={student._id}
                            className="hover:bg-gray-800/30"
                          >
                            <TableCell>
                              <Avatar className="w-9 h-9 border border-gray-700">
                                <AvatarImage
                                  src={student.profile?.profilePhoto}
                                />
                                <AvatarFallback className="bg-gray-800">
                                  {getInitials(student.fullname)}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="font-medium">
                              {student.fullname}
                            </TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>
                              {student.phonenumber || "N/A"}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {(student.profile?.skills || []).map(
                                  (skill, index) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="bg-gray-700 text-gray-300"
                                    >
                                      {skill}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(student.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteStudent(student._id)}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            {students.length === 0
                              ? "No students found"
                              : "No matching students found"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {totalStudentPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentStudentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentStudentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-400">
                      Page {currentStudentPage} of {totalStudentPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentStudentPage((prev) =>
                          Math.min(prev + 1, totalStudentPages)
                        )
                      }
                      disabled={currentStudentPage === totalStudentPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Recruiters Section */}
        <Card className="mb-8 border-gray-800 bg-gray-900/50">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Briefcase className="w-5 h-5 text-green-400" />
                Recruiters
              </CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search recruiters..."
                  className="pl-10 bg-gray-800 border-gray-700 focus:ring-2 focus:ring-blue-500"
                  value={recruiterSearchTerm}
                  onChange={(e) => {
                    setRecruiterSearchTerm(e.target.value);
                    setCurrentRecruiterPage(1);
                  }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading.recruiters ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Clock className="h-8 w-8 text-blue-400 animate-spin mb-4" />
                <p className="text-gray-400">Loading recruiters...</p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border border-gray-800 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-800/50">
                      <TableRow>
                        <TableHead className="text-gray-300">Logo</TableHead>
                        <TableHead className="text-gray-300">Company</TableHead>
                        <TableHead className="text-gray-300">Email</TableHead>
                        <TableHead className="text-gray-300">CIN</TableHead>
                        <TableHead className="text-gray-300">Address</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentRecruiters.length > 0 ? (
                        currentRecruiters.map((rec) => (
                          <TableRow
                            key={rec._id}
                            className="hover:bg-gray-800/30"
                          >
                            <TableCell>
                              <Avatar className="w-9 h-9 border border-gray-700">
                                <AvatarImage src={rec.profile?.profilePhoto} />
                                <AvatarFallback className="bg-gray-800">
                                  {getInitials(rec.companyname)}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="font-medium">
                              {rec.companyname}
                            </TableCell>
                            <TableCell>{rec.email}</TableCell>
                            <TableCell>{rec.cinnumber}</TableCell>
                            <TableCell>{rec.companyaddress}</TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteRecruiter(rec._id)}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            {recruiters.length === 0
                              ? "No recruiters found"
                              : "No matching recruiters found"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {totalRecruiterPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentRecruiterPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentRecruiterPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-400">
                      Page {currentRecruiterPage} of {totalRecruiterPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentRecruiterPage((prev) =>
                          Math.min(prev + 1, totalRecruiterPages)
                        )
                      }
                      disabled={currentRecruiterPage === totalRecruiterPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Recruiter Requests Section */}
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              Pending Recruiter Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading.requests ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Clock className="h-8 w-8 text-blue-400 animate-spin mb-4" />
                <p className="text-gray-400">Loading requests...</p>
              </div>
            ) : recruiterRequests.length > 0 ? (
              <div className="space-y-4">
                {recruiterRequests.map((req) => (
                  <div
                    key={req._id}
                    className="p-4 rounded-lg border border-gray-800 bg-gray-800/30 flex flex-col md:flex-row gap-4"
                  >
                    <Avatar className="w-16 h-16 border-2 border-blue-500/50">
                      <AvatarImage src={req.profile?.profilePhoto} />
                      <AvatarFallback className="bg-gray-800">
                        {getInitials(req.companyname)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Company</p>
                          <p className="font-medium">{req.companyname}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Email</p>
                          <p className="font-medium">{req.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">CIN</p>
                          <p className="font-medium">{req.cinnumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Address</p>
                          <p className="font-medium">{req.companyaddress}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => handleApprove(req._id)}
                          className="gap-1 bg-green-600 hover:bg-green-700"
                        >
                          <Check size={16} /> Accept
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleReject(req._id)}
                          className="gap-1"
                        >
                          <X size={16} /> Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No pending recruiter requests</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
