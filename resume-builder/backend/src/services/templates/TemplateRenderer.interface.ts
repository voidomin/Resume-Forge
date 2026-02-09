import PDFDocument from "pdfkit";
import { GeneratedResume } from "../gemini.service";

export interface TemplateRenderer {
  render(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    fontScale?: number,
    spacingScale?: number,
  ): void;
}
