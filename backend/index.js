import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import mongoose from "mongoose"
import bcrypt from "bcrypt"
import { z } from "zod"
import jwt from "jsonwebtoken"
import { userModels } from "./models/UserModel.js"
import CartItemModel from "./models/CartItemsModel.js"
import CategoryItemModel from "./models/CategoryItemsModel.js"
import OrderModel from "./models/OrderModel.js"
import authMiddleware from "./middleware/authMiddleware.js"
import Razorpay from "razorpay"
import crypto from "crypto"
import { sendWelcomeEmail, sendOtpEmail } from "./utils/sendEmail.js"


dotenv.config()

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})


const app = express()
app.use(express.json())
app.use(cors());


//signin
app.post("/api/signin", async (req, res) => {
    try {
        const { email, password } = req.body

        const UserRules = z.object({
            email: z.string().email(),
            password: z.string().min(6).max(15)
        })

        const parseData = UserRules.safeParse({ email, password });

        if (!parseData.success) {
            return res.status(400).json({
                message: "Please give valid inputs"
            });

        }

        const existingUser = await userModels.findOne({ email })
        if (!existingUser) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)
        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const Token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" })

        return res.status(200).json({
            message: "Login Success",
            token: Token,
            userdetails: {
                id: existingUser._id,
                email: existingUser.email,
                name: existingUser.name
            }
        })

    }
    catch (error) {
        console.error(error.message)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
})


//signup
app.post("/api/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body

        const UserRules = z.object({
            name: z.string().min(1),
            email: z.string().email(),
            password: z.string().min(6).max(15)
        })

        const parseData = UserRules.safeParse({ name, email, password });

        if (!parseData.success) {
            return res.status(400).json({
                message: "Please give valid inputs"
            });
        }

        const existingUser = await userModels.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashPassword = await bcrypt.hash(password, 10)
        const newUser = await userModels.create({
            name,
            email,
            password: hashPassword
        })

        const Token = jwt.sign({ userId: newUser._id.toString() }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" })

        // Send welcome email (non-blocking) - failure does not stop registration
        const emailSent = await sendWelcomeEmail(email, name);
        if (!emailSent) {
            console.log("Welcome email failed to send, but user registered successfully.");
        }

        return res.status(201).json({
            message: "User created successfully",
            token: Token,
            userdetails: {
                id: newUser._id,
                email: newUser.email,
                name: newUser.name
            }
        })


    }
    catch (error) {
        console.error(error.message)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
})



