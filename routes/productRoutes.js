import express from "express";
import Product from "../models/Product.js";
import path from "path";

const router = express.Router();

/* -------------------- HTML PAGES -------------------- */

// Home
router.get("/", (req, res) => {
    res.sendFile(path.resolve("public/html/index.html"));
});

// Add Product Page
router.get("/add", (req, res) => {
    res.sendFile(path.resolve("public/html/addProduct.html"));
});

// Leaderboard Page
router.get("/leaderboard", (req, res) => {
    res.sendFile(path.resolve("public/html/leaderboard.html"));
});

// Product Detail Page
router.get("/product/:id", (req, res) => {
    res.sendFile(path.resolve("public/html/ProductDetail.html")); 
});

/* -------------------- API ROUTES -------------------- */

// Add new product
router.post("/api/addProduct", async (req, res) => {
    try {
        const { title, price, image, description } = req.body;

        if (!title || !price || !image || !description) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const newProduct = new Product({ title, price, image, description });
        await newProduct.save();

        res.json({ message: "Product added successfully", product: newProduct });
    } catch (error) {
        console.error("Add product error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Get all products
router.get("/api/products", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Get product by ID
router.get("/api/product/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product)
            return res.status(404).json({ error: "Product not found" });

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
