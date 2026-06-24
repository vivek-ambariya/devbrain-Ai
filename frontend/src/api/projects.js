import api from './axios'
import {
  mockProjects,
  mockDashboardStats,
  mockRecentProjects,
  mockArchitectureTree,
  mockArchitectureMap,
  mockDependencyGraph,
} from '../utils/mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export async function getProjects() {
  if (USE_MOCK) return mockProjects
  const { data } = await api.get('/projects/')
  return data
}

export async function getProject(id) {
  if (USE_MOCK) return mockProjects.find((p) => p.id === id)
  const { data } = await api.get(`/projects/${id}/`)
  return data
}

export async function createProject(projectData) {
  if (USE_MOCK) {
    return {
      id: String(Date.now()),
      ...projectData,
      uploadDate: new Date().toISOString(),
      totalFiles: 0,
      status: 'pending',
      lastIndexed: null,
      apisCount: 0,
      docsCount: 0,
    }
  }
  const { data } = await api.post('/projects/', projectData)
  return data
}

export async function uploadProjectFile(projectId, file, type, onProgress) {
  if (USE_MOCK) {
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        onProgress?.(progress)
        if (progress >= 100) {
          clearInterval(interval)
          resolve({ success: true, filename: file.name })
        }
      }, 200)
    })
  }
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  const { data } = await api.post(`/projects/${projectId}/upload/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (e.total) onProgress?.(Math.round((e.loaded * 100) / e.total))
    },
  })
  return data
}

export async function getDashboardStats() {
  if (USE_MOCK) return mockDashboardStats
  const { data } = await api.get('/dashboard/stats/')
  return data
}

export async function getRecentProjects() {
  if (USE_MOCK) return mockRecentProjects
  const { data } = await api.get('/dashboard/recent-projects/')
  return data
}

export async function getArchitecture(projectId) {
  if (USE_MOCK) return mockArchitectureTree
  const { data } = await api.get(`/projects/${projectId}/architecture/`)
  return data
}

export async function getArchitectureMap(projectId) {
  if (USE_MOCK) return mockArchitectureMap
  const { data } = await api.get(`/projects/${projectId}/architecture/map/`)
  return data
}

export async function getDependencyGraph(projectId) {
  if (USE_MOCK) return mockDependencyGraph
  const { data } = await api.get(`/projects/${projectId}/architecture/graph/`)
  return data
}
