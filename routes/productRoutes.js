const express = require("express");
const path = require("path");
const multer = require("multer");
const Product = require("../models/Product");

const router = express.Router();

// Image upload system
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../public/uploads"));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });

// Serve Add Product page
router.get("/add", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/addProduct.html"));
});

// Create product
router.post("/api/products", upload.single("image"), async (req, res) => {
    try {
        const product = new Product({
            title: req.body.title,
            price: req.body.price,
            description: req.body.description,
            image: "/uploads/" + req.file.filename
        });

        await product.save();
        res.json({ success: true });
    } catch (err) {
        res.json({ error: err.message });
    }
});

// Get all products
router.get("/api/products", async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// Show product detail page
router.get("/product/:id", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/ProductDetail.html"));
});

// Home page
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/html/index.html"));
});

module.exports = router;
