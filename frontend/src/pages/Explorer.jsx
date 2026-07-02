import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Folder,
  File,
  Search,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Code,
  Network,
  GitFork,
  ArrowRight,
  Database,
  Grid,
  RefreshCw,
  Info,
  Layers,
  Sparkles,
  Send,
  Lock,
  Zap,
  TrendingUp,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react'
import { getProjects, getArchitecture, getFileContent, getFileInsights } from '../api/projects'
import { streamAIResponse } from '../api/chat'
import { cn } from '../utils/cn'

export default function Explorer() {
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [treeData, setTreeData] = useState(null)
  const [expandedFolders, setExpandedFolders] = useState({})
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileContent, setFileContent] = useState(null)
  const [fileInsights, setFileInsights] = useState(null)
  
  // Search & Navigation
  const [fileSearch, setFileSearch] = useState('')
  const [codeSearch, setCodeSearch] = useState('')
  const [activeTab, setActiveTab] = useState('code')
  
  // Diagram zoom & interaction states
  const [zoomLevel, setZoomLevel] = useState(1)
  const [selectedDiagramNode, setSelectedDiagramNode] = useState(null)
  
  // Right panel AI Chat
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [isChatStreaming, setIsChatStreaming] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const chatEndRef = useRef(null)

  // Loading states
  const [isTreeLoading, setIsTreeLoading] = useState(false)
  const [isFileLoading, setIsFileLoading] = useState(false)
  const [isInsightsLoading, setIsInsightsLoading] = useState(false)

  // Copy success indicator
  const [copiedCode, setCopiedCode] = useState(false)

  // Load Projects on mount
  useEffect(() => {
    getProjects().then((data) => {
      setProjects(data)
      if (data && data.length > 0) {
        setSelectedProjectId(data[0].id)
      }
    })
  }, [])

  // Load Tree when selected project changes
  useEffect(() => {
    if (!selectedProjectId) return
    setIsTreeLoading(true)
    getArchitecture(selectedProjectId)
      .then((data) => {
        setTreeData(data)
        // Automatically expand the root folder
        if (data && data.id) {
          setExpandedFolders({ [data.id]: true })
        }
      })
      .finally(() => setIsTreeLoading(false))
  }, [selectedProjectId])

  // Scroll to end of chat messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, streamingMessage])

  // Handle file select
  const handleFileSelect = (filePath) => {
    setSelectedFile(filePath)
    setIsFileLoading(true)
    setIsInsightsLoading(true)
    
    // Reset local code search & right chat
    setCodeSearch('')
    setChatMessages([
      {
        role: 'assistant',
        content: `I'm ready to analyze **${filePath.split('/').pop()}**. Ask me any questions about its structure, dependencies, or refactoring options.`
      }
    ])

    // Load file details
    getFileContent(selectedProjectId, filePath)
      .then((data) => {
        setFileContent(data)
      })
      .catch((err) => {
        setFileContent({
          name: filePath.split('/').pop(),
          path: filePath,
          content: `⚠️ Failed to communicate with server to load code file:\n${err.message || 'Check project extract status.'}`,
          size: 0,
          last_modified: new Date().toISOString(),
          language: 'plaintext'
        })
      })
      .finally(() => setIsFileLoading(false))

    // Load file AI insights
    getFileInsights(selectedProjectId, filePath)
      .then((data) => {
        setFileInsights(data)
      })
      .finally(() => setIsInsightsLoading(false))
  }

  // Copy code to clipboard
  const handleCopyCode = () => {
    if (!fileContent?.content) return
    navigator.clipboard.writeText(fileContent.content)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  // Handle AI Chat submit
  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!chatInput.trim() || isChatStreaming) return

    const userMessage = chatInput
    setChatInput('')
    setChatMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsChatStreaming(true)

    // Build context prompt
    const promptContext = `
      File: ${selectedFile || 'No file selected'}
      Code Context:
      ${fileContent?.content ? fileContent.content.slice(0, 4000) : 'No file content available.'}
      
      User query: ${userMessage}
    `
    
    let accumulatedText = ''
    try {
      // Stream response using the global chat streamer helper
      for await (const chunk of streamAIResponse(selectedProjectId, promptContext)) {
        accumulatedText = chunk
        setStreamingMessage(chunk)
      }
      setChatMessages((prev) => [...prev, { role: 'assistant', content: accumulatedText }])
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ **Failed to request insights:** ${err.message || 'Check your Gemini key setup.'}` }
      ])
    } finally {
      setIsChatStreaming(false)
      setStreamingMessage('')
    }
  }

  // Toggle tree folder visibility
  const toggleFolder = (folderId) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId]
    }))
  }

  // Filter file tree nodes recursively
  const filterTree = (node, search) => {
    if (!node) return null
    const matchesSearch = node.name.toLowerCase().includes(search.toLowerCase())
    
    if (node.children) {
      const filteredChildren = node.children
        .map((child) => filterTree(child, search))
        .filter(Boolean)
      if (filteredChildren.length > 0 || matchesSearch) {
        return { ...node, children: filteredChildren }
      }
    } else if (matchesSearch) {
      return node
    }
    return null
  }

  const filteredTreeData = treeData && fileSearch 
    ? filterTree(treeData, fileSearch) 
    : treeData

  // File tree rendering component
  const renderTreeNodes = (node, depth = 0, parentPath = '') => {
    if (!node) return null
    
    // Build path: omit the root node's name (depth === 0) so relative paths are correct.
    const currentPath = depth === 0 
      ? '' 
      : (parentPath ? `${parentPath}/${node.name}` : node.name)

    const isFolder = node.children && node.children.length > 0
    const isExpanded = expandedFolders[node.id]
    const isSelected = selectedFile === currentPath

    return (
      <div key={node.id} className="select-none">
        <div
          onClick={() => {
            if (isFolder) {
              toggleFolder(node.id)
            } else {
              handleFileSelect(currentPath)
            }
          }}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          className={cn(
            "flex items-center gap-2 py-1.5 pr-2 text-xs font-medium border-l border-transparent hover:bg-[#1C2128] hover:text-[#58A6FF] transition-all duration-100 cursor-pointer group",
            isSelected ? "bg-[#1C2128] text-[#58A6FF] border-l-2 border-l-[#58A6FF]" : "text-[#8B949E]"
          )}
        >
          <span className="shrink-0">
            {isFolder ? (
              isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-[#8B949E]" /> : <ChevronRight className="h-3.5 w-3.5 text-[#8B949E]" />
            ) : (
              <File className="h-3.5 w-3.5 text-[#8B949E] group-hover:text-[#58A6FF] shrink-0" />
            )}
          </span>
          {isFolder && <Folder className="h-3.5 w-3.5 text-[#58A6FF] fill-[#58A6FF]/10 shrink-0" />}
          <span className="truncate">{node.name}</span>
        </div>
        
        {isFolder && isExpanded && node.children && (
          <div className="overflow-hidden">
            {node.children.map((child) => renderTreeNodes(child, depth + 1, currentPath))}
          </div>
        )}
      </div>
    )
  }

  // Highlight search queries in code lines
  const renderCodeLines = () => {
    if (!fileContent?.content) return null
    const lines = fileContent.content.split('\n')
    
    return lines.map((line, idx) => {
      const isMatch = codeSearch && line.toLowerCase().includes(codeSearch.toLowerCase())
      return (
        <div 
          key={idx} 
          className={cn(
            "flex text-xs font-mono py-0.5 leading-5 hover:bg-[#1C2128] transition-colors",
            isMatch ? "bg-[#D29922]/20 border-l border-[#D29922]" : ""
          )}
        >
          <span className="w-10 text-right pr-4 text-[#8B949E] select-none text-[10px] shrink-0 border-r border-[#30363D]">{idx + 1}</span>
          <span className="pl-4 pr-2 text-[#E6EDF3] whitespace-pre-wrap break-all">{line}</span>
        </div>
      )
    })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] overflow-hidden rounded-xl border border-[#30363D] bg-[#0D1117] shadow-2xl">
      
      {/* 1. Header Toolbar */}
      <header className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 py-3 bg-[#161B22] border-b border-[#30363D] shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Layers className="h-5 w-5 text-[#58A6FF] animate-pulse" />
          <div>
            <h1 className="text-sm font-semibold text-[#E6EDF3] leading-none">Project Explorer & Visualization</h1>
            <p className="text-[10px] text-[#8B949E] mt-0.5">Enterprise engineering assistant workspace</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#8B949E] font-medium hidden md:inline">Project:</span>
          <select
            value={selectedProjectId || ''}
            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            className="px-2.5 py-1.5 text-xs rounded bg-[#1C2128] border border-[#30363D] text-[#E6EDF3] hover:border-[#58A6FF] focus:outline-none transition-colors cursor-pointer"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* PANEL LEFT: Repository File Tree */}
        <aside className="w-64 border-r border-[#30363D] bg-[#0D1117] flex flex-col shrink-0 overflow-hidden">
          <div className="p-3 border-b border-[#30363D] bg-[#161B22]/50 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#8B949E]" />
              <input
                type="text"
                placeholder="Find files..."
                value={fileSearch}
                onChange={(e) => setFileSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#1C2128] border border-[#30363D] text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-[#58A6FF] transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
            {isTreeLoading ? (
              <div className="p-4 space-y-2.5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2 animate-pulse">
                    <div className="h-4 w-4 bg-[#1C2128] rounded" />
                    <div className="h-3 bg-[#1C2128] rounded w-full" style={{ width: `${60 + (i % 3) * 15}%` }} />
                  </div>
                ))}
              </div>
            ) : filteredTreeData ? (
              renderTreeNodes(filteredTreeData)
            ) : (
              <div className="p-4 text-center text-xs text-[#8B949E]">
                No files indexed. Drag and drop project zip.
              </div>
            )}
          </div>
        </aside>

        {/* PANEL CENTER: Code Inspector & Diagrams */}
        <main className="flex-1 flex flex-col bg-[#0D1117] overflow-hidden">
          
          {/* Tabs bar */}
          <div className="flex items-center justify-between border-b border-[#30363D] bg-[#161B22] shrink-0 overflow-x-auto select-none no-scrollbar">
            <div className="flex">
              {[
                { id: 'code', label: 'Code', icon: Code },
                { id: 'tree', label: 'File Tree', icon: Layers },
                { id: 'architecture', label: 'System Map', icon: Network },
                { id: 'dependencies', label: 'Dependencies', icon: GitFork },
                { id: 'apiflow', label: 'API Flow', icon: ArrowRight },
                { id: 'er', label: 'ER Diagram', icon: Database },
                { id: 'class', label: 'Class UML', icon: Grid },
                { id: 'sequence', label: 'Sequence Flow', icon: RefreshCw },
                { id: 'callgraph', label: 'Call Graph', icon: Sliders },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      setSelectedDiagramNode(null)
                    }}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
                      activeTab === tab.id
                        ? "border-[#58A6FF] text-[#E6EDF3] bg-[#1C2128]/50"
                        : "border-transparent text-[#8B949E] hover:text-[#E6EDF3]"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
            
            {/* Zoom Controls */}
            {activeTab !== 'code' && (
              <div className="flex items-center gap-1 px-3">
                <button 
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.15))}
                  className="p-1 text-[#8B949E] hover:text-[#E6EDF3] transition-colors rounded hover:bg-[#1C2128]"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="text-[10px] font-mono text-[#8B949E] w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
                <button 
                  onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}
                  className="p-1 text-[#8B949E] hover:text-[#E6EDF3] transition-colors rounded hover:bg-[#1C2128]"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => { setZoomLevel(1); setSelectedDiagramNode(null); }}
                  className="p-1 text-[#8B949E] hover:text-[#E6EDF3] transition-colors rounded hover:bg-[#1C2128]"
                  title="Reset View"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Tab Viewer Content */}
          <div className="flex-1 overflow-hidden relative">
            
            {/* CODE VIEWER TAB */}
            {activeTab === 'code' && (
              <div className="h-full flex flex-col overflow-hidden">
                {selectedFile ? (
                  <>
                    {/* Code Toolbar */}
                    <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-[#30363D] bg-[#161B22]/30 shrink-0 text-xs text-[#8B949E]">
                      <div className="flex items-center gap-1.5 truncate">
                        <Code className="h-3.5 w-3.5 text-[#58A6FF]" />
                        <span className="font-mono text-[#E6EDF3] select-all">{selectedFile}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-3 w-3 text-[#8B949E]" />
                          <input
                            type="text"
                            placeholder="Find inside file..."
                            value={codeSearch}
                            onChange={(e) => setCodeSearch(e.target.value)}
                            className="pl-7 pr-2.5 py-1 text-[11px] rounded bg-[#1C2128] border border-[#30363D] text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-[#58A6FF]"
                          />
                        </div>
                        <button
                          onClick={handleCopyCode}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1C2128] border border-[#30363D] text-[#E6EDF3] hover:border-[#58A6FF] transition-colors cursor-pointer"
                        >
                          {copiedCode ? (
                            <>
                              <Check className="h-3 w-3 text-[#3FB950]" />
                              <span className="text-[#3FB950]">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Code Container */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar font-mono bg-[#0D1117] py-3">
                      {isFileLoading ? (
                        <div className="p-4 space-y-2">
                          {[...Array(12)].map((_, i) => (
                            <div key={i} className="h-4 bg-[#1C2128] rounded animate-pulse w-full" style={{ width: `${80 + (i % 5) * 4}%` }} />
                          ))}
                        </div>
                      ) : (
                        renderCodeLines()
                      )}
                    </div>

                    {/* Code Metadata Footer */}
                    {fileContent && (
                      <div className="flex items-center justify-between gap-4 px-4 py-2 border-t border-[#30363D] bg-[#161B22]/50 shrink-0 text-[10px] text-[#8B949E] font-mono select-none">
                        <div className="flex items-center gap-3">
                          <span>Size: <b className="text-[#E6EDF3]">{(fileContent.size / 1024).toFixed(2)} KB</b></span>
                          <span>Lang: <b className="text-[#E6EDF3] capitalize">{fileContent.language}</b></span>
                        </div>
                        <span>Last Modified: <b className="text-[#E6EDF3]">{new Date(fileContent.last_modified).toLocaleString()}</b></span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-[#0D1117] text-[#8B949E]">
                    <div className="h-12 w-12 rounded-full border border-dashed border-[#30363D] flex items-center justify-center mb-3">
                      <Folder className="h-6 w-6 text-[#8B949E]" />
                    </div>
                    <p className="text-xs font-semibold text-[#E6EDF3]">No File Selected</p>
                    <p className="text-[10px] max-w-xs mt-1">Browse the directory tree on the left panel to open and analyze files.</p>
                  </div>
                )}
              </div>
            )}

            {/* DIAGRAMS AND VISUALIZATION ENGINE */}
            {activeTab !== 'code' && (
              <div className="h-full w-full overflow-auto bg-[#0D1117] flex items-center justify-center p-6 relative select-none">
                
                {/* Outer Scale Container */}
                <div 
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }} 
                  className="transition-transform duration-100 ease-out flex flex-col items-center gap-8 min-w-[700px] py-8"
                >
                  
                  {/* VISUALIZATION 1: REPOSITORY TREE DIAGRAM */}
                  {activeTab === 'tree' && (
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 rounded-xl border border-[#30363D] bg-[#1C2128] text-center shadow-lg min-w-[150px]">
                        <span className="text-xs font-bold text-[#58A6FF] uppercase">Root Workspace</span>
                        <h4 className="text-sm font-semibold text-[#E6EDF3] mt-1">{treeData?.name || 'project'}</h4>
                      </div>
                      
                      {/* Connecting Line */}
                      <div className="h-8 w-0.5 bg-[#30363D]" />
                      
                      <div className="flex gap-12 justify-center items-start">
                        {treeData?.children?.slice(0, 4).map((child) => (
                          <div key={child.id} className="flex flex-col items-center">
                            <div 
                              onClick={() => setSelectedDiagramNode(child.id)}
                              className={cn(
                                "p-3 rounded-lg border text-center cursor-pointer transition-all duration-100 shadow-md",
                                selectedDiagramNode === child.id 
                                  ? "border-[#58A6FF] bg-[#58A6FF]/10 ring-2 ring-[#58A6FF]/20" 
                                  : "border-[#30363D] bg-[#161B22] hover:border-[#58A6FF]/50"
                              )}
                            >
                              <span className="text-[10px] font-mono text-[#8B949E] uppercase">{child.type}</span>
                              <p className="text-xs font-semibold text-[#E6EDF3] mt-0.5">{child.name}</p>
                            </div>
                            
                            {child.children && child.children.length > 0 && (
                              <>
                                <div className="h-6 w-0.5 bg-[#30363D]" />
                                <div className="flex flex-col gap-2 border-l border-[#30363D] pl-3 py-1">
                                  {child.children.slice(0, 3).map((sub) => (
                                    <div key={sub.id} className="flex items-center gap-1.5">
                                      <div className="h-1.5 w-1.5 rounded-full bg-[#58A6FF]" />
                                      <span className="text-[10px] font-mono text-[#8B949E]">{sub.name}</span>
                                    </div>
                                  ))}
                                  {child.children.length > 3 && (
                                    <span className="text-[9px] text-[#8B949E] font-mono italic">+{child.children.length - 3} items</span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* VISUALIZATION 2: SYSTEM ARCHITECTURE MAP */}
                  {activeTab === 'architecture' && (
                    <div className="flex flex-col gap-5 items-center w-full max-w-[600px]">
                      {[
                        { id: 'client', label: 'Client / Interface', detail: 'React Single Page App', color: 'border-[#58A6FF]' },
                        { id: 'api', label: 'API Layer', detail: 'Django REST Framework Gateway', color: 'border-[#3FB950]' },
                        { id: 'services', label: 'Business Logic Core', detail: 'Authentication & RAG Pipeline', color: 'border-[#D29922]' },
                        { id: 'db', label: 'Persistence Layer', detail: 'ChromaDB Vector DB + XAMPP MySQL', color: 'border-[#F85149]' }
                      ].map((tier, idx) => (
                        <div key={tier.id} className="flex flex-col items-center w-full">
                          <div 
                            className={cn(
                              "w-full px-5 py-4 rounded-xl border bg-[#161B22] flex items-center justify-between shadow-xl transition-all hover:scale-102",
                              tier.color
                            )}
                          >
                            <div>
                              <span className="text-[9px] font-bold text-[#8B949E] uppercase tracking-wider">Tier {idx + 1}</span>
                              <h4 className="text-sm font-semibold text-[#E6EDF3] mt-0.5">{tier.label}</h4>
                              <p className="text-[10px] text-[#8B949E] mt-0.5">{tier.detail}</p>
                            </div>
                            <div className="h-7 w-7 rounded bg-[#1C2128] border border-[#30363D] flex items-center justify-center">
                              <Layers className="h-3.5 w-3.5 text-[#8B949E]" />
                            </div>
                          </div>
                          {idx < 3 && (
                            <div className="flex flex-col items-center py-2">
                              <div className="h-5 w-0.5 bg-[#30363D] border-dashed border-[#30363D]" />
                              <ChevronDown className="h-3.5 w-3.5 text-[#8B949E] -mt-1" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* VISUALIZATION 3: MODULE DEPENDENCY DIAGRAM */}
                  {activeTab === 'dependencies' && (
                    <div className="flex flex-col items-center gap-6">
                      <p className="text-xs text-[#8B949E]">Click on a module to highlight import pathways</p>
                      
                      <div className="grid grid-cols-2 gap-8 items-center max-w-[500px]">
                        {[
                          { id: 'frontend', name: 'Frontend App', imports: ['auth', 'chat', 'projects'] },
                          { id: 'chat', name: 'chat.services.ai', imports: ['settings'] },
                          { id: 'projects', name: 'projects.services', imports: ['embeddings', 'indexer'] },
                          { id: 'db', name: 'django.db.mysql', imports: [] }
                        ].map((mod) => {
                          const isSelected = selectedDiagramNode === mod.id
                          const isImported = selectedDiagramNode && 
                            [mod.id, ...mod.imports].includes(selectedDiagramNode)

                          return (
                            <div 
                              key={mod.id}
                              onClick={() => setSelectedDiagramNode(mod.id)}
                              className={cn(
                                "p-4 rounded-xl border text-left cursor-pointer transition-all shadow-lg",
                                isSelected ? "border-[#58A6FF] bg-[#58A6FF]/10 ring-2 ring-[#58A6FF]/20" :
                                isImported ? "border-[#3FB950] bg-[#3FB950]/5" :
                                "border-[#30363D] bg-[#161B22] hover:border-[#8B949E]/50"
                              )}
                            >
                              <h4 className="text-xs font-bold text-[#E6EDF3]">{mod.name}</h4>
                              <div className="mt-2 space-y-1">
                                {mod.imports.length > 0 ? (
                                  mod.imports.map((imp) => (
                                    <span key={imp} className="inline-block text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1C2128] border border-[#30363D] text-[#8B949E] mr-1">
                                      {imp}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[9px] text-[#8B949E] italic">No dependencies</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* VISUALIZATION 4: API FLOW DIAGRAM */}
                  {activeTab === 'apiflow' && (
                    <div className="flex flex-col items-center w-full max-w-[600px] gap-3">
                      {[
                        { step: '1', title: 'React UI Trigger', detail: 'Chat input dispatch', extra: 'sendMessage(convId, content)' },
                        { step: '2', title: 'Django View Endpoint', detail: 'views_stream.py Router', extra: 'POST /api/chat/stream/' },
                        { step: '3', title: 'Gemini Chat Client', detail: 'ai.py Service Request', extra: 'streamGenerateContent?alt=sse' },
                        { step: '4', title: 'Database Logging', detail: 'MySQL ORM Sync', extra: 'Message.objects.create()' },
                        { step: '5', title: 'Client SSE Stream', detail: 'Dynamic Token Render', extra: 'chunk update render' }
                      ].map((item, idx) => (
                        <div key={item.step} className="flex flex-col items-center w-full">
                          <div className="w-full flex gap-4 items-center bg-[#161B22] border border-[#30363D] p-3 rounded-lg hover:border-[#58A6FF] transition-all">
                            <span className="h-6 w-6 rounded-full bg-[#1C2128] border border-[#30363D] text-xs font-bold text-[#58A6FF] flex items-center justify-center shrink-0">
                              {item.step}
                            </span>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-semibold text-[#E6EDF3] leading-none">{item.title}</h4>
                              <p className="text-[10px] text-[#8B949E] mt-1">{item.detail}</p>
                            </div>
                            <span className="text-[9px] font-mono text-[#8B949E] bg-[#1C2128] border border-[#30363D] px-2 py-0.5 rounded">
                              {item.extra}
                            </span>
                          </div>
                          {idx < 4 && (
                            <div className="h-4 w-0.5 bg-[#58A6FF] border-dashed border-[#58A6FF]" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* VISUALIZATION 5: DATABASE ER DIAGRAM */}
                  {activeTab === 'er' && (
                    <div className="flex gap-8 flex-wrap justify-center items-start max-w-[650px]">
                      {[
                        { 
                          name: 'projects_project', 
                          fields: [
                            { name: 'id', key: 'PK', type: 'bigint' },
                            { name: 'name', key: '', type: 'varchar(255)' },
                            { name: 'total_files', key: '', type: 'integer' }
                          ]
                        },
                        { 
                          name: 'projects_projectfile', 
                          fields: [
                            { name: 'id', key: 'PK', type: 'bigint' },
                            { name: 'project_id', key: 'FK', type: 'bigint' },
                            { name: 'file_type', key: '', type: 'varchar(10)' }
                          ]
                        },
                        { 
                          name: 'chat_conversation', 
                          fields: [
                            { name: 'id', key: 'PK', type: 'bigint' },
                            { name: 'project_id', key: 'FK', type: 'bigint' },
                            { name: 'title', key: '', type: 'varchar(255)' }
                          ]
                        }
                      ].map((table) => (
                        <div key={table.name} className="rounded-lg border border-[#30363D] bg-[#161B22] overflow-hidden min-w-[200px] shadow-lg">
                          <div className="px-3 py-1.5 bg-[#1C2128] border-b border-[#30363D] text-[11px] font-bold text-[#E6EDF3] font-mono flex items-center gap-1.5">
                            <Database className="h-3 w-3 text-[#3FB950]" />
                            {table.name}
                          </div>
                          <div className="p-2 space-y-1 font-mono text-[10px]">
                            {table.fields.map((f) => (
                              <div key={f.name} className="flex justify-between gap-4 py-0.5">
                                <span className="flex items-center gap-1">
                                  {f.key && <span className="text-[9px] font-bold text-[#D29922]">{f.key}</span>}
                                  <span className="text-[#E6EDF3]">{f.name}</span>
                                </span>
                                <span className="text-[#8B949E]">{f.type}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* VISUALIZATION 6: CLASS UML DIAGRAM */}
                  {activeTab === 'class' && (
                    <div className="flex flex-col items-center gap-6">
                      <p className="text-xs text-[#8B949E]">Unified Class UML Diagram</p>
                      
                      <div className="flex gap-12 justify-center items-center relative">
                        {/* Class 1: Project (Model) */}
                        <div className="border border-[#30363D] bg-[#161B22] rounded-lg overflow-hidden min-w-[200px] shadow-xl text-left">
                          <div className="p-2 bg-[#1C2128] border-b border-[#30363D] text-[10px] font-bold text-[#E6EDF3] text-center font-mono">
                            Project
                          </div>
                          <div className="p-2 border-b border-[#30363D] space-y-1 font-mono text-[9px] text-[#8B949E]">
                            <div>- name: string</div>
                            <div>- total_files: int</div>
                          </div>
                          <div className="p-2 space-y-1 font-mono text-[9px] text-[#E6EDF3]">
                            <div>+ get_all_files()</div>
                          </div>
                        </div>

                        {/* Connection Arrow */}
                        <div className="flex items-center gap-1 text-[#58A6FF] shrink-0">
                          <div className="h-0.5 w-8 bg-[#30363D]" />
                          <ChevronRight className="h-4 w-4 -ml-2" />
                        </div>

                        {/* Class 2: ProjectFile (Model) */}
                        <div className="border border-[#30363D] bg-[#161B22] rounded-lg overflow-hidden min-w-[200px] shadow-xl text-left">
                          <div className="p-2 bg-[#1C2128] border-b border-[#30363D] text-[10px] font-bold text-[#E6EDF3] text-center font-mono">
                            ProjectFile
                          </div>
                          <div className="p-2 border-b border-[#30363D] space-y-1 font-mono text-[9px] text-[#8B949E]">
                            <div>- original_name: string</div>
                            <div>- file_type: string</div>
                          </div>
                          <div className="p-2 space-y-1 font-mono text-[9px] text-[#E6EDF3]">
                            <div>+ is_code_file()</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VISUALIZATION 7: SEQUENCE DIAGRAM */}
                  {activeTab === 'sequence' && (
                    <div className="border border-[#30363D] bg-[#161B22] p-6 rounded-xl shadow-lg min-w-[500px]">
                      <div className="flex justify-between px-6 border-b border-[#30363D] pb-3 text-xs font-semibold text-[#8B949E] font-mono">
                        <span>User Interface</span>
                        <span>Django Server</span>
                        <span>Gemini API</span>
                      </div>
                      
                      <div className="relative py-4 space-y-6 text-[10px] font-mono text-[#8B949E]">
                        
                        {/* Timeline vertical guide lines */}
                        <div className="absolute inset-y-0 left-[10%] border-l border-dashed border-[#30363D]" />
                        <div className="absolute inset-y-0 left-[50%] border-l border-dashed border-[#30363D]" />
                        <div className="absolute inset-y-0 right-[10%] border-r border-dashed border-[#30363D]" />
                        
                        <div className="flex items-center justify-between relative z-10">
                          <span className="w-1/3 text-left pl-4 text-[#58A6FF]">1. POST /api/chat/stream/</span>
                          <ArrowRight className="h-3 w-3 text-[#58A6FF]" />
                          <span className="w-1/3 text-right pr-4" />
                        </div>
                        
                        <div className="flex items-center justify-between relative z-10">
                          <span className="w-1/3" />
                          <span className="w-1/3 text-center text-[#3FB950]">2. Format Prompt</span>
                          <ArrowRight className="h-3 w-3 text-[#3FB950]" />
                        </div>

                        <div className="flex items-center justify-between relative z-10">
                          <span className="w-1/3" />
                          <span className="w-1/3 text-right pr-2 text-[#D29922]">3. Send HTTP request</span>
                          <ArrowRight className="h-3 w-3 text-[#D29922]" />
                        </div>

                        <div className="flex items-center justify-between relative z-10">
                          <span className="w-1/3" />
                          <span className="w-1/3 text-right pr-2 text-[#E6EDF3]">4. Stream SSE token</span>
                          <ArrowRight className="h-3 w-3 text-[#E6EDF3] transform rotate-180" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VISUALIZATION 8: CALL GRAPH */}
                  {activeTab === 'callgraph' && (
                    <div className="flex flex-col items-center gap-4">
                      <p className="text-xs text-[#8B949E]">Interactive execution flow nodes</p>
                      
                      <div className="flex flex-col items-center">
                        <div className="p-3 bg-[#1C2128] border border-[#30363D] rounded-lg text-center font-mono text-xs text-[#E6EDF3]">
                          generate_chat_response_stream()
                        </div>
                        
                        <div className="h-6 w-0.5 bg-[#30363D]" />
                        
                        <div className="flex gap-8">
                          {[
                            { name: '_get_api_url()', detail: 'URL resolve' },
                            { name: '_format_messages()', detail: 'Role parser' }
                          ].map((f) => (
                            <div key={f.name} className="flex flex-col items-center">
                              <div className="p-3 bg-[#161B22] border border-[#30363D] rounded-lg text-center font-mono text-xs text-[#E6EDF3]">
                                {f.name}
                                <span className="block text-[9px] text-[#8B949E] mt-0.5">{f.detail}</span>
                              </div>
                              <div className="h-6 w-0.5 bg-[#30363D]" />
                              <div className="p-2.5 bg-[#1C2128] border border-[#30363D] rounded-md font-mono text-[9px] text-[#8B949E]">
                                return string
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        </main>

        {/* PANEL RIGHT: AI Assistant Insights */}
        <aside className="w-80 border-l border-[#30363D] bg-[#161B22]/40 flex flex-col shrink-0 overflow-hidden">
          <div className="p-4 border-b border-[#30363D] bg-[#161B22] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#58A6FF]" />
              <h2 className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider">AI Copilot Analysis</h2>
            </div>
            {isInsightsLoading && <RefreshCw className="h-3.5 w-3.5 text-[#58A6FF] animate-spin" />}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            
            {/* Insights Cards List */}
            {selectedFile ? (
              <>
                {/* 1. Summary Card */}
                <div className="p-3 rounded-lg border border-[#30363D] bg-[#1C2128] shadow-sm">
                  <h4 className="text-[11px] font-bold text-[#58A6FF] uppercase tracking-wider flex items-center gap-1">
                    <Info className="h-3 w-3" /> Summary
                  </h4>
                  <p className="text-xs text-[#8B949E] mt-1.5 leading-relaxed">
                    {isInsightsLoading ? "Loading AI analysis..." : fileInsights?.summary || "Analyzing file details..."}
                  </p>
                </div>

                {/* 2. Responsibilities Card */}
                <div className="p-3 rounded-lg border border-[#30363D] bg-[#1C2128] shadow-sm">
                  <h4 className="text-[11px] font-bold text-[#3FB950] uppercase tracking-wider flex items-center gap-1">
                    <Check className="h-3 w-3" /> Key Responsibilities
                  </h4>
                  <ul className="mt-2 space-y-1.5 list-disc list-inside text-xs text-[#8B949E]">
                    {isInsightsLoading ? (
                      <li className="animate-pulse">Loading items...</li>
                    ) : (
                      fileInsights?.responsibilities?.map((item, idx) => (
                        <li key={idx} className="leading-relaxed">{item}</li>
                      )) || <li>No responsibilities mapped.</li>
                    )}
                  </ul>
                </div>

                {/* 3. Complexity & Risks */}
                <div className="p-3 rounded-lg border border-[#30363D] bg-[#1C2128] shadow-sm">
                  <h4 className="text-[11px] font-bold text-[#D29922] uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="h-3 w-3" /> Metrics & Potential Bugs
                  </h4>
                  <div className="mt-2 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#8B949E]">Complexity:</span>
                      <span className="text-[#E6EDF3] font-semibold">{isInsightsLoading ? "Calculating..." : fileInsights?.complexity_score || "Low"}</span>
                    </div>
                    <div className="border-t border-[#30363D] pt-2">
                      <span className="text-[10px] font-bold text-[#F85149] uppercase">Identified Risks:</span>
                      <p className="text-[#8B949E] mt-1 leading-relaxed">
                        {isInsightsLoading ? "Scanning for bugs..." : fileInsights?.possible_bugs?.[0] || "No obvious bugs detected."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Refactoring Suggestions */}
                <div className="p-3 rounded-lg border border-[#30363D] bg-[#1C2128] shadow-sm">
                  <h4 className="text-[11px] font-bold text-[#58A6FF] uppercase tracking-wider flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Suggested Refactoring
                  </h4>
                  <p className="text-xs text-[#8B949E] mt-1.5 leading-relaxed">
                    {isInsightsLoading ? "Generating optimizations..." : fileInsights?.suggested_refactoring?.[0] || "Code follows recommended standards."}
                  </p>
                </div>
              </>
            ) : (
              <div className="h-32 flex items-center justify-center text-center text-xs text-[#8B949E] border border-dashed border-[#30363D] rounded-lg">
                Open a file to see static analysis
              </div>
            )}

            {/* Chat Assistant specifically for this file */}
            <div className="border-t border-[#30363D] pt-4 mt-6">
              <h3 className="text-xs font-bold text-[#E6EDF3] mb-3 uppercase tracking-wider">Chat with File Context</h3>
              
              <div className="h-48 border border-[#30363D] bg-[#0D1117] rounded-lg p-2.5 flex flex-col justify-between overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar text-[11px]">
                  {chatMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "p-2 rounded max-w-[85%] leading-relaxed",
                        msg.role === 'user' 
                          ? "bg-[#58A6FF]/10 border border-[#58A6FF]/20 text-[#E6EDF3] ml-auto text-right" 
                          : "bg-[#1C2128] border border-[#30363D] text-[#8B949E]"
                      )}
                    >
                      {msg.content}
                    </div>
                  ))}
                  {isChatStreaming && (
                    <div className="p-2 rounded bg-[#1C2128] border border-[#30363D] text-[#8B949E] max-w-[85%] animate-pulse">
                      {streamingMessage || "Thinking..."}
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleChatSubmit} className="flex gap-1.5 mt-2 pt-2 border-t border-[#30363D] shrink-0">
                  <input
                    type="text"
                    disabled={!selectedFile || isChatStreaming}
                    placeholder={selectedFile ? "Ask about code..." : "Select a file first..."}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 px-2 py-1 bg-[#1C2128] border border-[#30363D] text-xs text-[#E6EDF3] placeholder-[#8B949E] rounded focus:outline-none focus:border-[#58A6FF]"
                  />
                  <button
                    type="submit"
                    disabled={!selectedFile || !chatInput.trim() || isChatStreaming}
                    className="p-1 rounded bg-[#58A6FF] text-[#0D1117] hover:bg-[#58A6FF]/80 disabled:bg-[#1C2128] disabled:text-[#8B949E] transition-colors cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>

          </div>
        </aside>

      </div>
    </div>
  )
}
