const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    imageUrl: String,
    sold: {
        type: Boolean,
        default: false
    },
    buyer: {
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);
