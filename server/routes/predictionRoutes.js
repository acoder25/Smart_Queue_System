const express = require("express");
const { exec } = require("child_process");
const path = require("path");

const router = express.Router();


router.post("/queue", (req, res) => {
  const { department, date } = req.body;

  if (!department || !date) {
    return res.status(400).json({ message: "department and date are required" });
  }

  // Path to Python script
  const scriptPath = path.join(__dirname, "../ml/predict.py");

  // Windows = python | Linux/Mac = python3
  const cmd = `python "${scriptPath}" "${department}" "${date}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error("Python error:", stderr);
      return res.status(500).json({ message: "ML script failed" });
    }

    try {
      const data = JSON.parse(stdout);
      if (data.error) {
        return res.status(400).json({ message: data.error });
      }
      res.json(data);
    } catch (e) {
      console.error("JSON parse error:", e, stdout);
      res.status(500).json({ message: "Failed to parse ML output" });
    }
  });
});

module.exports = router;
