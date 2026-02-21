import { Fragment } from "react";
import { TemplateProps } from "../../../types/resume";
import { UnifiedDesignSystem } from "@shared/design-system";

export function ExecutiveTemplate({ resume }: TemplateProps) {
  const ds = UnifiedDesignSystem;
  const accentColor = ds.colors.primary;
  const borderStyle = `1px solid ${ds.colors.secondary}`;
  const linkColor = ds.colors.text;

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
    paddingBottom: `${ds.spacing.tight}pt`,
    marginTop: `${ds.spacing.section + 4}pt`,
    marginBottom: `${ds.spacing.element}pt`,
    textAlign: "center" as const,
    color: accentColor,
    letterSpacing: "1px",
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
      <div
        style={{
          textAlign: "center",
          marginBottom: `${ds.spacing.section + 4}pt`,
        }}
      >
        <h1
          style={{
            fontSize: "24pt",
            fontWeight: "700",
            textTransform: "uppercase",
            margin: 0,
            marginBottom: `${ds.spacing.element}pt`,
            color: accentColor,
            letterSpacing: "1px",
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
            gap: `${ds.spacing.section}px`,
            color: ds.colors.textLight,
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
        <section style={{ marginBottom: `${ds.spacing.section + 4}pt` }}>
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

      {/* Executive usually puts Experience first */}
      {/* Work Experience */}
      {resume.experiences && resume.experiences.length > 0 && (
        <section style={{ marginBottom: `${ds.spacing.section + 4}pt` }}>
          <h2 style={sectionHeaderStyle}>Work Experience</h2>
          {resume.experiences.map((exp, index) => (
            <div
              key={index}
              style={{ marginBottom: `${ds.spacing.section}pt` }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: `${ds.spacing.tight}pt`,
                }}
              >
                <div>
                  <span
                    style={{
                      fontWeight: "700",
                      fontSize: `${ds.fontSize.h3}pt`,
                      textTransform: "uppercase",
                    }}
                  >
                    {exp.role}
                  </span>
                  <span style={{ color: ds.colors.textLight }}> | </span>
                  <span style={{ fontWeight: "600", fontStyle: "italic" }}>
                    {exp.company}
                  </span>
                  {exp.location && (
                    <span style={{ color: ds.colors.textLight }}>
                      , {exp.location}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: `${ds.fontSize.small}pt`,
                    fontWeight: "600",
                  }}
                >
                  {exp.dateRange}
                </span>
              </div>
              <ul
                style={{
                  margin: `${ds.spacing.element}pt 0 0 0`,
                  paddingLeft: `${ds.spacing.bulletIndent}pt`,
                  listStyleType: "square",
                }}
              >
                {exp.bullets.map((bullet, bIndex) => (
                  <li
                    key={bIndex}
                    style={{
                      marginBottom: `${3}pt`,
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

      {/* Education */}
      {resume.education && resume.education.length > 0 && (
        <section style={{ marginBottom: `${ds.spacing.section + 4}pt` }}>
          <h2 style={sectionHeaderStyle}>Education</h2>
          {resume.education.map((edu, index) => (
            <div
              key={index}
              style={{ marginBottom: `${ds.spacing.element}pt` }}
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
                      fontWeight: "700",
                      fontSize: `${ds.fontSize.h3}pt`,
                    }}
                  >
                    {edu.institution}
                  </span>
                </div>
                <span style={{ fontSize: `${ds.fontSize.small}pt` }}>
                  {edu.dateRange}
                </span>
              </div>
              <div style={{ fontSize: `${ds.fontSize.body}pt` }}>
                <span style={{ fontStyle: "italic" }}>
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

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <section style={{ marginBottom: `${ds.spacing.section + 4}pt` }}>
          <h2 style={sectionHeaderStyle}>Projects</h2>
          {resume.projects.map((proj, index) => (
            <div
              key={index}
              style={{ marginBottom: `${ds.spacing.element}pt` }}
            >
              <div style={{ marginBottom: `${ds.spacing.minimal}pt` }}>
                <span
                  style={{ fontWeight: "700", fontSize: `${ds.fontSize.h3}pt` }}
                >
                  {proj.name}
                </span>
              </div>
              <ul
                style={{
                  margin: `${ds.spacing.tight}pt 0 0 0`,
                  paddingLeft: `${ds.spacing.bulletIndent}pt`,
                  listStyleType: "square",
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

      {/* Technical Skills */}
      {resume.skillsCategories &&
      Object.keys(resume.skillsCategories).length > 0 ? (
        <section style={{ marginBottom: "0" }}>
          <h2 style={sectionHeaderStyle}>Competencies</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: `${ds.spacing.element}pt`,
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
                        fontWeight: "700",
                        textTransform: "uppercase",
                        fontSize: `${ds.fontSize.contact}pt`,
                        color: ds.colors.textLight,
                      }}
                    >
                      {category}
                    </span>
                    <div style={{ marginTop: `${ds.spacing.minimal}pt` }}>
                      {skills.join(", ")}
                    </div>
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
            <p style={{ margin: 0, fontSize: `${ds.fontSize.body}pt` }}>
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
              style={{ fontSize: `${ds.fontSize.body}pt`, marginBottom: "1px" }}
            >
              <span style={{ fontWeight: "700" }}>{cert.name}</span>
              <span style={{ color: ds.colors.textLight }}>
                {" "}
                – {cert.issuer}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* Coursework */}
      {resume.coursework && resume.coursework.length > 0 && (
        <section
          style={{ marginTop: `${ds.spacing.section}pt`, marginBottom: "0" }}
        >
          <h2 style={sectionHeaderStyle}>Coursework</h2>
          {resume.coursework.map((course, index) => (
            <div
              key={index}
              style={{ fontSize: `${ds.fontSize.body}pt`, marginBottom: "1px" }}
            >
              <span style={{ fontWeight: "700" }}>{course.courseName}</span>
              {course.topic && (
                <span style={{ color: ds.colors.textLight }}>
                  {" "}
                  – {course.topic}
                </span>
              )}
              {course.institution && (
                <span style={{ color: ds.colors.textLight }}>
                  {" "}
                  ({course.institution})
                </span>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Leadership */}
      {resume.leadership && resume.leadership.length > 0 && (
        <section
          style={{ marginTop: `${ds.spacing.section}pt`, marginBottom: "0" }}
        >
          <h2 style={sectionHeaderStyle}>Leadership</h2>
          {resume.leadership.map((role, index) => (
            <div key={index} style={{ marginBottom: `${ds.spacing.tight}pt` }}>
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
                      fontWeight: "700",
                      fontSize: `${ds.fontSize.body}pt`,
                    }}
                  >
                    {role.title}
                  </span>
                  {role.organization && (
                    <span
                      style={{ color: ds.colors.textLight, marginLeft: "8px" }}
                    >
                      – {role.organization}
                    </span>
                  )}
                </div>
                {role.dateRange && (
                  <span
                    style={{
                      fontSize: `${ds.fontSize.contact}pt`,
                      color: ds.colors.textLight,
                    }}
                  >
                    {role.dateRange}
                  </span>
                )}
              </div>
              {role.description && (
                <p
                  style={{
                    fontSize: `${ds.fontSize.body}pt`,
                    margin: `${ds.spacing.minimal}pt 0 0 0`,
                    color: ds.colors.text,
                  }}
                >
                  {role.description}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Awards */}
      {resume.awards && resume.awards.length > 0 && (
        <section
          style={{ marginTop: `${ds.spacing.section}pt`, marginBottom: "0" }}
        >
          <h2 style={sectionHeaderStyle}>Awards</h2>
          {resume.awards.map((award, index) => (
            <div
              key={index}
              style={{ fontSize: `${ds.fontSize.body}pt`, marginBottom: "1px" }}
            >
              <span style={{ fontWeight: "700" }}>{award.awardName}</span>
              {award.organization && (
                <span style={{ color: ds.colors.textLight }}>
                  {" "}
                  – {award.organization}
                </span>
              )}
              {award.description && (
                <p
                  style={{
                    fontSize: `${ds.fontSize.body}pt`,
                    margin: `${ds.spacing.minimal}pt 0 0 0`,
                    color: ds.colors.text,
                  }}
                >
                  {award.description}
                </p>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
