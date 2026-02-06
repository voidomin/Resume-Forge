import React from "react";
import { Check } from "lucide-react";

export type TemplateType = "modern" | "executive" | "minimalist" | "standard";

interface TemplateOption {
  id: TemplateType;
  name: string;
  description: string;
  color: string;
  preview: string; // CSS class for preview
}

const templates: TemplateOption[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean, sans-serif, blue accents. Best for Tech & Startups.",
    color: "bg-blue-500",
    preview: "font-sans",
  },
  {
    id: "standard",
    name: "Standard",
    description: "Classic serif, highly readable. Top Employer favorite.",
    color: "bg-white border text-black",
    preview: "font-serif",
  },
  {
    id: "executive",
    name: "Executive",
    description: "Traditional serif, centered headers. Best for Finance & Law.",
    color: "bg-gray-800",
    preview: "font-serif",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description:
      "Stark black & white, spacious. Best for Design & Architecture.",
    color: "bg-white border-2 border-black",
    preview: "font-sans",
  },
];

interface TemplateSelectorProps {
  selectedTemplate: TemplateType;
  onSelect: (template: TemplateType) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-1 gap-3">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template.id)}
          className={`relative group p-4 rounded-xl border-2 text-left transition-all duration-200 ${
            selectedTemplate === template.id
              ? "border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600"
              : "border-gray-200 hover:border-blue-300 hover:shadow-sm bg-white"
          }`}
        >
          {/* Selected Badge */}
          {selectedTemplate === template.id && (
            <div className="absolute top-2 right-2 p-1 bg-blue-600 rounded-full text-white shadow-sm">
              <Check className="w-3 h-3" />
            </div>
          )}

          {/* Icon/Preview */}
          <div className="mb-3 flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg shadow-sm ${template.color} ${template.id === "minimalist" ? "text-black" : "text-white"}`}
            />
            <span className="font-semibold text-gray-900">{template.name}</span>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            {template.description}
          </p>
        </button>
      ))}
    </div>
  );
};

export default TemplateSelector;
