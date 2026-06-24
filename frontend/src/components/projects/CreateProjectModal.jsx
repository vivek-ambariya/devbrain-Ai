import { useState } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import FileUpload from './FileUpload'
import { validateRequired } from '../../utils/validators'
import { uploadProjectFile } from '../../api/projects'

export default function CreateProjectModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [createdProject, setCreatedProject] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    const nameError = validateRequired(name, 'Project name')
    if (nameError) newErrors.name = nameError
    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const project = await onCreate({ name, description })
      setCreatedProject(project)
    } catch (err) {
      setErrors({ form: err.message || 'Failed to create project' })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setErrors({})
    setCreatedProject(null)
    onClose()
  }

  const handleUpload = async (file, type, onProgress) => {
    return uploadProjectFile(createdProject.id, file, type, onProgress)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={createdProject ? 'Upload Project Files' : 'Create New Project'}
      description={
        createdProject
          ? `Upload files for "${createdProject.name}"`
          : 'Set up a new project to index and analyze'
      }
      size="lg"
    >
      {!createdProject ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="e.g., E-Commerce Platform"
            required
          />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief project description"
          />
          {errors.form && (
            <p className="text-sm text-error" role="alert">{errors.form}</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Project
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">Repository Archive</h4>
            <FileUpload type="zip" onUpload={(file, progress) => handleUpload(file, 'zip', progress)} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">Swagger / OpenAPI</h4>
            <FileUpload type="swagger" onUpload={(file, progress) => handleUpload(file, 'swagger', progress)} />
          </div>
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">Documentation</h4>
            <FileUpload type="docs" onUpload={(file, progress) => handleUpload(file, 'docs', progress)} />
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleClose}>Done</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
