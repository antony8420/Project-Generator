import fs from 'fs-extra';
import path from 'path';

// Logger paths
const LOGS_DIR = path.join(__dirname, '../../logs');
const AI_LOGS_FILE = path.join(LOGS_DIR, 'ai-calls.jsonl');

// AI Logging interface
export interface AILogEntry {
  id: string;
  timestamp: string;
  operation: 'generate' | 'update' | 'test';
  projectId?: string;
  brdLength?: number;
  request: {
    systemPrompt?: string;
    userPrompt: string;
    temperature: number;
    maxTokens?: number;
    model: string;
  };
  response: {
    success: boolean;
    content?: string;
    operationsCount?: number;
    error?: string;
    duration: number;
    tokens?: {
      input: number;
      output: number;
      total: number;
    };
  };
  metadata?: {
    endpoint: string;
    userAgent?: string;
    ip?: string;
  };
}

/**
 * Logs AI call details to the ai-calls.jsonl file
 * @param logEntry - The AI log entry to record
 */
export async function logAICall(logEntry: AILogEntry): Promise<void> {
  if (process.env.LOGGING_ENABLED !== 'true') {
    return;
  }

  try {
    await fs.ensureDir(LOGS_DIR);
    await fs.appendFile(AI_LOGS_FILE, JSON.stringify(logEntry) + '\n');
    console.log(`📊 AI Log: ${logEntry.operation} - ${logEntry.response.success ? 'SUCCESS' : 'FAILED'} (${logEntry.response.duration}ms)`);
  } catch (error) {
    console.error('Failed to write AI log:', error);
  }
}

/**
 * Logs information about files sent to AI for processing
 * @param projectId - The project ID
 * @param operation - The operation type ('generate' | 'update')
 * @param fileNames - Array of file names sent to AI
 * @param customTimestamp - Optional timestamp (defaults to current time)
 */
export async function logFilesSentToAI(projectId: string, operation: string, fileNames: string[], customTimestamp?: string): Promise<void> {
  try {
    await fs.ensureDir(LOGS_DIR);

    const logEntry = {
      timestamp: customTimestamp || new Date().toISOString(),
      projectId,
      operation,
      fileCount: fileNames.length,
      fileNames
    };

    const AI_FILE_LOGS_FILE = path.join(LOGS_DIR, 'ai-file-tracking.jsonl');
    await fs.appendFile(AI_FILE_LOGS_FILE, JSON.stringify(logEntry) + '\n');
    console.log(`📁 File Log: ${operation} - ${fileNames.length} files sent to AI`);
  } catch (error) {
    console.error('Failed to write file tracking log:', error);
  }
}

/**
 * Counts total files in a project directory
 * @param projectId - The project ID to count files for
 * @returns Total number of files in the project
 */
export async function getProjectTotalFileCount(projectId: string): Promise<number> {
  try {
    const PROJECTS_DIR = path.join(__dirname, '../../projects');
    const projectDir = path.join(PROJECTS_DIR, projectId);

    if (!(await fs.pathExists(projectDir))) {
      console.warn(`Project directory not found for counting: ${projectDir}`);
      return 0;
    }

    let fileCount = 0;

    // Define file patterns to exclude for better performance
    const excludePatterns = [
      /node_modules/,           // Dependencies
      /\.git/,                  // Git repository
      /dist/,                   // Build output
      /build/,                  // Build output
      /\.log$/,                 // Log files
      /logs\//,                 // Logs directory
      /\.env/,                  // Environment files
      /\.DS_Store/,            // macOS system files
      /Thumbs\.db/,            // Windows system files
      /\.tmp$/,                // Temporary files
      /\.(zip|tar|gz|rar|7z)$/, // Archives
    ];

    async function countFiles(dir: string): Promise<void> {
      const items = await fs.readdir(dir, { withFileTypes: true });

      for (const item of items) {
        const itemPath = path.join(dir, item.name);

        if (item.isDirectory()) {
          await countFiles(itemPath);
        } else if (item.isFile()) {
          const relativePath = path.relative(projectDir, itemPath);

          // Skip files matching exclude patterns
          const shouldExclude = excludePatterns.some(pattern => pattern.test(relativePath));
          if (!shouldExclude) {
            fileCount++;
          }
        }
      }
    }

    await countFiles(projectDir);
    return fileCount;

  } catch (error) {
    console.error(`Error counting files for project ${projectId}:`, error);
    return 0;
  }
}

/**
 * Logs snapshot file names for debugging and monitoring
 * @param projectId - The project ID
 * @param operation - The operation type
 * @param snapshotType - Type of snapshot (e.g., 'feature-based', 'full-project')
 * @param snapshot - The snapshot object with file paths as keys
 * @param customTimestamp - Optional timestamp (defaults to current time)
 */
export async function logSnapshotFiles(projectId: string, operation: string, snapshotType: string, snapshot: { [key: string]: string }, customTimestamp?: string): Promise<void> {
  try {
    const fileNames = Object.keys(snapshot);
    const fileCount = fileNames.length;

    // Calculate total files in project
    const totalFileCount = await getProjectTotalFileCount(projectId);

    // Console logging
    console.log(`📋 Snapshot Log [${operation}]: ${snapshotType} - ${fileCount} files (out of ${totalFileCount} total project files)`);
    console.log('📂 Files included:');
    fileNames.forEach((fileName, index) => {
      console.log(`   ${index + 1}. ${fileName}`);
    });
    console.log(''); // Empty line for readability

    // File logging
    await fs.ensureDir(LOGS_DIR);

    const logEntry = {
      timestamp: customTimestamp || new Date().toISOString(),
      projectId,
      operation,
      snapshotType,
      fileCount,
      fileNames,
      totalSize: JSON.stringify(snapshot).length,
      totalFileCount  // New field: total files in the project
    };

    const SNAPSHOT_LOGS_FILE = path.join(LOGS_DIR, 'snapshot-files.jsonl');
    await fs.appendFile(SNAPSHOT_LOGS_FILE, JSON.stringify(logEntry) + '\n');

  } catch (error) {
    console.error('Failed to log snapshot files:', error);
  }
}
