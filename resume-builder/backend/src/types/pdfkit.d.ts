declare namespace PDFKit {
  interface PDFDocument {
    [key: string]: any;
  }
}

declare module "pdfkit" {
  class PDFDocument {
    constructor(options?: any);
    [key: string]: any;
  }
  export default PDFDocument;
}
