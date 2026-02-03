import { useState, useEffect, useRef } from "react";
import { api } from "../api/client";
import {
  User,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Folder,
  Plus,
  Trash2,
  Save,
  Upload,
  Download,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

interface Experience {
  id?: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

interface Education {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

interface Skill {
  id?: string;
  name: string;
  category: string;
}

interface Project {
  id?: string;
  name: string;
  description: string;
  link: string;
  technologies: string;
}

interface Certification {
  id?: string;
  name: string;
  issuer: string;
  date: string;
  link: string;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  summary: string;
}

const INITIAL_PROFILE: ProfileData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  portfolio: "",
  summary: "",
};

const INITIAL_EXPERIENCE: Experience = {
  company: "",
  role: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  bullets: [""],
};

const INITIAL_EDUCATION: Education = {
  institution: "",
  degree: "",
  field: "",
  location: "",
  startDate: "",
  endDate: "",
  gpa: "",
};

const INITIAL_PROJECT: Project = {
  name: "",
  description: "",
  link: "",
  technologies: "",
};

const INITIAL_CERTIFICATION: Certification = {
  name: "",
  issuer: "",
  date: "",
  link: "",
};

function ProfileEdit() {
  const [activeTab, setActiveTab] = useState<
    | "personal"
    | "experience"
    | "education"
    | "skills"
    | "projects"
    | "certifications"
  >("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<ProfileData>(INITIAL_PROFILE);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [expandedExp, setExpandedExp] = useState<number | null>(null);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [expandedCert, setExpandedCert] = useState<number | null>(null);

  // Resume upload states
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resume upload handler
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      setShowPreview(true);
      toast.success("Resume parsed successfully! Review and confirm.");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to parse resume");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Apply parsed resume data
  const applyParsedData = async () => {
    if (!parsedData) return;

    try {
      await api.post("/profile/import-from-resume", parsedData);
      toast.success("Profile updated from resume!");
      setShowPreview(false);
      setParsedData(null);
      fetchProfile(); // Reload the form
    } catch (error) {
      toast.error("Failed to apply resume data");
    }
  };

  // Cancel parsed data
  const cancelParsedData = () => {
    setShowPreview(false);
    setParsedData(null);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/profile");
      const data = response.data.profile;

      if (data) {
        setProfile({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          location: data.location || "",
          linkedin: data.linkedin || "",
          github: data.github || "",
          portfolio: data.portfolio || "",
          summary: data.summary || "",
        });
        setExperiences(
          (data.experiences || []).map((exp: any) => ({
            ...exp,
            location: exp.location || "",
            endDate: exp.endDate || "",
          })),
        );
        setEducation(
          (data.education || []).map((edu: any) => ({
            ...edu,
            location: edu.location || "",
            startDate: edu.startDate || "",
            endDate: edu.endDate || "",
            gpa: edu.gpa || "",
          })),
        );
        setSkills(data.skills || []);
        setProjects(
          (data.projects || []).map((p: any) => ({
            ...p,
            description: p.description || "",
            technologies: p.technologies || "",
            link: p.link || "",
          })),
        );
        setCertifications(
          (data.certifications || []).map((c: any) => ({
            ...c,
            date: c.date || "",
            link: c.link || "",
          })),
        );
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.post("/profile", profile);
      toast.success("Profile saved!");
    } catch (error) {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const addExperience = () => {
    setExperiences([...experiences, { ...INITIAL_EXPERIENCE }]);
    setExpandedExp(experiences.length);
  };

  const updateExperience = (
    index: number,
    field: keyof Experience,
    value: any,
  ) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const updateBullet = (
    expIndex: number,
    bulletIndex: number,
    value: string,
  ) => {
    const updated = [...experiences];
    updated[expIndex].bullets[bulletIndex] = value;
    setExperiences(updated);
  };

  const addBullet = (expIndex: number) => {
    const updated = [...experiences];
    updated[expIndex].bullets.push("");
    setExperiences(updated);
  };

  const removeBullet = (expIndex: number, bulletIndex: number) => {
    const updated = [...experiences];
    updated[expIndex].bullets.splice(bulletIndex, 1);
    setExperiences(updated);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const saveExperiences = async () => {
    setSaving(true);
    try {
      // First ensure profile exists
      await api.post("/profile", profile);

      // Then import all data including experiences
      await api.post("/profile/import", {
        ...profile,
        experiences: experiences,
        education: education,
        skills: skills,
        projects: projects,
        certifications: certifications,
      });
      toast.success("Experiences saved!");
    } catch (error) {
      toast.error("Failed to save experiences");
    } finally {
      setSaving(false);
    }
  };

  const addEducation = () => {
    setEducation([...education, { ...INITIAL_EDUCATION }]);
  };

  const updateEducation = (
    index: number,
    field: keyof Education,
    value: string,
  ) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const saveEducation = async () => {
    setSaving(true);
    try {
      await api.post("/profile/import", {
        ...profile,
        experiences: experiences,
        education: education,
        skills: skills,
        projects: projects,
        certifications: certifications,
      });
      toast.success("Education saved!");
    } catch (error) {
      toast.error("Failed to save education");
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setSkills([...skills, { name: newSkill.trim(), category: "technical" }]);
    setNewSkill("");
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const saveSkills = async () => {
    setSaving(true);
    try {
      await api.post("/profile/skills/bulk", { skills });
      toast.success("Skills saved!");
    } catch (error) {
      toast.error("Failed to save skills");
    } finally {
      setSaving(false);
    }
  };

  // --- Projects Helpers ---
  const addProject = () => {
    setProjects([...projects, { ...INITIAL_PROJECT }]);
    setExpandedProject(projects.length);
  };

  const updateProject = (
    index: number,
    field: keyof Project,
    value: string,
  ) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const saveProjects = async () => {
    setSaving(true);
    try {
      await api.post("/profile/import", {
        ...profile,
        experiences,
        education,
        skills,
        projects,
        certifications,
      });
      toast.success("Projects saved!");
    } catch (error) {
      toast.error("Failed to save projects");
    } finally {
      setSaving(false);
    }
  };

  // --- Certifications Helpers ---
  const addCertification = () => {
    setCertifications([...certifications, { ...INITIAL_CERTIFICATION }]);
    setExpandedCert(certifications.length);
  };

  const updateCertification = (
    index: number,
    field: keyof Certification,
    value: string,
  ) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const saveCertifications = async () => {
    setSaving(true);
    try {
      await api.post("/profile/import", {
        ...profile,
        experiences,
        education,
        skills,
        projects,
        certifications,
      });
      toast.success("Certifications saved!");
    } catch (error) {
      toast.error("Failed to save certifications");
    } finally {
      setSaving(false);
    }
  };

  const exportProfile = async () => {
    try {
      const response = await api.get("/profile/export");
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "profile.json";
      a.click();
      toast.success("Profile exported!");
    } catch (error) {
      toast.error("Failed to export profile");
    }
  };

  const importProfile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          await api.post("/profile/import", data);
          toast.success("Profile imported!");
          fetchProfile();
        } catch (error) {
          toast.error("Failed to import profile");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "projects", label: "Projects", icon: Folder },
    { id: "certifications", label: "Certifications", icon: Award },
    { id: "skills", label: "Skills", icon: Code },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Resume Upload Preview Modal */}
      {showPreview && parsedData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Sparkles className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Resume Parsed Successfully!
                    </h2>
                    <p className="text-sm text-gray-600">
                      Review the extracted information
                    </p>
                  </div>
                </div>
                <button
                  onClick={cancelParsedData}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Personal Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2" /> Personal Info
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>{" "}
                    {parsedData.firstName} {parsedData.lastName}
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>{" "}
                    {parsedData.email}
                  </div>
                  {parsedData.phone && (
                    <div>
                      <span className="text-gray-500">Phone:</span>{" "}
                      {parsedData.phone}
                    </div>
                  )}
                  {parsedData.location && (
                    <div>
                      <span className="text-gray-500">Location:</span>{" "}
                      {parsedData.location}
                    </div>
                  )}
                </div>
              </div>

              {/* Experiences */}
              {parsedData.experiences?.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Briefcase className="w-4 h-4 mr-2" />{" "}
                    {parsedData.experiences.length} Experience(s)
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {parsedData.experiences
                      .slice(0, 3)
                      .map((exp: any, i: number) => (
                        <li key={i} className="text-gray-700">
                          <span className="font-medium">{exp.role}</span> at{" "}
                          {exp.company}
                          <span className="text-gray-500 ml-2">
                            ({exp.startDate} - {exp.endDate || "Present"})
                          </span>
                        </li>
                      ))}
                    {parsedData.experiences.length > 3 && (
                      <li className="text-gray-500">
                        ... and {parsedData.experiences.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Education */}
              {parsedData.education?.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <GraduationCap className="w-4 h-4 mr-2" />{" "}
                    {parsedData.education.length} Education
                  </h3>
                  <ul className="space-y-1 text-sm">
                    {parsedData.education.map((edu: any, i: number) => (
                      <li key={i} className="text-gray-700">
                        {edu.degree} in {edu.field} - {edu.institution}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Projects */}
              {parsedData.projects?.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Folder className="w-4 h-4 mr-2" />{" "}
                    {parsedData.projects.length} Projects
                  </h3>
                  <ul className="space-y-1 text-sm">
                    {parsedData.projects.map((proj: any, i: number) => (
                      <li key={i} className="text-gray-700">
                        <span className="font-medium">{proj.name}</span>
                        {proj.technologies && (
                          <span className="text-gray-500 text-xs ml-2">
                            ({proj.technologies})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Certifications */}
              {parsedData.certifications?.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Award className="w-4 h-4 mr-2" />{" "}
                    {parsedData.certifications.length} Certifications
                  </h3>
                  <ul className="space-y-1 text-sm">
                    {parsedData.certifications.map((cert: any, i: number) => (
                      <li key={i} className="text-gray-700">
                        {cert.name} - {cert.issuer}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills */}
              {parsedData.skills?.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Code className="w-4 h-4 mr-2" /> {parsedData.skills.length}{" "}
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {parsedData.skills
                      .slice(0, 15)
                      .map((skill: any, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                        >
                          {skill.name}
                        </span>
                      ))}
                    {parsedData.skills.length > 15 && (
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                        +{parsedData.skills.length - 15} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={cancelParsedData}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={applyParsedData}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Check className="w-5 h-5 mr-2" />
                Apply to Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleResumeUpload}
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Profile
          </h1>
          <p className="text-gray-600">
            Add your experiences, education, and skills
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Upload Resume Button - Primary Action */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Upload Resume
              </>
            )}
          </button>
          <button
            onClick={importProfile}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import JSON
          </button>
          <button
            onClick={exportProfile}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center px-4 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Personal Info Tab */}
          {activeTab === "personal" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) =>
                      setProfile({ ...profile, firstName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) =>
                      setProfile({ ...profile, lastName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="john.doe@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) =>
                    setProfile({ ...profile, location: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="San Francisco, CA"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={profile.linkedin}
                    onChange={(e) =>
                      setProfile({ ...profile, linkedin: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="linkedin.com/in/johndoe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={profile.github}
                    onChange={(e) =>
                      setProfile({ ...profile, github: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="github.com/johndoe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Summary
                </label>
                <textarea
                  value={profile.summary}
                  onChange={(e) =>
                    setProfile({ ...profile, summary: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  placeholder="A brief summary of your professional background and career goals..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be customized by AI for each job application
                </p>
              </div>

              <button
                onClick={saveProfile}
                disabled={saving}
                className="flex items-center justify-center w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                Save Personal Info
              </button>
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === "experience" && (
            <div className="space-y-6">
              {experiences.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    No experiences yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Add your work experience to get started
                  </p>
                </div>
              ) : (
                experiences.map((exp, expIndex) => (
                  <div
                    key={expIndex}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div
                      onClick={() =>
                        setExpandedExp(
                          expandedExp === expIndex ? null : expIndex,
                        )
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setExpandedExp(
                            expandedExp === expIndex ? null : expIndex,
                          );
                        }
                      }}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">
                          {exp.role || "New Experience"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {exp.company || "Company Name"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeExperience(expIndex);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {expandedExp === expIndex ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {expandedExp === expIndex && (
                      <div className="p-4 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Job Title *
                            </label>
                            <input
                              type="text"
                              value={exp.role}
                              onChange={(e) =>
                                updateExperience(
                                  expIndex,
                                  "role",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="Software Engineer"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Company *
                            </label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) =>
                                updateExperience(
                                  expIndex,
                                  "company",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="Tech Company"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Location
                            </label>
                            <input
                              type="text"
                              value={exp.location}
                              onChange={(e) =>
                                updateExperience(
                                  expIndex,
                                  "location",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="City, State"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Start Date
                            </label>
                            <input
                              type="text"
                              value={exp.startDate}
                              onChange={(e) =>
                                updateExperience(
                                  expIndex,
                                  "startDate",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="Jan 2022"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              End Date
                            </label>
                            <input
                              type="text"
                              value={exp.current ? "Present" : exp.endDate}
                              onChange={(e) =>
                                updateExperience(
                                  expIndex,
                                  "endDate",
                                  e.target.value,
                                )
                              }
                              disabled={exp.current}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
                              placeholder="Dec 2023"
                            />
                            <label className="flex items-center mt-2 text-sm text-gray-600">
                              <input
                                type="checkbox"
                                checked={exp.current}
                                onChange={(e) =>
                                  updateExperience(
                                    expIndex,
                                    "current",
                                    e.target.checked,
                                  )
                                }
                                className="mr-2"
                              />
                              Currently working here
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Achievements / Responsibilities
                          </label>
                          {exp.bullets.map((bullet, bulletIndex) => (
                            <div
                              key={bulletIndex}
                              className="flex items-start space-x-2 mb-2"
                            >
                              <span className="text-gray-400 mt-2">•</span>
                              <textarea
                                value={bullet}
                                onChange={(e) =>
                                  updateBullet(
                                    expIndex,
                                    bulletIndex,
                                    e.target.value,
                                  )
                                }
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                rows={2}
                                placeholder="Describe your achievement with quantifiable results..."
                              />
                              <button
                                onClick={() =>
                                  removeBullet(expIndex, bulletIndex)
                                }
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addBullet(expIndex)}
                            className="flex items-center text-blue-600 text-sm font-medium hover:text-blue-700"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Bullet Point
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}

              <button
                onClick={addExperience}
                className="flex items-center justify-center w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Experience
              </button>

              <button
                onClick={saveExperiences}
                disabled={saving}
                className="flex items-center justify-center w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                Save All Experiences
              </button>
            </div>
          )}

          {/* Education Tab */}
          {activeTab === "education" && (
            <div className="space-y-6">
              {education.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    No education yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Add your educational background
                  </p>
                </div>
              ) : (
                education.map((edu, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900">
                        Education {index + 1}
                      </h3>
                      <button
                        onClick={() => removeEducation(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Institution *
                        </label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) =>
                            updateEducation(
                              index,
                              "institution",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="University Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Degree *
                        </label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) =>
                            updateEducation(index, "degree", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Bachelor of Science"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Field of Study *
                        </label>
                        <input
                          type="text"
                          value={edu.field}
                          onChange={(e) =>
                            updateEducation(index, "field", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Computer Science"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          GPA (optional)
                        </label>
                        <input
                          type="text"
                          value={edu.gpa}
                          onChange={(e) =>
                            updateEducation(index, "gpa", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="3.8"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Graduation Year
                        </label>
                        <input
                          type="text"
                          value={edu.endDate}
                          onChange={(e) =>
                            updateEducation(index, "endDate", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="2020"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <input
                          type="text"
                          value={edu.location}
                          onChange={(e) =>
                            updateEducation(index, "location", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="City, State"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}

              <button
                onClick={addEducation}
                className="flex items-center justify-center w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Education
              </button>

              <button
                onClick={saveEducation}
                disabled={saving}
                className="flex items-center justify-center w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                Save Education
              </button>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <Folder className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    No projects yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Add your key projects to showcase your work
                  </p>
                </div>
              ) : (
                projects.map((proj, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div
                      onClick={() =>
                        setExpandedProject(
                          expandedProject === index ? null : index,
                        )
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setExpandedProject(
                            expandedProject === index ? null : index,
                          );
                        }
                      }}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">
                          {proj.name || "New Project"}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeProject(index);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {expandedProject === index ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {expandedProject === index && (
                      <div className="p-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project Name *
                          </label>
                          <input
                            type="text"
                            value={proj.name}
                            onChange={(e) =>
                              updateProject(index, "name", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="Project Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Project Link
                          </label>
                          <input
                            type="text"
                            value={proj.link}
                            onChange={(e) =>
                              updateProject(index, "link", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="https://github.com/..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Technologies
                          </label>
                          <input
                            type="text"
                            value={proj.technologies}
                            onChange={(e) =>
                              updateProject(
                                index,
                                "technologies",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="React, Node.js, TypeScript"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={proj.description}
                            onChange={(e) =>
                              updateProject(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            rows={3}
                            placeholder="Describe what you built and your role..."
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}

              <button
                onClick={addProject}
                className="flex items-center justify-center w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Project
              </button>

              <button
                onClick={saveProjects}
                disabled={saving}
                className="flex items-center justify-center w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                Save Projects
              </button>
            </div>
          )}

          {/* Certifications Tab */}
          {activeTab === "certifications" && (
            <div className="space-y-6">
              {certifications.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    No certifications yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Add your certifications and licenses
                  </p>
                </div>
              ) : (
                certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <div
                      onClick={() =>
                        setExpandedCert(expandedCert === index ? null : index)
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setExpandedCert(
                            expandedCert === index ? null : index,
                          );
                        }
                      }}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900">
                          {cert.name || "New Certification"}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCertification(index);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {expandedCert === index ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {expandedCert === index && (
                      <div className="p-4 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Name *
                            </label>
                            <input
                              type="text"
                              value={cert.name}
                              onChange={(e) =>
                                updateCertification(
                                  index,
                                  "name",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="Cert Name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Issuer *
                            </label>
                            <input
                              type="text"
                              value={cert.issuer}
                              onChange={(e) =>
                                updateCertification(
                                  index,
                                  "issuer",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="Issuer Organization"
                            />
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Date
                            </label>
                            <input
                              type="text"
                              value={cert.date}
                              onChange={(e) =>
                                updateCertification(
                                  index,
                                  "date",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="Jan 2023"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Link
                            </label>
                            <input
                              type="text"
                              value={cert.link}
                              onChange={(e) =>
                                updateCertification(
                                  index,
                                  "link",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="Verification URL"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}

              <button
                onClick={addCertification}
                className="flex items-center justify-center w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Certification
              </button>

              <button
                onClick={saveCertifications}
                disabled={saving}
                className="flex items-center justify-center w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                Save Certifications
              </button>
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === "skills" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Skills
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSkill()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter a skill (e.g., JavaScript, Python, React)"
                  />
                  <button
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Press Enter or click + to add
                </p>
              </div>

              {skills.length === 0 ? (
                <div className="text-center py-12">
                  <Code className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    No skills yet
                  </h3>
                  <p className="text-gray-600">
                    Add your technical and soft skills
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
                    >
                      {skill.name}
                      <button
                        onClick={() => removeSkill(index)}
                        className="ml-2 text-blue-600 hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={saveSkills}
                disabled={saving}
                className="flex items-center justify-center w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                Save Skills
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileEdit;
