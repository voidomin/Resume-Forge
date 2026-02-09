import PDFDocument from "pdfkit";
import { GeneratedResume } from "../gemini.service";
import { BaseTemplateRenderer } from "./BaseTemplateRenderer";

export class ExecutiveRenderer extends BaseTemplateRenderer {
  render(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    fontScale: number = 1,
  ): void {
    const fontRegular = "Times-Roman";
    const fontBold = "Times-Bold";
    const scale = fontScale;

    // Header - Centered & Capitalized
    doc
      .font(fontBold)
      .fontSize(16 * scale)
      .text(resume.contactInfo.name.toUpperCase(), { align: "center" });

    doc.moveDown(0.5 * scale);
    this.renderContactLine(doc, resume, fontRegular, 10 * scale, true);
    doc.moveDown(1 * scale);

    // Draw a horizontal line across the page
    doc
      .moveTo(36, doc.y)
      .lineTo(559, doc.y)
      .strokeColor("#000000")
      .lineWidth(1)
      .stroke();
    doc.moveDown(1.5);

    // Helper for Executive Sections
    const renderSection = (title: string, content: () => void) => {
      doc
        .font(fontBold)
        .fontSize(11)
        .text(title.toUpperCase(), { align: "center", characterSpacing: 1 });
      doc.moveDown(0.5);
      content();
      doc.moveDown(1);
    };

    if (resume.summary) {
      renderSection("Professional Summary", () => {
        doc
          .font(fontRegular)
          .fontSize(10)
          .text(resume.summary, { align: "justify", lineGap: 1 });
      });
    }

    if (resume.experiences?.length) {
      renderSection("Work Experience", () => {
        resume.experiences.forEach((exp) => {
          doc.font(fontBold).fontSize(10).text(exp.role, { continued: true });
          doc.font(fontRegular).text(` | ${exp.company}`, { continued: true });
          doc.text(exp.location ? ` | ${exp.location}` : "", {
            align: "right",
          });

          doc
            .font(fontRegular)
            .fontSize(9)
            .text(exp.dateRange, { align: "left" });

          exp.bullets.forEach((b: string) => {
            doc
              .font(fontRegular)
              .fontSize(10)
              .text(`• ${b}`, { indent: 15, lineGap: 1 });
          });
          doc.moveDown(0.5);
        });
      });
    }

    if (resume.projects?.length) {
      renderSection("Projects", () => {
        resume.projects?.forEach((proj) => {
          doc.font(fontBold).fontSize(10).text(proj.name);
          doc
            .font(fontRegular)
            .fontSize(10)
            .text(
              proj.bullets ? proj.bullets.join(". ") : proj.description || "",
            );
          doc.moveDown(0.5);
        });
      });
    }

    if (resume.education?.length) {
      renderSection("Education", () => {
        resume.education.forEach((edu) => {
          doc.font(fontBold).fontSize(10).text(edu.institution);
          doc
            .font(fontRegular)
            .text(`${edu.degree} in ${edu.field} | ${edu.dateRange}`);
        });
      });
    }

    if (resume.skills?.length && doc.y < 800) {
      renderSection("Core Competencies", () => {
        doc
          .font(fontRegular)
          .fontSize(10)
          .text(resume.skills.join("  |  "), { align: "center" });
      });
    }
  }
}
