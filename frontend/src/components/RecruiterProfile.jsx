import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Mail, Briefcase, Link as LinkIcon, Pen, FileText, MapPin, Building2, Calendar, Users, Globe, MessageSquare, Bookmark, ChevronDown, UserPlus } from "lucide-react";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import Navbar from "./shared/Navbar";
import { Card, CardContent } from "./ui/card";
import PostJob from "./recruiter/PostJob";
import PostInternship from "./recruiter/PostInternship";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import FollowButton from "./FollowButton";

const RecruiterProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [postedJobs, setPostedJobs] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostJob, setShowPostJob] = useState(false);
  const [showPostInternship, setShowPostInternship] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followersLoading, setFollowersLoading] = useState(true);
  const [followingLoading, setFollowingLoading] = useState(true);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const { user: currentUser } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const { id } = useParams();
  const isOwnProfile = !id || id === currentUser?._id;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const profileRes = await axios.get(
          `http://localhost:8000/api/v1/recruiter/profile/${isOwnProfile ? currentUser._id : id}`,
          { withCredentials: true }
        );
        setProfileData(profileRes.data.data);

        const jobsRes = await axios.get(
          `http://localhost:8000/api/v1/job/recruiter/${isOwnProfile ? currentUser._id : id}`,
          { withCredentials: true }
        );
        setPostedJobs(jobsRes.data.jobs || []);

        const internshipsRes = await axios.get(
          `http://localhost:8000/api/v1/internship/recruiter/${isOwnProfile ? currentUser._id : id}`,
          { withCredentials: true }
        );
        setInternships(internshipsRes.data.internships || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [currentUser?._id, id, isOwnProfile]);

  useEffect(() => {
    const fetchFollowData = async () => {
      if (!profileData?._id) return;

      try {
        setFollowersLoading(true);
        setFollowingLoading(true);

        const [followersRes, followingRes] = await Promise.all([
          axios.get(
            `http://localhost:8000/api/v1/follow/followers/${profileData._id}/recruiter`,
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          ),
          axios.get(
            `http://localhost:8000/api/v1/follow/following/${profileData._id}/recruiter`,
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          ),
        ]);

        setFollowers(followersRes.data.data);
        setFollowing(followingRes.data.data);
      } catch (error) {
        console.error("Error fetching follow data:", error);
        toast.error("Failed to load connections");
      } finally {
        setFollowersLoading(false);
        setFollowingLoading(false);
      }
    };

    fetchFollowData();
  }, [profileData]);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser?._id || !profileData?._id || isOwnProfile) return;

      try {
        const response = await axios.get(
          `http://localhost:8000/api/v1/follow/check/${currentUser._id}/${profileData._id}`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        setIsFollowing(response.data.isFollowing);
      } catch (error) {
        console.error("Error checking follow status:", error);
      }
    };

    checkFollowStatus();
  }, [currentUser?._id, profileData?._id, isOwnProfile]);

  const handleJobPosted = async () => {
    try {
      const jobsRes = await axios.get(
        "http://localhost:8000/api/v1/job/recruiter",
        { withCredentials: true }
      );
      setPostedJobs(jobsRes.data.jobs || []);
      setShowPostJob(false);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const handleInternshipPosted = async () => {
    try {
      const internshipsRes = await axios.get(
        "http://localhost:8000/api/v1/internship/recruiter",
        { withCredentials: true }
      );
      setInternships(internshipsRes.data.internships || []);
      setShowPostInternship(false);
    } catch (error) {
      console.error("Error fetching internships:", error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await axios.delete(
        `http://localhost:8000/api/v1/job/delete/${jobId}`,
        { withCredentials: true }
      );
      setPostedJobs(postedJobs.filter(job => job._id !== jobId));
      toast.success("Job deleted successfully");
    } catch (error) {
      toast.error("Failed to delete job");
    }
  };

  const handleDeleteInternship = async (internshipId) => {
    try {
      await axios.delete(
        `http://localhost:8000/api/v1/internship/delete/${internshipId}`,
        { withCredentials: true }
      );
      setInternships(internships.filter(internship => internship._id !== internshipId));
      toast.success("Internship deleted successfully");
    } catch (error) {
      toast.error("Failed to delete internship");
    }
  };

  const handleSaveJob = async (jobId) => {
    try {
      await axios.post(
        `http://localhost:8000/api/v1/job/save/${jobId}`,
        {},
        { withCredentials: true }
      );
      toast.success("Job saved successfully");
    } catch (error) {
      toast.error("Failed to save job");
    }
  };

  const handleSaveInternship = async (internshipId) => {
    try {
      await axios.post(
        `http://localhost:8000/api/v1/internship/save/${internshipId}`,
        {},
        { withCredentials: true }
      );
      toast.success("Internship saved successfully");
    } catch (error) {
      toast.error("Failed to save internship");
    }
  };

  const handleFollow = async () => {
    if (!currentUser?._id || !profileData?._id) {
      toast.error("Please login to follow");
      return;
    }

    try {
      setFollowLoading(true);
      if (isFollowing) {
        await axios.delete(
          `http://localhost:8000/api/v1/follow/${currentUser._id}/${profileData._id}`,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        setIsFollowing(false);
        toast.success("Unfollowed successfully");
      } else {
        await axios.post(
          `http://localhost:8000/api/v1/follow/${currentUser._id}/${profileData._id}`,
          {},
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        setIsFollowing(true);
        toast.success("Followed successfully");
      }
    } catch (error) {
      console.error("Error following/unfollowing:", error);
      toast.error("Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessageClick = () => {
    if (!currentUser?._id || !profileData?._id) {
      toast.error("Please login to message");
      return;
    }
    const selectedUser = {
      _id: profileData._id,
      fullName: profileData.companyname,
      email: profileData.email,
      role: "recruiter",
      profilePhoto: profileData.profile?.profilePhoto,
      identifier: profileData.companyname || "Recruiter",
      isOnline: false,
    };
    localStorage.setItem("selectedUser", JSON.stringify(selectedUser));
    navigate("/messages");
  };

  const toggleFollowers = () => {
    setShowFollowers(!showFollowers);
    if (showFollowing) setShowFollowing(false);
  };

  const toggleFollowing = () => {
    setShowFollowing(!showFollowing);
    if (showFollowers) setShowFollowers(false);
  };

  const renderJobCard = (job) => (
    <div
      key={job._id}
      className="relative p-6 rounded-xl bg-gray-900 text-white border border-gray-800 hover:border-blue-500 cursor-pointer transition-all duration-300 w-full"
      onClick={() => navigate(`/job/details/${job._id}`)}
    >
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            navigate(isOwnProfile ? `/job/details/${job._id}` : `/job/description/${job._id}`);
          }}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          View
        </Button>
        {isOwnProfile ? (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteJob(job._id);
            }}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </Button>
        ) : (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleSaveJob(job._id);
            }}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Bookmark className="h-4 w-4 mr-1" />
            Save
          </Button>
        )}
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">
            Posted on {new Date(job.createdAt).toLocaleDateString()}
          </p>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
            {job.applications?.length || 0} applicants
          </Badge>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Avatar className="h-12 w-12 border border-blue-500/30">
            <AvatarImage src={profileData?.profile?.profilePhoto} />
            <AvatarFallback className="bg-gray-800 text-blue-400">
              {profileData?.companyname?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-lg">
              {profileData?.companyname}
            </h1>
            <p className="text-sm text-gray-400">{job.location}</p>
          </div>
        </div>

        <div className="mb-4">
          <h1 className="font-bold text-xl mb-3">{job.title}</h1>
          <p className="text-gray-300 line-clamp-2">{job.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="bg-blue-500/20 text-blue-400">
            {job.position} Position{job.position > 1 ? "s" : ""}
          </Badge>
          <Badge className="bg-purple-500/20 text-purple-400">
            {job.jobType}
          </Badge>
          <Badge className="bg-yellow-500/20 text-yellow-400">
            {job.salary}
          </Badge>
        </div>
      </div>
    </div>
  );

  const renderInternshipCard = (internship) => (
    <div
      key={internship._id}
      className="relative p-6 rounded-xl bg-gray-900 text-white border border-gray-800 hover:border-blue-500 cursor-pointer transition-all duration-300 w-full"
      onClick={() => navigate(isOwnProfile ? `/internship/details/${internship._id}` : `/internship/description/${internship._id}`)}
    >
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            navigate(isOwnProfile ? `/internship/details/${internship._id}` : `/internship/description/${internship._id}`);
          }}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          View Details
        </Button>
        {isOwnProfile ? (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteInternship(internship._id);
            }}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </Button>
        ) : (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleSaveInternship(internship._id);
            }}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Bookmark className="h-4 w-4 mr-1" />
            Save
          </Button>
        )}
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-400">
            Posted on {new Date(internship.createdAt).toLocaleDateString()}
          </p>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
            {internship.applications?.length || 0} applicants
          </Badge>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Avatar className="h-12 w-12 border border-blue-500/30">
            <AvatarImage src={profileData?.profile?.profilePhoto} />
            <AvatarFallback className="bg-gray-800 text-blue-400">
              {profileData?.companyname?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-lg">
              {profileData?.companyname}
            </h1>
            <p className="text-sm text-gray-400">{internship.location}</p>
          </div>
        </div>

        <div className="mb-4">
          <h1 className="font-bold text-xl mb-3">{internship.title}</h1>
          <p className="text-gray-300 line-clamp-2">{internship.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="bg-blue-500/20 text-blue-400">
            {internship.type}
          </Badge>
          <Badge className="bg-green-500/20 text-green-400">
            {internship.stipend}
          </Badge>
          <Badge className="bg-yellow-500/20 text-yellow-400">
            {internship.duration}
          </Badge>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {/* Modals */}
      {showPostJob && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <PostJob onClose={() => setShowPostJob(false)} onJobPosted={handleJobPosted} />
        </div>
      )}

      {showPostInternship && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <PostInternship
            onClose={() => setShowPostInternship(false)}
            onInternshipPosted={handleInternshipPosted}
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-full max-w-4xl">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0">
                <Avatar className="h-32 w-32 border-2 border-blue-500">
                  <AvatarImage src={profileData?.profile?.profilePhoto} />
                  <AvatarFallback className="bg-gray-800 text-blue-400 text-3xl">
                    {profileData?.companyname?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h1 className="text-2xl font-bold">{profileData?.companyname}</h1>
                    <p className="text-gray-400">{profileData?.profile?.tagline || "Recruiter"}</p>
                  </div>

                  {/* Action Buttons for Non-Recruiters */}
                  {!isOwnProfile && currentUser?.role !== "recruiter" && (
                    <div className="flex gap-3">
                      <FollowButton
                        userId={profileData?._id}
                        userType="recruiter"
                        className="w-32"
                        size="default"
                      />
                      <Button
                        variant="outline"
                        size="default"
                        className="w-32 text-blue-400 border-blue-400/30 hover:bg-blue-400/10 hover:text-blue-300"
                        onClick={handleMessageClick}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  )}
                </div>

                {/* Followers/Following Dropdowns */}
                <div className="flex gap-4 mb-6">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      className="text-gray-400 hover:text-white flex items-center gap-2"
                      onClick={toggleFollowers}
                    >
                      <Users className="h-4 w-4" />
                      {followers.length} Followers
                      <ChevronDown className={`h-4 w-4 transition-transform ${showFollowers ? 'rotate-180' : ''}`} />
                    </Button>
                    {showFollowers && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 rounded-lg shadow-lg border border-gray-800 z-10">
                        <ScrollArea className="h-[300px]">
                          {followersLoading ? (
                            <div className="flex justify-center items-center h-40">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                          ) : followers.length > 0 ? (
                            <div className="p-2">
                              {followers.map((follower) => (
                                <div
                                  key={follower._id}
                                  className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
                                  onClick={() => navigate(`/profile/${follower.role.toLowerCase()}/${follower._id}`)}
                                >
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={follower.profile?.profilePhoto} />
                                    <AvatarFallback className="bg-gray-700">
                                      {follower.fullname?.charAt(0) || follower.companyname?.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="text-sm font-medium">
                                      {follower.fullname || follower.companyname}
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                      {follower.role === "student" ? "Student" : "Recruiter"}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-400">
                              No followers yet
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <Button
                      variant="ghost"
                      className="text-gray-400 hover:text-white flex items-center gap-2"
                      onClick={toggleFollowing}
                    >
                      <Users className="h-4 w-4" />
                      {following.length} Following
                      <ChevronDown className={`h-4 w-4 transition-transform ${showFollowing ? 'rotate-180' : ''}`} />
                    </Button>
                    {showFollowing && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 rounded-lg shadow-lg border border-gray-800 z-10">
                        <ScrollArea className="h-[300px]">
                          {followingLoading ? (
                            <div className="flex justify-center items-center h-40">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                          ) : following.length > 0 ? (
                            <div className="p-2">
                              {following.map((followed) => (
                                <div
                                  key={followed._id}
                                  className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
                                  onClick={() => navigate(`/profile/${followed.role.toLowerCase()}/${followed._id}`)}
                                >
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={followed.profile?.profilePhoto} />
                                    <AvatarFallback className="bg-gray-700">
                                      {followed.fullname?.charAt(0) || followed.companyname?.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="text-sm font-medium">
                                      {followed.fullname || followed.companyname}
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                      {followed.role === "student" ? "Student" : "Recruiter"}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-400">
                              Not following anyone yet
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-400" />
                      <span>Industry: {profileData?.industry || "Not specified"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-400" />
                      <span>Company Size: {profileData?.companysize || "Not specified"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-400" />
                      <span>Company Type: {profileData?.companytype || "Not specified"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-blue-400" />
                      <span>CIN: {profileData?.cinnumber || "Not provided"}</span>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-400" />
                      <span>{profileData?.email}</span>
                    </div>
                    {profileData?.profile?.phone && (
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-400" />
                        <span>{profileData.profile.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-400" />
                      <span>{profileData?.companyaddress || "Address not provided"}</span>
                    </div>
                    {profileData?.profile?.website && (
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-5 w-5 text-blue-400" />
                        <a
                          href={profileData.profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          {profileData.profile.website}
                        </a>
                      </div>
                    )}
                    {profileData?.createdAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-400" />
                        <span>Member since: {new Date(profileData.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Bio */}
                {profileData?.profile?.bio && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-blue-400 mb-2">About Company</h3>
                    <p className="text-gray-300">{profileData.profile.bio}</p>
                  </div>
                )}

                {/* Action Buttons */}
                {isOwnProfile && (
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    <Button
                      onClick={() => setShowPostJob(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      Post Job
                    </Button>
                    <Button
                      onClick={() => setShowPostInternship(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Post Internship
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Jobs and Internships Tabs */}
        <div className="flex flex-col items-center">
          <Tabs defaultValue="jobs" className="w-full">
            <div className="w-full max-w-4xl mb-6">
              <TabsList className="bg-gray-900 border border-gray-800 grid grid-cols-2">
                <TabsTrigger
                  value="jobs"
                  className="py-2 text-center data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Posted Jobs ({postedJobs.length})
                </TabsTrigger>
                <TabsTrigger
                  value="internships"
                  className="py-2 text-center data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Posted Internships ({internships.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="jobs" className="w-full">
              {postedJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
                  {postedJobs.map(job => renderJobCard(job))}
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="w-full max-w-4xl">
                    <Card className="bg-gray-900 border-gray-800">
                      <CardContent className="p-8 text-center">
                        <Briefcase className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Jobs Posted Yet</h3>
                        <p className="text-gray-400 mb-4">
                          {isOwnProfile 
                            ? "Start by posting your first job to find the right candidates."
                            : "This company hasn't posted any jobs yet."}
                        </p>
                        {isOwnProfile && (
                          <Button
                            onClick={() => setShowPostJob(true)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Post a Job
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="internships" className="w-full">
              {internships.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
                  {internships.map(internship => renderInternshipCard(internship))}
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="w-full max-w-4xl">
                    <Card className="bg-gray-900 border-gray-800">
                      <CardContent className="p-8 text-center">
                        <FileText className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Internships Posted Yet</h3>
                        <p className="text-gray-400 mb-4">
                          {isOwnProfile 
                            ? "Share internship opportunities and connect with early talent."
                            : "This company hasn't posted any internships yet."}
                        </p>
                        {isOwnProfile && (
                          <Button
                            onClick={() => setShowPostInternship(true)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Post Internship
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default RecruiterProfile;