const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';

export class PdfParserService {
  /**
   * Parse a PDF buffer and return the extracted text and formatting details.
   */
  static async parsePdf(buffer: Buffer): Promise<{ text: string; hasTables: boolean; hasImages: boolean }> {
    try {
      const data = await pdfParse(buffer);
      // pdf-parse gives us text. We don't get deep formatting details like tables/images easily, 
      // but we can mock or rely on basic heuristics if needed. For now, we return text.
      return {
        text: data.text,
        hasTables: false, // Would require complex parsing with pdf.js or other tools
        hasImages: false,
      };
    } catch (error: any) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF document: ' + (error.message || String(error)));
    }
  }

  /**
   * Parse a DOCX buffer and return the extracted text.
   */
  static async parseDocx(buffer: Buffer): Promise<{ text: string }> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return {
        text: result.value
      };
    } catch (error) {
      console.error('Error parsing DOCX:', error);
      throw new Error('Failed to parse DOCX document.');
    }
  }
}
