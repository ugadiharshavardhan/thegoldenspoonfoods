import React from 'react'
import { useNavigate } from 'react-router'
import { PiChefHatFill } from 'react-icons/pi'

function NotFound() {
    const navigate = useNavigate()

    const handleGoHome = () => {
        navigate("/", { replace: true })
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
            <div className="mb-6 animate-bounce">
                <PiChefHatFill className="text-orange-500 text-8xl" />
            </div>

            <h1 className="text-9xl font-extrabold text-orange-500 opacity-90 drop-shadow-sm">404</h1>

            <h2 className="mt-4 text-3xl font-bold text-gray-800">Page Not Found</h2>

            <p className="mt-2 text-lg text-gray-500 max-w-sm">
                Oops! The page you are looking for does not exist. It might have been moved or deleted.
            </p>

            <button
                onClick={handleGoHome}
                className="mt-8 rounded-full bg-orange-500 px-8 py-3 font-bold text-white shadow-lg hover:bg-orange-600 hover:shadow-xl hover:scale-105 transition transform duration-200 cursor-pointer"
            >
                Go Home
            </button>
        </div>
    )
}

export default NotFound
