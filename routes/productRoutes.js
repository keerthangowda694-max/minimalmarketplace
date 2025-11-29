const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const User = require("../models/user");
const path = require("path");
const multer = require("multer");

// ------------------------------
// MULTER SETUP FOR IMAGE UPLOAD
// ------------------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, "../public/uploads")),
    filename: (req, file, cb) =>
        cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// ------------------------------
// Serve HTML pages
// ------------------------------
router.get("/", (req, res) =>
    res.sendFile(path.join(__dirname, "../public/html/index.html"))
);

router.get("/add", (req, res) =>
    res.sendFile(path.join(__dirname, "../public/html/addProduct.html"))
);

router.get("/leaderboard", (req, res) =>
    res.sendFile(path.join(__dirname, "../public/html/leaderboard.html"))
);

router.get("/product/:id", (req, res) =>
    res.sendFile(path.join(__dirname, "../public/html/ProductDetail.html"))
);

// ------------------------------
// Add Product (with image upload)
// ------------------------------
router.post("/add", upload.single("image"), async (req, res) => {
    try {
        const { name, description, price, username } = req.body;

        if (!name || !price || !username) {
            return res.status(400).send("Missing required fields");
        }

        if (!req.file) {
            return res.status(400).send("Image file missing");
        }

        const imageUrl = "/uploads/" + req.file.filename;

        const product = new Product({
            name,
            description,
            price,
            imageUrl,
            owner: username
        });

        await product.save();

        res.redirect("/");

    } catch (err) {
        console.error("ADD PRODUCT ERROR:", err);
        res.status(500).send("Server error");
    }
});

// ------------------------------
// Get all products
// ------------------------------
router.get("/api/products", async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// ------------------------------
// Get product by ID
// ------------------------------
router.get("/api/products/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
