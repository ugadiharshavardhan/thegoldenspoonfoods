import React, { useState } from 'react'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router'
import toast, { Toaster } from 'react-hot-toast'
import loginBg from '../assets/login_background.png'

function Login() {
  // Views: 'LOGIN', 'SIGNUP', 'FORGOT_EMAIL', 'FORGOT_OTP', 'RESET_PASSWORD'
  const [view, setView] = useState('LOGIN')
  const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '', newPassword: '' })
  const navigate = useNavigate()

  const API_URL = "https://thegoldenspoonfoods.onrender.com/api"

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) return toast.error("Please fill in all fields")

    try {
      const response = await fetch(`${API_URL}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      })
      const data = await response.json()
      if (response.ok) {
        Cookies.set('jwt_token', data.token, { expires: 1 })
        toast.success("Welcome back! Login Successful")
        setTimeout(() => navigate('/'), 1000)
      } else {
        toast.error(data.message || "Invalid Credentials")
      }
    } catch (error) {
      toast.error("Something went wrong.")
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password) return toast.error("Please fill in all fields")
    if (formData.password.length < 6) return toast.error("Password too short")

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password })
      })
      const data = await response.json()
      if (response.ok) {
        if (data.token) {
          Cookies.set('jwt_token', data.token, { expires: 1 })
          toast.success("Account created successfully!")
          setTimeout(() => navigate('/'), 1000)
        } else {
          toast.success("Account created! Please login.")
          setView('LOGIN')
        }
      } else {
        toast.error(data.message || "Signup failed")
      }
    } catch (error) {
      toast.error("Signup failed")
    }
  }

  // --- Forgot Password Handlers ---

  const sendOtp = async (e) => {
    e.preventDefault()
    if (!formData.email) return toast.error("Please enter email")

    try {
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("OTP sent to your email!")
        setView('FORGOT_OTP')
      } else {
        toast.error(data.message || "Failed to send OTP")
      }
    } catch (error) {
      toast.error("Error sending OTP")
    }
  }

  const verifyOtp = async (e) => {
    e.preventDefault()
    if (!formData.otp) return toast.error("Enter OTP")

    try {
      const res = await fetch(`${API_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: formData.otp })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("OTP Verified!")
        setView('RESET_PASSWORD')
      } else {
        toast.error(data.message || "Invalid OTP")
      }
    } catch (error) {
      toast.error("Verification failed")
    }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    if (!formData.newPassword || formData.newPassword.length < 6) return toast.error("Password must be 6+ chars")

    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: formData.otp, newPassword: formData.newPassword })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Password Reset Successfully!")
        setView('LOGIN')
        setFormData({ ...formData, password: '', otp: '', newPassword: '' })
      } else {
        toast.error(data.message || "Reset failed")
      }
    } catch (error) {
      toast.error("Error resetting password")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${loginBg})` }}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col md:flex-row shadow-2xl rounded-2xl overflow-hidden m-4 animate-fade-in-up">
        {/* Left Side */}
        <div className="md:w-1/2 p-8 md:p-12 text-white flex flex-col justify-center relative bg-white/10 backdrop-blur-md border-r border-white/20">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight drop-shadow-md">
              Get Your Food <br /> <span className="text-orange-400">Delivered Home</span>
            </h1>
            <p className="text-lg md:text-xl font-light text-gray-100 drop-shadow-sm opacity-90">
              Experience the best cuisines delivered hot & fresh.
            </p>
          </div>
        </div>

        {/* Right Side - Dynamic Form */}
        <div className="md:w-1/2 p-8 md:p-12 bg-white/20 backdrop-blur-xl border border-white/30 flex flex-col justify-center">

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-wide">
              {view === 'LOGIN' && 'Welcome Back'}
              {view === 'SIGNUP' && 'Join Us Today'}
              {view === 'FORGOT_EMAIL' && 'Reset Password'}
              {view === 'FORGOT_OTP' && 'Verify OTP'}
              {view === 'RESET_PASSWORD' && 'New Password'}
            </h2>
            <p className="text-gray-200 text-sm">
              {view === 'LOGIN' && 'Sign in to continue'}
              {view === 'SIGNUP' && 'Create an account to start ordering'}
              {view === 'FORGOT_EMAIL' && 'Enter your email to receive an OTP'}
              {view === 'FORGOT_OTP' && 'Enter the 6-digit code sent to your email'}
              {view === 'RESET_PASSWORD' && 'Create a strong new password'}
            </p>
          </div>

          <form className="space-y-5">

            {/* SIGNUP: Name */}
            {view === 'SIGNUP' && (
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="w-full px-5 py-3.5 bg-white/80 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800" required />
            )}

            {/* LOGIN / SIGNUP / FORGOT_EMAIL: Email */}
            {(view === 'LOGIN' || view === 'SIGNUP' || view === 'FORGOT_EMAIL') && (
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="w-full px-5 py-3.5 bg-white/80 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800" required />
            )}

            {/* LOGIN / SIGNUP: Password */}
            {(view === 'LOGIN' || view === 'SIGNUP') && (
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" className="w-full px-5 py-3.5 bg-white/80 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800" required />
            )}

            {/* OTP Input */}
            {view === 'FORGOT_OTP' && (
              <input type="text" name="otp" value={formData.otp} onChange={handleChange} placeholder="Enter 6-digit OTP" className="w-full px-5 py-3.5 bg-white/80 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800 text-center text-2xl tracking-widest font-mono" maxLength={6} required />
            )}

            {/* New Password Input */}
            {view === 'RESET_PASSWORD' && (
              <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="New Password" className="w-full px-5 py-3.5 bg-white/80 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800" required />
            )}


            {/* ACTION BUTTONS */}
            {view === 'LOGIN' && (
              <button onClick={handleLogin} className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-all">Sign In</button>
            )}
            {view === 'SIGNUP' && (
              <button onClick={handleSignup} className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-all">Create Account</button>
            )}
            {view === 'FORGOT_EMAIL' && (
              <button onClick={sendOtp} className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-all">Send OTP</button>
            )}
            {view === 'FORGOT_OTP' && (
              <button onClick={verifyOtp} className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-all">Verify OTP</button>
            )}
            {view === 'RESET_PASSWORD' && (
              <button onClick={resetPassword} className="w-full py-3.5 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-all">Reset Password</button>
            )}

          </form>

          {/* Links */}
          <div className="mt-8 text-center text-sm">
            {view === 'LOGIN' && (
              <>
                <p className="text-gray-100 mb-2">Don't have an account?</p>
                <button onClick={() => setView('SIGNUP')} className="text-white font-bold underline hover:text-orange-300">Sign Up Here</button>
                <br /><br />
                <button onClick={() => setView('FORGOT_EMAIL')} className="text-gray-200 hover:text-white text-xs">Forgot Password?</button>
              </>
            )}

            {view === 'SIGNUP' && (
              <>
                <p className="text-gray-100 mb-2">Already have an account?</p>
                <button onClick={() => setView('LOGIN')} className="text-white font-bold underline hover:text-orange-300">Login Here</button>
              </>
            )}

            {(view === 'FORGOT_EMAIL' || view === 'FORGOT_OTP' || view === 'RESET_PASSWORD') && (
              <button onClick={() => setView('LOGIN')} className="text-white font-bold underline hover:text-orange-300 mt-4">Back to Login</button>
            )}
          </div>

        </div>
      </div>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
      `}</style>
    </div>
  )
}

export default Login
