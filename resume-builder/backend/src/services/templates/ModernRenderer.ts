import { GeneratedResume } from "../gemini.service";
import { BaseTemplateRenderer } from "./BaseTemplateRenderer";
import {
  UnifiedDesignSystem,
  contentDensityEngine,
  DensityLevel,
  ScaledDesignSystem,
} from "../../../../shared/design-system";
import { TemplateUtils } from "./TemplateUtils";

export class ModernRenderer extends BaseTemplateRenderer {
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

    // Header - Name
    doc
      .font(fontBold)
      .fontSize(ds.fontSize.h1)
      .fillColor(UnifiedDesignSystem.colors.primary)
      .text(resume.contactInfo.name.toUpperCase(), { align: "center" });

    // Small spacing after name
    this.moveDownPoints(doc, ds.spacing.tight);

    // Contact Line
    this.renderContactLine(
      doc,
      resume,
      fontRegular,
      ds.fontSize.contact,
      false,
    );

    // Spacing after contact
    this.moveDownPoints(doc, ds.spacing.element);

    // Professional Summary
    if (resume.summary) {
      this.drawModernHeader(doc, "PROFESSIONAL SUMMARY", ds);
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(resume.summary, {
          align: "justify",
          lineGap: ds.spacing.minimal,
        });
      // Adjusted spacing after section
      this.moveDownAdjusted(doc, ds.spacing.section, "summary", resume.summary);
    }

    if (resume.experiences?.length) {
      this.drawModernHeader(doc, "WORK EXPERIENCE", ds);
      resume.experiences.forEach((exp) => {
        this.renderExperienceModern(doc, exp, fontBold, fontRegular, ds);
        this.moveDownPoints(doc, ds.spacing.element);
      });
      // Adjusted spacing after section
      this.moveDownAdjusted(
        doc,
        ds.spacing.section,
        "experiences",
        resume.experiences,
      );
    }

    if (resume.projects?.length) {
      this.drawModernHeader(doc, "PROJECTS", ds);
      resume.projects.forEach((proj) => {
        this.renderProjectModern(doc, proj, fontBold, fontRegular, ds);
        this.moveDownPoints(doc, ds.spacing.element);
      });
      // Adjusted spacing after section
      this.moveDownAdjusted(
        doc,
        ds.spacing.section,
        "projects",
        resume.projects,
      );
    }

    if (resume.education?.length) {
      this.drawModernHeader(doc, "EDUCATION", ds);
      resume.education.forEach((edu) => {
        this.renderEducationModern(doc, edu, fontBold, fontRegular, ds);
        this.moveDownPoints(doc, ds.spacing.tight);
      });
      // Adjusted spacing after section - reduced for sparse education sections
      this.moveDownAdjusted(
        doc,
        ds.spacing.section,
        "education",
        resume.education,
      );
    }

    if (resume.skills?.length) {
      this.drawModernHeader(doc, "SKILLS", ds);
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(resume.skills.join("  •  "), {
          align: "left",
          lineGap: ds.spacing.minimal,
        });
      // Adjusted spacing after section - reduced for sparse skills sections
      this.moveDownAdjusted(doc, ds.spacing.section, "skills", resume.skills);
    }

