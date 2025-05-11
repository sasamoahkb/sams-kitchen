const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();


// set up static files to be served
app.use(express.static(path.join(__dirname, "../static")));

// custom image streamer
app.get("/images/:file", (req, res) => {
    const filePath = path.join(__dirname, "../static/images", req.params.file);

    //check if file exists 
    if (!fstat.existsSync(filePath)) {
        return res.status(404).send("File not found");
    }

    // set dynamic content-type
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        ".gif": "image/gif",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".svg": "image/svg+xml",
        ".webp": "image/webp",
      };

      res.setHeader("Content-Type", mimeTypes[ext] || "application/octet-stream");

      // stream file
      fs.createReadStream(filePath).pipe(res);
});

// Set the views directory
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views/home.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
});