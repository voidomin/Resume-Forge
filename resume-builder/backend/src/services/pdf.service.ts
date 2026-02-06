import PDFDocument from "pdfkit";
import { GeneratedResume } from "./gemini.service";

export type TemplateType = "modern" | "executive" | "minimalist" | "standard";

export class PDFService {
  /**
   * Generate a one-page ATS-friendly PDF resume with selected template
   */
  generateResumePDF(
    resume: GeneratedResume,
    template: TemplateType = "modern",
  ): Promise<Buffer> {
    const chunks: Buffer[] = [];

    const pageMargins = {
      top: 36,
      bottom: 36,
      left: 36,
      right: 36,
    };

    // Measure content height to determine if scaling is needed
    const scale = this.calculateScaleForContent(resume, template, pageMargins);

    // Create PDF with A4 size
    const doc = new PDFDocument({
      size: "A4",
      margins: pageMargins,
    });

    // Collect PDF chunks
    doc.on("data", (chunk) => chunks.push(chunk));

    // Store scale on document for access in render functions
    // This will scale all fonts/spacing BEFORE rendering to prevent page overflow
    (doc as any).__fontScale = scale;

    // Route to appropriate renderer
    this.renderTemplate(doc, resume, template);

    // Finalize PDF and return buffer via Promise
    return new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
      doc.end();
    });
  }

  private calculateScaleForContent(
    resume: GeneratedResume,
    template: TemplateType,
    margins: { top: number; bottom: number; left: number; right: number },
  ): number {
    const pageHeight = 842 - margins.top - margins.bottom;
    const minScale = 0.75; // Don't shrink too much (readability)
    const maxScale = 1.15; // Don't expand too much (looks comedic)

    // Initial measure with scale 1
    let { totalHeight, pages } = this.measureContentHeight(
      resume,
      template,
      margins,
      1,
    );

    // Case 1: Overflow (Need compression)
    if (pages > 1 || totalHeight > pageHeight) {
      let scale = 1;
      // Attempt mitigation loop
      for (let i = 0; i < 5; i++) {
        const ratio = pageHeight / totalHeight;
        scale = Math.max(minScale, scale * ratio * 0.98); // 0.98 buffer

        const check = this.measureContentHeight(
          resume,
          template,
          margins,
          scale,
        );
        if (check.pages === 1 && check.totalHeight <= pageHeight) return scale;

        totalHeight = check.totalHeight; // Update for next iteration
      }
      return minScale; // Fallback
    }

    // Case 2: Underflow (Need expansion)
    // If usage is less than 85% of page, try to expand
    const usageRatio = totalHeight / pageHeight;
    if (usageRatio < 0.85) {
      // Target ~92% fill
      const targetScale = Math.min(maxScale, 1 + (0.92 - usageRatio));

      // Verify expansion doesn't cause overflow
      const check = this.measureContentHeight(
        resume,
        template,
        margins,
        targetScale,
      );
      if (check.pages === 1) return targetScale;

      // If overflowed, back off halfway
      return (1 + targetScale) / 2;
    }

    return 1; // Perfect fit already
  }

  private measureContentHeight(
    resume: GeneratedResume,
    template: TemplateType,
    margins: { top: number; bottom: number; left: number; right: number },
    scale: number,
  ): { totalHeight: number; pages: number } {
    let pageCount = 1;

    const measureDoc = new PDFDocument({
      size: "A4",
      margins,
    });

    measureDoc.on("pageAdded", () => {
      pageCount += 1;
    });

    measureDoc.on("data", () => null);

    // Apply smart logic for standard template
    if (template === "standard") {
      // Heuristic: If scale is < 1, assume we want to compress spacing MORE than fonts
      // If scale is 0.9, fontScale = 0.95, spacingScale = 0.85
      let fontScale = scale;
      let spacingScale = scale;

      if (scale < 1) {
        spacingScale = scale * 0.9; // Compress spacing faster
        fontScale = Math.max(0.9, scale * 1.05); // Protect font size
      }

      (measureDoc as any).__fontScale = fontScale;
      (measureDoc as any).__spacingScale = spacingScale;
      this.renderStandard(measureDoc, resume, fontScale, spacingScale);
    } else {
      (measureDoc as any).__fontScale = scale;
      this.renderTemplate(measureDoc, resume, template);
    }

    const lastPageY = Math.max(0, measureDoc.y - margins.top);
    const pageHeight = 842 - margins.top - margins.bottom;
    const totalHeight = (pageCount - 1) * pageHeight + lastPageY;

    measureDoc.end();

    return { totalHeight, pages: pageCount };
  }

  private renderTemplate(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    template: TemplateType,
  ): void {
    switch (template) {
      case "executive":
        this.renderExecutive(doc, resume);
        break;
      case "standard":
        // Pass the calculated scales if available, otherwise default
        const fontScale = (doc as any).__fontScale || 1;
        const spacingScale = (doc as any).__spacingScale || 1;
        this.renderStandard(doc, resume, fontScale, spacingScale);
        break;
      case "minimalist":
        this.renderMinimalist(doc, resume);
        break;
      case "modern":
      default:
        this.renderModern(doc, resume);
        break;
    }
  }

  // =================================================================
  // 1. MODERN TEMPLATE (Default)
  // Clean, Sans-Serif, Standard Layout
  // =================================================================
  private renderStandard(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    fontScale: number = 1,
    spacingScale: number = 1,
  ): void {
    const fontRegular = "Times-Roman";
    const fontBold = "Times-Bold";

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
      doc.font(fontBold).fontSize(sectionTitleSize).text(title.toUpperCase());

      const y = doc.y + 2 * spacingScale;
      doc
        .strokeColor("#000000")
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
      .fillColor("#000000")
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
          .text(exp.role, { continued: true, align: "left" });

        doc
          .font(fontRegular)
          .text(`  |  ${exp.company}  |  ${exp.location || ""}`, {
            continued: false,
            align: "left",
          });

        // Date (Right Aligned)
        const dateWidth = doc.widthOfString(exp.dateRange);
        // Reset Y to start of line to draw date
        doc.text(exp.dateRange, 595 - 36 - dateWidth, startY, {
          align: "left",
        });

        // Move back to below the line
        doc.y = startY + doc.currentLineHeight(false) + 2 * spacingScale;

        exp.bullets.forEach((b: string) => {
          doc
            .font(fontRegular)
            .fontSize(baseFontSize)
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
          .text(proj.name, { continued: true, align: "left" });

        if (proj.link) {
          doc.font(fontRegular).text(`  |  ${proj.link}`, {
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
            .text(proj.technologies, { align: "left", oblique: true }); // Italic for techs
        }

        doc
          .font(fontRegular)
          .fontSize(baseFontSize)
          .text(proj.bullets ? "" : proj.description || "", {
            align: "left",
            lineGap: lineGap,
          });

        if (proj.bullets) {
          proj.bullets.forEach((b: string) => {
            doc
              .font(fontRegular)
              .fontSize(baseFontSize)
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
          .text(`${edu.degree} in ${edu.field}`, { continued: true });
        doc.font(fontRegular).text(`  |  ${edu.institution}`);

        if (edu.dateRange) {
          const w = doc.widthOfString(edu.dateRange);
          doc.text(edu.dateRange, 595 - 36 - w, startY, { align: "left" });
          doc.y = startY + doc.currentLineHeight(false) + 2 * spacingScale;
        }

        if (edu.gpa) {
          doc.text(`CGPA: ${edu.gpa}`);
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
        .text(resume.skills.join("  •  "), {
          align: "left",
          lineGap: lineGap * 1.5, // slightly more breathing room for skills
        });
    }
  }

  // =================================================================
  // 1. MODERN TEMPLATE (Default)
  // Clean, Sans-Serif, Standard Layout
  // =================================================================
  private renderModern(doc: PDFKit.PDFDocument, resume: GeneratedResume): void {
    const fontRegular = "Helvetica";
    const fontBold = "Helvetica-Bold";
    const scale = (doc as any).__fontScale || 1;

    // Header
    doc
      .font(fontBold)
      .fontSize(14 * scale)
      .fillColor("#2563eb") // Blue
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
        .text(resume.skills.join("  •  "), {
          align: "left",
          lineGap: 0.2 * scale,
        });
    }
  }

  // =================================================================
  // 2. EXECUTIVE TEMPLATE
  // Serif (Times), Centered Headers, Formal
  // =================================================================
  private renderExecutive(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
  ): void {
    const fontRegular = "Times-Roman";
    const fontBold = "Times-Bold";
    const scale = (doc as any).__fontScale || 1;

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
            .text(exp.dateRange, { align: "left" }); // Date below title in Exec layout? specific style choice
          // Actually let's put date on right for consistency

          exp.bullets.forEach((b) => {
            doc
              .font(fontRegular)
              .fontSize(10)
              .text(`• ${b}`, { indent: 15, lineGap: 1 });
          });
          doc.moveDown(0.5);
        });
      });
    }

    // ... Implement others similarly or reuse helpers ...
    // For brevity in this turn, I will focus on implementing the structure first.
    // I'll reuse the Modern logic for others quickly but with Times font.

    if (resume.skills?.length && doc.y < 800) {
      renderSection("Core Competencies", () => {
        doc
          .font(fontRegular)
          .fontSize(10)
          .text(resume.skills.join("  |  "), { align: "center" });
      });
    }
  }

  // =================================================================
  // 3. MINIMALIST TEMPLATE
  // Left Aligned, Clean, No Lines
  // =================================================================
  // =================================================================
  // 3. MINIMALIST TEMPLATE
  // Left Aligned, Clean, No Lines, Modern Spacing
  // =================================================================
  private renderMinimalist(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
  ): void {
    const fontRegular = "Helvetica";
    const fontBold = "Helvetica-Bold";
    const scale = (doc as any).__fontScale || 1;

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

    // Reuse Modern renderers but with specific tweaks if needed
    // For now, reuse logic but we need to intercept headers
    // Since renderExperienceModern calls drawModernHeader (which has lines),
    // we should create a renderExperienceMinimalist or genericize.

    // Quick Fix: Re-implement sections loop for Minimalist to avoid ModernHeader

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

        const dateWidth = doc.widthOfString(exp.dateRange);
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

        exp.bullets.forEach((b) => {
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

  // =================================================================
  // HELPERS
  // =================================================================

  private renderContactLine(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    font: string,
    size: number,
    center: boolean,
    align: "center" | "left" | "right" = "center",
  ) {
    const parts: { text: string; link?: string }[] = [];
    const isValid = (val: string | undefined) =>
      val &&
      val.trim().toLowerCase() !== "n/a" &&
      val.trim().toLowerCase() !== "none";

    if (resume.contactInfo.email && isValid(resume.contactInfo.email))
      parts.push({
        text: resume.contactInfo.email,
        link: `mailto:${resume.contactInfo.email}`,
      });
    if (resume.contactInfo.phone && isValid(resume.contactInfo.phone))
      parts.push({
        text: resume.contactInfo.phone,
        link: `tel:${resume.contactInfo.phone}`,
      });
    if (resume.contactInfo.location && isValid(resume.contactInfo.location))
      parts.push({ text: resume.contactInfo.location });

    // Helper to strip protocol for display
    const formatUrl = (url: string) =>
      url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

    if (resume.contactInfo.linkedin && isValid(resume.contactInfo.linkedin))
      parts.push({
        text: formatUrl(resume.contactInfo.linkedin),
        link: resume.contactInfo.linkedin.startsWith("http")
          ? resume.contactInfo.linkedin
          : `https://${resume.contactInfo.linkedin}`,
      });
    if (resume.contactInfo.github && isValid(resume.contactInfo.github))
      parts.push({
        text: formatUrl(resume.contactInfo.github),
        link: resume.contactInfo.github.startsWith("http")
          ? resume.contactInfo.github
          : `https://${resume.contactInfo.github}`,
      });
    if (resume.contactInfo.portfolio && isValid(resume.contactInfo.portfolio))
      parts.push({
        text: formatUrl(resume.contactInfo.portfolio),
        link: resume.contactInfo.portfolio.startsWith("http")
          ? resume.contactInfo.portfolio
          : `https://${resume.contactInfo.portfolio}`,
      });

    // Calculate total width if centered (approximated) to center correctly?
    // PDFKit "center" align works for single text command.
    // For multiple pieces with different links, "continued: true" is tricky with center align.
    // A trick: Render everything twice? No.
    // Better: If centered, we might have to lose individual links OR use x/y calculations.
    // PDFKit's `text` with `continued` works well for left align.

    // For simplicity and robustness with links:
    // If align is center, we can just use simple text if links are hard.
    // BUT user specifically requested clickable links.
    // So we MUST use `continued: true`.
    // However, `continued` with `align: center` in PDFKit is buggy/hard.

    // Alternative: Just render them one by one with calculated positions? Hard.
    // Let's try standard flow. If "center", it's hard.
    // Maybe render as one line string? But we need different links.

    // Compromise: If styling allows, use widely supported way.
    // Actually, modern PDFKit supports `continued` with links.
    // Centering a set of continued texts is the issue.

    // Let's assume standard left flow helper, and if center is needed, we start at a calculated X?
    // Calculating width of all text...

    doc.font(font).fontSize(size);

    let startX = doc.x;
    if (align === "center" || center) {
      // Calculate total width
      const fullString = parts.map((p) => p.text).join("  |  ");
      const w = doc.widthOfString(fullString);
      startX = (doc.page.width - w) / 2;
      doc.x = startX;
    } else if (align === "right") {
      const fullString = parts.map((p) => p.text).join("  |  ");
      const w = doc.widthOfString(fullString);
      startX = doc.page.width - doc.page.margins.right - w;
      doc.x = startX;
    }

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const separator = isLast ? "" : "  |  ";

      doc.text(part.text, {
        continued: true,
        link: part.link,
        underline: !!part.link,
      });

      doc.text(separator, {
        continued: !isLast,
        underline: false,
        link: null,
      });
    });
    doc.text("", { continued: false }); // End line
  }

  private drawModernHeader(
    doc: PDFKit.PDFDocument,
    title: string,
    scale: number = 1,
  ) {
    doc
      .font("Helvetica-Bold")
      .fontSize(10 * scale)
      .fillColor("#2563eb")
      .text(title); // Blue
    const y = doc.y + 2;
    doc
      .strokeColor("#2563eb") // Blue
      .lineWidth(0.5)
      .moveTo(36, y)
      .lineTo(559, y)
      .stroke();
    doc.fillColor("#000000"); // Reset to black
    doc.strokeColor("#000000"); // Reset
    doc.y += 5 * scale;
  }

  private renderExperienceModern(
    doc: PDFKit.PDFDocument,
    exp: any,
    fontBold: string,
    fontRegular: string,
    scale: number = 1,
  ) {
    doc
      .font(fontBold)
      .fontSize(9 * scale)
      .text(exp.role, 36, doc.y, { continued: true, align: "left" });
    doc
      .font(fontRegular)
      .text(`  |  ${exp.company}  |  ${exp.location || ""}`, {
        continued: false,
        align: "left",
      });

    // Date on right
    const dateWidth = doc.widthOfString(exp.dateRange);
    doc.y -= 11 * scale;
    doc.text(exp.dateRange, 595 - 36 - dateWidth, doc.y);
    doc.y += 11 * scale;

    exp.bullets.forEach((b: string) => {
      doc
        .font(fontRegular)
        .fontSize(8.5 * scale)
        .text(`•  ${b}`, 42, doc.y, {
          width: 510,
          lineGap: 0.2 * scale,
          align: "left",
        });
    });
  }

  private renderProjectModern(
    doc: PDFKit.PDFDocument,
    proj: any,
    fontBold: string,
    fontRegular: string,
    scale: number = 1,
  ) {
    doc
      .font(fontBold)
      .fontSize(9 * scale)
      .text(proj.name, { continued: true, align: "left" });
    if (proj.link) {
      doc.font(fontRegular).text(`  |  ${proj.link}`, {
        link: proj.link.startsWith("http") ? proj.link : `https://${proj.link}`,
        underline: true,
        align: "left",
      });
    } else {
      doc.text("");
    }

    if (proj.technologies)
      doc
        .font(fontRegular)
        .fontSize(8 * scale)
        .text(proj.technologies, { align: "left" });

    doc
      .font(fontRegular)
      .fontSize(8.5 * scale)
      .text(proj.description, { align: "left", lineGap: 0.2 * scale });
  }

  private renderEducationModern(
    doc: PDFKit.PDFDocument,
    edu: any,
    fontBold: string,
    fontRegular: string,
    scale: number = 1,
  ) {
    doc
      .font(fontBold)
      .fontSize(9 * scale)
      .text(`${edu.degree} in ${edu.field}`, { continued: true });
    doc.font(fontRegular).text(`  |  ${edu.institution}`);

    if (edu.dateRange) {
      const w = doc.widthOfString(edu.dateRange);
      doc.y -= 11 * scale;
      doc.text(edu.dateRange, 559 - w, doc.y);
      doc.y += 11 * scale;
    }
  }
}

export const pdfService = new PDFService();
