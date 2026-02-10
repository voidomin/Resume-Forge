import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { api } from "../api/client";
import { useState, useEffect } from "react";
import {
  FileText,
  User,
  Plus,
  Clock,
  Sparkles,
  Download,
  ChevronRight,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import ImportResumeModal from "../components/Resume/ImportResumeModal";

interface Resume {
  id: string;
  name: string;
  targetRole?: string;
  atsScore?: number;
  createdAt: string;
  content?: {
    modelUsed?: string;
    generationMethod?: "ai" | "fallback";
    failureReason?: string;
  };
}

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
}

function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resumeRes, profileRes] = await Promise.all([
        api.get("/resumes"),
        api.get("/profile"),
      ]);
      setResumes(resumeRes.data.resumes || []);
      setProfile(profileRes.data.profile);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResume = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;

    try {
      await api.delete(`/resumes/${id}`);
      setResumes(resumes.filter((r) => r.id !== id));
      toast.success("Resume deleted");
    } catch (error) {
      toast.error("Failed to delete resume");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleImportSuccess = () => {
    fetchData(); // Refresh profile data
    navigate("/profile"); // Redirect to profile to review imported data
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <ImportResumeModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />

      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {profile?.firstName || user?.email?.split("@")[0]}! 👋
        </h1>
        <p className="text-gray-600">
          Manage your profile and create tailored resumes
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            {profile && (
              <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Master Profile
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            {profile
              ? "Your profile is ready. Add more details for better resumes."
              : "Create your profile to start generating resumes."}
          </p>
          <div className="flex space-x-3">
            <Link
              to="/profile"
              className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors"
            >
              {profile ? "Edit Profile" : "Create Profile"}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Generate Resume Card */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2">Generate Resume</h2>
          <p className="text-blue-100 text-sm mb-4">
            Paste a job description and let AI create a tailored resume.
          </p>
          <div className="flex space-x-2">
            <Link
              to="/resume/new"
              className="inline-flex items-center bg-white text-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Resume
            </Link>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-400 transition-colors text-sm border border-blue-400"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your Resumes</h2>
          <p className="text-4xl font-bold text-purple-600 mb-2">
            {resumes.length}
          </p>
          <p className="text-gray-600 text-sm">
            {resumes.length === 0
              ? "No resumes yet"
              : resumes.length === 1
                ? "resume generated"
                : "resumes generated"}
          </p>
        </div>
      </div>

      {/* Recent Resumes */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Resumes</h2>
          {resumes.length > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="text-gray-600 font-medium text-sm hover:text-blue-600 flex items-center px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
              >
                <Upload className="w-4 h-4 mr-1" />
                Import
              </button>
              <Link
                to="/resume/new"
                className="text-blue-600 font-medium text-sm hover:text-blue-700 flex items-center px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Resume
              </Link>
            </div>
          )}
        </div>

        {resumes.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No resumes yet
            </h3>
            <p className="text-gray-600 mb-6">
              Generate your first resume by pasting a job description.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center bg-white text-gray-700 border border-gray-300 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-5 h-5 mr-2" />
                Import Resume
              </button>
              <Link
                to="/resume/new"
                className="inline-flex items-center bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate First Resume
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {resume.targetRole || resume.name}
                    </h3>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDate(resume.createdAt)}
                      </span>
                      {resume.atsScore && (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          ATS Score: {resume.atsScore}%
                        </span>
                      )}
                      {resume.content?.modelUsed && (
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-indigo-100">
                          {resume.content.modelUsed
                            .replace("models/", "")
                            .replace(/-/g, " ")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/resume/${resume.id}`}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View"
                  >
                    <Download className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDeleteResume(resume.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Getting Started Guide (show only if no profile) */}
      {!profile && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            🚀 Getting Started
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Create Profile</h3>
                <p className="text-sm text-gray-600">
                  Import your existing resume or fill in details manually
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Paste Job Description
                </h3>
                <p className="text-sm text-gray-600">
                  Let AI analyze and match your content
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Download Resume</h3>
                <p className="text-sm text-gray-600">
                  Export as PDF or DOCX and apply!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