    // Optional Sections - Only show if visible at this density
    if (
      resume.certifications?.length &&
      contentDensityEngine.isSectionVisible(density, "certifications")
    ) {
      this.drawModernHeader(doc, "CERTIFICATIONS", ds);
      resume.certifications.forEach((cert) => {
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.h3)
          .fillColor(UnifiedDesignSystem.colors.primary)
          .text(cert.name, { continued: true });
        doc
          .font(fontRegular)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(` | ${cert.issuer}${cert.date ? ` (${cert.date})` : ""}`);
        this.moveDownPoints(doc, ds.spacing.tight);
      });
      // Adjusted spacing after section
      this.moveDownAdjusted(
        doc,
        ds.spacing.section,
        "certifications",
        resume.certifications,
      );
    }

    // Coursework - only if visible at this density
    if (
      resume.coursework?.length &&
      contentDensityEngine.isSectionVisible(density, "coursework")
    ) {
      this.drawModernHeader(doc, "RELEVANT COURSEWORK", ds);
      resume.coursework.forEach((course) => {
        this.renderCourseworkModern(doc, course, fontBold, fontRegular, ds);
      });
      // Adjusted spacing after section
      this.moveDownAdjusted(
        doc,
        ds.spacing.section,
        "coursework",
        resume.coursework,
      );
    }

    // Leadership - only if visible at this density
    if (
      resume.leadership?.length &&
      contentDensityEngine.isSectionVisible(density, "leadership")
    ) {
      this.drawModernHeader(doc, "LEADERSHIP & EXTRACURRICULAR", ds);
      resume.leadership.forEach((role) => {
        this.renderLeadershipModern(doc, role, fontBold, fontRegular, ds);
        this.moveDownPoints(doc, ds.spacing.tight);
      });
      // Adjusted spacing after section
      this.moveDownAdjusted(
        doc,
        ds.spacing.section,
        "leadership",
        resume.leadership,
      );
    }

    // Awards - only if visible at this density
    if (
      resume.awards?.length &&
      contentDensityEngine.isSectionVisible(density, "awards")
    ) {
      this.drawModernHeader(doc, "HONORS & AWARDS", ds);
      resume.awards.forEach((award) => {
        this.renderAwardModern(doc, award, fontBold, fontRegular, ds);
      });
      // Adjusted spacing after section
      this.moveDownAdjusted(doc, ds.spacing.section, "awards", resume.awards);
    }
  }

  private drawModernHeader(
    doc: PDFKit.PDFDocument,
    title: string,
    ds: ScaledDesignSystem,
  ) {
    const fontBold = UnifiedDesignSystem.fonts.primary.pdfBold;

    TemplateUtils.drawHeader(
      doc,
      this,
      ds,
      title,
      fontBold,
      UnifiedDesignSystem.colors.primary,
      "left",
      false, // Modern has its own specific underline logic below
    );

    // Modern has its own specific full-width underline logic, so we draw it separately
    doc
      .strokeColor(UnifiedDesignSystem.colors.primary)
      .lineWidth(UnifiedDesignSystem.borders.sectionUnderline.width)
      .moveTo(doc.page.margins.left, doc.y - ds.spacing.element + 2)
      .lineTo(
        doc.page.width - doc.page.margins.right,
        doc.y - ds.spacing.element + 2,
      )
      .stroke();

    doc.fillColor(UnifiedDesignSystem.colors.text); // Reset to standard text color
  }

  private renderExperienceModern(
    doc: PDFKit.PDFDocument,
    exp: any,
    fontBold: string,
    fontRegular: string,
    ds: ScaledDesignSystem,
  ) {
    doc
      .font(fontBold)
      .fontSize(ds.fontSize.h3)
      .fillColor(UnifiedDesignSystem.colors.text)
      .text(exp.role, { continued: true });

    doc
      .font(fontRegular)
      .fillColor(UnifiedDesignSystem.colors.secondary)
      .text(" | ", { continued: true })
      .fillColor(UnifiedDesignSystem.colors.primary)
      .text(exp.company, { continued: true });

    doc
      .fillColor(UnifiedDesignSystem.colors.textLight)
      .text(exp.location ? ` | ${exp.location}` : "", {
        continued: false,
      });

    doc.moveUp(1);
    doc
      .fontSize(ds.fontSize.small)
      .fillColor(UnifiedDesignSystem.colors.textLight)
      .text(exp.dateRange, { align: "right" });

    doc
      .font(fontRegular)
      .fontSize(ds.fontSize.body)
      .fillColor(UnifiedDesignSystem.colors.text);
    exp.bullets.forEach((b: string) => {
      doc.text(`• ${b}`, {
        indent: ds.spacing.bulletIndent,
        lineGap: ds.spacing.minimal,
      });
    });
  }

  private renderProjectModern(
    doc: PDFKit.PDFDocument,
    proj: any,
    fontBold: string,
    fontRegular: string,
    ds: ScaledDesignSystem,
  ) {
    doc
      .font(fontBold)
      .fontSize(ds.fontSize.h3)
      .fillColor(UnifiedDesignSystem.colors.text)
      .text(proj.name, { continued: true });
    if (proj.link) {
      doc
        .font(fontRegular)
        .fillColor(UnifiedDesignSystem.colors.textLight)
        .text(` | `, { continued: true })
        .fillColor(UnifiedDesignSystem.colors.primary)
        .text(proj.link, { link: proj.link, continued: false })
        .fillColor(UnifiedDesignSystem.colors.text);
    } else {
      doc.text("");
    }

    doc.font(fontRegular).fontSize(ds.fontSize.body);
    if (proj.technologies) {
      doc
        .fillColor(UnifiedDesignSystem.colors.secondary)
        .text(`Stack: ${proj.technologies}`, { oblique: true });
    }

    doc.fillColor(UnifiedDesignSystem.colors.text);
    if (proj.bullets) {
      proj.bullets.forEach((b: string) => {
        doc.text(`• ${b}`, {
          indent: ds.spacing.bulletIndent,
          lineGap: ds.spacing.minimal,
        });
      });
    } else if (proj.description) {
      doc.text(proj.description, { lineGap: ds.spacing.minimal });
    }
  }

  private renderEducationModern(
    doc: PDFKit.PDFDocument,
    edu: any,
    fontBold: string,
    fontRegular: string,
    ds: ScaledDesignSystem,
  ) {
    doc
      .font(fontBold)
      .fontSize(ds.fontSize.h3)
      .fillColor(UnifiedDesignSystem.colors.primary)
      .text(edu.institution, { continued: true });
    doc
      .font(fontRegular)
      .fontSize(ds.fontSize.body)
      .fillColor(UnifiedDesignSystem.colors.textLight)
      .text(` | ${edu.degree} in ${edu.field}`, { continued: false });

    doc.moveUp(1);
    doc
      .fontSize(ds.fontSize.small)
      .fillColor(UnifiedDesignSystem.colors.textLight)
      .text(edu.dateRange, { align: "right" });

    if (edu.gpa) {
      doc
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.textLight)
        .text(`GPA: ${edu.gpa}`);
    }
  }

  private renderCourseworkModern(
    doc: PDFKit.PDFDocument,
    course: any,
    fontBold: string,
    fontRegular: string,
    ds: ScaledDesignSystem,
  ) {
    doc
      .font(fontBold)
      .fontSize(ds.fontSize.h3)
      .fillColor(UnifiedDesignSystem.colors.text)
      .text(course.courseName, { continued: true });

    if (course.institution) {
      doc
        .font(fontRegular)
        .fillColor(UnifiedDesignSystem.colors.textLight)
        .text(` | ${course.institution}`, { continued: false });
    } else {
      doc.text("");
    }

    doc
      .font(fontRegular)
      .fontSize(ds.fontSize.body)
      .fillColor(UnifiedDesignSystem.colors.textLight)
      .text(`Topic: ${course.topic}`, { oblique: true });
  }

  private renderLeadershipModern(
    doc: PDFKit.PDFDocument,
    role: any,
    fontBold: string,
    fontRegular: string,
    ds: ScaledDesignSystem,
  ) {
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
      .text(role.organization, { continued: true });

    doc
      .fillColor(UnifiedDesignSystem.colors.textLight)
      .text(role.location ? ` | ${role.location}` : "", { continued: false });

    doc.moveUp(1);
    doc
      .fontSize(ds.fontSize.small)
      .fillColor(UnifiedDesignSystem.colors.textLight)
      .text(role.dateRange || "N/A", { align: "right" });

    if (role.description) {
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(`• ${role.description}`, {
          indent: ds.spacing.bulletIndent,
          lineGap: ds.spacing.minimal,
        });
    }
  }

  private renderAwardModern(
    doc: PDFKit.PDFDocument,
    award: any,
    fontBold: string,
    fontRegular: string,
    ds: ScaledDesignSystem,
  ) {
    doc
      .font(fontBold)
      .fontSize(ds.fontSize.h3)
      .fillColor(UnifiedDesignSystem.colors.primary)
      .text(award.awardName, { continued: true });

    doc
      .font(fontRegular)
      .fontSize(ds.fontSize.body)
      .fillColor(UnifiedDesignSystem.colors.textLight)
      .text(` | ${award.organization}`, { continued: false });

    doc.moveUp(1);
    doc
      .fontSize(ds.fontSize.small)
      .fillColor(UnifiedDesignSystem.colors.textLight)
      .text(award.awardDate, { align: "right" });

    if (award.description) {
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.textLight)
        .text(award.description, { oblique: true });
    }
  }
}
