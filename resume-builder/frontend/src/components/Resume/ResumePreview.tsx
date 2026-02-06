import { Fragment } from "react";
interface GeneratedResume {
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
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
  atsScore?: number;
  keywords?: string[];
}

interface ResumePreviewProps {
  resume: GeneratedResume;
  template?: "modern" | "executive" | "minimalist" | "standard";
}

function ResumePreview({ resume, template = "modern" }: ResumePreviewProps) {
  const getFontFamily = () => {
    switch (template) {
      case "standard":
        return '"Times New Roman", Times, serif';
      case "executive":
        return '"Times New Roman", Times, serif';
      case "minimalist":
      case "modern":
      default:
        return "Arial, Helvetica, sans-serif";
    }
  };

  const isExecutive = template === "executive";
  const isMinimalist = template === "minimalist";

  const formatUrl = (url: string) => {
    return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  };

  // Colors - blue accent for modern template
  const accentColor = template === "modern" ? "#2563eb" : "#000";
  const borderStyle = isMinimalist
    ? "none"
    : template === "standard"
      ? "1px solid #000"
      : `1px solid ${accentColor}`;
  const linkColor =
    template === "modern"
      ? "#2563eb"
      : template === "standard"
        ? "#0000EE"
        : "#000";

  const isValid = (val: string | undefined) =>
    val &&
    val.trim().toLowerCase() !== "n/a" &&
    val.trim().toLowerCase() !== "none";

  const renderContactItem = (
    label: string,
    value: string | undefined,
    isLink: boolean = false,
    href?: string,
  ) => {
    if (!isValid(value)) return null;
    return (
      <Fragment key={label}>
        {isLink ? (
          <a
            href={href || value}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: linkColor,
              textDecoration: label === "Email" ? "none" : "underline",
            }}
          >
            {label === "Email" || label === "Phone" ? value : formatUrl(value!)}
          </a>
        ) : (
          <span>{value}</span>
        )}
      </Fragment>
    );
  };

  const contactParts = [
    renderContactItem("Phone", resume.contactInfo.phone),
    renderContactItem(
      "Email",
      resume.contactInfo.email,
      true,
      `mailto:${resume.contactInfo.email}`,
    ),
    renderContactItem("LinkedIn", resume.contactInfo.linkedin, true),
    renderContactItem("GitHub", resume.contactInfo.github, true),
    renderContactItem("Portfolio", resume.contactInfo.portfolio, true),
  ].filter(Boolean);

  // Dynamic Styles for reference-like design
  const headerAlignment = isMinimalist ? "left" : "center";
  const sectionHeaderAlignment = isExecutive ? "center" : "left";

  // Section header style (reusable)
  const sectionHeaderStyle = {
    fontSize: template === "standard" ? "10pt" : "9pt", // Larger header for standard
    fontWeight: "bold" as const,
    textTransform: "uppercase" as const,
    borderBottom: borderStyle,
    paddingBottom: "2px",
    marginTop: template === "standard" ? "10px" : "4px", // More spacing for standard
    marginBottom: template === "standard" ? "6px" : "12px", // Tighter standard spacing
    textAlign:
      template === "standard" ? "left" : (sectionHeaderAlignment as any),
    color: accentColor,
  };

  // Measure overflow (simple heuristic)
  const isStandard = template === "standard";
  // Standard template uses tighter basic spacing
  const standardLineHeight = isStandard ? "1.15" : "1.2";
  const standardFontSize = isStandard ? "10pt" : "9pt";

  return (
    <div
      className="resume-preview bg-white"
      id="resume-preview-export"
      style={{
        width: "8.27in", // A4 width
        height: "11.69in", // A4 height
        padding: "0.5in", // Match PDF/DOCX margins
        fontFamily: getFontFamily(),
        fontSize: standardFontSize, // Align with PDF/DOCX density
        lineHeight: standardLineHeight,
        color: "#000",
        overflow: "hidden", // Still hidden, but we should show a warning overlay if needed
        position: "relative", // For overlay
        boxSizing: "border-box",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        border: "1px solid #e0e0e0",
      }}
    >
      {/* Header - Contact Info */}
      <div style={{ textAlign: headerAlignment, marginBottom: "6px" }}>
        <h1
          style={{
            fontSize: isMinimalist ? "16pt" : "14pt",
            fontWeight: "bold",
            textTransform: "uppercase",
            margin: 0,
            marginBottom: "1px",
            color: accentColor,
          }}
        >
          {resume.contactInfo.name}
        </h1>

        {/* Contact Line */}
        <div
          style={{
            fontSize: "9pt",
            display: "flex",
            flexWrap: "wrap",
            justifyContent:
              headerAlignment === "center" ? "center" : "flex-start",
            gap: "5px",
          }}
        >
          {contactParts.map((part, index) => (
            <Fragment key={index}>
              {part}
              {index < contactParts.length - 1 && <span>|</span>}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Professional Summary */}
      {resume.summary && (
        <section>
          <h2 style={sectionHeaderStyle}>Professional Summary</h2>
          <p
            style={{
              margin: 0,
              textAlign: "justify",
              fontSize: standardFontSize,
            }}
          >
            {resume.summary}
          </p>
        </section>
      )}

      {/* Education - Moved up like reference */}
      {resume.education && resume.education.length > 0 && (
        <section>
          <h2 style={sectionHeaderStyle}>Education</h2>
          {resume.education.map((edu, index) => (
            <div key={index} style={{ marginBottom: "3px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div>
                  <span style={{ fontWeight: "bold" }}>{edu.institution}</span>
                </div>
                <span style={{ fontSize: "9pt", flexShrink: 0 }}>
                  {edu.dateRange}
                </span>
              </div>
              <div style={{ fontSize: standardFontSize }}>
                <span>
                  {edu.degree} in {edu.field}
                </span>
                {edu.gpa && <span> | CGPA: {edu.gpa}</span>}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Work Experience */}
      {resume.experiences && resume.experiences.length > 0 && (
        <section>
          <h2 style={sectionHeaderStyle}>Work Experience</h2>
          {resume.experiences.map((exp, index) => (
            <div key={index} style={{ marginBottom: "3px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div>
                  <span style={{ fontWeight: "bold" }}>{exp.role}</span>
                  <span>, {exp.company}</span>
                  {exp.location && <span> | {exp.location}</span>}
                </div>
                <span style={{ fontSize: "9pt", flexShrink: 0 }}>
                  {exp.dateRange}
                </span>
              </div>
              <ul
                style={{
                  margin: "8px 0 0 0",
                  paddingLeft: "18px",
                  listStyleType: "disc",
                  listStylePosition: "outside",
                }}
              >
                {exp.bullets.map((bullet, bIndex) => (
                  <li
                    key={bIndex}
                    style={{
                      marginBottom: "1px",
                      fontSize: standardFontSize,
                      lineHeight: standardLineHeight,
                      paddingLeft: "2px",
                      textIndent: "0",
                    }}
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <section>
          <h2 style={sectionHeaderStyle}>Projects</h2>
          {resume.projects.map((proj, index) => (
            <div key={index} style={{ marginBottom: "4px" }}>
              <div>
                <span style={{ fontWeight: "bold" }}>{proj.name}</span>
                {proj.technologies && (
                  <span style={{ fontWeight: "bold" }}>
                    {" "}
                    | {proj.technologies}
                  </span>
                )}
              </div>
              <ul
                style={{
                  margin: "8px 0 0 0",
                  paddingLeft: "18px",
                  listStyleType: "disc",
                  listStylePosition: "outside",
                }}
              >
                {proj.bullets && proj.bullets.length > 0
                  ? proj.bullets.map((bullet, bIndex) => (
                      <li
                        key={bIndex}
                        style={{
                          fontSize: standardFontSize,
                          marginBottom: "1px",
                          paddingLeft: "2px",
                          textIndent: "0",
                        }}
                      >
                        {bullet}
                      </li>
                    ))
                  : proj.description && (
                      <li
                        style={{
                          fontSize: standardFontSize,
                          marginBottom: "1px",
                          paddingLeft: "2px",
                          textIndent: "0",
                        }}
                      >
                        {proj.description}
                      </li>
                    )}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Technical Skills - Categorized if available */}
      {resume.skillsCategories &&
      Object.keys(resume.skillsCategories).length > 0 ? (
        <section>
          <h2 style={sectionHeaderStyle}>Technical Skills</h2>
          {Object.entries(resume.skillsCategories).map(
            ([category, skills]) =>
              skills &&
              skills.length > 0 && (
                <div
                  key={category}
                  style={{ fontSize: standardFontSize, marginBottom: "2px" }}
                >
                  <span style={{ fontWeight: "bold" }}>• {category}:</span>{" "}
                  {skills.join(", ")}
                </div>
              ),
          )}
        </section>
      ) : (
        resume.skills &&
        resume.skills.length > 0 && (
          <section>
            <h2 style={sectionHeaderStyle}>Technical Skills</h2>
            <p style={{ margin: 0, fontSize: standardFontSize }}>
              {resume.skills.join("  •  ")}
            </p>
          </section>
        )
      )}

      {/* Certifications */}
      {resume.certifications && resume.certifications.length > 0 && (
        <section>
          <h2 style={sectionHeaderStyle}>Certifications</h2>
          {resume.certifications.map((cert, index) => (
            <div
              key={index}
              style={{ fontSize: standardFontSize, marginBottom: "1px" }}
            >
              <span style={{ fontWeight: "bold" }}>{cert.name}</span>
              <span> – {cert.issuer}</span>
              {cert.date && <span> ({cert.date})</span>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export default ResumePreview;
