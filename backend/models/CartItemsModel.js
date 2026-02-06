import mongoose from "mongoose"

const CartItemsSchema = new mongoose.Schema({
    itemUrl: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    itemName: {
        type: String,
        required: true
    },
    itemPrice: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
}, { timestamps: true })

const CartItemModel = mongoose.model("cartItem", CartItemsSchema)

export default CartItemModel