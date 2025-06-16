import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { MoreHorizontal, FileText, X } from "lucide-react";
import Navbar from "./shared/Navbar";
import { APPLICATION_API_END_POINT } from "@/utils/constant";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const shortlistingStatus = ["Accepted", "Rejected"];

const InternshipDetails = () => {
  const { id } = useParams();
  const [internship, setInternship] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
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
      console.log(res);
      setApplicants((res.data.internship?.applications || []).filter((app) => app !== null));
    } catch (error) {
      console.error("Failed to fetch applicants:", error);
      toast.error("Error loading applicants");
    }
  };

  const handleStatusUpdate = async (status, appId) => {
    try {
      setLoading(true);
      console.log(appId);
      console.log(status);
      // const res = await axios.post(
      //   // `${APPLICATION_API_END_POINT}/intern/status/${appId}/update`,
      //   `${APPLICATION_API_END_POINT}/status/${appId}/update`,
      //   { status },
      //   { withCredentials: true }
      // );

      const res = await axios.post(
        `http://localhost:8000/api/v1/application/internship/status/${appId}/update`,
        { status },
        { withCredentials: true }   
      );
      console.log(res);

      if (res.data.success) {
        toast.success(res.data.message);
        // Refresh job data after updating status
        // Instead of refetching all applicants, update the state locally
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
    console.error('Error loading PDF:', error);
    setPdfError('Failed to load PDF. Please try again.');
  }

  const handleViewPdf = (url) => {
    // Use Google Docs Viewer
    const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    setPdfUrl(googleDocsUrl);
    setShowPdf(true);
  };

  useEffect(() => {
    fetchInternshipDetails();
    fetchApplicants();
  }, [id]);

  if (loading) {
    return <div className="text-white text-center mt-20">Loading...</div>;
  }

  if (!internship) {
    return (
      <div className="text-white text-center mt-20">Internship not found.</div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-black text-white min-h-screen py-20 overflow-x-hidden">
        <div className="container px-4 ml-8 mr-10">
          <div className="flex items-center justify-between mb-6 mr-7">
            <h1 className="text-3xl font-bold">{internship.title}</h1>
          </div>

          <div className="flex gap-4 mb-6">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-bold rounded-md">
              {internship.duration}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-md">
              ₹{internship.stipend}/month
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-bold rounded-md">
              {internship.type}
            </span>
          </div>

          <h2 className="border-b-2 border-gray-300 text-xl font-medium py-4 mb-6">
            Internship Details
          </h2>
          <div className="space-y-4 mb-12">
            <h1 className="font-bold text-lg">
              Role:{" "}
              <span className="font-normal text-gray-300">
                {internship.title}
              </span>
            </h1>
            <h1 className="font-bold text-lg">
              Location:{" "}
              <span className="font-normal text-gray-300">
                {internship.location}
              </span>
            </h1>
            <h1 className="font-bold text-lg">
              Description:{" "}
              <span className="font-normal text-gray-300">
                {internship.description}
              </span>
            </h1>
            <h1 className="font-bold text-lg">
              Duration:{" "}
              <span className="font-normal text-gray-300">
                {internship.duration}
              </span>
            </h1>
            <h1 className="font-bold text-lg">
              Stipend:{" "}
              <span className="font-normal text-gray-300">
                ₹{internship.stipend}/month
              </span>
            </h1>
            <h1 className="font-bold text-lg">
              Type:{" "}
              <span className="font-normal text-gray-300">
                {internship.type}
              </span>
            </h1>
            <h1 className="font-bold text-lg">
              Required Skills:
              <div className="flex flex-wrap gap-2 mt-2">
                {internship.skills?.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </h1>
            <h1 className="font-bold text-lg">
              Posted Date:{" "}
              <span className="font-normal text-gray-300">
                {new Date(internship.createdAt).toLocaleDateString()}
              </span>
            </h1>
            <h1 className="font-bold text-lg">
              Total Applicants:{" "}
              <span className="font-normal text-gray-300">
                {applicants.length || 0}
              </span>
            </h1>
            <h1 className="font-bold text-lg">
              Accepted:{" "}
              <span className="font-normal text-gray-300">
                {applicants.filter(app => app.status === 'accepted').length}
              </span>
            </h1>
            <h1 className="font-bold text-lg">
              Rejected:{" "}
              <span className="font-normal text-gray-300">
                {applicants.filter(app => app.status === 'rejected').length}
              </span>
            </h1>
            <h1 className="font-bold text-lg">
              Pending:{" "}
              <span className="font-normal text-gray-300">
                {applicants.filter(app => app.status === 'pending' || !app.status).length}
              </span>
            </h1>
          </div>

          {/* Applicants Table */}
          <div className="mt-12">
            <h2 className="border-b-2 border-gray-300 text-xl font-medium py-4 mb-6">
              Applicants ({applicants.length})
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
                  {applicants.length > 0 ? (
                    applicants.map((app) => (
                      <tr key={app._id} className="border-b border-gray-600">
                        <td className="py-4">{app.applicant?.fullname || "N/A"}</td>
                        <td>{app.applicant?.email || "N/A"}</td>
                        <td>
                          <span className={`px-2 py-1 rounded text-sm ${
                            app?.status === 'accepted'
                              ? 'bg-green-500 text-white'
                              : app?.status === 'rejected'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-500 text-white'
                          }`}>
                            {app?.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1).toLowerCase() : 'Pending'}
                          </span>
                        </td>
                        <td>
                          {app.applicant?.profile?.resume ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewPdf(app.applicant?.profile?.resume)}
                                className="text-blue-400 hover:underline flex items-center gap-2"
                              >
                                <FileText className="w-4 h-4" />
                                View PDF
                              </button>
                            </div>
                          ) : (
                            "No Resume"
                          )}
                        </td>
                        <td>
                          {app.createdAt
                            ? new Date(app.createdAt).toLocaleDateString()
                            : "N/A"}
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
                                    handleStatusUpdate(status.toLowerCase(), app._id)
                                  }
                                  className={`px-2 py-1 rounded cursor-pointer hover:text-white`}
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
                      <td
                        colSpan="6"
                        className="py-4 text-center text-gray-400"
                      >
                        No applicants yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {showPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-black p-4 rounded-lg w-11/12 h-5/6 relative border border-gray-700">
            <button
              onClick={() => setShowPdf(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <iframe
              src={pdfUrl}
              className="w-full h-full rounded"
              title="PDF Viewer"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default InternshipDetails;
