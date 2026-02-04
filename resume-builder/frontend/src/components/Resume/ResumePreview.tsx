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
  template?: "modern" | "executive" | "minimalist";
}

function ResumePreview({ resume, template = "modern" }: ResumePreviewProps) {
  const getFontFamily = () => {
    switch (template) {
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

  // Dynamic Styles for reference-like design
  const headerAlignment = isMinimalist ? "left" : "center";
  const sectionHeaderAlignment = isExecutive ? "center" : "left";

  // Colors - blue accent for modern template
  const accentColor = template === "modern" ? "#2563eb" : "#000";
  const borderStyle = isMinimalist ? "none" : `1px solid ${accentColor}`;
  const linkColor = template === "modern" ? "#2563eb" : "#000";

  // Section header style (reusable)
  const sectionHeaderStyle = {
    fontSize: "10pt",
    fontWeight: "bold" as const,
    textTransform: "uppercase" as const,
    borderBottom: borderStyle,
    paddingBottom: "1px",
    marginTop: "4px",
    marginBottom: "3px",
    textAlign: sectionHeaderAlignment as any,
    color: accentColor,
  };

  return (
    <div
      className="resume-preview bg-white"
      style={{
        width: "8.27in", // A4 width
        minHeight: "11.69in", // A4 height
        maxHeight: "11.69in",
        padding: "0.4in", // Tighter margins
        fontFamily: getFontFamily(),
        fontSize: "9pt", // Smaller base font
        lineHeight: "1.3", // Tighter line height
        color: "#000",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        border: "1px solid #e0e0e0",
      }}
    >
      {/* Header - Contact Info */}
      <div style={{ textAlign: headerAlignment, marginBottom: "8px" }}>
        <h1
          style={{
            fontSize: isMinimalist ? "18pt" : "16pt",
            fontWeight: "bold",
            textTransform: "uppercase",
            margin: 0,
            marginBottom: "2px",
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
            gap: "6px",
          }}
        >
          {resume.contactInfo.phone && <span>{resume.contactInfo.phone}</span>}
          {resume.contactInfo.phone && resume.contactInfo.email && (
            <span>|</span>
          )}
          {resume.contactInfo.email && (
            <a
              href={`mailto:${resume.contactInfo.email}`}
              style={{ color: linkColor, textDecoration: "none" }}
            >
              {resume.contactInfo.email}
            </a>
          )}
          {resume.contactInfo.email &&
            (resume.contactInfo.linkedin ||
              resume.contactInfo.github ||
              resume.contactInfo.portfolio) && <span>|</span>}

          {resume.contactInfo.linkedin &&
            resume.contactInfo.linkedin !== "N/A" && (
              <a
                href={resume.contactInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: linkColor, textDecoration: "underline" }}
              >
                {formatUrl(resume.contactInfo.linkedin)}
              </a>
            )}
          {resume.contactInfo.linkedin &&
            resume.contactInfo.linkedin !== "N/A" &&
            ((resume.contactInfo.github &&
              resume.contactInfo.github !== "N/A") ||
              (resume.contactInfo.portfolio &&
                resume.contactInfo.portfolio !== "N/A")) && <span>|</span>}

          {resume.contactInfo.github && resume.contactInfo.github !== "N/A" && (
            <a
              href={resume.contactInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: linkColor, textDecoration: "underline" }}
            >
              {formatUrl(resume.contactInfo.github)}
            </a>
          )}
          {resume.contactInfo.github &&
            resume.contactInfo.github !== "N/A" &&
            resume.contactInfo.portfolio &&
            resume.contactInfo.portfolio !== "N/A" && <span>|</span>}

          {resume.contactInfo.portfolio &&
            resume.contactInfo.portfolio !== "N/A" && (
              <a
                href={resume.contactInfo.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: linkColor, textDecoration: "underline" }}
              >
                {formatUrl(resume.contactInfo.portfolio)}
              </a>
            )}
        </div>
      </div>

      {/* Professional Summary */}
      {resume.summary && (
        <section>
          <h2 style={sectionHeaderStyle}>Professional Summary</h2>
          <p style={{ margin: 0, textAlign: "justify", fontSize: "9pt" }}>
            {resume.summary}
          </p>
        </section>
      )}

      {/* Education - Moved up like reference */}
      {resume.education && resume.education.length > 0 && (
        <section>
          <h2 style={sectionHeaderStyle}>Education</h2>
          {resume.education.map((edu, index) => (
            <div key={index} style={{ marginBottom: "2px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontWeight: "bold" }}>{edu.institution}</span>
                  {edu.gpa && <span>, {edu.gpa} CGPA</span>}
                </div>
              </div>
              <div style={{ fontSize: "9pt" }}>
                {edu.degree} ({edu.field})
                {edu.dateRange && ` - ${edu.dateRange}`}
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
            <div
              key={index}
              style={{
                marginBottom:
                  index < resume.experiences.length - 1 ? "6px" : "0",
              }}
            >
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
                  margin: "2px 0 0 0",
                  paddingLeft: "14px",
                  listStyleType: "disc",
                }}
              >
                {exp.bullets.map((bullet, bIndex) => (
                  <li
                    key={bIndex}
                    style={{ marginBottom: "1px", fontSize: "9pt" }}
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
                  margin: "1px 0 0 0",
                  paddingLeft: "14px",
                  listStyleType: "disc",
                }}
              >
                {proj.bullets && proj.bullets.length > 0
                  ? proj.bullets.map((bullet, bIndex) => (
                      <li key={bIndex} style={{ fontSize: "9pt" }}>
                        {bullet}
                      </li>
                    ))
                  : proj.description && (
                      <li style={{ fontSize: "9pt" }}>{proj.description}</li>
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
                  style={{ fontSize: "9pt", marginBottom: "2px" }}
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
            <p style={{ margin: 0, fontSize: "9pt" }}>
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
            <div key={index} style={{ fontSize: "9pt", marginBottom: "1px" }}>
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
