import { GeneratedResume } from "../../types/resume";
import { StandardTemplate } from "./templates/StandardTemplate";
import { ModernTemplate } from "./templates/ModernTemplate";
import { ExecutiveTemplate } from "./templates/ExecutiveTemplate";
import { MinimalistTemplate } from "./templates/MinimalistTemplate";

interface ResumePreviewProps {
  resume: GeneratedResume;
  template?: "modern" | "executive" | "minimalist" | "standard";
}

function ResumePreview({ resume, template = "modern" }: ResumePreviewProps) {
  const renderTemplate = () => {
    switch (template) {
      case "standard":
        return <StandardTemplate resume={resume} />;
      case "executive":
        return <ExecutiveTemplate resume={resume} />;
      case "minimalist":
        return <MinimalistTemplate resume={resume} />;
      case "modern":
      default:
        return <ModernTemplate resume={resume} />;
    }
  };

  return (
    <div
      className="resume-preview bg-white"
      id="resume-preview-export"
      style={{
        width: "8.27in", // A4 width
        height: "11.69in", // A4 height
        padding: "0.5in", // Match PDF/DOCX margins
        overflow: "hidden", // Still hidden, but we should show a warning overlay if needed
        position: "relative", // For overlay
        boxSizing: "border-box",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        border: "1px solid #e0e0e0",
      }}
    >
      {renderTemplate()}
    </div>
  );
}

export default ResumePreview;
