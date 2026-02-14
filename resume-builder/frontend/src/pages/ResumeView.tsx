import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import {
  FileText,
  Loader2,
  ArrowLeft,
  Download,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import ResumePreview from "../components/Resume/ResumePreview";
import TemplateSelector, {
  TemplateType,
} from "../components/Resume/TemplateSelector";
import KeywordAnalysisPanel from "../components/Resume/KeywordAnalysisPanel";
import ATSChecklist from "../components/Resume/ATSChecklist";

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
  atsScoreBreakdown?: {
    keywordMatch: number;
    skillsMatch: number;
    formatting: number;
    missingKeywords: string[];
    explanation: string;
  };
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
  modelUsed?: string;
  generationMethod?: "ai" | "fallback";
  failureReason?: string;
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
  const [atsReport, setAtsReport] = useState<any>(null);

  useEffect(() => {
    fetchResume();
  }, [id]);

  const fetchResume = async () => {
    try {
      const response = await api.get(`/resumes/${id}`);
      setResume(response.data.resume);
      setAtsReport(response.data.atsReport || null);
    } catch (error) {
      toast.error("Failed to load resume");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "pdf" | "docx") => {
    if (!id) return;

    const exportElement = document.getElementById("resume-preview-export");
    if (!exportElement) {
      toast.error("Resume preview not found");
      return;
    }

    const fileBase =
      resume?.content.contactInfo.name.replace(/\s+/g, "_") || "Resume";

    try {
      const exportHtml = `<!DOCTYPE html><html><head><meta charset="utf-8" />
        <style>
          @page { size: A4; margin: 0.5in; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
          body { margin: 0; padding: 0; background: #fff; }
          .resume-preview { width: 8.27in; height: 11.69in; box-shadow: none !important; border: none !important; }
        </style>
      </head><body>${exportElement.innerHTML}</body></html>`;

      if (format === "pdf") {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
          toast.error("Popup blocked. Please allow popups to export PDF.");
          return;
        }

        printWindow.document.open();
        printWindow.document.write(exportHtml);
        printWindow.document.title = "";
        printWindow.document.close();

        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        };

        toast.success("Opened print dialog for PDF");
        return;
      }

      // Use structured DOCX endpoint
      const response = await api.get(`/resumes/${id}/export/docx`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileBase}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Downloaded as DOCX");
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
      setAtsReport(response.data.atsReport || null);
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
        {resume.content.modelUsed === "fallback-basic" && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 shadow-sm">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">
                AI Optimization Unavailable
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {resume.content.failureReason === "quota_exceeded"
                  ? "Daily AI quota reached. This version was generated using a basic template. Service resets at midnight PT. Try regenerating tomorrow for AI optimization."
                  : "This version was generated using a basic template without AI tailoring due to high service demand at the time of creation."}
              </p>
            </div>
          </div>
        )}
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

              {/* Refresh Button */}
              <button
                onClick={() => window.location.reload()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                title="Refresh the page"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </button>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-4">
                  {resume.targetRole || resume.name}
                </h2>

                <p className="text-sm text-gray-500 mb-4">
                  Created {new Date(resume.createdAt).toLocaleDateString()}
                </p>

                {/* ATS Score */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">ATS Score</span>
                    <span className="font-bold text-lg text-green-600">
                      {resume.content.atsScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${resume.content.atsScore}%` }}
                    />
                  </div>

                  {/* AI Model Badge */}
                  {resume.content.modelUsed && (
                    <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider">
                        AI:{" "}
                        {resume.content.modelUsed
                          .replace("models/", "")
                          .replace(/-/g, " ")}
                      </span>
                    </div>
                  )}

                  {/* Score Breakdown */}
                  {resume.content.atsScoreBreakdown && (
                    <div className="mt-4 text-xs space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Keywords:</span>
                        <span className="font-medium">
                          {resume.content.atsScoreBreakdown.keywordMatch}/40
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Skills:</span>
                        <span className="font-medium">
                          {resume.content.atsScoreBreakdown.skillsMatch}/30
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Experience:</span>
                        <span className="font-medium">
                          {resume.content.atsScoreBreakdown.formatting}/30
                        </span>
                      </div>

                      {resume.content.atsScoreBreakdown.missingKeywords &&
                        resume.content.atsScoreBreakdown.missingKeywords
                          .length > 0 && (
                          <div className="pt-2 border-t border-gray-200 mt-2">
                            <span className="block text-gray-500 mb-1">
                              Missing Keywords:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {resume.content.atsScoreBreakdown.missingKeywords
                                .slice(0, 3)
                                .map((k, i) => (
                                  <span
                                    key={i}
                                    className="px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-[10px]"
                                  >
                                    {k}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>

                {/* Keyword Analysis Panel */}
                {resume.content.keywordAnalysis && (
                  <div className="mb-6">
                    <KeywordAnalysisPanel
                      keywordAnalysis={resume.content.keywordAnalysis}
                    />
                  </div>
                )}

                {/* ATS Compatibility Checklist */}
                {atsReport && (
                  <div className="mb-6">
                    <ATSChecklist report={atsReport} />
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

                  {/* AI Model Badge (Secondary) */}
                  {resume.content.modelUsed && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-100 rounded-md w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">
                          Powered by{" "}
                          {resume.content.modelUsed
                            .replace("models/", "")
                            .replace(/-/g, " ")}
                        </span>
                      </div>
                    </div>
                  )}
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
