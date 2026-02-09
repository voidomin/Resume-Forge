import { Fragment } from "react";
import { TemplateProps } from "../../../types/resume";

export function ModernTemplate({ resume }: TemplateProps) {
  // Use tokens for dynamic values where possible, or keep fallback
  const accentColor = "var(--color-primary)";
  const borderStyle = `2px solid ${accentColor}`;
  const linkColor = "var(--color-primary)";

  // ... (helper functions formatUrl, isValid, renderContactItem same as before)
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
    fontSize: "10pt",
    fontWeight: "800" as const,
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
    borderBottom: borderStyle,
    paddingBottom: "4px",
    marginTop: "16px",
    marginBottom: "8px",
    textAlign: "left" as const,
    color: accentColor,
  };

  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "9pt",
        lineHeight: "1.3",
        color: "var(--color-text)",
      }}
    >
      {/* Header - Contact Info */}
      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        <h1
          style={{
            fontSize: "20pt",
            fontWeight: "800",
            letterSpacing: "-0.5px",
            textTransform: "uppercase",
            margin: 0,
            marginBottom: "4px",
            color: "var(--color-primary)",
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
            justifyContent: "center",
            gap: "8px",
            color: "var(--color-text-light)",
          }}
        >
          {contactParts.map((part, index) => (
            <Fragment key={index}>
              {part}
              {index < contactParts.length - 1 && (
                <span style={{ color: "var(--color-secondary)", opacity: 0.5 }}>
                  |
                </span>
              )}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Professional Summary */}
      {resume.summary && (
        <section style={{ marginBottom: "12px" }}>
          <h2 style={sectionHeaderStyle}>Professional Summary</h2>
          <p
            style={{
              margin: 0,
              textAlign: "justify",
              fontSize: "9.5pt",
              lineHeight: "1.4",
            }}
          >
            {resume.summary}
          </p>
        </section>
      )}

      {/* Work Experience */}
      {resume.experiences && resume.experiences.length > 0 && (
        <section style={{ marginBottom: "12px" }}>
          <h2 style={sectionHeaderStyle}>Work Experience</h2>
          {resume.experiences.map((exp, index) => (
            <div key={index} style={{ marginBottom: "8px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "2px",
                }}
              >
                <div>
                  <span
                    style={{
                      fontWeight: "700",
                      fontSize: "10pt",
                      color: "var(--color-text)",
                    }}
                  >
                    {exp.role}
                  </span>
                  <span style={{ color: "var(--color-secondary)" }}> | </span>
                  <span
                    style={{
                      fontWeight: "600",
                      color: "var(--color-primary)",
                    }}
                  >
                    {exp.company}
                  </span>
                  {exp.location && (
                    <span
                      style={{
                        fontSize: "9pt",
                        color: "var(--color-text-light)",
                        marginLeft: "4px",
                      }}
                    >
                      ({exp.location})
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: "9pt",
                    fontWeight: "600",
                    color: "var(--color-text)",
                    flexShrink: 0,
                  }}
                >
                  {exp.dateRange}
                </span>
              </div>
              <ul
                style={{
                  margin: "4px 0 0 0",
                  paddingLeft: "16px",
                  listStyleType: "disc",
                }}
              >
                {exp.bullets.map((bullet, bIndex) => (
                  <li
                    key={bIndex}
                    style={{
                      marginBottom: "2px",
                      fontSize: "9pt",
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

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <section style={{ marginBottom: "12px" }}>
          <h2 style={sectionHeaderStyle}>Projects</h2>
          {resume.projects.map((proj, index) => (
            <div key={index} style={{ marginBottom: "8px" }}>
              <div style={{ marginBottom: "2px" }}>
                <span style={{ fontWeight: "700", fontSize: "10pt" }}>
                  {proj.name}
                </span>
                {proj.technologies && (
                  <span
                    style={{
                      fontSize: "9pt",
                      color: "var(--color-secondary)",
                      fontStyle: "italic",
                      marginLeft: "6px",
                    }}
                  >
                    — {proj.technologies}
                  </span>
                )}
              </div>
              <ul
                style={{
                  margin: "4px 0 0 0",
                  paddingLeft: "16px",
                  listStyleType: "disc",
                }}
              >
                {proj.bullets && proj.bullets.length > 0
                  ? proj.bullets.map((bullet, bIndex) => (
                      <li
                        key={bIndex}
                        style={{
                          marginBottom: "2px",
                          fontSize: "9pt",
                          paddingLeft: "4px",
                        }}
                      >
                        {bullet}
                      </li>
                    ))
                  : proj.description && (
                      <li
                        style={{
                          marginBottom: "2px",
                          fontSize: "9pt",
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

      {/* Education */}
      {resume.education && resume.education.length > 0 && (
        <section style={{ marginBottom: "12px" }}>
          <h2 style={sectionHeaderStyle}>Education</h2>
          {resume.education.map((edu, index) => (
            <div key={index} style={{ marginBottom: "6px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div>
                  <span
                    style={{ fontWeight: "700", color: "var(--color-primary)" }}
                  >
                    {edu.institution}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "9pt",
                    fontWeight: "600",
                    flexShrink: 0,
                  }}
                >
                  {edu.dateRange}
                </span>
              </div>
              <div style={{ fontSize: "9pt" }}>
                <span style={{ fontWeight: "500" }}>
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

      {/* Technical Skills */}
      {resume.skillsCategories &&
      Object.keys(resume.skillsCategories).length > 0 ? (
        <section style={{ marginBottom: "0" }}>
          <h2 style={sectionHeaderStyle}>Technical Skills</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {Object.entries(resume.skillsCategories).map(
              ([category, skills]) =>
                skills &&
                skills.length > 0 && (
                  <div key={category} style={{ fontSize: "9pt" }}>
                    <span
                      style={{
                        fontWeight: "700",
                        color: "var(--color-primary)",
                        marginRight: "6px",
                      }}
                    >
                      {category}:
                    </span>
                    <span style={{ color: "var(--color-text)" }}>
                      {skills.join(", ")}
                    </span>
                  </div>
                ),
            )}
          </div>
        </section>
      ) : (
        resume.skills &&
        resume.skills.length > 0 && (
          <section style={{ marginBottom: "0" }}>
            <h2 style={sectionHeaderStyle}>Technical Skills</h2>
            <p style={{ margin: 0, fontSize: "9pt", lineHeight: "1.4" }}>
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
            <div key={index} style={{ fontSize: "9pt", marginBottom: "2px" }}>
              <span style={{ fontWeight: "700" }}>{cert.name}</span>
              <span style={{ color: "var(--color-text-light)" }}>
                {" "}
                – {cert.issuer}
              </span>
              {cert.date && (
                <span style={{ color: "var(--color-text-light)" }}>
                  {" "}
                  ({cert.date})
                </span>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
