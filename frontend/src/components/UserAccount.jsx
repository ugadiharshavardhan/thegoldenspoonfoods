import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router'
import toast, { Toaster } from 'react-hot-toast'
import { BACKEND_URL } from '../config'

function UserAccount() {
  const [userDetails, setUserDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const token = Cookies.get("jwt_token")
        if (!token) {
          navigate("/login", { replace: true })
          return
        }

        const response = await fetch(`${BACKEND_URL}/user/details`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        })
        const data = await response.json()
        if (response.ok) {
          setUserDetails(data.data)
        } else {
          console.error("Failed to fetch user details")
          if (response.status === 401 || response.status === 403) {
            Cookies.remove("jwt_token")
            navigate("/login", { replace: true })
            toast.error("Session expired. Please login again.")
          }
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    getUserDetails()
  }, [])

  const handleLogout = () => {
    Cookies.remove("jwt_token")
    toast.success("Logged out successfully")
    navigate("/login", { replace: true })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all hover:shadow-2xl">

        {/* Header Background */}
        <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-32 w-full relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <div className="h-32 w-32 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
              {/* Avatar Placeholder or Image */}
              <div className="h-full w-full bg-orange-100 flex items-center justify-center text-5xl">
                👨‍🍳
              </div>
            </div>
          </div>
        </div>

        <div className="pt-20 pb-10 px-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-1 tracking-tight">
            {userDetails?.name || "Welcome, User"}
          </h2>
          <p className="text-orange-500 font-medium text-sm mb-8 uppercase tracking-wider">Food Enthusiast</p>

          <div className="space-y-4 text-left">

            {/* Name Field */}
            <div className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-orange-200 transition-colors group">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 mr-4 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Full Name</p>
                <p className="text-gray-800 font-bold text-base">{userDetails?.name || "N/A"}</p>
              </div>
            </div>

            {/* Email Field */}
            <div className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-orange-200 transition-colors group">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 mr-4 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Email Address</p>
                <p className="text-gray-800 font-bold text-base">{userDetails?.email || "N/A"}</p>
              </div>
            </div>

            {/* User ID Field */}
            <div className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-orange-200 transition-colors group">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 mr-4 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider">User ID</p>
                <p className="text-gray-500 font-medium text-xs font-mono">{userDetails?._id || "N/A"}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full mt-10 bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Logout</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserAccount
