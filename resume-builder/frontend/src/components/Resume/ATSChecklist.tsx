import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Shield,
} from "lucide-react";

interface ATSCheckResult {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  details?: string;
}

interface ATSReport {
  overallScore: number;
  passedChecks: number;
  totalChecks: number;
  checks: ATSCheckResult[];
}

interface ATSChecklistProps {
  report: ATSReport;
}

export default function ATSChecklist({ report }: ATSChecklistProps) {
  const [expanded, setExpanded] = useState(true);
  const [expandedChecks, setExpandedChecks] = useState<string[]>([]);

  const toggleCheck = (id: string) => {
    setExpandedChecks((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const scoreColor =
    report.overallScore >= 80
      ? "text-green-600"
      : report.overallScore >= 60
        ? "text-yellow-600"
        : "text-red-600";

  const progressColor =
    report.overallScore >= 80
      ? "bg-green-500"
      : report.overallScore >= 60
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          <span className="font-medium text-gray-900">ATS Compatibility</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-bold text-lg ${scoreColor}`}>
            {report.overallScore}/100
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${progressColor}`}
              style={{ width: `${report.overallScore}%` }}
            />
          </div>

          {/* Summary */}
          <p className="text-sm text-gray-500">
            {report.passedChecks}/{report.totalChecks} checks passed
          </p>

          {/* Checks List */}
          <div className="space-y-2">
            {report.checks.map((check) => (
              <div
                key={check.id}
                className={`rounded-lg border ${
                  check.passed
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <button
                  onClick={() => toggleCheck(check.id)}
                  className="w-full px-3 py-2 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    {check.passed ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm ${
                        check.passed ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {check.name}
                    </span>
                  </div>
                  {check.details && (
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        expandedChecks.includes(check.id) ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {expandedChecks.includes(check.id) && check.details && (
                  <div className="px-3 pb-2 pl-9">
                    <p className="text-xs text-gray-600">{check.details}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
