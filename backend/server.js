import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import playerRoutes from "./routes/playerRoutes.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/pacmanDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ Mongo Error:", err));

// Routes
app.use("/api/players", playerRoutes);

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
