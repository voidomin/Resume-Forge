import PDFDocument from "pdfkit";
import { GeneratedResume } from "./gemini.service";

export class PDFService {
  /**
   * Generate a one-page ATS-friendly PDF resume
   * Narrow margins (0.5 inch = 36 points)
   */
  generateResumePDF(resume: GeneratedResume): Promise<Buffer> {
    const chunks: Buffer[] = [];

    // Create PDF with A4 size and narrow margins
    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: 36, // 0.5 inch
        bottom: 36,
        left: 36,
        right: 36,
      },
    });

    // Collect PDF chunks
    doc.on("data", (chunk) => chunks.push(chunk));

    // A4 dimensions: 595.28 x 841.89 points
    // Page dimensions with narrow margins (595 - 72 = 523)
    const pageWidth = 523;

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
      .fontSize(14)
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
      .fontSize(8)
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

      doc.font(fontRegular).fontSize(9).fillColor(black).text(resume.summary, {
        align: "justify",
        lineGap: 0.5,
      });

      doc.y += 10;
    }

    // ========== WORK EXPERIENCE ==========
    if (resume.experiences && resume.experiences.length > 0) {
      this.drawSectionHeader(doc, "WORK EXPERIENCE", fontBold);

      resume.experiences.forEach((exp, index) => {
        // Check if we need to limit content for one page (A4 height ~842)
        if (doc.y > 750) return; // Stop if running out of space

        // Role and Date on same line
        const dateText = exp.dateRange;
        doc.font(fontBold).fontSize(9).fillColor(black);
        doc.text(exp.role, 36, doc.y, { continued: true });
        doc.font(fontRegular).text(`  |  ${exp.company}`, { continued: true });
        if (exp.location) {
          doc.text(`  |  ${exp.location}`, { continued: true });
        }

        // Right-align the date (A4 width = 595)
        const dateWidth = doc.widthOfString(dateText);
        doc.text("", 0, doc.y); // New line
        doc.y -= 11; // Go back up
        doc.text(dateText, 595 - 36 - dateWidth, doc.y, { lineBreak: false });
        doc.y += 11;

        // Bullet points
        exp.bullets.forEach((bullet, bIndex) => {
          if (doc.y > 780) return; // Stop if running out of space

          doc.font(fontRegular).fontSize(9).fillColor(black);
          const bulletText = `•  ${bullet}`;
          doc.text(bulletText, 42, doc.y, {
            width: pageWidth - 12,
            lineGap: 0.5,
          });
        });

        if (index < resume.experiences.length - 1) {
          doc.y += 6;
        }
      });

      doc.y += 10;
    }

    // ========== PROJECTS ==========
    if (resume.projects && resume.projects.length > 0 && doc.y < 780) {
      this.drawSectionHeader(doc, "PROJECTS", fontBold);

      resume.projects.forEach((proj) => {
        if (doc.y > 800) return;

        doc
          .font(fontBold)
          .fontSize(9)
          .fillColor(black)
          .text(proj.name, { continued: true });
        if (proj.link) {
          doc.font(fontRegular).text(`  |  ${proj.link}`);
        } else {
          doc.text(""); // Clear continued
        }

        if (proj.technologies) {
          doc.font(fontRegular).fontSize(8).text(proj.technologies);
        }

        doc.font(fontRegular).fontSize(9).text(proj.description, {
          width: pageWidth,
          lineGap: 0.5,
        });

        doc.y += 6;
      });

      doc.y += 10;
    }

    // ========== EDUCATION ==========
    if (resume.education && resume.education.length > 0 && doc.y < 780) {
      this.drawSectionHeader(doc, "EDUCATION", fontBold);

      resume.education.forEach((edu) => {
        if (doc.y > 800) return;

        doc.font(fontBold).fontSize(9).fillColor(black);
        doc.text(`${edu.degree} in ${edu.field}`, { continued: true });
        doc
          .font(fontRegular)
          .text(`  |  ${edu.institution}`, { continued: true });

        if (edu.dateRange) {
          const dateWidth = doc.widthOfString(edu.dateRange);
          doc.text("", 0, doc.y);
          doc.y -= 11;
          doc.text(edu.dateRange, 595 - 36 - dateWidth, doc.y, {
            lineBreak: false,
          });
          doc.y += 11;
        } else {
          doc.text("");
        }

        if (edu.gpa) {
          doc.font(fontRegular).fontSize(8).text(`GPA: ${edu.gpa}`);
        }
      });

      doc.y += 10;
    }

    // ========== CERTIFICATIONS ==========
    if (
      resume.certifications &&
      resume.certifications.length > 0 &&
      doc.y < 780
    ) {
      this.drawSectionHeader(doc, "CERTIFICATIONS", fontBold);

      resume.certifications.forEach((cert) => {
        if (doc.y > 800) return;

        doc
          .font(fontBold)
          .fontSize(9)
          .fillColor(black)
          .text(cert.name, { continued: true });
        doc.font(fontRegular).text(`  |  ${cert.issuer}`, { continued: true });
        if (cert.link) {
          doc.text(`  |  ${cert.link}`, { continued: true });
        }

        if (cert.date) {
          const dateWidth = doc.widthOfString(cert.date);
          doc.text("", 0, doc.y);
          doc.y -= 11;
          doc.text(cert.date, 595 - 36 - dateWidth, doc.y, {
            lineBreak: false,
          });
          doc.y += 11;
        } else {
          doc.text("");
        }
      });
      doc.y += 10;
    }

    // ========== SKILLS ==========
    if (resume.skills && resume.skills.length > 0 && doc.y < 820) {
      this.drawSectionHeader(doc, "SKILLS", fontBold);

      doc
        .font(fontRegular)
        .fontSize(9)
        .fillColor(black)
        .text(resume.skills.join("  •  "), {
          width: pageWidth,
          lineGap: 0.5,
        });
    }

    // Finalize PDF and return buffer via Promise
    return new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
      doc.on("error", reject);
      doc.end();
    });
  }

  /**
   * Draw a section header with a line
   */
  private drawSectionHeader(
    doc: PDFKit.PDFDocument,
    title: string,
    font: string,
  ): void {
    doc.font(font).fontSize(10).fillColor("#000000").text(title);

    // Draw line under header (A4 width = 595)
    const y = doc.y + 2;
    doc
      .strokeColor("#000000")
      .lineWidth(0.5)
      .moveTo(36, y)
      .lineTo(595 - 36, y)
      .stroke();

    doc.y = y + 5;
  }
}

export const pdfService = new PDFService();
