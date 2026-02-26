import { Fragment } from "react";
import { TemplateProps } from "../../../types/resume";
import { UnifiedDesignSystem } from "@shared/design-system";
import { ContactItem } from "./shared/TemplateHelpers";
import {
  ExperienceSection,
  EducationSection,
  ProjectSection,
} from "./shared/SectionRenderers";

export function MinimalistTemplate({ resume }: TemplateProps) {
  const ds = UnifiedDesignSystem;
  const borderStyle = "none";

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
      <div
        style={{
          textAlign: "left",
          marginBottom: `${ds.spacing.section + 8}pt`,
        }}
      >
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
          <ExperienceSection
            experiences={resume.experiences}
            layout="minimalist"
          />
        </section>
      )}

      {/* Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <section style={{ marginBottom: `${ds.spacing.section + 4}pt` }}>
          <h2 style={sectionHeaderStyle}>Projects</h2>
          <ProjectSection projects={resume.projects} layout="minimalist" />
        </section>
      )}

      {/* Education */}
      {resume.education && resume.education.length > 0 && (
        <section style={{ marginBottom: `${ds.spacing.section + 4}pt` }}>
          <h2 style={sectionHeaderStyle}>Education</h2>
          <EducationSection education={resume.education} layout="minimalist" />
        </section>
      )}

      {/* Skills */}
      {resume.skillsCategories &&
        Object.keys(resume.skillsCategories).length > 0 && (
          <section>
            <h2 style={sectionHeaderStyle}>Skills</h2>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: `${ds.spacing.section * 2}pt`,
              }}
            >
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
          <p style={{ fontSize: `${ds.fontSize.body}pt` }}>
            {resume.skills.join(", ")}
          </p>
        </section>
      )}

      {/* Certifications */}
      {resume.certifications && resume.certifications.length > 0 && (
        <section style={{ marginBottom: `${ds.spacing.section + 4}pt` }}>
          <h2 style={sectionHeaderStyle}>Certifications</h2>
          {resume.certifications.map((cert) => (
            <div
              key={cert.name}
              style={{
                marginBottom: `${ds.spacing.element}pt`,
                fontSize: `${ds.fontSize.body}pt`,
              }}
            >
              <span style={{ fontWeight: "700" }}>{cert.name}</span>
              {cert.issuer && (
                <span style={{ color: ds.colors.textLight }}>
                  {" "}
                  – {cert.issuer}
                </span>
              )}
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
        <section style={{ marginBottom: `${ds.spacing.section + 4}pt` }}>
          <h2 style={sectionHeaderStyle}>Coursework</h2>
          {resume.coursework.map((course) => (
            <div
              key={course.courseName}
              style={{
                marginBottom: `${ds.spacing.element}pt`,
                fontSize: `${ds.fontSize.body}pt`,
              }}
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
        <section style={{ marginBottom: `${ds.spacing.section + 4}pt` }}>
          <h2 style={sectionHeaderStyle}>Leadership</h2>
          {resume.leadership.map((role) => (
            <div
              key={role.title}
              style={{ marginBottom: `${ds.spacing.element}pt` }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: `${ds.spacing.minimal}pt`,
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
                      color: ds.colors.textLight,
                      fontSize: `${ds.fontSize.contact}pt`,
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
                    margin: `${ds.spacing.tight}pt 0 0 0`,
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
        <section style={{ marginBottom: `${ds.spacing.section + 4}pt` }}>
          <h2 style={sectionHeaderStyle}>Awards</h2>
          {resume.awards.map((award) => (
            <div
              key={award.awardName}
              style={{
                marginBottom: `${ds.spacing.element}pt`,
                fontSize: `${ds.fontSize.body}pt`,
              }}
            >
              <span style={{ fontWeight: "700" }}>{award.awardName}</span>
              {award.organization && (
                <span style={{ color: ds.colors.textLight }}>
                  {" "}
                  – {award.organization}
                </span>
              )}
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
                    margin: `${ds.spacing.tight}pt 0 0 0`,
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
