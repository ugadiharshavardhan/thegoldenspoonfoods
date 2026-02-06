import React from 'react'
import Cookies from "js-cookie"
import { Navigate } from 'react-router'
import Navbar from './Navbar'

function ProtectedRoute({children}) {
    const token = Cookies.get("jwt_token")
    if (!token) {
        return <Navigate to="/login" />
    }
  return (
    <div>
      <Navbar />
      {children}
    </div>
  )
}

export default ProtectedRoute
