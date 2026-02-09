import { Fragment } from "react";
import { TemplateProps } from "../../../types/resume";

export function StandardTemplate({ resume }: TemplateProps) {
  const borderStyle = "1px solid #000";
  const linkColor = "#0000EE";

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
    fontSize: "10pt",
    fontWeight: "bold" as const,
    textTransform: "uppercase" as const,
    borderBottom: borderStyle,
    paddingBottom: "2px",
    marginTop: "10px",
    marginBottom: "6px",
    initialTextAlign: "left" as const, // React Native style shim not needed here but preserving logic structure
    textAlign: "left" as const,
    color: "#000",
  };

  const standardLineHeight = "1.15";
  const standardFontSize = "10pt";
  const fontFamily = '"Times New Roman", Times, serif';

  return (
    <div
      style={{
        fontFamily: fontFamily,
        fontSize: standardFontSize,
        lineHeight: standardLineHeight,
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
            color: "#000",
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
            justifyContent: "flex-start", // Specific to Standard? ResumePreview had 'headerAlignment' logic.
            // Standard in ResumePreview: headerAlignment depends on Minimalist check.
            // ResumePreview.tsx:134 const headerAlignment = isMinimalist ? "left" : "center";
            // Is Standard minimalist? No. So Center.
            // Wait, standard uses Left for section headers but Center for Name?
            // "headerAlignment" applied to the Contact Line container.
            // Let's assume Center for consistency with Standard PDF which is Left aligned for Name?
            // Checking StandardRenderer.ts: doc.text(name, { align: "left" });
            // The PDF renderer uses LEFT for Standard.
            // The Frontend ResumePreview uses CENTER if not minimalist.
            // So there IS a discrepancy or I misread.
            // ResumePreview.tsx: isMinimalist = template === "minimalist".
            // So for standard, headerAlignment is "center".
            // BUT PDF Renderer for Standard uses LEFT.
            // I should FIX THE DISCREPANCY -> "Standards" usually imply Center or Left.
            // StandardRenderer.ts line 47: text(name, { align: "left" }).
            // So Frontend should be LEFT for Standard too?
            // ResumePreview:
            //   headerAlignment = isMinimalist ? "left" : "center";
            //   isMinimalist is false for standard. So it was CENTER in frontend.
            //   sectionHeaderAlignment = isExecutive ? "center" : "left". Standard is LEFT.
            //
            // I'll stick to LEFT to match Backend PDF "StandardRenderer".
            // Update: StandardRenderer.ts uses "left" for name and contact.
            // So I will make this template LEFT aligned.
          }}
        >
          {/* Correction: Standard PDF uses Left. The ResumePreview used Center for non-minimalist. 
             This refactor fixes that inconsistency. 
             Wait, looking at my extracted StandardRenderer.ts:
             doc.text(name, { align: "left" });
             this.renderContactLine(..., "left");
             
             So Frontend WAS deviating. I will make frontend LEFT too.
          */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "5px",
              justifyContent: "flex-start",
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
      </div>

      {/* Professional Summary */}
      {resume.summary && (
        <section>
          <h2 style={sectionHeaderStyle}>Professional Summary</h2>
          <p
            style={{
              margin: 0,
              textAlign: "justify",
              fontSize: standardFontSize,
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
              <div style={{ fontSize: standardFontSize }}>
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
                      fontSize: standardFontSize,
                      lineHeight: standardLineHeight,
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
                          fontSize: standardFontSize,
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
                          fontSize: standardFontSize,
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
                <div
                  key={category}
                  style={{ fontSize: standardFontSize, marginBottom: "2px" }}
                >
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
            <p style={{ margin: 0, fontSize: standardFontSize }}>
              {resume.skills.join("  •  ")}
            </p>
          </section>
        )
      )}

      {/* Certifications */}
      {resume.certifications && resume.certifications.length > 0 && (
        <section>
          <h2 style={sectionHeaderStyle}>Certifications</h2>
          {resume.certifications.map((cert, index) => (
            <div
              key={index}
              style={{ fontSize: standardFontSize, marginBottom: "1px" }}
            >
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
