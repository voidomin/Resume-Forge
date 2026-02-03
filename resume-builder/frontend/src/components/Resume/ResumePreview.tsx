interface GeneratedResume {
  contactInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
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
  atsScore?: number;
  keywords?: string[];
}

interface ResumePreviewProps {
  resume: GeneratedResume;
}

function ResumePreview({ resume }: ResumePreviewProps) {
  return (
    <div
      className="resume-preview bg-white"
      style={{
        width: "8.5in",
        minHeight: "11in",
        maxHeight: "11in",
        padding: "0.5in",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: "10pt",
        lineHeight: "1.4",
        color: "#000",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
      }}
    >
      {/* Header - Contact Info */}
      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        <h1
          style={{
            fontSize: "18pt",
            fontWeight: "bold",
            textTransform: "uppercase",
            margin: 0,
            marginBottom: "4px",
          }}
        >
          {resume.contactInfo.name}
        </h1>

        <div style={{ fontSize: "9pt", color: "#333", marginBottom: "2px" }}>
          {[
            resume.contactInfo.email,
            resume.contactInfo.phone,
            resume.contactInfo.location,
          ]
            .filter(Boolean)
            .join("  |  ")}
        </div>

        {(resume.contactInfo.linkedin || resume.contactInfo.github) && (
          <div style={{ fontSize: "9pt", color: "#333" }}>
            {[resume.contactInfo.linkedin, resume.contactInfo.github]
              .filter(Boolean)
              .join("  |  ")}
          </div>
        )}
      </div>

      {/* Professional Summary */}
      {resume.summary && (
        <section>
          <h2
            style={{
              fontSize: "11pt",
              fontWeight: "bold",
              textTransform: "uppercase",
              borderBottom: "1px solid #000",
              paddingBottom: "2px",
              marginTop: "10px",
              marginBottom: "6px",
            }}
          >
            Professional Summary
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
              borderBottom: "1px solid #000",
              paddingBottom: "2px",
              marginTop: "10px",
              marginBottom: "6px",
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
              borderBottom: "1px solid #000",
              paddingBottom: "2px",
              marginTop: "10px",
              marginBottom: "6px",
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

      {/* Skills */}
      {resume.skills && resume.skills.length > 0 && (
        <section>
          <h2
            style={{
              fontSize: "11pt",
              fontWeight: "bold",
              textTransform: "uppercase",
              borderBottom: "1px solid #000",
              paddingBottom: "2px",
              marginTop: "10px",
              marginBottom: "6px",
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
