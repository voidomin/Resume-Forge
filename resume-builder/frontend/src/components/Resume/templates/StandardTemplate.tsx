import { Fragment } from "react";
import { TemplateProps } from "../../../types/resume";
import { UnifiedDesignSystem } from "@shared/design-system";
import { ContactItem } from "./shared/TemplateHelpers";
import {
  ExperienceSection,
  EducationSection,
  ProjectSection,
} from "./shared/SectionRenderers";

export function StandardTemplate({ resume }: TemplateProps) {
  const ds = UnifiedDesignSystem;
  const borderStyle = `1px solid ${ds.colors.secondary}`;

  const contactParts = [
    <ContactItem key="phone" label="Phone" value={resume.contactInfo.phone} />,
    <ContactItem
      key="email"
      label="Email"
      value={resume.contactInfo.email}
      isLink
      href={`mailto:${resume.contactInfo.email}`}
    />,
    <ContactItem
      key="linkedin"
      label="LinkedIn"
      value={resume.contactInfo.linkedin}
      isLink
    />,
    <ContactItem
      key="github"
      label="GitHub"
      value={resume.contactInfo.github}
      isLink
    />,
    <ContactItem
      key="portfolio"
      label="Portfolio"
      value={resume.contactInfo.portfolio}
      isLink
    />,
  ].filter(
    (item) =>
      item.props.value &&
      item.props.value.trim().toLowerCase() !== "n/a" &&
      item.props.value.trim().toLowerCase() !== "none",
  );

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
      <div
        style={{ textAlign: "center", marginBottom: `${ds.spacing.section}pt` }}
      >
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
          <ExperienceSection
            experiences={resume.experiences}
            layout="standard"
          />
        </section>
      )}

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <section style={{ marginBottom: `${ds.spacing.section}pt` }}>
          <h2 style={sectionHeaderStyle}>Projects</h2>
          <ProjectSection projects={resume.projects} layout="standard" />
        </section>
      )}

      {/* Education */}
      {resume.education && resume.education.length > 0 && (
        <section style={{ marginBottom: `${ds.spacing.section}pt` }}>
          <h2 style={sectionHeaderStyle}>Education</h2>
          <EducationSection education={resume.education} layout="standard" />
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
                    style={{
                      fontSize: `${ds.fontSize.body}pt`,
                      marginBottom: `${ds.spacing.minimal}pt`,
                    }}
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
        <section
          style={{ marginTop: `${ds.spacing.section}pt`, marginBottom: "0" }}
        >
          <h2 style={sectionHeaderStyle}>Certifications</h2>
          {resume.certifications.map((cert) => (
            <div
              key={cert.name}
              style={{ fontSize: `${ds.fontSize.body}pt`, marginBottom: "1px" }}
            >
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

      {/* Coursework */}
      {resume.coursework && resume.coursework.length > 0 && (
        <section
          style={{ marginTop: `${ds.spacing.section}pt`, marginBottom: "0" }}
        >
          <h2 style={sectionHeaderStyle}>Coursework</h2>
          {resume.coursework.map((course) => (
            <div
              key={course.courseName}
              style={{ fontSize: `${ds.fontSize.body}pt`, marginBottom: "1px" }}
            >
              <span style={{ fontWeight: "700" }}>{course.courseName}</span>
              <span style={{ color: ds.colors.textLight }}>
                {" "}
                – {course.topic}
              </span>
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
          {resume.leadership.map((role) => (
            <div
              key={role.title}
              style={{ marginBottom: `${ds.spacing.tight}pt` }}
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
                    {role.title}
                  </span>
                  <span
                    style={{ color: ds.colors.textLight, marginLeft: "8px" }}
                  >
                    {role.organization}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: `${ds.fontSize.small}pt`,
                    color: ds.colors.textLight,
                  }}
                >
                  {role.dateRange}
                </span>
              </div>
              {role.description && (
                <p
                  style={{
                    fontSize: `${ds.fontSize.body}pt`,
                    margin: `${ds.spacing.minimal}pt 0 0 0`,
                    color: ds.colors.textLight,
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
          {resume.awards.map((award) => (
            <div
              key={award.awardName}
              style={{ fontSize: `${ds.fontSize.body}pt`, marginBottom: "1px" }}
            >
              <span style={{ fontWeight: "700" }}>{award.awardName}</span>
              <span style={{ color: ds.colors.textLight }}>
                {" "}
                – {award.organization}
              </span>
              {award.awardDate && (
                <span style={{ color: ds.colors.textLight }}>
                  {" "}
                  ({award.awardDate})
                </span>
              )}
              {award.description && (
                <p
                  style={{
                    fontSize: `${ds.fontSize.body}pt`,
                    margin: `${ds.spacing.minimal}pt 0 0 0`,
                    color: ds.colors.textLight,
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
