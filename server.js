const express = require("express");
const mongoose = require("mongoose");
const Inventory = require("./models/Inventory");

const app = express();
app.use(express.json());

// CONNECT DB
mongoose.connect("mongodb://127.0.0.1:27017/inventory_db")
  .then(() => console.log("Connected DB"))
  .catch(err => console.log(err));

/* ================== API ================== */

// 1. Tạo inventory (khi có product)
app.post("/inventory", async (req, res) => {
  try {
    const { product } = req.body;

    const exist = await Inventory.findOne({ product });
    if (exist) {
      return res.status(400).json({ message: "Inventory đã tồn tại" });
    }

    const inventory = new Inventory({ product });
    await inventory.save();

    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 2. Get all inventory (join product)
app.get("/inventory", async (req, res) => {
  try {
    const data = await Inventory.find().populate("product");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 3. Get inventory by ID
app.get("/inventory/:id", async (req, res) => {
  try {
    const data = await Inventory.findById(req.params.id).populate("product");

    if (!data) {
      return res.status(404).json({ message: "Không tìm thấy inventory" });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 4. Add stock
app.post("/inventory/add-stock", async (req, res) => {
  try {
    const { product, quantity } = req.body;

    const inv = await Inventory.findOne({ product });
    if (!inv) {
      return res.status(404).json({ message: "Không tìm thấy inventory" });
    }

    inv.stock += quantity;

    await inv.save();
    res.json(inv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 5. Remove stock
app.post("/inventory/remove-stock", async (req, res) => {
  try {
    const { product, quantity } = req.body;

    const inv = await Inventory.findOne({ product });
    if (!inv) {
      return res.status(404).json({ message: "Không tìm thấy inventory" });
    }

    if (inv.stock < quantity) {
      return res.status(400).json({ message: "Không đủ hàng" });
    }

    inv.stock -= quantity;

    await inv.save();
    res.json(inv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 6. Reservation (giữ hàng)
app.post("/inventory/reservation", async (req, res) => {
  try {
    const { product, quantity } = req.body;

    const inv = await Inventory.findOne({ product });
    if (!inv) {
      return res.status(404).json({ message: "Không tìm thấy inventory" });
    }

    if (inv.stock < quantity) {
      return res.status(400).json({ message: "Không đủ stock để giữ" });
    }

    inv.stock -= quantity;
    inv.reserved += quantity;

    await inv.save();
    res.json(inv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 7. Sold (bán hàng)
app.post("/inventory/sold", async (req, res) => {
  try {
    const { product, quantity } = req.body;

    const inv = await Inventory.findOne({ product });
    if (!inv) {
      return res.status(404).json({ message: "Không tìm thấy inventory" });
    }

    if (inv.reserved < quantity) {
      return res.status(400).json({ message: "Không đủ reserved" });
    }

    inv.reserved -= quantity;
    inv.soldCount += quantity;

    await inv.save();
    res.json(inv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.listen(3000, () => console.log("Server running on port 3000"));