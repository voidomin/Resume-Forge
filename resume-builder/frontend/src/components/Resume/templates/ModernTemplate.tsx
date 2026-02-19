import { Fragment } from "react";
import { TemplateProps } from "../../../types/resume";
import { UnifiedDesignSystem } from "@shared/design-system";

export function ModernTemplate({ resume }: TemplateProps) {
  // Use Unified Design System
  const ds = UnifiedDesignSystem;

  // Helper functions
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
              color: ds.colors.primary,
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

  // Section header using design system
  const sectionHeaderStyle: React.CSSProperties = {
    fontSize: `${ds.fontSize.h2}pt`,
    fontWeight: ds.fontWeights.extrabold,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    borderBottom: `${ds.borders.sectionUnderline.width}px solid ${ds.colors.primary}`,
    paddingBottom: `${ds.spacing.tight}pt`,
    marginTop: `${ds.spacing.section}pt`,
    marginBottom: `${ds.spacing.element}pt`,
    textAlign: "left",
    color: ds.colors.primary,
  };

  return (
    <div
      style={{
        fontFamily: ds.fonts.primary.web,
        fontSize: `${ds.fontSize.body}pt`,
        lineHeight: ds.spacing.line,
        color: ds.colors.text,
      }}
    >
      {/* Header - Contact Info */}
      <div
        style={{ textAlign: "center", marginBottom: `${ds.spacing.section}pt` }}
      >
        <h1
          style={{
            fontSize: `${ds.fontSize.h1}pt`,
            fontWeight: ds.fontWeights.extrabold,
            letterSpacing: "-0.5px",
            textTransform: "uppercase",
            margin: 0,
            marginBottom: `${ds.spacing.tight}pt`,
            color: ds.colors.primary,
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
            color: ds.colors.textLight,
          }}
        >
          {contactParts.map((part, index) => (
            <Fragment key={index}>
              {part}
              {index < contactParts.length - 1 && (
                <span style={{ color: ds.colors.secondary, opacity: 0.5 }}>
                  |
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
              lineHeight: ds.spacing.line,
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
            <div
              key={index}
              style={{ marginBottom: `${ds.spacing.element}pt` }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: `${ds.spacing.minimal}pt`,
                }}
              >
                <div>
                  <span
                    style={{
                      fontWeight: ds.fontWeights.bold,
                      fontSize: `${ds.fontSize.h3}pt`,
                      color: ds.colors.text,
                    }}
                  >
                    {exp.role}
                  </span>
                  <span style={{ color: ds.colors.secondary }}> | </span>
                  <span
                    style={{
                      fontWeight: ds.fontWeights.semibold,
                      color: ds.colors.primary,
                    }}
                  >
                    {exp.company}
                  </span>
                  {exp.location && (
                    <span
                      style={{
                        fontSize: `${ds.fontSize.small}pt`,
                        color: ds.colors.textLight,
                        marginLeft: `${ds.spacing.tight}pt`,
                      }}
                    >
                      ({exp.location})
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: `${ds.fontSize.small}pt`,
                    fontWeight: ds.fontWeights.semibold,
                    color: ds.colors.text,
                    flexShrink: 0,
                  }}
                >
                  {exp.dateRange}
                </span>
              </div>
              <ul
                style={{
                  margin: `${ds.spacing.tight}pt 0 0 0`,
                  paddingLeft: `${ds.spacing.bulletIndent}pt`,
                  listStyleType: "disc",
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
            <div
              key={index}
              style={{ marginBottom: `${ds.spacing.element}pt` }}
            >
              <div style={{ marginBottom: `${ds.spacing.minimal}pt` }}>
                <span
                  style={{
                    fontWeight: ds.fontWeights.bold,
                    fontSize: `${ds.fontSize.h3}pt`,
                  }}
                >
                  {proj.name}
                </span>
                {proj.technologies && (
                  <span
                    style={{
                      fontSize: `${ds.fontSize.body}pt`,
                      color: ds.colors.secondary,
                      fontStyle: "italic",
                      marginLeft: `${ds.spacing.tight + 2}pt`,
                    }}
                  >
                    — {proj.technologies}
                  </span>
                )}
              </div>
              <ul
                style={{
                  margin: `${ds.spacing.tight}pt 0 0 0`,
                  paddingLeft: `${ds.spacing.bulletIndent}pt`,
                  listStyleType: "disc",
                }}
              >
                {proj.bullets && proj.bullets.length > 0
                  ? proj.bullets.map((bullet, bIndex) => (
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
                    ))
                  : proj.description && (
                      <li
                        style={{
                          marginBottom: `${ds.spacing.minimal}pt`,
                          fontSize: `${ds.fontSize.body}pt`,
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
            <div
              key={index}
              style={{ marginBottom: `${ds.spacing.tight + 2}pt` }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div>
                  <span
                    style={{
                      fontWeight: ds.fontWeights.bold,
                      color: ds.colors.primary,
                    }}
                  >
                    {edu.institution}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: `${ds.fontSize.small}pt`,
                    fontWeight: ds.fontWeights.semibold,
                    flexShrink: 0,
                  }}
                >
                  {edu.dateRange}
                </span>
              </div>
              <div style={{ fontSize: `${ds.fontSize.body}pt` }}>
                <span style={{ fontWeight: ds.fontWeights.medium }}>
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: `${ds.spacing.tight}pt`,
            }}
          >
            {Object.entries(resume.skillsCategories).map(
              ([category, skills]) =>
                skills &&
                skills.length > 0 && (
                  <div
                    key={category}
                    style={{ fontSize: `${ds.fontSize.body}pt` }}
                  >
                    <span
                      style={{
                        fontWeight: ds.fontWeights.bold,
                        color: ds.colors.primary,
                        marginRight: `${ds.spacing.tight + 2}pt`,
                      }}
                    >
                      {category}:
                    </span>
                    <span style={{ color: ds.colors.text }}>
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
            <p
              style={{
                margin: 0,
                fontSize: `${ds.fontSize.body}pt`,
                lineHeight: ds.spacing.line,
              }}
            >
              {resume.skills.join("  •  ")}
            </p>
          </section>
        )
      )}

      {/* Certifications */}
      {resume.certifications && resume.certifications.length > 0 && (
        <section
          style={{ marginTop: `${ds.spacing.section}pt`, marginBottom: "0" }}
        >
          <h2 style={sectionHeaderStyle}>Certifications</h2>
          {resume.certifications.map((cert, index) => (
            <div
              key={index}
              style={{
                fontSize: `${ds.fontSize.body}pt`,
                marginBottom: `${ds.spacing.minimal}pt`,
              }}
            >
              <span style={{ fontWeight: ds.fontWeights.bold }}>
                {cert.name}
              </span>
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
