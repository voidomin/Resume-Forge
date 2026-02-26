import { GeneratedResume } from "../../../../types/resume";
import { UnifiedDesignSystem } from "@shared/design-system";

const ds = UnifiedDesignSystem;

// ----------------------------------------------------
// EXPERIENCES
// ----------------------------------------------------
export interface ExperienceSectionProps {
  experiences: GeneratedResume["experiences"];
  layout?: "standard" | "executive" | "modern" | "minimalist";
}

export function ExperienceSection({
  experiences,
  layout = "standard",
}: ExperienceSectionProps) {
  if (!experiences || experiences.length === 0) return null;

  return (
    <>
      {experiences.map((exp: GeneratedResume["experiences"][0]) => {
        const isExecutive = layout === "executive";
        const isMinimalist = layout === "minimalist";
        const isModern = layout === "modern";

        return (
          <div
            key={`${exp.company}-${exp.role}`}
            style={{
              marginBottom: isExecutive
                ? `${ds.spacing.section}pt`
                : `${ds.spacing.element}pt`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: isExecutive
                  ? "baseline"
                  : isModern
                    ? "center"
                    : "baseline",
                marginBottom: `${ds.spacing.tight}pt`,
              }}
            >
              <div>
                <span
                  style={{
                    fontWeight: "700",
                    fontSize: isExecutive ? `${ds.fontSize.h3}pt` : "inherit",
                    textTransform: isExecutive ? "uppercase" : "none",
                  }}
                >
                  {exp.role}
                </span>

                {isExecutive ? (
                  <span style={{ color: ds.colors.textLight }}> | </span>
                ) : isMinimalist ? (
                  <span style={{ margin: "0 8px" }}>—</span>
                ) : (
                  <span style={{ color: ds.colors.secondary }}> at </span>
                )}

                <span
                  style={{
                    fontWeight: isExecutive
                      ? "600"
                      : isMinimalist
                        ? "normal"
                        : "600",
                    fontStyle:
                      isExecutive || isMinimalist ? "italic" : "normal",
                    color: isStandardOrModern(layout)
                      ? ds.colors.primary
                      : "inherit",
                  }}
                >
                  {exp.company}
                </span>

                {exp.location && (
                  <span
                    style={{
                      color: ds.colors.textLight,
                      fontStyle: "italic",
                      marginLeft: isMinimalist ? "8px" : "0",
                    }}
                  >
                    {!isMinimalist && ", "}
                    {exp.location}
                  </span>
                )}
              </div>

              <span
                style={{
                  fontSize: `${ds.fontSize.small}pt`,
                  fontWeight: isExecutive ? "600" : "normal",
                  color:
                    isModern || isMinimalist ? ds.colors.textLight : "inherit",
                }}
              >
                {exp.dateRange}
              </span>
            </div>

            <ul
              style={{
                margin:
                  isExecutive || isModern
                    ? `${ds.spacing.element}pt 0 0 0`
                    : `${ds.spacing.tight}pt 0 0 0`,
                paddingLeft: isModern
                  ? `${ds.spacing.element}pt`
                  : `${ds.spacing.bulletIndent}pt`,
                listStyleType: isExecutive ? "square" : "circle",
              }}
            >
              {exp.bullets.map((bullet: string) => (
                <li
                  key={bullet.substring(0, 20)}
                  style={{
                    marginBottom: isExecutive
                      ? "3pt"
                      : `${ds.spacing.minimal}pt`,
                    fontSize: `${ds.fontSize.body}pt`,
                    paddingLeft: `${ds.spacing.tight}pt`,
                  }}
                >
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </>
  );
}

// ----------------------------------------------------
// HELPER FOR STYLING
// ----------------------------------------------------
function isStandardOrModern(layout: string) {
  return layout === "standard" || layout === "modern";
}

// ----------------------------------------------------
// EDUCATION
// ----------------------------------------------------
export interface EducationSectionProps {
  education: GeneratedResume["education"];
  layout?: "standard" | "executive" | "modern" | "minimalist";
}

export function EducationSection({
  education,
  layout = "standard",
}: EducationSectionProps) {
  if (!education || education.length === 0) return null;

  return (
    <>
      {education.map((edu: GeneratedResume["education"][0]) => {
        const isExecutive = layout === "executive";
        const isMinimalist = layout === "minimalist";

        return (
          <div
            key={`${edu.institution}-${edu.degree}`}
            style={{
              marginBottom: isExecutive
                ? `${ds.spacing.element}pt`
                : `${ds.spacing.tight}pt`,
            }}
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
                    fontSize:
                      isExecutive || layout === "modern"
                        ? `${ds.fontSize.h3}pt`
                        : "inherit",
                  }}
                >
                  {edu.institution}
                </span>
              </div>
              <span
                style={{
                  fontSize: `${ds.fontSize.small}pt`,
                  color:
                    layout === "modern" || isMinimalist
                      ? ds.colors.textLight
                      : "inherit",
                }}
              >
                {edu.dateRange}
              </span>
            </div>
            <div style={{ fontSize: `${ds.fontSize.body}pt` }}>
              <span
                style={{
                  fontWeight: isStandardOrModern(layout) ? "500" : "normal",
                  fontStyle: isExecutive || isMinimalist ? "italic" : "normal",
                }}
              >
                {edu.degree} in {edu.field}
              </span>
              {edu.gpa && (
                <span style={{ color: ds.colors.textLight }}>
                  {" | GPA: "}
                  {edu.gpa}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

// ----------------------------------------------------
// PROJECTS
// ----------------------------------------------------
export interface ProjectSectionProps {
  projects: NonNullable<GeneratedResume["projects"]>;
  layout?: "standard" | "executive" | "modern" | "minimalist";
}

export function ProjectSection({
  projects,
  layout = "standard",
}: ProjectSectionProps) {
  if (!projects || projects.length === 0) return null;

  return (
    <>
      {projects.map((proj: NonNullable<GeneratedResume["projects"]>[0]) => {
        const isExecutive = layout === "executive";
        const isMinimalist = layout === "minimalist";

        return (
          <div
            key={proj.name}
            style={{ marginBottom: `${ds.spacing.element}pt` }}
          >
            <div style={{ marginBottom: `${ds.spacing.minimal}pt` }}>
              <span
                style={{
                  fontWeight: "700",
                  fontSize:
                    isExecutive || layout === "modern"
                      ? `${ds.fontSize.h3}pt`
                      : "inherit",
                }}
              >
                {proj.name}
              </span>
              {proj.technologies && !isExecutive && !isMinimalist && (
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
                margin:
                  layout === "modern"
                    ? `${ds.spacing.element}pt 0 0 0`
                    : `${ds.spacing.tight}pt 0 0 0`,
                paddingLeft:
                  layout === "modern"
                    ? `${ds.spacing.element}pt`
                    : `${ds.spacing.bulletIndent}pt`,
                listStyleType: isExecutive ? "square" : "circle",
              }}
            >
              {proj.bullets && proj.bullets.length > 0
                ? proj.bullets.map((bullet: string) => (
                    <li
                      key={bullet.substring(0, 20)}
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
        );
      })}
    </>
  );
}
