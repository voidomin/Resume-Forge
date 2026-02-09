import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
  TabStopType,
  ExternalHyperlink,
} from "docx";
import { GeneratedResume } from "./gemini.service";
import { DesignTokens } from "./templates/design-tokens";

export class DocxService {
  /**
   * Generate a one-page ATS-friendly DOCX resume
   * Narrow margins (0.5 inch)
   */
  async generateResumeDocx(resume: GeneratedResume): Promise<Buffer> {
    const pageWidthInches = 8.27;
    const pageHeightInches = 11.69;
    const pageMarginInches = 0.5;
    const rightTabStop = convertInchesToTwip(
      pageWidthInches - pageMarginInches,
    );

    // Helpers for Design Tokens
    const cleanColor = (hex: string) => hex.replace("#", "");
    const { primary, text, textLight, secondary } = DesignTokens.colors;

    // Map PDF fonts to Word fonts
    // Times-Roman -> Times New Roman
    // Helvetica -> Arial
    const bodyFont = "Times New Roman";
    const headerFont = "Times New Roman";

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                width: convertInchesToTwip(pageWidthInches),
                height: convertInchesToTwip(pageHeightInches),
              },
              margin: {
                top: convertInchesToTwip(pageMarginInches),
                right: convertInchesToTwip(pageMarginInches),
                bottom: convertInchesToTwip(pageMarginInches),
                left: convertInchesToTwip(pageMarginInches),
              },
            },
          },
          children: [
            // Header - Name
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: resume.contactInfo.name.toUpperCase(),
                  bold: true,
                  size: 28, // 14pt
                  font: headerFont,
                  color: cleanColor(primary), // Pro Max Primary
                }),
              ],
            }),

            // Contact Info Line (Email, Phone, Location)
            this.createContactLine(resume.contactInfo, bodyFont),

            // Links Line (LinkedIn, GitHub, Portfolio)
            this.createLinksLine(resume.contactInfo, bodyFont),

            // Spacing
            new Paragraph({ spacing: { after: 200 } }),

            // Professional Summary
            ...(resume.summary
              ? this.createSummarySection(resume.summary, bodyFont)
              : []),

            // Work Experience
            ...(resume.experiences.length > 0
              ? this.createExperienceSection(
                  resume.experiences,
                  rightTabStop,
                  bodyFont,
                )
              : []),

            // Projects
            ...(resume.projects && resume.projects.length > 0
              ? this.createProjectsSection(resume.projects, bodyFont)
              : []),

            // Education
            ...(resume.education.length > 0
              ? this.createEducationSection(
                  resume.education,
                  rightTabStop,
                  bodyFont,
                )
              : []),

            // Certifications
            ...(resume.certifications && resume.certifications.length > 0
              ? this.createCertificationsSection(
                  resume.certifications,
                  rightTabStop,
                  bodyFont,
                )
              : []),

            // Skills
            ...(resume.skills.length > 0
              ? this.createSkillsSection(resume.skills, bodyFont)
              : []),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }

  private createContactLine(
    contact: GeneratedResume["contactInfo"],
    font: string,
  ): Paragraph {
    const children: (TextRun | ExternalHyperlink)[] = [];
    const parts: any[] = [];
    const { text, textLight } = DesignTokens.colors;
    const cleanColor = (hex: string) => hex.replace("#", "");

    if (contact.email) {
      parts.push(
        new ExternalHyperlink({
          children: [
            new TextRun({
              text: contact.email,
              size: 19, // 9.5pt
              font: font,
              color: cleanColor(text),
              underline: {},
            }),
          ],
          link: `mailto:${contact.email}`,
        }),
      );
    }

    if (contact.phone) {
      parts.push(
        new TextRun({
          text: contact.phone,
          size: 19,
          font: font,
          color: cleanColor(text),
        }),
      );
    }

    if (contact.location) {
      parts.push(
        new TextRun({
          text: contact.location,
          size: 19,
          font: font,
          color: cleanColor(text),
        }),
      );
    }

    // Join with " | "
    parts.forEach((part, index) => {
      children.push(part);
      if (index < parts.length - 1) {
        children.push(
          new TextRun({
            text: "  |  ",
            size: 19,
            font: font,
            color: cleanColor(textLight),
          }),
        );
      }
    });

    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 30 },
      children: children,
    });
  }

  private createLinksLine(
    contact: GeneratedResume["contactInfo"],
    font: string,
  ): Paragraph {
    const children: (TextRun | ExternalHyperlink)[] = [];
    const items: { text: string; url: string }[] = [];
    const { primary, textLight } = DesignTokens.colors;
    const cleanColor = (hex: string) => hex.replace("#", "");

    // Helper to strip protocol for display
    const formatUrl = (url: string) =>
      url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

    const isValid = (val: string | undefined) =>
      val &&
      val.trim().toLowerCase() !== "n/a" &&
      val.trim().toLowerCase() !== "none";

    if (contact.linkedin && isValid(contact.linkedin)) {
      const url = contact.linkedin.startsWith("http")
        ? contact.linkedin
        : `https://${contact.linkedin}`;
      items.push({ text: formatUrl(contact.linkedin), url });
    }

    if (contact.github && isValid(contact.github)) {
      const url = contact.github.startsWith("http")
        ? contact.github
        : `https://${contact.github}`;
      items.push({ text: formatUrl(contact.github), url });
    }

    if (contact.portfolio && isValid(contact.portfolio)) {
      const url = contact.portfolio.startsWith("http")
        ? contact.portfolio
        : `https://${contact.portfolio}`;
      items.push({ text: formatUrl(contact.portfolio), url });
    }

    if (items.length === 0) return new Paragraph({});

    items.forEach((item, index) => {
      children.push(
        new ExternalHyperlink({
          children: [
            new TextRun({
              text: item.text,
              size: 19,
              font: font,
              color: cleanColor(primary),
              underline: {},
            }),
          ],
          link: item.url,
        }),
      );

      if (index < items.length - 1) {
        children.push(
          new TextRun({
            text: "  |  ",
            size: 19,
            font: font,
            color: cleanColor(textLight),
          }),
        );
      }
    });

    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 30 },
      children: children,
    });
  }

  private createSectionHeader(title: string, font: string): Paragraph {
    const { text, primary } = DesignTokens.colors;
    const cleanColor = (hex: string) => hex.replace("#", "");

    return new Paragraph({
      spacing: { before: 120, after: 60 },
      border: {
        bottom: {
          color: cleanColor(primary),
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 22, // 11pt
          font: font,
          color: cleanColor(text),
          allCaps: true,
          characterSpacing: 10, // Slight letter spacing
        }),
      ],
    });
  }

  private createSummarySection(summary: string, font: string): Paragraph[] {
    const { text } = DesignTokens.colors;
    const cleanColor = (hex: string) => hex.replace("#", "");

    return [
      this.createSectionHeader("PROFESSIONAL SUMMARY", font),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: summary,
            size: 20, // 10pt
            font: font,
            color: cleanColor(text),
          }),
        ],
      }),
    ];
  }

  private createExperienceSection(
    experiences: GeneratedResume["experiences"],
    rightTabStop: number,
    font: string,
  ): Paragraph[] {
    const paragraphs: Paragraph[] = [
      this.createSectionHeader("WORK EXPERIENCE", font),
    ];
    const { text, primary, secondary, textLight } = DesignTokens.colors;
    const cleanColor = (hex: string) => hex.replace("#", "");

    experiences.forEach((exp, index) => {
      // Role | Company | Location  (Date right-aligned)
      paragraphs.push(
        new Paragraph({
          spacing: { before: index > 0 ? 120 : 0, after: 40 },
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: rightTabStop,
            },
          ],
          children: [
            new TextRun({
              text: exp.role,
              bold: true,
              size: 20, // 10pt
              font: font,
              color: cleanColor(text),
            }),
            new TextRun({
              text: "  |  ",
              size: 20,
              font: font,
              color: cleanColor(secondary),
            }),
            new TextRun({
              text: exp.company,
              size: 20,
              bold: true,
              font: font,
              color: cleanColor(primary),
            }),
            ...(exp.location
              ? [
                  new TextRun({
                    text: `  |  ${exp.location}`,
                    size: 20,
                    font: font,
                    color: cleanColor(textLight),
                  }),
                ]
              : []),
            new TextRun({
              text: "\t" + exp.dateRange,
              size: 19, // 9.5pt
              font: font,
              color: cleanColor(textLight),
              bold: true,
            }),
          ],
        }),
      );

      // Bullet points
      exp.bullets.forEach((bullet) => {
        paragraphs.push(
          new Paragraph({
            spacing: { after: 40 },
            indent: { left: convertInchesToTwip(0.15) },
            children: [
              new TextRun({
                text: `•  ${bullet}`,
                size: 20, // 10pt
                font: font,
                color: cleanColor(text),
              }),
            ],
          }),
        );
      });
    });

    return paragraphs;
  }

  private createEducationSection(
    education: GeneratedResume["education"],
    rightTabStop: number,
    font: string,
  ): Paragraph[] {
    const paragraphs: Paragraph[] = [
      this.createSectionHeader("EDUCATION", font),
    ];
    const { text, textLight, secondary } = DesignTokens.colors;
    const cleanColor = (hex: string) => hex.replace("#", "");

    education.forEach((edu) => {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 40 },
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: rightTabStop,
            },
          ],
          children: [
            new TextRun({
              text: `${edu.degree} in ${edu.field}`,
              bold: true,
              size: 20, // 10pt
              font: font,
              color: cleanColor(text),
            }),
            new TextRun({
              text: "  |  ",
              size: 20,
              font: font,
              color: cleanColor(secondary),
            }),
            new TextRun({
              text: edu.institution,
              size: 20,
              font: font,
              color: cleanColor(text),
            }),
            new TextRun({
              text: "\t" + (edu.dateRange || ""),
              size: 19,
              font: font,
              color: cleanColor(textLight),
            }),
          ],
        }),
      );

      if (edu.gpa) {
        paragraphs.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: `GPA: ${edu.gpa}`,
                size: 18, // 9pt
                font: font,
                color: cleanColor(textLight),
              }),
            ],
          }),
        );
      }
    });

    return paragraphs;
  }

  private createSkillsSection(skills: string[], font: string): Paragraph[] {
    const { text } = DesignTokens.colors;
    const cleanColor = (hex: string) => hex.replace("#", "");

    return [
      this.createSectionHeader("SKILLS", font),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: skills.join("  •  "),
            size: 20, // 10pt
            font: font,
            color: cleanColor(text),
          }),
        ],
      }),
    ];
  }

  private createProjectsSection(
    projects: NonNullable<GeneratedResume["projects"]>,
    font: string,
  ): Paragraph[] {
    const paragraphs: Paragraph[] = [
      this.createSectionHeader("PROJECTS", font),
    ];
    const { text, primary, secondary, textLight } = DesignTokens.colors;
    const cleanColor = (hex: string) => hex.replace("#", "");

    projects.forEach((proj) => {
      const headerParts: any[] = [
        new TextRun({
          text: proj.name,
          bold: true,
          size: 20, // 10pt
          font: font,
          color: cleanColor(text),
        }),
      ];

      // Helper to strip protocol for display
      const formatUrl = (url: string) =>
        url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

      if (proj.link && proj.link.trim().toLowerCase() !== "n/a") {
        const url = proj.link.startsWith("http")
          ? proj.link
          : `https://${proj.link}`;

        headerParts.push(
          new TextRun({
            text: "  |  ",
            size: 20,
            font: font,
            color: cleanColor(secondary),
          }),
        );

        headerParts.push(
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: formatUrl(proj.link),
                size: 20,
                font: font,
                color: cleanColor(primary),
                underline: {},
              }),
            ],
            link: url,
          }),
        );
      }

      paragraphs.push(
        new Paragraph({
          spacing: { after: 40 },
          children: headerParts,
        }),
      );

      if (proj.technologies) {
        paragraphs.push(
          new Paragraph({
            spacing: { after: 30 },
            children: [
              new TextRun({
                text: proj.technologies,
                italics: true,
                size: 18, // 9pt
                font: font,
                color: cleanColor(textLight),
              }),
            ],
          }),
        );
      }

      if (proj.description) {
        paragraphs.push(
          new Paragraph({
            spacing: { after: 30 },
            children: [
              new TextRun({
                text: proj.description,
                size: 20, // 10pt
                font: font,
                color: cleanColor(text),
              }),
            ],
          }),
        );
      }

      // Bullet points for project
      if (proj.bullets && proj.bullets.length > 0) {
        proj.bullets.forEach((bullet) => {
          paragraphs.push(
            new Paragraph({
              spacing: { after: 30 },
              indent: { left: convertInchesToTwip(0.15) },
              children: [
                new TextRun({
                  text: `•  ${bullet}`,
                  size: 20, // 10pt
                  font: font,
                  color: cleanColor(text),
                }),
              ],
            }),
          );
        });
      }
    });

    return paragraphs;
  }

  private createCertificationsSection(
    certifications: NonNullable<GeneratedResume["certifications"]>,
    rightTabStop: number,
    font: string,
  ): Paragraph[] {
    const paragraphs: Paragraph[] = [
      this.createSectionHeader("CERTIFICATIONS", font),
    ];
    const { text, textLight } = DesignTokens.colors;
    const cleanColor = (hex: string) => hex.replace("#", "");

    certifications.forEach((cert) => {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 40 },
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: rightTabStop,
            },
          ],
          children: [
            new TextRun({
              text: cert.name,
              bold: true,
              size: 20, // 10pt
              font: font,
              color: cleanColor(text),
            }),
            new TextRun({
              text: `  |  ${cert.issuer}`,
              size: 20, // 10pt
              font: font,
              color: cleanColor(textLight),
            }),
            new TextRun({
              text: "\t" + (cert.date || ""),
              size: 20, // 10pt
              font: font,
              color: cleanColor(textLight),
            }),
          ],
        }),
      );
    });

    return paragraphs;
  }

  private estimateContentLines(resume: GeneratedResume): number {
    let lineCount = 0;

    // Name + contact (3 lines)
    lineCount += 3;

    // Summary (estimate 3 lines)
    if (resume.summary) lineCount += 3;

    // Experience (1 header + (2 + bullets) per exp)
    if (resume.experiences?.length) {
      lineCount += 1;
      resume.experiences.forEach((exp) => {
        lineCount += 2 + (exp.bullets?.length || 0);
      });
    }

    // Projects (1 header + 2 per project)
    if (resume.projects?.length) {
      lineCount += 1 + resume.projects.length * 2;
    }

    // Education (1 header + 2 per edu)
    if (resume.education?.length) {
      lineCount += 1 + resume.education.length * 2;
    }

    // Certifications (1 header + 1 per cert)
    if (resume.certifications?.length) {
      lineCount += 1 + resume.certifications.length;
    }

    // Skills (1 header + 1 line)
    if (resume.skills?.length) lineCount += 2;

    return Math.max(lineCount, 1);
  }
}

export const docxService = new DocxService();
