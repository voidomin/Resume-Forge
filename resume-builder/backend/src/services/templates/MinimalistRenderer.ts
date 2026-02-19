import PDFDocument from "pdfkit";
import { GeneratedResume } from "../gemini.service";
import { BaseTemplateRenderer } from "./BaseTemplateRenderer";
import {
  UnifiedDesignSystem,
  dynamicSizingEngine,
} from "../../../../shared/design-system";

export class MinimalistRenderer extends BaseTemplateRenderer {
  render(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    fontScale: number = 1,
    spacingScale: number = 1,
  ): void {
    // Get scaled design system values
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

    // Helper: Section Headers (Uppercase, Tracking, TextLight Color)
    const drawHeader = (title: string) => {
      this.moveDownPoints(doc, 2);
      doc
        .font(fontBold)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.textLight)
        .text(title.toUpperCase(), { characterSpacing: 2 });

      const y = doc.y + 2;
      doc
        .strokeColor(UnifiedDesignSystem.colors.secondary)
        .opacity(0.3)
        .lineWidth(0.5)
        .moveTo(scaledMargin, y)
        .lineTo(scaledMargin + 64, y)
        .stroke()
        .opacity(1);

      doc.y = y + ds.spacing.element;
    };

    // 1. Header (Left Aligned, Clean)
    doc
      .font(fontBold)
      .fontSize(ds.fontSize.h1)
      .fillColor(UnifiedDesignSystem.colors.text)
      .text(resume.contactInfo.name, { align: "left", characterSpacing: -0.5 });

    this.moveDownPoints(doc, 4);

    // 2. Contact (Left aligned, wrapped)
    this.renderContactLine(
      doc,
      resume,
      fontRegular,
      ds.fontSize.body,
      false,
      "left",
    );

    this.moveDownPoints(doc, 15);

    // 3. Summary
    if (resume.summary) {
      drawHeader("ABOUT");
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(resume.summary, { align: "left", lineGap: 1.6 });
      doc.y += ds.spacing.section;
    }

    // 4. Experience
    if (resume.experiences?.length) {
      drawHeader("EXPERIENCE");
      resume.experiences.forEach((exp) => {
        // Role
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body + 1)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(exp.role);

        this.moveDownPoints(doc, 2);

        // Company | Location | Date
        doc
          .font(fontRegular)
          .fontSize(ds.fontSize.body - 1)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(
            `${exp.company} ${exp.location ? " | " + exp.location : ""} | ${exp.dateRange}`,
          );

        this.moveDownPoints(doc, 5);

        // Bullets
        exp.bullets.forEach((b: string) => {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body)
            .fillColor(UnifiedDesignSystem.colors.text)
            .text(b, {
              indent: 10,
              lineGap: 1.6,
            });
        });
        doc.y += ds.spacing.element;
      });
      doc.y += ds.spacing.section;
    }

    // 5. Projects
    if (resume.projects?.length) {
      drawHeader("PROJECTS");
      resume.projects.forEach((proj) => {
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body + 1)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(proj.name, { continued: true });

        if (proj.technologies) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body - 1)
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(`  ${proj.technologies}`, { continued: false });
        } else {
          doc.text("");
        }

        this.moveDownPoints(doc, 2);

        if (proj.link) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body - 1)
            .fillColor(UnifiedDesignSystem.colors.primary)
            .text(proj.link, { link: proj.link });
          this.moveDownPoints(doc, 2);
        }

        if (proj.description) {
          doc
            .font(fontRegular)
            .fontSize(ds.fontSize.body)
            .fillColor(UnifiedDesignSystem.colors.text)
            .text(proj.description, { lineGap: 1.6 });
        }

        if (proj.bullets) {
          proj.bullets.forEach((b: string) => {
            doc
              .font(fontRegular)
              .fontSize(ds.fontSize.body)
              .fillColor(UnifiedDesignSystem.colors.text)
              .text(b, {
                indent: 10,
                lineGap: 1.6,
              });
          });
        }
        doc.y += ds.spacing.element;
      });
      doc.y += ds.spacing.section;
    }

    // 6. Education
    if (resume.education?.length) {
      drawHeader("EDUCATION");
      resume.education.forEach((edu) => {
        // Institution
        doc
          .font(fontBold)
          .fontSize(ds.fontSize.body)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(edu.institution, { continued: true });

        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.textLight)
          .text(`  |  ${edu.dateRange}`, { continued: false });

        // Degree
        doc
          .font(fontRegular)
          .fillColor(UnifiedDesignSystem.colors.text)
          .text(`${edu.degree} in ${edu.field}`);

        if (edu.gpa) {
          doc
            .fillColor(UnifiedDesignSystem.colors.textLight)
            .text(`GPA: ${edu.gpa}`);
        }
        doc.y += ds.spacing.element;
      });
      doc.y += ds.spacing.section;
    }

    // 7. Skills
    if (resume.skills?.length) {
      drawHeader("SKILLS");
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body)
        .fillColor(UnifiedDesignSystem.colors.text)
        .text(resume.skills.join(", "), {
          lineGap: 1.6,
        });
    }
  }
}
