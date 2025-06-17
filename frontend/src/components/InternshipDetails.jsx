import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  MoreHorizontal,
  FileText,
  X,
  MessageSquare,
  ChevronRight,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  User,
  Mail,
} from "lucide-react";
import Navbar from "./shared/Navbar";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import { Document, Page, pdfjs } from "react-pdf";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const shortlistingStatus = ["Accepted", "Rejected"];

const InternshipDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [internship, setInternship] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(null);

  const fetchInternshipDetails = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:8000/api/v1/internship/get/${id}`,
        { withCredentials: true }
      );
      setInternship(data.internship);
    } catch (error) {
      console.error("Failed to fetch internship details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicants = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/application/internship/${id}/applicants`,
        { withCredentials: true }
      );
      setApplicants(
        (res.data.internship?.applications || []).filter((app) => app !== null)
      );
    } catch (error) {
      console.error("Failed to fetch applicants:", error);
      toast.error("Error loading applicants");
    }
  };

  const handleStatusUpdate = async (status, appId) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `http://localhost:8000/api/v1/application/internship/status/${appId}/update`,
        { status },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setApplicants((prevApplicants) =>
          prevApplicants.map((app) =>
            app._id === appId ? { ...app, status: status.toLowerCase() } : app
          )
        );
      } else {
        toast.error("Status update failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPdfError(null);
  }

  function onDocumentLoadError(error) {
    console.error("Error loading PDF:", error);
    setPdfError("Failed to load PDF. Please try again.");
  }

  const handleViewPdf = (url) => {
    const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
      url
    )}&embedded=true`;
    setPdfUrl(googleDocsUrl);
    setShowPdf(true);
  };

  useEffect(() => {
    fetchInternshipDetails();
    fetchApplicants();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="text-white text-center mt-20">Internship not found.</div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-black text-white min-h-screen py-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          

          {/* Internship Header */}
          <div className="bg-gray-900/50 rounded-xl p-6 mb-8 border border-gray-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border-2 border-blue-500/50">
                  <AvatarImage
                    src={internship?.created_by?.profile?.profilePhoto}
                  />
                  <AvatarFallback className="bg-gray-800 text-blue-400">
                    {internship?.created_by?.companyname?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {internship.title}
                  </h1>
                  <p className="text-lg text-gray-300">
                    {internship?.created_by?.companyname}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="flex items-center text-sm text-gray-400">
                      <MapPin className="h-4 w-4 mr-1" /> {internship.location}
                    </span>
                    <span className="flex items-center text-sm text-gray-400">
                      <DollarSign className="h-4 w-4 mr-1" /> ₹
                      {internship.stipend}/month
                    </span>
                    <span className="flex items-center text-sm text-gray-400">
                      <Clock className="h-4 w-4 mr-1" /> {internship.duration}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Internship Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Main Internship Content */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-white border-b border-gray-700 pb-3">
                  Internship Description
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-300">{internship.description}</p>

                  {internship.skills && (
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Required Skills:
                      </h3>
                      <div className="flex flex-col gap-2">
                        {internship.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-800 text-white text-sm rounded-md w-fit"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Analytics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-gray-400 text-sm">Total Applicants</h3>
                    <User className="h-4 w-4 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-white mt-2">
                    {applicants.length || 0}
                  </p>
                </div>
                <div className="bg-green-900/20 p-4 rounded-lg border border-green-800/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-green-400 text-sm">Accepted</h3>
                    <User className="h-4 w-4 text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-green-400 mt-2">
                    {applicants.filter((app) => app.status === "accepted")
                      .length || 0}
                  </p>
                </div>
                <div className="bg-red-900/20 p-4 rounded-lg border border-red-800/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-red-400 text-sm">Rejected</h3>
                    <User className="h-4 w-4 text-red-400" />
                  </div>
                  <p className="text-2xl font-bold text-red-400 mt-2">
                    {applicants.filter((app) => app.status === "rejected")
                      .length || 0}
                  </p>
                </div>
                <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-800/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-yellow-400 text-sm">Pending</h3>
                    <User className="h-4 w-4 text-yellow-400" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-400 mt-2">
                    {applicants.filter(
                      (app) => app.status === "pending" || !app.status
                    ).length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Internship Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <h2 className="text-xl font-semibold mb-4 text-white border-b border-gray-700 pb-3">
                  Internship Summary
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Briefcase className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-gray-400 text-sm">Title</h3>
                      <p className="text-white">{internship.title}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-gray-400 text-sm">Location</h3>
                      <p className="text-white">{internship.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <DollarSign className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-gray-400 text-sm">Stipend</h3>
                      <p className="text-white">₹{internship.stipend}/month</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-gray-400 text-sm">Duration</h3>
                      <p className="text-white">{internship.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Briefcase className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-gray-400 text-sm">Type</h3>
                      <p className="text-white capitalize">{internship.type}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-gray-400 text-sm">Posted Date</h3>
                      <p className="text-white">
                        {new Date(internship.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Applicants Section */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Applicants ({applicants.length || 0})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="pb-3 text-gray-400 font-medium">
                      Candidate
                    </th>
                    <th className="pb-3 text-gray-400 font-medium">Email</th>
                    <th className="pb-3 text-gray-400 font-medium">Status</th>
                    <th className="pb-3 text-gray-400 font-medium">Resume</th>
                    <th className="pb-3 text-gray-400 font-medium">Applied</th>
                    <th className="pb-3 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants && applicants.length > 0 ? (
                    applicants.map((app) => (
                      <tr
                        key={app._id}
                        className="border-b border-gray-800 hover:bg-gray-900/30 transition-colors"
                      >
                        <td className="py-4 pr-8">
                          <div className="flex items-center gap-4">
                            <Avatar
                              className="h-10 w-10 border-2 border-blue-500/50 cursor-pointer hover:border-blue-400 transition-colors"
                              onClick={() =>
                                navigate(
                                  `/profile/student/${app.applicant._id}`
                                )
                              }
                            >
                              <AvatarImage
                                src={app.applicant?.profile?.profilePhoto}
                              />
                              <AvatarFallback className="bg-gray-800 text-blue-400">
                                {app.applicant?.fullname?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span
                                className="cursor-pointer hover:text-blue-400 transition-colors font-medium"
                                onClick={() =>
                                  navigate(
                                    `/profile/student/${app.applicant._id}`
                                  )
                                }
                              >
                                {app.applicant?.fullname || "N/A"}
                              </span>
                              <div className="flex gap-2 mt-1">
                                <Button
                                  onClick={() => {
                                    const selectedUser = {
                                      _id: app.applicant._id,
                                      fullName: app.applicant.fullname,
                                      email: app.applicant.email,
                                      role: "student",
                                      profilePhoto:
                                        app.applicant.profile?.profilePhoto,
                                      identifier:
                                        app.applicant.fullname || "Student",
                                      isOnline: false,
                                    };
                                    localStorage.setItem(
                                      "selectedUser",
                                      JSON.stringify(selectedUser)
                                    );
                                    navigate("/messages");
                                  }}
                                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 h-8 px-3 text-xs"
                                >
                                  <MessageSquare className="h-3 w-3" />
                                  Chat
                                </Button>
                                <Button
                                  onClick={() =>
                                    navigate(
                                      `/profile/student/${app.applicant._id}`
                                    )
                                  }
                                  className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 h-8 px-3 text-xs"
                                >
                                  <User className="h-3 w-3" />
                                  Profile
                                </Button>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="text-gray-300">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {app.applicant?.email || "N/A"}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              app.status === "accepted"
                                ? "bg-green-900/50 text-green-400 border border-green-800"
                                : app.status === "rejected"
                                ? "bg-red-900/50 text-red-400 border border-red-800"
                                : "bg-yellow-900/50 text-yellow-400 border border-yellow-800"
                            }`}
                          >
                            {app.status
                              ? app.status.charAt(0).toUpperCase() +
                                app.status.slice(1).toLowerCase()
                              : "Pending"}
                          </span>
                        </td>
                        <td>
                          {app.applicant?.profile?.resume ? (
                            <button
                              onClick={() =>
                                handleViewPdf(app.applicant.profile.resume)
                              }
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
                            >
                              <FileText className="h-4 w-4" />
                              View
                            </button>
                          ) : (
                            <span className="text-gray-500 text-sm">
                              No Resume
                            </span>
                          )}
                        </td>
                        <td className="text-gray-300 text-sm">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="relative">
                          <Popover>
                            <PopoverTrigger>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-white"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="bg-gray-900 border border-gray-800 text-white rounded-lg shadow-lg p-2 w-40">
                              {shortlistingStatus.map((status, index) => (
                                <div
                                  key={index}
                                  onClick={() =>
                                    handleStatusUpdate(status, app._id)
                                  }
                                  className={`px-3 py-2 rounded cursor-pointer text-sm hover:bg-gray-800 ${
                                    status === "Accepted"
                                      ? "hover:text-green-400"
                                      : "hover:text-red-400"
                                  }`}
                                >
                                  {status}
                                </div>
                              ))}
                            </PopoverContent>
                          </Popover>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <User className="h-10 w-10 mb-2" />
                          <p>No applicants yet</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* PDF Viewer Modal */}
        {showPdf && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg p-4 w-full max-w-5xl h-[90vh] flex flex-col border border-gray-800 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">
                  Resume Preview
                </h3>
                <button
                  onClick={() => setShowPdf(false)}
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 relative">
                {pdfError ? (
                  <div className="flex items-center justify-center h-full text-red-400">
                    {pdfError}
                  </div>
                ) : (
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full border-0 rounded-lg"
                    title="PDF Viewer"
                    allowFullScreen
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default InternshipDetails;
