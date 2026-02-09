import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { BACKEND_URL } from '../config'
import { useNavigate } from 'react-router'
import { PiChefHatFill } from 'react-icons/pi'

function OrdersList() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = Cookies.get("jwt_token")
                const response = await fetch(`${BACKEND_URL}/api/orders`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
                const data = await response.json()
                if (response.ok) {
                    setOrders(data.data)
                }
            } catch (error) {
                console.error("Error fetching orders:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [])

    const handleGoHome = () => {
        navigate("/", { replace: true })
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
                    <button
                        onClick={handleGoHome}
                        className="text-orange-500 hover:text-orange-600 font-medium transition cursor-pointer"
                    >
                        Back to Home
                    </button>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-10 text-center flex flex-col items-center">
                        <PiChefHatFill className="text-gray-300 text-6xl mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">No orders found</h2>
                        <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet.</p>
                        <button
                            onClick={handleGoHome}
                            className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition shadow-md cursor-pointer"
                        >
                            Start Browsing
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                                {/* Order Header */}
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Order ID</span>
                                        <span className="font-mono text-gray-800 font-medium text-sm">{order._id}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Date</span>
                                        <span className="text-gray-800 font-medium">
                                            {new Date(order.orderDate).toLocaleDateString()} • {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1 text-right">
                                        <span className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Total Amount</span>
                                        <span className="text-orange-600 font-bold text-lg">₹{order.totalAmount}.00</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${order.status === 'Placed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                        {order.items.map((item, index) => (
                                            <div key={index} className="flex items-center gap-4">
                                                <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                                                    <img src={item.itemUrl} alt={item.itemName} className="h-full w-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">{item.itemName}</p>
                                                    <p className="text-xs text-gray-500">Qty: {item.quantity} x ₹{item.itemPrice}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default OrdersList
