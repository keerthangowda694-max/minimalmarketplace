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
    destination: (req, file, cb) => cb(null, "public/uploads"),
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
    res.sendFile(path.join(__dirname, "../public/html/productDetail.html"))
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
            owner: username,
        });

        await product.save();

        let user = await User.findOne({ username });

        if (!user) {
            user = new User({ username, points: 10, badges: [] });
        } else {
            user.points += 10;

            if (user.points >= 50 && !user.badges.includes("Bronze Seller"))
                user.badges.push("Bronze Seller");

            if (user.points >= 100 && !user.badges.includes("Silver Seller"))
                user.badges.push("Silver Seller");
        }

        await user.save();

        res.redirect("/");
    } catch (err) {
        console.error("ADD PRODUCT ERROR:", err);
        res.status(500).send("Server error");
    }
});

// ------------------------------
// BUY PRODUCT
// ------------------------------
router.post("/buy/:id", async (req, res) => {
    try {
        const { username } = req.body;

        const product = await Product.findById(req.params.id);
        if (!product)
            return res.status(404).json({ error: "Product not found" });

        if (!username)
            return res
                .status(400)
                .json({ error: "Username required" });

        if (product.owner === username) {
            return res
                .status(400)
                .json({ error: "You cannot buy your own product" });
        }

        const buyer = await User.findOne({ username });

        if (!buyer) {
            return res
                .status(400)
                .json({ error: "User does not exist" });
        }

        if (buyer.points < product.price) {
            return res
                .status(400)
                .json({ error: "Not enough points to buy" });
        }

        buyer.points -= product.price;
        await buyer.save();

        product.buyer = username;
        product.isSold = true;
        await product.save();

        return res.json({
            success: true,
            message: "Product purchased successfully",
        });
    } catch (err) {
        console.error("BUY PRODUCT ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ------------------------------
// Get all products
// ------------------------------
router.get("/api/products", async (req, res) => {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
});

// ------------------------------
// Get product by ID
// ------------------------------
router.get("/api/products/:id", async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.json(product);
});

// ------------------------------
// Get users (leaderboard)
// ------------------------------
router.get("/api/users", async (req, res) => {
    const users = await User.find().sort({ points: -1 });
    res.json(users);
});

// ------------------------------
// DELETE Product
// ------------------------------
router.delete("/api/products/:id", async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        console.error("DELETE ERROR:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
