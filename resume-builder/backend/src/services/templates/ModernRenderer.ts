import PDFDocument from "pdfkit";
import { GeneratedResume } from "../gemini.service";
import { BaseTemplateRenderer } from "./BaseTemplateRenderer";
import { DesignTokens } from "./design-tokens";

export class ModernRenderer extends BaseTemplateRenderer {
  render(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    fontScale: number = 1,
  ): void {
    const fontRegular = DesignTokens.fonts.sans;
    const fontBold = DesignTokens.fonts.sansBold;
    const { primary, secondary, text, textLight, white } = DesignTokens.colors;
    const scale = fontScale; // Modern uses mostly just font scaling, not distinct spacing

    // Header
    doc
      .font(fontBold)
      .fontSize(14 * scale)
      .fillColor(primary) // Pro Max Primary
      .text(resume.contactInfo.name.toUpperCase(), { align: "center" });

    doc.moveDown(0.2 * scale);

    // Contact
    this.renderContactLine(doc, resume, fontRegular, 8.5 * scale, false);

    doc.moveDown(0.5 * scale);

    // Sections
    if (resume.summary) {
      this.drawModernHeader(doc, "PROFESSIONAL SUMMARY", scale);
      doc
        .font(fontRegular)
        .fontSize(8.5 * scale)
        .fillColor(text)
        .text(resume.summary, { align: "justify", lineGap: 0.2 * scale });
      doc.moveDown(0.5 * scale);
    }

    if (resume.experiences?.length) {
      this.drawModernHeader(doc, "WORK EXPERIENCE", scale);
      resume.experiences.forEach((exp) => {
        this.renderExperienceModern(doc, exp, fontBold, fontRegular, scale);
        doc.moveDown(0.25 * scale);
      });
    }

    if (resume.projects?.length) {
      this.drawModernHeader(doc, "PROJECTS", scale);
      resume.projects.forEach((proj) => {
        this.renderProjectModern(doc, proj, fontBold, fontRegular, scale);
        doc.moveDown(0.25 * scale);
      });
    }

    if (resume.education?.length) {
      this.drawModernHeader(doc, "EDUCATION", scale);
      resume.education.forEach((edu) => {
        this.renderEducationModern(doc, edu, fontBold, fontRegular, scale);
        doc.moveDown(0.25 * scale);
      });
    }

    if (resume.skills?.length) {
      this.drawModernHeader(doc, "SKILLS", scale);
      doc
        .font(fontRegular)
        .fontSize(8.5 * scale)
        .fillColor(text)
        .text(resume.skills.join("  •  "), {
          align: "left",
          lineGap: 0.2 * scale,
        });
    }
  }

  private drawModernHeader(
    doc: PDFKit.PDFDocument,
    title: string,
    scale: number,
  ) {
    const { primary, text } = DesignTokens.colors;
    doc
      .font(DesignTokens.fonts.sansBold)
      .fontSize(11 * scale)
      .fillColor(primary)
      .text(title.toUpperCase());

    // Underline
    doc
      .strokeColor(primary)
      .lineWidth(1)
      .moveTo(doc.x, doc.y + 2)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y + 2)
      .stroke();

    doc.fillColor(text); // Reset to standard text color
    doc.moveDown(0.5 * scale);
  }

  private renderExperienceModern(
    doc: PDFKit.PDFDocument,
    exp: any,
    fontBold: string,
    fontRegular: string,
    scale: number,
  ) {
    const { primary, secondary, text, textLight } = DesignTokens.colors;

    doc
      .font(fontBold)
      .fontSize(10 * scale)
      .fillColor(text)
      .text(exp.role, { continued: true });

    doc
      .font(fontRegular)
      .fillColor(secondary)
      .text(" | ", { continued: true })
      .fillColor(primary)
      .text(exp.company, { continued: true });

    doc.fillColor(textLight).text(exp.location ? ` | ${exp.location}` : "", {
      continued: false,
    });

    doc.moveUp(1);
    doc.fillColor(textLight).text(exp.dateRange, { align: "right" });

    doc
      .font(fontRegular)
      .fontSize(9 * scale)
      .fillColor(text);
    exp.bullets.forEach((b: string) => {
      doc.text(`• ${b}`, { indent: 10, lineGap: 1 });
    });
  }

  private renderProjectModern(
    doc: PDFKit.PDFDocument,
    proj: any,
    fontBold: string,
    fontRegular: string,
    scale: number,
  ) {
    const { primary, secondary, text, textLight } = DesignTokens.colors;

    doc
      .font(fontBold)
      .fontSize(10 * scale)
      .fillColor(text)
      .text(proj.name, { continued: true });
    if (proj.link) {
      doc
        .font(fontRegular)
        .fillColor(textLight)
        .text(` | `, { continued: true })
        .fillColor(primary)
        .text(proj.link, { link: proj.link, continued: false })
        .fillColor(text);
    } else {
      doc.text("");
    }

    doc.font(fontRegular).fontSize(9 * scale);
    if (proj.technologies) {
      doc
        .fillColor(secondary)
        .text(`Stack: ${proj.technologies}`, { oblique: true });
    }

    doc.fillColor(text);
    if (proj.bullets) {
      proj.bullets.forEach((b: string) => {
        doc.text(`• ${b}`, { indent: 10, lineGap: 1 });
      });
    } else if (proj.description) {
      doc.text(proj.description);
    }
  }

  private renderEducationModern(
    doc: PDFKit.PDFDocument,
    edu: any,
    fontBold: string,
    fontRegular: string,
    scale: number,
  ) {
    const { primary, text, textLight } = DesignTokens.colors;

    doc
      .font(fontBold)
      .fontSize(10 * scale)
      .fillColor(text) // Institution in text color for Modern? Or Primary? Let's stick to Text for consistency
      .text(edu.institution, { continued: true });
    doc
      .font(fontRegular)
      .fillColor(textLight)
      .text(` | ${edu.degree} in ${edu.field}`, { continued: false });

    doc.moveUp(1);
    doc.fillColor(textLight).text(edu.dateRange, { align: "right" });

    if (edu.gpa) {
      doc
        .fontSize(9 * scale)
        .fillColor(textLight)
        .text(`GPA: ${edu.gpa}`);
    }
  }
}
