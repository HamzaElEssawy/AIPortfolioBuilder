import fs from 'fs';
import path from 'path';
import { db } from './db';
import * as schema from '@shared/schema';
import { logger } from './logger';

interface BackupMetadata {
  version: string;
  timestamp: string;
  tables: string[];
  size: number;
  description?: string;
}

interface BackupData {
  metadata: BackupMetadata;
  data: Record<string, any[]>;
}

class BackupManager {
  private static instance: BackupManager;
  private backupDirectory: string;

  private constructor() {
    this.backupDirectory = path.join(process.cwd(), 'backups');
    this.ensureBackupDirectory();
  }

  static getInstance(): BackupManager {
    if (!BackupManager.instance) {
      BackupManager.instance = new BackupManager();
    }
    return BackupManager.instance;
  }

  private ensureBackupDirectory(): void {
    if (!fs.existsSync(this.backupDirectory)) {
      fs.mkdirSync(this.backupDirectory, { recursive: true });
    }
  }

  private generateBackupFileName(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `backup-${timestamp}.json`;
  }

  async createBackup(description?: string): Promise<string> {
    try {
      logger.info('Starting database backup', { description });

      const backupData: BackupData = {
        metadata: {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          tables: [],
          size: 0,
          description
        },
        data: {}
      };

      // Backup all tables
      const tables = [
        { name: 'users', table: schema.users },
        { name: 'contactSubmissions', table: schema.contactSubmissions },
        { name: 'caseStudies', table: schema.caseStudies },
        { name: 'mediaAssets', table: schema.mediaAssets },
        { name: 'contentSections', table: schema.contentSections },
        { name: 'contentVersions', table: schema.contentVersions },
        { name: 'knowledgeBaseDocuments', table: schema.knowledgeBaseDocuments },
        { name: 'experienceEntries', table: schema.experienceEntries },
        { name: 'skillCategories', table: schema.skillCategories },
        { name: 'skills', table: schema.skills },
        { name: 'portfolioMetrics', table: schema.portfolioMetrics },
        { name: 'coreValues', table: schema.coreValues },
        { name: 'portfolioImages', table: schema.portfolioImages },
        { name: 'seoSettings', table: schema.seoSettings }
      ];

      for (const { name, table } of tables) {
        try {
          const data = await db.select().from(table);
          backupData.data[name] = data;
          backupData.metadata.tables.push(name);
          
          logger.debug(`Backed up table: ${name}`, { records: data.length });
        } catch (error) {
          logger.warn(`Failed to backup table: ${name}`, { error: error.message });
        }
      }

      // Save backup to file
      const fileName = this.generateBackupFileName();
      const filePath = path.join(this.backupDirectory, fileName);
      const backupJson = JSON.stringify(backupData, null, 2);
      
      fs.writeFileSync(filePath, backupJson);
      
      backupData.metadata.size = fs.statSync(filePath).size;

      logger.info('Database backup completed', {
        fileName,
        tables: backupData.metadata.tables.length,
        size: backupData.metadata.size
      });

      return fileName;
    } catch (error) {
      logger.error('Database backup failed', { error: error.message });
      throw error;
    }
  }

  async listBackups(): Promise<BackupMetadata[]> {
    try {
      const files = fs.readdirSync(this.backupDirectory)
        .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
        .sort()
        .reverse(); // Most recent first

      const backups: BackupMetadata[] = [];

      for (const file of files) {
        try {
          const filePath = path.join(this.backupDirectory, file);
          const stats = fs.statSync(filePath);
          const content = fs.readFileSync(filePath, 'utf8');
          const backupData: BackupData = JSON.parse(content);
          
          backups.push({
            ...backupData.metadata,
            size: stats.size
          });
        } catch (error) {
          logger.warn(`Failed to read backup file: ${file}`, { error: error.message });
        }
      }

      return backups;
    } catch (error) {
      logger.error('Failed to list backups', { error: error.message });
      throw error;
    }
  }

  async restoreBackup(fileName: string): Promise<void> {
    try {
      logger.info('Starting database restore', { fileName });

      const filePath = path.join(this.backupDirectory, fileName);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`Backup file not found: ${fileName}`);
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const backupData: BackupData = JSON.parse(content);

      // Restore data for each table
      const tableMap = {
        users: schema.users,
        contactSubmissions: schema.contactSubmissions,
        caseStudies: schema.caseStudies,
        mediaAssets: schema.mediaAssets,
        contentSections: schema.contentSections,
        contentVersions: schema.contentVersions,
        knowledgeBaseDocuments: schema.knowledgeBaseDocuments,
        experienceEntries: schema.experienceEntries,
        skillCategories: schema.skillCategories,
        skills: schema.skills,
        portfolioMetrics: schema.portfolioMetrics,
        coreValues: schema.coreValues,
        portfolioImages: schema.portfolioImages,
        seoSettings: schema.seoSettings
      };

      for (const [tableName, tableData] of Object.entries(backupData.data)) {
        const table = tableMap[tableName as keyof typeof tableMap];
        
        if (!table || !Array.isArray(tableData) || tableData.length === 0) {
          continue;
        }

        try {
          // Clear existing data
          await db.delete(table);
          
          // Insert backup data
          await db.insert(table).values(tableData);
          
          logger.debug(`Restored table: ${tableName}`, { records: tableData.length });
        } catch (error) {
          logger.warn(`Failed to restore table: ${tableName}`, { error: error.message });
        }
      }

      logger.info('Database restore completed', {
        fileName,
        tables: Object.keys(backupData.data).length
      });
    } catch (error) {
      logger.error('Database restore failed', { error: error.message, fileName });
      throw error;
    }
  }

  async deleteBackup(fileName: string): Promise<void> {
    try {
      const filePath = path.join(this.backupDirectory, fileName);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`Backup file not found: ${fileName}`);
      }

      fs.unlinkSync(filePath);
      
      logger.info('Backup deleted', { fileName });
    } catch (error) {
      logger.error('Failed to delete backup', { error: error.message, fileName });
      throw error;
    }
  }

  async getBackupDetails(fileName: string): Promise<BackupData | null> {
    try {
      const filePath = path.join(this.backupDirectory, fileName);
      
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      logger.error('Failed to get backup details', { error: error.message, fileName });
      throw error;
    }
  }

  // Automatic backup scheduling
  startAutomaticBackups(intervalHours: number = 24): void {
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    setInterval(async () => {
      try {
        await this.createBackup('Automatic backup');
        
        // Clean up old backups (keep last 10)
        const backups = await this.listBackups();
        if (backups.length > 10) {
          const oldBackups = backups.slice(10);
          for (const backup of oldBackups) {
            const fileName = `backup-${backup.timestamp.replace(/[:.]/g, '-')}.json`;
            await this.deleteBackup(fileName);
          }
        }
      } catch (error) {
        logger.error('Automatic backup failed', { error: error.message });
      }
    }, intervalMs);

    logger.info('Automatic backups scheduled', { intervalHours });
  }
}

export const backupManager = BackupManager.getInstance();