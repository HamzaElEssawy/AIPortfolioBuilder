import fs from "fs";
import mammoth from "mammoth";

export interface TextExtractionResult {
  text: string;
  metadata?: Record<string, any>;
}

export class TextExtractor {
  
  /**
   * Extract text from different file types
   */
  async extractText(filePath: string, contentType: string): Promise<TextExtractionResult> {
    try {
      switch (contentType) {
        case 'application/pdf':
          return await this.extractFromPDF(filePath);
        
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.extractFromDOCX(filePath);
        
        case 'text/plain':
          return await this.extractFromTXT(filePath);
        
        default:
          throw new Error(`Unsupported content type: ${contentType}`);
      }
    } catch (error) {
      console.error(`Text extraction failed for ${filePath}:`, error);
      throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from PDF files
   */
  private async extractFromPDF(filePath: string): Promise<TextExtractionResult> {
    try {
      // For now, return placeholder - in production would use pdf-parse
      const fileStats = fs.statSync(filePath);
      console.log(`PDF extraction not fully implemented for ${filePath}`);
      
      return {
        text: `PDF content extraction placeholder for ${filePath}`,
        metadata: {
          fileSize: fileStats.size,
          extractedAt: new Date().toISOString(),
          contentType: 'application/pdf'
        }
      };
    } catch (error) {
      throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from DOCX files
   */
  private async extractFromDOCX(filePath: string): Promise<TextExtractionResult> {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      
      return {
        text: result.value,
        metadata: {
          extractedAt: new Date().toISOString(),
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          messages: result.messages
        }
      };
    } catch (error) {
      throw new Error(`DOCX extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from plain text files
   */
  private async extractFromTXT(filePath: string): Promise<TextExtractionResult> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      
      return {
        text: content,
        metadata: {
          extractedAt: new Date().toISOString(),
          contentType: 'text/plain',
          characterCount: content.length
        }
      };
    } catch (error) {
      throw new Error(`TXT extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Determine content type from file extension
   */
  getContentType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    
    switch (ext) {
      case 'pdf':
        return 'application/pdf';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'txt':
        return 'text/plain';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Intelligent text chunking for better embeddings
   */
  async chunkText(
    text: string, 
    options: {
      maxChunkSize?: number;
      overlap?: number;
      category?: string;
      preserveParagraphs?: boolean;
    } = {}
  ): Promise<Array<{
    text: string;
    index: number;
    metadata: Record<string, any>;
  }>> {
    const {
      maxChunkSize = 1000,
      overlap = 200,
      category = 'general',
      preserveParagraphs = true
    } = options;

    try {
      const chunks = [];
      
      if (preserveParagraphs) {
        // Split by paragraphs first
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        
        let currentChunk = '';
        let chunkIndex = 0;
        
        for (const paragraph of paragraphs) {
          if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length > 0) {
            // Save current chunk
            chunks.push({
              text: currentChunk.trim(),
              index: chunkIndex,
              metadata: {
                category,
                chunkType: 'paragraph-based',
                wordCount: currentChunk.split(/\s+/).length,
                characterCount: currentChunk.length
              }
            });
            
            chunkIndex++;
            currentChunk = paragraph;
          } else {
            currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
          }
        }
        
        // Add the last chunk
        if (currentChunk.trim().length > 0) {
          chunks.push({
            text: currentChunk.trim(),
            index: chunkIndex,
            metadata: {
              category,
              chunkType: 'paragraph-based',
              wordCount: currentChunk.split(/\s+/).length,
              characterCount: currentChunk.length
            }
          });
        }
      } else {
        // Simple sliding window chunking
        let startIndex = 0;
        let chunkIndex = 0;
        
        while (startIndex < text.length) {
          const endIndex = Math.min(startIndex + maxChunkSize, text.length);
          const chunkText = text.slice(startIndex, endIndex);
          
          chunks.push({
            text: chunkText,
            index: chunkIndex,
            metadata: {
              category,
              chunkType: 'sliding-window',
              startIndex,
              endIndex,
              wordCount: chunkText.split(/\s+/).length,
              characterCount: chunkText.length
            }
          });
          
          chunkIndex++;
          startIndex += maxChunkSize - overlap;
        }
      }
      
      return chunks;
    } catch (error) {
      console.error('Text chunking failed:', error);
      throw new Error(`Failed to chunk text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const textExtractor = new TextExtractor();