import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import {
  FileText,
  Loader2,
  ArrowLeft,
  Download,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import ResumePreview from "../components/Resume/ResumePreview";
import TemplateSelector, {
  TemplateType,
} from "../components/Resume/TemplateSelector";
import KeywordAnalysisPanel from "../components/Resume/KeywordAnalysisPanel";

interface GeneratedResume {
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
  };
  summary: string;
  experiences: {
    company: string;
    role: string;
    location?: string;
    dateRange: string;
    bullets: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    dateRange: string;
    gpa?: string;
  }[];
  skills: string[];
  atsScore: number;
  keywords: string[];
  keywordAnalysis?: {
    matchedKeywords: {
      keyword: string;
      locations: string[];
    }[];
    missingKeywords: string[];
    totalJobKeywords: number;
    matchPercentage: number;
  };
}

interface Resume {
  id: string;
  name: string;
  targetRole?: string;
  jobDescription?: string;
  atsScore?: number;
  createdAt: string;
  content: GeneratedResume;
}

function ResumeView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateType>("modern");
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetchResume();
  }, [id]);

  const fetchResume = async () => {
    try {
      const response = await api.get(`/resumes/${id}`);
      setResume(response.data.resume);
    } catch (error) {
      toast.error("Failed to load resume");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "pdf" | "docx") => {
    if (!id) return;

    try {
      const response = await api.get(`/resumes/${id}/export/${format}`, {
        params: format === "pdf" ? { template: selectedTemplate } : undefined,
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type:
          format === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resume?.content.contactInfo.name.replace(/\s+/g, "_") || "Resume"}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Failed to download ${format.toUpperCase()}`);
    }
  };

  const handleRegenerate = async () => {
    if (!id || !resume?.jobDescription) return;

    setRegenerating(true);
    try {
      const response = await api.post(`/resumes/${id}/regenerate`, {
        jobDescription: resume.jobDescription,
      });
      setResume({
        ...resume,
        content: response.data.content,
      });
      toast.success("Resume regenerated!");
    } catch (error) {
      toast.error("Failed to regenerate resume");
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Resume not found
        </h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Controls */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Back Button */}
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </button>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-4">
                  {resume.targetRole || resume.name}
                </h2>

                <p className="text-sm text-gray-500 mb-4">
                  Created {new Date(resume.createdAt).toLocaleDateString()}
                </p>

                {/* ATS Score */}
                {resume.content.atsScore && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">ATS Score</span>
                      <span className="font-bold text-lg text-green-600">
                        {resume.content.atsScore}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${resume.content.atsScore}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Keyword Analysis Panel */}
                {resume.content.keywordAnalysis && (
                  <div className="mb-6">
                    <KeywordAnalysisPanel
                      keywordAnalysis={resume.content.keywordAnalysis}
                    />
                  </div>
                )}

                {/* Template Selector */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Choose Template
                  </h3>
                  <TemplateSelector
                    selectedTemplate={selectedTemplate}
                    onSelect={setSelectedTemplate}
                  />
                </div>

                {/* Export Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleExport("pdf")}
                    className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => handleExport("docx")}
                    className="w-full flex items-center justify-center px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Download DOCX
                  </button>
                </div>
              </div>

              {/* Regenerate */}
              {resume.jobDescription && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <h3 className="font-medium text-gray-900 mb-3">Actions</h3>
                  <button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="w-full flex items-center justify-center px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {regenerating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Regenerate
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Generate a new version with the same job description
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Preview */}
          <div className="flex-1 overflow-auto">
            <div className="bg-gray-100 rounded-xl p-8 flex justify-center">
              <ResumePreview
                resume={resume.content}
                template={selectedTemplate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeView;
