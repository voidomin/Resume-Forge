import PDFDocument from "pdfkit";
import { GeneratedResume } from "../gemini.service";
import { BaseTemplateRenderer } from "./BaseTemplateRenderer";
import {
  UnifiedDesignSystem,
  contentDensityEngine,
  DensityLevel,
  ScaledDesignSystem,
} from "../../../../shared/design-system";

export class ExecutiveRenderer extends BaseTemplateRenderer {
  render(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    fontScale: number = 1,
    spacingScale: number = 1,
  ): void {
    // Delegate to renderWithDensity for consistency
    this.renderWithDensity(doc, resume, "normal");
  }
    doc.page.margins = {
      top: scaledMargin,
      bottom: scaledMargin,
      left: scaledMargin,
      right: scaledMargin,
    };

    // Helper: Section Headers (Centered, Uppercase, Primary Color)
    const drawHeader = (title: string) => {
      this.moveDownPoints(doc, 5);
      doc
        .font(fontBold)
        .fontSize(ds.fontSize.h2)
        .fillColor(UnifiedDesignSystem.colors.primary)
        .text(title.toUpperCase(), { align: "center", characterSpacing: 1 });

      const y = doc.y + 2;
      doc
        .strokeColor(UnifiedDesignSystem.colors.secondary)
        .lineWidth(0.5)
        .moveTo(scaledMargin + 64, y)
        .lineTo(595 - scaledMargin - 64, y)
        .stroke();

      doc.y = y + ds.spacing.element;
    };

    // 1. Header Name
    doc
      .font(fontBold)
      .fontSize(ds.fontSize.h1 * 1.2)
      .fillColor(UnifiedDesignSystem.colors.primary)
      .text(resume.contactInfo.name.toUpperCase(), {
        align: "center",
        characterSpacing: 1,
      });

    this.moveDownPoints(doc, 3);

    // 2. Contact Line
    this.renderContactLine(
      doc,
      resume,
      fontRegular,
      ds.fontSize.body,
      true,
      "center",
    );

    this.moveDownPoints(doc, 8);

    // 3. Summary
    if (resume.summary) {
      drawHeader("PROFESSIONAL SUMMARY");
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(resume.summary, { align: "justify", lineGap: 1.5 });
      doc.y += ds.spacing.section;
    }

