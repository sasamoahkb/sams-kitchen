const express = require("express");
const path = require("path");

const app = express();

// set up static files to be served
app.use(express.static(path.join(__dirname, "../static")));

// get function for streaming images
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
      fstat.createReadStream(filePath).pipe(res);
});

// Set the views directory
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views/home.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`helloworld: listening on port ${PORT}`);
  console.log(`Server is running on http://localhost:${PORT}`);
});