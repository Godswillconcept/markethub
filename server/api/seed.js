const { Sequelize, sequelize } = require("../src/config/database");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

module.exports = async (req, res) => {
  // Security check
  const authHeader = req.headers.authorization;
  const expectedSecret = process.env.MIGRATION_SECRET;

  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const action = req.query.action || "all";
  const seederName = req.query.seeder;

  try {
    const seedersPath = path.join(__dirname, "../src/seeders");
    const seederFiles = fs
      .readdirSync(seedersPath)
      .filter((file) => file.endsWith(".js"))
      .sort();

    const queryInterface = sequelize.getQueryInterface();
    const results = [];

    if (action === "all") {
      for (const file of seederFiles) {
        const seeder = require(path.join(seedersPath, file));
        await seeder.up(queryInterface, Sequelize);
        results.push(file);
      }
      res.json({
        message: "All seeders executed successfully",
        seeders: results,
      });
    } else if (action === "one" && seederName) {
      const seederFile = seederFiles.find((f) => f.includes(seederName));
      if (!seederFile) {
        return res.status(404).json({ error: "Seeder not found" });
      }
      const seeder = require(path.join(seedersPath, seederFile));
      await seeder.up(queryInterface, Sequelize);
      res.json({
        message: "Seeder executed successfully",
        seeder: seederFile,
      });
    } else if (action === "undo") {
      const seederFile = seederFiles[seederFiles.length - 1];
      const seeder = require(path.join(seedersPath, seederFile));
      await seeder.down(queryInterface, Sequelize);
      res.json({
        message: "Seeder undone successfully",
        seeder: seederFile,
      });
    } else {
      res.status(400).json({ error: "Invalid action" });
    }
  } catch (error) {
    console.error("Seeding error:", error);
    res.status(500).json({
      error: "Seeding failed",
      details: error.message,
    });
  } finally {
    await sequelize.close();
  }
};
