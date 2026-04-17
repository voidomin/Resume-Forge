import { GeneratedResume } from "../gemini.service";
import { BaseTemplateRenderer } from "./BaseTemplateRenderer";
import {
  UnifiedDesignSystem,
  contentDensityEngine,
  DensityLevel,
} from "../../../../shared/design-system";
import { TemplateUtils } from "./TemplateUtils";

export class StandardRenderer extends BaseTemplateRenderer {
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
    const ds = this.getScaledDesignSystem(doc, density);
    const fontRegular = UnifiedDesignSystem.fonts.primary.pdf;
    const fontBold = UnifiedDesignSystem.fonts.primary.pdfBold;

    // Set page margins once
    doc.page.margins = {
      top: ds.margins.pageTop,
      bottom: ds.margins.pageBottom,
      left: ds.margins.pageLeft,
      right: ds.margins.pageRight,
    };

    // Header - Name & Contact
    this.renderHeader(doc, ds, resume, fontBold, fontRegular);

    // Sections
    this.renderSummary(doc, ds, resume, fontRegular, fontBold);
    this.renderExperience(doc, ds, resume, fontRegular, fontBold);
    this.renderProjects(doc, ds, resume, fontRegular, fontBold);
    this.renderEducation(doc, ds, resume, fontRegular, fontBold);
    this.renderSkills(doc, ds, resume, fontRegular, fontBold);

