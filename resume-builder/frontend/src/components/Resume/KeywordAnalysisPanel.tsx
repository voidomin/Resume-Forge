import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface MatchedKeyword {
  keyword: string;
  locations: string[];
}

interface KeywordAnalysis {
  matchedKeywords: MatchedKeyword[];
  missingKeywords: string[];
  totalJobKeywords: number;
  matchPercentage: number;
}

interface KeywordAnalysisPanelProps {
  keywordAnalysis: KeywordAnalysis | null | undefined;
}

const formatLocation = (location: string): string => {
  // Convert technical paths to readable format
  // e.g., "experience.0.bullets.1" -> "Experience #1, Bullet 2"
  const parts = location.split(".");

  if (parts[0] === "summary") return "Summary";
  if (parts[0] === "skills") return "Skills";
  if (parts[0] === "projects") {
    const projNum = parseInt(parts[1] || "0") + 1;
    return `Project #${projNum}`;
  }
  if (parts[0] === "certifications") {
    const certNum = parseInt(parts[1] || "0") + 1;
    return `Certification #${certNum}`;
  }
  if (parts[0] === "experience") {
    const expNum = parseInt(parts[1] || "0") + 1;
    if (parts[2] === "bullets") {
      const bulletNum = parseInt(parts[3] || "0") + 1;
      return `Experience #${expNum}, Bullet ${bulletNum}`;
    }
    return `Experience #${expNum}`;
  }
  if (parts[0] === "education") {
    const eduNum = parseInt(parts[1] || "0") + 1;
    return `Education #${eduNum}`;
  }

  return location;
};

export const KeywordAnalysisPanel: React.FC<KeywordAnalysisPanelProps> = ({
  keywordAnalysis,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hoveredKeyword, setHoveredKeyword] = useState<string | null>(null);

  if (!keywordAnalysis) {
    return null;
  }

  const {
    matchedKeywords,
    missingKeywords,
    totalJobKeywords,
    matchPercentage,
  } = keywordAnalysis;

  // Calculate progress bar color based on percentage
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 70) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-800">Keyword Analysis</h3>
            <p className="text-sm text-gray-500">
              {matchedKeywords.length}/{totalJobKeywords} keywords matched
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-lg font-bold ${
              matchPercentage >= 70
                ? "text-green-600"
                : matchPercentage >= 50
                  ? "text-yellow-600"
                  : "text-red-600"
            }`}
          >
            {matchPercentage}%
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(matchPercentage)}`}
                style={{ width: `${matchPercentage}%` }}
              />
            </div>
          </div>

          {/* Matched Keywords */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700">
                Matched Keywords ({matchedKeywords.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {matchedKeywords.map((item, index) => (
                <div
                  key={index}
                  className="relative"
                  onMouseEnter={() => setHoveredKeyword(item.keyword)}
                  onMouseLeave={() => setHoveredKeyword(null)}
                >
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 cursor-pointer hover:bg-green-200 transition-colors">
                    {item.keyword}
                  </span>

                  {/* Tooltip showing locations */}
                  {hoveredKeyword === item.keyword &&
                    item.locations.length > 0 && (
                      <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
                        <div className="font-semibold mb-1">Found in:</div>
                        {item.locations.map((loc, i) => (
                          <div key={i} className="text-gray-300">
                            • {formatLocation(loc)}
                          </div>
                        ))}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800" />
                      </div>
                    )}
                </div>
              ))}
              {matchedKeywords.length === 0 && (
                <span className="text-sm text-gray-400 italic">
                  No keywords matched
                </span>
              )}
            </div>
          </div>

          {/* Missing Keywords */}
          {missingKeywords.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-gray-700">
                  Missing Keywords ({missingKeywords.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {missingKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                  >
                    {keyword}
                  </span>
                ))}
              </div>

              {/* Suggestion */}
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  💡 <strong>Tip:</strong> Consider adding these keywords to
                  your profile (in skills, experience bullets, or projects) to
                  improve your ATS score.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KeywordAnalysisPanel;
