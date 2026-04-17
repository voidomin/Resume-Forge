import { GeneratedResume } from "../gemini.service";
import { BaseTemplateRenderer } from "./BaseTemplateRenderer";
import {
  UnifiedDesignSystem,
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
    const ds = this.getScaledDesignSystem(doc, density);
    const fontRegular = UnifiedDesignSystem.fonts.primary.pdf;
    const fontBold = UnifiedDesignSystem.fonts.primary.pdfBold;

    doc.page.margins = {
      top: ds.margins.pageTop,
      bottom: ds.margins.pageBottom,
      left: ds.margins.pageLeft,
      right: ds.margins.pageRight,
    };

    this.renderHeader(doc, resume, ds, fontBold, fontRegular);

    this.renderSummary(doc, resume, ds, fontRegular);
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

  private renderHeader(
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
      .text(resume.contactInfo.name.toUpperCase(), { align: "center" });

    this.moveDownPoints(doc, ds.spacing.tight);

    this.renderContactLine(
      doc,
      resume,
      fontRegular,
      ds.fontSize.contact,
      false,
    );

    this.moveDownPoints(doc, ds.spacing.element);
  }

  private renderSummary(doc: PDFKit.PDFDocument, resume: GeneratedResume, ds: ScaledDesignSystem, fontRegular: string) {
    if (!resume.summary) return;

    this.drawModernHeader(doc, "PROFESSIONAL SUMMARY", ds);
    doc
      .font(fontRegular)
      .fontSize(ds.fontSize.body)
      .fillColor(UnifiedDesignSystem.colors.text)
      .text(resume.summary, {
        align: "justify",
        lineGap: ds.spacing.minimal,
      });

    this.moveDownAdjusted(doc, ds.spacing.section, "summary", resume.summary);
  }

  private renderExperience(doc: PDFKit.PDFDocument, resume: GeneratedResume, ds: ScaledDesignSystem, fontBold: string, fontRegular: string) {
    this.renderSection(doc, "WORK EXPERIENCE", resume.experiences, ds, "experiences", {
      itemSpacing: ds.spacing.element,
      drawHeader: (t) => this.drawModernHeader(doc, t, ds),
      renderItem: (exp) => this.renderExperienceModern(doc, exp, fontBold, fontRegular, ds),
    });
  }

  private renderProjects(doc: PDFKit.PDFDocument, resume: GeneratedResume, ds: ScaledDesignSystem, fontBold: string, fontRegular: string) {
    this.renderSection(doc, "PROJECTS", resume.projects, ds, "projects", {
      itemSpacing: ds.spacing.element,
      drawHeader: (t) => this.drawModernHeader(doc, t, ds),
      renderItem: (proj) => this.renderProjectModern(doc, proj, fontBold, fontRegular, ds),
    });
  }

  private renderEducation(doc: PDFKit.PDFDocument, resume: GeneratedResume, ds: ScaledDesignSystem, fontBold: string, fontRegular: string) {
    this.renderSection(doc, "EDUCATION", resume.education, ds, "education", {
      itemSpacing: ds.spacing.tight,
      drawHeader: (t) => this.drawModernHeader(doc, t, ds),
      renderItem: (edu) => this.renderEducationModern(doc, edu, fontBold, fontRegular, ds),
    });
  }

  private renderSkills(doc: PDFKit.PDFDocument, resume: GeneratedResume, ds: ScaledDesignSystem, fontBold: string, fontRegular: string) {
    if (resume.skillsCategories && Object.keys(resume.skillsCategories).length > 0) {
      this.drawModernHeader(doc, "SKILLS", ds);
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
      this.moveDownAdjusted(doc, ds.spacing.section, "skills", resume.skillsCategories);
    } else if (resume.skills?.length) {
      this.renderSection(doc, "SKILLS", resume.skills, ds, "skills", {
        drawHeader: (t) => this.drawModernHeader(doc, t, ds),
        renderItem: (skill) => {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body)
            .fillColor(UnifiedDesignSystem.colors.text)
            .text(resume.skills.join("  •  "), {
              align: "left",
              lineGap: ds.spacing.minimal,
            });
        },
      });
    }
  }

  private renderCertifications(doc: PDFKit.PDFDocument, resume: GeneratedResume, ds: ScaledDesignSystem, fontBold: string, fontRegular: string, density: DensityLevel) {
    this.renderSection(doc, "CERTIFICATIONS", resume.certifications, ds, "certifications", {
      density,
      itemSpacing: ds.spacing.tight,
      drawHeader: (t) => this.drawModernHeader(doc, t, ds),
      renderItem: (cert) => {
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
      },
    });
  }

  private renderCoursework(doc: PDFKit.PDFDocument, resume: GeneratedResume, ds: ScaledDesignSystem, fontBold: string, fontRegular: string, density: DensityLevel) {
    this.renderSection(doc, "RELEVANT COURSEWORK", resume.coursework, ds, "coursework", {
      density,
      drawHeader: (t) => this.drawModernHeader(doc, t, ds),
      renderItem: (course) => this.renderCourseworkModern(doc, course, fontBold, fontRegular, ds),
    });
  }

  private renderLeadership(doc: PDFKit.PDFDocument, resume: GeneratedResume, ds: ScaledDesignSystem, fontBold: string, fontRegular: string, density: DensityLevel) {
    this.renderSection(doc, "LEADERSHIP & EXTRACURRICULAR", resume.leadership, ds, "leadership", {
      density,
      itemSpacing: ds.spacing.tight,
      drawHeader: (t) => this.drawModernHeader(doc, t, ds),
      renderItem: (role) => this.renderLeadershipModern(doc, role, fontBold, fontRegular, ds),
    });
  }

  private renderAwards(doc: PDFKit.PDFDocument, resume: GeneratedResume, ds: ScaledDesignSystem, fontBold: string, fontRegular: string, density: DensityLevel) {
    if (!resume.awards?.length) return;
    
    // Custom check for space as Modern has specific logic here
    const estimatedHeight = 45;
    if (!this.hasEnoughSpace(doc, estimatedHeight)) {
      doc.addPage();
    }

    this.renderSection(doc, "HONORS & AWARDS", resume.awards, ds, "awards", {
      density,
      drawHeader: (t) => this.drawModernHeader(doc, t, ds),
      renderItem: (award) => this.renderAwardModern(doc, award, fontBold, fontRegular, ds),
    });
  }

  private drawModernHeader(
    doc: PDFKit.PDFDocument,
    title: string,
    ds: ScaledDesignSystem,
  ) {
    const fontBold = UnifiedDesignSystem.fonts.primary.pdfBold;

    TemplateUtils.drawHeader({
      doc,
      renderer: this,
      ds,
      title,
      fontBold,
      color: UnifiedDesignSystem.colors.primary,
      align: "left",
      drawLine: false, // Modern has its own specific underline logic below
    });

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
