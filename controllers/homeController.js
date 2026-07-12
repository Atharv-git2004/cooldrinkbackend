import Home from "../models/homeModel.js";
import fs from "fs";
import path from "path";

// Create or Update Home Data
export const updateHomeData = async (req, res) => {
  try {
    const { id, mainTitle, subTitle, description } = req.body;

    let imagePath;
    if (req.file) {
      imagePath = req.file.filename;
    }

    const updateData = { mainTitle, subTitle, description };

    // Only update image if a new file is uploaded
    if (imagePath) {
      updateData.imageUrl = imagePath;
    }

    let homeData;

    // Smart check: If ID is provided, update existing data. Otherwise, create new data.
    if (id) {
      homeData = await Home.findByIdAndUpdate(id, updateData, { new: true });
      return res.status(200).json({ message: "Home Content updated successfully", homeData });
    } else {
      homeData = new Home(updateData);
      await homeData.save();
      return res.status(201).json({ message: "New Home Content added successfully", homeData });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Fetch All Home Data
export const getHomeData = async (req, res) => {
  try {
    const homeData = await Home.find();
    res.status(200).json(homeData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Home Data
export const deleteHomeData = async (req, res) => {
  try {
    const { id } = req.params;
    const homeData = await Home.findById(id);

    if (!homeData) {
      return res.status(404).json({ message: "Content not found" });
    }

    // Delete the image file from the server's local storage
    if (homeData.imageUrl) {
      const imagePath = path.join("uploads", homeData.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete the record from the database
    await Home.findByIdAndDelete(id);
    res.status(200).json({ message: "Content deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
