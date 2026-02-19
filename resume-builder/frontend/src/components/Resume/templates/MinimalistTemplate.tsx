import { Fragment } from "react";
import { TemplateProps } from "../../../types/resume";
import { UnifiedDesignSystem } from "@shared/design-system";

export function MinimalistTemplate({ resume }: TemplateProps) {
  const ds = UnifiedDesignSystem;
  const borderStyle = "none";
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
    fontSize: `${ds.fontSize.contact}pt`,
    fontWeight: "700" as const,
    textTransform: "uppercase" as const,
    borderBottom: borderStyle,
    paddingBottom: `${ds.spacing.minimal}pt`,
    marginTop: `${ds.spacing.section + 4}pt`,
    marginBottom: `${ds.spacing.section}pt`,
    textAlign: "left" as const,
    color: ds.colors.textLight,
    letterSpacing: "1px",
  };

  return (
    <div
      style={{
        fontFamily: ds.fonts.primary.web,
        fontSize: `${ds.fontSize.contact}pt`,
        lineHeight: "1.4",
        color: ds.colors.text,
      }}
    >
      {/* Header - Contact Info */}
      <div style={{ textAlign: "left", marginBottom: `${ds.spacing.section + 8}pt` }}>
        <h1
          style={{
            fontSize: "24pt",
            fontWeight: "700",
            letterSpacing: "-1px",
            textTransform: "none",
            margin: 0,
            marginBottom: `${ds.spacing.element}pt`,
            color: ds.colors.text,
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
            justifyContent: "flex-start",
            gap: `${ds.spacing.section}px`,
            color: ds.colors.textLight,
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
        <section style={{ marginBottom: `${ds.spacing.section + 4}pt` }}>
          <h2 style={sectionHeaderStyle}>About</h2>
          <p
            style={{
              margin: 0,
              textAlign: "left",
              fontSize: `${ds.fontSize.body}pt`,
              maxWidth: "600px",
            }}
          >
            {resume.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {resume.experiences && resume.experiences.length > 0 && (
        <section style={{ marginBottom: `${ds.spacing.section + 4}pt` }}>
          <h2 style={sectionHeaderStyle}>Experience</h2>
          {resume.experiences.map((exp, index) => (
            <div key={index} style={{ marginBottom: `${ds.spacing.section + 4}pt` }}>
              <div
                style={{
                  marginBottom: `${ds.spacing.tight}pt`,
                }}
              >
                <span
                  style={{
                    fontWeight: "700",
                    fontSize: `${ds.fontSize.body}pt`,
                    color: ds.colors.text,
                    display: "block",
                  }}
                >
                  {exp.role}
                </span>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: `${ds.fontSize.contact}pt`,
                    color: ds.colors.textLight,
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
                  margin: `${ds.spacing.tight}pt 0 0 0`,
                  paddingLeft: "14px",
                  listStyleType: "none",
                }}
              >
                {exp.bullets.map((bullet, bIndex) => (
                  <li
                    key={bIndex}
                    style={{
                      marginBottom: `${ds.spacing.tight}pt`,
                      fontSize: `${ds.fontSize.body}pt`,
                      paddingLeft: "0",
                      position: "relative",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: "-12px",
                        color: ds.colors.primary,
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
        <section style={{ marginBottom: `${ds.spacing.section + 4}pt` }}>
          <h2 style={sectionHeaderStyle}>Projects</h2>
          {resume.projects.map((proj, index) => (
            <div key={index} style={{ marginBottom: `${ds.spacing.section}pt` }}>
              <div style={{ marginBottom: `${ds.spacing.minimal}pt` }}>
                <span style={{ fontWeight: "700", fontSize: `${ds.fontSize.body}pt` }}>
                  {proj.name}
                </span>
                {proj.technologies && (
                  <span
                    style={{
                      fontSize: `${ds.fontSize.contact}pt`,
                      color: ds.colors.textLight,
                      marginLeft: `${ds.spacing.element}pt`,
                    }}
                  >
                    {proj.technologies}
                  </span>
                )}
              </div>
              <p
                style={{
                  fontSize: `${ds.fontSize.body}pt`,
                  margin: `${ds.spacing.tight}pt 0`,
                  color: ds.colors.text,
                }}
              >
                {proj.description}
              </p>
              {/* Bullets for projects if any */}
              {proj.bullets && (
                <ul
                  style={{
                    margin: `${ds.spacing.tight}pt 0 0 0`,
                    paddingLeft: "14px",
                    listStyle: "none",
                  }}
                >
                  {proj.bullets.map((b, i) => (
                    <li
                      key={i}
                      style={{
                        fontSize: `${ds.fontSize.contact}pt`,
                        marginBottom: `${ds.spacing.minimal}pt`,
                        position: "relative",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          left: "-12px",
                          color: ds.colors.primary,
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
        <section style={{ marginBottom: `${ds.spacing.section + 4}pt` }}>
          <h2 style={sectionHeaderStyle}>Education</h2>
          {resume.education.map((edu, index) => (
            <div key={index} style={{ marginBottom: `${ds.spacing.element}pt` }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "700" }}>{edu.institution}</span>
                <span
                  style={{ color: ds.colors.textLight, fontSize: `${ds.fontSize.contact}pt` }}
                >
                  {edu.dateRange}
                </span>
              </div>
              <div style={{ fontSize: `${ds.fontSize.body}pt` }}>
                {edu.degree} in {edu.field}
                {edu.gpa && (
                  <span style={{ color: ds.colors.textLight }}>
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
            <div style={{ display: "flex", flexWrap: "wrap", gap: `${ds.spacing.section * 2}pt` }}>
              {Object.entries(resume.skillsCategories).map(
                ([cat, items]) =>
                  items &&
                  items.length > 0 && (
                    <div key={cat} style={{ minWidth: "120px" }}>
                      <div
                        style={{
                          fontSize: `${ds.fontSize.small}pt`,
                          fontWeight: "700",
                          textTransform: "uppercase",
                          color: ds.colors.textLight,
                          marginBottom: `${ds.spacing.tight}pt`,
                        }}
                      >
                        {cat}
                      </div>
                      <div style={{ fontSize: `${ds.fontSize.body}pt` }}>
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
          <p style={{ fontSize: `${ds.fontSize.body}pt` }}>{resume.skills.join(", ")}</p>
        </section>
      )}
    </div>
  );
}
