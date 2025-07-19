import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db';
import { knowledgeBaseDocuments } from '../../shared/schema';
import { queueService } from '../queueService';
import { logger, withModule } from '../../../packages/shared-utils';

const moduleLogger = withModule('uploadRoutes');

// Configure multer for document uploads
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `doc-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const documentUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, and TXT files are allowed'));
    }
  }
});

/**
 * Helper function to determine content type from filename
 */
function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.pdf':
      return 'application/pdf';
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Upload documents and queue for processing
 */
export const uploadDocuments = [
  documentUpload.array('files', 10),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      const { category = 'general' } = req.body;

      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      moduleLogger.info(`Processing ${files.length} uploaded files`);

      const results = [];
      for (const file of files) {
        try {
          // Create database record
          const fileStats = fs.statSync(file.path);
          const contentType = getContentType(file.originalname);

          const [document] = await db.insert(knowledgeBaseDocuments).values({
            filename: path.basename(file.path),
            originalName: file.originalname,
            contentType,
            category,
            size: fileStats.size,
            status: 'queued',
            uploadedAt: new Date()
          }).returning();

          // Queue for async processing
          const jobId = await queueService.queueDocumentIngestion({
            path: file.path,
            docId: document.id,
            category,
            originalName: file.originalname
          });

          results.push({
            docId: document.id,
            jobId,
            originalName: file.originalname,
            status: 'queued',
            category,
            size: fileStats.size
          });

          moduleLogger.info(`Queued document for processing`, {
            docId: document.id,
            jobId,
            filename: file.originalname
          });

        } catch (error) {
          moduleLogger.error(`Failed to process ${file.originalname}:`, error);
          results.push({
            originalName: file.originalname,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Return 202 Accepted - processing will happen asynchronously
      res.status(202).json({
        success: true,
        message: 'Documents queued for processing',
        totalFiles: files.length,
        results,
        note: 'Documents will be processed asynchronously. Use the job IDs to check processing status.'
      });

    } catch (error) {
      moduleLogger.error('Upload error:', error);
      res.status(500).json({
        message: 'Failed to upload documents',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
];

/**
 * Check processing status of a document
 */
export const getDocumentStatus = async (req: Request, res: Response) => {
  try {
    const { docId } = req.params;
    
    if (!docId || isNaN(parseInt(docId))) {
      return res.status(400).json({ message: 'Valid document ID required' });
    }

    // Get document from database
    const [document] = await db.select()
      .from(knowledgeBaseDocuments)
      .where(eq(knowledgeBaseDocuments.id, parseInt(docId)))
      .limit(1);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json({
      docId: document.id,
      originalName: document.originalName,
      status: document.status,
      category: document.category,
      uploadedAt: document.uploadedAt,
      processedAt: document.processedAt,
      metadata: document.metadata ? JSON.parse(document.metadata) : null
    });

  } catch (error) {
    moduleLogger.error('Error getting document status:', error);
    res.status(500).json({
      message: 'Failed to get document status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get job status from queue
 */
export const getJobStatus = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID required' });
    }

    const status = await queueService.getJobStatus(jobId);
    res.json(status);

  } catch (error) {
    moduleLogger.error('Error getting job status:', error);
    res.status(500).json({
      message: 'Failed to get job status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get queue statistics
 */
export const getQueueStats = async (req: Request, res: Response) => {
  try {
    const stats = await queueService.getQueueStats();
    res.json(stats);
  } catch (error) {
    moduleLogger.error('Error getting queue stats:', error);
    res.status(500).json({
      message: 'Failed to get queue statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};