    // Optional Sections
    this.renderCertifications(doc, ds, resume, fontRegular, fontBold, density);
    this.renderCoursework(doc, ds, resume, fontRegular, fontBold, density);
    this.renderLeadership(doc, ds, resume, fontRegular, fontBold, density);
    this.renderAwards(doc, ds, resume, fontRegular, fontBold, density);
  }

  private renderHeader(
    doc: PDFKit.PDFDocument,
    ds: any,
    resume: GeneratedResume,
    fontBold: string,
    fontRegular: string,
  ) {
    doc
      .font(fontBold)
      .fontSize(ds.fontSize.h1)
      .fillColor(UnifiedDesignSystem.colors.text)
      .text(resume.contactInfo.name.toUpperCase(), { align: "left" });

    this.moveDownPoints(doc, ds.spacing.minimal);

    this.renderContactLine(
      doc,
      resume,
      fontRegular,
      ds.fontSize.body,
      false,
      "left",
    );

    this.moveDownPoints(doc, ds.spacing.tight);
  }

  private drawHeader(doc: PDFKit.PDFDocument, ds: any, title: string, fontBold: string) {
    TemplateUtils.drawHeader({
      doc,
      renderer: this,
      ds,
      title,
      fontBold,
      color: UnifiedDesignSystem.colors.text,
      align: "left",
      drawLine: true,
    });
  }

  private renderSummary(doc: PDFKit.PDFDocument, ds: any, resume: GeneratedResume, fontRegular: string, fontBold: string) {
    if (!resume.summary) return;

    this.drawHeader(doc, ds, "PROFESSIONAL SUMMARY", fontBold);
    doc
      .font(fontRegular)
      .fontSize(ds.fontSize.body)
      .fillColor(UnifiedDesignSystem.colors.text)
      .text(resume.summary, {
        align: "justify",
        lineGap: ds.spacing.minimal,
      });

    const summaryMultiplier = this.getSectionSpacingAdjustment(doc, "summary", resume.summary);
    doc.y += ds.spacing.section * summaryMultiplier;
  }

  private renderExperience(doc: PDFKit.PDFDocument, ds: any, resume: GeneratedResume, fontRegular: string, fontBold: string) {
    if (!resume.experiences?.length) return;

    this.drawHeader(doc, ds, "WORK EXPERIENCE", fontBold);
    const scaledMargin = ds.margins.pageLeft;

    resume.experiences.forEach((exp) => {
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
      const expStartY = doc.y;

      doc
        .fillColor(UnifiedDesignSystem.colors.textLight)
        .text(exp.dateRange, 595 - scaledMargin - dateWidth, expStartY, {
          align: "left",
        });

      doc.y = expStartY + doc.currentLineHeight(false) + 2;

      exp.bullets.forEach((b: string) => {
        doc
          .font(fontRegular)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(`•  ${b}`, 42, doc.y, {
            width: 595 - scaledMargin * 2 - 16,
            lineGap: ds.spacing.minimal,
            align: "left",
          });
      });
      doc.y += ds.spacing.element;
    });

    const expMultiplier = this.getSectionSpacingAdjustment(doc, "experiences", resume.experiences);
    doc.y = doc.y - ds.spacing.element + ds.spacing.section * expMultiplier;
  }

  private renderProjects(doc: PDFKit.PDFDocument, ds: any, resume: GeneratedResume, fontRegular: string, fontBold: string) {
    if (!resume.projects?.length) return;

    this.drawHeader(doc, ds, "PROJECTS", fontBold);
    const scaledMargin = ds.margins.pageLeft;

    resume.projects.forEach((proj) => {
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
            link: proj.link.startsWith("http") ? proj.link : `https://${proj.link}`,
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
          lineGap: ds.spacing.minimal,
        });

      if (proj.bullets) {
        proj.bullets.forEach((b: string) => {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body)
            .fillColor(UnifiedDesignSystem.colors.text)
            .text(`•  ${b}`, 42, doc.y, {
              width: 595 - scaledMargin * 2 - 16,
              lineGap: ds.spacing.minimal,
              align: "left",
            });
        });
      }
      doc.y += ds.spacing.element;
    });

    const projMultiplier = this.getSectionSpacingAdjustment(doc, "projects", resume.projects);
    doc.y = doc.y - ds.spacing.element + ds.spacing.section * projMultiplier;
  }

  private renderEducation(doc: PDFKit.PDFDocument, ds: any, resume: GeneratedResume, fontRegular: string, fontBold: string) {
    if (!resume.education?.length) return;

    this.drawHeader(doc, ds, "EDUCATION", fontBold);
    const scaledMargin = ds.margins.pageLeft;

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
        doc.fillColor(UnifiedDesignSystem.colors.textLight).text(`CGPA: ${edu.gpa}`);
      }
      doc.y += ds.spacing.element;
    });

    const eduMultiplier = this.getSectionSpacingAdjustment(doc, "education", resume.education);
    doc.y = doc.y - ds.spacing.element + ds.spacing.section * eduMultiplier;
  }

  private renderSkills(doc: PDFKit.PDFDocument, ds: any, resume: GeneratedResume, fontRegular: string, fontBold: string) {
    if (resume.skillsCategories && Object.keys(resume.skillsCategories).length > 0) {
      this.drawHeader(doc, ds, "SKILLS", fontBold);
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
      const skillsMultiplier = this.getSectionSpacingAdjustment(doc, "skills", resume.skillsCategories);
      doc.y += ds.spacing.section * skillsMultiplier;
    } else if (resume.skills?.length) {
      this.drawHeader(doc, ds, "SKILLS", fontBold);
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(resume.skills.join("  •  "), {
          align: "left",
          lineGap: ds.spacing.minimal,
        });
      const skillsMultiplier = this.getSectionSpacingAdjustment(doc, "skills", resume.skills);
      doc.y += ds.spacing.section * skillsMultiplier;
    }
  }

  private renderCertifications(doc: PDFKit.PDFDocument, ds: any, resume: GeneratedResume, fontRegular: string, fontBold: string, density: DensityLevel) {
    if (!resume.certifications?.length || !contentDensityEngine.isSectionVisible(density, "certifications")) return;

    this.drawHeader(doc, ds, "CERTIFICATIONS", fontBold);
    resume.certifications.forEach((cert) => {
      doc
        .font(fontBold)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(`• ${cert.name}`, { continued: true });
      doc
        .font(fontRegular)
        .fillColor(UnifiedDesignSystem.colors.textLight)
        .text(` - ${cert.issuer}${cert.date ? " (" + cert.date + ")" : ""}`);
    });
    const certMultiplier = this.getSectionSpacingAdjustment(doc, "certifications", resume.certifications);
    doc.y += ds.spacing.section * certMultiplier;
  }

  private renderCoursework(doc: PDFKit.PDFDocument, ds: any, resume: GeneratedResume, fontRegular: string, fontBold: string, density: DensityLevel) {
    if (!resume.coursework?.length || !contentDensityEngine.isSectionVisible(density, "coursework")) return;

    this.drawHeader(doc, ds, "RELEVANT COURSEWORK", fontBold);
    resume.coursework.forEach((course) => {
      doc
        .font(fontBold)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(`• ${course.courseName}`, { continued: true });
      doc
        .font(fontRegular)
        .fillColor(UnifiedDesignSystem.colors.textLight)
        .text(` (${course.topic}${course.institution ? " - " + course.institution : ""})`);
    });
    const courseMultiplier = this.getSectionSpacingAdjustment(doc, "coursework", resume.coursework);
    doc.y += ds.spacing.section * courseMultiplier;
  }

  private renderLeadership(doc: PDFKit.PDFDocument, ds: any, resume: GeneratedResume, fontRegular: string, fontBold: string, density: DensityLevel) {
    if (!resume.leadership?.length || !contentDensityEngine.isSectionVisible(density, "leadership")) return;

    this.drawHeader(doc, ds, "LEADERSHIP & EXTRACURRICULAR", fontBold);
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
      doc.fillColor(UnifiedDesignSystem.colors.textLight).text(role.location ? ` | ${role.location}` : "");
      if (role.description) {
        doc
          .font(fontRegular)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(`• ${role.description}`, { indent: ds.spacing.bulletIndent });
      }
      doc.y += 2;
    });
    const leadMultiplier = this.getSectionSpacingAdjustment(doc, "leadership", resume.leadership);
    doc.y += ds.spacing.section * leadMultiplier;
  }

  private renderAwards(doc: PDFKit.PDFDocument, ds: any, resume: GeneratedResume, fontRegular: string, fontBold: string, density: DensityLevel) {
    if (!resume.awards?.length || !contentDensityEngine.isSectionVisible(density, "awards")) return;

    const estimatedHeight = 40;
    if (!this.hasEnoughSpace(doc, estimatedHeight)) {
      doc.addPage();
    }

    this.drawHeader(doc, ds, "HONORS & AWARDS", fontBold);
    resume.awards.forEach((award) => {
      doc
        .font(fontBold)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.primary)
        .text(`• ${award.awardName}`, { continued: true });
      doc
        .font(fontRegular)
        .fillColor(UnifiedDesignSystem.colors.textLight)
        .text(` - ${award.organization}${award.awardDate ? " (" + award.awardDate + ")" : ""}`);
      if (award.description) {
        doc
          .font(fontRegular)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(award.description, { oblique: true });
      }
    });
    const awardMultiplier = this.getSectionSpacingAdjustment(doc, "awards", resume.awards);
    doc.y += ds.spacing.section * awardMultiplier;
  }
}
