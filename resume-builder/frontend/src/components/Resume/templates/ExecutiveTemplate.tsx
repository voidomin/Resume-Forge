import { Fragment } from "react";
import { TemplateProps } from "../../../types/resume";

export function ExecutiveTemplate({ resume }: TemplateProps) {
  const accentColor = "var(--color-primary)"; // Executive now uses deep blue accent
  const borderStyle = "1px solid var(--color-secondary)";
  const linkColor = "var(--color-text)";

  const formatUrl = (url: string) => {
    return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  };

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
              textDecoration: "none",
              borderBottom: "1px dotted currentColor",
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

  const sectionHeaderStyle = {
    fontSize: "11pt",
    fontWeight: "700" as const,
    textTransform: "uppercase" as const,
    borderBottom: borderStyle,
    paddingBottom: "4px",
    marginTop: "16px",
    marginBottom: "10px",
    textAlign: "center" as const,
    color: accentColor,
    letterSpacing: "1px", // Executive feel
  };

  const fontFamily = "var(--font-serif)";

  return (
    <div
      style={{
        fontFamily,
        fontSize: "10pt",
        lineHeight: "1.35",
        color: "var(--color-text)",
      }}
    >
      {/* Header - Contact Info */}
      <div style={{ textAlign: "center", marginBottom: "16px" }}>
        <h1
          style={{
            fontSize: "24pt", // Grandiose for executive
            fontWeight: "700",
            textTransform: "uppercase",
            margin: 0,
            marginBottom: "8px",
            color: accentColor,
            letterSpacing: "1px",
          }}
        >
          {resume.contactInfo.name}
        </h1>

        {/* Contact Line */}
        <div
          style={{
            fontSize: "9.5pt",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "12px",
            color: "var(--color-text-light)",
          }}
        >
          {contactParts.map((part, index) => (
            <Fragment key={index}>
              {part}
              {index < contactParts.length - 1 && (
                <span style={{ opacity: 0.3 }}>|</span>
              )}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Professional Summary */}
      {resume.summary && (
        <section style={{ marginBottom: "16px" }}>
          <h2 style={sectionHeaderStyle}>Professional Summary</h2>
          <p
            style={{
              margin: 0,
              textAlign: "justify",
              fontSize: "10pt",
            }}
          >
            {resume.summary}
          </p>
        </section>
      )}

      {/* Executive usually puts Experience first */}
      {/* Work Experience */}
      {resume.experiences && resume.experiences.length > 0 && (
        <section style={{ marginBottom: "16px" }}>
          <h2 style={sectionHeaderStyle}>Work Experience</h2>
          {resume.experiences.map((exp, index) => (
            <div key={index} style={{ marginBottom: "12px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "4px",
                }}
              >
                <div>
                  <span
                    style={{
                      fontWeight: "700",
                      fontSize: "11pt",
                      textTransform: "uppercase",
                    }}
                  >
                    {exp.role}
                  </span>
                  <span style={{ color: "var(--color-text-light)" }}> | </span>
                  <span style={{ fontWeight: "600", fontStyle: "italic" }}>
                    {exp.company}
                  </span>
                  {exp.location && (
                    <span style={{ color: "var(--color-text-light)" }}>
                      , {exp.location}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "9.5pt", fontWeight: "600" }}>
                  {exp.dateRange}
                </span>
              </div>
              <ul
                style={{
                  margin: "8px 0 0 0",
                  paddingLeft: "16px",
                  listStyleType: "square", // Executive marker
                }}
              >
                {exp.bullets.map((bullet, bIndex) => (
                  <li
                    key={bIndex}
                    style={{
                      marginBottom: "3px",
                      fontSize: "10pt",
                      paddingLeft: "4px",
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

      {/* Education */}
      {resume.education && resume.education.length > 0 && (
        <section style={{ marginBottom: "16px" }}>
          <h2 style={sectionHeaderStyle}>Education</h2>
          {resume.education.map((edu, index) => (
            <div key={index} style={{ marginBottom: "8px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div>
                  <span style={{ fontWeight: "700", fontSize: "11pt" }}>
                    {edu.institution}
                  </span>
                </div>
                <span style={{ fontSize: "9.5pt" }}>{edu.dateRange}</span>
              </div>
              <div style={{ fontSize: "10pt" }}>
                <span style={{ fontStyle: "italic" }}>
                  {edu.degree} in {edu.field}
                </span>
                {edu.gpa && (
                  <span style={{ color: "var(--color-text-light)" }}>
                    {" "}
                    | GPA: {edu.gpa}
                  </span>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <section style={{ marginBottom: "16px" }}>
          <h2 style={sectionHeaderStyle}>Projects</h2>
          {resume.projects.map((proj, index) => (
            <div key={index} style={{ marginBottom: "8px" }}>
              <div style={{ marginBottom: "2px" }}>
                <span style={{ fontWeight: "700", fontSize: "11pt" }}>
                  {proj.name}
                </span>
              </div>
              <ul
                style={{
                  margin: "4px 0 0 0",
                  paddingLeft: "16px",
                  listStyleType: "square",
                }}
              >
                {proj.bullets && proj.bullets.length > 0
                  ? proj.bullets.map((bullet, bIndex) => (
                      <li
                        key={bIndex}
                        style={{
                          fontSize: "10pt",
                          marginBottom: "2px",
                          paddingLeft: "4px",
                        }}
                      >
                        {bullet}
                      </li>
                    ))
                  : proj.description && (
                      <li
                        style={{
                          fontSize: "10pt",
                          marginBottom: "2px",
                          paddingLeft: "4px",
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

      {/* Technical Skills */}
      {resume.skillsCategories &&
      Object.keys(resume.skillsCategories).length > 0 ? (
        <section style={{ marginBottom: "0" }}>
          <h2 style={sectionHeaderStyle}>Competencies</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
            }}
          >
            {Object.entries(resume.skillsCategories).map(
              ([category, skills]) =>
                skills &&
                skills.length > 0 && (
                  <div key={category} style={{ fontSize: "10pt" }}>
                    <span
                      style={{
                        fontWeight: "700",
                        textTransform: "uppercase",
                        fontSize: "9pt",
                        color: "var(--color-text-light)",
                      }}
                    >
                      {category}
                    </span>
                    <div style={{ marginTop: "2px" }}>{skills.join(", ")}</div>
                  </div>
                ),
            )}
          </div>
        </section>
      ) : (
        resume.skills &&
        resume.skills.length > 0 && (
          <section style={{ marginBottom: "0" }}>
            <h2 style={sectionHeaderStyle}>Competencies</h2>
            <p style={{ margin: 0, fontSize: "10pt" }}>
              {resume.skills.join("  •  ")}
            </p>
          </section>
        )
      )}

      {/* Certifications */}
      {resume.certifications && resume.certifications.length > 0 && (
        <section style={{ marginTop: "12px", marginBottom: "0" }}>
          <h2 style={sectionHeaderStyle}>Certifications</h2>
          {resume.certifications.map((cert, index) => (
            <div key={index} style={{ fontSize: "10pt", marginBottom: "1px" }}>
              <span style={{ fontWeight: "700" }}>{cert.name}</span>
              <span style={{ color: "var(--color-text-light)" }}>
                {" "}
                – {cert.issuer}
              </span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
