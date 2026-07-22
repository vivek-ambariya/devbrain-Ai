import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
    setErrors((prev) => ({ ...prev, [field]: null, form: null }))
  }

  const parseErrorMessage = (err) => {
    if (!err?.response?.data) return 'Incorrect username or password.'
    const data = err.response.data
    if (typeof data === 'string') return data
    if (data.detail) return data.detail
    if (data.email) return Array.isArray(data.email) ? data.email[0] : data.email
    if (data.password) return Array.isArray(data.password) ? data.password[0] : data.password
    if (data.non_field_errors) return Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors
    const firstKey = Object.keys(data)[0]
    if (firstKey) {
      const val = data[firstKey]
      return Array.isArray(val) ? `${val[0]}` : `${val}`
    }
    return 'Incorrect username or password.'
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
      setErrors({ form: parseErrorMessage(err) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="glass-panel p-6 rounded-2xl border border-border/80 shadow-2xl space-y-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Sign in to DevBrain AI</h2>
          <p className="text-xs text-text-secondary mt-1">
            Access your engineering workspace & architecture telemetry
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          <Input
            label="Email address"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            error={errors.email}
            placeholder="demo@devbrain.ai"
            autoComplete="email"
            required
          />
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-text-primary">Password</label>
              <a href="#" className="text-[11px] text-accent-gold hover:underline">Forgot password?</a>
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
              className="h-4 w-4 rounded border-border bg-bg-primary accent-accent-gold"
            />
            <span className="text-xs text-text-secondary">Remember me on this device</span>
          </label>

          {errors.form && (
            <div className="text-xs text-accent-rust px-3.5 py-2.5 rounded-lg border border-accent-rust/40 bg-accent-rust/10 font-medium" role="alert">
              {errors.form}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full bg-accent-gold text-bg-primary font-bold hover:bg-accent-gold-light" size="lg">
            Sign In
          </Button>
        </form>

        <p className="text-center text-xs text-text-secondary pt-2 border-t border-border-muted/50">
          New to DevBrain AI?{' '}
          <Link to="/register" className="text-accent-gold hover:underline font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
