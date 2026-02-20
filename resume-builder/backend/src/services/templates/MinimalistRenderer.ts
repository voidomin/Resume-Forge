import PDFDocument from "pdfkit";
import { GeneratedResume } from "../gemini.service";
import { BaseTemplateRenderer } from "./BaseTemplateRenderer";
import {
  UnifiedDesignSystem,
  dynamicSizingEngine,
  contentDensityEngine,
  DensityLevel,
  ScaledDesignSystem,
} from "../../../../shared/design-system";

export class MinimalistRenderer extends BaseTemplateRenderer {
  render(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    fontScale: number = 1,
    spacingScale: number = 1,
  ): void {
    // Get scaled design system values
    const scale = (doc as any).__scale || fontScale;
    const ds = dynamicSizingEngine.getScaledDesignSystem(scale);
    const fontRegular = UnifiedDesignSystem.fonts.primary.pdf;
    const fontBold = UnifiedDesignSystem.fonts.primary.pdfBold;

    // Apply scaled margins
    const scaledMargin = dynamicSizingEngine.getScaledMargin(scale);
    doc.page.margins = {
      top: scaledMargin,
      bottom: scaledMargin,
      left: scaledMargin,
      right: scaledMargin,
    };

    // Helper: Section Headers (Uppercase, Tracking, TextLight Color)
    const drawHeader = (title: string) => {
      this.moveDownPoints(doc, 2);
      doc
        .font(fontBold)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.textLight)
        .text(title.toUpperCase(), { characterSpacing: 2 });

      const y = doc.y + 2;
      doc
        .strokeColor(UnifiedDesignSystem.colors.secondary)
        .opacity(0.3)
        .lineWidth(0.5)
        .moveTo(scaledMargin, y)
        .lineTo(scaledMargin + 64, y)
        .stroke()
        .opacity(1);

      doc.y = y + ds.spacing.element;
    };

    // 1. Header (Left Aligned, Clean)
    doc
      .font(fontBold)
      .fontSize(ds.fontSize.h1)
      .fillColor(UnifiedDesignSystem.colors.text)
      .text(resume.contactInfo.name, { align: "left", characterSpacing: -0.5 });

    this.moveDownPoints(doc, 4);

    // 2. Contact (Left aligned, wrapped)
    this.renderContactLine(
      doc,
      resume,
      fontRegular,
      ds.fontSize.body,
      false,
      "left",
    );

    this.moveDownPoints(doc, 15);

    // 3. Summary
    if (resume.summary) {
      drawHeader("ABOUT");
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(resume.summary, { align: "left", lineGap: 1.6 });
      doc.y += ds.spacing.section;
    }

