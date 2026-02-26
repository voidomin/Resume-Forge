import { GeneratedResume } from "../gemini.service";
import { BaseTemplateRenderer } from "./BaseTemplateRenderer";
import {
  UnifiedDesignSystem,
  contentDensityEngine,
  DensityLevel,
} from "../../../../shared/design-system";
import { TemplateUtils } from "./TemplateUtils";

export class ExecutiveRenderer extends BaseTemplateRenderer {
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

    // Apply scaled margins to document
    doc.page.margins = {
      top: ds.margins.pageTop,
      bottom: ds.margins.pageBottom,
      left: ds.margins.pageLeft,
      right: ds.margins.pageRight,
    };

    // Helper: Section Headers (Centered, Uppercase, Primary Color)
    const drawHeader = (title: string) => {
      TemplateUtils.drawHeader(
        doc,
        this,
        ds,
        title,
        fontBold,
        UnifiedDesignSystem.colors.primary,
        "center",
        true,
      );
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

    this.moveDownPoints(doc, ds.spacing.tight);

    // 2. Contact Line
    this.renderContactLine(
      doc,
      resume,
      fontRegular,
      ds.fontSize.body,
      true,
      "center",
    );

    this.moveDownPoints(doc, ds.spacing.element);

    // 3. Professional Summary
    if (resume.summary) {
      drawHeader("EXECUTIVE PROFILE");
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(resume.summary, { align: "center", lineGap: ds.spacing.minimal });
      // Adjusted spacing after section
      const summaryMultiplier = this.getSectionSpacingAdjustment(
        doc,
        "summary",
        resume.summary,
      );
      doc.y += ds.spacing.section * summaryMultiplier;
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
            .text(`• ${b}`, { lineGap: ds.spacing.minimal });
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
              continued: !!proj.link,
            });
        }

        if (proj.link) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.small)
            .fillColor(UnifiedDesignSystem.colors.primary)
            .text(proj.technologies ? ` | ${proj.link}` : ` | ${proj.link}`, {
              link: proj.link.startsWith("http")
                ? proj.link
                : `https://${proj.link}`,
              underline: true,
              continued: false,
            });
        } else if (!proj.technologies) {
          doc.text("");
        }

        if (proj.bullets) {
          proj.bullets.forEach((b: string) => {
            doc
              .font(fontRegular)
              .fontSize(ds.fontSize.body)
              .fillColor(UnifiedDesignSystem.colors.text)
              .text(`• ${b}`, { lineGap: ds.spacing.minimal });
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
      // Adjusted spacing after section
      const eduMultiplier = this.getSectionSpacingAdjustment(
        doc,
        "education",
        resume.education,
      );
      doc.y += ds.spacing.section * eduMultiplier;
    }

    // 7. Skills
    if (
      resume.skillsCategories &&
      Object.keys(resume.skillsCategories).length > 0
    ) {
      drawHeader("COMPETENCIES");
      Object.entries(resume.skillsCategories).forEach(([category, skills]) => {
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(`${category}: `, { continued: true })
          .font(fontRegular)
          .text(Array.isArray(skills) ? skills.join(", ") : skills, {
            lineGap: ds.spacing.minimal,
          });
      });
      // Adjusted spacing after section
      const skillsMultiplier = this.getSectionSpacingAdjustment(
        doc,
        "skills",
        resume.skillsCategories,
      );
      doc.y += ds.spacing.section * skillsMultiplier;
    } else if (resume.skills?.length) {
      drawHeader("COMPETENCIES");
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(resume.skills.join("  •  "), {
          align: "left",
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
          .text(`${cert.name}`, { continued: true });
        const certDateStr = cert.date ? ` (${cert.date})` : "";
        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(` | ${cert.issuer}${certDateStr}`);
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
            .text(role.description, { lineGap: ds.spacing.minimal });
        }
        doc.y += ds.spacing.tight;
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
      // Space check: Header + 1st item
      const estimatedHeight = 40;
      if (!this.hasEnoughSpace(doc, estimatedHeight)) {
        doc.addPage();
      }

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
