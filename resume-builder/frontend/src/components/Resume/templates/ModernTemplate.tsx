import { Fragment } from "react";
import { TemplateProps } from "../../../types/resume";

export function ModernTemplate({ resume }: TemplateProps) {
  const accentColor = "#2563eb";
  const borderStyle = `1px solid ${accentColor}`;
  const linkColor = "#2563eb";

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

  const sectionHeaderStyle = {
    fontSize: "9pt",
    fontWeight: "bold" as const,
    textTransform: "uppercase" as const,
    borderBottom: borderStyle,
    paddingBottom: "2px",
    marginTop: "4px",
    marginBottom: "12px",
    textAlign: "left" as const,
    color: accentColor,
  };

  const fontFamily = "Arial, Helvetica, sans-serif";
  const fontSize = "9pt";
  const lineHeight = "1.2";

  return (
    <div
      style={{
        fontFamily,
        fontSize,
        lineHeight,
        color: "#000",
      }}
    >
      {/* Header - Contact Info */}
      <div style={{ textAlign: "center", marginBottom: "6px" }}>
        <h1
          style={{
            fontSize: "14pt",
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
            justifyContent: "center",
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
              fontSize,
            }}
          >
            {resume.summary}
          </p>
        </section>
      )}

      {/* Education */}
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
              <div style={{ fontSize }}>
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
                      fontSize,
                      lineHeight,
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
                          fontSize,
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
                          fontSize,
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

      {/* Technical Skills */}
      {resume.skillsCategories &&
      Object.keys(resume.skillsCategories).length > 0 ? (
        <section>
          <h2 style={sectionHeaderStyle}>Technical Skills</h2>
          {Object.entries(resume.skillsCategories).map(
            ([category, skills]) =>
              skills &&
              skills.length > 0 && (
                <div key={category} style={{ fontSize, marginBottom: "2px" }}>
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
            <p style={{ margin: 0, fontSize }}>{resume.skills.join("  •  ")}</p>
          </section>
        )
      )}

      {/* Certifications */}
      {resume.certifications && resume.certifications.length > 0 && (
        <section>
          <h2 style={sectionHeaderStyle}>Certifications</h2>
          {resume.certifications.map((cert, index) => (
            <div key={index} style={{ fontSize, marginBottom: "1px" }}>
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