    // 4. Experience
    if (resume.experiences?.length) {
      drawHeader("EXPERIENCE");
      resume.experiences.forEach((exp) => {
        // Role
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body + 1)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(exp.role);

        this.moveDownPoints(doc, 2);

        // Company | Location | Date
        doc
          .font(fontRegular)
          .fontSize(ds.fontSize.body - 1)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(
            `${exp.company} ${exp.location ? " | " + exp.location : ""} | ${exp.dateRange}`,
          );

        this.moveDownPoints(doc, 5);

        // Bullets
        exp.bullets.forEach((b: string) => {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body)
            .fillColor(UnifiedDesignSystem.colors.text)
            .text(b, {
              indent: 10,
              lineGap: 1.6,
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

        if (proj.technologies) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body - 1)
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(`  ${proj.technologies}`, { continued: false });
        } else {
          doc.text("");
        }

        this.moveDownPoints(doc, 2);

        if (proj.link) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body - 1)
            .fillColor(UnifiedDesignSystem.colors.primary)
            .text(proj.link, { link: proj.link });
          this.moveDownPoints(doc, 2);
        }

        if (proj.description) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body)
            .fillColor(UnifiedDesignSystem.colors.text)
            .text(proj.description, { lineGap: 1.6 });
        }

        if (proj.bullets) {
          proj.bullets.forEach((b: string) => {
            doc
              .font(fontRegular)
              .fontSize(ds.fontSize.body)
              .fillColor(UnifiedDesignSystem.colors.text)
              .text(b, {
                indent: 10,
                lineGap: 1.6,
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
        // Institution
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(edu.institution, { continued: true });

        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(`  |  ${edu.dateRange}`, { continued: false });

        // Degree
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
      drawHeader("SKILLS");
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(resume.skills.join(", "), {
          lineGap: 1.6,
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
          .text(course.courseName, { continued: true });
        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(
            ` — ${course.topic}${
              course.institution ? ` (${course.institution})` : ""
            }`,
          );
      });
    }

    if (resume.leadership?.length) {
      drawHeader("LEADERSHIP & EXTRACURRICULAR");
      resume.leadership.forEach((role) => {
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(role.title, { continued: true });
        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(` — ${role.organization}`);
        if (role.description) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.small)
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(role.description, { lineGap: 1 });
        }
      });
    }

    if (resume.awards?.length) {
      drawHeader("HONORS & AWARDS");
      resume.awards.forEach((award) => {
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.primary)
          .text(award.awardName, { continued: true });
        doc
          .font(fontRegular)
          .fontSize(ds.fontSize.small)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(
            ` — ${award.organization}${
              award.awardDate ? ` (${award.awardDate})` : ""
            }`,
          );
        if (award.description) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.small)
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(award.description, { lineGap: 0.8 });
        }
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

    // Helper: Section Headers (Uppercase, Tracking, TextLight Color)
    const drawHeader = (title: string) => {
      this.moveDownPoints(doc, 2);
      doc
        .font(fontBold)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.textLight)
        .text(title.toUpperCase(), { characterSpacing: 2 });

      const y = doc.y + 2;
      doc
        .strokeColor(UnifiedDesignSystem.colors.secondary)
        .opacity(0.3)
        .lineWidth(0.5)
        .moveTo(scaledMargin, y)
        .lineTo(scaledMargin + 64, y)
        .stroke()
        .opacity(1);

      doc.y = y + ds.spacing.element;
    };

    // 1. Header - Name
    doc
      .font(fontBold)
      .fontSize(ds.fontSize.h1)
      .fillColor(UnifiedDesignSystem.colors.text)
      .text(resume.contactInfo.name.toUpperCase());

    this.moveDownPoints(doc, 3);

    // 2. Contact Line
    this.renderContactLine(doc, resume, fontRegular, ds.fontSize.body, false);

    this.moveDownPoints(doc, 6);

    // 3. Professional Summary / Tagline
    if (resume.summary) {
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.textLight)
        .text(resume.summary, {
          align: "left",
          lineGap: 1.2,
        });
      this.moveDownPoints(doc, 3);
    }

    // 4. Work Experience
    if (resume.experiences?.length) {
      drawHeader("EXPERIENCE");
      resume.experiences.forEach((exp) => {
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(exp.role, { continued: true });

        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(`  •  ${exp.company}`, { continued: true });

        doc
          .fontSize(ds.fontSize.small)
          .text(
            `  •  ${exp.dateRange}${exp.location ? ` — ${exp.location}` : ""}`,
            { continued: false },
          );

        exp.bullets.forEach((b: string) => {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body)
            .fillColor(UnifiedDesignSystem.colors.text)
            .text(`• ${b}`, {
              indent: ds.spacing.bulletIndent,
              lineGap: 1,
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
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(proj.name, { continued: true });

        if (proj.link) {
          doc
            .font(fontRegular)
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text("  •  ", { continued: true })
            .fillColor(UnifiedDesignSystem.colors.primary)
            .text(proj.link, {
              link: proj.link.startsWith("http")
                ? proj.link
                : `https://${proj.link}`,
              underline: true,
              continued: false,
            });
        } else {
          doc.text("");
        }

        if (proj.technologies) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.small)
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(`Tech: ${proj.technologies}`, { oblique: true });
        }

        if (proj.bullets) {
          proj.bullets.forEach((b: string) => {
            doc
              .font(fontRegular)
              .fontSize(ds.fontSize.body)
              .fillColor(UnifiedDesignSystem.colors.text)
              .text(`• ${b}`, {
                indent: ds.spacing.bulletIndent,
                lineGap: 1,
              });
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
        // Institution
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(edu.institution, { continued: true });

        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(`  |  ${edu.dateRange}`, { continued: false });

        // Degree
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
      drawHeader("SKILLS");
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(resume.skills.join(", "), {
          lineGap: 1.6,
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
          .text(cert.name, { continued: true });
        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(` — ${cert.issuer}${cert.date ? ` (${cert.date})` : ""}`);
      });
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
          .text(course.courseName, { continued: true });
        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(
            ` — ${course.topic}${
              course.institution ? ` (${course.institution})` : ""
            }`,
          );
      });
    }

    if (
      resume.leadership?.length &&
      contentDensityEngine.isSectionVisible(density, "leadership")
    ) {
      drawHeader("LEADERSHIP & EXTRACURRICULAR");
      resume.leadership.forEach((role) => {
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(role.title, { continued: true });
        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(` — ${role.organization}`);
        if (role.description) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.small)
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(role.description, { lineGap: 1 });
        }
      });
    }

    if (
      resume.awards?.length &&
      contentDensityEngine.isSectionVisible(density, "awards")
    ) {
      drawHeader("HONORS & AWARDS");
      resume.awards.forEach((award) => {
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.primary)
          .text(award.awardName, { continued: true });
        doc
          .font(fontRegular)
          .fontSize(ds.fontSize.small)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(
            ` — ${award.organization}${
              award.awardDate ? ` (${award.awardDate})` : ""
            }`,
          );
        if (award.description) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.small)
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(award.description, { lineGap: 0.8 });
        }
      });
    }
  }
}
