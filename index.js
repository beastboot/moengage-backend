const express = require("express");
const User = require("./Models/user");
const Image = require("./Models/inages");
const List = require("./Models/list");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const SECRECT_kEY = "dhsjfhsjfhjfdj";

const app = express();
app.use(express.json());
app.use(cors());

mongoose
  .connect("mongodb+srv://roshankumar86788:Rk94511@cluster0.titsepl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });


app.post("/api/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: "User created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await User.findOne({ username });
    if (user && user.password === password) {
      const token = jwt.sign(
        {
          id: user._id,
          username: user.username,
          password: user.password,
        },
        SECRECT_kEY
      );
      res.status(200).json({ token });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/api/dogs", async (req, res) => {
  const { filter } = req.query;
  try {
    let images = await Image.find({ code: { $regex: `^${filter}` } });
    res.json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


app.post("/api/lists", async (req, res) => {
  const { name, filter, images, userId } = req.body; 
  try {
    let imageIds = [];
    for (const img of images) {
      let image = await Image.findOne({ code: img.code });
      if (!image) {
        image = new Image({ code: img.code, url: img.url });
        await image.save();
      }
      imageIds.push(image._id);
    }
    let list = new List({ name, filter, images: imageIds, user: userId }); 
    await list.save();
    res.status(201).json(list);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get All Lists
app.get("/api/lists", async (req, res) => {
  const { userId } = req.query;

  try {
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const lists = await List.find({ user: userId }).populate("images");
    res.json(lists);
  } catch (error) {
    console.error("Error fetching lists:", error);
    res.status(500).json({ message: "Error fetching lists", error });
  }
});


app.put("/api/lists/:id", async (req, res) => {
  const { id } = req.params;
  const { name, filter, images } = req.body;

  try {
    const imageIds = [];
    for (const img of images) {
      let image = await Image.findOne({ code: img.code });
      if (!image) {
        image = new Image({ code: img.code, url: img.url });
        await image.save();
      }
      imageIds.push(image._id);
    }

    const updatedList = await List.findByIdAndUpdate(
      id,
      {
        name,
        filter,
        images: imageIds,
      },
      { new: true }
    ).populate("images");

    if (!updatedList) {
      return res.status(404).json({ message: "List not found" });
    }

    res.json(updatedList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


app.delete("/api/lists/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await List.findByIdAndDelete(id);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
