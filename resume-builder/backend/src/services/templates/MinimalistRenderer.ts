import { GeneratedResume } from "../gemini.service";
import { BaseTemplateRenderer } from "./BaseTemplateRenderer";
import {
  UnifiedDesignSystem,
  contentDensityEngine,
  DensityLevel,
  ScaledDesignSystem,
} from "../../../../shared/design-system";
import { TemplateUtils } from "./TemplateUtils";

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
    const ds = this.getScaledDesignSystem(doc, density);
    const fontRegular = UnifiedDesignSystem.fonts.primary.pdf;
    const fontBold = UnifiedDesignSystem.fonts.primary.pdfBold;

    doc.page.margins = {
      top: ds.margins.pageTop,
      bottom: ds.margins.pageBottom,
      left: ds.margins.pageLeft,
      right: ds.margins.pageRight,
    };

    this.renderHeaderMinimalist(doc, resume, ds, fontBold, fontRegular);

    this.renderSummary(doc, resume, ds, fontRegular, fontBold);
    this.renderExperience(doc, resume, ds, fontBold, fontRegular);
    this.renderProjects(doc, resume, ds, fontBold, fontRegular);
    this.renderEducation(doc, resume, ds, fontBold, fontRegular);
    this.renderSkills(doc, resume, ds, fontBold, fontRegular);

    // Optional Sections
    this.renderCertifications(doc, resume, ds, fontBold, fontRegular, density);
    this.renderCoursework(doc, resume, ds, fontBold, fontRegular, density);
    this.renderLeadership(doc, resume, ds, fontBold, fontRegular, density);
    this.renderAwards(doc, resume, ds, fontBold, fontRegular, density);
  }

  private renderHeaderMinimalist(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    ds: ScaledDesignSystem,
    fontBold: string,
    fontRegular: string,
  ) {
    doc
      .font(fontBold)
      .fontSize(ds.fontSize.h1)
      .fillColor(UnifiedDesignSystem.colors.primary)
      .text(resume.contactInfo.name.toUpperCase(), { align: "left" });

    this.moveDownPoints(doc, ds.spacing.tight);

    this.renderContactLine(
      doc,
      resume,
      fontRegular,
      ds.fontSize.contact,
      false,
      "left",
    );

    this.moveDownPoints(doc, ds.spacing.element);
  }

  private renderSummary(doc: PDFKit.PDFDocument, resume: GeneratedResume, ds: ScaledDesignSystem, fontRegular: string, fontBold: string) {
    if (!resume.summary) return;

    this.drawMinimalistHeader(doc, "SUMMARY", ds, fontBold);
    doc
      .font(fontRegular)
      .fontSize(ds.fontSize.body)
      .fillColor(UnifiedDesignSystem.colors.text)
      .text(resume.summary, { align: "justify", lineGap: ds.spacing.minimal });

    const summaryMultiplier = this.getSectionSpacingAdjustment(doc, "summary", resume.summary);
    doc.y += ds.spacing.section * summaryMultiplier;
  }

  private renderExperience(doc: PDFKit.PDFDocument, resume: GeneratedResume, ds: ScaledDesignSystem, fontBold: string, fontRegular: string) {
    if (!resume.experiences?.length) return;

    this.drawMinimalistHeader(doc, "EXPERIENCE", ds, fontBold);
    resume.experiences.forEach((exp) => {
      this.renderExperienceMinimalist(doc, exp, fontBold, fontRegular, ds);
      this.moveDownPoints(doc, ds.spacing.element);
    });

    const expMultiplier = this.getSectionSpacingAdjustment(doc, "experiences", resume.experiences);
    doc.y += ds.spacing.section * expMultiplier;
  }

  private renderExperienceMinimalist(
    doc: PDFKit.PDFDocument,
    exp: any,
    fontBold: string,
    fontRegular: string,
    ds: ScaledDesignSystem,
  ) {
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
      .text(`  •  ${exp.dateRange}${exp.location ? " — " + exp.location : ""}`, {
        continued: false,
      });

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
  }

  private renderProjects(doc: PDFKit.PDFDocument, resume: GeneratedResume, ds: ScaledDesignSystem, fontBold: string, fontRegular: string) {
    if (!resume.projects?.length) return;

    this.drawMinimalistHeader(doc, "PROJECTS", ds, fontBold);
    resume.projects.forEach((proj) => {
      this.renderProjectMinimalist(doc, proj, fontBold, fontRegular, ds);
      this.moveDownPoints(doc, ds.spacing.element);
    });

    const projMultiplier = this.getSectionSpacingAdjustment(doc, "projects", resume.projects);
    doc.y += ds.spacing.section * projMultiplier;
  }

  private renderProjectMinimalist(
    doc: PDFKit.PDFDocument,
    proj: any,
    fontBold: string,
    fontRegular: string,
    ds: ScaledDesignSystem,
  ) {
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
          link: proj.link.startsWith("http") ? proj.link : `https://${proj.link}`,
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
  }

  private renderEducation(doc: PDFKit.PDFDocument, resume: GeneratedResume, ds: ScaledDesignSystem, fontBold: string, fontRegular: string) {
    if (!resume.education?.length) return;

    this.drawMinimalistHeader(doc, "EDUCATION", ds, fontBold);
    resume.education.forEach((edu) => {
      this.renderEducationMinimalist(doc, edu, fontBold, fontRegular, ds);
      this.moveDownPoints(doc, ds.spacing.tight);
    });

    const eduMultiplier = this.getSectionSpacingAdjustment(doc, "education", resume.education);
    doc.y += ds.spacing.section * eduMultiplier;
  }

  private renderEducationMinimalist(
    doc: PDFKit.PDFDocument,
    edu: any,
    fontBold: string,
    fontRegular: string,
    ds: ScaledDesignSystem,
  ) {
    doc
      .font(fontBold)
      .fontSize(ds.fontSize.body)
      .fillColor(UnifiedDesignSystem.colors.text)
      .text(edu.institution, { continued: true });

    doc
      .font(fontRegular)
      .fillColor(UnifiedDesignSystem.colors.textLight)
      .text(`  •  ${edu.degree} in ${edu.field}`);

    if (edu.dateRange) {
      doc
        .fillColor(UnifiedDesignSystem.colors.textLight)
        .text(`  •  ${edu.dateRange}`);
    }

    if (edu.gpa) {
      doc.fillColor(UnifiedDesignSystem.colors.textLight).text(`  •  GPA: ${edu.gpa}`);
    }
  }

  private renderSkills(doc: PDFKit.PDFDocument, resume: GeneratedResume, ds: ScaledDesignSystem, fontBold: string, fontRegular: string) {
    if (resume.skillsCategories && Object.keys(resume.skillsCategories).length > 0) {
      this.drawMinimalistHeader(doc, "SKILLS", ds, fontBold);
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
      this.drawMinimalistHeader(doc, "SKILLS", ds, fontBold);
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

  private renderCertifications(doc: PDFKit.PDFDocument, resume: GeneratedResume, ds: ScaledDesignSystem, fontBold: string, fontRegular: string, density: DensityLevel) {
    if (!resume.certifications?.length || !contentDensityEngine.isSectionVisible(density, "certifications")) return;

    this.drawMinimalistHeader(doc, "CERTIFICATIONS", ds, fontBold);
    resume.certifications.forEach((cert) => {
      doc
        .font(fontBold)
        .fontSize(ds.fontSize.h3)
        .fillColor(UnifiedDesignSystem.colors.primary)
        .text(cert.name, { continued: true });
      const certDateStr = cert.date ? ` (${cert.date})` : "";
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.textLight)
        .text(` | ${cert.issuer}${certDateStr}`);
      this.moveDownPoints(doc, ds.spacing.tight);
    });
    const certMultiplier = this.getSectionSpacingAdjustment(doc, "certifications", resume.certifications);
    doc.y += ds.spacing.section * certMultiplier;
  }

  private renderCoursework(doc: PDFKit.PDFDocument, resume: GeneratedResume, ds: ScaledDesignSystem, fontBold: string, fontRegular: string, density: DensityLevel) {
    if (!resume.coursework?.length || !contentDensityEngine.isSectionVisible(density, "coursework")) return;

    this.drawMinimalistHeader(doc, "COURSEWORK", ds, fontBold);
    resume.coursework.forEach((course) => {
      this.renderCourseworkMinimalist(doc, course, fontBold, fontRegular, ds);
    });
    const courseMultiplier = this.getSectionSpacingAdjustment(doc, "coursework", resume.coursework);
    doc.y += ds.spacing.section * courseMultiplier;
  }

  private renderCourseworkMinimalist(
    doc: PDFKit.PDFDocument,
    course: any,
    fontBold: string,
    fontRegular: string,
    ds: ScaledDesignSystem,
  ) {
    doc
      .font(fontBold)
      .fontSize(ds.fontSize.body)
      .fillColor(UnifiedDesignSystem.colors.text)
      .text(course.courseName, { continued: true });
    doc
      .font(fontRegular)
      .fillColor(UnifiedDesignSystem.colors.textLight)
      .text(` | ${course.topic}${course.institution ? ` (${course.institution})` : ""}`);
  }

  private renderLeadership(doc: PDFKit.PDFDocument, resume: GeneratedResume, ds: ScaledDesignSystem, fontBold: string, fontRegular: string, density: DensityLevel) {
    if (!resume.leadership?.length || !contentDensityEngine.isSectionVisible(density, "leadership")) return;

    this.drawMinimalistHeader(doc, "LEADERSHIP", ds, fontBold);
    resume.leadership.forEach((role) => {
      this.renderLeadershipMinimalist(doc, role, fontBold, fontRegular, ds);
    });
    const leadMultiplier = this.getSectionSpacingAdjustment(doc, "leadership", resume.leadership);
    doc.y += ds.spacing.section * leadMultiplier;
  }

  private renderLeadershipMinimalist(
    doc: PDFKit.PDFDocument,
    role: any,
    fontBold: string,
    fontRegular: string,
    ds: ScaledDesignSystem,
  ) {
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
  }

  private renderAwards(doc: PDFKit.PDFDocument, resume: GeneratedResume, ds: ScaledDesignSystem, fontBold: string, fontRegular: string, density: DensityLevel) {
    if (!resume.awards?.length || !contentDensityEngine.isSectionVisible(density, "awards")) return;

    this.drawMinimalistHeader(doc, "AWARDS", ds, fontBold);
    resume.awards.forEach((award) => {
      this.renderAwardMinimalist(doc, award, fontBold, fontRegular, ds);
    });
    const awardMultiplier = this.getSectionSpacingAdjustment(doc, "awards", resume.awards);
    doc.y += ds.spacing.section * awardMultiplier;
  }

  private renderAwardMinimalist(
    doc: PDFKit.PDFDocument,
    award: any,
    fontBold: string,
    fontRegular: string,
    ds: ScaledDesignSystem,
  ) {
    doc
      .font(fontBold)
      .fontSize(ds.fontSize.body)
      .fillColor(UnifiedDesignSystem.colors.primary)
      .text(award.awardName, { continued: true });
    const dateStr = award.awardDate ? ` (${award.awardDate})` : "";
    doc
      .font(fontRegular)
      .fontSize(ds.fontSize.small)
      .fillColor(UnifiedDesignSystem.colors.textLight)
      .text(` — ${award.organization}${dateStr}`);
    if (award.description) {
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.small)
        .fillColor(UnifiedDesignSystem.colors.textLight)
        .text(award.description, { lineGap: ds.spacing.minimal });
    }
  }

  private drawMinimalistHeader(
    doc: PDFKit.PDFDocument,
    title: string,
    ds: ScaledDesignSystem,
    fontBold: string,
  ) {
    TemplateUtils.drawHeader({
      doc,
      renderer: this,
      ds,
      title,
      fontBold,
      color: UnifiedDesignSystem.colors.primary,
      align: "left",
      drawLine: true,
    });
  }
}
