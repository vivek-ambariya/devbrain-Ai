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
    setErrors((prev) => ({ ...prev, [field]: null, form: null }))
  }

  const parseErrorMessage = (err) => {
    if (!err?.response?.data) return 'Registration failed. Please try again.'
    const data = err.response.data
    if (typeof data === 'string') return data
    if (data.detail) return data.detail
    if (data.email) {
      return Array.isArray(data.email) ? data.email[0] : data.email
    }
    if (data.password) {
      return Array.isArray(data.password) ? data.password[0] : data.password
    }
    if (data.name) {
      return Array.isArray(data.name) ? data.name[0] : data.name
    }
    const firstKey = Object.keys(data)[0]
    if (firstKey) {
      const val = data[firstKey]
      return Array.isArray(val) ? `${val[0]}` : `${val}`
    }
    return 'Registration failed. Please try again.'
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
      const msg = parseErrorMessage(err)
      if (msg.toLowerCase().includes('already exists')) {
        setErrors({
          email: 'A user with this email already exists.',
          form: 'Email is already registered. Please sign in instead or use another email.',
        })
      } else {
        setErrors({ form: msg })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="glass-panel p-6 rounded-2xl border border-border/80 shadow-2xl space-y-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Create your account</h2>
          <p className="text-xs text-text-secondary mt-1">
            Start analyzing your engineering projects & codebase architecture
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          <Input
            label="Full name"
            value={form.name}
            onChange={handleChange('name')}
            error={errors.name}
            placeholder="e.g. Demo Engineer"
            autoComplete="name"
            required
          />
          <Input
            label="Email address"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            error={errors.email}
            placeholder="e.g. alex.dev@gmail.com"
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
            hint="Min 6 characters"
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
            <div className="text-xs text-accent-rust px-3.5 py-2.5 rounded-lg border border-accent-rust/40 bg-accent-rust/10 font-medium" role="alert">
              {errors.form}{' '}
              {errors.form.includes('already registered') && (
                <Link to="/login" className="underline font-bold text-accent-gold ml-1">
                  Sign in here &rarr;
                </Link>
              )}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full bg-accent-gold text-bg-primary font-bold hover:bg-accent-gold-light" size="lg">
            Create Account
          </Button>
        </form>

        <p className="text-center text-xs text-text-secondary pt-2 border-t border-border-muted/50">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-gold hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
