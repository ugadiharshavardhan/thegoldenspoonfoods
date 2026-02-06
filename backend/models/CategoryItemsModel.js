import mongoose from "mongoose";

const CategoryItemSchema = new mongoose.Schema({
    idMeal : {
        type:Number
    },
    itemCategory : {
        type:String
    },
    strMeal : {
        type:String
    },
    strMealThumb : {
        type:String
    }

},{ timestamps: true })

const CategoryItemModel = mongoose.model("categoryitem",CategoryItemSchema)
export default CategoryItemModel