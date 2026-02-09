import PDFDocument from "pdfkit";
import { GeneratedResume } from "../gemini.service";
import { BaseTemplateRenderer } from "./BaseTemplateRenderer";
import { DesignTokens } from "./design-tokens";

export class StandardRenderer extends BaseTemplateRenderer {
  render(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    fontScale: number = 1,
    spacingScale: number = 1,
  ): void {
    const fontRegular = DesignTokens.fonts.serif;
    const fontBold = DesignTokens.fonts.serifBold;
    const { primary, secondary, text, textLight } = DesignTokens.colors;

    // Adaptive sizes based on fontScale
    // We clamp the minimum font size to 9pt to ensure readability
    const baseFontSize = 10 * fontScale < 9 ? 9 : 10 * fontScale;
    const headerFontSize = 16 * fontScale;
    const sectionTitleSize = 11 * fontScale;

    // Spacing multipliers
    const lineGap = 1 * spacingScale; // Space between lines of text
    const sectionGap = 12 * spacingScale; // Space between major sections
    const itemGap = 8 * spacingScale; // Space between job items/projects
    const headerGap = 5 * spacingScale; // Space after section headers

    // Section Header - Left Aligned with Line
    const drawHeader = (title: string) => {
      doc.moveDown(0.2); // Tiny clear space
      doc
        .font(fontBold)
        .fontSize(sectionTitleSize)
        .fillColor(text) // Pro Max Text Color
        .text(title.toUpperCase());

      const y = doc.y + 2 * spacingScale;
      doc
        .strokeColor(primary) // Pro Max Primary Color for border
        .lineWidth(0.5)
        .moveTo(36, y)
        .lineTo(559, y)
        .stroke();

      doc.y = y + headerGap; // Apply dynamic gap
    };

    // Header - Name
    doc
      .font(fontBold)
      .fontSize(headerFontSize)
      .fillColor(text)
      .text(resume.contactInfo.name.toUpperCase(), { align: "left" });

    doc.moveDown(0.2 * spacingScale);

    // Contact Line
    this.renderContactLine(
      doc,
      resume,
      fontRegular,
      baseFontSize,
      false,
      "left",
    );

    doc.moveDown(0.5 * spacingScale);

    if (resume.summary) {
      drawHeader("PROFESSIONAL SUMMARY");
      doc
        .font(fontRegular)
        .fontSize(baseFontSize)
        .fillColor(text)
        .text(resume.summary, { align: "justify", lineGap: lineGap });
      doc.y += sectionGap;
    }

    if (resume.experiences?.length) {
      drawHeader("WORK EXPERIENCE");
      resume.experiences.forEach((exp) => {
        // Role & Company Line
        const startY = doc.y;

        // Role (Left)
        doc
          .font(fontBold)
          .fontSize(baseFontSize)
          .fillColor(text)
          .text(exp.role, { continued: true, align: "left" });

        doc
          .font(fontRegular)
          .fillColor(secondary)
          .text("  |  ", { continued: true })
          .fillColor(primary) // Company in Primary
          .text(exp.company, { continued: true })
          .fillColor(textLight)
          .text(exp.location ? `  |  ${exp.location}` : "", {
            continued: false,
            align: "left",
          });

        // Date (Right Aligned)
        const dateWidth = doc.widthOfString(exp.dateRange);
        // Reset Y to start of line to draw date
        doc
          .fillColor(textLight)
          .text(exp.dateRange, 595 - 36 - dateWidth, startY, {
            align: "left",
          });

        // Move back to below the line
        doc.y = startY + doc.currentLineHeight(false) + 2 * spacingScale;

        exp.bullets.forEach((b: string) => {
          doc
            .font(fontRegular)
            .fontSize(baseFontSize)
            .fillColor(text)
            .text(`•  ${b}`, 42, doc.y, {
              width: 510,
              lineGap: lineGap,
              align: "left",
            });
        });
        doc.y += itemGap;
      });
      // Adjust last item gap to section gap
      doc.y = doc.y - itemGap + sectionGap;
    }

    if (resume.projects?.length) {
      drawHeader("PROJECTS");
      resume.projects.forEach((proj) => {
        const startY = doc.y;

        doc
          .font(fontBold)
          .fontSize(baseFontSize)
          .fillColor(text)
          .text(proj.name, { continued: true, align: "left" });

        if (proj.link) {
          doc
            .font(fontRegular)
            .fillColor(textLight)
            .text("  |  ", { continued: true })
            .fillColor(primary)
            .text(proj.link, {
              link: proj.link.startsWith("http")
                ? proj.link
                : `https://${proj.link}`,
              underline: true,
              align: "left",
              continued: false,
            });
        } else {
          doc.text(""); // Clear continued state
        }

        if (proj.technologies) {
          doc
            .font(fontRegular)
            .fontSize(baseFontSize - 1) // Slightly smaller
            .fillColor(textLight)
            .text(proj.technologies, { align: "left", oblique: true }); // Italic for techs
        }

        doc
          .font(fontRegular)
          .fontSize(baseFontSize)
          .fillColor(text)
          .text(proj.bullets ? "" : proj.description || "", {
            align: "left",
            lineGap: lineGap,
          });

        if (proj.bullets) {
          proj.bullets.forEach((b: string) => {
            doc
              .font(fontRegular)
              .fontSize(baseFontSize)
              .fillColor(text)
              .text(`•  ${b}`, 42, doc.y, {
                width: 510,
                lineGap: lineGap,
                align: "left",
              });
          });
        }
        doc.y += itemGap;
      });
      doc.y = doc.y - itemGap + sectionGap;
    }

    if (resume.education?.length) {
      drawHeader("EDUCATION");
      resume.education.forEach((edu) => {
        const startY = doc.y;

        doc
          .font(fontBold)
          .fontSize(baseFontSize)
          .fillColor(text)
          .text(`${edu.degree} in ${edu.field}`, { continued: true });

        doc
          .font(fontRegular)
          .fillColor(textLight)
          .text("  |  ", { continued: true })
          .fillColor(text)
          .text(edu.institution);

        if (edu.dateRange) {
          const w = doc.widthOfString(edu.dateRange);
          doc
            .fillColor(textLight)
            .text(edu.dateRange, 595 - 36 - w, startY, { align: "left" });
          doc.y = startY + doc.currentLineHeight(false) + 2 * spacingScale;
        }

        if (edu.gpa) {
          doc.fillColor(textLight).text(`CGPA: ${edu.gpa}`);
        }
        doc.y += itemGap;
      });
      doc.y = doc.y - itemGap + sectionGap;
    }

    if (resume.skills?.length) {
      drawHeader("SKILLS");
      doc
        .font(fontRegular)
        .fontSize(baseFontSize)
        .fillColor(text)
        .text(resume.skills.join("  •  "), {
          align: "left",
          lineGap: lineGap * 1.5, // slightly more breathing room for skills
        });
    }
  }
}
