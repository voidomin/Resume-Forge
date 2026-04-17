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
import {
  UnifiedDesignSystem,
  getCleanColor,
} from "../../../shared/design-system";
import { UnitConverter } from "../../../shared/unit-converters";

export class DocxService {
  /**
   * Generate a one-page ATS-friendly DOCX resume
   * Using unified design system for consistency
   */
  async generateResumeDocx(resume: GeneratedResume): Promise<Buffer> {
    const ds = UnifiedDesignSystem;
    const bodyFont = ds.fonts.primary.docx;
    const headerFont = ds.fonts.primary.docx;

    const { pageWidthInches, pageHeightInches, pageMarginInches, rightTabStop } =
      this.getPageSetup(ds);

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
            this.createDocxHeader(resume.contactInfo.name, ds, headerFont),
            this.createContactLine(resume.contactInfo, bodyFont),
            this.createLinksLine(resume.contactInfo, bodyFont),

            new Paragraph({
              spacing: { after: UnitConverter.ptToTwip(ds.spacing.section) },
            }),

            ...this.renderCoreSections(resume, rightTabStop, bodyFont),
            ...this.renderOptionalSections(resume, rightTabStop, bodyFont),
            ...this.renderSkillsSection(resume, bodyFont),
          ],
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }

  private getPageSetup(ds: any) {
    const pageWidthInches = ds.page.widthInches;
    const pageHeightInches = ds.page.heightInches;
    const pageMarginInches = UnitConverter.ptToInches(ds.margins.page);
    const rightTabStop = convertInchesToTwip(pageWidthInches - pageMarginInches);
    return {
      pageWidthInches,
      pageHeightInches,
      pageMarginInches,
      rightTabStop,
    };
  }

  private createDocxHeader(name: string, ds: any, font: string): Paragraph {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: UnitConverter.ptToTwip(ds.spacing.tight) },
      children: [
        new TextRun({
          text: name.toUpperCase(),
          bold: true,
          size: UnitConverter.ptToHalfPoint(ds.fontSize.h1),
          font: font,
          color: getCleanColor(ds.colors.primary),
        }),
      ],
    });
  }

  private renderCoreSections(
    resume: GeneratedResume,
    rightTabStop: number,
    font: string,
  ): Paragraph[] {
    const parts: Paragraph[] = [];

    if (resume.summary) {
      parts.push(...this.createSummarySection(resume.summary, font));
    }

    if (resume.experiences.length > 0) {
      parts.push(
        ...this.createExperienceSection(
          resume.experiences,
          rightTabStop,
          font,
        ),
      );
    }

    if (resume.projects && resume.projects.length > 0) {
      parts.push(...this.createProjectsSection(resume.projects, font));
    }

    return parts;
  }

  private renderOptionalSections(
    resume: GeneratedResume,
    rightTabStop: number,
    font: string,
  ): Paragraph[] {
    const parts: Paragraph[] = [];

    if (resume.education.length > 0) {
      parts.push(
        ...this.createEducationSection(resume.education, rightTabStop, font),
      );
    }

    if (resume.certifications && resume.certifications.length > 0) {
      parts.push(
        ...this.createCertificationsSection(
          resume.certifications,
          rightTabStop,
          font,
        ),
      );
    }

    if (resume.coursework && resume.coursework.length > 0) {
      parts.push(...this.createCourseworkSection(resume.coursework, font));
    }

    if (resume.leadership && resume.leadership.length > 0) {
      parts.push(
        ...this.createLeadershipSection(resume.leadership, rightTabStop, font),
      );
    }

    if (resume.awards && resume.awards.length > 0) {
      parts.push(
        ...this.createAwardsSection(resume.awards, rightTabStop, font),
      );
    }

    return parts;
  }

  private renderSkillsSection(
    resume: GeneratedResume,
    font: string,
  ): Paragraph[] {
    if (
      resume.skillsCategories &&
      Object.keys(resume.skillsCategories).length > 0
    ) {
      return this.createSkillsCategoriesSection(resume.skillsCategories, font);
    }

    if (resume.skills && resume.skills.length > 0) {
      return this.createSkillsSection(resume.skills, font);
    }

    return [];
  }

  private createContactLine(
    contact: GeneratedResume["contactInfo"],
    font: string,
  ): Paragraph {
    const ds = UnifiedDesignSystem;
    const children: (TextRun | ExternalHyperlink)[] = [];
    const parts: any[] = [];

    if (contact.email) {
      parts.push(
        new ExternalHyperlink({
          children: [
            new TextRun({
              text: contact.email,
              size: UnitConverter.ptToHalfPoint(ds.fontSize.contact),
              font: font,
              color: getCleanColor(ds.colors.text),
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
          size: UnitConverter.ptToHalfPoint(ds.fontSize.contact),
          font: font,
          color: getCleanColor(ds.colors.text),
        }),
      );
    }

    if (contact.location) {
      parts.push(
        new TextRun({
          text: contact.location,
          size: UnitConverter.ptToHalfPoint(ds.fontSize.contact),
          font: font,
          color: getCleanColor(ds.colors.text),
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
            size: UnitConverter.ptToHalfPoint(ds.fontSize.contact),
            font: font,
            color: getCleanColor(ds.colors.textLight),
          }),
        );
      }
    });

    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: UnitConverter.ptToTwip(ds.spacing.tight) },
      children: children,
    });
  }

  private createLinksLine(
    contact: GeneratedResume["contactInfo"],
    font: string,
  ): Paragraph {
    const ds = UnifiedDesignSystem;
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
              size: UnitConverter.ptToHalfPoint(ds.fontSize.contact),
              font: font,
              color: getCleanColor(ds.colors.primary),
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
            size: UnitConverter.ptToHalfPoint(ds.fontSize.contact),
            font: font,
            color: getCleanColor(ds.colors.textLight),
          }),
        );
      }
    });

    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: UnitConverter.ptToTwip(ds.spacing.tight) },
      children: children,
    });
  }

  private createSectionHeader(title: string, font: string): Paragraph {
    const ds = UnifiedDesignSystem;

    return new Paragraph({
      spacing: {
        before: UnitConverter.ptToTwip(ds.spacing.section),
        after: UnitConverter.ptToTwip(ds.spacing.element),
      },
      border: {
        bottom: {
          color: getCleanColor(ds.colors.primary),
          space: 1,
          style: BorderStyle.SINGLE,
          size: ds.borders.sectionUnderline.width * 3, // Convert pt to eighth-points (1pt = 8 eighth-points)
        },
      },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: UnitConverter.ptToHalfPoint(ds.fontSize.h2),
          font: font,
          color: getCleanColor(ds.colors.text),
          allCaps: true,
          characterSpacing: 10, // Slight letter spacing
        }),
      ],
    });
  }

  private createSummarySection(summary: string, font: string): Paragraph[] {
    const ds = UnifiedDesignSystem;

    return [
      this.createSectionHeader("PROFESSIONAL SUMMARY", font),
      new Paragraph({
        spacing: { after: UnitConverter.ptToTwip(ds.spacing.element) },
        children: [
          new TextRun({
            text: summary,
            size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
            font: font,
            color: getCleanColor(ds.colors.text),
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
    const ds = UnifiedDesignSystem;
    const paragraphs: Paragraph[] = [
      this.createSectionHeader("WORK EXPERIENCE", font),
    ];

    experiences.forEach((exp, index) => {
      // Role | Company | Location  (Date right-aligned)
      paragraphs.push(
        new Paragraph({
          spacing: {
            before: index > 0 ? UnitConverter.ptToTwip(ds.spacing.section) : 0,
            after: UnitConverter.ptToTwip(ds.spacing.minimal),
          },
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
              size: UnitConverter.ptToHalfPoint(ds.fontSize.h3),
              font: font,
              color: getCleanColor(ds.colors.text),
            }),
            new TextRun({
              text: "  |  ",
              size: UnitConverter.ptToHalfPoint(ds.fontSize.h3),
              font: font,
              color: getCleanColor(ds.colors.secondary),
            }),
            new TextRun({
              text: exp.company,
              size: UnitConverter.ptToHalfPoint(ds.fontSize.h3),
              bold: true,
              font: font,
              color: getCleanColor(ds.colors.primary),
            }),
            ...(exp.location
              ? [
                  new TextRun({
                    text: `  |  ${exp.location}`,
                    size: UnitConverter.ptToHalfPoint(ds.fontSize.small),
                    font: font,
                    color: getCleanColor(ds.colors.textLight),
                  }),
                ]
              : []),
            new TextRun({
              text: "\t" + exp.dateRange,
              size: UnitConverter.ptToHalfPoint(ds.fontSize.small),
              font: font,
              color: getCleanColor(ds.colors.textLight),
              bold: true,
            }),
          ],
        }),
      );

      // Bullet points
      exp.bullets.forEach((bullet) => {
        paragraphs.push(
          new Paragraph({
            spacing: { after: UnitConverter.ptToTwip(ds.spacing.minimal) },
            indent: { left: UnitConverter.ptToTwip(ds.spacing.bulletIndent) },
            children: [
              new TextRun({
                text: `•  ${bullet}`,
                size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
                font: font,
                color: getCleanColor(ds.colors.text),
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
    const ds = UnifiedDesignSystem;
    const paragraphs: Paragraph[] = [
      this.createSectionHeader("EDUCATION", font),
    ];

    education.forEach((edu) => {
      paragraphs.push(
        new Paragraph({
          spacing: { after: UnitConverter.ptToTwip(ds.spacing.minimal) },
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
              size: UnitConverter.ptToHalfPoint(ds.fontSize.h3),
              font: font,
              color: getCleanColor(ds.colors.text),
            }),
            new TextRun({
              text: "  |  ",
              size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
              font: font,
              color: getCleanColor(ds.colors.secondary),
            }),
            new TextRun({
              text: edu.institution,
              size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
              font: font,
              color: getCleanColor(ds.colors.primary),
            }),
            new TextRun({
              text: "\t" + (edu.dateRange || ""),
              size: UnitConverter.ptToHalfPoint(ds.fontSize.small),
              font: font,
              color: getCleanColor(ds.colors.textLight),
            }),
          ],
        }),
      );

      if (edu.gpa) {
        paragraphs.push(
          new Paragraph({
            spacing: { after: UnitConverter.ptToTwip(ds.spacing.minimal) },
            children: [
              new TextRun({
                text: `GPA: ${edu.gpa}`,
                size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
                font: font,
                color: getCleanColor(ds.colors.textLight),
              }),
            ],
          }),
        );
      }
    });

    return paragraphs;
  }

  private createSkillsCategoriesSection(
    categories: Record<string, string[] | string>,
    font: string,
  ): Paragraph[] {
    const ds = UnifiedDesignSystem;
    const paragraphs: Paragraph[] = [this.createSectionHeader("SKILLS", font)];

    Object.entries(categories).forEach(([category, skills], index) => {
      const isLast = index === Object.keys(categories).length - 1;
      paragraphs.push(
        new Paragraph({
          spacing: {
            after: UnitConverter.ptToTwip(
              isLast ? ds.spacing.element : ds.spacing.minimal,
            ),
          },
          children: [
            new TextRun({
              text: `${category}: `,
              bold: true,
              size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
              font: font,
              color: getCleanColor(ds.colors.text),
            }),
            new TextRun({
              text: Array.isArray(skills) ? skills.join(", ") : skills,
              size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
              font: font,
              color: getCleanColor(ds.colors.text),
            }),
          ],
        }),
      );
    });

    return paragraphs;
  }

  private createSkillsSection(skills: string[], font: string): Paragraph[] {
    const ds = UnifiedDesignSystem;

    return [
      this.createSectionHeader("SKILLS", font),
      new Paragraph({
        spacing: { after: UnitConverter.ptToTwip(ds.spacing.element) },
        children: [
          new TextRun({
            text: skills.join("  •  "),
            size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
            font: font,
            color: getCleanColor(ds.colors.text),
          }),
        ],
      }),
    ];
  }

  private createProjectsSection(
    projects: NonNullable<GeneratedResume["projects"]>,
    font: string,
  ): Paragraph[] {
    const ds = UnifiedDesignSystem;
    const paragraphs: Paragraph[] = [
      this.createSectionHeader("PROJECTS", font),
    ];

    projects.forEach((proj) => {
      const headerParts: any[] = [
        new TextRun({
          text: proj.name,
          bold: true,
          size: UnitConverter.ptToHalfPoint(ds.fontSize.h3),
          font: font,
          color: getCleanColor(ds.colors.text),
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
            size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
            font: font,
            color: getCleanColor(ds.colors.secondary),
          }),
        );

        headerParts.push(
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: formatUrl(proj.link),
                size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
                font: font,
                color: getCleanColor(ds.colors.primary),
                underline: {},
              }),
            ],
            link: url,
          }),
        );
      }

      paragraphs.push(
        new Paragraph({
          spacing: { after: UnitConverter.ptToTwip(ds.spacing.minimal) },
          children: headerParts,
        }),
      );

      if (proj.technologies) {
        paragraphs.push(
          new Paragraph({
            spacing: { after: UnitConverter.ptToTwip(ds.spacing.minimal) },
            children: [
              new TextRun({
                text: proj.technologies,
                italics: true,
                size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
                font: font,
                color: getCleanColor(ds.colors.textLight),
              }),
            ],
          }),
        );
      }

      if (proj.description) {
        paragraphs.push(
          new Paragraph({
            spacing: { after: UnitConverter.ptToTwip(ds.spacing.minimal) },
            children: [
              new TextRun({
                text: proj.description,
                size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
                font: font,
                color: getCleanColor(ds.colors.text),
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
              spacing: { after: UnitConverter.ptToTwip(ds.spacing.minimal) },
              indent: { left: UnitConverter.ptToTwip(ds.spacing.bulletIndent) },
              children: [
                new TextRun({
                  text: `•  ${bullet}`,
                  size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
                  font: font,
                  color: getCleanColor(ds.colors.text),
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
    const ds = UnifiedDesignSystem;
    const paragraphs: Paragraph[] = [
      this.createSectionHeader("CERTIFICATIONS", font),
    ];

    certifications.forEach((cert) => {
      paragraphs.push(
        new Paragraph({
          spacing: { after: UnitConverter.ptToTwip(ds.spacing.minimal) },
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
              size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
              font: font,
              color: getCleanColor(ds.colors.text),
            }),
            new TextRun({
              text: `  |  ${cert.issuer}`,
              size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
              font: font,
              color: getCleanColor(ds.colors.textLight),
            }),
            new TextRun({
              text: "\t" + (cert.date || ""),
              size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
              font: font,
              color: getCleanColor(ds.colors.textLight),
            }),
          ],
        }),
      );
    });

    return paragraphs;
  }

  private createCourseworkSection(
    coursework: NonNullable<GeneratedResume["coursework"]>,
    font: string,
  ): Paragraph[] {
    const ds = UnifiedDesignSystem;
    const paragraphs: Paragraph[] = [
      this.createSectionHeader("RELEVANT COURSEWORK", font),
    ];

    coursework.forEach((course) => {
      const suffix = course.institution ? ` (${course.institution})` : "";
      paragraphs.push(
        new Paragraph({
          spacing: { after: UnitConverter.ptToTwip(ds.spacing.minimal) },
          children: [
            new TextRun({
              text: course.courseName,
              bold: true,
              size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
              font: font,
              color: getCleanColor(ds.colors.text),
            }),
            new TextRun({
              text: `  |  ${course.topic}${suffix}`,
              size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
              font: font,
              color: getCleanColor(ds.colors.textLight),
            }),
          ],
        }),
      );
    });

    return paragraphs;
  }

  private createLeadershipSection(
    leadership: NonNullable<GeneratedResume["leadership"]>,
    rightTabStop: number,
    font: string,
  ): Paragraph[] {
    const ds = UnifiedDesignSystem;
    const paragraphs: Paragraph[] = [
      this.createSectionHeader("LEADERSHIP & EXTRACURRICULAR", font),
    ];

    leadership.forEach((role) => {
      paragraphs.push(
        new Paragraph({
          spacing: { after: UnitConverter.ptToTwip(ds.spacing.minimal) },
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: rightTabStop,
            },
          ],
          children: [
            new TextRun({
              text: role.title,
              bold: true,
              size: UnitConverter.ptToHalfPoint(ds.fontSize.h3),
              font: font,
              color: getCleanColor(ds.colors.text),
            }),
            new TextRun({
              text: "  |  ",
              size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
              font: font,
              color: getCleanColor(ds.colors.secondary),
            }),
            new TextRun({
              text: role.organization,
              size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
              font: font,
              color: getCleanColor(ds.colors.primary),
            }),
            ...(role.location
              ? [
                  new TextRun({
                    text: `  |  ${role.location}`,
                    size: UnitConverter.ptToHalfPoint(ds.fontSize.small),
                    font: font,
                    color: getCleanColor(ds.colors.textLight),
                  }),
                ]
              : []),
            new TextRun({
              text: "\t" + (role.dateRange || ""),
              size: UnitConverter.ptToHalfPoint(ds.fontSize.small),
              font: font,
              color: getCleanColor(ds.colors.textLight),
            }),
          ],
        }),
      );

      if (role.description) {
        paragraphs.push(
          new Paragraph({
            spacing: { after: UnitConverter.ptToTwip(ds.spacing.minimal) },
            indent: { left: UnitConverter.ptToTwip(ds.spacing.bulletIndent) },
            children: [
              new TextRun({
                text: `•  ${role.description}`,
                size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
                font: font,
                color: getCleanColor(ds.colors.text),
              }),
            ],
          }),
        );
      }
    });

    return paragraphs;
  }

  private createAwardsSection(
    awards: NonNullable<GeneratedResume["awards"]>,
    rightTabStop: number,
    font: string,
  ): Paragraph[] {
    const ds = UnifiedDesignSystem;
    const paragraphs: Paragraph[] = [
      this.createSectionHeader("HONORS & AWARDS", font),
    ];

    awards.forEach((award) => {
      paragraphs.push(
        new Paragraph({
          spacing: { after: UnitConverter.ptToTwip(ds.spacing.minimal) },
          tabStops: [
            {
              type: TabStopType.RIGHT,
              position: rightTabStop,
            },
          ],
          children: [
            new TextRun({
              text: award.awardName,
              bold: true,
              size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
              font: font,
              color: getCleanColor(ds.colors.text),
            }),
            new TextRun({
              text: `  |  ${award.organization}`,
              size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
              font: font,
              color: getCleanColor(ds.colors.textLight),
            }),
            new TextRun({
              text: "\t" + (award.awardDate || ""),
              size: UnitConverter.ptToHalfPoint(ds.fontSize.small),
              font: font,
              color: getCleanColor(ds.colors.textLight),
            }),
          ],
        }),
      );

      if (award.description) {
        paragraphs.push(
          new Paragraph({
            spacing: { after: UnitConverter.ptToTwip(ds.spacing.minimal) },
            children: [
              new TextRun({
                text: award.description,
                italics: true,
                size: UnitConverter.ptToHalfPoint(ds.fontSize.body),
                font: font,
                color: getCleanColor(ds.colors.textLight),
              }),
            ],
          }),
        );
      }
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
