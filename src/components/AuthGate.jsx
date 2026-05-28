import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

function AuthGate() {
  const [mode, setMode] = useState('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isSignUp = mode === 'sign-up'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setAuthError('')
    setAuthMessage('')
    setIsSubmitting(true)

    const credentials = {
      email: email.trim(),
      password,
    }

    const { data, error } = isSignUp
      ? await supabase.auth.signUp(credentials)
      : await supabase.auth.signInWithPassword(credentials)

    setIsSubmitting(false)

    if (error) {
      setAuthError(error.message)
      return
    }

    if (isSignUp && !data.session) {
      setAuthMessage('Check your email to confirm your account, then sign in.')
    }
  }

  const switchMode = () => {
    setMode((currentMode) => (currentMode === 'sign-in' ? 'sign-up' : 'sign-in'))
    setAuthError('')
    setAuthMessage('')
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="brand-block auth-brand">
          <span className="brand-tag">RMC</span>
          <h1>Commitment Pipeline Dashboard</h1>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
          </div>

          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              autoComplete="email"
              required
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              minLength={6}
              required
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {authError && <div className="auth-error">{authError}</div>}
          {authMessage && <div className="auth-message">{authMessage}</div>}

          <button type="submit" className="primary-action-button" disabled={isSubmitting}>
            {isSubmitting ? 'Working...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <button type="button" className="auth-mode-button" onClick={switchMode}>
          {isSignUp ? 'Use an existing account' : 'Create a new account'}
        </button>
      </section>
    </main>
  )
}

export default AuthGate
