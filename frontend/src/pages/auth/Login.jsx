import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brain } from 'lucide-react'
import AuthLayout from '../../components/layout/AuthLayout'
import Input from '../../components/ui/Input'
import PasswordInput from '../../components/auth/PasswordInput'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { validateEmail, validateRequired } from '../../utils/validators'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (field) => (e) => {
    const value = field === 'remember' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    const emailError = validateRequired(form.email, 'Email')
    if (emailError) newErrors.email = emailError
    else if (!validateEmail(form.email)) newErrors.email = 'Invalid email address'
    const passwordError = validateRequired(form.password, 'Password')
    if (passwordError) newErrors.password = passwordError

    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      await login(form)
      navigate('/dashboard')
    } catch (err) {
      setErrors({ form: err.response?.data?.detail || 'Incorrect username or password.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="lg:hidden flex items-center gap-2 mb-6">
        <div className="h-8 w-8 rounded-md bg-bg-subtle border border-border flex items-center justify-center">
          <Brain className="h-4 w-4 text-text-primary" />
        </div>
        <span className="font-semibold text-text-primary text-sm">Sign in to DevBrain AI</span>
      </div>

      <div className="gh-box p-4">
        <h2 className="text-xl font-semibold text-text-primary mb-1">Sign in</h2>
        <p className="text-sm text-text-secondary mb-4">
          to continue to DevBrain AI
        </p>

        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
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
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-semibold text-text-primary">Password</label>
              <a href="#" className="text-xs text-accent hover:underline">Forgot password?</a>
            </div>
            <PasswordInput
              label=""
              value={form.password}
              onChange={handleChange('password')}
              error={errors.password}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer py-1">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={handleChange('remember')}
              className="h-4 w-4 rounded border-border bg-bg-primary accent-success-emphasis"
            />
            <span className="text-sm text-text-secondary">Remember me</span>
          </label>

          {errors.form && (
            <div className="text-sm text-error px-3 py-2 rounded-md border border-error/30 bg-error/10" role="alert">
              {errors.form}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Sign in
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-text-secondary mt-4">
        New to DevBrain AI?{' '}
        <Link to="/register" className="text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
