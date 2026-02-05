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
      if (format === "pdf") {
        // PDF: Use print dialog
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
          toast.error("Popup blocked. Please allow popups to export PDF.");
          return;
        }

        const html = `<!DOCTYPE html><html><head><meta charset="utf-8" />
          <style>
            @page { size: A4; margin: 0.5in; }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            body { margin: 0; padding: 0; }
            .resume-preview { box-shadow: none !important; border: none !important; }
          </style>
        </head><body>${exportElement.innerHTML}</body></html>`;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();

        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
          setTimeout(() => printWindow.close(), 1000);
        };

        toast.success("Opened print dialog");
        return;
      }

      // DOCX: Send HTML to backend
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8" />
        <style>
          @page { size: A4; margin: 0.5in; }
          body { margin: 0; padding: 0; }
        </style>
      </head><body>${exportElement.innerHTML}</body></html>`;

      const response = await api.post(
        `/resumes/${id}/export/docx-html`,
        { html },
        { responseType: "blob" },
      );

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

      toast.success("Downloaded DOCX");
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`${format.toUpperCase()} export failed`);
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

                  {/* Score Breakdown */}
                  {resume.content.atsScoreBreakdown && (
                    <div className="mt-4 text-xs space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Keywords:</span>
                        <span className="font-semibold">
                          {resume.content.atsScoreBreakdown.keywordMatch}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Skills:</span>
                        <span className="font-semibold">
                          {resume.content.atsScoreBreakdown.skillsMatch}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Formatting:</span>
                        <span className="font-semibold">
                          {resume.content.atsScoreBreakdown.formatting}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Export Buttons */}
                <div className="space-y-3 mb-6 border-t border-gray-200 pt-6">
                  <button
                    onClick={() => handleExport("pdf")}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download as PDF
                  </button>
                  <button
                    onClick={() => handleExport("docx")}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Download as DOCX
                  </button>
                </div>

                {/* Regenerate Button */}
                {resume.jobDescription && (
                  <button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${regenerating ? "animate-spin" : ""}`}
                    />
                    Regenerate
                  </button>
                )}

                {/* Template Selector */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <TemplateSelector
                    selectedTemplate={selectedTemplate}
                    onSelectTemplate={setSelectedTemplate}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Main Content */}
          <div className="flex-1">
            {/* Keyword Analysis - Top */}
            {resume.content.keywordAnalysis && (
              <div className="mb-8">
                <KeywordAnalysisPanel
                  analysis={resume.content.keywordAnalysis}
                />
              </div>
            )}

            {/* Preview */}
            <div className="bg-gray-100 rounded-xl p-8 flex justify-center mb-8">
              <ResumePreview
                resume={resume.content}
                template={selectedTemplate}
              />
            </div>

            {/* ATS Checklist - Bottom */}
            {atsReport && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <ATSChecklist items={atsReport.checks} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeView;
