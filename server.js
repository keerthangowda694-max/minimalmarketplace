const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    dbName: "marketplace",
})
.then(() => console.log("✅ MongoDB Atlas Connected"))
.catch((err) => console.log("❌ DB Error:", err));

// Routes
const productRoutes = require('./routes/productRoutes');
app.use('/', productRoutes);

// Default route (for testing Render)
app.get('/test', (req, res) => {
    res.send("Render Deployment Working ✓");
});

// Server (Render requires PORT from env)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
