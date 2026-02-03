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
              spacing: { after: 80 },
              children: [
                new TextRun({
                  text: resume.contactInfo.name.toUpperCase(),
                  bold: true,
                  size: 36, // 18pt
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

            // Education
            ...(resume.education.length > 0
              ? this.createEducationSection(resume.education)
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
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: parts.join("  |  "),
          size: 18, // 9pt
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
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: parts.join("  |  "),
            size: 18,
            font: "Arial",
          }),
        ],
      }),
    ];
  }

  private createSectionHeader(title: string): Paragraph {
    return new Paragraph({
      spacing: { before: 160, after: 80 },
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
          size: 22, // 11pt
          font: "Arial",
        }),
      ],
    });
  }

  private createSummarySection(summary: string): Paragraph[] {
    return [
      this.createSectionHeader("PROFESSIONAL SUMMARY"),
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: summary,
            size: 20, // 10pt
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
              size: 20,
              font: "Arial",
            }),
            new TextRun({
              text: `  |  ${exp.company}`,
              size: 20,
              font: "Arial",
            }),
            ...(exp.location
              ? [
                  new TextRun({
                    text: `  |  ${exp.location}`,
                    size: 20,
                    font: "Arial",
                  }),
                ]
              : []),
            new TextRun({
              text: "\t" + exp.dateRange,
              size: 20,
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
                size: 20,
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
              size: 20,
              font: "Arial",
            }),
            new TextRun({
              text: `  |  ${edu.institution}`,
              size: 20,
              font: "Arial",
            }),
            new TextRun({
              text: "\t" + (edu.dateRange || ""),
              size: 20,
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
                size: 18,
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
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: skills.join("  •  "),
            size: 20,
            font: "Arial",
          }),
        ],
      }),
    ];
  }
}

export const docxService = new DocxService();
