import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Project {
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

interface UploadResult {
  success: boolean;
  operation: 'generate' | 'update';
  projectId: string;
  projectName: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  operationsApplied?: number;
  affectedFeatures?: string[];
  confidence?: string;
  filesProcessed?: number;
  message: string;
}

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [brd, setBrd] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedFeature, setSelectedFeature] = useState('');
  const [selectionMode, setSelectionMode] = useState<'feature' | 'custom'>('feature');
  const [selectedPaths, setSelectedPaths] = useState<string[]>([]);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [viewingFiles, setViewingFiles] = useState<{projectId: string, files: ProjectFile[], projectName: string} | null>(null);
  const [viewingFileContent, setViewingFileContent] = useState<{filename: string, content: string} | null>(null);

  // Current view state
  const [currentView, setCurrentView] = useState<'projects' | 'file-tracking'>('projects');

  // File Tracking State (moved to main component level to avoid hooks in conditional rendering)
  const [fileTrackingData, setFileTrackingData] = useState<{
    entries: any[];
    total: number;
    limit: number;
    hasMore: boolean;
  } | null>(null);
  const [fileTrackingStats, setFileTrackingStats] = useState<any | null>(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [trackingFilters, setTrackingFilters] = useState({
    projectId: '',
    operation: '',
    limit: 50
  });

  // Fetch file tracking data when view changes to file-tracking
  useEffect(() => {
    if (currentView === 'file-tracking') {
      fetchFileTrackingData();
      fetchFileTrackingStats();
    }
  }, [currentView, trackingFilters]);

  const fetchFileTrackingData = async () => {
    setLoadingTracking(true);
    try {
      const params = new URLSearchParams();
      if (trackingFilters.projectId) params.append('projectId', trackingFilters.projectId);
      if (trackingFilters.operation) params.append('operation', trackingFilters.operation);
      params.append('limit', trackingFilters.limit.toString());

      const response = await axios.get(`http://localhost:3000/api/file-tracking?${params}`);
      setFileTrackingData(response.data);
    } catch (error) {
      console.error('Failed to fetch file tracking data:', error);
      alert('Failed to load file tracking data');
    } finally {
      setLoadingTracking(false);
    }
  };

  const fetchFileTrackingStats = async () => {
    setLoadingStats(true);
    try {
      const response = await axios.get('http://localhost:3000/api/file-tracking/stats');
      setFileTrackingStats(response.data);
    } catch (error) {
      console.error('Failed to fetch file tracking stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const exportFileTrackingData = async (format: 'json' | 'csv') => {
    try {
      const response = await axios.get(`http://localhost:3000/api/file-tracking/export?format=${format}`, {
        responseType: 'blob'
      });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ai-file-tracking-${new Date().toISOString().slice(0, 10)}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export file tracking data:', error);
      alert('Failed to export data');
    }
  };

  // Loading states
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);
  const [downloadingProjectId, setDownloadingProjectId] = useState<string | null>(null);
  const [loadingFilesProjectId, setLoadingFilesProjectId] = useState<string | null>(null);
  const [loadingFileContent, setLoadingFileContent] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean;
    projectId: string;
    projectName: string;
    deleteFiles: boolean;
  } | null>(null);

  // File Names Modal State
  const [fileNamesModal, setFileNamesModal] = useState<{
    show: boolean;
    entry: any;
  } | null>(null);

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const res = await axios.get('http://localhost:3000/api/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setBrd(`📎 File uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    }
  };

  const createProject = async () => {
    setIsCreatingProject(true);
    try {
      let response;

      if (uploadedFile) {
        // Use file upload endpoint
        const formData = new FormData();
        formData.append('brdFile', uploadedFile);
        response = await axios.post('http://localhost:3000/api/upload/brd', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Use text-based endpoint (legacy)
        response = await axios.post('http://localhost:3000/api/projects', { brd });
      }

      fetchProjects();

      if (uploadedFile && response.data.success) {
        const result: UploadResult = response.data;
        alert(result.message + `\n\n📁 Project ID: ${result.projectId}\n📋 Operations Applied: ${result.operationsApplied || 'N/A'}`);
      }

      setBrd('');
      setSelectedProject('');
      setUploadedFile(null);
    } catch (error: any) {
      console.error('Failed to create project:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create project. Please try again.';
      alert(errorMessage);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const updateProject = async () => {
    setIsUpdatingProject(true);
    try {
      let response;

      if (uploadedFile) {
        // Use file upload endpoint
        const formData = new FormData();
        formData.append('brdFile', uploadedFile);
        response = await axios.post(`http://localhost:3000/api/upload/brd/${selectedProject}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Use text-based endpoint (legacy)
        let requestBody: any = { brd };

        if (selectionMode === 'feature' && selectedFeature) {
          requestBody.feature = selectedFeature;
        } else if (selectionMode === 'custom' && selectedPaths.length > 0) {
          requestBody.selectedPaths = selectedPaths;
        }

        response = await axios.post(`http://localhost:3000/api/projects/${selectedProject}/update`, requestBody);
      }

      fetchProjects();

      if (uploadedFile && response.data.success) {
        const result: UploadResult = response.data;
        const featureInfo = result.affectedFeatures && result.affectedFeatures.length > 0
          ? `\n🎯 Affected Features: ${result.affectedFeatures.join(', ')}`
          : '';
        alert(result.message + `\n\n📁 Project ID: ${result.projectId}\n📋 Operations Applied: ${result.operationsApplied || 'N/A'}\n📊 Confidence: ${result.confidence || 'N/A'}${featureInfo}`);
      }

      setBrd('');
      setSelectedProject('');
      setSelectedFeature('');
      setSelectedPaths([]);
      setSelectionMode('feature');
      setUploadedFile(null);
    } catch (error: any) {
      console.error('Failed to update project:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update project. Please try again.';
      alert(errorMessage);
    } finally {
      setIsUpdatingProject(false);
    }
  };

  const downloadProject = async (projectId: string) => {
    setDownloadingProjectId(projectId);
    try {
      const response = await axios.get(`http://localhost:3000/api/projects/${projectId}/download`, {
        responseType: 'blob'
      });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `project-${projectId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download project:', error);
      alert('Download failed');
    } finally {
      setDownloadingProjectId(null);
    }
  };

  const showDeleteConfirmation = (projectId: string, projectName: string) => {
    setDeleteConfirmation({
      show: true,
      projectId,
      projectName,
      deleteFiles: false
    });
  };

  const confirmDeleteProject = async () => {
    if (!deleteConfirmation) return;

    setDeletingProjectId(deleteConfirmation.projectId);
    try {
      await axios.delete(`http://localhost:3000/api/projects/${deleteConfirmation.projectId}`, {
        params: { deleteFiles: deleteConfirmation.deleteFiles.toString() }
      });

      // Remove from local state
      setProjects(projects.filter(p => p.projectId !== deleteConfirmation.projectId));

      alert(`Project "${deleteConfirmation.projectName}" ${deleteConfirmation.deleteFiles ? 'and its files ' : ''}deleted successfully!`);
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      setDeletingProjectId(null);
      setDeleteConfirmation(null);
    }
  };

  const viewFiles = async (projectId: string) => {
    setLoadingFilesProjectId(projectId);
    try {
      const res = await axios.get(`http://localhost:3000/api/projects/${projectId}/files`);
      setViewingFiles({ projectId, files: res.data.files, projectName: res.data.project });
      setViewingFileContent(null); // Reset file content
    } catch (error) {
      console.error('Failed to fetch files:', error);
      alert('Failed to load files');
    } finally {
      setLoadingFilesProjectId(null);
    }
  };

  const viewFileContent = async (projectId: string, filePath: string) => {
    setLoadingFileContent(true);
    try {
      const res = await axios.get(`http://localhost:3000/api/projects/${projectId}/file`, {
        params: { path: filePath }
      });
      setViewingFileContent({ filename: res.data.filename, content: res.data.content });
    } catch (error) {
      console.error('Failed to fetch file content:', error);
      alert('Failed to load file content. File might be binary or too large.');
    } finally {
      setLoadingFileContent(false);
    }
  };

  const loadProjectStructure = async (projectId: string) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/projects/${projectId}/files`);
      setProjectFiles(res.data.files);
      // Auto-expand root directories
      const rootDirs = new Set<string>();
      res.data.files.forEach((file: ProjectFile) => {
        if (file.type === 'directory' && !file.path.includes('/')) {
          rootDirs.add(file.path);
        }
      });
      setExpandedDirs(rootDirs);
    } catch (error) {
      console.error('Failed to load project structure:', error);
      alert('Failed to load project structure');
    }
  };

  const toggleDirectory = (path: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };

  const toggleSelection = (path: string, type: 'file' | 'directory') => {
    const newSelected = [...selectedPaths];

    if (newSelected.includes(path)) {
      // Remove from selection
      setSelectedPaths(newSelected.filter(p => p !== path));
    } else {
      // Add to selection
      if (type === 'directory') {
        // For directories, include the directory path and potentially auto-select contained files
        newSelected.push(path);
      } else {
        // For files, just add the specific file
        newSelected.push(path);
      }
      setSelectedPaths(newSelected);
    }
  };

  const isSelected = (path: string) => {
    return selectedPaths.includes(path);
  };

  const renderFileTree = () => {
    if (projectFiles.length === 0) {
      return <div style={{ color: '#666', fontStyle: 'italic' }}>Loading project structure...</div>;
    }

    const buildTree = (parentPath: string = '') => {
      const items = projectFiles.filter(file => {
        if (parentPath === '') {
          // Root level items
          return !file.path.includes('/');
        } else {
          // Items under this parent
          return file.path.startsWith(parentPath + '/') &&
                 file.path.split('/').length === parentPath.split('/').length + 1;
        }
      });

      return items.map(item => {
        const isExpanded = expandedDirs.has(item.path);
        const hasChildren = projectFiles.some(f =>
          f.path.startsWith(item.path + '/') && f.path !== item.path
        );

        return (
          <div key={item.path} style={{ marginLeft: parentPath ? '20px' : '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', padding: '2px 0' }}>
              <input
                type="checkbox"
                checked={isSelected(item.path)}
                onChange={() => toggleSelection(item.path, item.type)}
                style={{ marginRight: '8px' }}
              />
              {item.type === 'directory' && hasChildren && (
                <button
                  onClick={() => toggleDirectory(item.path)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    marginRight: '5px',
                    fontSize: '0.8em',
                    color: '#666'
                  }}
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
              )}
              <span style={{
                color: item.type === 'directory' ? '#FF9800' : '#4CAF50',
                marginRight: '8px'
              }}>
                {item.type === 'directory' ? '📁' : '📄'}
              </span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>
                {item.path.split('/').pop()}
              </span>
              {item.size && (
                <span style={{ color: '#666', fontSize: '0.8em', marginLeft: '5px' }}>
                  ({item.size} bytes)
                </span>
              )}
            </div>
            {item.type === 'directory' && isExpanded && hasChildren && (
              <div>
                {buildTree(item.path)}
              </div>
            )}
          </div>
        );
      });
    };

    return buildTree();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // File Tracking Interface
  interface FileTrackingEntry {
    timestamp: string;
    projectId: string;
    operation: string;
    fileCount: number;
    fileNames: string[];
  }

  interface FileTrackingStats {
    totalEntries: number;
    uniqueProjects: number;
    operationsByType: Record<string, number>;
    totalFilesTracked: number;
    dateRange: {
      earliest: string | null;
      latest: string | null;
    };
    latestTimestamp: string | null;
  }

  const renderNavigation = () => (
    <nav style={{
      backgroundColor: '#f8f9fa',
      padding: '10px 20px',
      borderBottom: '1px solid #dee2e6',
      marginBottom: '20px'
    }}>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <button
          onClick={() => setCurrentView('projects')}
          style={{
            padding: '8px 16px',
            background: currentView === 'projects' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: currentView === 'projects' ? 'bold' : 'normal'
          }}
        >
          📂 Project Management
        </button>
        <button
          onClick={() => setCurrentView('file-tracking')}
          style={{
            padding: '8px 16px',
            background: currentView === 'file-tracking' ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: currentView === 'file-tracking' ? 'bold' : 'normal'
          }}
        >
          📊 File Tracking Dashboard
        </button>
      </div>
    </nav>
  );

  const renderProjectsView = () => (
    <>
      <h1>Project Generator Dashboard</h1>

      {/* Project Creation Section */}
      <div style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
        <h2>Create / Update Project</h2>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Select Existing Project to Update:</label>
          <select value={selectedProject} onChange={e => { setSelectedProject(e.target.value); setSelectedFeature(''); }} style={{ padding: '5px', width: '300px' }}>
            <option value="">Create New Project</option>
            {projects.map(p => (
              <option key={p.projectId} value={p.projectId}>
                {p.projectName}
              </option>
            ))}
          </select>
        </div>
        {selectedProject && (
          <div style={{ marginBottom: '10px' }}>
            <div style={{
              padding: '12px',
              backgroundColor: '#e8f4fd',
              border: '1px solid #2196f3',
              borderRadius: '6px',
              marginBottom: '10px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>🤖 AI-Powered Update</h4>
              <p style={{ margin: 0, fontSize: '0.9em', color: '#666' }}>
                Simply provide your BRD text below. AI will:
              </p>
              <ul style={{ margin: '5px 0 0 20px', fontSize: '0.9em', color: '#666' }}>
                <li>Analyze your requirements automatically</li>
                <li>Determine which features are affected</li>
                <li>Update only the relevant files</li>
                <li>No manual file/folder selection needed!</li>
              </ul>
            </div>
          </div>
        )}
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Upload BRD File:</label>
          <input
            type="file"
            accept=".txt,.md,.brd,.docx"
            onChange={handleFileUpload}
            style={{ marginBottom: '10px' }}
          />
          <br />
          <label style={{ display: 'block', marginBottom: '5px' }}>BRD Text:</label>
          <textarea
            value={brd}
            onChange={e => setBrd(e.target.value)}
            placeholder="Enter BRD text here or upload a file above..."
            rows={8}
            cols={60}
            style={{ padding: '5px', fontFamily: 'monospace' }}
          />
        </div>
        <div>
          <button
            onClick={createProject}
            disabled={isCreatingProject}
            style={{
              padding: '10px 15px',
              marginRight: '10px',
              background: isCreatingProject ? '#81C784' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isCreatingProject ? 'not-allowed' : 'pointer'
            }}
          >
            {isCreatingProject ? (
              <><span style={{ marginRight: '8px' }}>⏳</span>Generating...</>
            ) : (
              'Generate New Project'
            )}
          </button>
          <button
            onClick={updateProject}
            disabled={!selectedProject || isUpdatingProject || !brd.trim()}
            style={{
              padding: '10px 15px',
              background: (!selectedProject || isUpdatingProject || !brd.trim()) ? '#ccc' : '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (!selectedProject || isUpdatingProject || !brd.trim()) ? 'not-allowed' : 'pointer'
            }}
          >
            {isUpdatingProject ? (
              <><span style={{ marginRight: '8px' }}>⏳</span>Updating...</>
            ) : (
              'Update Selected Project'
            )}
          </button>
        </div>
      </div>

      {/* Projects List Section */}
      <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', position: 'relative' }}>
        <h2>Generated Projects</h2>

        {/* Loading overlay for projects */}
        {isLoadingProjects && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            borderRadius: '5px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
              <div>Loading projects...</div>
            </div>
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Project Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Created</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Last Updated</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Actions</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Delete</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center', fontStyle: 'italic' }}>
                  No projects generated yet
                </td>
              </tr>
            ) : (
              projects.map(project => (
                <tr key={project.projectId}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{project.projectName}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatDate(project.createdAt)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatDate(project.lastUpdated)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                    <button
                      onClick={() => viewFiles(project.projectId)}
                      disabled={loadingFilesProjectId === project.projectId}
                      style={{
                        padding: '5px 10px',
                        marginRight: '5px',
                        background: loadingFilesProjectId === project.projectId ? '#BA68C8' : '#9C27B0',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loadingFilesProjectId === project.projectId ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {loadingFilesProjectId === project.projectId ? (
                        <><span style={{ marginRight: '5px' }}>⏳</span>Loading...</>
                      ) : (
                        'View Files'
                      )}
                    </button>
                    <button
                      onClick={() => downloadProject(project.projectId)}
                      disabled={downloadingProjectId === project.projectId}
                      style={{
                        padding: '5px 10px',
                        background: downloadingProjectId === project.projectId ? '#FFB74D' : '#FF9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: downloadingProjectId === project.projectId ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {downloadingProjectId === project.projectId ? (
                        <><span style={{ marginRight: '5px' }}>⏳</span>Downloading...</>
                      ) : (
                        'Download ZIP'
                      )}
                    </button>
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                    <button
                      onClick={() => showDeleteConfirmation(project.projectId, project.projectName)}
                      disabled={deletingProjectId === project.projectId}
                      style={{
                        padding: '5px 10px',
                        background: deletingProjectId === project.projectId ? '#f44336' : '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: deletingProjectId === project.projectId ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {deletingProjectId === project.projectId ? (
                        <><span style={{ marginRight: '5px' }}>⏳</span>Deleting...</>
                      ) : (
                        '🗑️ Delete'
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderFileTrackingView = () => {

    return (
      <div>
        <h1>📊 File Tracking Dashboard</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Monitor which files are sent to AI during project operations. Tracks all AI interactions and the files processed.
        </p>

        {/* Statistics Overview */}
        {fileTrackingStats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{
              background: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              padding: '15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#007bff' }}>
                {loadingStats ? '...' : fileTrackingStats.totalEntries}
              </div>
              <div style={{ color: '#666', fontSize: '0.9em' }}>Total Entries</div>
            </div>
            <div style={{
              background: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              padding: '15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#28a745' }}>
                {loadingStats ? '...' : fileTrackingStats.uniqueProjects}
              </div>
              <div style={{ color: '#666', fontSize: '0.9em' }}>Projects</div>
            </div>
            <div style={{
              background: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              padding: '15px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#6f42c1' }}>
                {loadingStats ? '...' : fileTrackingStats.totalFilesTracked}
              </div>
              <div style={{ color: '#666', fontSize: '0.9em' }}>Files Processed</div>
            </div>
            <div style={{
              background: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              padding: '15px',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '1.2em',
                fontWeight: 'bold',
                color: '#dc3545',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {loadingStats ? '...' : (fileTrackingStats.operationsByType && Object.keys(fileTrackingStats.operationsByType).length > 0
                  ? Object.keys(fileTrackingStats.operationsByType).join(', ')
                  : 'None')}
              </div>
              <div style={{ color: '#666', fontSize: '0.9em' }}>Operations</div>
            </div>
          </div>
        )}

        {/* Filters and Export */}
        <div style={{
          display: 'flex',
          gap: '15px',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '15px',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Project ID:</label>
            <input
              type="text"
              placeholder="Filter by project ID..."
              value={trackingFilters.projectId}
              onChange={(e) => setTrackingFilters({...trackingFilters, projectId: e.target.value})}
              style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Operation:</label>
            <select
              value={trackingFilters.operation}
              onChange={(e) => setTrackingFilters({...trackingFilters, operation: e.target.value})}
              style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '120px' }}
            >
              <option value="">All Operations</option>
              {fileTrackingStats?.operationsByType && Object.keys(fileTrackingStats.operationsByType).map(op => (
                <option key={op} value={op}>{op} ({fileTrackingStats.operationsByType[op]})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Limit:</label>
            <select
              value={trackingFilters.limit}
              onChange={(e) => setTrackingFilters({...trackingFilters, limit: Number(e.target.value)})}
              style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
            <button
              onClick={() => exportFileTrackingData('json')}
              style={{
                padding: '8px 16px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              📄 Export JSON
            </button>
            <button
              onClick={() => exportFileTrackingData('csv')}
              style={{
                padding: '8px 16px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              📊 Export CSV
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ border: '1px solid #dee2e6', borderRadius: '8px', overflow: 'hidden' }}>
          {loadingTracking ? (
            <div style={{
              padding: '50px',
              textAlign: 'center',
              background: '#f8f9fa',
              color: '#666'
            }}>
              ⏳ Loading file tracking data...
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ border: '1px solid #dee2e6', padding: '12px 15px', textAlign: 'left', fontWeight: 'bold' }}>Timestamp</th>
                  <th style={{ border: '1px solid #dee2e6', padding: '12px 15px', textAlign: 'left', fontWeight: 'bold' }}>Operation</th>
                  <th style={{ border: '1px solid #dee2e6', padding: '12px 15px', textAlign: 'left', fontWeight: 'bold' }}>Project ID</th>
                  <th style={{ border: '1px solid #dee2e6', padding: '12px 15px', textAlign: 'right', fontWeight: 'bold' }}>Files Sent</th>
                  <th style={{ border: '1px solid #dee2e6', padding: '12px 15px', textAlign: 'right', fontWeight: 'bold' }}>Total Project Files</th>
                  <th style={{ border: '1px solid #dee2e6', padding: '12px 15px', textAlign: 'left', fontWeight: 'bold' }}>File Names</th>
                </tr>
              </thead>
              <tbody>
                {fileTrackingData && fileTrackingData.entries.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: '#666',
                      background: '#f8f9fa',
                      fontStyle: 'italic'
                    }}>
                      No file tracking entries found. Generate some projects to see data here.
                    </td>
                  </tr>
                ) : (
                  fileTrackingData?.entries.map((entry, index) => (
                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa' }}>
                      <td style={{ border: '1px solid #dee2e6', padding: '12px 15px', fontFamily: 'monospace', fontSize: '0.9em' }}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                      <td style={{ border: '1px solid #dee2e6', padding: '12px 15px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.8em',
                          background: entry.operation.includes('targeted') ? '#28a745' : '#007bff',
                          color: 'white'
                        }}>
                          {entry.operation}
                        </span>
                      </td>
                      <td style={{ border: '1px solid #dee2e6', padding: '12px 15px', fontFamily: 'monospace', fontSize: '0.9em' }}>
                        {entry.projectId.slice(0, 8)}...
                      </td>
                      <td style={{ border: '1px solid #dee2e6', padding: '12px 15px', textAlign: 'right', fontWeight: 'bold' }}>
                        {entry.fileCount}
                      </td>
                      <td style={{ border: '1px solid #dee2e6', padding: '12px 15px', textAlign: 'right', fontWeight: 'bold' }}>
                        {entry.totalFileCount || 0}
                      </td>
                      <td style={{
                        border: '1px solid #dee2e6',
                        padding: '12px 15px',
                        fontSize: '0.9em',
                        cursor: entry.fileNames.length > 0 ? 'pointer' : 'default'
                      }}
                      onClick={entry.fileNames.length > 0 ? () => setFileNamesModal({ show: true, entry }) : undefined}
                      onMouseEnter={(e) => entry.fileNames.length > 0 && (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                      onMouseLeave={(e) => entry.fileNames.length > 0 && (e.currentTarget.style.backgroundColor = '')}
                      title={entry.fileNames.length > 3 ? `Click to see all ${entry.fileNames.length} files` : ''}>
                        <div style={{
                          maxHeight: '60px',
                          overflowY: entry.fileNames.length > 3 ? 'auto' : 'visible',
                          fontFamily: 'monospace'
                        }}>
                          {entry.fileNames.slice(0, 3).map((file: any, fileIndex: any) => (
                            <div key={fileIndex} style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '300px'
                            }}>
                              📄 {file}
                            </div>
                          ))}
                          {entry.fileNames.length > 3 && (
                            <div style={{ color: '#007bff', fontStyle: 'italic', marginTop: '2px' }}>
                              ...click to see all {entry.fileNames.length} files
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {fileTrackingData?.hasMore && (
          <div style={{ textAlign: 'center', marginTop: '15px', color: '#666' }}>
            Showing first {fileTrackingData.limit} entries. Use filters to see more.
          </div>
        )}
      </div>
    );
  };

  const renderFileNamesModal = () => (
    fileNamesModal?.show && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
          maxWidth: '600px',
          maxHeight: '80vh',
          width: '90%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '15px', color: '#2c3e50', borderBottom: '2px solid #f8f9fa', paddingBottom: '10px' }}>
            📂 All Files Processed ({fileNamesModal.entry.fileCount} files)
          </h2>

          <div style={{ marginBottom: '15px', fontSize: '0.9em', color: '#666' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <strong style={{ marginRight: '10px' }}>Operation:</strong>
              <span style={{
                padding: '3px 8px',
                borderRadius: '4px',
                background: fileNamesModal.entry.operation.includes('targeted') ? '#28a745' : '#007bff',
                color: 'white',
                fontSize: '0.8em'
              }}>
                {fileNamesModal.entry.operation}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <strong style={{ marginRight: '10px' }}>Project:</strong>
              <span style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>
                {fileNamesModal.entry.projectId}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <strong style={{ marginRight: '10px' }}>Timestamp:</strong>
              <span style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>
                {new Date(fileNamesModal.entry.timestamp).toLocaleString()}
              </span>
            </div>
          </div>

          <div style={{
            flex: 1,
            border: '1px solid #e9ecef',
            borderRadius: '6px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            overflowY: 'auto',
            maxHeight: '400px'
          }}>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              fontFamily: 'monospace',
              fontSize: '0.9em'
            }}>
              {fileNamesModal.entry.fileNames.map((fileName: string, index: number) => (
                <li key={index} style={{
                  padding: '8px 12px',
                  marginBottom: '4px',
                  backgroundColor: index % 2 === 0 ? 'white' : '#f1f3f4',
                  borderRadius: '4px',
                  borderLeft: '3px solid #007bff'
                }}>
                  📄 {fileName}
                </li>
              ))}
            </ul>
          </div>

          <div style={{
            marginTop: '20px',
            paddingTop: '15px',
            borderTop: '1px solid #e9ecef',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '0.9em', color: '#666' }}>
              Total: <strong>{fileNamesModal.entry.fileCount}</strong> files sent to AI
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  const fileNamesText = fileNamesModal.entry.fileNames.join('\n');
                  navigator.clipboard.writeText(fileNamesText).then(() => {
                    alert('File names copied to clipboard!');
                  });
                }}
                style={{
                  padding: '8px 16px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9em'
                }}
              >
                📋 Copy All
              </button>
              <button
                onClick={() => setFileNamesModal(null)}
                style={{
                  padding: '8px 16px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9em'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {renderNavigation()}

      {currentView === 'projects' ? renderProjectsView() : renderFileTrackingView()}

      {/* File Names Modal */}
      {renderFileNamesModal()}
    </div>
  );
}

export default App;
