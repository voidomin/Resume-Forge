import PDFDocument from "pdfkit";
import { GeneratedResume } from "../gemini.service";
import { BaseTemplateRenderer } from "./BaseTemplateRenderer";
import {
  UnifiedDesignSystem,
  dynamicSizingEngine,
} from "../../../../shared/design-system";

export class ModernRenderer extends BaseTemplateRenderer {
  render(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    fontScale: number = 1,
    spacingScale: number = 1,
  ): void {
    // Get scaled design system values based on document scale
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
          lineGap: 2,
        });
      this.moveDownPoints(doc, ds.spacing.element);
    }

    // Work Experience
    if (resume.experiences?.length) {
      this.drawModernHeader(doc, "WORK EXPERIENCE", ds);
      resume.experiences.forEach((exp) => {
        this.renderExperienceModern(doc, exp, fontBold, fontRegular, ds);
        this.moveDownPoints(doc, ds.spacing.tight);
      });
    }

    // Projects
    if (resume.projects?.length) {
      this.drawModernHeader(doc, "PROJECTS", ds);
      resume.projects.forEach((proj) => {
        this.renderProjectModern(doc, proj, fontBold, fontRegular, ds);
        this.moveDownPoints(doc, ds.spacing.tight);
      });
    }

    // Education
    if (resume.education?.length) {
      this.drawModernHeader(doc, "EDUCATION", ds);
      resume.education.forEach((edu) => {
        this.renderEducationModern(doc, edu, fontBold, fontRegular, ds);
        this.moveDownPoints(doc, ds.spacing.tight);
      });
    }

    // Skills
    if (resume.skills?.length) {
      this.drawModernHeader(doc, "SKILLS", ds);
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(resume.skills.join("  •  "), {
          align: "left",
          lineGap: 2,
        });
    }
  }

  private drawModernHeader(
    doc: PDFKit.PDFDocument,
    title: string,
    ds: ReturnType<typeof dynamicSizingEngine.getScaledDesignSystem>,
  ) {
    const fontBold = UnifiedDesignSystem.fonts.primary.pdfBold;

    doc
      .font(fontBold)
      .fontSize(ds.fontSize.h2)
      .fillColor(UnifiedDesignSystem.colors.primary)
      .text(title.toUpperCase());

    // Underline with design system border width
    doc
      .strokeColor(UnifiedDesignSystem.colors.primary)
      .lineWidth(UnifiedDesignSystem.borders.sectionUnderline.width)
      .moveTo(doc.x, doc.y + 2)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y + 2)
      .stroke();

    doc.fillColor(UnifiedDesignSystem.colors.text); // Reset to standard text color
    this.moveDownPoints(doc, ds.spacing.element);
  }

  private renderExperienceModern(
    doc: PDFKit.PDFDocument,
    exp: any,
    fontBold: string,
    fontRegular: string,
    ds: ReturnType<typeof dynamicSizingEngine.getScaledDesignSystem>,
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
        lineGap: 2,
      });
    });
  }

  private renderProjectModern(
    doc: PDFKit.PDFDocument,
    proj: any,
    fontBold: string,
    fontRegular: string,
    ds: ReturnType<typeof dynamicSizingEngine.getScaledDesignSystem>,
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
          lineGap: 2,
        });
      });
    } else if (proj.description) {
      doc.text(proj.description, { lineGap: 2 });
    }
  }

  private renderEducationModern(
    doc: PDFKit.PDFDocument,
    edu: any,
    fontBold: string,
    fontRegular: string,
    ds: ReturnType<typeof dynamicSizingEngine.getScaledDesignSystem>,
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
}
