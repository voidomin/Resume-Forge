import PDFDocument from "pdfkit";
import { GeneratedResume } from "../gemini.service";
import { BaseTemplateRenderer } from "./BaseTemplateRenderer";
import {
  UnifiedDesignSystem,
  contentDensityEngine,
  DensityLevel,
} from "../../../../shared/design-system";

export class MinimalistRenderer extends BaseTemplateRenderer {
  render(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    fontScale: number = 1,
    spacingScale: number = 1,
  ): void {
    // Delegate to renderWithDensity for consistency
    this.renderWithDensity(doc, resume, DensityLevel.NORMAL);
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
    const ds = this.getScaledDesignSystem(doc, density);
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
      this.moveDownPoints(doc, ds.spacing.minimal);
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

    this.moveDownPoints(doc, ds.spacing.tight);

    // 2. Contact Line
    this.renderContactLine(doc, resume, fontRegular, ds.fontSize.body, false);

    this.moveDownPoints(doc, ds.spacing.element);

    // 3. Professional Summary / Tagline
    if (resume.summary) {
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.textLight)
        .text(resume.summary, {
          align: "left",
          lineGap: ds.spacing.minimal,
        });
      // Adjusted spacing after section
      this.moveDownAdjusted(doc, ds.spacing.section, "summary", resume.summary);
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
              lineGap: ds.spacing.minimal,
            });
        });

        doc.y += ds.spacing.element;
      });
      // Adjusted spacing after section
      const expMultiplier = this.getSectionSpacingAdjustment(
        doc,
        "experiences",
        resume.experiences,
      );
      doc.y += ds.spacing.section * expMultiplier;
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
                lineGap: ds.spacing.minimal,
              });
          });
        } else if (proj.description) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body)
            .fillColor(UnifiedDesignSystem.colors.text)
            .text(proj.description, { lineGap: ds.spacing.minimal });
        }

        doc.y += ds.spacing.element;
      });
      // Adjusted spacing after section
      const projMultiplier = this.getSectionSpacingAdjustment(
        doc,
        "projects",
        resume.projects,
      );
      doc.y += ds.spacing.section * projMultiplier;
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
      // Adjusted spacing after section
      const eduMultiplier = this.getSectionSpacingAdjustment(
        doc,
        "education",
        resume.education,
      );
      doc.y += ds.spacing.section * eduMultiplier;
    }

    // 7. Skills
    if (resume.skills?.length) {
      drawHeader("SKILLS");
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(resume.skills.join(", "), {
          lineGap: ds.spacing.minimal,
        });
      // Adjusted spacing after section
      const skillsMultiplier = this.getSectionSpacingAdjustment(
        doc,
        "skills",
        resume.skills,
      );
      doc.y += ds.spacing.section * skillsMultiplier;
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
      // Adjusted spacing after section
      const certMultiplier = this.getSectionSpacingAdjustment(
        doc,
        "certifications",
        resume.certifications,
      );
      doc.y += ds.spacing.section * certMultiplier;
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
      // Adjusted spacing after section
      const courseMultiplier = this.getSectionSpacingAdjustment(
        doc,
        "coursework",
        resume.coursework,
      );
      doc.y += ds.spacing.section * courseMultiplier;
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
            .text(role.description, { lineGap: ds.spacing.minimal });
        }
      });
      // Adjusted spacing after section
      const leadMultiplier = this.getSectionSpacingAdjustment(
        doc,
        "leadership",
        resume.leadership,
      );
      doc.y += ds.spacing.section * leadMultiplier;
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
            .text(award.description, { lineGap: ds.spacing.minimal });
        }
      });
      // Adjusted spacing after section
      const awardMultiplier = this.getSectionSpacingAdjustment(
        doc,
        "awards",
        resume.awards,
      );
      doc.y += ds.spacing.section * awardMultiplier;
    }
  }
}