    // 4. Experience
    if (resume.experiences?.length) {
      drawHeader("WORK EXPERIENCE");
      resume.experiences.forEach((exp) => {
        // Role | Company | Location
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body + 1)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(exp.role.toUpperCase(), { continued: true });

        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(" | ", { continued: true })
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(exp.company, { continued: true })
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(exp.location ? ` | ${exp.location}` : "", { continued: false });

        // Date
        doc.moveUp(1);
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.primary)
          .text(exp.dateRange, { align: "right" });

        this.moveDownPoints(doc, 5);

        // Bullets
        exp.bullets.forEach((b: string) => {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body)
            .fillColor(UnifiedDesignSystem.colors.text)
            .text(`▪  ${b}`, scaledMargin + 14, doc.y, {
              width: 595 - scaledMargin * 2 - 28,
              align: "left",
              lineGap: 1.5,
            });
        });
        doc.y += ds.spacing.element;
      });
      doc.y += ds.spacing.section;
    }

    // 5. Projects
    if (resume.projects?.length) {
      drawHeader("PROJECTS");
      resume.projects.forEach((proj) => {
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body + 1)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(proj.name, { continued: true });

        if (proj.link) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body)
            .fillColor(UnifiedDesignSystem.colors.primary)
            .text(`  [${proj.link}]`, { link: proj.link, continued: false });
        } else {
          doc.text("");
        }

        // Description
        if (proj.description) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body)
            .fillColor(UnifiedDesignSystem.colors.text)
            .text(proj.description);
        }

        if (proj.bullets) {
          proj.bullets.forEach((b: string) => {
            doc
              .font(fontRegular)
              .fontSize(ds.fontSize.body)
              .fillColor(UnifiedDesignSystem.colors.text)
              .text(`▪  ${b}`, scaledMargin + 14, doc.y, {
                width: 595 - scaledMargin * 2 - 28,
                align: "left",
                lineGap: 1.5,
              });
          });
        }
        doc.y += ds.spacing.element;
      });
      doc.y += ds.spacing.section;
    }

    // 6. Education
    if (resume.education?.length) {
      drawHeader("EDUCATION");
      resume.education.forEach((edu) => {
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(edu.institution, { continued: true });

        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(`  |  ${edu.dateRange}`, { align: "right" });

        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(`${edu.degree} in ${edu.field}`);

        if (edu.gpa) {
          doc
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(`GPA: ${edu.gpa}`);
        }
        doc.y += ds.spacing.element;
      });
      doc.y += ds.spacing.section;
    }

    // 7. Skills
    if (resume.skills?.length) {
      drawHeader("COMPETENCIES");
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(resume.skills.join("  •  "), {
          align: "center",
          lineGap: 1.5,
        });
    }

    // Optional Sections
    if (resume.coursework?.length) {
      drawHeader("RELEVANT COURSEWORK");
      resume.coursework.forEach((course) => {
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(`${course.courseName}`, { continued: true });
        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(
            ` | ${course.topic}${
              course.institution ? ` (${course.institution})` : ""
            }`,
          );
      });
      doc.y += ds.spacing.section;
    }

    if (resume.leadership?.length) {
      drawHeader("LEADERSHIP & EXTRACURRICULAR");
      resume.leadership.forEach((role) => {
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.h3)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(role.title, { continued: true });
        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.secondary)
          .text(" | ", { continued: true })
          .fillColor(UnifiedDesignSystem.colors.primary)
          .text(role.organization);
        if (role.location) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body)
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(role.location);
        }
        if (role.description) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body)
            .fillColor(UnifiedDesignSystem.colors.text)
            .text(role.description, { lineGap: 1 });
        }
        doc.y += ds.spacing.tight;
      });
      doc.y += ds.spacing.section;
    }

    if (resume.awards?.length) {
      drawHeader("HONORS & AWARDS");
      resume.awards.forEach((award) => {
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.h3)
          .fillColor(UnifiedDesignSystem.colors.primary)
          .text(award.awardName, { continued: true });
        doc
          .font(fontRegular)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(
            ` | ${award.organization}${
              award.awardDate ? ` (${award.awardDate})` : ""
            }`,
          );
        if (award.description) {
          doc
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(award.description, { oblique: true });
        }
        doc.y += ds.spacing.tight;
      });
    }
  }

  /**
   * Render with density-aware section visibility and scaling
   */
  renderWithDensity(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    density: DensityLevel,
  ): void {
    // Get scaled design system for this density
    const ds: ScaledDesignSystem =
      contentDensityEngine.getScaledDesignSystem(density);
    const fontRegular = UnifiedDesignSystem.fonts.primary.pdf;
    const fontBold = UnifiedDesignSystem.fonts.primary.pdfBold;
    const scaledMargin = ds.margins.pageLeft;

    // Apply scaled margins to document
    doc.page.margins = {
      top: ds.margins.pageTop,
      bottom: ds.margins.pageBottom,
      left: ds.margins.pageLeft,
      right: ds.margins.pageRight,
    };

    // Helper: Section Headers (Centered, Uppercase, Primary Color)
    const drawHeader = (title: string) => {
      this.moveDownPoints(doc, 5);
      doc
        .font(fontBold)
        .fontSize(ds.fontSize.h2)
        .fillColor(UnifiedDesignSystem.colors.primary)
        .text(title.toUpperCase(), { align: "center", characterSpacing: 1 });

      const y = doc.y + 2;
      doc
        .strokeColor(UnifiedDesignSystem.colors.secondary)
        .lineWidth(0.5)
        .moveTo(scaledMargin + 64, y)
        .lineTo(595 - scaledMargin - 64, y)
        .stroke();

      doc.y = y + ds.spacing.element;
    };

    // 1. Header Name
    doc
      .font(fontBold)
      .fontSize(ds.fontSize.h1 * 1.2)
      .fillColor(UnifiedDesignSystem.colors.primary)
      .text(resume.contactInfo.name.toUpperCase(), {
        align: "center",
        characterSpacing: 1,
      });

    this.moveDownPoints(doc, 3);

    // 2. Contact Line
    this.renderContactLine(
      doc,
      resume,
      fontRegular,
      ds.fontSize.body,
      true,
      "center",
    );

    this.moveDownPoints(doc, 8);

    // 3. Professional Summary
    if (resume.summary) {
      drawHeader("EXECUTIVE PROFILE");
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(resume.summary, { align: "center", lineGap: 1.5 });
      doc.y += ds.spacing.section;
    }

    // 4. Work Experience
    if (resume.experiences?.length) {
      drawHeader("PROFESSIONAL EXPERIENCE");
      resume.experiences.forEach((exp) => {
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.h3)
          .fillColor(UnifiedDesignSystem.colors.primary)
          .text(exp.role, { continued: true });
        doc
          .font(fontRegular)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.secondary)
          .text(` | ${exp.company}`);
        doc
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(`${exp.location} | ${exp.dateRange}`, {
            oblique: true,
          });

        exp.bullets.forEach((b: string) => {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body)
            .fillColor(UnifiedDesignSystem.colors.text)
            .text(`• ${b}`, { lineGap: 1 });
        });
        doc.y += ds.spacing.element;
      });
      doc.y += ds.spacing.section;
    }

    // 5. Projects
    if (resume.projects?.length) {
      drawHeader("NOTABLE PROJECTS");
      resume.projects.forEach((proj) => {
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.h3)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(proj.name, { continued: true });
        if (proj.technologies) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.small)
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(` | ${proj.technologies}`, {
              oblique: true,
              continued: false,
            });
        } else {
          doc.text("");
        }

        if (proj.bullets) {
          proj.bullets.forEach((b: string) => {
            doc
              .font(fontRegular)
              .fontSize(ds.fontSize.body)
              .fillColor(UnifiedDesignSystem.colors.text)
              .text(`• ${b}`, { lineGap: 1 });
          });
        } else if (proj.description) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body)
            .fillColor(UnifiedDesignSystem.colors.text)
            .text(proj.description, { lineGap: 1 });
        }
        doc.y += ds.spacing.element;
      });
      doc.y += ds.spacing.section;
    }

    // 6. Education
    if (resume.education?.length) {
      drawHeader("EDUCATION");
      resume.education.forEach((edu) => {
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.h3)
          .fillColor(UnifiedDesignSystem.colors.primary)
          .text(edu.institution, { continued: true });
        doc
          .font(fontRegular)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(` | ${edu.degree} in ${edu.field}`);
        if (edu.dateRange) {
          doc
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(edu.dateRange, { oblique: true });
        }
        if (edu.gpa) {
          doc
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(`GPA: ${edu.gpa}`);
        }
        doc.y += ds.spacing.element;
      });
      doc.y += ds.spacing.section;
    }

    // 7. Skills
    if (resume.skills?.length) {
      drawHeader("COMPETENCIES");
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(resume.skills.join("  •  "), {
          align: "center",
          lineGap: 1.5,
        });
    }

    // Optional Sections - Only show if visible at this density
    if (
      resume.certifications?.length &&
      contentDensityEngine.isSectionVisible(density, "certifications")
    ) {
      drawHeader("CERTIFICATIONS");
      resume.certifications.forEach((cert) => {
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(`${cert.name}`, { continued: true });
        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(` | ${cert.issuer}${cert.date ? ` (${cert.date})` : ""}`);
      });
      doc.y += ds.spacing.section;
    }

    if (
      resume.coursework?.length &&
      contentDensityEngine.isSectionVisible(density, "coursework")
    ) {
      drawHeader("RELEVANT COURSEWORK");
      resume.coursework.forEach((course) => {
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(`${course.courseName}`, { continued: true });
        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(
            ` | ${course.topic}${
              course.institution ? ` (${course.institution})` : ""
            }`,
          );
      });
      doc.y += ds.spacing.section;
    }

    if (
      resume.leadership?.length &&
      contentDensityEngine.isSectionVisible(density, "leadership")
    ) {
      drawHeader("LEADERSHIP & EXTRACURRICULAR");
      resume.leadership.forEach((role) => {
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.h3)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(role.title, { continued: true });
        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.secondary)
          .text(" | ", { continued: true })
          .fillColor(UnifiedDesignSystem.colors.primary)
          .text(role.organization);
        if (role.location) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body)
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(role.location);
        }
        if (role.description) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body)
            .fillColor(UnifiedDesignSystem.colors.text)
            .text(role.description, { lineGap: 1 });
        }
        doc.y += ds.spacing.tight;
      });
      doc.y += ds.spacing.section;
    }

    if (
      resume.awards?.length &&
      contentDensityEngine.isSectionVisible(density, "awards")
    ) {
      drawHeader("HONORS & AWARDS");
      resume.awards.forEach((award) => {
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.h3)
          .fillColor(UnifiedDesignSystem.colors.primary)
          .text(award.awardName, { continued: true });
        doc
          .font(fontRegular)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(
            ` | ${award.organization}${
              award.awardDate ? ` (${award.awardDate})` : ""
            }`,
          );
        if (award.description) {
          doc
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(award.description, { oblique: true });
        }
        doc.y += ds.spacing.tight;
      });
    }
  }
}
