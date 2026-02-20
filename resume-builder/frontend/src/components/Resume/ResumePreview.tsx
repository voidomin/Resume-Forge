import { useRef, useLayoutEffect, useState } from "react";
import { GeneratedResume } from "../../types/resume";
import { StandardTemplate } from "./templates/StandardTemplate";
import { ModernTemplate } from "./templates/ModernTemplate";
import { ExecutiveTemplate } from "./templates/ExecutiveTemplate";
import { MinimalistTemplate } from "./templates/MinimalistTemplate";

type DensityLevel = "normal" | "compact" | "ultra-compact";

interface ResumePreviewProps {
  resume: GeneratedResume;
  template?: "modern" | "executive" | "minimalist" | "standard";
  density?: DensityLevel;
}

function ResumePreview({
  resume,
  template = "modern",
  density = "normal",
}: ResumePreviewProps) {
  // Calculate density-based CSS scaling multipliers
  const densityScaling = {
    normal: {
      fontSize: 1.0,
      lineHeight: 1.0,
      margin: 1.0,
      padding: 1.0,
    },
    compact: {
      fontSize: 0.9,
      lineHeight: 0.8,
      margin: 0.67,
      padding: 0.67,
    },
    "ultra-compact": {
      fontSize: 0.8,
      lineHeight: 0.6,
      margin: 0.56,
      padding: 0.56,
    },
  };

  const scaling = densityScaling[density];

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
    const paddingPx = 96 * 0.5 * scaling.padding;
    const usableHeight = Math.max(1, targetHeight - paddingPx * 2);
    const usableWidth = Math.max(1, targetWidth - paddingPx * 2);

    // We need to measure the ACTUAL content height
    // Since overflow is hidden on the container, we check the child's height
    const content = container.firstElementChild as HTMLElement;
    if (!content) return;

    const contentHeight = content.scrollHeight;
    const contentWidth = content.scrollWidth;

    const scaleH = usableHeight / contentHeight;
    const scaleW = usableWidth / contentWidth;
    const desiredScale = Math.min(scaleH, scaleW);
    const maxScale = 1.12;
    const nextScale = Math.min(maxScale, desiredScale);
    setScale(nextScale);
  }, [resume, template, density]);

  return (
    <div
      ref={containerRef}
      className="resume-preview bg-white"
      id="resume-preview-export"
      style={{
        width: "8.27in", // A4 width
        height: "11.69in", // A4 height
        padding: `${0.5 * scaling.padding}in`, // Scale margins based on density
        overflow: "hidden",
        position: "relative",
        boxSizing: "border-box",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        border: "1px solid #e0e0e0",
      }}
    >
      <div
        style={
          {
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: scale === 1 ? "100%" : `${100 / scale}%`,
            fontSize: `${scaling.fontSize * 100}%`,
            lineHeight: scaling.lineHeight,
            "--margin-multiplier": scaling.margin,
            "--padding-multiplier": scaling.padding,
          } as React.CSSProperties & {
            "--margin-multiplier": number;
            "--padding-multiplier": number;
          }
        }
      >
        {renderTemplate()}
      </div>
    </div>
  );
}

export default ResumePreview;