// Forgot Password - Generate OTP
app.post("/api/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await userModels.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        await sendOtpEmail(email, otp, user.name);

        res.status(200).json({ message: "OTP sent to your email" });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Verify OTP
app.post("/api/verify-otp", async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await userModels.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.otp || !user.otpExpires) {
            return res.status(400).json({ message: "Invalid Request" });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (user.otpExpires < new Date()) {
            return res.status(400).json({ message: "OTP Expired" });
        }

        res.status(200).json({ message: "OTP Verified Successfully" });

    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Reset Password
app.post("/api/reset-password", async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await userModels.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (newPassword.length < 6 || newPassword.length > 15) {
            return res.status(400).json({ message: "Password must be 6-15 chars" });
        }

        // Verify OTP again for security before resetting
        if (user.otp !== otp || user.otpExpires < new Date()) {
            return res.status(400).json({ message: "Invalid or Expired OTP" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.status(200).json({ message: "Password Reset Successfully" });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/api/addtocart", authMiddleware, async (req, res) => {
    try {
        const { itemPrice, itemName, itemUrl, quantity } = req.body;
        const userId = req.user.userId;

        const existingitem = await CartItemModel.findOne({ itemName, userId })

        if (existingitem) {
            existingitem.quantity += quantity

            if (existingitem.quantity <= 0) {
                await CartItemModel.findByIdAndDelete(existingitem._id)
                return res.status(200).json({
                    message: "Item removed from cart (quantity 0)",
                    item: existingitem,
                    removed: true
                })
            }

            await existingitem.save()

            return res.status(201).json({
                message: "Quantity Updated",
                item: existingitem
            })
        }


        const newItem = new CartItemModel({
            itemName: itemName,
            itemPrice: itemPrice,
            itemUrl: itemUrl,
            quantity: quantity,
            userId: userId
        })

        const addedItem = await newItem.save()

        res.status(201).json({
            message: "Added to cart Succesfully",
            data: addedItem
        })
    }
    catch (error) {
        console.error(error.message)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
})

app.get("/user/details", authMiddleware, async (req, res) => {
    try {
        const userDetails = await userModels.findById(req.user.userId).select("-password")

        return res.status(200).json({
            message: "User details fetched successfully",
            data: userDetails
        })
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
})


app.get("/api/allproducts", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10

        const skip = (page - 1) * limit

        const products = await CategoryItemModel.find()
            .skip(skip)
            .limit(limit)

        const totalProducts = await CategoryItemModel.countDocuments()

        res.status(200).json({
            success: true,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            totalItems: totalProducts,
            data: products
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})



// add new category
app.post("/api/category", async (req, res) => {
    try {
        const { idMeal, itemCategory, strMeal, strMealThumb } = req.body;
        if (!idMeal || !itemCategory || !strMeal || !strMealThumb) {
            return res.status(400).json({ message: "All fields are required" })
        }

        const newItem = new CategoryItemModel({
            idMeal,
            itemCategory, strMeal, strMealThumb
        })

        const savedItem = await newItem.save()
        res.status(201).json({
            message: "Items Stored Succesfully",
            data: savedItem
        })

    }
    catch (error) {
        console.error(error.message)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
})

//get category items
app.get("/items/:item", async (req, res) => {
    try {
        const { item } = req.params

        const eachCategoryitems = await CategoryItemModel.find({
            itemCategory: { $regex: new RegExp(`^${item}$`, "i") }
        })

        return res.status(200).json(eachCategoryitems)
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
})


app.get("/api/cartitems", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const cartItems = await CartItemModel.find({ userId })
        res.status(200).json({
            message: "All items in cart",
            fooditems: cartItems
        })
    }
    catch (error) {
        console.error(error.message)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
})


app.delete("/api/delete/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params

        const deletedItem = await CartItemModel.findByIdAndDelete(id)

        if (!deletedItem) {
            return res.status(404).json({
                message: "Item not found"
            })
        }

        return res.status(200).json({
            message: "Item deleted successfully",
            item: deletedItem
        })
    } catch (error) {
        console.error(error.message)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
})


// Clear cart after payment success
app.delete("/api/clear-cart", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        await CartItemModel.deleteMany({ userId })

        return res.status(200).json({
            message: "Cart cleared successfully"
        })
    } catch (error) {
        console.error("Error clearing cart:", error.message)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
})


// Place Order
app.post("/api/orders", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { items, totalAmount, paymentId } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No items in order" });
        }

        const newOrder = new OrderModel({
            userId,
            items,
            totalAmount,
            paymentId
        });

        await newOrder.save();

        return res.status(201).json({
            message: "Order placed successfully",
            orderId: newOrder._id
        });
    } catch (error) {
        console.error("Error placing order:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get User Orders
app.get("/api/orders", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const orders = await OrderModel.find({ userId }).sort({ orderDate: -1 });

        return res.status(200).json({
            message: "Orders fetched successfully",
            data: orders
        });
    } catch (error) {
        console.error("Error fetching orders:", error.message);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});



//payment
app.post("/create-order", async (req, res) => {
    const { amount } = req.body  // in rupees

    try {
        const order = await razorpay.orders.create({
            amount: amount * 100, // convert to paise
            currency: "INR",
            receipt: "receipt_" + Date.now(),
        })

        res.json(order)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})


app.post("/verify-payment", (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    } = req.body

    const body = razorpay_order_id + "|" + razorpay_payment_id

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex")

    if (expectedSignature === razorpay_signature) {
        res.json({ success: true })
    } else {
        res.status(400).json({ success: false })
    }
})







const connectDb = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing in .env");
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected");

        app.listen(5987, () => {
            console.log("Server is running on port 5987");
        });

    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
};


connectDb()
