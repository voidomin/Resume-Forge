import PDFDocument from "pdfkit";
import { GeneratedResume } from "../gemini.service";
import { BaseTemplateRenderer } from "./BaseTemplateRenderer";
import {
  UnifiedDesignSystem,
  contentDensityEngine,
  DensityLevel,
  ScaledDesignSystem,
} from "../../../../shared/design-system";

export class StandardRenderer extends BaseTemplateRenderer {
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

    // Section Header - Left Aligned with Line
    const drawHeader = (title: string) => {
      this.moveDownPoints(doc, 2);
      doc
        .font(fontBold)
        .fontSize(ds.fontSize.h2)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(title.toUpperCase());

      const y = doc.y + 2;
      doc
        .strokeColor(UnifiedDesignSystem.colors.primary)
        .lineWidth(0.5)
        .moveTo(scaledMargin, y)
        .lineTo(595 - scaledMargin, y)
        .stroke();

      doc.y = y + ds.spacing.element;
    };

    // Header - Name
    doc
      .font(fontBold)
      .fontSize(ds.fontSize.h1)
      .fillColor(UnifiedDesignSystem.colors.text)
      .text(resume.contactInfo.name.toUpperCase(), { align: "left" });

    this.moveDownPoints(doc, 2);

    // Contact Line
    this.renderContactLine(
      doc,
      resume,
      fontRegular,
      ds.fontSize.body,
      false,
      "left",
    );

    this.moveDownPoints(doc, 5);

    if (resume.summary) {
      drawHeader("PROFESSIONAL SUMMARY");
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(resume.summary, { align: "justify", lineGap: 1 });
      doc.y += ds.spacing.section;
    }

