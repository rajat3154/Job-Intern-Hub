import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAllJobs } from "@/redux/jobSlice";
import PostJob from "./recruiter/PostJob";
import { Bookmark, BookmarkCheck, Search } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

const Jobs = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);
  const { allJobs } = useSelector((store) => store.job);
  const [filteredJobs, setFilteredJobs] = useState(allJobs);
  const [showPostJob, setShowPostJob] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Check if job is saved when component mounts or job changes
    const checkIfJobSaved = async () => {
      if (!user || !currentJobId) return;
      try {
        const response = await fetch(
          `http://localhost:8000/api/v1/job/is-saved/${currentJobId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsSaved(data.isSaved);
        }
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };

    checkIfJobSaved();
  }, [currentJobId, user]);

  const handleSaveJob = async (e, jobId) => {
    e.stopPropagation();
    if (!user) {
      navigate("/signup");
      return;
    }

    setCurrentJobId(jobId);

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/job/save-job/${jobId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save job");
      }

      const data = await response.json();
      if (data.success) {
        setIsSaved(data.isSaved);
        toast.success(data.message);
      }
    } catch (error) {
      console.error("Error saving job:", error);
      toast.error("Failed to save job");
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/job/recruiter/get",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      
      const data = await response.json();
      console.log(data);
      if (data.success && Array.isArray(data.jobs)) {
        dispatch(setAllJobs(data.jobs));
        setFilteredJobs(data.jobs);
      }
    } catch (error) {
      console.error("Error fetching recruiter jobs:", error);
    }
  };

  useEffect(() => {
    if (user?.role === "recruiter") {
      fetchJobs();
    } else {
      fetchAllJobs();
    }
  }, [user]);

  const fetchAllJobs = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/job/get", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();
      console.log(data)
      if (data.success && Array.isArray(data.jobs)) {
        dispatch(setAllJobs(data.jobs));
        setFilteredJobs(data.jobs);
      }
    } catch (error) {
      console.error("Error fetching all jobs:", error);
    }
  };

  // Apply search filter whenever search term or jobs change
  useEffect(() => {
    if (!searchTerm) {
      setFilteredJobs(allJobs);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = allJobs.filter((job) => {
      return (
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.company?.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower) ||
        (job.skills &&
          job.skills.some((skill) => skill.toLowerCase().includes(searchLower)))
      );
    });

    setFilteredJobs(filtered);
  }, [searchTerm, allJobs]);

  const handleJobPosted = () => {
    if (user?.role === "recruiter") {
      fetchJobs();
    } else {
      fetchAllJobs();
    }
    setShowPostJob(false);
  };

  const handleJobClick = (jobId, e) => {
    e.preventDefault();
    if (!user) {
      navigate("/signup");
      return;
    }

    navigate(
      user?.role === "student"
        ? `/job/description/${jobId}`
        : `/job/details/${jobId}`
    );
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto text-center py-10">
        <h1 className="text-4xl font-bold mb-3 text-blue-500">
          {user?.role === "recruiter" ? "Your Job " : "Browse Job "}
          <span className="text-white text-4xl">Listings</span>
        </h1>
        <p className="text-lg text-gray-300">
          {user?.role === "recruiter"
            ? "Manage your job postings"
            : "Find your dream job in just a few clicks!"}
        </p>

        {user?.role === "recruiter" && (
          <Button
            onClick={() => setShowPostJob(true)}
            className="mt-4 bg-green-500 hover:bg-green-600"
          >
            Post New Job
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 mb-6">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search jobs by title, company, location, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {showPostJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <PostJob
            onClose={() => setShowPostJob(false)}
            onSuccess={handleJobPosted}
          />
        </div>
      )}

      <div className="container mx-auto px-4 flex-1 pb-5">
        {filteredJobs.length <= 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-xl font-medium">
              {searchTerm
                ? "No jobs match your search. Try different keywords."
                : user?.role === "recruiter"
                ? "You haven't posted any jobs yet."
                : "No jobs found."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                onClick={(e) => handleJobClick(job._id, e)}
                className="w-full p-5 rounded-xl shadow-md bg-black text-white border border-blue-500 hover:bg-gray-900 transition duration-300 flex flex-col h-full relative group cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleJobClick(job._id, e)}
              >
                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex gap-2 z-10">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJobClick(job._id, e);
                    }}
                    className="px-3 py-1 bg-purple-800 border-purple-500 text-white text-sm font-bold rounded-md hover:bg-purple-600 cursor-pointer"
                  >
                    View Details
                  </Button>
                  {user?.role === "student" && (
                    <Button
                      onClick={(e) => handleSaveJob(e, job._id)}
                      variant="outline"
                      className={`px-3 py-1 text-sm font-bold rounded-md flex items-center gap-2 cursor-pointer ${
                        isSaved && currentJobId === job._id
                          ? "bg-blue-500 hover:bg-blue-600 text-black"
                          : "bg-black hover:bg-gray-700"
                      }`}
                    >
                      {isSaved && currentJobId === job._id ? (
                        <BookmarkCheck size={16} />
                      ) : (
                        <Bookmark size={16} />
                      )}
                      {isSaved && currentJobId === job._id ? "Saved" : "Save Job"}
                    </Button>
                  )}
                </div>

                {/* Card Content */}
                <div className="mt-10 flex flex-col h-full">
                  {/* Date - Left aligned */}
                  <p className="text-xs text-gray-400 mb-3 text-left">
                    {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "N/A"}
                  </p>

                  {/* Company Info */}
                  <div className="flex gap-3 mb-4">
                    <Avatar className="w-10 h-10 rounded-full object-cover border border-gray-600">
                      <AvatarImage src={job?.created_by?.profile?.profilePhoto} />
                      <AvatarFallback className="bg-gray-800 text-blue-400">
                        {(job?.created_by?.companyname || "C").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <h2 className="text-base font-semibold line-clamp-1">
                        {job?.created_by?.companyname || "Company Name"}
                      </h2>
                      <p className="text-xs text-gray-400">
                        {job.location || "Location not specified"}
                      </p>
                    </div>
                  </div>

                  {/* Job Title & Description */}
                  <div className="mb-4 text-left">
                    <h1 className="text-lg font-bold line-clamp-1 mb-2">
                      {job.title || "Job Title"}
                    </h1>
                    {job.description && (
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {job.description}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2.5 py-1 bg-blue-400 text-black text-xs font-medium rounded-md">
                      {job.position || 1} Position{job.position > 1 ? "s" : ""}
                    </span>
                    <span className="px-2.5 py-1 bg-yellow-400 text-black text-xs font-medium rounded-md">
                      {job.salary ? `${job.salary} LPA` : "Salary N/A"}
                    </span>
                    <span className="px-2.5 py-1 bg-red-600 text-white text-xs font-medium rounded-md">
                      {job.jobType || "Type N/A"}
                    </span>
                  </div>

                  {/* Skills - Left aligned */}
                  {job.requirements?.length > 0 && (
                    <div className="mt-auto text-left">
                      <p className="text-xs font-medium text-gray-400 mb-2">
                        Required Skills:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.slice(0, 4).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-700 text-white text-xs rounded-md"
                          >
                            {skill.length > 12 ? `${skill.substring(0, 10)}...` : skill}
                          </span>
                        ))}
                        {job.requirements.length > 4 && (
                          <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-md">
                            +{job.requirements.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
