const express = require("express");
const path = require("path");
const fs = require("fs");
const PORT = process.env.PORT || 3000;


const app = express();
app.use(express.static('public'));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/home.html"));
}); 

app.get("/starters", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/starters.html"));
});

app.get("/mains", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/mains.html"));
});

app.get("/drinks", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/drinks.html"));
});

app.get("/deserts", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/deserts.html"));
});

app.get("/alcohol", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/alcohol.html"));
});

app.get("/mocktails", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/mocktails.html"));
});

app.get("/softDrinks", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/softDrinks.html"));
});


// custom image streamer
app.get("/images/:file", (req, res) => {
    const filePath = path.join(__dirname, "public/images", req.params.file);

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


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
