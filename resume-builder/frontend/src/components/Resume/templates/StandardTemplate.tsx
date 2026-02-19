import { Fragment } from "react";
import { TemplateProps } from "../../../types/resume";
import { UnifiedDesignSystem } from "@shared/design-system";

export function StandardTemplate({ resume }: TemplateProps) {
  const ds = UnifiedDesignSystem;
  const borderStyle = `1px solid ${ds.colors.secondary}`;
  const linkColor = ds.colors.primary;

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
    fontSize: `${ds.fontSize.h2}pt`,
    fontWeight: "700" as const,
    textTransform: "uppercase" as const,
    borderBottom: borderStyle,
    paddingBottom: "3px",
    marginTop: `${ds.spacing.section}pt`,
    marginBottom: `${ds.spacing.element}pt`,
    textAlign: "left" as const,
    color: ds.colors.text,
    letterSpacing: "0.5px",
  };

  return (
    <div
      style={{
        fontFamily: ds.fonts.primary.web,
        fontSize: `${ds.fontSize.body}pt`,
        lineHeight: ds.spacing.line.toString(),
        color: ds.colors.text,
      }}
    >
      {/* Header - Contact Info */}
      <div style={{ textAlign: "center", marginBottom: `${ds.spacing.section}pt` }}>
        <h1
          style={{
            fontSize: "22pt",
            fontWeight: "700",
            textTransform: "uppercase",
            margin: 0,
            marginBottom: `${ds.spacing.tight}pt`,
            color: ds.colors.text,
            borderBottom: `2px solid ${ds.colors.primary}`,
            display: "inline-block",
            paddingBottom: "2px",
          }}
        >
          {resume.contactInfo.name}
        </h1>

        {/* Contact Line */}
        <div
          style={{
            fontSize: `${ds.fontSize.contact}pt`,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: `${ds.spacing.element}px`,
            marginTop: `${ds.spacing.tight}pt`,
            color: ds.colors.textLight,
          }}
        >
          {contactParts.map((part, index) => (
            <Fragment key={index}>
              {part}
              {index < contactParts.length - 1 && (
                <span style={{ color: ds.colors.secondary, opacity: 0.5 }}>
                  •
                </span>
              )}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Professional Summary */}
      {resume.summary && (
        <section style={{ marginBottom: `${ds.spacing.section}pt` }}>
          <h2 style={sectionHeaderStyle}>Professional Summary</h2>
          <p
            style={{
              margin: 0,
              textAlign: "justify",
              fontSize: `${ds.fontSize.body}pt`,
            }}
          >
            {resume.summary}
          </p>
        </section>
      )}

      {/* Work Experience */}
      {resume.experiences && resume.experiences.length > 0 && (
        <section style={{ marginBottom: `${ds.spacing.section}pt` }}>
          <h2 style={sectionHeaderStyle}>Work Experience</h2>
          {resume.experiences.map((exp, index) => (
            <div key={index} style={{ marginBottom: `${ds.spacing.element}pt` }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: `${ds.spacing.minimal}pt`,
                }}
              >
                <div>
                  <span style={{ fontWeight: "700", fontSize: `${ds.fontSize.h3}pt` }}>
                    {exp.role}
                  </span>
                  <span style={{ color: ds.colors.secondary }}> at </span>
                  <span
                    style={{ fontWeight: "600", color: ds.colors.primary }}
                  >
                    {exp.company}
                  </span>
                  {exp.location && (
                    <span
                      style={{
                        color: ds.colors.textLight,
                        fontStyle: "italic",
                      }}
                    >
                      , {exp.location}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: `${ds.fontSize.small}pt`,
                    fontWeight: "600",
                    color: ds.colors.textLight,
                  }}
                >
                  {exp.dateRange}
                </span>
              </div>
              <ul
                style={{
                  margin: `${ds.spacing.tight}pt 0 0 0`,
                  paddingLeft: `${ds.spacing.bulletIndent}pt`,
                  listStyleType: "circle",
                }}
              >
                {exp.bullets.map((bullet, bIndex) => (
                  <li
                    key={bIndex}
                    style={{
                      marginBottom: `${ds.spacing.minimal}pt`,
                      fontSize: `${ds.fontSize.body}pt`,
                      paddingLeft: `${ds.spacing.tight}pt`,
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
        <section style={{ marginBottom: `${ds.spacing.section}pt` }}>
          <h2 style={sectionHeaderStyle}>Projects</h2>
          {resume.projects.map((proj, index) => (
            <div key={index} style={{ marginBottom: `${ds.spacing.element}pt` }}>
              <div style={{ marginBottom: `${ds.spacing.minimal}pt` }}>
                <span style={{ fontWeight: "700", fontSize: `${ds.fontSize.h3}pt` }}>
                  {proj.name}
                </span>
                {proj.technologies && (
                  <span
                    style={{
                      fontSize: `${ds.fontSize.small}pt`,
                      color: ds.colors.textLight,
                      marginLeft: `${ds.spacing.tight}pt`,
                    }}
                  >
                    [{proj.technologies}]
                  </span>
                )}
              </div>
              <ul
                style={{
                  margin: `${ds.spacing.tight}pt 0 0 0`,
                  paddingLeft: `${ds.spacing.bulletIndent}pt`,
                  listStyleType: "circle",
                }}
              >
                {proj.bullets && proj.bullets.length > 0
                  ? proj.bullets.map((bullet, bIndex) => (
                      <li
                        key={bIndex}
                        style={{
                          fontSize: `${ds.fontSize.body}pt`,
                          marginBottom: `${ds.spacing.minimal}pt`,
                          paddingLeft: `${ds.spacing.tight}pt`,
                        }}
                      >
                        {bullet}
                      </li>
                    ))
                  : proj.description && (
                      <li
                        style={{
                          fontSize: `${ds.fontSize.body}pt`,
                          marginBottom: `${ds.spacing.minimal}pt`,
                          paddingLeft: `${ds.spacing.tight}pt`,
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
        <section style={{ marginBottom: `${ds.spacing.section}pt` }}>
          <h2 style={sectionHeaderStyle}>Education</h2>
          {resume.education.map((edu, index) => (
            <div key={index} style={{ marginBottom: `${ds.spacing.tight}pt` }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div>
                  <span style={{ fontWeight: "700", fontSize: `${ds.fontSize.h3}pt` }}>
                    {edu.institution}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: `${ds.fontSize.small}pt`,
                    color: ds.colors.textLight,
                  }}
                >
                  {edu.dateRange}
                </span>
              </div>
              <div style={{ fontSize: `${ds.fontSize.body}pt` }}>
                <span style={{ fontWeight: "500" }}>
                  {edu.degree} in {edu.field}
                </span>
                {edu.gpa && (
                  <span style={{ color: ds.colors.textLight }}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: `${ds.spacing.tight}pt` }}>
            {Object.entries(resume.skillsCategories).map(
              ([category, skills]) =>
                skills &&
                skills.length > 0 && (
                  <div
                    key={category}
                    style={{ fontSize: `${ds.fontSize.body}pt`, marginBottom: `${ds.spacing.minimal}pt` }}
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
            <p style={{ margin: 0, fontSize: `${ds.fontSize.body}pt` }}>
              {resume.skills.join("  •  ")}
            </p>
          </section>
        )
      )}

      {/* Certifications */}
      {resume.certifications && resume.certifications.length > 0 && (
        <section style={{ marginTop: `${ds.spacing.section}pt`, marginBottom: "0" }}>
          <h2 style={sectionHeaderStyle}>Certifications</h2>
          {resume.certifications.map((cert, index) => (
            <div key={index} style={{ fontSize: `${ds.fontSize.body}pt`, marginBottom: "1px" }}>
              <span style={{ fontWeight: "700" }}>{cert.name}</span>
              <span style={{ color: ds.colors.textLight }}>
                {" "}
                – {cert.issuer}
              </span>
              {cert.date && (
                <span style={{ color: ds.colors.textLight }}>
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
