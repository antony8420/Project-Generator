import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { OpenAI } from 'openai';
const archiver = require('archiver');
const multer = require('multer');
const mammoth = require('mammoth');
require('dotenv').config();

// Import AI prompts
import { GENERATE_PROJECT_PROMPT, UPDATE_PROJECT_PROMPT, ANALYZE_FEATURES_PROMPT, FEATURE_DISCOVERY_PROMPT } from './prompts';

// Import logger functions
import { logAICall, logFilesSentToAI, logSnapshotFiles, AILogEntry } from './logger';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Accept .txt, .md, .brd, .docx files
    const allowedTypes = [
      'text/plain',
      'text/markdown',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const allowedExtensions = ['.txt', '.md', '.brd', '.docx'];

    const fileExtension = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(fileExtension) ||
        (file.mimetype && allowedTypes.includes(file.mimetype))) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: TXT, MD, BRD, DOCX`));
    }
  }
});

const app = express();
const PORT = 3000;

// Azure OpenAI config
const endpoint = process.env.AZURE_ENDPOINT!;
const deployment = process.env.AZURE_DEPLOYMENT!;
const apiKey = process.env.AZURE_API_KEY!;
const apiVersion = process.env.AZURE_API_VERSION!;

const openai = new OpenAI({
  apiKey: apiKey,
  baseURL: `${endpoint.replace(/\/*$/, '')}/openai/deployments/${deployment}`,
  defaultQuery: { 'api-version': apiVersion },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'");
  next();
});

// Paths
const REGISTRY_PATH = path.join(__dirname, '../../projects/registry.json');
const PROJECTS_DIR = path.join(__dirname, '../../projects');

// Types
interface ProjectRegistry {
  projectId: string;
  projectName: string;
  createdAt: string;
  lastUpdated: string;
  features?: { [featureName: string]: string[] };
}

interface ProjectFile {
  type: 'file' | 'directory';
  path: string;
  size: number | null;
}

// Registry functions
async function readRegistry(): Promise<ProjectRegistry[]> {
  try {
    return await fs.readJson(REGISTRY_PATH);
  } catch {
    return [];
  }
}

async function writeRegistry(registry: ProjectRegistry[]): Promise<void> {
  await fs.outputJson(REGISTRY_PATH, registry, { spaces: 2 });
}

// Extract BRD content from uploaded file
async function extractBrdContent(file: any): Promise<string> {
  try {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Convert DOCX to text using mammoth
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value;
    } else {
      // Handle text files (UTF-8)
      return file.buffer.toString('utf-8');
    }
  } catch (parseError) {
    throw new Error(`Failed to parse file content: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
  }
}

// AI Calls functions
async function readAICalls(): Promise<AILogEntry[]> {
  try {
    const aiCallsPath = path.join(__dirname, '../../logs/ai-calls.jsonl');
    if (!(await fs.pathExists(aiCallsPath))) {
      return [];
    }

    const content = await fs.readFile(aiCallsPath, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.trim());

    return lines.map(line => JSON.parse(line) as AILogEntry);
  } catch (error) {
    console.error('Error reading AI calls:', error);
    return [];
  }
}

// Upload BRD file and generate new project
app.post('/api/upload/brd', upload.single('brdFile'), async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file;
    const brdContent = await extractBrdContent(file);

    console.log(`📄 BRD file uploaded for generation: "${file.originalname}" (${brdContent.length} characters)`);

    // Generate new project directly
    const projectId = uuidv4();
    const aiResponse = await generateProject(brdContent, projectId);

    const now = new Date().toISOString();
    const newProject: ProjectRegistry = {
      projectId,
      projectName: aiResponse.projectName,
      createdAt: now,
      lastUpdated: now,
    };

    const registry = await readRegistry();
    registry.push(newProject);
    await writeRegistry(registry);

    // Apply operations to create project files
    const projectDir = path.join(PROJECTS_DIR, projectId);

    // Ensure proper project structure exists
    const requiredOperations = [
      {
        op: 'create',
        path: 'backend/package.json',
        content: JSON.stringify({
          name: `${aiResponse.projectName.toLowerCase().replace(/\s+/g, '-')}-backend`,
          version: '1.0.0',
          description: `Backend for ${aiResponse.projectName}`,
          main: 'src/index.js',
          scripts: {
            dev: 'ts-node src/index.ts',
            build: 'tsc',
            start: 'node dist/index.js'
          },
          dependencies: {
            express: '^4.18.2',
            cors: '^2.8.5',
            'fs-extra': '^11.1.1',
            'uuid': '^9.0.1',
            'body-parser': '^1.20.2'
          },
          devDependencies: {
            typescript: '^5.2.2',
            'ts-node': '^10.9.1',
            '@types/express': '^4.17.17',
            '@types/cors': '^2.8.17',
            '@types/fs-extra': '^11.0.1',
            '@types/uuid': '^9.0.1',
            '@types/node': '^20.0.0'
          }
        }, null, 2),
        reason: 'Create backend package.json for Node.js dependencies'
      },
      {
        op: 'create',
        path: 'backend/tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'ES2022',
            module: 'commonjs',
            outDir: './dist',
            rootDir: './src',
            strict: true,
            moduleDetection: 'node',
            allowSyntheticDefaultImports: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true,
            esModuleInterop: true
          },
          include: ['src/**/*'],
          exclude: ['node_modules', 'dist', 'data']
        }, null, 2),
        reason: 'Create backend TypeScript configuration'
      },
      {
        op: 'create',
        path: 'frontend/package.json',
        content: JSON.stringify({
          name: `${aiResponse.projectName.toLowerCase().replace(/\s+/g, '-')}-frontend`,
          version: '1.0.0',
          description: `Frontend for ${aiResponse.projectName}`,
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview'
          },
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0',
            axios: '^1.5.0'
          },
          devDependencies: {
            '@types/react': '^18.2.22',
            '@types/react-dom': '^18.2.7',
            '@vitejs/plugin-react': '^4.0.4',
            typescript: '^5.2.2',
            vite: '^4.4.9'
          }
        }, null, 2),
        reason: 'Create frontend package.json for React dependencies'
      },
      {
        op: 'create',
        path: 'frontend/tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'ES2020',
            useDefineForClassFields: true,
            lib: ['ES2020', 'DOM', 'DOM.Iterable'],
            module: 'ESNext',
            skipLibCheck: true,
            moduleResolution: 'bundler',
            allowImportingTsExtensions: true,
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: 'react-jsx',
            strict: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
            noFallthroughCasesInSwitch: true
          },
          include: ['src'],
          references: [{ path: './tsconfig.node.json' }]
        }, null, 2),
        reason: 'Create frontend TypeScript configuration'
      },
      {
        op: 'create',
        path: 'frontend/vite.config.ts',
        content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3001
  }
})`,
        reason: 'Create Vite configuration for frontend development'
      },
      {
        op: 'create',
        path: 'frontend/index.html',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${aiResponse.projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>`,
        reason: 'Create HTML entry point for React application'
      }
    ];

    // Validate AI response contains required operations
    const requiredFiles = [
      'backend/src/index.ts',
      'frontend/src/App.tsx',
      'frontend/src/index.tsx'
    ];

    const hasRequiredFiles = requiredFiles.every(requiredFile =>
      aiResponse.operations.some((op:any)  => op.path === requiredFile)
    );

    if (!hasRequiredFiles) {
      console.log('⚠️ AI response missing required files, adding them...');

      // Add missing core files if AI didn't generate them
      const missingFiles = [
        !aiResponse.operations.some((op:any) => op.path === 'backend/src/index.ts') && {
          op: 'create' as const,
          path: 'backend/src/index.ts',
          content: `import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

// Import feature routes
import employeeRoutes from './employees/routes/employeeRoutes';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/employees', employeeRoutes);

app.listen(PORT, () => {
  console.log(\`Backend server running on http://localhost:\${PORT}\`);
});`,
          reason: 'Create main backend server file with employee routes'
        },
        !aiResponse.operations.some( (op:any) => op.path === 'frontend/src/index.tsx') && {
          op: 'create' as const,
          path: 'frontend/src/index.tsx',
          content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
          reason: 'Create React application entry point'
        },
        !aiResponse.operations.some( (op:any) => op.path === 'frontend/src/App.tsx') && {
          op: 'create' as const,
          path: 'frontend/src/App.tsx',
          content: `import React from 'react';
import EmployeeListPage from './employees/pages/EmployeeListPage.tsx';

function App() {
  return (
    <div className="App">
      <h1>${aiResponse.projectName}</h1>
      <EmployeeListPage />
    </div>
  );
}

export default App;`,
          reason: 'Create main App component with employee management'
        }
      ].filter(Boolean);

      aiResponse.operations.push(...missingFiles);
    }

    const allOperations = [...requiredOperations, ...aiResponse.operations];
    await applyOperations(projectDir, allOperations);

    console.log(`✅ Project generated successfully from BRD file! Applied ${allOperations.length} operations`);

    res.json({
      success: true,
      operation: 'generate',
      projectId,
      projectName: aiResponse.projectName,
      fileName: file.originalname,
      fileSize: file.size,
      contentType: file.mimetype,
      operationsApplied: allOperations.length,
      message: `Project "${aiResponse.projectName}" generated successfully from uploaded BRD file`
    });

  } catch (error) {
    console.error('BRD generation error:', error);
    res.status(500).json({
      error: 'Failed to generate project from BRD file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Core update logic shared between endpoints
async function processProjectUpdate(
  projectId: string,
  brdContent: string,
  source: string,
  fileInfo?: any,
  selectionMode: 'feature' | 'custom' | 'full' = 'full',
  selectedPaths: string[] = []
): Promise<any> {
  // Validate project exists
  const registry = await readRegistry();
  const project = registry.find(p => p.projectId === projectId);
  if (!project) {
    throw new Error('Project not found');
  }

  // Generate consistent timestamp for all operations in this update
  const operationTimestamp = new Date().toISOString();

  console.log(`🔄 ${source}: BRD length ${brdContent.length} characters for project "${project.projectName}"`);

  const projectDir = path.join(PROJECTS_DIR, projectId);

  let snapshot: { [key: string]: string };
  let fileNamesSentToAI: string[] = [];
  let updateContext: string;
  let operationType: string;
  let snapshotType: string;
  let affectedFeatures: string[] = [];
  let confidence = 'high';

  if (selectionMode === 'custom' && selectedPaths.length > 0) {
    // Custom selection mode - use user-selected paths
    console.log('📂 Phase 1: Processing custom folder selection...');
    console.log(`🎯 Selected paths: ${selectedPaths.join(', ')}`);

    snapshot = await getCustomSnapshot(projectDir, selectedPaths, projectId);
    fileNamesSentToAI = Object.keys(snapshot);

    updateContext = `Custom selection: ${selectedPaths.join(', ')} (${fileNamesSentToAI.length} files)`;
    operationType = 'update-custom';
    snapshotType = 'custom-selection';

    console.log(`📁 Created custom snapshot with ${fileNamesSentToAI.length} files from ${selectedPaths.length} selected paths`);
  } else if (selectionMode === 'full') {
    // Full project mode - send entire project snapshot
    console.log('📋 Processing full project snapshot...');

    snapshot = await getFilesSnapshot(projectDir, projectId);
    fileNamesSentToAI = Object.keys(snapshot);

    updateContext = `Full project update (${fileNamesSentToAI.length} files)`;
    operationType = 'update-full';
    snapshotType = 'full-project';

    console.log(`📁 Created full project snapshot with ${fileNamesSentToAI.length} files`);
  } else {
    // Legacy feature-based mode (fallback for backward compatibility)
    console.log('🔍 Phase 1A: Discovering features from project structure...');
    const discoveredFeatures = await discoverFeatures(projectDir, projectId);
    console.log(`✅ Discovered ${discoveredFeatures.features?.length || 0} features:`, discoveredFeatures.features?.map((f: any) => f.name) || []);

    console.log('📋 Phase 1B: Analyzing BRD to determine affected features...');
    const featureAnalysis = await analyzeFeatures(brdContent, discoveredFeatures.features || [], projectId);
    affectedFeatures = featureAnalysis.affectedFeatures;
    confidence = featureAnalysis.confidence;

    console.log(`🎯 AI determined ${affectedFeatures.length} affected features:`, affectedFeatures);
    console.log(`📊 Confidence level: ${confidence}`);

    // Phase 2: Create targeted snapshot based on AI analysis
    const updateResult = await createOptimizedSnapshot(projectDir, affectedFeatures, projectId, confidence);

    snapshot = updateResult.snapshot;
    fileNamesSentToAI = updateResult.fileNamesSentToAI;
    updateContext = updateResult.updateContext;
    operationType = updateResult.operationType;
    snapshotType = updateResult.snapshotType;
  }

  // Coordinated logging with consistent timestamp
  console.log(`📋 Logging operation: ${operationType} with ${fileNamesSentToAI.length} files`);
  await Promise.all([
    logFilesSentToAI(projectId, operationType, fileNamesSentToAI, operationTimestamp),
    logSnapshotFiles(projectId, operationType, snapshotType, snapshot, operationTimestamp)
  ]);

  // Phase 3: AI Update - Process the snapshot
  console.log('🔧 Phase 3: Processing AI update...');
  const aiResponse = await updateProject(brdContent, snapshot, projectId, updateContext);

  // Apply operations
  await applyOperations(projectDir, aiResponse.operations);

  project.lastUpdated = new Date().toISOString();
  await writeRegistry(registry);

  console.log(`✅ Project updated successfully! Applied ${aiResponse.operations?.length || 0} operations`);

  return {
    projectId,
    projectName: project.projectName,
    affectedFeatures,
    confidence,
    filesProcessed: fileNamesSentToAI.length,
    operationsApplied: aiResponse.operations?.length || 0,
    operationType,
    fileInfo,
    updateContext,
    selectedPaths: selectionMode === 'custom' ? selectedPaths : null,
    selectionMode
  };
}

// Optimized snapshot creation function
async function createOptimizedSnapshot(projectDir: string, affectedFeatures: string[], projectId: string, confidence: string) {
  let snapshot: { [key: string]: string };
  let fileNamesSentToAI: string[] = [];
  let updateContext: string;
  let operationType: string;
  let snapshotType: string;

  if (affectedFeatures.length > 0) {
    console.log('🎯 Phase 2: Creating targeted snapshot of affected features...');

    // Convert feature names to folder paths
    const featurePaths: string[] = [];
    for (const featureName of affectedFeatures) {
      // Add both backend and frontend feature folders if available
      featurePaths.push(`backend/src/${featureName}`);
      featurePaths.push(`frontend/src/${featureName}`);
    }

    snapshot = await getFeatureSnapshot(projectDir, featurePaths, projectId);
    fileNamesSentToAI = Object.keys(snapshot);
    snapshotType = 'feature-based';

    if (fileNamesSentToAI.length > 0) {
      updateContext = `AI-detected features: ${affectedFeatures.join(', ')} (${fileNamesSentToAI.length} files)`;
      operationType = 'update-targeted';
      console.log(`📁 Created targeted snapshot with ${fileNamesSentToAI.length} files from ${affectedFeatures.length} features`);
    } else {
      // Targeted snapshot failed, fall back to full snapshot
      console.log('⚠️ Targeted snapshot failed, falling back to full project snapshot...');
      snapshot = await getFilesSnapshot(projectDir, projectId);
      fileNamesSentToAI = Object.keys(snapshot);
      updateContext = `Full project update (targeted snapshot failed for features: ${affectedFeatures.join(', ')})`;
      operationType = 'update-full';
      snapshotType = 'full-project';
      console.log(`📁 Created fallback full snapshot with ${fileNamesSentToAI.length} files`);
    }
  } else {
    // No features detected, use full project update
    console.log('⚠️ AI could not determine affected features, using full project snapshot...');
    snapshot = await getFilesSnapshot(projectDir, projectId);
    fileNamesSentToAI = Object.keys(snapshot);
    updateContext = `Full project update (AI fallback - confidence: ${confidence})`;
    operationType = 'update-full';
    snapshotType = 'full-project';
    console.log(`📁 Created full snapshot with ${fileNamesSentToAI.length} files`);
  }

  return {
    snapshot,
    fileNamesSentToAI,
    updateContext,
    operationType,
    snapshotType
  };
}

// Upload BRD file and update existing project
app.post('/api/upload/brd/:projectId', upload.single('brdFile'), async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { projectId } = req.params;
    const file = req.file;
    const brdContent = await extractBrdContent(file);

    console.log(`📄 BRD file uploaded: "${file.originalname}" (${brdContent.length} characters)`);

    const result = await processProjectUpdate(
      projectId,
      brdContent,
      'File Upload',
      {
        fileName: file.originalname,
        fileSize: file.size,
        contentType: file.mimetype
      }
    );

    res.json({
      success: true,
      operation: 'update',
      ...result,
      message: `Project "${result.projectName}" updated successfully from uploaded BRD file`
    });

  } catch (error) {
    console.error('BRD file update error:', error);
    res.status(500).json({
      error: 'Failed to update project from BRD file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Endpoints
app.get('/api/projects', async (req: Request, res: Response) => {
  try {
    const registry = await readRegistry();
    res.json(registry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read registry' });
  }
});

app.post('/api/projects', async (req: Request, res: Response) => {
  const projectId = uuidv4(); // Generate ID first for logging
  try {
    const { brd } = req.body;
    if (!brd) return res.status(400).json({ error: 'BRD text required' });

    const aiResponse = await generateProject(brd, projectId);

    const now = new Date().toISOString();

    const newProject: ProjectRegistry = {
      projectId,
      projectName: aiResponse.projectName,
      createdAt: now,
      lastUpdated: now,
    };

    const registry = await readRegistry();
    registry.push(newProject);
    await writeRegistry(registry);

    // Apply operations to create project files
    const projectDir = path.join(PROJECTS_DIR, projectId);

    // Ensure critical package.json files are created regardless of AI output
    const requiredOperations = [
      {
        op: 'create',
        path: 'backend/package.json',
        content: JSON.stringify({
          name: `${aiResponse.projectName.toLowerCase().replace(/\s+/g, '-')}-backend`,
          version: '1.0.0',
          description: `Backend for ${aiResponse.projectName}`,
          main: 'src/index.js',
          scripts: {
            dev: 'ts-node src/index.ts',
            build: 'tsc',
            start: 'node dist/index.js'
          },
          dependencies: {
            express: '^4.18.2',
            cors: '^2.8.5',
            'fs-extra': '^11.1.1'
          },
          devDependencies: {
            typescript: '^5.2.2',
            'ts-node': '^10.9.1',
            '@types/express': '^4.17.17',
            '@types/cors': '^2.8.17',
            '@types/fs-extra': '^11.0.1'
          }
        }, null, 2),
        reason: 'Create backend package.json for Node.js dependencies'
      },
      {
        op: 'create',
        path: 'backend/tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'ES2022',
            module: 'commonjs',
            outDir: './dist',
            rootDir: './src',
            strict: true,
            moduleDetection: 'node',
            allowSyntheticDefaultImports: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true
          },
          include: ['src/**/*'],
          exclude: ['node_modules', 'dist', 'data']
        }, null, 2),
        reason: 'Create backend TypeScript configuration'
      },
      {
        op: 'create',
        path: 'frontend/package.json',
        content: JSON.stringify({
          name: `${aiResponse.projectName.toLowerCase().replace(/\s+/g, '-')}-frontend`,
          version: '1.0.0',
          description: `Frontend for ${aiResponse.projectName}`,
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview'
          },
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0',
            axios: '^1.5.0'
          },
          devDependencies: {
            '@types/react': '^18.2.22',
            '@types/react-dom': '^18.2.7',
            '@vitejs/plugin-react': '^4.0.4',
            typescript: '^5.2.2',
            vite: '^4.4.9'
          }
        }, null, 2),
        reason: 'Create frontend package.json for React dependencies'
      },
      {
        op: 'create',
        path: 'frontend/tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'ES2020',
            useDefineForClassFields: true,
            lib: ['ES2020', 'DOM', 'DOM.Iterable'],
            module: 'ESNext',
            skipLibCheck: true,
            moduleResolution: 'bundler',
            allowImportingTsExtensions: true,
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: 'react-jsx',
            strict: true,
            noUnusedLocals: true,
            noUnusedParameters: true,
            noFallthroughCasesInSwitch: true
          },
          include: ['src'],
          references: [{ path: './tsconfig.node.json' }]
        }, null, 2),
        reason: 'Create frontend TypeScript configuration'
      }
    ];

    // Combine required operations with AI-generated operations
    const allOperations = [...requiredOperations, ...aiResponse.operations];
    await applyOperations(projectDir, allOperations);

    res.json(registry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.post('/api/projects/:projectId/update', async (req: Request, res: Response) => {
  const { projectId } = req.params;
  try {
    const { brd, selectionMode, selectedPaths } = req.body;
    if (!brd) return res.status(400).json({ error: 'BRD text required' });

    if (selectionMode === 'custom' && (!selectedPaths || selectedPaths.length === 0)) {
      return res.status(400).json({ error: 'Selected paths required for custom selection mode' });
    }

    const result = await processProjectUpdate(
      projectId,
      brd,
      'Text Update',
      undefined,
      selectionMode || 'feature',
      selectedPaths || []
    );

    res.json({
      success: true,
      operation: 'update',
      ...result,
      message: `Project "${result.projectName}" updated successfully`
    });
  } catch (error) {
    console.error('Text update project error:', error);
    res.status(500).json({
      error: 'Failed to update project',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete project endpoint
app.delete('/api/projects/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { deleteFiles = false } = req.query;

    const registry = await readRegistry();
    const projectIndex = registry.findIndex(p => p.projectId === projectId);
    if (projectIndex === -1) return res.status(404).json({ error: 'Project not found' });

    const project = registry[projectIndex];

    // Remove from registry
    registry.splice(projectIndex, 1);
    await writeRegistry(registry);

    // Optionally delete project files
    if (deleteFiles === 'true') {
      const projectDir = path.join(PROJECTS_DIR, projectId);
      if (await fs.pathExists(projectDir)) {
        await fs.remove(projectDir);
      }
    }

    res.json({ message: 'Project deleted successfully', deletedFiles: deleteFiles === 'true' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Download endpoint
app.get('/api/projects/:projectId/download', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const registry = await readRegistry();
    const project = registry.find(p => p.projectId === projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const projectDir = path.join(PROJECTS_DIR, projectId);
    if (!(await fs.pathExists(projectDir))) {
      return res.status(404).json({ error: 'Project files not found' });
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    const zipFilename = `${project.projectName.replace(/[^a-zA-Z0-9]/g, '_')}-${projectId.slice(0, 8)}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);

    archive.pipe(res);

    archive.directory(projectDir, false);

    archive.on('error', (err: any) => {
      throw err;
    });

    await archive.finalize();
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to generate zip' });
  }
});

// Health check
app.get('/health', async (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// File Tracking endpoints
async function readFileTrackingLogs(): Promise<any[]> {
  try {
    const fileTrackingPath = path.join(__dirname, '../../logs/ai-file-tracking.jsonl');
    if (!(await fs.pathExists(fileTrackingPath))) {
      return [];
    }

    const content = await fs.readFile(fileTrackingPath, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.trim());

    return lines.map(line => JSON.parse(line) as any);
  } catch (error) {
    console.error('Error reading file tracking logs:', error);
    return [];
  }
}

async function readSnapshotLogs(): Promise<any[]> {
  try {
    const snapshotPath = path.join(__dirname, '../../logs/snapshot-files.jsonl');
    if (!(await fs.pathExists(snapshotPath))) {
      return [];
    }

    const content = await fs.readFile(snapshotPath, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.trim());

    return lines.map(line => JSON.parse(line) as any);
  } catch (error) {
    console.error('Error reading snapshot logs:', error);
    return [];
  }
}

// Get all file tracking entries with filtering
app.get('/api/file-tracking', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const projectId = req.query.projectId as string;
    const operation = req.query.operation as string;
    const sortBy = req.query.sortBy as string || 'timestamp';
    const sortOrder = req.query.sortOrder as string || 'desc';

    const allEntries = await readFileTrackingLogs();
    const snapshotEntries = await readSnapshotLogs();

    // Create a lookup map for snapshot data by projectId and operation timestamp
    const snapshotLookup = new Map<string, any>();
    snapshotEntries.forEach(entry => {
      const key = `${entry.projectId}_${entry.timestamp}`;
      snapshotLookup.set(key, entry);
    });

    // Enrich file tracking entries with snapshot data including totalFileCount
    const enrichedEntries = allEntries.map(entry => {
      const snapshotKey = `${entry.projectId}_${entry.timestamp}`;
      const snapshotData = snapshotLookup.get(snapshotKey);

      return {
        ...entry,
        totalFileCount: snapshotData?.totalFileCount || 0,
        snapshotType: snapshotData?.snapshotType || null,
        filesProcessed: snapshotData?.fileCount || entry.fileCount
      };
    });

    // Apply filters
    let filteredEntries = enrichedEntries;

    if (projectId) {
      filteredEntries = filteredEntries.filter(entry => entry.projectId === projectId);
    }

    if (operation) {
      filteredEntries = filteredEntries.filter(entry => entry.operation === operation);
    }

    // Sort entries (reverse chronological by default - newest first)
    filteredEntries.sort((a, b) => {
      const aValue = new Date(a.timestamp).getTime();
      const bValue = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

    // Apply limit
    const limitedEntries = filteredEntries.slice(0, limit);

    res.json({
      entries: limitedEntries,
      total: filteredEntries.length,
      limit,
      hasMore: filteredEntries.length > limit
    });
  } catch (error) {
    console.error('File tracking endpoint error:', error);
    res.status(500).json({ error: 'Failed to get file tracking data' });
  }
});

// Get file tracking statistics
app.get('/api/file-tracking/stats', async (req: Request, res: Response) => {
  try {
    const allEntries = await readFileTrackingLogs();

    const stats = {
      totalEntries: allEntries.length,
      uniqueProjects: new Set(allEntries.map(entry => entry.projectId)).size,
      operationsByType: allEntries.reduce((acc, entry) => {
        if (!acc[entry.operation]) {
          acc[entry.operation] = 0;
        }
        acc[entry.operation]++;
        return acc;
      }, {} as Record<string, number>),
      totalFilesTracked: allEntries.reduce((sum, entry) => sum + (entry.fileCount || 0), 0),
      dateRange: {
        earliest: allEntries.length > 0 ? allEntries[allEntries.length - 1]?.timestamp : null,
        latest: allEntries.length > 0 ? allEntries[0]?.timestamp : null
      },
      latestTimestamp: allEntries.length > 0 ? allEntries[0]?.timestamp : null
    };

    res.json(stats);
  } catch (error) {
    console.error('File tracking stats endpoint error:', error);
    res.status(500).json({ error: 'Failed to get file tracking statistics' });
  }
});

// Export file tracking data
app.get('/api/file-tracking/export', async (req: Request, res: Response) => {
  try {
    const format = req.query.format as string || 'json';
    const allEntries = await readFileTrackingLogs();

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = ['timestamp', 'projectId', 'operation', 'fileCount', 'fileNames'];
      const csvRows = allEntries.map(entry => [
        entry.timestamp,
        `"${entry.projectId}"`,
        `"${entry.operation}"`,
        entry.fileCount || 0,
        `"${(entry.fileNames || []).join('; ')}"`
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="ai-file-tracking-${new Date().toISOString().slice(0, 10)}.csv"`);
      res.send(csvContent);
    } else {
      // Export as JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="ai-file-tracking-${new Date().toISOString().slice(0, 10)}.json"`);
      res.json(allEntries);
    }
  } catch (error) {
    console.error('File tracking export endpoint error:', error);
    res.status(500).json({ error: 'Failed to export file tracking data' });
  }
});

// Test endpoint for file logging
app.post('/api/test-file-logging', async (req: Request, res: Response) => {
  try {
    const { projectId, operation, fileNames } = req.body;

    // Test the file logging functionality
    await logFilesSentToAI(
      projectId || 'test-project-123',
      operation || 'test',
      fileNames || ['frontend/src/App.tsx', 'backend/src/server.ts', 'package.json']
    );

    res.json({
      success: true,
      message: 'File logging test completed',
      loggedData: {
        projectId: projectId || 'test-project-123',
        operation: operation || 'test',
        fileCount: fileNames?.length || 3,
        fileNames: fileNames || ['frontend/src/App.tsx', 'backend/src/server.ts', 'package.json']
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'File logging test failed' });
  }
});

// AI Monitoring endpoint
app.get('/api/monitoring/ai-calls', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const operation = req.query.operation as string;
    const success = req.query.success as string;

    const allCalls = await readAICalls();

    // Filter calls
    let filteredCalls = allCalls;

    if (operation) {
      filteredCalls = filteredCalls.filter(call => call.operation === operation);
    }

    if (success !== undefined) {
      const successBool = success === 'true';
      filteredCalls = filteredCalls.filter(call => call.response.success === successBool);
    }

    // Sort by timestamp (newest first) and limit
    filteredCalls.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const recentCalls = filteredCalls.slice(0, limit);

    // Add statistics
    const stats = {
      totalCalls: allCalls.length,
      recentCalls: recentCalls.length,
      byOperation: allCalls.reduce((acc, call) => {
        acc[call.operation] = (acc[call.operation] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySuccess: allCalls.reduce((acc, call) => {
        const status = call.response.success ? 'success' : 'failure';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      avgDuration: allCalls.length > 0 ?
        Math.round(allCalls.reduce((sum, call) => sum + call.response.duration, 0) / allCalls.length) : 0
    };

    res.json({
      stats,
      calls: recentCalls
    });
  } catch (error) {
    console.error('AI monitoring error:', error);
    res.status(500).json({ error: 'Failed to get AI monitoring data' });
  }
});

// AI Monitoring dashboard HTML
app.get('/monitoring/ai', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Monitoring Dashboard</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: #0a0a0a;
            color: #e0e0e0;
            line-height: 1.6;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        h1 {
            color: #61dafb;
            text-align: center;
            margin-bottom: 30px;
            font-weight: 300;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }
        .stat-card h3 {
            margin: 0 0 10px 0;
            color: #61dafb;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .stat-card .value {
            font-size: 2em;
            font-weight: bold;
            color: #00ff88;
        }
        .filters {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        .filter {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .filter label {
            font-size: 0.9em;
            color: #aaa;
        }
        .filter select, .filter input {
            background: #2a2a2a;
            border: 1px solid #555;
            border-radius: 4px;
            color: #e0e0e0;
            padding: 8px;
            min-width: 120px;
        }
        .call-list {
            display: grid;
            gap: 15px;
        }
        .call-item {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 20px;
            transition: border-color 0.3s;
        }
        .call-item:hover {
            border-color: #555;
        }
        .call-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        .call-operation {
            font-size: 1.1em;
            font-weight: bold;
            color: #61dafb;
        }
        .call-status {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-success { background: #00aa44; color: white; }
        .status-failure { background: #aa0044; color: white; }
        .call-meta {
            display: flex;
            gap: 20px;
            margin-bottom: 15px;
            font-size: 0.9em;
            color: #aaa;
        }
        .call-detail {
            margin: 10px 0;
        }
        .detail-label {
            font-weight: bold;
            color: #61dafb;
            margin-bottom: 5px;
        }
        .detail-content {
            background: #2a2a2a;
            padding: 10px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.85em;
            white-space: pre-wrap;
            word-break: break-all;
            max-height: 200px;
            overflow-y: auto;
        }
        .request-response {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        .toggle-details {
            background: #333;
            border: none;
            color: #e0e0e0;
            cursor: pointer;
            font-size: 0.9em;
            text-decoration: underline;
            margin-top: 5px;
        }
        .call-details {
            display: none;
        }
        .call-details.expanded {
            display: block;
        }
        .auto-refresh {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 4px;
            padding: 10px;
            font-size: 0.9em;
        }
        .auto-refresh label {
            display: flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
            margin: 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 AI Monitoring Dashboard</h1>

        <div class="stats" id="stats"></div>

        <div class="filters">
            <div class="filter">
                <label for="operationFilter">Operation:</label>
                <select id="operationFilter">
                    <option value="">All Operations</option>
                </select>
            </div>
            <div class="filter">
                <label for="successFilter">Status:</label>
                <select id="successFilter">
                    <option value="">All</option>
                    <option value="true">Success</option>
                    <option value="false">Failure</option>
                </select>
            </div>
            <div class="filter">
                <label for="limitFilter">Limit:</label>
                <select id="limitFilter">
                    <option value="10">10</option>
                    <option value="25" selected>25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
            </div>
        </div>

        <div class="call-list" id="callList"></div>
    </div>

    <div class="auto-refresh">
        <label>
            <input type="checkbox" id="autoRefresh"> Auto-refresh (30s)
        </label>
    </div>

    <script>
        let autoRefreshInterval;

        async function loadMonitoringData() {
            try {
                const operation = document.getElementById('operationFilter').value;
                const success = document.getElementById('successFilter').value;
                const limit = document.getElementById('limitFilter').value;

                const params = new URLSearchParams();
                if (operation) params.append('operation', operation);
                if (success !== '') params.append('success', success);
                params.append('limit', limit);

                const response = await fetch(\`/api/monitoring/ai-calls?\${params}\`);
                const data = await response.json();

                updateStats(data.stats);
                updateOperationsFilter(data.stats.byOperation);
                updateCallList(data.calls);
            } catch (error) {
                console.error('Failed to load monitoring data:', error);
            }
        }

        function updateStats(stats) {
            document.getElementById('stats').innerHTML = \`
                <div class="stat-card">
                    <h3>Total AI Calls</h3>
                    <div class="value">\${stats.totalCalls}</div>
                </div>
                <div class="stat-card">
                    <h3>Success Rate</h3>
                    <div class="value">\${stats.totalCalls > 0 ? Math.round((stats.bySuccess.success || 0) / stats.totalCalls * 100) : 0}%</div>
                </div>
                <div class="stat-card">
                    <h3>Avg Duration</h3>
                    <div class="value">\${stats.avgDuration}ms</div>
                </div>
                <div class="stat-card">
                    <h3>Displaying</h3>
                    <div class="value">\${stats.recentCalls}</div>
                </div>
            \`;
        }

        function updateOperationsFilter(operations) {
            const select = document.getElementById('operationFilter');
            const currentValue = select.value;

            select.innerHTML = '<option value="">All Operations</option>';

            Object.entries(operations).forEach(([op, count]) => {
                const option = document.createElement('option');
                option.value = op;
                option.textContent = \`\${op} (\${count})\`;
                select.appendChild(option);
            });

            select.value = currentValue;
        }

        function updateCallList(calls) {
            const list = document.getElementById('callList');
            list.innerHTML = '';

            calls.forEach(call => {
                const item = document.createElement('div');
                item.className = 'call-item';

                const statusClass = call.response.success ? 'status-success' : 'status-failure';
                const statusText = call.response.success ? 'Success' : 'Failure';

                item.innerHTML = \`
                    <div class="call-header">
                        <span class="call-operation">[\${call.operation}] \${call.id.slice(0, 8)}</span>
                        <span class="call-status \${statusClass}">\${statusText}</span>
                    </div>
                    <div class="call-meta">
                        <span>🕒 \${new Date(call.timestamp).toLocaleString()}</span>
                        <span>⏱️ \${call.response.duration}ms</span>
                        <span>🤖 \${call.request.model}</span>
                        \${call.response.tokens ? \`<span>🎫 Input: \${call.response.tokens.input}, Output: \${call.response.tokens.output}, Total: \${call.response.tokens.total} tokens</span>\` : ''}
                        \${call.projectId ? \`<span>📁 \${call.projectId.slice(0, 8)}</span>\` : ''}
                    </div>
                    <button class="toggle-details" onclick="toggleDetails(this)">Show Request/Response Details</button>
                    <div class="call-details">
                        <div class="request-response">
                            <div class="call-detail">
                                <div class="detail-label">📤 REQUEST</div>
                                <div class="detail-content">
System Prompt: \${call.request.systemPrompt || 'N/A'}

User Prompt: \${call.request.userPrompt}

Temperature: \${call.request.temperature}
Max Tokens: \${call.request.maxTokens || 'Default'}
                                </div>
                            </div>
                            <div class="call-detail">
                                <div class="detail-label">📥 RESPONSE</div>
                                <div class="detail-content">
Success: \${call.response.success}

\${call.response.content ? \`Content: \${call.response.content}\` : ''}

\${call.response.error ? \`Error: \${call.response.error}\` : ''}

\${call.response.operationsCount ? \`Operations: \${call.response.operationsCount}\` : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                \`;

                list.appendChild(item);
            });
        }

        function toggleDetails(button) {
            const details = button.nextElementSibling;
            details.classList.toggle('expanded');
            button.textContent = details.classList.contains('expanded') ? 'Hide Details' : 'Show Request/Response Details';
        }

        // Event listeners
        document.getElementById('operationFilter').addEventListener('change', loadMonitoringData);
        document.getElementById('successFilter').addEventListener('change', loadMonitoringData);
        document.getElementById('limitFilter').addEventListener('change', loadMonitoringData);

        document.getElementById('autoRefresh').addEventListener('change', (e) => {
            if (e.target.checked) {
                autoRefreshInterval = setInterval(loadMonitoringData, 30000);
            } else {
                clearInterval(autoRefreshInterval);
            }
        });

        // Initial load
        loadMonitoringData();
    </script>
</body>
</html>`;
  res.send(html);
});

// Get project files
app.get('/api/projects/:projectId/files', async (req, res) => {
  try {
    const { projectId } = req.params;
    const registry = await readRegistry();
    const project = registry.find(p => p.projectId === projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const projectDir = path.join(PROJECTS_DIR, projectId);
    const files: ProjectFile[] = [];

    async function scanDir(dir: string, relativePath = '') {
      const items = await fs.readdir(dir, { withFileTypes: true });
      for (const item of items) {
        const itemPath = path.join(dir, item.name);
        const relPath = path.join(relativePath, item.name);

        if (item.isDirectory()) {
          files.push({ type: 'directory', path: relPath, size: null });
          await scanDir(itemPath, relPath);
        } else if (item.isFile()) {
          const stats = await fs.stat(itemPath);
          files.push({ type: 'file', path: relPath, size: stats.size });
        }
      }
    }

    if (await fs.pathExists(projectDir)) {
      await scanDir(projectDir);
    }

    res.json({ project: project.projectName, files });
  } catch (error) {
    console.error('Files list error:', error);
    res.status(500).json({ error: 'Failed to get files' });
  }
});

// Get file content
app.get('/api/projects/:projectId/file', async (req, res) => {
  try {
    const { projectId } = req.params;
    const filePath = req.query.path as string;
    if (!filePath) return res.status(400).json({ error: 'Path required' });

    const registry = await readRegistry();
    const project = registry.find(p => p.projectId === projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const projectDir = path.join(PROJECTS_DIR, projectId);
    const fullPath = path.join(projectDir, filePath);

    // Security: ensure path is within project dir
    if (!fullPath.startsWith(projectDir)) {
      return res.status(403).json({ error: 'Invalid path' });
    }

    const stats = await fs.stat(fullPath);
    if (!stats.isFile()) {
      return res.status(404).json({ error: 'Not a file' });
    }

    const content = await fs.readFile(fullPath, 'utf-8');
    res.json({ content, filename: path.basename(filePath) });
  } catch (error) {
    console.error('File content error:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// AI endpoints
app.post('/api/ai/test-connectivity', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const logId = uuidv4();

  try {
    // Simple connectivity test
    const response = await openai.chat.completions.create({
      model: deployment,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "Connected" if you receive this message.' }
      ],
      temperature: 0.1,
      max_tokens: 10,
    });

    const duration = Date.now() - startTime;
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    // Log successful AI call
    await logAICall({
      id: logId,
      timestamp: new Date().toISOString(),
      operation: 'test',
      request: {
        systemPrompt: 'You are a helpful assistant.',
        userPrompt: 'Say "Connected" if you receive this message.',
        temperature: 0.1,
        maxTokens: 10,
        model: deployment
      },
      response: {
        success: true,
        content,
        duration,
        tokens: response.usage ? {
          input: response.usage.prompt_tokens,
          output: response.usage.completion_tokens,
          total: response.usage.total_tokens
        } : undefined
      },
      metadata: {
        endpoint: '/api/ai/test-connectivity',
        userAgent: req.headers['user-agent'],
        ip: req.ip
      }
    });

    res.json({ status: 'success', message: 'Azure AI connectivity successful', response: content });
  } catch (error: any) {
    const duration = Date.now() - startTime;

    // Log failed AI call
    await logAICall({
      id: logId,
      timestamp: new Date().toISOString(),
      operation: 'test',
      request: {
        systemPrompt: 'You are a helpful assistant.',
        userPrompt: 'Say "Connected" if you receive this message.',
        temperature: 0.1,
        maxTokens: 10,
        model: deployment
      },
      response: {
        success: false,
        error: error.message,
        duration
      },
      metadata: {
        endpoint: '/api/ai/test-connectivity',
        userAgent: req.headers['user-agent'],
        ip: req.ip
      }
    });

    res.status(500).json({
      status: 'error',
      message: 'Azure AI connectivity failed',
      error: error.message,
      details: error.code || 'Unknown error'
    });
  }
});

app.post('/api/ai/generate', async (req: Request, res: Response) => {
  try {
    const { brd } = req.body;
    if (!brd) return res.status(400).json({ error: 'BRD text required' });

    const result = await generateProject(brd);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'AI generation failed' });
  }
});

app.post('/api/ai/update', async (req: Request, res: Response) => {
  try {
    const { brd, snapshot } = req.body;
    if (!brd || !snapshot) return res.status(400).json({ error: 'BRD and snapshot required' });

    const result = await updateProject(brd, snapshot);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'AI update failed' });
  }
});

// AI functions
async function generateProject(brd: string, projectId?: string): Promise<any> {
  const logId = uuidv4();
  const startTime = Date.now();

  const userPrompt = `Mode: "generate"
BRD: ${brd}`;

  try {
    const response = await openai.chat.completions.create({
      model: deployment,
      messages: [
        { role: 'system', content: GENERATE_PROJECT_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
    });

    const duration = Date.now() - startTime;
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    console.log("AI content from generate:", content);
    const result = JSON.parse(content);
    console.log("Parsed result:", result);

    // Parse operations count for logging
    let operationsCount = 0;
    try {
      const parsed = typeof result === 'string' ? JSON.parse(result) : result;
      operationsCount = parsed.operations?.length || 0;
    } catch (e) {
      operationsCount = result.operations?.length || 0;
    }

    // Enhanced console logging
    console.log(`🤖 AI CALL [generate] - SUCCESS (${duration}ms)`);
    console.log(`📊 Tokens: ${response.usage?.prompt_tokens} input, ${response.usage?.completion_tokens} output (${response.usage?.total_tokens} total)`);
    console.log(`📋 Operations generated: ${operationsCount}`);
    console.log('');

    // Log to file
    await logAICall({
      id: logId,
      timestamp: new Date().toISOString(),
      operation: 'generate',
      projectId,
      brdLength: brd.length,
      request: {
        systemPrompt: GENERATE_PROJECT_PROMPT,
        userPrompt,
        temperature: 0.1,
        model: deployment
      },
      response: {
        success: true,
        content,
        operationsCount,
        duration,
        tokens: response.usage ? {
          input: response.usage.prompt_tokens,
          output: response.usage.completion_tokens,
          total: response.usage.total_tokens
        } : undefined
      }
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error('AI generate error:', error);

    // Log failed AI call
    await logAICall({
      id: logId,
      timestamp: new Date().toISOString(),
      operation: 'generate',
      projectId,
      brdLength: brd.length,
      request: {
        systemPrompt: GENERATE_PROJECT_PROMPT,
        userPrompt,
        temperature: 0.1,
        model: deployment
      },
      response: {
        success: false,
        error: (error as Error).message,
        duration
      }
    });

    // Fallback
    return {
      projectName: 'Generated Project',
      operations: [
        {
          op: 'create',
          path: 'frontend/package.json',
          content: JSON.stringify({ name: 'frontend', version: '1.0.0' }, null, 2),
          reason: 'Create frontend package.json'
        },
        {
          op: 'create',
          path: 'backend/package.json',
          content: JSON.stringify({ name: 'backend', version: '1.0.0' }, null, 2),
          reason: 'Create backend package.json'
        }
      ],
      summary: 'Generated basic full-stack project'
    };
  }
}

// AI Feature Discovery Function (Phase 1A)
async function discoverFeatures(projectDir: string, projectId?: string): Promise<any> {
  const logId = uuidv4();
  const startTime = Date.now();

  // Get list of all files/folders in project (just structure, no content)
  const filePaths = [];
  try {
    const files = await fs.readdir(projectDir, { recursive: true, withFileTypes: true });
    for (const file of files) {
      if (file.isFile() || file.isDirectory()) {
        const relativePath = path.relative(projectDir, path.join(file.parentPath, file.name));
        filePaths.push(relativePath);
      }
    }
  } catch (error) {
    console.error('Error reading project structure:', error);
  }

  const userPrompt = `Project structure (file and folder paths):
${filePaths.join('\n')}

Identify the business features in this project based on the folder structure above.`;

  try {
    const response = await openai.chat.completions.create({
      model: deployment,
      messages: [
        { role: 'system', content: FEATURE_DISCOVERY_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
    });

    const duration = Date.now() - startTime;
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    const result = JSON.parse(content);

    // Enhanced console logging
    console.log(`🤖 AI CALL [feature-discovery] - SUCCESS (${duration}ms)`);
    console.log(`🔍 Features discovered: ${result.features?.length || 0} features`);
    console.log(`📊 Tokens: ${response.usage?.prompt_tokens} input, ${response.usage?.completion_tokens} output (${response.usage?.total_tokens} total)`);
    console.log('');

    // Log feature discovery call
    await logAICall({
      id: logId,
      timestamp: new Date().toISOString(),
      operation: 'update',
      projectId,
      request: {
        systemPrompt: FEATURE_DISCOVERY_PROMPT,
        userPrompt,
        temperature: 0.1,
        model: deployment
      },
      response: {
        success: true,
        content,
        duration,
        tokens: response.usage ? {
          input: response.usage.prompt_tokens,
          output: response.usage.completion_tokens,
          total: response.usage.total_tokens
        } : undefined
      }
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('AI feature discovery error:', error);

    // Log failed feature discovery call
    await logAICall({
      id: logId,
      timestamp: new Date().toISOString(),
      operation: 'update',
      projectId,
      request: {
        systemPrompt: FEATURE_DISCOVERY_PROMPT,
        userPrompt,
        temperature: 0.1,
        model: deployment
      },
      response: {
        success: false,
        error: (error as Error).message,
        duration
      }
    });

    // Fallback: basic feature detection
    return {
      features: [
        {
          name: "unknown",
          description: "Unable to analyze project structure",
          files: []
        }
      ],
      analysis: "Feature discovery failed, using fallback"
    };
  }
}

// AI Feature Analysis Function (Phase 1B)
async function analyzeFeatures(brd: string, discoveredFeatures: any[], projectId?: string): Promise<any> {
  const logId = uuidv4();
  const startTime = Date.now();

  const userPrompt = `Available project features:
${discoveredFeatures.map((f: any, i: number) => `${i+1}. ${f.name}: ${f.description}`).join('\n')}

BRD to analyze:
${brd}

Determine which of the above features are affected by the BRD requirements.`;

  try {
    const response = await openai.chat.completions.create({
      model: deployment,
      messages: [
        { role: 'system', content: ANALYZE_FEATURES_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
    });

    const duration = Date.now() - startTime;
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    const result = JSON.parse(content);

    // Enhanced console logging
    console.log(`🤖 AI CALL [feature-analysis] - SUCCESS (${duration}ms)`);
    console.log(`🎯 Features affected: ${result.affectedFeatures?.length || 0} features`);
    console.log(`📊 Confidence: ${result.confidence}`);
    console.log(`📊 Tokens: ${response.usage?.prompt_tokens} input, ${response.usage?.completion_tokens} output (${response.usage?.total_tokens} total)`);
    console.log('');

    // Log feature analysis call
    await logAICall({
      id: logId,
      timestamp: new Date().toISOString(),
      operation: 'update',
      projectId,
      brdLength: brd.length,
      request: {
        systemPrompt: ANALYZE_FEATURES_PROMPT,
        userPrompt,
        temperature: 0.1,
        model: deployment
      },
      response: {
        success: true,
        content,
        duration,
        tokens: response.usage ? {
          input: response.usage.prompt_tokens,
          output: response.usage.completion_tokens,
          total: response.usage.total_tokens
        } : undefined
      }
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('AI feature analysis error:', error);

    // Log failed feature analysis call
    await logAICall({
      id: logId,
      timestamp: new Date().toISOString(),
      operation: 'update',
      projectId,
      brdLength: brd.length,
      request: {
        systemPrompt: ANALYZE_FEATURES_PROMPT,
        userPrompt,
        temperature: 0.1,
        model: deployment
      },
      response: {
        success: false,
        error: (error as Error).message,
        duration
      }
    });

    // Fallback: return empty array for full project update
    return { affectedFeatures: [], analysis: "Could not analyze features", confidence: "low" };
  }
}

async function updateProject(brd: string, snapshot: any, projectId?: string, feature?: string): Promise<any> {
  const logId = uuidv4();
  const startTime = Date.now();

  const userPrompt = `Mode: "update"
BRD: ${brd}
Snapshot: ${JSON.stringify(snapshot)}`;

  try {
    const response = await openai.chat.completions.create({
      model: deployment,
      messages: [
        { role: 'system', content: UPDATE_PROJECT_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
    });

    const duration = Date.now() - startTime;
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    const result = JSON.parse(content);

    // Parse operations count for logging
    let operationsCount = 0;
    try {
      operationsCount = result.operations?.length || 0;
    } catch (e) {
      operationsCount = 0;
    }

    // Enhanced console logging
    console.log(`🤖 AI CALL [update] - SUCCESS (${duration}ms)`);
    console.log(`📋 Operations generated: ${operationsCount}`);
    console.log(`📊 Tokens: ${response.usage?.prompt_tokens} input, ${response.usage?.completion_tokens} output (${response.usage?.total_tokens} total)`);
    console.log(`📁 Snapshot size: ${Object.keys(snapshot).length} files`);
    console.log('');

    // Log successful AI call
    await logAICall({
      id: logId,
      timestamp: new Date().toISOString(),
      operation: 'update',
      projectId,
      brdLength: brd.length,
      request: {
        systemPrompt: UPDATE_PROJECT_PROMPT,
        userPrompt,
        temperature: 0.1,
        model: deployment
      },
      response: {
        success: true,
        content,
        operationsCount,
        duration,
        tokens: response.usage ? {
          input: response.usage.prompt_tokens,
          output: response.usage.completion_tokens,
          total: response.usage.total_tokens
        } : undefined
      }
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error('AI update error:', error);

    // Log failed AI call
    await logAICall({
      id: logId,
      timestamp: new Date().toISOString(),
      operation: 'update',
      projectId,
      brdLength: brd.length,
      request: {
        systemPrompt: UPDATE_PROJECT_PROMPT,
        userPrompt,
        temperature: 0.1,
        model: deployment
      },
      response: {
        success: false,
        error: (error as Error).message,
        duration
      }
    });

    return {
      operations: [],
      summary: 'No updates generated'
    };
  }
}

// Feature-based snapshot function
async function getFeatureSnapshot(projectDir: string, featurePaths: string[], projectId?: string): Promise<{ [key: string]: string }> {
  const snapshot: { [key: string]: string } = {};

  console.log(`🔍 getFeatureSnapshot called with projectDir: ${projectDir}`);
  console.log(`🎯 Feature paths to match:`, featurePaths);

  // Normalize paths to forward slashes for consistency
  featurePaths = featurePaths.map(path => path.replace(/\\/g, '/'));
  console.log(`🔄 Normalized feature paths:`, featurePaths);

  // Define file patterns to exclude for better performance
  const excludePatterns = [
    /node_modules/,           // Dependencies
    /\.git/,                  // Git repository
    /dist/,                   // Build output
    /build/,                  // Build output
    /\.log$/,                 // Log files
    /logs\//,                 // Logs directory
    /\.(jpg|jpeg|png|gif|svg|ico|woff|woff2|ttf|eot)$/, // Images and fonts
    /package-lock\.json/,     // Lock files
    /yarn\.lock/,            // Lock files
    /\.env/,                  // Environment files
    /\.DS_Store/,            // macOS system files
    /Thumbs\.db/,            // Windows system files
    /\.tmp$/,                // Temporary files
    /\.(zip|tar|gz|rar|7z)$/, // Archives
    /\.min\.(js|css)$/       // Minified files
  ];

  try {
    const allFiles = await fs.readdir(projectDir, { recursive: true, withFileTypes: true });
    console.log(`📊 Found ${allFiles.length} total files in project`);

    let matchedFiles = 0;

    // Process each feature path
    for (const featurePath of featurePaths) {
      console.log(`🔎 Processing feature path: "${featurePath}"`);

      // Find files that match or are within the feature path
      for (const file of allFiles) {
        if (file.isFile()) {
          const relativePath = path.relative(projectDir, path.join(file.parentPath, file.name));

          // Check if file matches feature path (exact match or subdirectory)
          let isInFeature = false;

          // Method 1: Exact match or starts with path + separator
          if (relativePath === featurePath || relativePath.startsWith(featurePath + '/')) {
            isInFeature = true;
          }

          // Method 2: Also check if the feature path is a directory and file is inside it
          if (!isInFeature && !featurePath.includes('/') && relativePath.startsWith(`${featurePath}/`)) {
            isInFeature = true;
          }

          // Debug logging for first few files
          if (matchedFiles < 3) {
            console.log(`   Checking file: "${relativePath}" against "${featurePath}" → ${isInFeature ? '✅ MATCH' : '❌ NO MATCH'}`);
          }

          // Skip files matching exclude patterns
          const shouldExclude = excludePatterns.some(pattern => pattern.test(relativePath));

          if (isInFeature && !shouldExclude) {
            matchedFiles++;
            console.log(`✅ Including file: ${relativePath}`);

            try {
              const content = await fs.readFile(path.join(file.parentPath, file.name), 'utf-8');
              snapshot[relativePath] = content;
            } catch (readError) {
              // Skip files that can't be read (binary files, permission issues, etc.)
              console.warn(`Skipping unreadable file: ${relativePath}`);
            }
          } else if (isInFeature && shouldExclude) {
            console.log(`⚠️ Excluding file (pattern match): ${relativePath}`);
          }
        }
      }
    }

    console.log(`📁 getFeatureSnapshot completed: ${matchedFiles} files matched, ${Object.keys(snapshot).length} files in snapshot`);

  } catch (error) {
    console.error('Error reading feature files:', error);
  }

  // Note: Logging is now handled externally with consistent timestamps
  return snapshot;
}

async function getFilesSnapshot(projectDir: string, projectId?: string): Promise<{ [key: string]: string }> {
  const snapshot: { [key: string]: string } = {};

  // Define file patterns to exclude for better performance
  const excludePatterns = [
    /node_modules/,           // Dependencies
    /\.git/,                  // Git repository
    /dist/,                   // Build output
    /build/,                  // Build output
    /\.log$/,                 // Log files
    /logs\//,                 // Logs directory
    /\.(jpg|jpeg|png|gif|svg|ico|woff|woff2|ttf|eot)$/, // Images and fonts
    /package-lock\.json/,     // Lock files
    /yarn\.lock/,            // Lock files
    /\.env/,                  // Environment files
    /\.DS_Store/,            // macOS system files
    /Thumbs\.db/,            // Windows system files
    /\.tmp$/,                // Temporary files
    /\.(zip|tar|gz|rar|7z)$/, // Archives
    /\.min\.(js|css)$/       // Minified files
  ];

  try {
    const files = await fs.readdir(projectDir, { recursive: true, withFileTypes: true });

    // Sequential processing (could be optimized to parallel later)
    for (const file of files) {
      if (file.isFile()) {
        const relativePath = path.relative(projectDir, path.join(file.parentPath, file.name));

        // Skip files matching exclude patterns
        const shouldExclude = excludePatterns.some(pattern => pattern.test(relativePath));
        if (shouldExclude) {
          continue;
        }

        try {
          const content = await fs.readFile(path.join(file.parentPath, file.name), 'utf-8');
          snapshot[relativePath] = content;
        } catch (readError) {
          // Skip files that can't be read (binary files, permission issues, etc.)
          console.warn(`Skipping unreadable file: ${relativePath}`);
        }
      }
    }
  } catch (error) {
    console.error('Error reading project files:', error);
  }

  // Note: Logging is now handled externally with consistent timestamps
  return snapshot;
}

// Custom selection snapshot function - processes only user-selected paths
async function getCustomSnapshot(projectDir: string, selectedPaths: string[], projectId?: string): Promise<{ [key: string]: string }> {
  const snapshot: { [key: string]: string } = {};

  // Define file patterns to exclude for better performance
  const excludePatterns = [
    /node_modules/,           // Dependencies
    /\.git/,                  // Git repository
    /dist/,                   // Build output
    /build/,                  // Build output
    /\.log$/,                 // Log files
    /logs\//,                 // Logs directory
    /\.(jpg|jpeg|png|gif|svg|ico|woff|woff2|ttf|eot)$/, // Images and fonts
    /package-lock\.json/,     // Lock files
    /yarn\.lock/,            // Lock files
    /\.env/,                  // Environment files
    /\.DS_Store/,            // macOS system files
    /Thumbs\.db/,            // Windows system files
    /\.tmp$/,                // Temporary files
    /\.(zip|tar|gz|rar|7z)$/, // Archives
    /\.min\.(js|css)$/       // Minified files
  ];

  console.log(`🔍 getCustomSnapshot called with projectDir: ${projectDir}`);
  console.log(`🎯 Selected paths to process:`, selectedPaths);

  try {
    const allFiles = await fs.readdir(projectDir, { recursive: true, withFileTypes: true });
    console.log(`📊 Found ${allFiles.length} total files in project`);

    let processedFiles = 0;

    // Process each selected path
    for (const selectedPath of selectedPaths) {
      console.log(`🔎 Processing selected path: "${selectedPath}"`);

      let filesMatched = 0;

      // Find files that match the selected path (either directly or are within the selected directory)
      for (const file of allFiles) {
        if (file.isFile()) {
          const relativePath = path.relative(projectDir, path.join(file.parentPath, file.name));

          // Check if file is within or matches the selected path
          let shouldInclude = false;

          // Case 1: Selected path is a direct file match
          if (relativePath === selectedPath) {
            shouldInclude = true;
          }
          // Case 2: Selected path is a directory, include files within it
          else if (relativePath.startsWith(selectedPath + '/')) {
            shouldInclude = true;
          }
          // Case 3: For top-level selections like "backend" or "frontend", include subdirectory files
          else if (!selectedPath.includes('/') &&
                   (relativePath.startsWith(`${selectedPath}/`) || relativePath.startsWith(`${selectedPath}\\`))) {
            shouldInclude = true;
          }

          if (shouldInclude) {
            // Skip files matching exclude patterns
            const shouldExclude = excludePatterns.some(pattern => pattern.test(relativePath));

            if (!shouldExclude) {
              filesMatched++;
              processedFiles++;

              console.log(`✅ Including file: ${relativePath}`);

              try {
                const content = await fs.readFile(path.join(file.parentPath, file.name), 'utf-8');
                snapshot[relativePath] = content;
              } catch (readError) {
                // Skip files that can't be read (binary files, permission issues, etc.)
                console.warn(`Skipping unreadable file: ${relativePath}`);
              }
            } else {
              console.log(`⚠️ Excluding file (pattern match): ${relativePath}`);
            }
          }
        }
      }

      console.log(`📂 ${selectedPath}: ${filesMatched} files matched`);
    }

    console.log(`📁 getCustomSnapshot completed: ${processedFiles} files processed, ${Object.keys(snapshot).length} files in snapshot`);

  } catch (error) {
    console.error('Error reading custom snapshot files:', error);
  }

  return snapshot;
}

async function applyOperations(projectDir: string, operations: any[]) {
  for (const op of operations) {
    const fullPath = path.join(projectDir, op.path);

    try {
      if (op.op === 'create' || op.op === 'modify') {
        await fs.ensureDir(path.dirname(fullPath));
        await fs.writeFile(fullPath, op.content);
        console.log(`Applied ${op.op} operation to ${op.path}`);
      } else if (op.op === 'delete') {
        await fs.remove(fullPath);
        console.log(`Applied delete operation to ${op.path}`);
      }
    } catch (error) {
      console.error(`Failed to apply operation ${op.op} on ${op.path}:`, error);
    }
  }
}

// Test page for AI connectivity
app.get('/test', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Azure AI Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        textarea { width: 100%; height: 100px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 4px; }
        button { margin: 10px 0; padding: 10px 15px; }
    </style>
</head>
<body>
    <h1>Azure AI Connectivity Test</h1>

    <h2>Test Connectivity</h2>
    <form id="connectivityForm">
        <button type="submit">Test Azure AI Connection</button>
    </form>
    <pre id="connectivityResult"></pre>

    <h2>Generate Project</h2>
    <form id="generateForm">
        <textarea id="brd" placeholder="Enter BRD text..."></textarea>
        <br>
        <button type="submit">Generate</button>
    </form>
    <pre id="generateResult"></pre>

    <h2>Update Project</h2>
    <form id="updateForm">
        <textarea id="brdUpdate" placeholder="Enter BRD text..."></textarea>
        <textarea id="snapshot" placeholder="Enter file snapshot (JSON)..." rows="10"></textarea>
        <br>
        <button type="submit">Update</button>
    </form>
    <pre id="updateResult"></pre>

    <h2>Test File Tracking</h2>
    <form id="fileTrackingForm">
        <input type="text" id="projectId" placeholder="Project ID (optional)" value="test-project-123">
        <select id="operation">
            <option value="test">test</option>
            <option value="update-targeted">update-targeted</option>
            <option value="update-full">update-full</option>
            <option value="generate">generate</option>
        </select>
        <textarea id="fileNames" placeholder="File names (one per line)..." rows="6">frontend/src/App.tsx
backend/src/server.ts
package.json
logs/ai-calls.jsonl</textarea>
        <br>
        <button type="submit">Test File Tracking Log</button>
    </form>
    <pre id="fileTrackingResult"></pre>

    <script>
        document.getElementById('connectivityForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const response = await fetch('/api/ai/test-connectivity', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                });
                const result = await response.json();
                document.getElementById('connectivityResult').textContent = JSON.stringify(result, null, 2);
            } catch (error) {
                document.getElementById('connectivityResult').textContent = 'Error: ' + error.message;
            }
        });

        document.getElementById('generateForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const brd = document.getElementById('brd').value;
            try {
                const response = await fetch('/api/ai/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ brd })
                });
                const result = await response.json();
                document.getElementById('generateResult').textContent = JSON.stringify(result, null, 2);
            } catch (error) {
                document.getElementById('generateResult').textContent = 'Error: ' + error.message;
            }
        });

        document.getElementById('updateForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const brd = document.getElementById('brdUpdate').value;
            const snapshot = document.getElementById('snapshot').value;
            let snapshotObj;
            try {
                snapshotObj = JSON.parse(snapshot);
            } catch {
                alert('Invalid JSON in snapshot');
                return;
            }
            try {
                const response = await fetch('/api/ai/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ brd, snapshot: snapshotObj })
                });
                const result = await response.json();
                document.getElementById('updateResult').textContent = JSON.stringify(result, null, 2);
            } catch (error) {
                document.getElementById('updateResult').textContent = 'Error: ' + error.message;
            }
        });

        document.getElementById('fileTrackingForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const projectId = document.getElementById('projectId').value;
            const operation = document.getElementById('operation').value;
            const fileNamesText = document.getElementById('fileNames').value;

            // Split file names by newline and filter out empty lines
            const fileNames = fileNamesText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

            try {
                const response = await fetch('/api/test-file-logging', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ projectId, operation, fileNames })
                });
                const result = await response.json();
                document.getElementById('fileTrackingResult').textContent = JSON.stringify(result, null, 2);
            } catch (error) {
                document.getElementById('fileTrackingResult').textContent = 'Error: ' + error.message;
            }
        });
    </script>
</body>
</html>`;
  res.send(html);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test AI at http://localhost:${PORT}/test`);
  console.log(`Direct file upload endpoints:`);
  console.log(`  POST /api/upload/brd (generate new project from BRD file)`);
  console.log(`  POST /api/upload/brd/:projectId (update existing project with BRD file)`);
});

// Add error handling for the server
server.on('error', (error: any) => {
  console.error('Server startup error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop other instances.`);
  } else if (error.code === 'EACCES') {
    console.error(`Port ${PORT} requires elevated privileges.`);
  } else {
    console.error('Unexpected server error:', error.message);
  }
});
