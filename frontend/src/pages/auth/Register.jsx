import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/layout/AuthLayout'
import Input from '../../components/ui/Input'
import PasswordInput from '../../components/auth/PasswordInput'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { validateEmail, validateRequired, validatePassword } from '../../utils/validators'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    const nameError = validateRequired(form.name, 'Full name')
    if (nameError) newErrors.name = nameError
    const emailError = validateRequired(form.email, 'Email')
    if (emailError) newErrors.email = emailError
    else if (!validateEmail(form.email)) newErrors.email = 'Invalid email address'
    const passwordErrors = validatePassword(form.password)
    if (passwordErrors.length) newErrors.password = passwordErrors[0]
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'

    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password })
      navigate('/dashboard')
    } catch (err) {
      setErrors({ form: err.response?.data?.detail || 'Registration failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="gh-box p-4">
        <h2 className="text-xl font-semibold text-text-primary mb-1">Create your account</h2>
        <p className="text-sm text-text-secondary mb-4">
          Start analyzing your engineering projects
        </p>

        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <Input
            label="Full name"
            value={form.name}
            onChange={handleChange('name')}
            error={errors.name}
            placeholder="John Doe"
            autoComplete="name"
            required
          />
          <Input
            label="Email address"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            error={errors.email}
            placeholder="you@company.com"
            autoComplete="email"
            required
          />
          <PasswordInput
            label="Password"
            value={form.password}
            onChange={handleChange('password')}
            error={errors.password}
            placeholder="Create a password"
            autoComplete="new-password"
            hint="Min 8 characters with uppercase, lowercase, and number"
            required
          />
          <PasswordInput
            label="Confirm password"
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            error={errors.confirmPassword}
            placeholder="Confirm your password"
            autoComplete="new-password"
            required
          />

          {errors.form && (
            <div className="text-sm text-error px-3 py-2 rounded-md border border-error/30 bg-error/10" role="alert">
              {errors.form}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Create account
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-text-secondary mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
