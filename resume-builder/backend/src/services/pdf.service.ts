import PDFDocument from "pdfkit";
import { GeneratedResume } from "./gemini.service";
import { StandardRenderer } from "./templates/StandardRenderer";
import { ModernRenderer } from "./templates/ModernRenderer";
import { ExecutiveRenderer } from "./templates/ExecutiveRenderer";
import { MinimalistRenderer } from "./templates/MinimalistRenderer";
import { TemplateRenderer } from "./templates/TemplateRenderer.interface";
import {
  UnifiedDesignSystem,
  contentDensityEngine,
  DensityLevel,
  ScaledDesignSystem,
} from "../../../shared/design-system";
import { logger } from "../lib/logger";

// Re-export type if needed
export type { TemplateType } from "./pdf.service.types";

/**
 * Enhanced PDF Service with Content Density Engine
 *
 * Principles:
 * - Content determines density level (NORMAL, COMPACT, ULTRA_COMPACT)
 * - Auto-detect based on word count and section count
 * - Apply proportional scaling to margins, fonts, spacing
 * - Minimize optional sections when space is tight
 * - Always fits on one page, no overflow, optimal white space
 */
export class PDFService {
  private renderers: Record<string, TemplateRenderer>;

  constructor() {
    this.renderers = {
      standard: new StandardRenderer(),
      modern: new ModernRenderer(),
      executive: new ExecutiveRenderer(),
      minimalist: new MinimalistRenderer(),
    };
  }

  /**
   * Generate a one-page adaptive resume
   *
   * Algorithm:
   * 1. Analyze content to determine optimal density
   * 2. Get scaled design system for that density
   * 3. Create PDF with scaled margins
   * 4. Render with density-aware templates
   *
   * All sizing (margins, fonts, spacing) scales based on density level
   */
  generateResumePDF(
    resume: GeneratedResume,
    template: string = "modern",
    userDensityOverride?: DensityLevel,
  ): Promise<Buffer> {
    const chunks: Buffer[] = [];

    // Safe template fallback
    const selectedTemplate = this.renderers[template] ? template : "modern";

    // Step 1: Analyze content and detect optimal density
    const contentAnalysis = this.analyzeResumeContent(resume);
    const density = userDensityOverride || contentAnalysis.recommendedDensity;

    logger.debug(
      `PDF Density: ${density} (words: ${contentAnalysis.wordCount})`,
    );

    // Step 2: Get scaled design system for this density
    const scaledDS = contentDensityEngine.getScaledDesignSystem(density);

    // Step 3: Create PDF with scaled margins
    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: scaledDS.margins.pageTop,
        left: scaledDS.margins.pageLeft,
        bottom: scaledDS.margins.pageBottom,
        right: scaledDS.margins.pageRight,
      },
    });

    // Collect PDF chunks
    doc.on("data", (chunk) => chunks.push(chunk));

    // Attach density info for templates to use
    (doc as any).__density = density;
    (doc as any).__scaledDesignSystem = scaledDS;

    // Step 4: Route to appropriate renderer with density
    const renderer = this.renderers[selectedTemplate];
    renderer.renderWithDensity(doc, resume, density);

    // Finalize PDF and return buffer via Promise
    return new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
      doc.end();
    });
  }

  /**
   * Analyze resume content to determine density
   *
   * Counts words, sections, and optional sections
   * Uses ContentDensityEngine to recommend density level
   */
  private analyzeResumeContent(resume: GeneratedResume): any {
    // Count total words
    let wordCount = 0;

    // Count contact info words
    if (resume.contactInfo?.name)
      wordCount += resume.contactInfo.name.split(/\s+/).length;
    if (resume.contactInfo?.email) wordCount += 1;
    if (resume.contactInfo?.phone) wordCount += 1;
    if (resume.contactInfo?.location)
      wordCount += resume.contactInfo.location.split(/\s+/).length;

    // Count summary
    if (resume.summary) {
      wordCount += resume.summary.split(/\s+/).length;
    }

    // Count experiences
    if (resume.experiences) {
      resume.experiences.forEach((exp) => {
        if (exp.company) wordCount += exp.company.split(/\s+/).length;
        if (exp.role) wordCount += exp.role.split(/\s+/).length;
        if (exp.location) wordCount += exp.location.split(/\s+/).length;
        if (exp.bullets) {
          exp.bullets.forEach((bullet) => {
            wordCount += bullet.split(/\s+/).length;
          });
        }
      });
    }

    // Count education
    if (resume.education) {
      resume.education.forEach((edu) => {
        if (edu.institution) wordCount += edu.institution.split(/\s+/).length;
        if (edu.degree) wordCount += edu.degree.split(/\s+/).length;
        if (edu.field) wordCount += edu.field.split(/\s+/).length;
      });
    }

    // Count skills
    if (resume.skills && Array.isArray(resume.skills)) {
      wordCount += resume.skills.length;
    }

    // Count projects
    if (resume.projects) {
      resume.projects.forEach((proj) => {
        if (proj.name) wordCount += proj.name.split(/\s+/).length;
        if (proj.description) wordCount += proj.description.split(/\s+/).length;
      });
    }

    // Count certifications
    if (resume.certifications) {
      resume.certifications.forEach((cert) => {
        if (cert.name) wordCount += cert.name.split(/\s+/).length;
        if (cert.issuer) wordCount += cert.issuer.split(/\s+/).length;
      });
    }

    // Count optional sections
    if (resume.coursework) {
      resume.coursework.forEach((course) => {
        if (course.courseName)
          wordCount += course.courseName.split(/\s+/).length;
        if (course.topic) wordCount += course.topic.split(/\s+/).length;
      });
    }

    if (resume.leadership) {
      resume.leadership.forEach((role) => {
        if (role.title) wordCount += role.title.split(/\s+/).length;
        if (role.organization)
          wordCount += role.organization.split(/\s+/).length;
        if (role.description) wordCount += role.description.split(/\s+/).length;
      });
    }

    if (resume.awards) {
      resume.awards.forEach((award) => {
        if (award.awardName) wordCount += award.awardName.split(/\s+/).length;
        if (award.organization)
          wordCount += award.organization.split(/\s+/).length;
        if (award.description)
          wordCount += award.description.split(/\s+/).length;
      });
    }

    // Count sections
    let sectionCount = 0;
    if (resume.summary) sectionCount++;
    if (resume.experiences?.length) sectionCount++;
    if (resume.education?.length) sectionCount++;
    if (resume.skills?.length) sectionCount++;
    if (resume.projects?.length) sectionCount++;
    if (resume.certifications?.length) sectionCount++;
    if (resume.coursework?.length) sectionCount++;
    if (resume.leadership?.length) sectionCount++;
    if (resume.awards?.length) sectionCount++;

    // Check for optional sections
    const hasOptionalSections =
      (resume.coursework?.length || 0) > 0 ||
      (resume.leadership?.length || 0) > 0 ||
      (resume.awards?.length || 0) > 0;

    // Analyze using density engine
    const analysis = contentDensityEngine.analyzeContentVolume({
      wordCount,
      sectionCount,
      hasOptionalSections,
    });

    return analysis;
  }
}

export const pdfService = new PDFService();
