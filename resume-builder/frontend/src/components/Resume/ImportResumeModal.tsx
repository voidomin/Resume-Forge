import React, { useRef, useState } from "react";
import { Upload, X, Loader2, Check, AlertCircle } from "lucide-react";
import { api } from "../../api/client";
import toast from "react-hot-toast";

interface ImportResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportResumeModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportResumeModalProps) {
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF or Word document");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/profile/upload-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setParsedData(response.data.profile);
      toast.success("Resume parsed successfully!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.error || "Failed to parse resume");
      setParsedData(null);
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = async () => {
    if (!parsedData) return;

    try {
      await api.post("/profile/import-from-resume", parsedData);
      toast.success("Profile updated from resume!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to apply resume data");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Import Resume</h2>
            <p className="text-sm text-gray-500">
              Upload your existing resume to auto-fill your profile
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {!parsedData ? (
            // Upload State
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400 bg-gray-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-blue-600" />
                )}
              </div>

              {uploading ? (
                <>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Analyzing Resume...
                  </h3>
                  <p className="text-sm text-gray-500">
                    This uses AI to extract your details. It may take a moment.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Click to upload or drag & drop
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    PDF or DOCX (Max 5MB)
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Select File
                  </button>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleChange}
              />
            </div>
          ) : (
            // Review State
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                <Check className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900">
                    Resume Parsed Successfully
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    We found the following information:
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2 max-h-60 overflow-y-auto border border-gray-200">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-500">Name:</div>
                  <div className="font-medium text-gray-900">
                    {parsedData.firstName} {parsedData.lastName}
                  </div>

                  <div className="text-gray-500">Email:</div>
                  <div className="font-medium text-gray-900">
                    {parsedData.email}
                  </div>

                  <div className="text-gray-500">Experience:</div>
                  <div className="font-medium text-gray-900">
                    {parsedData.experiences?.length || 0} roles
                  </div>

                  <div className="text-gray-500">Education:</div>
                  <div className="font-medium text-gray-900">
                    {parsedData.education?.length || 0} entries
                  </div>

                  <div className="text-gray-500">Skills:</div>
                  <div className="font-medium text-gray-900">
                    {parsedData.skills?.length || 0} skills
                  </div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <p>Importing will overwrite your existing profile data.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {parsedData && (
          <div className="p-6 border-t border-gray-200 flex space-x-3 bg-gray-50">
            <button
              onClick={() => setParsedData(null)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-white transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Confirm Import
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
