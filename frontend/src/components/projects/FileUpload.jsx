import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileArchive, FileJson, FileText, X, CheckCircle } from 'lucide-react'
import { cn } from '../../utils/cn'
import { validateFile } from '../../utils/validators'
import ProgressBar from '../ui/ProgressBar'

const typeConfig = {
  zip: {
    icon: FileArchive,
    label: 'Repository ZIP',
    accept: '.zip',
    allowedTypes: ['.zip'],
    maxSize: 100 * 1024 * 1024,
  },
  swagger: {
    icon: FileJson,
    label: 'Swagger/OpenAPI',
    accept: '.json,.yaml,.yml',
    allowedTypes: ['.json', '.yaml', '.yml'],
    maxSize: 10 * 1024 * 1024,
  },
  docs: {
    icon: FileText,
    label: 'Documentation',
    accept: '.md,.pdf,.txt,.docx',
    allowedTypes: ['.md', '.pdf', '.txt', '.docx'],
    maxSize: 25 * 1024 * 1024,
  },
}

export default function FileUpload({ type = 'zip', onUpload, className }) {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState(false)

  const config = typeConfig[type]
  const Icon = config.icon

  const handleFile = useCallback((selectedFile) => {
    const validationError = validateFile(selectedFile, {
      maxSize: config.maxSize,
      allowedTypes: config.allowedTypes,
    })
    if (validationError) {
      setError(validationError)
      setFile(null)
      return
    }
    setError(null)
    setFile(selectedFile)
    setSuccess(false)
  }, [config])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFile(droppedFile)
  }, [handleFile])

  const handleUpload = async () => {
    if (!file || !onUpload) return
    setUploading(true)
    setProgress(0)
    try {
      await onUpload(file, setProgress)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    setError(null)
    setSuccess(false)
    setProgress(0)
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200',
          dragOver
            ? 'border-accent bg-accent/5'
            : 'border-border hover:border-accent/50 hover:bg-white/[0.02]',
          error && 'border-error/50'
        )}
      >
        <input
          type="file"
          accept={config.accept}
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label={`Upload ${config.label}`}
        />
        <motion.div
          animate={{ scale: dragOver ? 1.05 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="mx-auto h-12 w-12 rounded-xl bg-bg-primary border border-border flex items-center justify-center mb-3">
            <Upload className="h-5 w-5 text-text-secondary" />
          </div>
          <p className="text-sm font-medium text-text-primary">
            Drop {config.label} here or <span className="text-accent">browse</span>
          </p>
          <p className="text-xs text-text-secondary mt-1">
            {config.allowedTypes.join(', ')} — max {Math.round(config.maxSize / 1024 / 1024)}MB
          </p>
        </motion.div>
      </div>

      {error && (
        <p className="text-xs text-error" role="alert">{error}</p>
      )}

      {file && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-lg border border-border bg-bg-primary"
        >
          <Icon className="h-5 w-5 text-accent shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
            <p className="text-xs text-text-secondary">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          {success ? (
            <CheckCircle className="h-5 w-5 text-success shrink-0" />
          ) : (
            <button
              onClick={clearFile}
              className="p-1 rounded hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </motion.div>
      )}

      {uploading && <ProgressBar value={progress} />}

      {file && !success && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className={cn(
            'w-full h-9 rounded-lg text-sm font-medium transition-colors',
            'bg-accent text-white hover:bg-accent/90',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      )}
    </div>
  )
}
