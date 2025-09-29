// server/app.js
import express from "express";
import { exec } from "child_process";
import fs from "fs";
import cors from "cors";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWin = os.platform() === "win32";

// Create temp directory
const tempDir = path.join(__dirname, "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// Serve frontend
app.use(express.static(path.join(__dirname, "../client")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// Supported languages
const supportedLanguages = {
  python: {
    file: "temp.py",
    command: (filePath) => `${isWin ? "python" : "python3"} "${filePath}"`,
  },
  javascript: {
    file: "temp.js",
    command: (filePath) => `node "${filePath}"`,
  },
  typescript: {
    file: "temp.ts",
    command: (filePath) => `npx ts-node "${filePath}"`,
  },
};

// Run code route
app.post("/run", (req, res) => {
  const { language, code, input = "" } = req.body;

  if (!language || !code) {
    return res.status(400).json({ error: "Language and code are required." });
  }

  const langConfig = supportedLanguages[language];
  if (!langConfig) {
    return res.status(400).json({ error: "Language not supported." });
  }

  const filePath = path.join(tempDir, langConfig.file);

  try {
    // Write user code to temp file
    fs.writeFileSync(filePath, code);

    // Execute code with timeout
    const child = exec(langConfig.command(filePath), { timeout: 10000 }, (error, stdout, stderr) => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Cleanup after run

      if (error) {
        if (error.killed) {
          return res.json({ error: "Execution timed out (10s limit)" });
        }
        return res.json({ error: stderr || error.message });
      }

      res.json({ output: stdout.trim(), warnings: stderr.trim() });
    });

    // Send user input to code
    if (input) {
      child.stdin.write(input + "\n");
      child.stdin.end();
    }

  } catch (err) {
    console.error("Execution Error:", err);
    res.status(500).json({ error: `Server error: ${err.message}` });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Compiler running on port ${PORT}`));
