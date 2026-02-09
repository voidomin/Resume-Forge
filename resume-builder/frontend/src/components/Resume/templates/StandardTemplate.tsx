import { Fragment } from "react";
import { TemplateProps } from "../../../types/resume";

export function StandardTemplate({ resume }: TemplateProps) {
  const borderStyle = "1px solid var(--color-secondary)";
  const linkColor = "var(--color-primary)";

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
    paddingBottom: "3px",
    marginTop: "14px",
    marginBottom: "8px",
    textAlign: "left" as const,
    color: "var(--color-text)",
    letterSpacing: "0.5px",
  };

  return (
    <div
      style={{
        fontFamily: "var(--font-serif)",
        fontSize: "10pt",
        lineHeight: "1.3",
        color: "var(--color-text)",
      }}
    >
      {/* Header - Contact Info */}
      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        <h1
          style={{
            fontSize: "22pt",
            fontWeight: "700",
            textTransform: "uppercase",
            margin: 0,
            marginBottom: "4px",
            color: "var(--color-text)",
            borderBottom: "2px solid var(--color-primary)",
            display: "inline-block",
            paddingBottom: "2px",
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
            gap: "8px",
            marginTop: "6px",
            color: "var(--color-text-light)",
          }}
        >
          {contactParts.map((part, index) => (
            <Fragment key={index}>
              {part}
              {index < contactParts.length - 1 && (
                <span style={{ color: "var(--color-secondary)", opacity: 0.5 }}>
                  •
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
              fontSize: "10pt",
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
            <div key={index} style={{ marginBottom: "10px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "2px",
                }}
              >
                <div>
                  <span style={{ fontWeight: "700", fontSize: "11pt" }}>
                    {exp.role}
                  </span>
                  <span style={{ color: "var(--color-secondary)" }}> at </span>
                  <span
                    style={{ fontWeight: "600", color: "var(--color-primary)" }}
                  >
                    {exp.company}
                  </span>
                  {exp.location && (
                    <span
                      style={{
                        color: "var(--color-text-light)",
                        fontStyle: "italic",
                      }}
                    >
                      , {exp.location}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: "9.5pt",
                    fontWeight: "600",
                    color: "var(--color-text-light)",
                  }}
                >
                  {exp.dateRange}
                </span>
              </div>
              <ul
                style={{
                  margin: "4px 0 0 0",
                  paddingLeft: "16px",
                  listStyleType: "circle",
                }}
              >
                {exp.bullets.map((bullet, bIndex) => (
                  <li
                    key={bIndex}
                    style={{
                      marginBottom: "2px",
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

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <section style={{ marginBottom: "12px" }}>
          <h2 style={sectionHeaderStyle}>Projects</h2>
          {resume.projects.map((proj, index) => (
            <div key={index} style={{ marginBottom: "8px" }}>
              <div style={{ marginBottom: "2px" }}>
                <span style={{ fontWeight: "700", fontSize: "11pt" }}>
                  {proj.name}
                </span>
                {proj.technologies && (
                  <span
                    style={{
                      fontSize: "9.5pt",
                      color: "var(--color-text-light)",
                      marginLeft: "6px",
                    }}
                  >
                    [{proj.technologies}]
                  </span>
                )}
              </div>
              <ul
                style={{
                  margin: "4px 0 0 0",
                  paddingLeft: "16px",
                  listStyleType: "circle",
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
                  <span style={{ fontWeight: "700", fontSize: "11pt" }}>
                    {edu.institution}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "9.5pt",
                    color: "var(--color-text-light)",
                  }}
                >
                  {edu.dateRange}
                </span>
              </div>
              <div style={{ fontSize: "10pt" }}>
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
                  <div
                    key={category}
                    style={{ fontSize: "10pt", marginBottom: "2px" }}
                  >
                    <span style={{ fontWeight: "700" }}>{category}:</span>{" "}
                    {skills.join(", ")}
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
