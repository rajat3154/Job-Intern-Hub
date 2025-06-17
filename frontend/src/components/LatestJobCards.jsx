import React from "react";
import { Button } from "./ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useSelector } from "react-redux";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

const LatestJobCards = ({ job, onDetails, onSave, isSaved }) => {
  const { user } = useSelector((store) => store.auth);
  const isRecruiter = user?.role === "recruiter";

  const handleSaveClick = (e) => {
    e.stopPropagation();
    if (onSave) {
      onSave();
    }
  };

  const handleViewDetailsClick = (e) => {
    e.stopPropagation();
    if (onDetails) {
      onDetails();
    }
  };

  return (
    <div
      className="w-full p-5 rounded-xl shadow-md bg-black text-white border border-blue-500 hover:bg-gray-900 transition duration-300 flex flex-col h-full relative group cursor-pointer"
      onClick={handleViewDetailsClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleViewDetailsClick(e)}
    >
      {/* Action Buttons */}
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        <Button
          onClick={handleViewDetailsClick}
          className="px-3 py-1 bg-purple-800 border-purple-500 text-white text-sm font-bold rounded-md hover:bg-purple-600 cursor-pointer"
        >
          View Details
        </Button>
        {!isRecruiter && (
          <Button
            onClick={handleSaveClick}
            variant="outline"
            className={`px-3 py-1 text-sm font-bold rounded-md flex items-center gap-2 cursor-pointer ${
              isSaved
                ? "bg-blue-500 hover:bg-blue-600 text-black"
                : "bg-black hover:bg-gray-700"
            }`}
          >
            {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            {isSaved ? "Saved" : "Save Job"}
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
            <div className="flex flex-wrap gap-2 mt-2">
              {job.requirements?.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-800 text-blue-400 text-xs rounded-md whitespace-normal"
                >
                  {skill.split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  ).join(' ')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LatestJobCards;
