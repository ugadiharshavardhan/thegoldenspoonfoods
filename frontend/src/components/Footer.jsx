import React from 'react'
import { PiChefHatFill } from 'react-icons/pi'
import { FaInstagram } from 'react-icons/fa'
import { CiTwitter, CiFacebook } from 'react-icons/ci'
import { TbSquareRoundedLetterP } from 'react-icons/tb'

function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white min-h-[40vh] flex flex-col items-center justify-center text-center px-4 sm:px-8">
      
      {/* Logo */}
      <PiChefHatFill className="text-4xl sm:text-5xl mb-3" />

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">
        The Golden Spoon
      </h1>

      {/* Description */}
      <p className="text-sm sm:text-lg text-slate-300 mb-3 max-w-md">
        The only thing we are serious about is food.
      </p>

      {/* Subtitle */}
      <h2 className="text-base sm:text-lg font-medium mb-4">
        Contact us on
      </h2>

      {/* Social Icons */}
      <div className="flex gap-4 sm:gap-6">
        <FaInstagram className="text-xl sm:text-2xl cursor-pointer hover:text-orange-500 transition" />
        <CiTwitter className="text-xl sm:text-2xl cursor-pointer hover:text-orange-500 transition" />
        <CiFacebook className="text-xl sm:text-2xl cursor-pointer hover:text-orange-500 transition" />
        <TbSquareRoundedLetterP className="text-xl sm:text-2xl cursor-pointer hover:text-orange-500 transition" />
      </div>
    </footer>
  )
}

export default Footer