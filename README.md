# Full-Stack Project Generator

A web application for generating and managing React + Node.js (TypeScript) projects from BRDs using AI integration.

## Features

- **Project Creation:** Generate new projects from BRD text using AI
- **Project Updates:** Modify existing projects in-place with new requirements
- **Registry Management:** JSON-based project tracking with metadata
- **File Handling:** Atomic writes and code preservation
- **Web Interface:** React dashboard for project management

## Setup

1. **Prerequisites**
   - Node.js 18+
   - npm

2. **Installation**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Azure AI Configuration**
   - Create Azure AI account
   - Create `.env` file in `backend/` directory with:
     ```
     AZURE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
     AZURE_DEPLOYMENT=your-deployment-name
     AZURE_API_KEY=your-api-key
     AZURE_API_VERSION=2024-12-01-preview
     ```
   - Restart backend server to load environment variables

4. **Running the Application**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev
   # Server runs on http://localhost:3000

   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   # App runs on http://localhost:3001
   ```

5. **Access the App**
   Open http://localhost:3001 in your browser

## API Endpoints

### Backend (port 3000)

- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `POST /api/projects/:projectId/update` - Update existing project
- `POST /api/ai/generate` - Generate project operations
- `POST /api/ai/update` - Update project operations

### Request Format

```json
{
  "brd": "Business Requirements Document text here..."
}
```

### Response Format

```json
{
  "projectName": "Project Name",
  "operations": [
    {
      "op": "create|modify|delete",
      "path": "relative/path/to/file",
      "content": "file content",
      "reason": "explanation"
    }
  ],
  "summary": "short summary"
}
```

## Project Structure

```
.
├── backend/
│   ├── src/server.ts          # Express server
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # React dashboard
│   │   └── index.tsx         # App entry
│   ├── public/index.html
│   ├── package.json
│   └── webpack.config.js
├── projects/
│   ├── registry.json         # Project metadata
│   └── {projectId}/         # Generated projects
└── README.md
```

## Development Notes

- Registry is stored in `projects/registry.json`
- Projects are stored in `projects/{projectId}/`
- File operations use atomic writes for safety
- User code regions (`// BEGIN USER CODE ... // END USER CODE`) are preserved during updates
- AI integration returns JSON operations for file handling

## TODO

- [x] Implement Azure AI Agent integration
- [x] Add file snapshot functionality
- [x] Implement operation application logic
- [x] Add file download/zipping
- [x] Enhance error handling
