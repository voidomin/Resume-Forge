import { useRef, useLayoutEffect, useState } from "react";
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

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // A4 height in pixels (approximate based on 96 DPI)
    // 11.69in * 96px = 1122.24px
    const targetHeight = 1122;
    const targetWidth = 794; // 8.27in * 96px

    // We need to measure the ACTUAL content height
    // Since overflow is hidden on the container, we check the child's height
    const content = container.firstElementChild as HTMLElement;
    if (!content) return;

    const contentHeight = content.scrollHeight;
    const contentWidth = content.scrollWidth;

    if (contentHeight > targetHeight || contentWidth > targetWidth) {
      const scaleH = targetHeight / contentHeight;
      const scaleW = targetWidth / contentWidth;
      const minScale = Math.min(scaleH, scaleW, 1);

      // Only scale down if necessary
      if (minScale < 1) {
        setScale(minScale);
      } else {
        setScale(1);
      }
    } else {
      setScale(1);
    }
  }, [resume, template]);

  return (
    <div
      ref={containerRef}
      className="resume-preview bg-white"
      id="resume-preview-export"
      style={{
        width: "8.27in", // A4 width
        height: "11.69in", // A4 height
        padding: "0.5in", // Match PDF/DOCX margins
        overflow: "hidden",
        position: "relative",
        boxSizing: "border-box",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        border: "1px solid #e0e0e0",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: scale === 1 ? "100%" : `${100 / scale}%`,
        }}
      >
        {renderTemplate()}
      </div>
    </div>
  );
}

export default ResumePreview;
