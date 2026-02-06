import React, { useState } from 'react'
import { PiChefHatFill } from 'react-icons/pi'
import { HiMenu, HiX } from 'react-icons/hi'
import { useNavigate } from 'react-router'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

function Navbar() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleHome = () => {
    navigate("/", { replace: true })
  }

  const handleCart = () => {
    navigate("/cart", { replace: true })
  }

  const handleAccount = () => {
    navigate("/user-account", { replace: true })
  }

  const handleLogout = () => {
    Cookies.remove("jwt_token")
    toast.success("Logged out successfully")
    navigate("/login", { replace: true })
  }

  return (
    <nav className="bg-white shadow-md px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleHome} >
          <PiChefHatFill className="text-orange-500 text-3xl" />
          <h1 className="text-xl font-bold text-slate-800">
            The Golden Spoon
          </h1>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-6 text-slate-700 font-medium">
          <li onClick={handleHome} className="cursor-pointer hover:text-orange-500 transition">
            Home
          </li>
          <li onClick={handleCart} className="cursor-pointer hover:text-orange-500 transition relative flex items-center">
            Cart
          </li>
          <li onClick={handleAccount} className="cursor-pointer hover:text-orange-500 transition">
            Account
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-3xl text-slate-700 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <HiX /> : <HiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <ul className="md:hidden mt-4 flex flex-col gap-4 text-slate-700 font-medium">
          <li onClick={handleHome} className="cursor-pointer hover:text-orange-500 transition">
            Home
          </li>
          <li onClick={handleCart} className="cursor-pointer hover:text-orange-500 transition">
            Cart
          </li>
          <li onClick={handleAccount} className="cursor-pointer hover:text-orange-500 transition">
            Account
          </li>
          <li>
            <button onClick={handleLogout} className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition w-full cursor-pointer">
              Logout
            </button>
          </li>
        </ul>
      )}
    </nav>
  )
}

export default Navbar