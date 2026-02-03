import PDFDocument from "pdfkit";
import { GeneratedResume } from "./gemini.service";

export class PDFService {
  /**
   * Generate a one-page ATS-friendly PDF resume
   * Narrow margins (0.5 inch = 36 points)
   */
  generateResumePDF(resume: GeneratedResume): Buffer {
    const chunks: Buffer[] = [];

    // Create PDF with narrow margins
    const doc = new PDFDocument({
      size: "LETTER",
      margins: {
        top: 36, // 0.5 inch
        bottom: 36,
        left: 36,
        right: 36,
      },
    });

    // Collect PDF chunks
    doc.on("data", (chunk) => chunks.push(chunk));

    // Page dimensions with narrow margins
    const pageWidth = 612 - 72; // Letter width minus margins (540)

    // Fonts - using Helvetica (ATS-friendly, similar to Arial)
    const fontRegular = "Helvetica";
    const fontBold = "Helvetica-Bold";

    // Colors
    const black = "#000000";
    const darkGray = "#333333";

    let yPos = doc.y;

    // ========== HEADER - Contact Info ==========
    // Name (centered, large)
    doc
      .font(fontBold)
      .fontSize(18)
      .fillColor(black)
      .text(resume.contactInfo.name.toUpperCase(), { align: "center" });

    yPos = doc.y + 4;

    // Contact line (centered)
    const contactParts: string[] = [];
    if (resume.contactInfo.email) contactParts.push(resume.contactInfo.email);
    if (resume.contactInfo.phone) contactParts.push(resume.contactInfo.phone);
    if (resume.contactInfo.location)
      contactParts.push(resume.contactInfo.location);

    doc
      .font(fontRegular)
      .fontSize(9)
      .fillColor(darkGray)
      .text(contactParts.join("  |  "), { align: "center" });

    // Links line (if any)
    const linkParts: string[] = [];
    if (resume.contactInfo.linkedin)
      linkParts.push(resume.contactInfo.linkedin);
    if (resume.contactInfo.github) linkParts.push(resume.contactInfo.github);

    if (linkParts.length > 0) {
      doc.text(linkParts.join("  |  "), { align: "center" });
    }

    yPos = doc.y + 12;
    doc.y = yPos;

    // ========== PROFESSIONAL SUMMARY ==========
    if (resume.summary) {
      this.drawSectionHeader(doc, "PROFESSIONAL SUMMARY", fontBold);

      doc.font(fontRegular).fontSize(10).fillColor(black).text(resume.summary, {
        align: "justify",
        lineGap: 1,
      });

      doc.y += 10;
    }

    // ========== WORK EXPERIENCE ==========
    if (resume.experiences && resume.experiences.length > 0) {
      this.drawSectionHeader(doc, "WORK EXPERIENCE", fontBold);

      resume.experiences.forEach((exp, index) => {
        // Check if we need to limit content for one page
        if (doc.y > 650) return; // Stop if running out of space

        // Role and Date on same line
        const dateText = exp.dateRange;
        doc.font(fontBold).fontSize(10).fillColor(black);
        doc.text(exp.role, 36, doc.y, { continued: true });
        doc.font(fontRegular).text(`  |  ${exp.company}`, { continued: true });
        if (exp.location) {
          doc.text(`  |  ${exp.location}`, { continued: true });
        }

        // Right-align the date
        const dateWidth = doc.widthOfString(dateText);
        doc.text("", 0, doc.y); // New line
        doc.y -= 12; // Go back up
        doc.text(dateText, 612 - 36 - dateWidth, doc.y, { lineBreak: false });
        doc.y += 12;

        // Bullet points
        exp.bullets.forEach((bullet, bIndex) => {
          if (doc.y > 680) return; // Stop if running out of space

          doc.font(fontRegular).fontSize(10).fillColor(black);
          const bulletText = `•  ${bullet}`;
          doc.text(bulletText, 42, doc.y, {
            width: pageWidth - 12,
            lineGap: 1,
          });
        });

        if (index < resume.experiences.length - 1) {
          doc.y += 6;
        }
      });

      doc.y += 10;
    }

    // ========== EDUCATION ==========
    if (resume.education && resume.education.length > 0 && doc.y < 680) {
      this.drawSectionHeader(doc, "EDUCATION", fontBold);

      resume.education.forEach((edu) => {
        if (doc.y > 700) return;

        doc.font(fontBold).fontSize(10).fillColor(black);
        doc.text(`${edu.degree} in ${edu.field}`, { continued: true });
        doc
          .font(fontRegular)
          .text(`  |  ${edu.institution}`, { continued: true });

        if (edu.dateRange) {
          const dateWidth = doc.widthOfString(edu.dateRange);
          doc.text("", 0, doc.y);
          doc.y -= 12;
          doc.text(edu.dateRange, 612 - 36 - dateWidth, doc.y, {
            lineBreak: false,
          });
          doc.y += 12;
        } else {
          doc.text("");
        }

        if (edu.gpa) {
          doc.font(fontRegular).fontSize(9).text(`GPA: ${edu.gpa}`);
        }
      });

      doc.y += 10;
    }

    // ========== SKILLS ==========
    if (resume.skills && resume.skills.length > 0 && doc.y < 720) {
      this.drawSectionHeader(doc, "SKILLS", fontBold);

      doc
        .font(fontRegular)
        .fontSize(10)
        .fillColor(black)
        .text(resume.skills.join("  •  "), {
          width: pageWidth,
          lineGap: 1,
        });
    }

    // Finalize PDF
    doc.end();

    // Return buffer
    return Buffer.concat(chunks);
  }

  /**
   * Draw a section header with a line
   */
  private drawSectionHeader(
    doc: PDFKit.PDFDocument,
    title: string,
    font: string,
  ): void {
    doc.font(font).fontSize(11).fillColor("#000000").text(title);

    // Draw line under header
    const y = doc.y + 2;
    doc
      .strokeColor("#000000")
      .lineWidth(0.5)
      .moveTo(36, y)
      .lineTo(612 - 36, y)
      .stroke();

    doc.y = y + 6;
  }
}

export const pdfService = new PDFService();
