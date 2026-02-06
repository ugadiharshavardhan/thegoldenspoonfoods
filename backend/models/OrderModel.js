import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [
        {
            itemName: String,
            itemPrice: Number,
            itemUrl: String,
            quantity: Number
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentId: {
        type: String
    },
    status: {
        type: String,
        default: "Placed"
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
});

const OrderModel = mongoose.model("Order", orderSchema);
export default OrderModel;
