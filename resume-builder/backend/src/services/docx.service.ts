import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
  TabStopPosition,
  TabStopType,
} from "docx";
import { GeneratedResume } from "./gemini.service";

export class DocxService {
  /**
   * Generate a one-page ATS-friendly DOCX resume
   * Narrow margins (0.5 inch)
   */
  async generateResumeDocx(resume: GeneratedResume): Promise<Buffer> {
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertInchesToTwip(0.5),
                right: convertInchesToTwip(0.5),
                bottom: convertInchesToTwip(0.5),
                left: convertInchesToTwip(0.5),
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

            // Contact Info Line
            this.createContactLine(resume.contactInfo),

            // Links Line (if any)
            ...this.createLinksLine(resume.contactInfo),

            // Spacing
            new Paragraph({ spacing: { after: 200 } }),

            // Professional Summary
            ...(resume.summary
              ? this.createSummarySection(resume.summary)
              : []),

            // Work Experience
            ...(resume.experiences.length > 0
              ? this.createExperienceSection(resume.experiences)
              : []),

            // Projects
            ...(resume.projects && resume.projects.length > 0
              ? this.createProjectsSection(resume.projects)
              : []),

            // Education
            ...(resume.education.length > 0
              ? this.createEducationSection(resume.education)
              : []),

            // Certifications
            ...(resume.certifications && resume.certifications.length > 0
              ? this.createCertificationsSection(resume.certifications)
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

  private createContactLine(
    contact: GeneratedResume["contactInfo"],
  ): Paragraph {
    const parts: string[] = [];
    if (contact.email) parts.push(contact.email);
    if (contact.phone) parts.push(contact.phone);
    if (contact.location) parts.push(contact.location);

    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 30 },
      children: [
        new TextRun({
          text: parts.join("  |  "),
          size: 16, // 8pt
          font: "Arial",
        }),
      ],
    });
  }

  private createLinksLine(
    contact: GeneratedResume["contactInfo"],
  ): Paragraph[] {
    const parts: string[] = [];
    if (contact.linkedin) parts.push(contact.linkedin);
    if (contact.github) parts.push(contact.github);

    if (parts.length === 0) return [];

    return [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 30 },
        children: [
          new TextRun({
            text: parts.join("  |  "),
            size: 16, // 8pt
            font: "Arial",
          }),
        ],
      }),
    ];
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
              position: TabStopPosition.MAX,
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
                text: `•  ${bullet}`,
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
  ): Paragraph[] {
    const paragraphs: Paragraph[] = [this.createSectionHeader("EDUCATION")];

    education.forEach((edu) => {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 40 },
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: TabStopPosition.MAX,
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

      if (proj.link) {
        headerParts.push(
          new TextRun({
            text: `  |  ${proj.link}`,
            size: 18, // 9pt
            font: "Arial",
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

      paragraphs.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: proj.description,
              size: 18, // 9pt
              font: "Arial",
            }),
          ],
        }),
      );
    });

    return paragraphs;
  }

  private createCertificationsSection(
    certifications: NonNullable<GeneratedResume["certifications"]>,
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
              position: TabStopPosition.MAX,
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
            ...(cert.link
              ? [
                  new TextRun({
                    text: `  |  ${cert.link}`,
                    size: 18, // 9pt
                    font: "Arial",
                  }),
                ]
              : []),
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
}

export const docxService = new DocxService();
