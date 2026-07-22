export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validatePassword(password) {
  const errors = []
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters')
  }
  return errors
}

export function validateRequired(value, fieldName) {
  if (!value || !value.trim()) return `${fieldName} is required`
  return null
}

export function validateFile(file, options = {}) {
  const { maxSize = 50 * 1024 * 1024, allowedTypes = [] } = options
  if (!file) return 'No file selected'
  if (file.size > maxSize) return `File size must be under ${Math.round(maxSize / 1024 / 1024)}MB`
  if (allowedTypes.length && !allowedTypes.some((t) => file.name.toLowerCase().endsWith(t))) {
    return `Allowed file types: ${allowedTypes.join(', ')}`
  }
  return null
}
