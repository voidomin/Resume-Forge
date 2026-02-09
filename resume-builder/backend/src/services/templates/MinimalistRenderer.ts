import PDFDocument from "pdfkit";
import { GeneratedResume } from "../gemini.service";
import { BaseTemplateRenderer } from "./BaseTemplateRenderer";

export class MinimalistRenderer extends BaseTemplateRenderer {
  render(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    fontScale: number = 1,
  ): void {
    const fontRegular = "Helvetica";
    const fontBold = "Helvetica-Bold";
    const scale = fontScale;

    // Left Aligned Header - Large Name
    doc
      .font(fontBold)
      .fontSize(22 * scale)
      .fillColor("#000000")
      .text(resume.contactInfo.name, { align: "left" });

    doc.moveDown(0.2 * scale);
    // Contact Info - Gray
    doc.fillColor("#666666");
    this.renderContactLine(doc, resume, fontRegular, 9 * scale, false, "left");
    doc.fillColor("#000000"); // Reset

    doc.moveDown(2 * scale);

    // Helpers - No Lines, just Spacing
    const drawHeader = (title: string) => {
      doc
        .font(fontBold)
        .fontSize(11 * scale)
        .text(title.toUpperCase(), { align: "left", characterSpacing: 2 });
      doc.moveDown(0.5 * scale);
    };

    if (resume.summary) {
      drawHeader("Profile");
      doc
        .font(fontRegular)
        .fontSize(9)
        .text(resume.summary, { align: "left", lineGap: 0.5 });
      doc.moveDown(1.5);
    }

    if (resume.experiences?.length) {
      drawHeader("Experience");
      resume.experiences.forEach((exp) => {
        // Custom Minimalist Experience Render
        doc
          .font(fontBold)
          .fontSize(10)
          .text(exp.role, { continued: true, align: "left" });
        doc
          .font(fontRegular)
          .text(` | ${exp.company}`, { continued: true, align: "left" });

        doc.text("", { continued: false }); // Break line

        // Date aligned right
        doc.moveUp(1);
        doc.text(exp.dateRange, { align: "right" });

        doc
          .fillColor("#666666")
          .font(fontRegular)
          .fontSize(9)
          .text(exp.location || "", { align: "left" });
        doc.fillColor("#000000"); // Reset

        exp.bullets.forEach((b: string) => {
          doc.text(`• ${b}`, { indent: 10, align: "left", lineGap: 1 });
        });
        doc.moveDown(1);
      });
    }

    if (resume.education?.length) {
      drawHeader("Education");
      resume.education.forEach((edu) => {
        const currentY = doc.y;

        // Institution (Left) - Truncate if too long to avoid overlap
        doc.font(fontBold).fontSize(10).text(edu.institution, {
          width: 350,
          lineBreak: false,
          ellipsis: true,
        });

        // Date (Right - Absolute Position)
        if (edu.dateRange) {
          const dateWidth = doc.widthOfString(edu.dateRange);
          doc
            .font(fontRegular)
            .fontSize(9)
            .text(edu.dateRange, 550 - dateWidth, currentY, {
              width: dateWidth,
              align: "right",
            });
        }

        // Reset to next line below institution (approx 1 line height)
        doc.y = currentY + 12;

        doc
          .font(fontRegular)
          .fontSize(9)
          .text(`${edu.degree} in ${edu.field}`, { align: "left" });
        if (edu.gpa) {
          doc.fillColor("#666666").text(`CGPA: ${edu.gpa}`, { align: "left" });
          doc.fillColor("#000000");
        }
        doc.moveDown(0.5);
      });
      doc.moveDown(1);
    }

    if (resume.skills?.length) {
      drawHeader("Skills");
      doc
        .font(fontRegular)
        .fontSize(9)
        .text(resume.skills.join("  |  "), { align: "left" });
    }
  }
}
