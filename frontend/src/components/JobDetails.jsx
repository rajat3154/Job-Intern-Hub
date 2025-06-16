import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { MoreHorizontal, FileText, X, MessageSquare } from "lucide-react";
import Navbar from "./shared/Navbar";
import { Document, Page, pdfjs } from 'react-pdf';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const shortlistingStatus = ["Accepted", "Rejected"];

const JobDetails = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfError, setPdfError] = useState(null);

  const fetchJobWithApplicants = async () => {
    try {
      const res = await axios.get(
        `${APPLICATION_API_END_POINT}/${jobId}/applicants`,
        { withCredentials: true }
      );

      console.log(res);

      if (res.data.success) {
        setJob(res.data.job);
      }
    } catch (error) {
      console.error("Failed to fetch job details:", error);
    }
  };

  useEffect(() => {
    fetchJobWithApplicants();
  }, [jobId]);

  const handleStatusUpdate = async (status, appId) => {
    try {
      setLoading(true);
      console.log(status, appId);
      const res = await axios.post(
        `${APPLICATION_API_END_POINT}/status/${appId}/update`,
        { status },
        { withCredentials: true }
      );
      console.log(res);
      if (res.data.success) {
        toast.success(res.data.message);
        // Refresh job data after updating status
        fetchJobWithApplicants();
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
    console.error('Error loading PDF:', error);
    setPdfError('Failed to load PDF. Please try again.');
  }

  const handleViewPdf = (url) => {
    // Use Google Docs Viewer
    const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    setPdfUrl(googleDocsUrl);
    setShowPdf(true);
  };

  const handleMessageClick = (recruiter) => {
    const selectedUser = {
      _id: recruiter._id,
      fullName: recruiter.companyname,
      email: recruiter.email,
      role: "recruiter",
      profilePhoto: recruiter.profile?.profilePhoto,
      identifier: recruiter.companyname || "Recruiter",
      isOnline: false,
    };
    localStorage.setItem("selectedUser", JSON.stringify(selectedUser));
    navigate("/messages");
  };

  if (!job) {
    return (
      <div className="text-white text-center mt-10">Loading job data...</div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-black text-white min-h-screen py-20 overflow-x-hidden">
        <div className="container px-4 ml-8 mr-10">
          {/* Company Info with Profile and Message Button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-blue-500/50">
                <AvatarImage src={job?.created_by?.profile?.profilePhoto} />
                <AvatarFallback className="bg-gray-800 text-blue-400">
                  {job?.created_by?.companyname?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{job?.created_by?.companyname}</h1>
                <p className="text-gray-400">{job?.location}</p>
              </div>
            </div>
            <Button
              onClick={() => handleMessageClick(job?.created_by)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <MessageSquare className="h-4 w-4" />
              Message
            </Button>
          </div>

          {/* Job Title */}
          <div className="flex items-center justify-between mb-6 mr-7">
            <h1 className="text-3xl font-bold">{job.title}</h1>
          </div>

          {/* Job Info Badges */}
          <div className="flex gap-4 mb-6">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-md">
              {job.position} Position{job.position > 1 ? "s" : ""}
            </span>
            <span className="px-3 py-1 bg-red-100 text-[#F83002] text-sm font-bold rounded-md">
              {job.jobType}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-[#7209b7] text-sm font-bold rounded-md">
              ₹{job.salary}
            </span>
          </div>

          {/* Job Description */}
          <h2 className="border-b-2 border-gray-300 text-xl font-medium py-4 mb-6">
            Job Description
          </h2>
          <div className="space-y-4 mb-12">
            <h1 className="font-bold text-lg">
              Role:{" "}
              <span className="font-normal text-gray-300">{job.title}</span>
            </h1>
            <h1 className="font-bold text-lg">
              Location:{" "}
              <span className="font-normal text-gray-300">{job.location}</span>
            </h1>
            <h1 className="font-bold text-lg">
              Description:{" "}
              <span className="font-normal text-gray-300">
                {job.description}
              </span>
            </h1>
            <h1 className="font-bold text-lg">
              Experience:{" "}
              <span className="font-normal text-gray-300">
                {job.experience} years
              </span>
            </h1>
            <h1 className="font-bold text-lg">
              Salary:{" "}
              <span className="font-normal text-gray-300">₹{job.salary}</span>
            </h1>
            {job.requirements && (
              <div>
                <h1 className="font-bold text-lg">Requirements:</h1>
                <ul className="list-disc list-inside text-gray-300 ml-2">
                  {job.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
            <h1 className="font-bold text-lg">
              Total Applicants:{" "}
              <span className="font-normal text-gray-300">
                {job.applications?.length || 0}
              </span>
            </h1>
            <h1 className="font-bold text-lg">
              Posted Date:{" "}
              <span className="font-normal text-gray-300">
                {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </h1>
          </div>

          {/* Applicants Table */}
          <div className="mt-12">
            <h2 className="border-b-2 border-gray-300 text-xl font-medium py-4 mb-6">
              Applicants
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-600">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Resume</th>
                    <th className="pb-3">Applied Date</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {job.applications && job.applications.length > 0 ? (
                    job.applications.map((app) => (
                      <tr key={app._id} className="border-b border-gray-600">
                        <td className="py-4 pr-8">
                          <div className="flex items-center gap-4">
                            <Avatar 
                              className="h-10 w-10 border-2 border-blue-500/50 cursor-pointer hover:border-blue-400 transition-colors"
                              onClick={() => navigate(`/profile/student/${app.applicant._id}`)}
                            >
                              <AvatarImage src={app.applicant?.profile?.profilePhoto} />
                              <AvatarFallback className="bg-gray-800 text-blue-400">
                                {app.applicant?.fullname?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                              <span 
                                className="cursor-pointer hover:text-blue-400 transition-colors flex-1"
                                onClick={() => navigate(`/profile/student/${app.applicant._id}`)}
                              >
                                {app.applicant?.fullname || "N/A"}
                              </span>
                              <Button
                                onClick={() => {
                                  const selectedUser = {
                                    _id: app.applicant._id,
                                    fullName: app.applicant.fullname,
                                    email: app.applicant.email,
                                    role: "student",
                                    profilePhoto: app.applicant.profile?.profilePhoto,
                                    identifier: app.applicant.fullname || "Student",
                                    isOnline: false,
                                  };
                                  localStorage.setItem("selectedUser", JSON.stringify(selectedUser));
                                  navigate("/messages");
                                }}
                                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 h-8 px-3 whitespace-nowrap"
                              >
                                <MessageSquare className="h-4 w-4" />
                                Chat
                              </Button>
                            </div>
                          </div>
                        </td>
                        <td>{app.applicant?.email || "N/A"}</td>
                        <td>
                          <span className={`px-2 py-1 rounded text-sm ${app.status === 'accepted'
                              ? 'bg-green-500 text-white'
                              : app.status === 'rejected'
                              ? 'bg-red-500 text-white'
                              : 'bg-yellow-500 text-white'
                            }`}
                          >
                            {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1).toLowerCase() : 'Pending'}
                          </span>
                        </td>
                        <td>
                          {app.applicant?.profile?.resume? (
                            <button
                              onClick={() => handleViewPdf(app.applicant.profile.resume)}
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                              <FileText className="h-4 w-4" />
                              View Resume
                            </button>
                          ) : (
                            "No Resume"
                          )}
                        </td>
                        <td>
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="relative">
                          <Popover>
                            <PopoverTrigger>
                              <MoreHorizontal className="cursor-pointer text-gray-400 hover:text-white" />
                            </PopoverTrigger>
                            <PopoverContent className="bg-black text-white rounded-lg shadow-lg p-2">
                              {shortlistingStatus.map((status, index) => (
                                <div
                                  key={index}
                                  onClick={() =>
                                    handleStatusUpdate(status, app._id)
                                  }
                                  className="px-2 py-1 rounded cursor-pointer hover:text-white hover:bg-blue-500"
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
                      <td colSpan="6" className="text-center py-4 text-gray-400">
                        No applicants yet
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg p-4 w-full max-w-4xl h-[90vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Resume Preview</h3>
                <button
                  onClick={() => setShowPdf(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 relative">
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-0"
                  title="PDF Viewer"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default JobDetails;