    if (resume.experiences?.length) {
      drawHeader("WORK EXPERIENCE");
      resume.experiences.forEach((exp) => {
        // Role & Company Line
        const startY = doc.y;

        // Role (Left)
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(exp.role, { continued: true, align: "left" });

        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.secondary)
          .text("  |  ", { continued: true })
          .fillColor(UnifiedDesignSystem.colors.primary)
          .text(exp.company, { continued: true })
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(exp.location ? `  |  ${exp.location}` : "", {
            continued: false,
            align: "left",
          });

        // Date (Right Aligned)
        const dateWidth = doc.widthOfString(exp.dateRange);
        doc
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(exp.dateRange, 595 - scaledMargin - dateWidth, startY, {
            align: "left",
          });

        doc.y = startY + doc.currentLineHeight(false) + 2;

        exp.bullets.forEach((b: string) => {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body)
            .fillColor(UnifiedDesignSystem.colors.text)
            .text(`•  ${b}`, 42, doc.y, {
              width: 595 - scaledMargin * 2 - 16,
              lineGap: 1,
              align: "left",
            });
        });
        doc.y += ds.spacing.element;
      });
      doc.y = doc.y - ds.spacing.element + ds.spacing.section;
    }

    if (resume.projects?.length) {
      drawHeader("PROJECTS");
      resume.projects.forEach((proj) => {
        const startY = doc.y;

        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(proj.name, { continued: true, align: "left" });

        if (proj.link) {
          doc
            .font(fontRegular)
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text("  |  ", { continued: true })
            .fillColor(UnifiedDesignSystem.colors.primary)
            .text(proj.link, {
              link: proj.link.startsWith("http")
                ? proj.link
                : `https://${proj.link}`,
              underline: true,
              align: "left",
              continued: false,
            });
        } else {
          doc.text("");
        }

        if (proj.technologies) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body - 1)
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(proj.technologies, { align: "left", oblique: true });
        }

        doc
          .font(fontRegular)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(proj.bullets ? "" : proj.description || "", {
            align: "left",
            lineGap: 1,
          });

        if (proj.bullets) {
          proj.bullets.forEach((b: string) => {
            doc
              .font(fontRegular)
              .fontSize(ds.fontSize.body)
              .fillColor(UnifiedDesignSystem.colors.text)
              .text(`•  ${b}`, 42, doc.y, {
                width: 595 - scaledMargin * 2 - 16,
                lineGap: 1,
                align: "left",
              });
          });
        }
        doc.y += ds.spacing.element;
      });
      doc.y = doc.y - ds.spacing.element + ds.spacing.section;
    }

    if (resume.education?.length) {
      drawHeader("EDUCATION");
      resume.education.forEach((edu) => {
        const startY = doc.y;

        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(`${edu.degree} in ${edu.field}`, { continued: true });

        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text("  |  ", { continued: true })
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(edu.institution);

        if (edu.dateRange) {
          const w = doc.widthOfString(edu.dateRange);
          doc
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(edu.dateRange, 595 - scaledMargin - w, startY, {
              align: "left",
            });
          doc.y = startY + doc.currentLineHeight(false) + 2;
        }

        if (edu.gpa) {
          doc
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(`CGPA: ${edu.gpa}`);
        }
        doc.y += ds.spacing.element;
      });
      doc.y = doc.y - ds.spacing.element + ds.spacing.section;
    }

    if (resume.skills?.length) {
      drawHeader("SKILLS");
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(resume.skills.join("  •  "), {
          align: "left",
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
          .text(`• ${course.courseName}`, { continued: true });
        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(
            ` (${course.topic}${
              course.institution ? ` - ${course.institution}` : ""
            })`,
          );
      });
      doc.y += 2;
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
          .fillColor(UnifiedDesignSystem.colors.secondary)
          .text(" | ", { continued: true })
          .fillColor(UnifiedDesignSystem.colors.primary)
          .text(role.organization, { continued: true });
        doc
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(role.location ? ` | ${role.location}` : "");
        if (role.description) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body)
            .fillColor(UnifiedDesignSystem.colors.text)
            .text(`• ${role.description}`, {
              indent: ds.spacing.bulletIndent,
            });
        }
        doc.y += 2;
      });
    }

    if (resume.awards?.length) {
      drawHeader("HONORS & AWARDS");
      resume.awards.forEach((award) => {
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.primary)
          .text(`• ${award.awardName}`, { continued: true });
        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(
            ` - ${award.organization}${award.awardDate ? ` (${award.awardDate})` : ""}`,
          );
        if (award.description) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body)
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(award.description, { oblique: true });
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

    // Section Header - Left Aligned with Line
    const drawHeader = (title: string) => {
      this.moveDownPoints(doc, 2);
      doc
        .font(fontBold)
        .fontSize(ds.fontSize.h2)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(title.toUpperCase());

      const y = doc.y + 2;
      doc
        .strokeColor(UnifiedDesignSystem.colors.primary)
        .lineWidth(0.5)
        .moveTo(scaledMargin, y)
        .lineTo(595 - scaledMargin, y)
        .stroke();

      doc.y = y + ds.spacing.element;
    };

    // Header - Name
    doc
      .font(fontBold)
      .fontSize(ds.fontSize.h1)
      .fillColor(UnifiedDesignSystem.colors.text)
      .text(resume.contactInfo.name.toUpperCase(), { align: "left" });

    this.moveDownPoints(doc, 2);

    // Contact Line
    this.renderContactLine(
      doc,
      resume,
      fontRegular,
      ds.fontSize.body,
      false,
      "left",
    );

    this.moveDownPoints(doc, 5);

    if (resume.summary) {
      drawHeader("PROFESSIONAL SUMMARY");
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(resume.summary, { align: "justify", lineGap: 1 });
      doc.y += ds.spacing.section;
    }

    if (resume.experiences?.length) {
      drawHeader("WORK EXPERIENCE");
      resume.experiences.forEach((exp) => {
        const startY = doc.y;

        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(exp.role, { continued: true, align: "left" });

        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.secondary)
          .text("  |  ", { continued: true })
          .fillColor(UnifiedDesignSystem.colors.primary)
          .text(exp.company, { continued: true })
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(exp.location ? `  |  ${exp.location}` : "", {
            continued: false,
            align: "left",
          });

        const dateWidth = doc.widthOfString(exp.dateRange);
        doc
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(exp.dateRange, 595 - scaledMargin - dateWidth, startY, {
            align: "left",
          });

        doc.y = startY + doc.currentLineHeight(false) + 2;

        exp.bullets.forEach((b: string) => {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body)
            .fillColor(UnifiedDesignSystem.colors.text)
            .text(`•  ${b}`, 42, doc.y, {
              width: 595 - scaledMargin * 2 - 16,
              lineGap: 1,
              align: "left",
            });
        });
        doc.y += ds.spacing.element;
      });
      doc.y = doc.y - ds.spacing.element + ds.spacing.section;
    }

    if (resume.projects?.length) {
      drawHeader("PROJECTS");
      resume.projects.forEach((proj) => {
        const startY = doc.y;

        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(proj.name, { continued: true, align: "left" });

        if (proj.link) {
          doc
            .font(fontRegular)
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text("  |  ", { continued: true })
            .fillColor(UnifiedDesignSystem.colors.primary)
            .text(proj.link, {
              link: proj.link.startsWith("http")
                ? proj.link
                : `https://${proj.link}`,
              underline: true,
              align: "left",
              continued: false,
            });
        } else {
          doc.text("");
        }

        if (proj.technologies) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body - 1)
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(proj.technologies, { align: "left", oblique: true });
        }

        doc
          .font(fontRegular)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(proj.bullets ? "" : proj.description || "", {
            align: "left",
            lineGap: 1,
          });

        if (proj.bullets) {
          proj.bullets.forEach((b: string) => {
            doc
              .font(fontRegular)
              .fontSize(ds.fontSize.body)
              .fillColor(UnifiedDesignSystem.colors.text)
              .text(`•  ${b}`, 42, doc.y, {
                width: 595 - scaledMargin * 2 - 16,
                lineGap: 1,
                align: "left",
              });
          });
        }
        doc.y += ds.spacing.element;
      });
      doc.y = doc.y - ds.spacing.element + ds.spacing.section;
    }

    if (resume.education?.length) {
      drawHeader("EDUCATION");
      resume.education.forEach((edu) => {
        const startY = doc.y;

        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(`${edu.degree} in ${edu.field}`, { continued: true });

        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text("  |  ", { continued: true })
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(edu.institution);

        if (edu.dateRange) {
          const w = doc.widthOfString(edu.dateRange);
          doc
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(edu.dateRange, 595 - scaledMargin - w, startY, {
              align: "left",
            });
          doc.y = startY + doc.currentLineHeight(false) + 2;
        }

        if (edu.gpa) {
          doc
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(`CGPA: ${edu.gpa}`);
        }
        doc.y += ds.spacing.element;
      });
      doc.y = doc.y - ds.spacing.element + ds.spacing.section;
    }

    if (resume.skills?.length) {
      drawHeader("SKILLS");
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(resume.skills.join("  •  "), {
          align: "left",
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
          .text(`• ${cert.name}`, { continued: true });
        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(` - ${cert.issuer}${cert.date ? ` (${cert.date})` : ""}`);
      });
      doc.y += 2;
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
          .text(`• ${course.courseName}`, { continued: true });
        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(
            ` (${course.topic}${
              course.institution ? ` - ${course.institution}` : ""
            })`,
          );
      });
      doc.y += 2;
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
          .fillColor(UnifiedDesignSystem.colors.secondary)
          .text(" | ", { continued: true })
          .fillColor(UnifiedDesignSystem.colors.primary)
          .text(role.organization, { continued: true });
        doc
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(role.location ? ` | ${role.location}` : "");
        if (role.description) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body)
            .fillColor(UnifiedDesignSystem.colors.text)
            .text(`• ${role.description}`, {
              indent: ds.spacing.bulletIndent,
            });
        }
        doc.y += 2;
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
          .text(`• ${award.awardName}`, { continued: true });
        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(
            ` - ${award.organization}${award.awardDate ? ` (${award.awardDate})` : ""}`,
          );
        if (award.description) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body)
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(award.description, { oblique: true });
        }
      });
    }
  }
}
