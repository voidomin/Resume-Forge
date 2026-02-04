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
  projects?: {
    name: string;
    description: string;
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

  // Dynamic Styles
  const headerAlignment = isMinimalist ? "left" : "center";
  const sectionHeaderAlignment = isExecutive ? "center" : "left";

  // Colors
  const accentColor = template === "modern" ? "#2563eb" : "#000000";
  const headerColor = template === "modern" ? "#2563eb" : "#000000";
  const borderStyle = isMinimalist ? "none" : `1px solid ${accentColor}`;

  return (
    <div
      className="resume-preview bg-white"
      style={{
        width: "8.5in",
        minHeight: "11in",
        maxHeight: "11in",
        padding: "0.5in",
        fontFamily: getFontFamily(),
        fontSize: "10pt",
        lineHeight: "1.4",
        color: "#000",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
      }}
    >
      {/* Header - Contact Info */}
      <div style={{ textAlign: headerAlignment, marginBottom: "12px" }}>
        <h1
          style={{
            fontSize: isMinimalist ? "22pt" : "18pt",
            fontWeight: "bold",
            textTransform: "uppercase",
            margin: 0,
            marginBottom: "4px",
            color: headerColor,
          }}
        >
          {resume.contactInfo.name}
        </h1>

        <div
          style={{
            fontSize: "9pt",
            color: "#666",
            marginBottom: "2px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent:
              headerAlignment === "left" ? "flex-start" : "center",
            gap: "8px",
          }}
        >
          {resume.contactInfo.email && (
            <a
              href={`mailto:${resume.contactInfo.email}`}
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {resume.contactInfo.email}
            </a>
          )}
          {resume.contactInfo.phone && (
            <span>| {resume.contactInfo.phone}</span>
          )}
          {resume.contactInfo.location && (
            <span>| {resume.contactInfo.location}</span>
          )}
        </div>

        <div
          style={{
            fontSize: "9pt",
            color: "#666",
            display: "flex",
            flexWrap: "wrap",
            justifyContent:
              headerAlignment === "left" ? "flex-start" : "center",
            gap: "8px",
          }}
        >
          {resume.contactInfo.linkedin && (
            <a
              href={resume.contactInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {formatUrl(resume.contactInfo.linkedin)}
            </a>
          )}
          {resume.contactInfo.linkedin &&
            (resume.contactInfo.github || resume.contactInfo.portfolio) && (
              <span>|</span>
            )}

          {resume.contactInfo.github && (
            <a
              href={resume.contactInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {formatUrl(resume.contactInfo.github)}
            </a>
          )}
          {resume.contactInfo.github && resume.contactInfo.portfolio && (
            <span>|</span>
          )}

          {resume.contactInfo.portfolio && (
            <a
              href={resume.contactInfo.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              {formatUrl(resume.contactInfo.portfolio)}
            </a>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {resume.summary && (
        <section>
          <h2
            style={{
              fontSize: "11pt",
              fontWeight: "bold",
              textTransform: "uppercase",
              borderBottom: borderStyle,
              paddingBottom: "2px",
              marginTop: "10px",
              marginBottom: "6px",
              textAlign: sectionHeaderAlignment,
              color: accentColor,
            }}
          >
            {isMinimalist ? "Profile" : "Professional Summary"}
          </h2>
          <p style={{ margin: 0, textAlign: "justify" }}>{resume.summary}</p>
        </section>
      )}

      {/* Work Experience */}
      {resume.experiences && resume.experiences.length > 0 && (
        <section>
          <h2
            style={{
              fontSize: "11pt",
              fontWeight: "bold",
              textTransform: "uppercase",
              borderBottom: borderStyle,
              paddingBottom: "2px",
              marginTop: "10px",
              marginBottom: "6px",
              textAlign: sectionHeaderAlignment,
              color: accentColor,
            }}
          >
            Work Experience
          </h2>

          {resume.experiences.map((exp, index) => (
            <div
              key={index}
              style={{
                marginBottom:
                  index < resume.experiences.length - 1 ? "8px" : "0",
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
                  <span> | {exp.company}</span>
                  {exp.location && <span> | {exp.location}</span>}
                </div>
                <span style={{ fontSize: "10pt" }}>{exp.dateRange}</span>
              </div>

              <ul
                style={{
                  margin: "4px 0 0 0",
                  paddingLeft: "15px",
                  listStyleType: "disc",
                }}
              >
                {exp.bullets.map((bullet, bIndex) => (
                  <li key={bIndex} style={{ marginBottom: "2px" }}>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {resume.education && resume.education.length > 0 && (
        <section>
          <h2
            style={{
              fontSize: "11pt",
              fontWeight: "bold",
              textTransform: "uppercase",
              borderBottom: borderStyle,
              paddingBottom: "2px",
              marginTop: "10px",
              marginBottom: "6px",
              textAlign: sectionHeaderAlignment,
              color: accentColor,
            }}
          >
            Education
          </h2>

          {resume.education.map((edu, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "4px",
              }}
            >
              <div>
                <span style={{ fontWeight: "bold" }}>
                  {edu.degree} in {edu.field}
                </span>
                <span> | {edu.institution}</span>
                {edu.gpa && <span> | GPA: {edu.gpa}</span>}
              </div>
              <span style={{ fontSize: "10pt" }}>{edu.dateRange}</span>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <section>
          <h2
            style={{
              fontSize: "11pt",
              fontWeight: "bold",
              textTransform: "uppercase",
              borderBottom: borderStyle,
              paddingBottom: "2px",
              marginTop: "10px",
              marginBottom: "6px",
              textAlign: sectionHeaderAlignment,
              color: accentColor,
            }}
          >
            Projects
          </h2>
          {resume.projects.map((proj, index) => (
            <div key={index} style={{ marginBottom: "8px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div>
                  <span style={{ fontWeight: "bold" }}>{proj.name}</span>
                  {proj.link && (
                    <span>
                      {" "}
                      |{" "}
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "inherit", textDecoration: "none" }}
                      >
                        {proj.link}
                      </a>
                    </span>
                  )}
                </div>
              </div>
              {proj.technologies && (
                <div
                  style={{
                    fontStyle: "italic",
                    fontSize: "9pt",
                    marginBottom: "2px",
                  }}
                >
                  {proj.technologies}
                </div>
              )}
              <p style={{ margin: 0 }}>{proj.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Certifications */}
      {resume.certifications && resume.certifications.length > 0 && (
        <section>
          <h2
            style={{
              fontSize: "11pt",
              fontWeight: "bold",
              textTransform: "uppercase",
              borderBottom: borderStyle,
              paddingBottom: "2px",
              marginTop: "10px",
              marginBottom: "6px",
              textAlign: sectionHeaderAlignment,
              color: accentColor,
            }}
          >
            Certifications
          </h2>
          {resume.certifications.map((cert, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "2px",
              }}
            >
              <div>
                <span style={{ fontWeight: "bold" }}>{cert.name}</span>
                <span> | {cert.issuer}</span>
              </div>
              {cert.date && (
                <span style={{ fontSize: "10pt" }}>{cert.date}</span>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {resume.skills && resume.skills.length > 0 && (
        <section>
          <h2
            style={{
              fontSize: "11pt",
              fontWeight: "bold",
              textTransform: "uppercase",
              borderBottom: borderStyle,
              paddingBottom: "2px",
              marginTop: "10px",
              marginBottom: "6px",
              textAlign: sectionHeaderAlignment,
              color: accentColor,
            }}
          >
            Skills
          </h2>
          <p style={{ margin: 0 }}>{resume.skills.join("  •  ")}</p>
        </section>
      )}
    </div>
  );
}

export default ResumePreview;
