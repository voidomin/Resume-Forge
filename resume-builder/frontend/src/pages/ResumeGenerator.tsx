import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import {
  Sparkles,
  FileText,
  Loader2,
  ArrowRight,
  AlertCircle,
  CheckCircle,
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
  skillsCategories?: {
    [key: string]: string[];
  };
  projects?: {
    name: string;
    description?: string;
    bullets?: string[];
    technologies?: string;
    link?: string;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    date?: string;
  }[];
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

function ResumeGenerator() {
  const [step, setStep] = useState<"input" | "generating" | "preview">("input");
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateType>("modern");
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [generatedResume, setGeneratedResume] =
    useState<GeneratedResume | null>(null);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [atsReport, setAtsReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description");
      return;
    }

    setStep("generating");
    setError(null);

    try {
      const response = await api.post("/resumes/generate", {
        jobDescription,
        targetRole: targetRole || undefined,
      });

      setGeneratedResume(response.data.content);
      setResumeId(response.data.resume.id);
      setAtsReport(response.data.atsReport || null);
      setStep("preview");
      if (response.data.content.modelUsed === "fallback-basic") {
        toast.error("AI customization unavailable. Using basic template.", {
          duration: 5000,
          icon: "⚠️",
        });
      } else {
        toast.success("Resume generated successfully!");
      }
    } catch (err: any) {
      const message = err.response?.data?.error || "Failed to generate resume";
      setError(message);
      setStep("input");
      toast.error(message);
    }
  };

  const handleExport = async (format: "pdf" | "docx") => {
    if (!resumeId) return;

    try {
      const response = await api.get(`/resumes/${resumeId}/export/${format}`, {
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
      a.download = `Resume.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Failed to download ${format.toUpperCase()}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Step 1: Input */}
      {step === "input" && (
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Generate Your Resume
            </h1>
            <p className="text-gray-600">
              Paste a job description and our AI will create a tailored,
              ATS-optimized resume
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Role (optional)
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Senior Software Engineer"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be used to name your saved resume
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here...

Example:
We are looking for a Senior Software Engineer to join our team. 
You will be responsible for designing and implementing scalable systems...

Required Skills:
- 5+ years of experience with JavaScript/TypeScript
- Experience with React and Node.js
- Strong understanding of distributed systems
..."
                rows={15}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Include the complete job posting for best results
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!jobDescription.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5" />
              <span>Generate Resume with AI</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Tips */}
          <div className="mt-8 bg-blue-50 rounded-xl border border-blue-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              💡 Tips for Best Results
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  Include the complete job description, not just the
                  requirements
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  Make sure your profile has detailed experiences with
                  measurable achievements
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  Add all relevant skills to your profile for better keyword
                  matching
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  The AI will select the most relevant experiences for a
                  one-page resume
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Step 2: Generating */}
      {step === "generating" && (
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl mb-6 shadow-lg animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Generating Your Resume...
          </h2>
          <p className="text-gray-600 mb-8">
            Our AI is analyzing the job description and tailoring your resume
          </p>

          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>This may take 10-15 seconds</span>
          </div>

          <div className="mt-12 space-y-3">
            <div className="flex items-center justify-center space-x-3 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Analyzing job requirements</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-sm text-gray-600 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span>Matching your experiences</span>
            </div>
            <div className="flex items-center justify-center space-x-3 text-sm text-gray-400">
              <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
              <span>Generating optimized content</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === "preview" && generatedResume && (
        <div className="max-w-7xl mx-auto">
          {generatedResume.modelUsed === "fallback-basic" && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">
                  AI Optimization Unavailable
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {generatedResume.failureReason === "quota_exceeded" 
                    ? "Daily AI quota reached. This version uses a basic template. Service resets at midnight PT. Try regenerating tomorrow for AI optimization."
                    : "Due to high demand, we've generated a clean, readable resume using your profile data without AI tailoring. Try regenerating in a few minutes for full optimization."}
                </p>
              </div>
            </div>
          )}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Controls */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <h2 className="font-bold text-gray-900 mb-4">
                    Resume Generated!
                  </h2>

                  {/* ATS Score */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">ATS Score</span>
                      <span className="font-bold text-lg text-green-600">
                        {generatedResume.atsScore}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${generatedResume.atsScore}%` }}
                      />
                    </div>

                    {/* AI Model Badge */}
                    {generatedResume.modelUsed && (
                      <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-semibold text-indigo-700 uppercase tracking-wider">
                          AI:{" "}
                          {generatedResume.modelUsed
                            .replace("models/", "")
                            .replace(/-/g, " ")}
                        </span>
                      </div>
                    )}

                    {/* Score Breakdown */}
                    {generatedResume.atsScoreBreakdown && (
                      <div className="mt-4 text-xs space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Keywords:</span>
                          <span className="font-medium">
                            {generatedResume.atsScoreBreakdown.keywordMatch}/40
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Skills:</span>
                          <span className="font-medium">
                            {generatedResume.atsScoreBreakdown.skillsMatch}/30
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Experience:</span>
                          <span className="font-medium">
                            {generatedResume.atsScoreBreakdown.formatting}/30
                          </span>
                        </div>

                        {generatedResume.atsScoreBreakdown.missingKeywords
                          ?.length > 0 && (
                          <div className="pt-2 border-t border-gray-200 mt-2">
                            <span className="block text-gray-500 mb-1">
                              Missing Keywords:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {generatedResume.atsScoreBreakdown.missingKeywords
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
                  {generatedResume.keywordAnalysis && (
                    <div className="mb-6">
                      <KeywordAnalysisPanel
                        keywordAnalysis={generatedResume.keywordAnalysis}
                      />
                    </div>
                  )}

                  {/* ATS Compatibility Checklist */}
                  {atsReport && (
                    <div className="mb-6">
                      <ATSChecklist report={atsReport} />
                    </div>
                  )}

                  {/* Fallback: Basic Matched Keywords (if no keywordAnalysis) */}
                  {!generatedResume.keywordAnalysis &&
                    generatedResume.keywords &&
                    generatedResume.keywords.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                          Matched Keywords
                        </h3>
                        <div className="flex flex-wrap gap-1">
                          {generatedResume.keywords
                            .slice(0, 8)
                            .map((keyword, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full"
                              >
                                {keyword}
                              </span>
                            ))}
                        </div>
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
                      <FileText className="w-5 h-5 mr-2" />
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

                {/* Actions */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setStep("input");
                        setJobDescription("");
                        setTargetRole("");
                        setGeneratedResume(null);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Generate Another Resume
                    </button>
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Preview */}
            <div className="flex-1 overflow-auto">
              <div className="bg-gray-100 rounded-xl p-8 flex justify-center">
                <ResumePreview
                  resume={generatedResume}
                  template={selectedTemplate}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeGenerator;
