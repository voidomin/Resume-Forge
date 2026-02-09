import { Fragment } from "react";
import { TemplateProps } from "../../../types/resume";

export function MinimalistTemplate({ resume }: TemplateProps) {
  const borderStyle = "none";
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
    fontWeight: "700" as const,
    textTransform: "uppercase" as const,
    borderBottom: borderStyle,
    paddingBottom: "2px",
    marginTop: "16px",
    marginBottom: "12px",
    textAlign: "left" as const,
    color: "var(--color-text-light)",
    letterSpacing: "1px", // Modern minimalist
  };

  const fontFamily = "var(--font-sans)";
  const fontSize = "9pt";
  const lineHeight = "1.4"; // Airy

  return (
    <div
      style={{
        fontFamily,
        fontSize,
        lineHeight,
        color: "var(--color-text)",
      }}
    >
      {/* Header - Contact Info */}
      <div style={{ textAlign: "left", marginBottom: "20px" }}>
        <h1
          style={{
            fontSize: "24pt",
            fontWeight: "700",
            letterSpacing: "-1px",
            textTransform: "none", // Minimalist often is lowercase or normal case
            margin: 0,
            marginBottom: "8px",
            color: "var(--color-text)",
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
            justifyContent: "flex-start",
            gap: "12px",
            color: "var(--color-text-light)",
          }}
        >
          {contactParts.map((part, index) => (
            <Fragment key={index}>{part}</Fragment>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "150px 1fr",
          gap: "20px",
        }}
      >
        {/* Left Column ?? No, single column but cleaner. Or maybe sidebar? 
             Minimalist usually implies single column structure. Keeping single column for PDF compatibility.
          */}
      </div>

      {/* Professional Summary */}
      {resume.summary && (
        <section style={{ marginBottom: "16px" }}>
          <h2 style={sectionHeaderStyle}>About</h2>
          <p
            style={{
              margin: 0,
              textAlign: "left",
              fontSize: "9.5pt",
              maxWidth: "600px", // Reading width
            }}
          >
            {resume.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {resume.experiences && resume.experiences.length > 0 && (
        <section style={{ marginBottom: "16px" }}>
          <h2 style={sectionHeaderStyle}>Experience</h2>
          {resume.experiences.map((exp, index) => (
            <div key={index} style={{ marginBottom: "16px" }}>
              <div
                style={{
                  marginBottom: "4px",
                }}
              >
                <span
                  style={{
                    fontWeight: "700",
                    fontSize: "10pt",
                    color: "var(--color-text)",
                    display: "block",
                  }}
                >
                  {exp.role}
                </span>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "9pt",
                    color: "var(--color-text-light)",
                  }}
                >
                  <span>
                    {exp.company}
                    {exp.location ? `, ${exp.location}` : ""}
                  </span>
                  <span>{exp.dateRange}</span>
                </div>
              </div>
              <ul
                style={{
                  margin: "6px 0 0 0",
                  paddingLeft: "14px",
                  listStyleType: "none", // Minimalist often removes bullets
                }}
              >
                {exp.bullets.map((bullet, bIndex) => (
                  <li
                    key={bIndex}
                    style={{
                      marginBottom: "4px",
                      fontSize: "9.5pt",
                      paddingLeft: "0",
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: "-12px",
                        color: "var(--color-accent)",
                      }}
                    >
                      •
                    </span>
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
        <section style={{ marginBottom: "16px" }}>
          <h2 style={sectionHeaderStyle}>Projects</h2>
          {resume.projects.map((proj, index) => (
            <div key={index} style={{ marginBottom: "12px" }}>
              <div style={{ marginBottom: "2px" }}>
                <span style={{ fontWeight: "700", fontSize: "10pt" }}>
                  {proj.name}
                </span>
                {proj.technologies && (
                  <span
                    style={{
                      fontSize: "9pt",
                      color: "var(--color-text-light)",
                      marginLeft: "8px",
                    }}
                  >
                    {proj.technologies}
                  </span>
                )}
              </div>
              <p
                style={{
                  fontSize: "9.5pt",
                  margin: "4px 0",
                  color: "var(--color-text)",
                }}
              >
                {proj.description}
              </p>
              {/* Bullets for projects if any */}
              {proj.bullets && (
                <ul
                  style={{
                    margin: "4px 0 0 0",
                    paddingLeft: "14px",
                    listStyle: "none",
                  }}
                >
                  {proj.bullets.map((b, i) => (
                    <li
                      key={i}
                      style={{
                        fontSize: "9pt",
                        marginBottom: "2px",
                        position: "relative",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          left: "-12px",
                          color: "var(--color-accent)",
                        }}
                      >
                        •
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
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
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "700" }}>{edu.institution}</span>
                <span
                  style={{ color: "var(--color-text-light)", fontSize: "9pt" }}
                >
                  {edu.dateRange}
                </span>
              </div>
              <div style={{ fontSize: "9.5pt" }}>
                {edu.degree} in {edu.field}
                {edu.gpa && (
                  <span style={{ color: "var(--color-text-light)" }}>
                    {" "}
                    (GPA: {edu.gpa})
                  </span>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {resume.skillsCategories &&
        Object.keys(resume.skillsCategories).length > 0 && (
          <section>
            <h2 style={sectionHeaderStyle}>Skills</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
              {Object.entries(resume.skillsCategories).map(
                ([cat, items]) =>
                  items &&
                  items.length > 0 && (
                    <div key={cat} style={{ minWidth: "120px" }}>
                      <div
                        style={{
                          fontSize: "8.5pt",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          color: "var(--color-text-light)",
                          marginBottom: "4px",
                        }}
                      >
                        {cat}
                      </div>
                      <div style={{ fontSize: "9.5pt" }}>
                        {items.join(", ")}
                      </div>
                    </div>
                  ),
              )}
            </div>
          </section>
        )}
      {!resume.skillsCategories && resume.skills && (
        <section>
          <h2 style={sectionHeaderStyle}>Skills</h2>
          <p style={{ fontSize: "9.5pt" }}>{resume.skills.join(", ")}</p>
        </section>
      )}
    </div>
  );
}
