import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { BACKEND_URL } from '../config';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartCount, setCartCount] = useState(0);

    const fetchCartCount = async () => {
        try {
            const token = Cookies.get("jwt_token");
            if (!token) {
                setCartCount(0);
                return;
            }

            const response = await fetch(`${BACKEND_URL}/api/cartitems`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const items = data.fooditems || [];
                const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
                setCartCount(totalCount);
            }
        } catch (error) {
            console.error("Failed to fetch cart count:", error);
        }
    };

    useEffect(() => {
        fetchCartCount();
    }, []);

    const addToCartCount = (quantity) => {
        setCartCount(prev => prev + quantity);
    };

    return (
        <CartContext.Provider value={{ cartCount, fetchCartCount, setCartCount, addToCartCount }}>
            {children}
        </CartContext.Provider>
    );
};
