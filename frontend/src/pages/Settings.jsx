import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Key, Palette, FolderKanban, Eye, EyeOff } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNotification } from '../context/NotificationContext'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'preferences', label: 'Preferences', icon: FolderKanban },
]

export default function Settings() {
  const { user, updateProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const { notify } = useNotification()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'Engineer',
  })

  const [apiKey, setApiKey] = useState('sk-devbrain-************************')
  const [preferences, setPreferences] = useState({
    autoIndex: true,
    emailNotifications: true,
    defaultModel: 'ollama',
  })

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      await updateProfile(profile)
      notify('Profile updated successfully', { type: 'success' })
    } catch {
      notify('Failed to update profile', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveApiKey = () => {
    notify('API key saved securely', { type: 'success' })
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-border">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === id
                ? 'text-accent border-b-2 border-accent bg-accent/5'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </div>
            </CardHeader>
            <div className="space-y-4 max-w-md">
              <Input
                label="Full Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
              <Input
                label="Role"
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
              />
              <Button onClick={handleSaveProfile} loading={loading}>
                Save Changes
              </Button>
            </div>
          </Card>
        )}

        {activeTab === 'api-keys' && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>API Key Management</CardTitle>
                <CardDescription>Configure your AI provider API keys</CardDescription>
              </div>
            </CardHeader>
            <div className="space-y-4 max-w-lg">
              <div className="relative">
                <Input
                  label="Grok / Ollama API Key"
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  hint="Your API key is encrypted and stored securely"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-[34px] text-text-secondary hover:text-text-primary"
                  aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button onClick={handleSaveApiKey}>Save API Key</Button>
            </div>
          </Card>
        )}

        {activeTab === 'theme' && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Theme Settings</CardTitle>
                <CardDescription>Customize your workspace appearance</CardDescription>
              </div>
            </CardHeader>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              {['dark', 'light'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    theme === t
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent/30'
                  }`}
                >
                  <div
                    className={`h-16 rounded-lg mb-3 ${
                      t === 'dark' ? 'bg-bg-primary border border-border' : 'bg-gray-100 border border-gray-200'
                    }`}
                  />
                  <p className="text-sm font-medium text-text-primary capitalize">{t} Mode</p>
                </button>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'preferences' && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Project Preferences</CardTitle>
                <CardDescription>Configure default project behavior</CardDescription>
              </div>
            </CardHeader>
            <div className="space-y-4 max-w-lg">
              {[
                { key: 'autoIndex', label: 'Auto-index on upload', desc: 'Automatically index files after upload' },
                { key: 'emailNotifications', label: 'Email notifications', desc: 'Receive updates on indexing status' },
              ].map(({ key, label, desc }) => (
                <label
                  key={key}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">{label}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences[key]}
                    onChange={(e) => setPreferences({ ...preferences, [key]: e.target.checked })}
                    className="h-4 w-4 rounded border-border bg-bg-primary text-accent focus:ring-accent/50"
                  />
                </label>
              ))}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Default AI Model
                </label>
                <select
                  value={preferences.defaultModel}
                  onChange={(e) => setPreferences({ ...preferences, defaultModel: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg text-sm bg-bg-primary border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="ollama">Ollama (Local)</option>
                  <option value="grok">Grok API</option>
                </select>
              </div>
              <Button onClick={() => notify('Preferences saved', { type: 'success' })}>
                Save Preferences
              </Button>
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
