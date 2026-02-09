import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import Cookies from "js-cookie"
import toast from "react-hot-toast"
import Loading from "./Loading"
import { useCart } from "../context/CartContext"
import { BACKEND_URL } from '../config'

function Cart() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { fetchCartCount, addToCartCount, setCartCount } = useCart()

  useEffect(() => {
    const getCart = async () => {
      try {
        const token = Cookies.get("jwt_token")
        const response = await fetch(`${BACKEND_URL}/api/cartitems`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        const data = await response.json()
        setCartItems(data.fooditems || [])
      } catch (error) {
        console.error("Failed to fetch cart:", error)
      } finally {
        setLoading(false)
      }
    }
    getCart()
  }, [])

  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true)
          return
        }
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.onload = () => resolve(true)
        script.onerror = () => resolve(false)
        document.body.appendChild(script)
      })
    }

    loadRazorpay()
  }, [])

  const handleBack = () => {
    navigate("/")
  }

  const handleRemove = async (id) => {
    // Optimistic Update
    const itemToRemove = cartItems.find(item => item._id === id)
    if (itemToRemove) {
      addToCartCount(-itemToRemove.quantity)
    }
    setCartItems((prev) => prev.filter((item) => item._id !== id))

    // Background API Call
    try {
      const token = Cookies.get("jwt_token")
      await fetch(`${BACKEND_URL}/api/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      toast.success("Item removed from cart")
      // Calculate quantity to remove from global count
      const itemToRemove = cartItems.find(item => item._id === id)
      if (!itemToRemove) { // If item was already removed optimistically, find it in the original cartItems
        // This case should ideally not happen if optimistic update is correct, but good for robustness
        // Or, if the item was not found in the current state, we might need to re-fetch cart count
        fetchCartCount()
      }
      // If itemToRemove was found and its quantity was already subtracted, no need to do it again.
      // The fetchCartCount() call below will ensure consistency.
      fetchCartCount() // Sync just in case
    } catch (error) {
      console.error("Remove failed", error)
      toast.error("Failed to remove item")
      // Ideally revert state here, but for now we rely on user refresh or subsequent fetch if critical
    }
  }

  const increaseQty = async (id) => {
    // 1. Optimistic Update
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    )
    addToCartCount(1)

    // 2. Background API Call
    const item = cartItems.find(i => i._id === id)
    if (!item) return

    try {
      const token = Cookies.get("jwt_token")
      await fetch(`${BACKEND_URL}/api/addtocart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          itemName: item.itemName,
          itemUrl: item.itemUrl,
          itemPrice: item.itemPrice,
          quantity: 1
        })
      })
      fetchCartCount() // Update global count
    } catch (error) {
      console.error("Increase failed", error)
      // Revert quantity if needed
    }
  }


  const decreaseQty = async (id) => {
    // 1. Optimistic Update
    setCartItems((prev) =>
      prev.map((item) =>
        item._id === id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    )
    addToCartCount(-1)

    // 2. Background API Call
    const item = cartItems.find(i => i._id === id)
    if (!item || item.quantity <= 1) return

    try {
      const token = Cookies.get("jwt_token")
      await fetch(`${BACKEND_URL}/api/addtocart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          itemName: item.itemName,
          itemUrl: item.itemUrl,
          itemPrice: item.itemPrice,
          quantity: -1
        })
      })
      fetchCartCount() // Update global count
    } catch (error) {
      console.error("Decrease failed", error)
      // Revert logic would go here
    }
  }

  const ordertotal = cartItems.reduce(
    (sum, item) => sum + item.itemPrice * item.quantity,
    0
  )

  const handlePrevOrders = () => {
    navigate("/previous-orders")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 sm:p-10 border-b border-gray-100">
          <div className="flex items-center mb-6">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-500 hover:text-orange-600 transition-colors cursor-pointer"
            >
              <span className="text-2xl mr-2">←</span>
              <span className="font-medium">Back to Menu</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
        </div>

        {loading ? (
          <Loading />
        ) : cartItems.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
            <div className="text-gray-300 text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition shadow-md cursor-pointer"
            >
              Start Browsing
            </button>
            <button onClick={handlePrevOrders} className="mt-4 underline text-orange-500 hover:text-orange-600 cursor-pointer transition">Browse previous orders</button>
          </div>
        ) : (
          <div className="p-6 sm:p-10">
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-gray-50 rounded-xl hover:shadow-md transition-shadow border border-gray-100"
                >
                  {/* Image */}
                  <div className="w-full sm:w-24 h-24 flex-shrink-0">
                    <img
                      src={item.itemUrl}
                      alt={item.itemName}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 w-full text-center sm:text-left">
                    <h2 className="text-lg font-bold text-gray-900 mb-1">{item.itemName}</h2>
                    <p className="text-sm text-gray-500 font-medium">₹{item.itemPrice}.00</p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                      <button
                        onClick={() => decreaseQty(item._id)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded hover:text-orange-600 transition font-bold cursor-pointer"
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-bold text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => increaseQty(item._id)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-orange-200 rounded hover:text-orange-600 transition font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Price & Remove */}
                  <div className="flex flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{item.itemPrice * item.quantity}.00
                    </span>
                    <button
                      onClick={() => handleRemove(item._id)}
                      className="text-sm text-red-500 hover:text-red-700 font-medium transition underline-offset-2 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 border-t border-gray-100 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <span className="text-gray-500 text-lg">Total Amount:</span>
                <span className="text-3xl font-bold text-gray-900 ml-3">₹{ordertotal}.00</span>
              </div>

              <button onClick={handlePrevOrders} className="underline text-orange-500 hover:text-orange-600 cursor-pointer transition">Browse previous orders</button>

              <button
                onClick={async () => {
                  try {
                    const token = Cookies.get("jwt_token")

                    // 1. Create Razorpay Order
                    const orderRes = await fetch(`${BACKEND_URL}/create-order`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ amount: ordertotal })
                    })
                    const orderData = await orderRes.json()

                    if (!orderData.id) {
                      toast.error("Failed to create order. Please try again.")
                      return
                    }

                    // 2. Open Razorpay Modal
                    const options = {
                      key: "rzp_test_SBjgUiAL2qDOF8", // Using the provided test key
                      amount: orderData.amount,
                      currency: "INR",
                      name: "Tasty Kitchens",
                      description: "Food Order Payment",
                      order_id: orderData.id,
                      handler: async function (response) {
                        // 3. Verify Payment
                        const verifyRes = await fetch(`${BACKEND_URL}/verify-payment`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(response)
                        })
                        const verifyData = await verifyRes.json()

                        if (verifyData.success) {
                          // 4. Save Order to Backend
                          const orderResponse = await fetch(`${BACKEND_URL}/api/orders`, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              "Authorization": `Bearer ${token}`
                            },
                            body: JSON.stringify({
                              items: cartItems,
                              totalAmount: ordertotal,
                              paymentId: response.razorpay_payment_id
                            })
                          })

                          if (orderResponse.ok) {
                            // 5. Clear Cart
                            const res = await fetch(`${BACKEND_URL}/api/clear-cart`, {
                              method: "DELETE",
                              headers: {
                                "Authorization": `Bearer ${token}`
                              }
                            })
                            if (res.ok) {
                              toast.success("Order placed successfully!")
                              // We can set it to 0 or fetch. Since we navigate away, fetch is fine, but setting 0 is faster.
                              // But we don't have setCartCount exposed directly as such, but we have fetchCartCount.
                              // Actually, we do have setCartCount exposed ? let's check context.
                              // Yes, setCartCount IS exposed.
                              // Let's use fetchCartCount for correctness as it empties on backend.
                              fetchCartCount()
                              setCartCount(0) // Immediate reset
                              navigate("/", { replace: true })
                            }
                          } else {
                            toast.error("Payment verified, but failed to save order.")
                          }
                        } else {
                          toast.error("Payment Verification Failed")
                        }
                      },
                      theme: { color: "#f97316" }
                    }

                    const rzp = new window.Razorpay(options)
                    rzp.open()

                  } catch (error) {
                    console.error("Payment error", error)
                    toast.error("Something went wrong during payment.")
                  }
                }}
                className="w-full cursor-pointer sm:w-auto px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transform hover:-translate-y-0.5 transition-all"
              >
                Place Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

  )
}

export default Cart
