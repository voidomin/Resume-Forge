import PDFDocument from "pdfkit";
import { GeneratedResume } from "../gemini.service";
import { BaseTemplateRenderer } from "./BaseTemplateRenderer";
import { DesignTokens } from "./design-tokens";

export class ModernRenderer extends BaseTemplateRenderer {
  render(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    fontScale: number = 1,
    spacingScale: number = 1,
  ): void {
    const fontRegular = DesignTokens.fonts.sans;
    const fontBold = DesignTokens.fonts.sansBold;
    const { primary, secondary, text, textLight, white } = DesignTokens.colors;
    const fontScaleVal = fontScale;
    const spacingScaleVal = spacingScale;

    // Header
    doc
      .font(fontBold)
      .fontSize(14 * fontScaleVal)
      .fillColor(primary) // Pro Max Primary
      .text(resume.contactInfo.name.toUpperCase(), { align: "center" });

    doc.moveDown(0.2 * fontScaleVal);

    // Contact
    this.renderContactLine(doc, resume, fontRegular, 8.5 * fontScaleVal, false);

    doc.moveDown(0.5 * fontScaleVal);

    // Sections
    if (resume.summary) {
      this.drawModernHeader(doc, "PROFESSIONAL SUMMARY", fontScaleVal);
      doc
        .font(fontRegular)
        .fontSize(8.5 * fontScaleVal)
        .fillColor(text)
        .text(resume.summary, {
          align: "justify",
          lineGap: 0.2 * fontScaleVal,
        });
      doc.moveDown(0.5 * fontScaleVal);
    }

    if (resume.experiences?.length) {
      this.drawModernHeader(doc, "WORK EXPERIENCE", fontScaleVal);
      resume.experiences.forEach((exp) => {
        this.renderExperienceModern(
          doc,
          exp,
          fontBold,
          fontRegular,
          fontScaleVal,
          spacingScaleVal,
        );
        doc.moveDown(0.25 * spacingScaleVal);
      });
    }

    if (resume.projects?.length) {
      this.drawModernHeader(doc, "PROJECTS", fontScaleVal);
      resume.projects.forEach((proj) => {
        this.renderProjectModern(
          doc,
          proj,
          fontBold,
          fontRegular,
          fontScaleVal,
          spacingScaleVal,
        );
        doc.moveDown(0.25 * spacingScaleVal);
      });
    }

    if (resume.education?.length) {
      this.drawModernHeader(doc, "EDUCATION", fontScaleVal);
      resume.education.forEach((edu) => {
        this.renderEducationModern(
          doc,
          edu,
          fontBold,
          fontRegular,
          fontScaleVal,
          spacingScaleVal,
        );
        doc.moveDown(0.25 * spacingScaleVal);
      });
    }

    if (resume.skills?.length) {
      this.drawModernHeader(doc, "SKILLS", fontScaleVal);
      doc
        .font(fontRegular)
        .fontSize(8.5 * fontScaleVal)
        .fillColor(text)
        .text(resume.skills.join("  •  "), {
          align: "left",
          lineGap: 0.2 * fontScaleVal,
        });
    }
  }

  private drawModernHeader(
    doc: PDFKit.PDFDocument,
    title: string,
    fontScaleVal: number,
  ) {
    const { primary, text } = DesignTokens.colors;
    doc
      .font(DesignTokens.fonts.sansBold)
      .fontSize(11 * fontScaleVal)
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
    doc.moveDown(0.5 * fontScaleVal);
  }

  private renderExperienceModern(
    doc: PDFKit.PDFDocument,
    exp: any,
    fontBold: string,
    fontRegular: string,
    fontScaleVal: number,
    spacingScaleVal: number,
  ) {
    const { primary, secondary, text, textLight } = DesignTokens.colors;

    doc
      .font(fontBold)
      .fontSize(10 * fontScaleVal)
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
      .fontSize(9 * fontScaleVal)
      .fillColor(text);
    exp.bullets.forEach((b: string) => {
      doc.text(`• ${b}`, { indent: 10, lineGap: 1 * spacingScaleVal });
    });
  }

  private renderProjectModern(
    doc: PDFKit.PDFDocument,
    proj: any,
    fontBold: string,
    fontRegular: string,
    fontScaleVal: number,
    spacingScaleVal: number,
  ) {
    const { primary, secondary, text, textLight } = DesignTokens.colors;

    doc
      .font(fontBold)
      .fontSize(10 * fontScaleVal)
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

    doc.font(fontRegular).fontSize(9 * fontScaleVal);
    if (proj.technologies) {
      doc
        .fillColor(secondary)
        .text(`Stack: ${proj.technologies}`, { oblique: true });
    }

    doc.fillColor(text);
    if (proj.bullets) {
      proj.bullets.forEach((b: string) => {
        doc.text(`• ${b}`, { indent: 10, lineGap: 1 * spacingScaleVal });
      });
    } else if (proj.description) {
      doc.text(proj.description, { lineGap: 1 * spacingScaleVal });
    }
  }

  private renderEducationModern(
    doc: PDFKit.PDFDocument,
    edu: any,
    fontBold: string,
    fontRegular: string,
    fontScaleVal: number,
    spacingScaleVal: number,
  ) {
    const { primary, text, textLight } = DesignTokens.colors;

    doc
      .font(fontBold)
      .fontSize(10 * fontScaleVal)
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
        .fontSize(9 * fontScaleVal)
        .fillColor(textLight)
        .text(`GPA: ${edu.gpa}`);
    }
  }
}
