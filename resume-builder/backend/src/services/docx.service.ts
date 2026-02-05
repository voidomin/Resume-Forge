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
// import htmlToDocx from "html-to-docx"; // Not used
import { GeneratedResume } from "./gemini.service";

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

    // Estimate content lines to determine if scaling needed
    const estimatedLines = this.estimateContentLines(resume);
    const linesPerPage = 50; // Approximate lines that fit per page

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
                  font: "Arial",
                }),
              ],
            }),

            // Contact Info Line (Email, Phone, Location)
            this.createContactLine(resume.contactInfo),

            // Links Line (LinkedIn, GitHub, Portfolio)
            this.createLinksLine(resume.contactInfo),

            // Spacing
            new Paragraph({ spacing: { after: 200 } }),

            // Professional Summary
            ...(resume.summary
              ? this.createSummarySection(resume.summary)
              : []),

            // Work Experience
            ...(resume.experiences.length > 0
              ? this.createExperienceSection(resume.experiences, rightTabStop)
              : []),

            // Projects
            ...(resume.projects && resume.projects.length > 0
              ? this.createProjectsSection(resume.projects)
              : []),

            // Education
            ...(resume.education.length > 0
              ? this.createEducationSection(resume.education, rightTabStop)
              : []),

            // Certifications
            ...(resume.certifications && resume.certifications.length > 0
              ? this.createCertificationsSection(
                  resume.certifications,
                  rightTabStop,
                )
              : []),

            // Skills
            ...(resume.skills.length > 0
              ? this.createSkillsSection(resume.skills)
              : []),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }

//   async generateDocxFromHtml(html: string): Promise<Buffer> {
//     const buffer = await htmlToDocx(html, null, {
//       orientation: "portrait",
//       margins: {
//         top: 720,
//         right: 720,
//         bottom: 720,
//         left: 720,
//       },
//     });
// 
//     return Buffer.from(buffer as ArrayBuffer);
//   }
// 
  private createContactLine(
    contact: GeneratedResume["contactInfo"],
  ): Paragraph {
    const children: (TextRun | ExternalHyperlink)[] = [];
    const parts: any[] = [];

    if (contact.email) {
      parts.push(
        new ExternalHyperlink({
          children: [
            new TextRun({
              text: contact.email,
              size: 16,
              font: "Arial",
              color: "0000FF", // Standard link color
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
          size: 16,
          font: "Arial",
        }),
      );
    }

    if (contact.location) {
      parts.push(
        new TextRun({
          text: contact.location,
          size: 16,
          font: "Arial",
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
            size: 16,
            font: "Arial",
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

  private createLinksLine(contact: GeneratedResume["contactInfo"]): Paragraph {
    const children: (TextRun | ExternalHyperlink)[] = [];
    const items: { text: string; url: string }[] = [];

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
              size: 16,
              font: "Arial",
              color: "0000FF",
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
            size: 16,
            font: "Arial",
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

  private createSectionHeader(title: string): Paragraph {
    return new Paragraph({
      spacing: { before: 120, after: 60 },
      border: {
        bottom: {
          color: "000000",
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 20, // 10pt
          font: "Arial",
        }),
      ],
    });
  }

  private createSummarySection(summary: string): Paragraph[] {
    return [
      this.createSectionHeader("PROFESSIONAL SUMMARY"),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: summary,
            size: 18, // 9pt
            font: "Arial",
          }),
        ],
      }),
    ];
  }

  private createExperienceSection(
    experiences: GeneratedResume["experiences"],
    rightTabStop: number,
  ): Paragraph[] {
    const paragraphs: Paragraph[] = [
      this.createSectionHeader("WORK EXPERIENCE"),
    ];

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
              size: 18, // 9pt
              font: "Arial",
            }),
            new TextRun({
              text: `  |  ${exp.company}`,
              size: 18, // 9pt
              font: "Arial",
            }),
            ...(exp.location
              ? [
                  new TextRun({
                    text: `  |  ${exp.location}`,
                    size: 18, // 9pt
                    font: "Arial",
                  }),
                ]
              : []),
            new TextRun({
              text: "\t" + exp.dateRange,
              size: 18, // 9pt
              font: "Arial",
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
                text: `  ${bullet}`,
                size: 18, // 9pt
                font: "Arial",
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
  ): Paragraph[] {
    const paragraphs: Paragraph[] = [this.createSectionHeader("EDUCATION")];

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
              size: 18, // 9pt
              font: "Arial",
            }),
            new TextRun({
              text: `  |  ${edu.institution}`,
              size: 18, // 9pt
              font: "Arial",
            }),
            new TextRun({
              text: "\t" + (edu.dateRange || ""),
              size: 18, // 9pt
              font: "Arial",
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
                size: 16, // 8pt
                font: "Arial",
              }),
            ],
          }),
        );
      }
    });

    return paragraphs;
  }

  private createSkillsSection(skills: string[]): Paragraph[] {
    return [
      this.createSectionHeader("SKILLS"),
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: skills.join("  •  "),
            size: 18, // 9pt
            font: "Arial",
          }),
        ],
      }),
    ];
  }

  private createProjectsSection(
    projects: NonNullable<GeneratedResume["projects"]>,
  ): Paragraph[] {
    const paragraphs: Paragraph[] = [this.createSectionHeader("PROJECTS")];

    projects.forEach((proj) => {
      const headerParts: any[] = [
        new TextRun({
          text: proj.name,
          bold: true,
          size: 18, // 9pt
          font: "Arial",
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
            size: 18,
            font: "Arial",
          }),
        );

        headerParts.push(
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: formatUrl(proj.link),
                size: 18,
                font: "Arial",
                color: "0000FF",
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
                size: 16, // 8pt
                font: "Arial",
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
                size: 18, // 9pt
                font: "Arial",
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
                  text: `  ${bullet}`,
                  size: 18, // 9pt
                  font: "Arial",
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
  ): Paragraph[] {
    const paragraphs: Paragraph[] = [
      this.createSectionHeader("CERTIFICATIONS"),
    ];

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
              size: 18, // 9pt
              font: "Arial",
            }),
            new TextRun({
              text: `  |  ${cert.issuer}`,
              size: 18, // 9pt
              font: "Arial",
            }),
            new TextRun({
              text: "\t" + (cert.date || ""),
              size: 18, // 9pt
              font: "Arial",
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







