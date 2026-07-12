import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { PlusCircle, Loader2, Mail, Lock, User } from 'lucide-react'
import { supabase } from '../lib/supabase'

const SignupPage = () => {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: signUpError } = await signUp(email, password, fullName)
      if (signUpError) throw signUpError

      alert('Provisioning successful! Check your email for confirmation link.')
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 stud-grid bg-mesh">
      <div className="w-full max-w-md animate-in fly-in duration-500">
        {/* Logo/Brand Section */}
        <div className="flex flex-col items-center mb-10 space-y-3">
          <div className="w-16 h-16 bg-primary border-thick brick-shadow flex items-center justify-center">
            <PlusCircle size={32} className="text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground italic">
              Smart<span className="text-primary">Fin</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-1">
              Terminal v2.0 // Registration
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-card border-thick brick-shadow-lg p-10 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
              New Operative
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Provision your financial clearance
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 border-standard border-destructive text-destructive p-3 text-[10px] font-black uppercase tracking-widest">
                Error: {error}
              </div>
            )}
            
            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Agent Name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    className="w-full bg-background border-thick px-12 py-4 text-sm font-bold placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary transition-all rounded-none"
                    placeholder="ENTER FULL NAME"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Email Identifier
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    className="w-full bg-background border-thick px-12 py-4 text-sm font-bold placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary transition-all rounded-none"
                    placeholder="AGENT@SMARTFIN.NETWORK"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Security Key
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    className="w-full bg-background border-thick px-12 py-4 text-sm font-bold placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary transition-all rounded-none"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-5 text-base"
            >
              {loading ? (
                <div className="flex items-center gap-3 justify-center">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin"></div>
                  <span>Provisioning...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 justify-center">
                  <span>Initialize Account</span>
                </div>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-border-outline opacity-20"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="bg-card px-4 text-muted-foreground">Already Registered?</span>
            </div>
          </div>

          <Link
            to="/login"
            className="w-full flex items-center justify-center gap-2 py-4 border-thick border-muted-foreground/20 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:bg-muted hover:text-foreground transition-all rounded-none"
          >
            Access Terminal
          </Link>
        </div>

        <p className="mt-10 text-center text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
          Secure Terminal // Provisioning Protocol 4.1
        </p>
      </div>
    </div>
  )
}

export default SignupPage
