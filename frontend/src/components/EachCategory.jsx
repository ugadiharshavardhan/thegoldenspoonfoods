import React, { useEffect, useState } from "react"
import { Link, useParams } from 'react-router'
import { BACKEND_URL } from '../config'
import Loading from "./Loading"
import Cookies from "js-cookie"
import { useCart } from "../context/CartContext"


function EachCategory() {
  const { item } = useParams()

  const [itemData, setItemData] = useState([])
  const [quantities, setQuantities] = useState({})
  const [sortedData, setSortedData] = useState(itemData)
  const [apiError, setApiError] = useState(false)
  const { fetchCartCount, addToCartCount } = useCart()

  // ---------------- FETCH ITEMS & CART ----------------
  useEffect(() => {
    const fetchAllData = async () => {
      setApiError(false)
      try {
        // 1. Fetch products for this category
        const itemsRes = await fetch(`${BACKEND_URL}/items/${item}`)
        if (!itemsRes.ok) {
          throw new Error("Failed to fetch items")
        }
        const itemsData = await itemsRes.json()

        // 2. Fetch current cart to sync quantities
        const token = Cookies.get("jwt_token")
        let cartItems = []
        if (token) {
          try {
            const cartRes = await fetch(`${BACKEND_URL}/api/cartitems`, {
              headers: {
                "Authorization": `Bearer ${token}`
              }
            })
            if (!cartRes.ok) {
              throw new Error("Failed to fetch cart")
            }
            const cartData = await cartRes.json()
            cartItems = cartData.fooditems || []
          } catch (error) {
            console.error("Failed to fetch cart, proceeding without cart data:", error)
            // Optionally, set an error state specific to cart fetching or just log
          }
        }
      }

        // 3. Create a map of itemName -> quantity
        const qtyMap = {}
      if (cartItems.length > 0) {
        cartItems.forEach(cartItem => {
          qtyMap[cartItem.itemName] = cartItem.quantity
        })
      }

      const finalQtyMap = {}
      if (Array.isArray(itemsData)) {
        itemsData.forEach(product => {
          // If this product is in the cart (by name), set its qty
          if (qtyMap[product.strMeal]) {
            finalQtyMap[product.idMeal] = qtyMap[product.strMeal]
          }
        })
        setItemData(itemsData)
        setSortedData(itemsData)
        setQuantities(finalQtyMap)
      }
    } catch (error) {
      console.error("Fetch error:", error)
      setApiError(true)
    }
  }

    fetchAllData()
  }, [item])


// ---------------- PRICE ----------------
const getPrice = (id) => {
  const basePrice = 120
  const variance = Number(String(id).slice(-2)) % 80
  return basePrice + variance
}

// ---------------- API CALL ----------------
const updateCart = async (each, delta) => {
  const payload = {
    itemName: each.strMeal,
    itemUrl: each.strMealThumb,
    itemPrice: getPrice(each.idMeal),
    quantity: delta
  }

  const token = Cookies.get("jwt_token")
  try {
    await fetch(`${BACKEND_URL}/api/addtocart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
  } catch (error) {
    console.error("Cart update error:", error)
  } finally {
    // fetchCartCount() // Removed to rely on optimistic update
  }
}

// ---------------- HANDLERS ----------------
const handleIncrease = async (each) => {
  setQuantities(prev => ({
    ...prev,
    [each.idMeal]: (prev[each.idMeal] || 0) + 1
  }))
  addToCartCount(1) // Optimistic update
  await updateCart(each, 1)
}

const handleDecrease = async (each) => {
  const currentQty = quantities[each.idMeal] || 0
  if (currentQty <= 0) return


  const newQty = currentQty - 1
  setQuantities(prev => ({
    ...prev,
    [each.idMeal]: newQty
  }))

  addToCartCount(-1) // Optimistic update
  await updateCart(each, -1)
}

const handleSortChange = (e) => {
  const order = e.target.value

  // Create a new copy to trigger re-render
  const sorted = [...itemData].sort((a, b) => {
    const priceA = getPrice(a.idMeal)
    const priceB = getPrice(b.idMeal)

    if (order === "lowest") {
      return priceA - priceB
    } else if (order === "highest") {
      return priceB - priceA
    }
    return 0
  })

  setSortedData(sorted)
}

const handleAdd = async (each) => {
  setQuantities(prev => ({
    ...prev,
    [each.idMeal]: 1
  }))
  addToCartCount(1) // Optimistic update
  await updateCart(each, 1)
}

const handleBack = () => window.history.back()

// ---------------- UI ----------------

return (
  <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <button
        onClick={handleBack}
        className="mb-8 flex items-center text-gray-600 hover:text-orange-600 transition-colors cursor-pointer"
      >
        <span className="text-2xl mr-2">←</span>
        <span className="text-lg font-medium">Back</span>
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 capitalize mb-4 sm:mb-0">
          {item} Collection
        </h1>

        <div className="relative">
          <select
            onChange={handleSortChange}
            defaultValue=""
            className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-orange-500 hover:border-gray-400 transition-colors cursor-pointer"
          >
            <option value="" disabled>Sort by Price</option>
            <option value="lowest">Lowest Price</option>
            <option value="highest">Highest Price</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {apiError ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl text-red-600">!</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load items</h3>
          <p className="text-gray-500 mb-6">There was a problem connecting to the server.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : sortedData.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {sortedData.map(each => {
            const qty = quantities[each.idMeal] || 0
            const price = getPrice(each.idMeal)

            return (
              <div
                key={each.idMeal}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col group"
              >
                <div className="relative overflow-hidden h-36 w-full bg-gray-100">
                  <img
                    src={each.strMealThumb}
                    alt={each.strMeal}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1" title={each.strMeal}>
                    {each.strMeal}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mb-3">Fast Food</p>

                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{price}
                    </span>

                    {qty > 0 ? (
                      <div className="flex items-center bg-orange-50 rounded-lg p-1">
                        <button
                          onClick={() => handleDecrease(each)}
                          className="w-7 h-7 flex items-center justify-center text-orange-600 hover:bg-orange-200 rounded-md transition-colors font-bold text-base cursor-pointer"
                          disabled={false}
                        >
                          −
                        </button>
                        <span className="w-7 text-center font-bold text-gray-800 text-sm">{qty}</span>
                        <button
                          onClick={() => handleIncrease(each)}
                          className="w-7 h-7 flex items-center justify-center text-orange-600 hover:bg-orange-200 rounded-md transition-colors font-bold text-base cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAdd(each)}
                        className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-md shadow-md hover:from-orange-600 hover:to-orange-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <Loading />
      )}
    </div>
  </div>
)
}

export default EachCategory
